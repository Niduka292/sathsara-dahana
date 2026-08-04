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
  audienceCount: number;
  audioEnergy: number;
  bassEnergy: number;
  audioError: string | null;
  onDesignChange: (design: LightshowDesign) => void;
  onActiveChange: (active: boolean) => void;
  onManualEnergyChange: (value: number) => void;
  onManualModeChange: (enabled: boolean) => void;
  onEmergencyStop: () => void;
}

const DESIGN_OPTIONS: OperatorDesignLabel[] = ["Supernova", "Hex Bloom", "Plasma Veins"];

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
  audienceCount,
  audioEnergy,
  bassEnergy,
  audioError,
  onDesignChange,
  onActiveChange,
  onManualEnergyChange,
  onManualModeChange,
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

      <section className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Crowd Mode</p>
        <p className="text-[10px] leading-5 text-white/35">
          Each phone becomes a light in the dark hall. Visuals follow live audio only.
        </p>
        <div className="grid gap-2">
          {DESIGN_OPTIONS.map((label) => (
            <ControlButton
              key={label}
              active={selectedLabel === label}
              onClick={() => onDesignChange(OPERATOR_DESIGN_TO_STATE[label])}
            >
              {label}
            </ControlButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Live Control</p>
        <div className="grid grid-cols-2 gap-2">
          <ControlButton active={active} onClick={() => onActiveChange(true)}>
            Start
          </ControlButton>
          <ControlButton onClick={() => onActiveChange(false)}>Stop</ControlButton>
          <ControlButton active={manualMode} onClick={() => onManualModeChange(!manualMode)}>
            Manual Energy
          </ControlButton>
        </div>
        {!manualMode && (
          <p className="text-[10px] leading-5 text-white/45">
            Live audio uses your microphone. Brightness and motion follow volume and bass only.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/45">
          <span>Manual Energy</span>
          <span>{manualEnergy}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={manualEnergy}
          onChange={(event) => onManualEnergyChange(Number(event.target.value))}
          className="w-full accent-blue-400"
        />
      </section>

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
              {manualMode ? "Manual" : active ? "Live Audio" : "Idle"}
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
