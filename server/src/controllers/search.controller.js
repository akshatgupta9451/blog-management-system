import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { searchBlogs } from '../services/search.service.js';

export const search = asyncHandler(async (req, res) => {
  // The validator exposes `category` as a list; the service calls it `categories`
  const { category: categories, ...rest } = req.validatedQuery;
  const result = await searchBlogs({ ...rest, categories });
  res.status(200).json(new ApiResponse(200, result, 'Search results'));
});
