import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS, USER_ROLES } from '../constants/index.js';
import { tokenizeName } from '../utils/search.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    // Lowercased, accent-free words of `name`, maintained by a pre-save hook (author search)
    nameTokens: {
      type: [String],
      select: false,
    },
    // Access tokens issued before this moment are rejected (see auth middleware)
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    // SHA-256 hash of the current refresh token; null when logged out
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

// Author search: "love" should find "Ada Lovelace". Each lowercased word of the name is an
// index key, so a word-prefix search is an index range scan rather than a regex over every user.
userSchema.index({ nameTokens: 1 });
// Admin: role counts and the role-filtered user list (newest first); signups over time
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', function () {
  if (this.isModified('name')) this.nameTokens = tokenizeName(this.name);
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
  // Backdated 1s because JWT `iat` is in whole seconds: a token issued right after the
  // change must still count as newer than it
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.refreshTokenHash;
    delete ret.passwordChangedAt;
    delete ret.nameTokens;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
