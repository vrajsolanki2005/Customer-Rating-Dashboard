import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Mail, MapPin, Store } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { ButtonLink } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { RoleBadge } from "../../components/common/RoleBadge";
import { RatingStars } from "../../components/rating/RatingStars";
import { useResource } from "../../hooks/useResource";
import { adminApi } from "../../api/adminApi";
import { initials, formatDate, formatRating } from "../../utils/format";

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 break-words text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}

export default function UserDetails() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useResource(() => adminApi.getUser(id), [id]);

  const backAction = (
    <ButtonLink to="/admin/users" variant="secondary" icon={ArrowLeft}>
      Back to users
    </ButtonLink>
  );

  if (error) {
    return (
      <div>
        <PageHeader title="User details" actions={backAction} />
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div>
        <PageHeader title="User details" actions={backAction} />
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const stores = data?.stores ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="User details" subtitle="Profile information and related records." actions={backAction} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
            {initials(user?.name)}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
            <div className="mt-1">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        <dl className="mt-6 space-y-4">
          <DetailRow icon={Mail} label="Email">
            <a href={`mailto:${user?.email}`} className="text-indigo-600 hover:text-indigo-700">
              {user?.email || "—"}
            </a>
          </DetailRow>
          <DetailRow icon={MapPin} label="Address">
            {user?.address || "—"}
          </DetailRow>
          {user?.createdAt && (
            <DetailRow icon={Calendar} label="Joined">
              {formatDate(user.createdAt)}
            </DetailRow>
          )}
        </dl>
      </div>

      {user?.role === "STORE_OWNER" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Store className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Owned stores
          </h2>

          {stores.length === 0 ? (
            <EmptyState icon={Store} title="No stores yet" message="This store owner does not own any stores." />
          ) : (
            <ul className="space-y-3">
              {stores.map((store) => (
                <li key={store.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{store.name}</p>
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
                    <div className="text-left sm:text-right">
                      {store.overallRating != null ? (
                        <>
                          <RatingStars value={store.overallRating} size="sm" />
                          <p className="mt-1 text-xs text-slate-500">
                            {formatRating(store.overallRating)}
                            {store.ratingCount != null ? ` · ${store.ratingCount} rating${store.ratingCount === 1 ? "" : "s"}` : ""}
                          </p>
                        </>
                      ) : (
                        <Badge tone="slate">No ratings yet</Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-slate-400">
            Want to edit this owner&apos;s stores?{" "}
            <Link to="/admin/stores/create" className="font-medium text-indigo-600 hover:text-indigo-700">
              Create a new store
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
