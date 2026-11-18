import { Link } from 'react-router';
import { getAnalytics, getOverview } from '@/services/admin.service';
import { useFetch } from '@/hooks/useFetch';
import { CHART_COLORS, ROUTES, blogPath } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/admin/StatTile';
import ChartCard from '@/components/charts/ChartCard';
import ColumnChart from '@/components/charts/ColumnChart';
import StackedBar from '@/components/charts/StackedBar';
import { formatBucket, formatValue } from '@/components/charts/scale';
import Avatar from '@/components/ui/Avatar';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import StatusBadge from '@/components/ui/StatusBadge';
import Panel from '@/components/dashboard/Panel';
import { timeAgo } from '@/utils/format';

const AdminDashboard = () => {
  const overview = useFetch((signal) => getOverview({ signal }), []);
  const trend = useFetch((signal) => getAnalytics('30d', { signal }), []);

  if (overview.error) return <ErrorState error={overview.error} onRetry={overview.reload} />;
  const o = overview.data;

  const growthSeries = [
    { key: 'users', label: 'New users', color: CHART_COLORS.slot1 },
    { key: 'blogs', label: 'New posts', color: CHART_COLORS.slot2 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" description="The whole platform at a glance." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile
          label="Users"
          value={o?.users.total}
          current={o?.users.last30}
          previous={o?.users.prev30}
        />
        <StatTile
          label="Blogs"
          value={o?.blogs.total}
          current={o?.blogs.last30}
          previous={o?.blogs.prev30}
        />
        <StatTile label="Total views" value={o?.engagement.views} />
        <StatTile label="Total likes" value={o?.engagement.likes} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Users by role">
          {o ? (
            <StackedBar
              label="Users by role"
              segments={[
                { label: 'Readers', value: o.users.byRole.user, color: CHART_COLORS.slot1 },
                { label: 'Authors', value: o.users.byRole.author, color: CHART_COLORS.slot2 },
                { label: 'Admins', value: o.users.byRole.admin, color: CHART_COLORS.slot3 },
              ]}
            />
          ) : (
            <Loader />
          )}
        </ChartCard>
        <ChartCard title="Blogs by status">
          {o ? (
            <StackedBar
              label="Blogs by status"
              segments={[
                {
                  label: 'Published',
                  value: o.blogs.byStatus.published,
                  color: CHART_COLORS.slot1,
                },
                { label: 'Drafts', value: o.blogs.byStatus.draft, color: CHART_COLORS.slot2 },
                { label: 'Archived', value: o.blogs.byStatus.archived, color: CHART_COLORS.slot3 },
              ]}
            />
          ) : (
            <Loader />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Growth, last 30 days"
        description="New sign-ups and new posts per day"
        table={
          trend.data && {
            columns: ['Day', 'New users', 'New posts'],
            rows: trend.data.buckets.map((b) => [
              formatBucket(b.date, 'day', true),
              formatValue(b.users),
              formatValue(b.blogs),
            ]),
          }
        }
      >
        {trend.error ? (
          <ErrorState error={trend.error} onRetry={trend.reload} />
        ) : trend.data ? (
          <ColumnChart
            label="New users and new posts per day over the last 30 days"
            data={trend.data.buckets}
            series={growthSeries}
            formatX={(d) => formatBucket(d, 'day')}
            formatXLong={(d) => formatBucket(d, 'day', true)}
          />
        ) : (
          <Loader />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Newest users" viewAllTo={ROUTES.ADMIN_USERS} bodyClassName="py-1">
          <ul className="divide-y divide-gray-100">
            {o?.recentUsers.map((user) => (
              <li key={user._id} className="flex items-center gap-3 py-3">
                <Avatar user={user} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                <span className="w-24 text-right text-xs text-gray-400">
                  {timeAgo(user.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Newest posts" viewAllTo={ROUTES.ADMIN_BLOGS} bodyClassName="py-1">
          <ul className="divide-y divide-gray-100">
            {o?.recentBlogs.map((blog) => (
              <li key={blog._id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to={blogPath(blog.slug)}
                    className="hover:text-primary-700 block truncate text-sm font-medium text-gray-900"
                  >
                    {blog.title}
                  </Link>
                  <p className="truncate text-xs text-gray-500">
                    by {blog.author?.name ?? 'Deleted user'}
                  </p>
                </div>
                <StatusBadge status={blog.status} />
                <span className="w-24 text-right text-xs text-gray-400">
                  {timeAgo(blog.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {o && (
        <p className="text-xs text-gray-500">
          {formatValue(o.engagement.comments)} comments · {formatValue(o.engagement.bookmarks)}{' '}
          bookmarks across the platform.
        </p>
      )}
    </div>
  );
};

export default AdminDashboard;
