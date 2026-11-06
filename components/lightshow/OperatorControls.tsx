"use client";

import type { AudioInputDevice } from "@/hooks/useBeatDetection";
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
  leftEnergy?: number;
  rightEnergy?: number;
  channelCount?: number;
  monitorAudio?: boolean;
  audioError: string | null;
  devices?: AudioInputDevice[];
  selectedDeviceId?: string;
  activeDeviceLabel?: string | null;
  inputGain?: number;
  noiseGate?: number;
  onDesignChange: (design: LightshowDesign) => void;
  onActiveChange: (active: boolean) => void;
  onManualEnergyChange: (value: number) => void;
  onManualModeChange: (enabled: boolean) => void;
  onBpmChange?: (bpm: number) => void;
  onDeviceChange?: (deviceId: string) => void;
  onRefreshDevices?: () => void;
  onInputGainChange?: (gain: number) => void;
  onNoiseGateChange?: (gate: number) => void;
  onMonitorAudioChange?: (enabled: boolean) => void;
  onEmergencyStop: () => void;
}

const DESIGN_OPTIONS: OperatorDesignLabel[] = ["Supernova", "Hex Bloom", "Plasma Veins"];

const DESIGN_DESCRIPTIONS: Record<OperatorDesignLabel, string> = {
  Supernova: "Core orb detonates shockwave rings on every beat. Debris trails fly outward.",
  "Hex Bloom": "Honeycomb grid blooms from center outward on each beat pulse.",
  "Plasma Veins": "Electric charge travels along branching veins, surging on every beat.",
};

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
  leftEnergy = 0,
  rightEnergy = 0,
  channelCount = 2,
  monitorAudio = false,
  audioError,
  devices = [],
  selectedDeviceId = "",
  activeDeviceLabel = null,
  inputGain = 2.4,
  noiseGate = 10,
  onDesignChange,
  onActiveChange,
  onManualEnergyChange,
  onManualModeChange,
  onBpmChange = () => {},
  onDeviceChange = () => {},
  onRefreshDevices = () => {},
  onInputGainChange = () => {},
  onNoiseGateChange = () => {},
  onMonitorAudioChange = () => {},
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
          <ControlButton active={!manualMode} onClick={() => onManualModeChange(false)}>
            Live Audio / Line-In
          </ControlButton>
          <ControlButton active={manualMode} onClick={() => onManualModeChange(true)}>
            Manual BPM
          </ControlButton>
        </div>
      </section>

      {/* ── Audio Input & Line-In Selector (when Live Audio mode is active) ── */}
      {!manualMode && (
        <section className="space-y-3 rounded border border-blue-900/50 bg-blue-950/20 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-200/90">
              Audio Input Source
            </p>
            <button
              type="button"
              onClick={onRefreshDevices}
              className="rounded border border-blue-400/30 bg-blue-500/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-blue-200 transition hover:border-blue-400/60 hover:bg-blue-500/20"
            >
              Scan Inputs
            </button>
          </div>

          <select
            value={selectedDeviceId}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="w-full rounded border border-white/15 bg-black/80 px-2.5 py-2 font-sans text-xs text-white outline-none focus:border-blue-400"
          >
            <option value="">System Default Audio Input</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.isLineIn ? `⚡ [Line-In / Direct] ${d.label}` : d.label}
              </option>
            ))}
          </select>

          {activeDeviceLabel && (
            <div className="flex items-center justify-between gap-2 font-sans text-[10px]">
              <span className="truncate text-emerald-300/85">
                Active: {activeDeviceLabel}
              </span>
              <span className="shrink-0 rounded border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] uppercase text-emerald-200">
                {channelCount >= 2 ? "2-Ch Stereo" : "Stereo Upmix"}
              </span>
            </div>
          )}

          {/* Stereo L / R Live Level Meters */}
          <div className="space-y-1.5 rounded border border-white/10 bg-black/40 p-2 font-sans text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-4 font-semibold text-blue-300">L</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.round(leftEnergy))}%` }}
                />
              </div>
              <span className="w-7 text-right text-white/60">{Math.round(leftEnergy)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 font-semibold text-blue-300">R</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-300 transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.round(rightEnergy))}%` }}
                />
              </div>
              <span className="w-7 text-right text-white/60">{Math.round(rightEnergy)}</span>
            </div>
          </div>

          {/* Stereo Speaker Passthrough Toggle */}
          <ControlButton
            active={monitorAudio}
            onClick={() => onMonitorAudioChange(!monitorAudio)}
          >
            {monitorAudio ? "Stereo Speaker Out: ON" : "Stereo Speaker Out: OFF"}
          </ControlButton>

          {/* Quick presets for Line-In vs Noisy Room Mic */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                onInputGainChange(1.3);
                onNoiseGateChange(5);
              }}
              className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/75 transition hover:border-blue-400/50 hover:text-white"
            >
              Line-In Preset
            </button>
            <button
              type="button"
              onClick={() => {
                onInputGainChange(2.0);
                onNoiseGateChange(22);
              }}
              className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/75 transition hover:border-blue-400/50 hover:text-white"
            >
              Noisy Venue Mic
            </button>
          </div>

          {/* Noise Gate Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-white/55">
              <span>Noise Gate (Cut Crowd Noise)</span>
              <span className="text-blue-200">{noiseGate}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={noiseGate}
              onChange={(e) => onNoiseGateChange(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
          </div>

          {/* Input Gain Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-white/55">
              <span>Input Gain (Sensitivity)</span>
              <span className="text-blue-200">{inputGain.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={5.0}
              step={0.1}
              value={inputGain}
              onChange={(e) => onInputGainChange(Number(e.target.value))}
              className="w-full accent-blue-400"
            />
          </div>
        </section>
      )}

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
              {manualMode ? `Manual · ${bpm} BPM` : active ? "Live Stereo" : "Idle"}
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
