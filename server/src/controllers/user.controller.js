import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookies } from '../utils/authCookies.js';
import { deleteAccount, updateProfile } from '../services/user.service.js';
import { listActivity } from '../services/activity.service.js';

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body, req.file);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

export const deleteMe = asyncHandler(async (req, res) => {
  const result = await deleteAccount(req.user._id, req.body.password);
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, result, 'Your account has been deleted'));
});

export const getMyActivity = asyncHandler(async (req, res) => {
  const result = await listActivity(req.user._id, req.validatedQuery);
  res.status(200).json(new ApiResponse(200, result, 'Activity fetched'));
});
