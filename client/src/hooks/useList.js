import { useEffect, useState, useCallback, useRef } from "react";
import { isCanceledError } from "../utils/apiError";

export function useList(fetcher, params) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const serialized = JSON.stringify(params || {});

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    setLoading(true);
    setError(null);

    fetcherRef
      .current(JSON.parse(serialized), controller.signal)
      .then((result) => {
        if (!isCurrent) return;
        setItems(result?.items || []);
        setTotal(result?.total || 0);
        setTotalPages(result?.totalPages || 1);
      })
      .catch((err) => {
        if (!isCurrent || isCanceledError(err)) return;
        setError(err);
        setItems([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [serialized, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { items, total, totalPages, loading, error, refetch };
}

