"use client";

import { useCallback, useEffect, useRef } from "react";

// Every caller owns its timers. Leaving a feature cancels its pending work.
export function useTimeouts() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const owned = timers.current;
    return () => { owned.forEach(clearTimeout); owned.clear(); };
  }, []);
  return useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => { timers.current.delete(timer); callback(); }, delay);
    timers.current.add(timer);
    return timer;
  }, []);
}
