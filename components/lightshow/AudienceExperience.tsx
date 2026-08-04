"use client";

import { useEffect, useRef } from "react";
import MusicalVisual from "@/components/lightshow/MusicalVisual";
import ShowBackground from "@/components/lightshow/ShowBackground";
import { applyDesignCssVariables } from "@/lib/lightshow/design";
import { useSmoothedLightshowState } from "@/hooks/useSmoothedLightshowState";
import { mapAudioToVisualEnergy } from "@/lib/lightshow/visualEnergy";
import { DESIGN_PALETTES, STATE_DESIGN_TO_OPERATOR, type LightshowState } from "@/lib/lightshow/types";

interface AudienceExperienceProps {
  state: LightshowState;
  reducedMotion: boolean;
  showDesignLabel?: boolean;
  preview?: boolean;
  smooth?: boolean;
}

export default function AudienceExperience({
  state,
  reducedMotion,
  showDesignLabel = true,
  preview = false,
  smooth = true,
}: AudienceExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const smoothed = useSmoothedLightshowState(state);
  const liveState = smooth ? smoothed : state;

  const visualEnergy = mapAudioToVisualEnergy(liveState.energy, liveState.bassEnergy);
  const rawVisualEnergy = mapAudioToVisualEnergy(state.energy, state.bassEnergy);

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
            bassEnergy={liveState.bassEnergy}
            rawBassEnergy={state.bassEnergy}
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

      {!liveState.active && <div className="absolute inset-0 bg-black" aria-hidden="true" />}
    </div>
  );
}
