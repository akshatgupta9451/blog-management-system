export const APP_NAME = 'Blog Management System';

export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MY_BLOGS: '/dashboard/blogs',
  DRAFTS: '/dashboard/drafts',
  PUBLISHED: '/dashboard/published',
  ACTIVITY: '/dashboard/activity',
  BOOKMARKS: '/dashboard/bookmarks',
  LIKED: '/dashboard/liked',
  HISTORY: '/dashboard/history',
  PROFILE: '/dashboard/profile',
  CREATE_BLOG: '/dashboard/blogs/new',
  EDIT_BLOG: '/dashboard/blogs/:slug/edit',
  BLOG_DETAILS: '/blogs/:slug',
  SEARCH: '/search',
  ADMIN: '/admin',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_USERS: '/admin/users',
  ADMIN_BLOGS: '/admin/blogs',
  ADMIN_COMMENTS: '/admin/comments',
});

export const blogPath = (slug) => `/blogs/${slug}`;
export const editBlogPath = (slug) => `/dashboard/blogs/${slug}/edit`;

export const ROLES = Object.freeze({
  USER: 'user',
  AUTHOR: 'author',
  ADMIN: 'admin',
});

export const WRITER_ROLES = [ROLES.AUTHOR, ROLES.ADMIN];

export const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: '-views', label: 'Most viewed' },
  { value: '-likesCount', label: 'Most liked' },
  { value: '-commentsCount', label: 'Most discussed' },
  { value: 'title', label: 'Title (A–Z)' },
];

export const PAGE_SIZE = 9;

export const IMAGE_UPLOAD = Object.freeze({
  // The server's limit, checked after in-browser compression
  MAX_SIZE: 5 * 1024 * 1024,
  // What a user may pick: large phone photos are fine, they're compressed before upload
  MAX_SOURCE_SIZE: 25 * 1024 * 1024,
  ACCEPT: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
});

// Fired by the axios client when a refresh fails, so the auth state can reset
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export const ACTIVITY_TYPES = Object.freeze({
  ACCOUNT_CREATED: 'account_created',
  LOGIN: 'login',
  PROFILE_UPDATED: 'profile_updated',
  PASSWORD_CHANGED: 'password_changed',
  BLOG_CREATED: 'blog_created',
  BLOG_UPDATED: 'blog_updated',
  BLOG_PUBLISHED: 'blog_published',
  BLOG_DELETED: 'blog_deleted',
});

export const SEARCH_SORTS = [
  { value: 'relevance', label: 'Best match', needsQuery: true },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most liked' },
  { value: 'views', label: 'Most viewed' },
  { value: 'title', label: 'Title (A–Z)' },
];

export const SEARCH_DATE_PRESETS = [
  { value: '', label: 'Any time' },
  { value: 'today', label: 'Past 24 hours' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
];

// URL params understood by the search page (same names as the API)
export const SEARCH_PARAMS = [
  'q',
  'title',
  'author',
  'category',
  'tags',
  'tagsMode',
  'date',
  'from',
  'to',
  'sort',
  'page',
];

// Chart series colors (CSS variables defined on .viz-root in index.css). Fixed per entity,
// never by rank, so a filter never repaints the series that remain.
export const CHART_COLORS = Object.freeze({
  slot1: 'var(--viz-series-1)',
  slot2: 'var(--viz-series-2)',
  slot3: 'var(--viz-series-3)',
});
