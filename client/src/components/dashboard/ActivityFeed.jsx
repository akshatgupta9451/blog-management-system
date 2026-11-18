import { Link } from 'react-router';
import { ACTIVITY_TYPES, APP_NAME, blogPath } from '@/constants';
import Icon from '@/components/ui/Icon';
import { cn, formatDate, timeAgo } from '@/utils/format';

// How each activity type reads in the feed. `blog` entries render the post title inline.
const META = {
  [ACTIVITY_TYPES.ACCOUNT_CREATED]: {
    icon: 'sparkles',
    tone: 'bg-violet-100 text-violet-600',
    text: `Joined ${APP_NAME}`,
  },
  [ACTIVITY_TYPES.LOGIN]: { icon: 'login', tone: 'bg-gray-100 text-gray-500', text: 'Logged in' },
  [ACTIVITY_TYPES.PROFILE_UPDATED]: {
    icon: 'user',
    tone: 'bg-sky-100 text-sky-600',
    text: 'Updated your profile',
  },
  [ACTIVITY_TYPES.PASSWORD_CHANGED]: {
    icon: 'key',
    tone: 'bg-amber-100 text-amber-600',
    text: 'Changed your password',
  },
  [ACTIVITY_TYPES.BLOG_CREATED]: {
    icon: 'document',
    tone: 'bg-primary-100 text-primary-600',
    text: 'Created',
    blog: true,
  },
  [ACTIVITY_TYPES.BLOG_UPDATED]: {
    icon: 'write',
    tone: 'bg-primary-100 text-primary-600',
    text: 'Edited',
    blog: true,
  },
  [ACTIVITY_TYPES.BLOG_PUBLISHED]: {
    icon: 'published',
    tone: 'bg-green-100 text-green-600',
    text: 'Published',
    blog: true,
  },
  [ACTIVITY_TYPES.BLOG_DELETED]: {
    icon: 'trash',
    tone: 'bg-rose-100 text-rose-600',
    text: 'Deleted',
    blog: true,
    noLink: true,
  },
};

const ActivityItem = ({ activity, isLast }) => {
  const meta = META[activity.type];
  if (!meta) return null;

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span className="absolute top-9 bottom-0 left-4 w-px bg-gray-200" aria-hidden="true" />
      )}
      <span
        className={cn(
          'relative flex size-8 shrink-0 items-center justify-center rounded-full',
          meta.tone
        )}
      >
        <Icon name={meta.icon} className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm text-gray-700">
          {meta.text}
          {meta.blog && activity.blog?.title && (
            <>
              {' '}
              {meta.noLink ? (
                <span className="font-medium text-gray-900">“{activity.blog.title}”</span>
              ) : (
                <Link
                  to={blogPath(activity.blog.slug)}
                  className="hover:text-primary-700 font-medium text-gray-900"
                >
                  “{activity.blog.title}”
                </Link>
              )}
            </>
          )}
        </p>
        <time
          dateTime={activity.createdAt}
          title={formatDate(activity.createdAt)}
          className="text-xs text-gray-500"
        >
          {timeAgo(activity.createdAt)}
        </time>
      </div>
    </li>
  );
};

/** Vertical timeline of the user's recent actions (GET /users/me/activity). */
const ActivityFeed = ({ activities }) => {
  if (!activities.length) {
    return <p className="py-6 text-center text-sm text-gray-500">No activity yet.</p>;
  }

  return (
    <ol>
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity._id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </ol>
  );
};

export const ActivityFeedSkeleton = ({ rows = 5 }) => (
  <div className="space-y-5" aria-hidden="true">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex animate-pulse gap-3">
        <div className="size-8 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-3/4 rounded bg-gray-100" />
          <div className="h-2.5 w-20 rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);

export default ActivityFeed;
