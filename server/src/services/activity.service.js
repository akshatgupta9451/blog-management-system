import { Activity } from '../models/activity.model.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';

// Activity is a side record: a failure here is logged but never fails the user's request
export const logActivity = async (userId, type, blog) => {
  try {
    await Activity.create({
      user: userId,
      type,
      ...(blog && { blog: { id: blog._id, title: blog.title, slug: blog.slug } }),
    });
  } catch (error) {
    console.error(`Failed to log activity ${type} for user ${userId}:`, error);
  }
};

export const listActivity = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };

  const [activities, totalDocs] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Activity.countDocuments(filter),
  ]);

  return { activities, pagination: buildPaginationMeta({ page, limit, totalDocs }) };
};
