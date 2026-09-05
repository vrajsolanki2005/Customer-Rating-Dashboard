import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/tables/DataTable";
import { FilterBar, FilterInput, FilterSelect } from "../../components/common/SearchFilters";
import { Pagination } from "../../components/common/Pagination";
import { RoleBadge } from "../../components/common/RoleBadge";
import { ButtonLink } from "../../components/ui/Button";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Alert } from "../../components/common/Alert";
import { useListFilters, DEFAULT_PAGE_SIZE } from "../../hooks/useListFilters";
import { useList } from "../../hooks/useList";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../hooks/useToast";
import { getApiErrorMessage } from "../../utils/apiError";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  { value: "STORE_OWNER", label: "Store Owner" },
];

const ROLE_EDIT_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "STORE_OWNER", label: "Store Owner" },
  { value: "ADMIN", label: "Admin" },
];

export default function Users() {
  const toast = useToast();
  const { filters, setFilter, sort, toggleSort, page, setPage, resetFilters, queryParams, hasActiveFilters } =
    useListFilters();
  const { items, total, totalPages, loading, error, refetch } = useList(adminApi.getUsers, queryParams);

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, address: user.address, role: user.role });
    setEditError(null);
  };

  const handleEdit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await adminApi.updateUser(editUser.id, editForm);
      toast.success("User updated successfully.");
      setEditUser(null);
      refetch();
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Failed to update user."));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteUser.id);
      toast.success("User deleted successfully.");
      setDeleteUser(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete user."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const COLUMNS = [
    {
      key: "name",
      header: "Name",
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
      key: "role",
      header: "Role",
      sortable: true,
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/users/${row.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <Eye className="h-4 w-4" />
            View
          </Link>
          <button
            onClick={() => openEdit(row)}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          {row.role !== "ADMIN" && (
            <button
              onClick={() => setDeleteUser(row)}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Search, filter and manage platform users."
        actions={<ButtonLink to="/admin/users/create" icon={UserPlus}>Create user</ButtonLink>}
      />

      <FilterBar onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <FilterInput label="Name" name="name" value={filters.name} onChange={(v) => setFilter("name", v)} placeholder="Search by name" />
        <FilterInput label="Email" name="email" value={filters.email} onChange={(v) => setFilter("email", v)} placeholder="Search by email" />
        <FilterInput label="Address" name="address" value={filters.address} onChange={(v) => setFilter("address", v)} placeholder="Search by address" />
        <FilterSelect label="Role" name="role" value={filters.role} onChange={(v) => setFilter("role", v)} options={ROLE_OPTIONS} />
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
        emptyTitle="No users found"
        emptyMessage={hasActiveFilters ? "No users match your search." : "No users have been added yet."}
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      <Modal
        open={Boolean(editUser)}
        onClose={editLoading ? undefined : () => setEditUser(null)}
        title="Edit user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleEdit} loading={editLoading}>Save changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && <Alert variant="error">{editError}</Alert>}
          <Input label="Name" value={editForm.name || ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={editForm.email || ""} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Address" value={editForm.address || ""} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
          <Select label="Role" value={editForm.role || ""} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} options={ROLE_EDIT_OPTIONS} />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={Boolean(deleteUser)}
        onClose={deleteLoading ? undefined : () => setDeleteUser(null)}
        title="Delete user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteUser(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold">{deleteUser?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
