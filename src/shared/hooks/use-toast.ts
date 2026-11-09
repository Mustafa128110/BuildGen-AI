"use client";

import { useCallback, useState } from "react";
import { useTimeouts } from "./use-timeouts";

export function useToast(duration: number) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const schedule = useTimeouts();
  const triggerToast = useCallback((message: string) => {
    setToastMessage(message);
    schedule(() => setToastMessage(current => current === message ? null : current), duration);
  }, [duration, schedule]);
  return { toastMessage, setToastMessage, triggerToast };
}
