import { useState } from "react";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/tables/DataTable";
import { FilterBar, FilterInput } from "../../components/common/SearchFilters";
import { Pagination } from "../../components/common/Pagination";
import { RatingStars } from "../../components/rating/RatingStars";
import { ButtonLink, Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/common/Alert";
import { useListFilters, DEFAULT_PAGE_SIZE } from "../../hooks/useListFilters";
import { useList } from "../../hooks/useList";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../hooks/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatRating } from "../../utils/format";

export default function Stores() {
  const toast = useToast();
  const { filters, setFilter, sort, toggleSort, page, setPage, resetFilters, queryParams, hasActiveFilters } =
    useListFilters();
  const { items, total, totalPages, loading, error, refetch } = useList(adminApi.getStores, queryParams);

  const [editStore, setEditStore] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteStore, setDeleteStore] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openEdit = (store) => {
    setEditStore(store);
    setEditForm({ name: store.name, email: store.email, address: store.address });
    setEditError(null);
  };

  const handleEdit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await adminApi.updateStore(editStore.id, editForm);
      toast.success("Store updated successfully.");
      setEditStore(null);
      refetch();
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Failed to update store."));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminApi.deleteStore(deleteStore.id);
      toast.success("Store deleted successfully.");
      setDeleteStore(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete store."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const COLUMNS = [
    {
      key: "name",
      header: "Store name",
      sortable: true,
      render: (row) => <span className="font-medium text-slate-800">{row.name}</span>,
    },
    { key: "email", header: "Email", sortable: true },
    {
      key: "address",
      header: "Address",
      sortable: true,
      className: "max-w-[200px]",
      render: (row) => (
        <span className="block truncate" title={row.address}>{row.address || "—"}</span>
      ),
    },
    {
      key: "rating",
      header: "Overall rating",
      render: (row) =>
        row.overallRating != null ? (
          <span className="flex items-center gap-2">
            <RatingStars value={row.overallRating} size="sm" />
            <span className="font-medium text-slate-700">{formatRating(row.overallRating)}</span>
          </span>
        ) : (
          <span className="text-sm text-slate-400">No ratings yet</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEdit(row)}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setDeleteStore(row)}
            className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stores"
        subtitle="All stores on the platform with their overall ratings."
        actions={<ButtonLink to="/admin/stores/create" icon={PlusCircle}>Create store</ButtonLink>}
      />

      <FilterBar onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <FilterInput label="Store name" name="name" value={filters.name} onChange={(v) => setFilter("name", v)} placeholder="Search by store name" />
        <FilterInput label="Email" name="email" value={filters.email} onChange={(v) => setFilter("email", v)} placeholder="Search by email" />
        <FilterInput label="Address" name="address" value={filters.address} onChange={(v) => setFilter("address", v)} placeholder="Search by address" />
      </FilterBar>

      <DataTable
        columns={COLUMNS}
        data={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        sortKey={sort.sortBy}
        sortOrder={sort.order}
        onSort={toggleSort}
        emptyTitle="No stores found"
        emptyMessage={hasActiveFilters ? "No stores match your search." : "No stores have been added yet."}
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
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

      {/* Delete Confirm Modal */}
      <Modal
        open={Boolean(deleteStore)}
        onClose={deleteLoading ? undefined : () => setDeleteStore(null)}
        title="Delete store"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteStore(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold">{deleteStore?.name}</span>? All ratings for this store will also be deleted.
        </p>
      </Modal>
    </div>
  );
}
