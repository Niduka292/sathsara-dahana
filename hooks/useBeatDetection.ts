"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ref, set } from "firebase/database";
import { getDb, LIGHTSHOW_STATE_PATH } from "@/lib/firebase";
import type { LightshowDesign, LightshowEffect, LightshowState } from "@/lib/lightshow/types";

export interface AudioInputDevice {
  deviceId: string;
  label: string;
  isLineIn: boolean;
}

interface BeatDetectionOptions {
  enabled: boolean;
  design: LightshowDesign;
  manualEnergy: number;
  manualMode: boolean;
  active: boolean;
  deviceId?: string;
  inputGain?: number;
  noiseGate?: number;
}

interface BeatDetectionResult {
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  lastEnergy: number;
  lastBassEnergy: number;
  analyserNode: AnalyserNode | null;
  sampleRate: number | null;
  devices: AudioInputDevice[];
  activeDeviceLabel: string | null;
  refreshDevices: (requestPermission?: boolean) => Promise<void>;
}

const WRITE_INTERVAL_MS = 33;
export const DEFAULT_INPUT_GAIN = 2.4;
export const DEFAULT_NOISE_GATE = 10;

const LINE_IN_KEYWORDS = [
  "line",
  "aux",
  "usb",
  "interface",
  "stereo mix",
  "loopback",
  "cable",
  "mixer",
  "scarlett",
  "behringer",
  "steinberg",
  "audient",
  "focusrite",
  "blackhole",
  "soundflower",
  "external",
  "digital",
];

function isLikelyLineIn(label: string): boolean {
  const lower = label.toLowerCase();
  return LINE_IN_KEYWORDS.some((kw) => lower.includes(kw));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function applyNoiseGate(value: number, gate: number): number {
  const clampedGate = clamp(gate, 0, 80);
  if (value <= clampedGate) {
    return 0;
  }
  return clamp(((value - clampedGate) / (100 - clampedGate)) * 100, 0, 100);
}

function computeRmsEnergy(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const normalized = (data[i] - 128) / 128;
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / data.length);
  const scaled = rms * 340;
  return clamp(Math.pow(scaled / 100, 0.75) * 100, 0, 100);
}

function computeBassEnergy(data: Uint8Array, sampleRate: number, fftSize: number): number {
  const binWidth = sampleRate / fftSize;
  const startBin = Math.floor(60 / binWidth);
  const endBin = Math.ceil(250 / binWidth);
  let sum = 0;
  let count = 0;

  for (let i = startBin; i <= endBin && i < data.length; i += 1) {
    sum += data[i];
    count += 1;
  }

  if (count === 0) {
    return 0;
  }

  return clamp((sum / count / 255) * 140, 0, 100);
}

function resolveEffect(active: boolean): LightshowEffect {
  return active ? "portal" : "idle";
}

export function useBeatDetection(options: BeatDetectionOptions): BeatDetectionResult {
  const {
    enabled,
    manualMode,
    deviceId = "",
    inputGain = DEFAULT_INPUT_GAIN,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEnergy, setLastEnergy] = useState(0);
  const [lastBassEnergy, setLastBassEnergy] = useState(0);
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [activeDeviceLabel, setActiveDeviceLabel] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  optionsRef.current = options;

  const refreshDevices = useCallback(async (requestPermission = false) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    try {
      if (requestPermission && !mediaStreamRef.current) {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach((track) => track.stop());
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter((d) => d.kind === "audioinput")
        .map((d, index) => {
          const fallbackLabel =
            d.deviceId === "default"
              ? "System Default Input"
              : `Audio Input ${index + 1}`;
          const label = d.label.trim() || fallbackLabel;
          return {
            deviceId: d.deviceId,
            label,
            isLineIn: isLikelyLineIn(label),
          };
        });

      setDevices(audioInputs);
    } catch {
      // Ignore enumeration errors until user explicitly starts live audio
    }
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;
    gainNodeRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setActiveDeviceLabel(null);
  }, []);

  const writeState = useCallback((partial: Partial<LightshowState>) => {
    const current = optionsRef.current;
    const payload: LightshowState = {
      design: current.design,
      effect: partial.effect ?? resolveEffect(current.active),
      energy: partial.energy ?? (current.manualMode ? current.manualEnergy : 0),
      bassEnergy: partial.bassEnergy ?? 0,
      beat: false,
      active: partial.active ?? current.active,
      updatedAt: Date.now(),
    };

    void set(ref(getDb(), LIGHTSHOW_STATE_PATH), payload);
  }, []);

  const analyzeFrame = useCallback(() => {
    const current = optionsRef.current;
    const analyser = analyserRef.current;
    const effect = resolveEffect(current.active);

    if (!current.active) {
      void writeState({
        active: false,
        effect: "idle",
        energy: 0,
        bassEnergy: 0,
      });
      return;
    }

    if (current.manualMode) {
      const energy = current.manualEnergy;
      const bassEnergy = clamp(energy * 0.42, 0, 100);
      void writeState({
        active: true,
        effect,
        energy,
        bassEnergy,
      });
      setLastEnergy(energy);
      setLastBassEnergy(bassEnergy);
      return;
    }

    if (!analyser) {
      void writeState({
        active: true,
        effect,
        energy: 0,
        bassEnergy: 0,
      });
      setLastEnergy(0);
      setLastBassEnergy(0);
      return;
    }

    const timeDomain = new Uint8Array(analyser.fftSize);
    const frequency = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeDomain);
    analyser.getByteFrequencyData(frequency);

    const rawEnergy = computeRmsEnergy(timeDomain);
    const rawBass = computeBassEnergy(
      frequency,
      audioContextRef.current?.sampleRate ?? 44100,
      analyser.fftSize,
    );

    const gate = current.noiseGate ?? DEFAULT_NOISE_GATE;
    const energy = applyNoiseGate(rawEnergy, gate);
    const bassEnergy = applyNoiseGate(rawBass, gate * 0.85);

    setLastEnergy(energy);
    setLastBassEnergy(bassEnergy);

    void writeState({
      active: true,
      effect,
      energy,
      bassEnergy,
    });
  }, [writeState]);

  const start = useCallback(async () => {
    setError(null);

    if (optionsRef.current.manualMode) {
      setIsListening(true);
      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(analyzeFrame, WRITE_INTERVAL_MS);
      }
      return;
    }

    try {
      const selectedDeviceId = optionsRef.current.deviceId;
      const baseConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: selectedDeviceId
            ? { ...baseConstraints, deviceId: { exact: selectedDeviceId } }
            : baseConstraints,
        });
      } catch (constraintErr) {
        // If a previously selected Line-In / USB device was unplugged, fall back to default
        if (
          selectedDeviceId &&
          constraintErr instanceof DOMException &&
          (constraintErr.name === "OverconstrainedError" ||
            constraintErr.name === "NotFoundError")
        ) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: baseConstraints,
          });
          setError(
            "Selected audio input was disconnected — fell back to default input.",
          );
        } else {
          throw constraintErr;
        }
      }

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      // High-pass filter at 35Hz to remove DC offset / handling thumps / AC hum
      const highpass = audioContext.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 35;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = optionsRef.current.inputGain ?? DEFAULT_INPUT_GAIN;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.12;

      source.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(analyser);

      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      analyserRef.current = analyser;
      mediaStreamRef.current = stream;

      const trackLabel = stream.getAudioTracks()[0]?.label || null;
      setActiveDeviceLabel(trackLabel);
      setIsListening(true);

      // Refresh device list now that browser audio permission is granted so hardware labels appear
      void refreshDevices(false);

      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(analyzeFrame, WRITE_INTERVAL_MS);
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Audio input access blocked. Allow microphone / line-in access in browser settings, then turn Manual Mode off again."
          : err instanceof Error
            ? err.message
            : "Unable to access audio input.";
      setError(message);
      stop();
    }
  }, [analyzeFrame, refreshDevices, stop]);

  // Update gain in real time without restarting the stream
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = inputGain;
    }
  }, [inputGain]);

  // Enumerate devices when enabled and listen for hot-plugged Line-In / USB interfaces
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.mediaDevices) {
      return;
    }

    void refreshDevices(false);

    const handleDeviceChange = () => {
      void refreshDevices(false);
    };

    navigator.mediaDevices.addEventListener?.("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener?.("devicechange", handleDeviceChange);
    };
  }, [enabled, refreshDevices]);

  // Restart stream when enabled, manualMode, or selected deviceId changes
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    stop();
    void start();

    return stop;
  }, [enabled, manualMode, deviceId, start, stop]);

  return {
    isListening,
    error,
    start,
    stop,
    lastEnergy,
    lastBassEnergy,
    analyserNode: analyserRef.current,
    sampleRate: audioContextRef.current?.sampleRate ?? null,
    devices,
    activeDeviceLabel,
    refreshDevices,
  };
}

export async function writeLightshowState(partial: Partial<LightshowState>) {
  await set(ref(getDb(), LIGHTSHOW_STATE_PATH), {
    design: partial.design ?? "radial",
    effect: partial.effect ?? "idle",
    energy: partial.energy ?? 0,
    bassEnergy: partial.bassEnergy ?? 0,
    beat: false,
    active: partial.active ?? false,
    updatedAt: Date.now(),
  });
}

export async function emergencyStopLightshow() {
  await set(ref(getDb(), LIGHTSHOW_STATE_PATH), {
    active: false,
    effect: "idle",
    energy: 0,
    bassEnergy: 0,
    beat: false,
    updatedAt: Date.now(),
  });
}
