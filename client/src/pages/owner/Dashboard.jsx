import { useEffect, useState } from "react";
import { BarChart3, Mail, MapPin, Pencil, Star, Store } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { DataTable } from "../../components/tables/DataTable";
import { FilterBar, FilterInput } from "../../components/common/SearchFilters";
import { Pagination } from "../../components/common/Pagination";
import { ErrorState } from "../../components/common/ErrorState";
import { Skeleton } from "../../components/common/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/common/Alert";
import { RatingStars } from "../../components/rating/RatingStars";
import { useListFilters, DEFAULT_PAGE_SIZE } from "../../hooks/useListFilters";
import { ownerApi } from "../../api/ownerApi";
import { useToast } from "../../hooks/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import { isCanceledError } from "../../utils/apiError";
import { formatDate, formatNumber, formatRating } from "../../utils/format";

const COLUMNS = [
  {
    key: "userName",
    header: "User",
    sortKey: "name",
    sortable: true,
    render: (row) => <span className="font-medium text-slate-800">{row.userName || "—"}</span>,
  },
  { key: "email", header: "Email", sortKey: "email", sortable: true },
  {
    key: "address",
    header: "Address",
    className: "max-w-[220px]",
    render: (row) => (
      <span className="block truncate" title={row.address}>
        {row.address || "—"}
      </span>
    ),
  },
  { key: "storeName", header: "Store" },
  {
    key: "rating",
    header: "Rating",
    sortKey: "rating",
    sortable: true,
    render: (row) =>
      row.rating != null ? (
        <span className="flex items-center gap-2">
          <RatingStars value={row.rating} size="sm" />
          <span className="text-xs font-medium text-slate-600">{row.rating} / 5</span>
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "date",
    header: "Date",
    sortKey: "date",
    sortable: true,
    render: (row) => formatDate(row.date),
  },
];

export default function Dashboard() {
  const { filters, setFilter, sort, toggleSort, page, setPage, resetFilters, queryParams, hasActiveFilters } =
    useListFilters({ initialFilters: { name: "", email: "" }, initialSort: { sortBy: "date", order: "desc" } });

  const [stats, setStats] = useState({ stores: [], averageRating: null, totalRatings: null, loaded: false });
  const [ratings, setRatings] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const toast = useToast();
  const [editStore, setEditStore] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const openEdit = (store) => {
    setEditStore(store);
    setEditForm({ name: store.name, email: store.email, address: store.address });
    setEditError(null);
  };

  const handleEdit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await ownerApi.updateStore(editStore.id, editForm);
      toast.success("Store updated successfully.");
      setEditStore(null);
      setReloadTick((t) => t + 1);
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Failed to update store."));
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ownerApi.getDashboard(queryParams, controller.signal);
        if (cancelled) return;
        setRatings({ items: data.ratings.items, total: data.ratings.total, totalPages: data.ratings.totalPages });
        setStats({
          stores: data.stores,
          averageRating: data.averageRating,
          totalRatings: data.totalRatings,
          loaded: true,
        });
      } catch (err) {
        if (cancelled || isCanceledError(err)) return;
        setError(err);
        setRatings({ items: [], total: 0, totalPages: 1 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [queryParams, reloadTick]);

  const refetch = () => setReloadTick((t) => t + 1);
  const statsLoading = loading && !stats.loaded;
  const totalRatings = stats.totalRatings ?? ratings.total;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your stores, ratings and customer feedback." />

      {error ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Store}
              label="Stores owned"
              value={formatNumber(stats.stores.length)}
              loading={statsLoading}
              tone="indigo"
            />
            <StatCard
              icon={BarChart3}
              label="Total ratings"
              value={formatNumber(totalRatings)}
              loading={statsLoading}
              tone="sky"
            />
            <StatCard
              icon={Star}
              label="Average rating"
              value={stats.averageRating != null ? `${formatRating(stats.averageRating)} / 5` : "—"}
              loading={statsLoading}
              tone="amber"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {statsLoading
              ? Array.from({ length: Math.max(1, stats.stores.length) }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                    <Skeleton className="mt-6 h-8 w-24" />
                  </div>
                ))
              : stats.stores.map((store) => {
                  const avg = store.overallRating ?? stats.averageRating;
                  return (
                    <div
                      key={store.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{store.name}</h3>
                          <button
                            onClick={() => openEdit(store)}
                            className="ml-1 text-slate-400 hover:text-indigo-600"
                            title="Edit store"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {store.email && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {store.email}
                          </p>
                        )}
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {store.address || "—"}
                        </p>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        {avg != null ? (
                          <>
                            <div className="flex sm:justify-end">
                              <RatingStars value={avg} size="lg" />
                            </div>
                            <p className="mt-1.5 text-2xl font-bold text-slate-900">
                              {formatRating(avg)}
                              <span className="text-sm font-medium text-slate-400"> / 5</span>
                            </p>
                            {store.ratingCount != null && (
                              <p className="text-xs text-slate-400">
                                {store.ratingCount} rating{store.ratingCount === 1 ? "" : "s"}
                              </p>
                            )}
                          </>
                        ) : (
                          <Badge tone="slate">No ratings yet</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Customer ratings</h2>

            <FilterBar onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
              <FilterInput
                label="User name"
                name="name"
                value={filters.name}
                onChange={(value) => setFilter("name", value)}
                placeholder="Search by user name"
              />
              <FilterInput
                label="Email"
                name="email"
                value={filters.email}
                onChange={(value) => setFilter("email", value)}
                placeholder="Search by email"
              />
            </FilterBar>

            <DataTable
              columns={COLUMNS}
              data={ratings.items}
              loading={loading}
              onSort={toggleSort}
              sortKey={sort.sortBy}
              sortOrder={sort.order}
              emptyTitle="No ratings yet"
              emptyMessage={
                hasActiveFilters
                  ? "No ratings match your search. Try adjusting or clearing the filters."
                  : "When customers rate your store(s), their ratings will appear here."
              }
            />

            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={ratings.totalPages}
                total={ratings.total}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      <Modal
        open={Boolean(editStore)}
        onClose={editLoading ? undefined : () => setEditStore(null)}
        title="Edit store"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditStore(null)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleEdit} loading={editLoading}>Save changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && <Alert variant="error">{editError}</Alert>}
          <Input label="Store name" value={editForm.name || ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={editForm.email || ""} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Address" value={editForm.address || ""} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
