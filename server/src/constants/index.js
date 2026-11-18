export const API_PREFIX = '/api/v1';

export const JSON_LIMIT = '16kb';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

export const USER_ROLES = Object.freeze({
  USER: 'user',
  AUTHOR: 'author',
  ADMIN: 'admin',
});

export const BCRYPT_SALT_ROUNDS = 12;

export const TOKEN_COOKIES = Object.freeze({
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
});

// The refresh cookie is only sent to auth endpoints, never to the rest of the API
export const REFRESH_COOKIE_PATH = `${API_PREFIX}/auth`;

// Blog bodies carry full article content, so they get a larger limit than the rest of the API
export const BLOG_JSON_LIMIT = '1mb';

export const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const BLOG_SORT_FIELDS = Object.freeze([
  'createdAt',
  'updatedAt',
  'title',
  'views',
  'likesCount',
  'commentsCount',
]);

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
});

export const IMAGE_UPLOAD = Object.freeze({
  MAX_BYTES: 5 * 1024 * 1024,
  // Checked three times: declared MIME type (multer), real file signature (magic bytes),
  // and Cloudinary's own allowed_formats. SVG is deliberately absent: it can carry scripts.
  MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  FORMATS: ['jpg', 'png', 'webp', 'gif'],
  UPLOAD_TIMEOUT_MS: 60_000,
});

export const ACTIVITY_TYPES = Object.freeze({
  ACCOUNT_CREATED: 'account_created',
  LOGIN: 'login',
  PROFILE_UPDATED: 'profile_updated',
  PASSWORD_CHANGED: 'password_changed',
  BLOG_CREATED: 'blog_created',
  BLOG_UPDATED: 'blog_updated',
  BLOG_PUBLISHED: 'blog_published',
  BLOG_DELETED: 'blog_deleted',
  COMMENT_CREATED: 'comment_created',
});

// Activity entries are pruned automatically by a TTL index after this long
export const ACTIVITY_RETENTION_DAYS = 180;

export const COMMENT_LIMITS = Object.freeze({
  MAX_LENGTH: 2000,
  // Depth 0 is a top-level comment. Replies to a comment at MAX_DEPTH join its thread
  // as siblings instead of nesting further, so threads never become unreadably narrow.
  MAX_DEPTH: 3,
  PAGE_SIZE: 10,
  REPLIES_PAGE_SIZE: 5,
});

export const COMMENT_SORTS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  top: { likesCount: -1, createdAt: -1, _id: -1 },
});

// Server-Sent Event names pushed to everyone viewing a blog
export const COMMENT_EVENTS = Object.freeze({
  CREATED: 'comment:created',
  UPDATED: 'comment:updated',
  DELETED: 'comment:deleted',
  LIKED: 'comment:liked',
});

export const ENGAGEMENT = Object.freeze({
  // A viewer counts as at most one view per blog per UTC day
  VIEW_RETENTION_DAYS: 30, // raw view events; trending only needs the last week
  HISTORY_RETENTION_DAYS: 365,
  // Re-opening a post within this window is the same reading session, not another read
  READ_SESSION_MS: 30 * 60 * 1000,
  TRENDING_WINDOW_DAYS: 7,
  TRENDING_LIKE_WEIGHT: 5, // a like signals more interest than a view
  TRENDING_CACHE_MS: 5 * 60 * 1000,
  DISCOVERY_DEFAULT_LIMIT: 6,
  DISCOVERY_MAX_LIMIT: 20,
});

export const SEARCH = Object.freeze({
  MAX_TERM_LENGTH: 100,
  MAX_FILTER_VALUES: 10,
  // skip-based paging gets slower the deeper it goes, so results are capped at this window
  MAX_RESULT_WINDOW: 1000,
  FACET_LIMIT: 15,
  AUTHOR_FACET_LIMIT: 8,
  // An author-name query matching more people than this is too broad to be useful
  AUTHOR_MATCH_LIMIT: 50,
  DATE_PRESETS: { today: 1, week: 7, month: 30, year: 365 },
  SORTS: ['relevance', 'newest', 'oldest', 'popular', 'views', 'title'],
});
