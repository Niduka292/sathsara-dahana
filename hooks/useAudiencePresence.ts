"use client";

import { useEffect, useRef } from "react";
import { onDisconnect, onValue, push, ref, remove, set } from "firebase/database";
import { getDb } from "@/lib/firebase";

const SESSIONS_PATH = "lightshow/sessions";

export function useAudiencePresence(enabled: boolean) {
  const sessionRef = useRef<ReturnType<typeof ref> | null>(null);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const db = getDb();
    sessionRef.current = push(ref(db, SESSIONS_PATH));
    const connectedRef = ref(db, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() !== true || registeredRef.current || !sessionRef.current) {
        return;
      }

      registeredRef.current = true;

      void set(sessionRef.current, {
        joinedAt: Date.now(),
      });

      onDisconnect(sessionRef.current).remove();
    });

    return () => {
      unsubscribe();
      registeredRef.current = false;

      if (sessionRef.current) {
        void remove(sessionRef.current).catch(() => undefined);
        sessionRef.current = null;
      }
    };
  }, [enabled]);
}
