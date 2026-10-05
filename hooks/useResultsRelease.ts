"use client";

import { useEffect, useState } from "react";
import { areResultsReleased, getResultsCountdown, RESULTS_RELEASE_TIME } from "@/src/lib/resultsRelease";

export function useResultsRelease(initialNow: number | null = null) {
  // Stable initial markup also works on the statically rendered homepage.
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 1000);
    // Do not wait for the next interval tick at the release boundary.
    const remaining = RESULTS_RELEASE_TIME.getTime() - Date.now();
    const releaseTimer = remaining > 0 && remaining <= 2147483647
      ? window.setTimeout(update, remaining)
      : undefined;
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(releaseTimer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return {
    released: now !== null && areResultsReleased(now),
    countdown: now === null ? null : getResultsCountdown(now),
  };
}
