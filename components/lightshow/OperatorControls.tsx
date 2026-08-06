"use client";

import {
  OPERATOR_DESIGN_TO_STATE,
  STATE_DESIGN_TO_OPERATOR,
  type LightshowDesign,
  type OperatorDesignLabel,
} from "@/lib/lightshow/types";

interface OperatorControlsProps {
  design: LightshowDesign;
  active: boolean;
  manualEnergy: number;
  manualMode: boolean;
  bpm: number;
  audienceCount: number;
  audioEnergy: number;
  bassEnergy: number;
  audioError: string | null;
  onDesignChange: (design: LightshowDesign) => void;
  onActiveChange: (active: boolean) => void;
  onManualEnergyChange: (value: number) => void;
  onManualModeChange: (enabled: boolean) => void;
  onBpmChange?: (bpm: number) => void;
  onEmergencyStop: () => void;
}

const DESIGN_OPTIONS: OperatorDesignLabel[] = ["Supernova", "Hex Bloom", "Plasma Veins"];

// Visual description shown per design so the operator knows what to expect
const DESIGN_DESCRIPTIONS: Record<OperatorDesignLabel, string> = {
  Supernova: "Core orb detonates shockwave rings on every beat. Debris trails fly outward.",
  "Hex Bloom": "Honeycomb grid blooms from center outward on each beat pulse.",
  "Plasma Veins": "Electric charge travels along branching veins, surging on every beat.",
};

// BPM tempo label shown alongside the value
function bpmLabel(bpm: number): string {
  if (bpm < 70)  return "Ambient";
  if (bpm < 90)  return "Slow";
  if (bpm < 110) return "Moderate";
  if (bpm < 130) return "Energetic";
  if (bpm < 150) return "Fast";
  return "Intense";
}

function ControlButton({
  children,
  onClick,
  active = false,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        danger
          ? "border-red-500/60 bg-red-950/40 text-red-200 hover:bg-red-900/50"
          : active
            ? "border-blue-400/80 bg-blue-500/20 text-blue-100 shadow-[0_0_14px_rgba(59,130,246,0.35)]"
            : "border-blue-950/70 bg-blue-950/50 text-blue-200/90 hover:border-blue-400/50 hover:bg-blue-900/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.22)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function OperatorControls({
  design,
  active,
  manualEnergy,
  manualMode,
  bpm,
  audienceCount,
  audioEnergy,
  bassEnergy,
  audioError,
  onDesignChange,
  onActiveChange,
  onManualEnergyChange,
  onManualModeChange,
  onBpmChange = () => {},
  onEmergencyStop,
}: OperatorControlsProps) {
  const selectedLabel = STATE_DESIGN_TO_OPERATOR[design];

  return (
    <div className="flex h-full flex-col gap-6 font-[family-name:var(--font-orbitron)] text-white">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-blue-300/75">
          Light Show Sync
        </p>
        <h1 className="mt-2 text-2xl uppercase tracking-[0.18em] text-white">
          Show Control
        </h1>
      </div>

      {/* ── Design selection ─────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Visual Design</p>
        <div className="grid gap-2">
          {DESIGN_OPTIONS.map((label) => (
            <div key={label} className="space-y-1">
              <ControlButton
                active={selectedLabel === label}
                onClick={() => onDesignChange(OPERATOR_DESIGN_TO_STATE[label])}
              >
                {label}
              </ControlButton>
              {selectedLabel === label && (
                <p className="pl-1 text-[9px] leading-4 text-white/30">
                  {DESIGN_DESCRIPTIONS[label]}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── BPM control ──────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em]">
          <span className="text-white/45">BPM</span>
          <span className="flex items-baseline gap-2">
            <span className="text-lg text-blue-200">{bpm}</span>
            <span className="text-[9px] text-white/30">{bpmLabel(bpm)}</span>
          </span>
        </div>
        <input
          type="range"
          min={60}
          max={180}
          step={1}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
        {/* Tick marks at common BPM anchors */}
        <div className="flex justify-between text-[8px] text-white/20">
          <span>60</span>
          <span>90</span>
          <span>120</span>
          <span>150</span>
          <span>180</span>
        </div>
        <p className="text-[9px] leading-4 text-white/30">
          {manualMode
            ? "BPM drives beat pulses in the selected design."
            : "BPM is used when manual mode is active."}
        </p>
      </section>

      {/* ── Live control ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Live Control</p>
        <div className="grid grid-cols-2 gap-2">
          <ControlButton active={active} onClick={() => onActiveChange(true)}>
            Start
          </ControlButton>
          <ControlButton onClick={() => onActiveChange(false)}>Stop</ControlButton>
          <ControlButton active={manualMode} onClick={() => onManualModeChange(!manualMode)}>
            Manual Mode
          </ControlButton>
        </div>
        {!manualMode && (
          <p className="text-[10px] leading-5 text-white/45">
            Live audio uses your microphone. Brightness and motion follow volume and bass.
          </p>
        )}
      </section>

      {/* ── Manual energy slider (only in manual mode) ───────────── */}
      {manualMode && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/45">
            <span>Energy</span>
            <span>{manualEnergy}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={manualEnergy}
            onChange={(e) => onManualEnergyChange(Number(e.target.value))}
            className="w-full accent-blue-400"
          />
        </section>
      )}

      {/* ── Status readout ───────────────────────────────────────── */}
      <section className="rounded border border-white/10 bg-black/30 p-4 text-xs text-white/70">
        <div className="grid grid-cols-2 gap-3 uppercase tracking-[0.16em]">
          <div>
            <p className="text-white/40">Audience</p>
            <p className="mt-1 text-lg text-blue-200">{audienceCount}</p>
          </div>
          <div>
            <p className="text-white/40">Energy</p>
            <p className="mt-1 text-lg text-blue-200">{Math.round(audioEnergy)}</p>
          </div>
          <div>
            <p className="text-white/40">Bass</p>
            <p className="mt-1 text-lg text-blue-200">{Math.round(bassEnergy)}</p>
          </div>
          <div>
            <p className="text-white/40">Mode</p>
            <p className="mt-1 text-sm text-blue-200">
              {manualMode ? `Manual · ${bpm} BPM` : active ? "Live Audio" : "Idle"}
            </p>
          </div>
        </div>
        {audioError && <p className="mt-3 text-red-300">{audioError}</p>}
      </section>

      <div className="mt-auto">
        <ControlButton danger onClick={onEmergencyStop}>
          Emergency Override
        </ControlButton>
      </div>
    </div>
  );
}