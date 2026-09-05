import { useState } from "react";
import { Mail, MapPin, Star, Store } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { FilterBar, FilterInput, FilterSelect } from "../../components/common/SearchFilters";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Skeleton } from "../../components/common/Skeleton";
import { Button } from "../../components/ui/Button";
import { RatingStars } from "../../components/rating/RatingStars";
import { RatingDialog } from "../../components/rating/RatingDialog";
import { useListFilters, DEFAULT_PAGE_SIZE } from "../../hooks/useListFilters";
import { useList } from "../../hooks/useList";
import { userApi } from "../../api/userApi";
import { formatRating } from "../../utils/format";

const SORT_OPTIONS = [
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "rating:desc", label: "Rating (high to low)" },
  { value: "rating:asc", label: "Rating (low to high)" },
];

function StoreCard({ store, onRate }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Store className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900" title={store.name}>
            {store.name}
          </h3>
          {store.email && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{store.email}</span>
            </p>
          )}
          <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{store.address || "—"}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Overall rating</p>
          {store.overallRating != null ? (
            <div className="mt-1.5">
              <RatingStars value={store.overallRating} size="sm" />
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatRating(store.overallRating)} / 5
                {store.ratingCount != null && (
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    ({store.ratingCount} rating{store.ratingCount === 1 ? "" : "s"})
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400">No ratings yet</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Your rating</p>
          {store.myRating != null ? (
            <div className="mt-1.5">
              <RatingStars value={store.myRating} size="sm" />
              <p className="mt-1 text-sm font-semibold text-slate-700">{store.myRating} / 5</p>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400">Not rated yet</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        {store.myRating != null ? (
          <Button variant="secondary" className="w-full" icon={Star} onClick={() => onRate(store)}>
            Modify rating
          </Button>
        ) : (
          <Button className="w-full" icon={Star} onClick={() => onRate(store)}>
            Rate store
          </Button>
        )}
      </div>
    </article>
  );
}

export default function Stores() {
  const { filters, setFilter, sort, setSorting, page, setPage, resetFilters, queryParams, hasActiveFilters } =
    useListFilters({ initialFilters: { name: "", address: "" } });

  const { items, total, totalPages, loading, error, refetch } = useList(userApi.getStores, queryParams);
  const [activeStore, setActiveStore] = useState(null);

  const sortValue = `${sort.sortBy}:${sort.order}`;
  const handleSortChange = (value) => {
    const [sortBy, order] = value.split(":");
    setSorting(sortBy, order);
  };

  return (
    <div>
      <PageHeader title="Stores" subtitle="Browse stores and share your experience by rating them." />

      <FilterBar onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <FilterInput
          label="Store name"
          name="name"
          value={filters.name}
          onChange={(value) => setFilter("name", value)}
          placeholder="Search by store name"
        />
        <FilterInput
          label="Address"
          name="address"
          value={filters.address}
          onChange={(value) => setFilter("address", value)}
          placeholder="Search by address"
        />
        <FilterSelect label="Sort by" name="sort" value={sortValue} onChange={handleSortChange} options={SORT_OPTIONS} />
      </FilterBar>

      {error ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Skeleton className="h-11 w-11 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="mt-4 h-20 w-full" />
              <Skeleton className="mt-4 h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Store}
            title="No stores found"
            message={
              hasActiveFilters
                ? "No stores match your search. Try different keywords or clear the filters."
                : "There are no stores available yet. Check back soon!"
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((store) => (
            <StoreCard key={store.id} store={store} onRate={setActiveStore} />
          ))}
        </div>
      )}

      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <RatingDialog
        store={activeStore}
        onClose={() => setActiveStore(null)}
        onRated={() => {
          setActiveStore(null);
          refetch();
        }}
      />
    </div>
  );
}
