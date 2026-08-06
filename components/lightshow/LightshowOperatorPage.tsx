"use client";

import { useCallback, useState } from "react";
import AudienceExperience from "@/components/lightshow/AudienceExperience";
import BeatDetector from "@/components/lightshow/BeatDetector";
import OperatorControls from "@/components/lightshow/OperatorControls";
import {
  emergencyStopLightshow,
  writeLightshowState,
} from "@/hooks/useBeatDetection";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useLightshowState } from "@/hooks/useLightshowState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LightshowDesign } from "@/lib/lightshow/types";

const OPERATOR_PIN = process.env.NEXT_PUBLIC_OPERATOR_PIN ?? "4242";

export default function LightshowOperatorPage() {
  const hasMounted = useHasMounted();
  const { state, meta } = useLightshowState();
  const { reducedMotion } = useReducedMotion();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [design, setDesign] = useState<LightshowDesign>("radial");
  const [active, setActive] = useState(false);
  const [manualEnergy, setManualEnergy] = useState(40);
  const [manualMode, setManualMode] = useState(true);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [bassEnergy, setBassEnergy] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const handlePinSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pin === OPERATOR_PIN) {
      setAuthenticated(true);
      setPinError(null);
      return;
    }
    setPinError("Invalid operator PIN.");
  };

  const syncState = useCallback(
    async (partial: {
      design?: LightshowDesign;
      active?: boolean;
    }) => {
      const nextDesign = partial.design ?? design;
      const nextActive = partial.active ?? active;

      await writeLightshowState({
        design: nextDesign,
        active: nextActive,
        effect: nextActive ? "portal" : "idle",
        energy: manualMode ? manualEnergy : audioEnergy,
        bassEnergy,
      });
    },
    [active, audioEnergy, bassEnergy, design, manualEnergy, manualMode],
  );

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030308] px-6 text-white">
        <div className="w-full max-w-md rounded border border-white/10 bg-black/40 p-8">
          <p className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-[0.35em] text-blue-300/75">
            Show Control Access
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-orbitron)] text-2xl uppercase tracking-[0.18em]">
            Enter PIN
          </h1>

          {!hasMounted ? (
            <>
              <div
                aria-hidden="true"
                className="mt-6 h-12 rounded border border-white/15 bg-black/60"
              />
              <div
                aria-hidden="true"
                className="mt-6 h-12 rounded border border-blue-400/40 bg-blue-500/10"
              />
            </>
          ) : (
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="mt-6 w-full rounded border border-white/15 bg-black px-4 py-3 text-white outline-none"
                placeholder="Operator PIN"
                autoComplete="off"
              />
              {pinError && <p className="mt-3 text-sm text-red-300">{pinError}</p>}
              <button
                type="submit"
                className="mt-6 w-full rounded border border-blue-400/50 bg-blue-500/15 px-4 py-3 font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.28em] text-blue-100 transition hover:bg-blue-500/25 hover:shadow-[0_0_16px_rgba(59,130,246,0.3)]"
              >
                Unlock Panel
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const previewState = {
    ...state,
    design,
    active,
    energy: manualMode ? manualEnergy : audioEnergy,
    bassEnergy,
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded border border-white/10 bg-black/35 p-5">
          <OperatorControls
            design={design}
            active={active}
            manualEnergy={manualEnergy}
            manualMode={manualMode}
            audienceCount={meta.audienceCount}
            audioEnergy={audioEnergy}
            bassEnergy={bassEnergy}
            audioError={audioError}
            onDesignChange={(nextDesign) => {
              setDesign(nextDesign);
              void syncState({ design: nextDesign });
            }}
            onActiveChange={(nextActive) => {
              setActive(nextActive);
              void syncState({ active: nextActive });
            }}
            onManualEnergyChange={setManualEnergy}
            onManualModeChange={setManualMode}
            onEmergencyStop={() => {
              setActive(false);
              void emergencyStopLightshow();
            }}
          />
        </div>

        <div className="flex min-h-[70vh] flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-[0.28em] text-white/45">
              Live Preview
            </p>
            <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.2em] text-blue-200">
              {meta.audienceCount} phones live
            </p>
          </div>
          <div className="relative min-h-[520px] flex-1 overflow-hidden rounded border border-white/10 bg-black">
            <AudienceExperience
              state={previewState}
              reducedMotion={reducedMotion}
              showDesignLabel
              preview
              smooth={false}
            />
          </div>
        </div>
      </div>

      <BeatDetector
        enabled={authenticated}
        design={design}
        manualEnergy={manualEnergy}
        manualMode={manualMode}
        active={active}
        onEnergyChange={(energy, bass) => {
          setAudioEnergy(energy);
          setBassEnergy(bass);
        }}
        onError={setAudioError}
      />
    </div>
  );
}
