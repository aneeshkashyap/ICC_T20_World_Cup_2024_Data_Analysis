/**
 * useDeferredData — loads expensive data transformations after paint.
 * Returns { data, loading, error } with proper lifecycle management.
 */
import { useState, useEffect, useCallback } from 'react';

export function useDeferredData(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    // Use a microtask to defer heavy work until after first paint
    const id = setTimeout(() => {
      try {
        const data = loader();
        setState({ data, loading: false, error: null });
      } catch (err) {
        console.error('[useDeferredData]', err);
        setState({ data: null, loading: false, error: err.message || 'Failed to load data' });
      }
    }, 0);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    return load();
  }, [load]);

  return { ...state, retry: load };
}

/**
 * useDebounce — delays updating a value until after `delay` ms of inactivity.
 */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
