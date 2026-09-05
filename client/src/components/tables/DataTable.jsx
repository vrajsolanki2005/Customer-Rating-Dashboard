import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { Skeleton } from "../common/Skeleton";

function SortableHeader({ column, sortKey, sortOrder, onSort }) {
  const colSortKey = column.sortKey ?? column.key;
  const isActive = sortKey === colSortKey;
  const Icon = isActive ? (sortOrder === "desc" ? ArrowDown : ArrowUp) : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(colSortKey)}
      className="group inline-flex items-center gap-1.5"
      aria-label={`Sort by ${column.header}`}
    >
      <span>{column.header}</span>
      <Icon
        className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-500"}`}
        aria-hidden="true"
      />
    </button>
  );
}

export function DataTable({
  columns,
  data = [],
  loading = false,
  error = null,
  onRetry,
  sortKey,
  sortOrder,
  onSort,
  rowKey = (row) => row.id,
  emptyTitle = "No records found",
  emptyMessage,
  skeletonRows = 6,
}) {
  const card = (children) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{children}</div>
  );

  if (error) {
    return card(<ErrorState error={error} onRetry={onRetry} />);
  }

  return card(
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${column.headerClassName || ""}`}
              >
                {column.sortable && onSort ? (
                  <SortableHeader column={column} sortKey={sortKey} sortOrder={sortOrder} onSort={onSort} />
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5">
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3.5 align-middle text-slate-600 ${column.className || ""}`}>
                    {column.render ? column.render(row) : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
