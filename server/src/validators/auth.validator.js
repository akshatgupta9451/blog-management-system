import { body } from 'express-validator';

const email = () =>
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Enter a valid email address')
    .toLowerCase();

// bcrypt only uses the first 72 bytes, so cap the length well below that
const strongPassword = (field) =>
  body(field)
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number');

const matches = (field, other) =>
  body(field)
    .custom((value, { req }) => value === req.body[other])
    .withMessage('Passwords do not match');

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  email(),

  strongPassword('password'),
  matches('confirmPassword', 'password'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
];

export const loginValidator = [
  email(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidator = [
  body('refreshToken').optional().isJWT().withMessage('Refresh token is malformed'),
];

export const changePasswordValidator = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  strongPassword('newPassword')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from your current password'),
  matches('confirmPassword', 'newPassword'),
];
