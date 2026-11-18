import { User } from '../models/user.model.js';
import { Blog } from '../models/blog.model.js';
import { Activity } from '../models/activity.model.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteImage, uploadImage } from './cloudinary.service.js';
import { logActivity } from './activity.service.js';
import { removeUserComments } from './commentModeration.service.js';
import { deleteBlogEngagement } from './blog.service.js';
import { BlogLike } from '../models/blogLike.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { BlogView } from '../models/blogView.model.js';
import { ReadingHistory } from '../models/readingHistory.model.js';
import { ACTIVITY_TYPES, USER_ROLES } from '../constants/index.js';
import { IMAGE_PRESETS } from '../config/cloudinary.js';

export const updateProfile = async (userId, data, file) => {
  if (!Object.keys(data).length && !file) throw new ApiError(400, 'Nothing to update');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  Object.assign(user, data);

  const oldPublicId = user.avatar?.publicId;
  if (file) user.avatar = await uploadImage(file.buffer, IMAGE_PRESETS.AVATAR);

  try {
    await user.save();
  } catch (error) {
    if (file) await deleteImage(user.avatar.publicId);
    throw error;
  }

  if (file) await deleteImage(oldPublicId);
  await logActivity(user._id, ACTIVITY_TYPES.PROFILE_UPDATED);
  return user;
};

// The user's likes on other people's blogs (with their counters), bookmarks, history and views
const removeUserEngagement = async (userId) => {
  const likedBlogIds = await BlogLike.distinct('blog', { user: userId });
  if (likedBlogIds.length) {
    await Blog.updateMany(
      { _id: { $in: likedBlogIds } },
      { $inc: { likesCount: -1 } },
      { timestamps: false }
    );
  }
  await Promise.all([
    BlogLike.deleteMany({ user: userId }),
    Bookmark.deleteMany({ user: userId }),
    ReadingHistory.deleteMany({ user: userId }),
    BlogView.deleteMany({ viewer: `u:${userId}` }),
  ]);
};

// Permanently removes the account and everything it owns: blogs, images and activity
export const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'password', message: 'Password is incorrect' },
    ]);
  }

  await assertNotLastAdmin(
    user,
    'You are the only admin. Promote another admin before deleting your account.'
  );
  return purgeUser(user);
};

// Never leave the system without an admin who can manage roles
export const assertNotLastAdmin = async (user, message) => {
  if (user.role !== USER_ROLES.ADMIN) return;
  const admins = await User.countDocuments({ role: USER_ROLES.ADMIN });
  if (admins <= 1) throw new ApiError(400, message);
};

/**
 * Deletes a user and everything they own: their blogs (with those blogs' likes, bookmarks,
 * history, views and comments), their own likes/bookmarks/history, their comments elsewhere,
 * activity, and finally their images. Shared by self-service and admin deletion.
 */
export const purgeUser = async (user) => {
  const blogs = await Blog.find({ author: user._id }, { 'coverImage.publicId': 1 }).lean();

  await Blog.deleteMany({ author: user._id });
  await deleteBlogEngagement(blogs.map((blog) => blog._id));
  await removeUserEngagement(user._id);
  await removeUserComments(user._id);
  await Activity.deleteMany({ user: user._id });
  await user.deleteOne();

  // Image cleanup is best effort and runs after the data is gone
  await Promise.all([
    deleteImage(user.avatar?.publicId),
    ...blogs.map((blog) => deleteImage(blog.coverImage?.publicId)),
  ]);

  return { deletedBlogs: blogs.length };
};
