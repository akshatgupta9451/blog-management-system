import { useQueryParams } from '@/hooks/useQueryParams';
import { getAnalytics } from '@/services/admin.service';
import { useFetch } from '@/hooks/useFetch';
import { CHART_COLORS, blogPath } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/admin/StatTile';
import BarList from '@/components/charts/BarList';
import ChartCard from '@/components/charts/ChartCard';
import ColumnChart from '@/components/charts/ColumnChart';
import LineChart from '@/components/charts/LineChart';
import { formatBucket, formatValue } from '@/components/charts/scale';
import Avatar from '@/components/ui/Avatar';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { cn } from '@/utils/format';

const RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

const AdminAnalytics = () => {
  const [params, update] = useQueryParams(['range']);
  const range = params.range || '30d';
  const { data, loading, error, reload } = useFetch(
    (signal) => getAnalytics(range, { signal }),
    [range]
  );

  const unit = data?.unit ?? 'day';
  const fx = (d) => formatBucket(d, unit);
  const fxLong = (d) => formatBucket(d, unit, true);
  const per = { day: 'per day', week: 'per week', month: 'per month' }[unit];
  const rangeLabel = RANGES.find((r) => r.value === range)?.label.toLowerCase();
  const tableFor = (series) =>
    data && {
      columns: [
        unit === 'day' ? 'Day' : unit === 'week' ? 'Week' : 'Month',
        ...series.map((s) => s.label),
      ],
      rows: data.buckets.map((b) => [fxLong(b.date), ...series.map((s) => formatValue(b[s.key]))]),
    };

  const growth = [
    { key: 'users', label: 'New users', color: CHART_COLORS.slot1 },
    { key: 'blogs', label: 'New posts', color: CHART_COLORS.slot2 },
  ];
  const engagement = [
    { key: 'likes', label: 'Likes', color: CHART_COLORS.slot1 },
    { key: 'comments', label: 'Comments', color: CHART_COLORS.slot2 },
  ];
  const views = [{ key: 'views', label: 'Views', color: CHART_COLORS.slot1 }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="How the platform is growing and how readers engage."
      />

      {/* One filter row above everything it scopes */}
      <div role="group" aria-label="Date range" className="flex flex-wrap gap-2">
        {RANGES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={range === option.value}
            onClick={() => update('range', option.value === '30d' ? '' : option.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset',
              range === option.value
                ? 'bg-gray-900 text-white ring-gray-900'
                : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState error={error} title="Couldn't load analytics" onRetry={reload} />
      ) : !data ? (
        <Loader label="Crunching numbers…" />
      ) : (
        // Refetch keeps the previous render at reduced opacity: no skeleton, no layout jump
        <div
          className={cn('space-y-6 transition-opacity', loading && 'opacity-50')}
          aria-busy={loading}
        >
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatTile label="New users" value={data.totals.users} />
            <StatTile label="New posts" value={data.totals.blogs} />
            <StatTile label="Views" value={data.totals.views} />
            <StatTile label="Likes" value={data.totals.likes} />
            <StatTile label="Comments" value={data.totals.comments} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard
              title="Growth"
              description={`New users and posts ${per}`}
              table={tableFor(growth)}
            >
              <ColumnChart
                label={`New users and new posts ${per}, ${rangeLabel}`}
                data={data.buckets}
                series={growth}
                formatX={fx}
                formatXLong={fxLong}
              />
            </ChartCard>
            <ChartCard
              title="Engagement"
              description={`Likes and comments ${per}`}
              table={tableFor(engagement)}
            >
              <ColumnChart
                label={`Likes and comments ${per}, ${rangeLabel}`}
                data={data.buckets}
                series={engagement}
                formatX={fx}
                formatXLong={fxLong}
              />
            </ChartCard>
          </div>

          {/* Views are on a far larger scale, so they get their own chart rather than a second axis */}
          <ChartCard
            title="Views"
            description={`Unique daily readers ${per}`}
            table={tableFor(views)}
            note={
              data.buckets.some((b) => b.views === null) &&
              `View events are kept for ${data.viewRetentionDays} days, so earlier periods show no data.`
            }
          >
            <LineChart
              label={`Views ${per}, ${rangeLabel}`}
              data={data.buckets}
              series={views}
              formatX={fx}
              formatXLong={fxLong}
              area
              height={200}
            />
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartCard title="Most viewed posts" description={`In the ${rangeLabel}`}>
              {data.topBlogs.length ? (
                <BarList
                  valueLabel="views"
                  items={data.topBlogs.map((b) => ({
                    key: b._id,
                    label: b.title,
                    value: b.views,
                    href: blogPath(b.slug),
                  }))}
                />
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">No views in this period.</p>
              )}
            </ChartCard>
            <ChartCard title="Top categories" description="Published posts per category">
              {data.topCategories.length ? (
                <BarList
                  valueLabel="posts"
                  color={CHART_COLORS.slot2}
                  items={data.topCategories.map((c) => ({ label: c.name, value: c.posts }))}
                />
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">No published posts yet.</p>
              )}
            </ChartCard>
            <ChartCard title="Top authors" description="By total views, all time">
              {data.topAuthors.length ? (
                <ol className="divide-y divide-gray-100">
                  {data.topAuthors.map((author, i) => (
                    <li key={author._id} className="flex items-center gap-3 py-2.5">
                      <span className="w-4 text-sm font-semibold text-gray-400 tabular-nums">
                        {i + 1}
                      </span>
                      <Avatar user={author} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{author.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatValue(author.posts)} posts · {formatValue(author.likes)} likes
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatValue(author.views)}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">No published posts yet.</p>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
