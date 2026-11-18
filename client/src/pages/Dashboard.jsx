import { getMyBlogs, getMyStats } from '@/services/blog.service';
import { getMyActivity } from '@/services/user.service';
import { getMyHistory } from '@/services/engagement.service';
import CompactBlogList from '@/components/blog/CompactBlogList';
import { timeAgo } from '@/utils/format';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import ActivityFeed, { ActivityFeedSkeleton } from '@/components/dashboard/ActivityFeed';
import BlogList from '@/components/dashboard/BlogList';
import Panel from '@/components/dashboard/Panel';
import ProfileSummary from '@/components/dashboard/ProfileSummary';
import StatCard from '@/components/dashboard/StatCard';
import StatusBreakdown from '@/components/dashboard/StatusBreakdown';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';

const WIDGET_SIZE = 5;

/** Loading / error / empty / list states for the small blog widgets. */
const BlogWidget = ({ request, emptyText, canWrite }) => {
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;
  if (!request.data) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    );
  }
  if (!request.data.blogs.length) {
    return <p className="py-6 text-center text-sm text-gray-500">{emptyText}</p>;
  }
  return <BlogList blogs={request.data.blogs} compact canWrite={canWrite} />;
};

const Dashboard = () => {
  const { user, canWrite } = useAuth();

  const stats = useFetch((signal) => getMyStats({ signal }), []);
  const activity = useFetch((signal) => getMyActivity({ limit: 8 }, { signal }), []);
  const recentlyViewed = useFetch((signal) => getMyHistory({ limit: 5 }, { signal }), []);
  const drafts = useFetch(
    (signal) => getMyBlogs({ status: 'draft', sort: '-updatedAt', limit: WIDGET_SIZE }, { signal }),
    []
  );
  const topPublished = useFetch(
    (signal) => getMyBlogs({ status: 'published', sort: '-views', limit: WIDGET_SIZE }, { signal }),
    []
  );

  const s = stats.data;
  // Readers can't write, so blog stats and widgets would only ever be empty. Keep them for
  // anyone who has blogs (e.g. an author who was later moved back to reader).
  const showBlogSections = canWrite || s?.total > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        description="Here's what's happening with your blogs."
        actions={canWrite && <Button to={ROUTES.CREATE_BLOG}>New blog</Button>}
      />

      <ProfileSummary user={user} />

      {!canWrite && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          You have a reader account. Ask an admin to make you an <strong>author</strong> to start
          writing blogs.
        </div>
      )}

      {showBlogSections && (
        <>
          <section aria-label="Statistics" className="space-y-4">
            {stats.error ? (
              <ErrorState
                error={stats.error}
                title="Couldn't load statistics"
                onRetry={stats.reload}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <StatCard label="Total blogs" value={s?.total} icon="document" tone="indigo" />
                  <StatCard label="Published" value={s?.published} icon="published" tone="green" />
                  <StatCard label="Drafts" value={s?.draft} icon="write" tone="amber" />
                  <StatCard label="Total views" value={s?.views} icon="eye" tone="sky" />
                  <StatCard label="Likes" value={s?.likes} icon="heart" tone="rose" />
                  <StatCard label="Comments" value={s?.comments} icon="chat" tone="violet" />
                </div>
                <StatusBreakdown stats={s} />
              </>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Panel
              title="Recent drafts"
              description="Pick up where you left off"
              viewAllTo={ROUTES.DRAFTS}
              bodyClassName="py-1"
            >
              <BlogWidget
                request={drafts}
                emptyText="No drafts. Nice and tidy!"
                canWrite={canWrite}
              />
            </Panel>
            <Panel
              title="Top published"
              description="Your most viewed posts"
              viewAllTo={ROUTES.PUBLISHED}
              bodyClassName="py-1"
            >
              <BlogWidget
                request={topPublished}
                emptyText="Nothing published yet."
                canWrite={canWrite}
              />
            </Panel>
          </div>
        </>
      )}

      <Panel title="Recently viewed" description="Pick up your reading" viewAllTo={ROUTES.HISTORY}>
        {recentlyViewed.error ? (
          <ErrorState error={recentlyViewed.error} onRetry={recentlyViewed.reload} />
        ) : !recentlyViewed.data ? (
          <ActivityFeedSkeleton rows={3} />
        ) : recentlyViewed.data.blogs.length ? (
          <CompactBlogList
            blogs={recentlyViewed.data.blogs}
            meta={(blog) =>
              `${blog.author?.name ?? 'Unknown'} · read ${timeAgo(blog.lastViewedAt)}`
            }
          />
        ) : (
          <p className="py-6 text-center text-sm text-gray-500">
            Blogs you read will show up here.
          </p>
        )}
      </Panel>

      <Panel title="Recent activity" viewAllTo={ROUTES.ACTIVITY}>
        {activity.error ? (
          <ErrorState error={activity.error} onRetry={activity.reload} />
        ) : activity.data ? (
          <ActivityFeed activities={activity.data.activities} />
        ) : (
          <ActivityFeedSkeleton />
        )}
      </Panel>
    </div>
  );
};

export default Dashboard;
