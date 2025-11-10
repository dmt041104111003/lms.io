import { useEffect, useRef, useState } from 'react';

/**
 * Ensure a loading indicator remains visible for at least `minMs` milliseconds
 * even if the underlying `isLoading` turns false earlier.
 */
export function useMinLoading(isLoading: boolean, minMs: number = 2000) {
  const [show, setShow] = useState(false);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // When loading starts
    if (isLoading) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (startRef.current === null) {
        startRef.current = Date.now();
      }
      setShow(true);
      return;
    }

    // When loading ends
    const startedAt = startRef.current;
    if (startedAt === null) {
      setShow(false);
      return;
    }
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minMs - elapsed);

    if (remaining > 0) {
      timerRef.current = setTimeout(() => {
        setShow(false);
        startRef.current = null;
        timerRef.current = null;
      }, remaining);
    } else {
      setShow(false);
      startRef.current = null;
    }
  }, [isLoading, minMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return show;
}
