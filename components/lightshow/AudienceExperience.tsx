"use client";

import { useEffect, useRef } from "react";
import MusicalVisual from "@/components/lightshow/MusicalVisual";
import ShowBackground from "@/components/lightshow/ShowBackground";
import { applyDesignCssVariables } from "@/lib/lightshow/design";
import { useSmoothedLightshowState } from "@/hooks/useSmoothedLightshowState";
import { mapAudioToVisualEnergy } from "@/lib/lightshow/visualEnergy";
import { useBpmBeat } from "@/hooks/Usebpmbeat";
import {
  DESIGN_PALETTES,
  STATE_DESIGN_TO_OPERATOR,
  type LightshowState,
} from "@/lib/lightshow/types";

interface AudienceExperienceProps {
  state: LightshowState;
  reducedMotion: boolean;
  showDesignLabel?: boolean;
  preview?: boolean;
  smooth?: boolean;
  // BPM & manual mode — forwarded from operator / parent page state
  bpm?: number;          // 60–180, defaults to 120
  manualMode?: boolean;
  manualEnergy?: number; // 0–100
  // Pitch — supplied by BeatDetector when available
  pitchClass?: number;   // 0–11; -1 = none
  pitchHeight?: number;  // 0–1
}

export default function AudienceExperience({
  state,
  reducedMotion,
  showDesignLabel = true,
  preview = false,
  smooth = true,
  bpm = 120,
  manualMode = false,
  manualEnergy = 50,
  pitchClass = -1,
  pitchHeight = 0.5,
}: AudienceExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const smoothed  = useSmoothedLightshowState(state);
  const liveState = smooth ? smoothed : state;

  // ── BPM beat signal ──────────────────────────────────────────────────────
  // In manual mode the BPM hook fires a timed amplitude spike on every beat.
  // The spike value replaces the static manualEnergy so every design pulses
  // to the tempo set on the operator controller.
  const beatEnergy = useBpmBeat({
    bpm,
    energy: manualEnergy / 100,   // normalise 0–100 → 0–1
    active: liveState.active,
    manualMode,
  });

  // ── Energy routing ───────────────────────────────────────────────────────
  // When in manual mode: use beat-driven energy for both visual channels.
  // When in live audio mode: use the normal audio-derived energy.
  const baseEnergy = manualMode
    ? beatEnergy * 100                       // beatEnergy is 0–1; state energy is 0–100
    : liveState.energy;

  const baseBass = manualMode
    ? beatEnergy * 80                        // bass slightly lower than full energy
    : liveState.bassEnergy;

  const visualEnergy    = mapAudioToVisualEnergy(baseEnergy,       baseBass);
  const rawVisualEnergy = mapAudioToVisualEnergy(state.energy,     state.bassEnergy);

  // Raw values for MusicalVisual's internal smoothing
  const rawBassEnergy = manualMode ? beatEnergy * 80 : state.bassEnergy;

  // ── Design CSS variables ─────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      applyDesignCssVariables(container, DESIGN_PALETTES[liveState.design]);
    }
  }, [liveState.design]);

  const labelGlow =
    liveState.design === "radial"
      ? "0 0 18px rgba(157, 78, 221, 0.65)"
      : liveState.design === "grid"
        ? "0 0 18px rgba(255, 96, 16, 0.55)"
        : "0 0 18px rgba(29, 158, 117, 0.55)";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${
        preview ? "h-full w-full" : "fixed inset-0 h-[100dvh] w-full"
      }`}
      style={{ touchAction: "none", backgroundColor: "#000000" }}
    >
      <ShowBackground
        design={liveState.design}
        energy={visualEnergy}
        reducedMotion={reducedMotion}
        active={liveState.active}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          <MusicalVisual
            design={liveState.design}
            energy={visualEnergy}
            rawEnergy={rawVisualEnergy}
            bassEnergy={baseBass}
            rawBassEnergy={rawBassEnergy}
            pitchClass={pitchClass}
            pitchHeight={pitchHeight}
            active={liveState.active}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      {showDesignLabel && liveState.active && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-6">
          <p
            className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.45em] text-white/70"
            style={{ textShadow: labelGlow }}
          >
            {STATE_DESIGN_TO_OPERATOR[liveState.design]}
          </p>
        </div>
      )}

      {!liveState.active && (
        <div className="absolute inset-0 bg-black" aria-hidden="true" />
      )}
    </div>
  );
}