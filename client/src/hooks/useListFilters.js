import { useCallback, useMemo, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

export const DEFAULT_PAGE_SIZE = 10;

export function useListFilters({
  initialFilters = {},
  initialSort = { sortBy: "name", order: "asc" },
  limit = DEFAULT_PAGE_SIZE,
  debounceMs = 400,
} = {}) {
  const initialRef = useRef({ filters: initialFilters, sort: initialSort });

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebounce(filters, debounceMs);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const setSorting = useCallback((sortBy, order) => {
    setSort({ sortBy, order });
    setPage(1);
  }, []);

  const toggleSort = useCallback((key) => {
    setSort((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialRef.current.filters);
    setSort(initialRef.current.sort);
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== "" && v != null),
    [filters]
  );

  const queryParams = useMemo(() => {
    const params = {};
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value !== "" && value != null) params[key] = value;
    });
    if (sort.sortBy) {
      params.sortBy = sort.sortBy;
      params.order = sort.order;
    }
    params.page = page;
    params.limit = limit;
    return params;
  }, [debouncedFilters, sort, page, limit]);

  return {
    filters,
    setFilter,
    sort,
    setSorting,
    toggleSort,
    page,
    setPage,
    resetFilters,
    queryParams,
    hasActiveFilters,
  };
}
