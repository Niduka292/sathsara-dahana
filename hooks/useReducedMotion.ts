"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "lightshow-reduced-motion";

function getSystemReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getStoredPreference(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return null;
  }
  return stored === "true";
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const stored = getStoredPreference();
    setReducedMotion(stored ?? getSystemReducedMotion());

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      if (getStoredPreference() === null) {
        setReducedMotion(media.matches);
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { reducedMotion, toggleReducedMotion };
}
