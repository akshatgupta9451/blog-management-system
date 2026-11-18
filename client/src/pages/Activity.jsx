import { useSearchParams } from 'react-router';
import { getMyActivity } from '@/services/user.service';
import { useFetch } from '@/hooks/useFetch';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import ActivityFeed, { ActivityFeedSkeleton } from '@/components/dashboard/ActivityFeed';
import ErrorState from '@/components/ui/ErrorState';
import { cn } from '@/utils/format';

const PAGE_SIZE = 20;

const Activity = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data, loading, error, reload } = useFetch(
    (signal) => getMyActivity({ page, limit: PAGE_SIZE }, { signal }),
    [page]
  );

  const changePage = (next) => {
    setSearchParams(next > 1 ? { page: String(next) } : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader
        title="Activity"
        description="Sign-ins, profile changes and everything you've done with your blogs."
      />
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
        {error ? (
          <ErrorState error={error} title="Couldn't load activity" onRetry={reload} />
        ) : !data ? (
          <ActivityFeedSkeleton rows={8} />
        ) : (
          <div className={cn('transition-opacity', loading && 'opacity-50')}>
            <ActivityFeed activities={data.activities} />
          </div>
        )}
        {data && (
          <Pagination
            pagination={data.pagination}
            onPageChange={changePage}
            className="mt-6 border-t border-gray-100 pt-4"
          />
        )}
      </section>
      <p className="mt-3 text-center text-xs text-gray-400">Activity is kept for 180 days.</p>
    </>
  );
};

export default Activity;
