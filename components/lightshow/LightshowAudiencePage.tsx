"use client";

import { useCallback, useState } from "react";
import AudienceExperience from "@/components/lightshow/AudienceExperience";
import { useAudiencePresence } from "@/hooks/useAudiencePresence";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useLightshowState } from "@/hooks/useLightshowState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWakeLock } from "@/hooks/useWakeLock";

export default function LightshowAudiencePage() {
  const hasMounted = useHasMounted();
  const { state } = useLightshowState();
  const { reducedMotion, toggleReducedMotion } = useReducedMotion();
  const [joined, setJoined] = useState(false);

  useAudiencePresence(joined);
  useWakeLock(joined);

  const handleJoin = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen?.().catch(() => undefined);
    } catch {
      // Fullscreen may require a user gesture and can fail on some browsers.
    }

    setJoined(true);
  }, []);

  if (!joined) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#030308] px-6 text-center text-white">
        <p className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-[0.45em] text-blue-300/75">
          Sathsara Dahana
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-orbitron)] text-3xl uppercase tracking-[0.18em]">
          Light Sync
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
          Turn your screen into a live part of the show — synchronized with the music in the hall.
        </p>
        {hasMounted ? (
          <button
            type="button"
            onClick={() => void handleJoin()}
            className="mt-10 rounded-full border border-blue-400/50 bg-blue-500/15 px-8 py-4 font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.35em] text-blue-100 transition hover:bg-blue-500/25 hover:shadow-[0_0_18px_rgba(59,130,246,0.35)]"
          >
            Join The Light Show
          </button>
        ) : (
          <div
            aria-hidden="true"
            className="mt-10 h-14 w-64 rounded-full border border-blue-400/25 bg-blue-500/10"
          />
        )}
        <p className="mt-6 max-w-xs text-xs leading-5 text-white/45">
          Maximize brightness after joining for the strongest effect.
        </p>
      </div>
    );
  }

  return (
    <>
      <AudienceExperience state={state} reducedMotion={reducedMotion} />
      <button
        type="button"
        onClick={toggleReducedMotion}
        className="absolute right-4 top-4 z-20 rounded-full border border-blue-900/60 bg-blue-950/70 px-3 py-2 font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-[0.2em] text-blue-100/80 transition hover:border-blue-400/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.25)]"
      >
        {reducedMotion ? "Reduced Motion On" : "Reduced Motion Off"}
      </button>
    </>
  );
}
