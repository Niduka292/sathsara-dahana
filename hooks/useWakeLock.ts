"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignore release errors when the lock is already gone.
      }
      wakeLockRef.current = null;
      setActive(false);
    }
  }, []);

  const request = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      setError("Wake Lock is not supported on this device.");
      return false;
    }

    try {
      await release();
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setActive(true);
      setError(null);

      wakeLockRef.current.addEventListener("release", () => {
        setActive(false);
        wakeLockRef.current = null;
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to activate wake lock.");
      setActive(false);
      return false;
    }
  }, [release]);

  useEffect(() => {
    if (!enabled) {
      void release();
      return;
    }

    void request();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && enabled) {
        void request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void release();
    };
  }, [enabled, release, request]);

  return { active, error, request, release };
}
