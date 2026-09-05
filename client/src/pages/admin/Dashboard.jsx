import { Star, Store, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { ErrorState } from "../../components/common/ErrorState";
import { useResource } from "../../hooks/useResource";
import { adminApi } from "../../api/adminApi";
import { formatNumber } from "../../utils/format";

export default function Dashboard() {
  const { data, loading, error, refetch } = useResource(() => adminApi.getDashboard(), []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of platform activity." />

      {error ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total Users"
            value={formatNumber(data?.totalUsers)}
            loading={loading}
            tone="sky"
          />
          <StatCard
            icon={Store}
            label="Total Stores"
            value={formatNumber(data?.totalStores)}
            loading={loading}
            tone="indigo"
          />
          <StatCard
            icon={Star}
            label="Total Ratings"
            value={formatNumber(data?.totalRatings)}
            loading={loading}
            tone="amber"
          />
        </div>
      )}
    </div>
  );
}
