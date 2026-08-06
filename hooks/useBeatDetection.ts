"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ref, set } from "firebase/database";
import { getDb, LIGHTSHOW_STATE_PATH } from "@/lib/firebase";
import type { LightshowDesign, LightshowEffect, LightshowState } from "@/lib/lightshow/types";

interface BeatDetectionOptions {
  enabled: boolean;
  design: LightshowDesign;
  manualEnergy: number;
  manualMode: boolean;
  active: boolean;
}

interface BeatDetectionResult {
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  lastEnergy: number;
  lastBassEnergy: number;
}

const WRITE_INTERVAL_MS = 33;
const MIC_GAIN = 3.4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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
  const { enabled, manualEnergy, manualMode, active } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEnergy, setLastEnergy] = useState(0);
  const [lastBassEnergy, setLastBassEnergy] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  optionsRef.current = options;

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

    const energy = computeRmsEnergy(timeDomain);
    const bassEnergy = computeBassEnergy(
      frequency,
      audioContextRef.current?.sampleRate ?? 44100,
      analyser.fftSize,
    );

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = MIC_GAIN;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.12;
      source.connect(gainNode);
      gainNode.connect(analyser);

      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      analyserRef.current = analyser;
      mediaStreamRef.current = stream;
      setIsListening(true);

      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(analyzeFrame, WRITE_INTERVAL_MS);
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access blocked. Allow the mic for this site in browser settings, then turn Manual Energy off again."
          : err instanceof Error
            ? err.message
            : "Unable to access audio input.";
      setError(message);
      stop();
    }
  }, [analyzeFrame, stop]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    stop();
    void start();

    return stop;
  }, [enabled, manualMode, start, stop]);

  return {
    isListening,
    error,
    start,
    stop,
    lastEnergy,
    lastBassEnergy,
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
