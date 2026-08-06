"use client";

import { useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { getDb, LIGHTSHOW_STATE_PATH } from "@/lib/firebase";
import {
  DEFAULT_LIGHTSHOW_STATE,
  normalizeDesign,
  type LightshowMeta,
  type LightshowState,
} from "@/lib/lightshow/types";

const SESSIONS_PATH = "lightshow/sessions";

function countSessionChildren(snapshot: {
  exists: () => boolean;
  numChildren?: () => number;
  forEach: (cb: () => void) => void;
}) {
  if (!snapshot.exists()) {
    return 0;
  }

  if (typeof snapshot.numChildren === "function") {
    return snapshot.numChildren();
  }

  let count = 0;
  snapshot.forEach(() => {
    count += 1;
  });
  return count;
}

function parseLightshowState(value: Record<string, unknown> | null): LightshowState {
  if (!value) {
    return DEFAULT_LIGHTSHOW_STATE;
  }

  return {
    ...DEFAULT_LIGHTSHOW_STATE,
    ...value,
    design: normalizeDesign(value.design ?? value.era),
  } as LightshowState;
}

export function useLightshowState() {
  const [state, setState] = useState<LightshowState>(DEFAULT_LIGHTSHOW_STATE);
  const [meta, setMeta] = useState<LightshowMeta>({ audienceCount: 0 });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const db = getDb();
    const stateRef = ref(db, LIGHTSHOW_STATE_PATH);
    const sessionsRef = ref(db, SESSIONS_PATH);

    const unsubscribeState = onValue(
      stateRef,
      (snapshot) => {
        setState(parseLightshowState(snapshot.val()));
        setConnected(true);
      },
      () => setConnected(false),
    );

    const unsubscribeSessions = onValue(sessionsRef, (snapshot) => {
      setMeta({
        audienceCount: countSessionChildren(snapshot),
      });
    });

    return () => {
      unsubscribeState();
      unsubscribeSessions();
    };
  }, []);

  return { state, meta, connected };
}
