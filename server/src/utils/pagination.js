import { PAGINATION } from '../constants/index.js';

export const getPagination = ({
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT,
}) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});

export const buildPaginationMeta = ({ page, limit, totalDocs }) => {
  const totalPages = Math.ceil(totalDocs / limit);
  return {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
