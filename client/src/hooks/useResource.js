import { useEffect, useState, useCallback, useRef } from "react";
import { isCanceledError } from "../utils/apiError";

export function useResource(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const serializedDeps = JSON.stringify(deps);

  useEffect(() => {
    let isCurrent = true;

    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!isCurrent) return;
        setData(result);
      })
      .catch((err) => {
        if (!isCurrent || isCanceledError(err)) return;
        setError(err);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [serializedDeps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, refetch };
}

