import mongoose from 'mongoose';
import { Blog } from '../models/blog.model.js';
import { User } from '../models/user.model.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';
import { escapeRegex, prefixRange, tokenizeName } from '../utils/search.js';
import { BLOG_STATUS, SEARCH } from '../constants/index.js';

// Every sort ends with _id so pages are stable; each non-relevance sort matches a
// {status, ...sortFields, _id} index on blogs, so MongoDB walks the index instead of sorting
const SORT_STAGES = {
  relevance: { score: { $meta: 'textScore' }, _id: -1 },
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  popular: { likesCount: -1, views: -1, _id: -1 },
  views: { views: -1, _id: -1 },
  title: { title: 1, _id: 1 },
};

const CARD_PROJECTION = { content: 0, __v: 0 };
const DAY_MS = 24 * 60 * 60 * 1000;

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

/**
 * `author` is either a user id (from clicking an author facet) or free text matched against
 * the start of any word in authors' names: "love" finds "Ada Lovelace". Each term is a range
 * scan on the {nameTokens: 1} index. Returns null when no author filter applies.
 */
export const resolveAuthors = async (author) => {
  if (!author) return null;
  if (isObjectId(author)) {
    const user = await User.findById(author, { name: 1 }).lean();
    return { ids: [new mongoose.Types.ObjectId(String(author))], label: user?.name ?? 'Unknown' };
  }

  const terms = tokenizeName(author);
  if (!terms.length) return { ids: [], label: author };

  // $elemMatch keeps both bounds on the SAME word. A bare range on an array matches when any
  // word is >= the prefix and any (other) word is < its end, so "love" would also match
  // ["alan", "turing"] ("turing" >= "love", "alan" < "lovf").
  const users = await User.find(
    { $and: terms.map((term) => ({ nameTokens: { $elemMatch: prefixRange(term) } })) },
    { _id: 1 }
  )
    .limit(SEARCH.AUTHOR_MATCH_LIMIT)
    .lean();
  return { ids: users.map((user) => user._id), label: author };
};

const dateRange = ({ date, from, to }) => {
  if (date) return { $gte: new Date(Date.now() - SEARCH.DATE_PRESETS[date] * DAY_MS) };
  if (!from && !to) return null;
  return {
    ...(from && { $gte: from }),
    // A bare "to" date means "through the end of that day"
    ...(to && { $lt: new Date(to.getTime() + DAY_MS) }),
  };
};

// Count per value, most common first; `name` is the grouped value
const countBy = (field, limit) => [
  { $group: { _id: field, count: { $sum: 1 } } },
  { $sort: { count: -1, _id: 1 } },
  { $limit: limit },
];

export const searchBlogs = async (query) => {
  const { q, title, categories, tags, tagsMode = 'any', sort, facets = true } = query;
  const authors = await resolveAuthors(query.author);
  const createdAt = dateRange(query);

  // Filters every part of the search shares. $text has to sit in the first $match stage.
  const shared = {
    ...(q && { $text: { $search: q } }),
    status: BLOG_STATUS.PUBLISHED,
    ...(createdAt && { createdAt }),
    // Contains-match on the title. A regex can't use an index, so it's only evaluated on
    // documents the indexed conditions above have already narrowed down.
    ...(title && { title: { $regex: escapeRegex(title), $options: 'i' } }),
  };

  // The multi-select filters, kept apart so each facet can leave its own one out
  const filterBy = {
    category: categories?.length ? { category: { $in: categories } } : {},
    tags: tags?.length ? { tags: tagsMode === 'all' ? { $all: tags } : { $in: tags } } : {},
    author: authors ? { author: { $in: authors.ids } } : {},
  };
  const match = { ...shared, ...filterBy.category, ...filterBy.tags, ...filterBy.author };

  const sortKey = sort === 'relevance' && !q ? 'newest' : (sort ?? (q ? 'relevance' : 'newest'));
  const { page, limit, skip } = getPagination(query);

  const resultsPipeline = [
    // $match + $sort at the start of a pipeline are executed by the query planner, so they
    // use indexes; only the `limit` documents of this page reach the stages after $limit
    { $match: match },
    { $sort: SORT_STAGES[sortKey] },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1 } }],
      },
    },
    { $set: { author: { $first: '$author' } } },
    { $project: { ...CARD_PROJECTION, ...(q && { relevance: { $meta: 'textScore' } }) } },
  ];

  // Counting separately lets MongoDB count index entries (COUNT_SCAN) when it can,
  // instead of pushing every matched document through the results pipeline
  const countPipeline = [{ $match: match }, { $count: 'total' }];

  // Facets ("Category: Design (12)") for building filter UIs. Each facet applies every
  // filter except its own, so ticking a category still shows how many results the other
  // categories would give. One pass over the shared matches, trimmed to the three fields.
  const facetPipeline = [
    { $match: shared },
    { $project: { category: 1, tags: 1, author: 1 } },
    {
      $facet: {
        categories: [
          { $match: { ...filterBy.tags, ...filterBy.author } },
          ...countBy('$category', SEARCH.FACET_LIMIT),
          { $project: { _id: 0, name: '$_id', count: 1 } },
        ],
        tags: [
          { $match: { ...filterBy.category, ...filterBy.author } },
          { $unwind: '$tags' },
          ...countBy('$tags', SEARCH.FACET_LIMIT),
          { $project: { _id: 0, name: '$_id', count: 1 } },
        ],
        authors: [
          { $match: { ...filterBy.category, ...filterBy.tags } },
          ...countBy('$author', SEARCH.AUTHOR_FACET_LIMIT),
          {
            $lookup: {
              from: User.collection.name,
              localField: '_id',
              foreignField: '_id',
              as: 'user',
              pipeline: [{ $project: { name: 1, avatar: 1 } }],
            },
          },
          { $unwind: '$user' },
          { $project: { _id: 1, count: 1, name: '$user.name', avatar: '$user.avatar' } },
        ],
      },
    },
  ];

  const [blogs, [count], [facetResult]] = await Promise.all([
    Blog.aggregate(resultsPipeline),
    Blog.aggregate(countPipeline),
    facets ? Blog.aggregate(facetPipeline) : [null],
  ]);

  return {
    blogs,
    pagination: buildPaginationMeta({ page, limit, totalDocs: count?.total ?? 0 }),
    facets: facetResult,
    applied: { sort: sortKey, ...(authors && { author: authors.label }) },
  };
};
