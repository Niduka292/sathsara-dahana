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
  monitorAudio?: boolean;
}

interface BeatDetectionResult {
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  lastEnergy: number;
  lastBassEnergy: number;
  lastLeftEnergy: number;
  lastRightEnergy: number;
  channelCount: number;
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
    monitorAudio = false,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEnergy, setLastEnergy] = useState(0);
  const [lastBassEnergy, setLastBassEnergy] = useState(0);
  const [lastLeftEnergy, setLastLeftEnergy] = useState(0);
  const [lastRightEnergy, setLastRightEnergy] = useState(0);
  const [channelCount, setChannelCount] = useState(2);
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [activeDeviceLabel, setActiveDeviceLabel] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);
  const rightUpmixGainRef = useRef<GainNode | null>(null);
  const rightDirectGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const leftAnalyserRef = useRef<AnalyserNode | null>(null);
  const rightAnalyserRef = useRef<AnalyserNode | null>(null);
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
        const tempStream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: { ideal: 2 } },
        });
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
    monitorGainRef.current = null;
    rightUpmixGainRef.current = null;
    rightDirectGainRef.current = null;
    analyserRef.current = null;
    leftAnalyserRef.current = null;
    rightAnalyserRef.current = null;
    setIsListening(false);
    setActiveDeviceLabel(null);
  }, []);

  const writeState = useCallback((partial: Partial<LightshowState>) => {
    const current = optionsRef.current;
    const fallbackEnergy = current.manualMode ? current.manualEnergy : 0;
    const energy = partial.energy ?? fallbackEnergy;
    const payload: LightshowState = {
      design: current.design,
      effect: partial.effect ?? resolveEffect(current.active),
      energy,
      bassEnergy: partial.bassEnergy ?? 0,
      leftEnergy: partial.leftEnergy ?? energy,
      rightEnergy: partial.rightEnergy ?? energy,
      stereoChannels: partial.stereoChannels ?? 2,
      beat: false,
      active: partial.active ?? current.active,
      updatedAt: Date.now(),
    };

    void set(ref(getDb(), LIGHTSHOW_STATE_PATH), payload);
  }, []);

  const analyzeFrame = useCallback(() => {
    const current = optionsRef.current;
    const leftAnalyser = leftAnalyserRef.current;
    const rightAnalyser = rightAnalyserRef.current;
    const effect = resolveEffect(current.active);

    if (!current.active) {
      void writeState({
        active: false,
        effect: "idle",
        energy: 0,
        bassEnergy: 0,
        leftEnergy: 0,
        rightEnergy: 0,
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
        leftEnergy: energy,
        rightEnergy: energy,
        stereoChannels: 2,
      });
      setLastEnergy(energy);
      setLastBassEnergy(bassEnergy);
      setLastLeftEnergy(energy);
      setLastRightEnergy(energy);
      return;
    }

    if (!leftAnalyser || !rightAnalyser) {
      void writeState({
        active: true,
        effect,
        energy: 0,
        bassEnergy: 0,
        leftEnergy: 0,
        rightEnergy: 0,
      });
      setLastEnergy(0);
      setLastBassEnergy(0);
      setLastLeftEnergy(0);
      setLastRightEnergy(0);
      return;
    }

    const leftTime = new Uint8Array(leftAnalyser.fftSize);
    const rightTime = new Uint8Array(rightAnalyser.fftSize);
    const leftFreq = new Uint8Array(leftAnalyser.frequencyBinCount);
    const rightFreq = new Uint8Array(rightAnalyser.frequencyBinCount);

    leftAnalyser.getByteTimeDomainData(leftTime);
    rightAnalyser.getByteTimeDomainData(rightTime);
    leftAnalyser.getByteFrequencyData(leftFreq);
    rightAnalyser.getByteFrequencyData(rightFreq);

    const sr = audioContextRef.current?.sampleRate ?? 44100;
    const rawLeftEnergy = computeRmsEnergy(leftTime);
    const rawRightEnergy = computeRmsEnergy(rightTime);
    const rawLeftBass = computeBassEnergy(leftFreq, sr, leftAnalyser.fftSize);
    const rawRightBass = computeBassEnergy(rightFreq, sr, rightAnalyser.fftSize);

    // If the hardware jack only supplies a 1-channel signal on Left (Right is dead/silent),
    // automatically mirror Left -> Right so stereo transmission & stereo monitor output work on both sides.
    const isSingleChannelHardware = rawLeftEnergy > 1.5 && rawRightEnergy < 0.4;
    if (rightUpmixGainRef.current && rightDirectGainRef.current) {
      rightUpmixGainRef.current.gain.value = isSingleChannelHardware ? 1 : 0;
      rightDirectGainRef.current.gain.value = isSingleChannelHardware ? 0 : 1;
    }

    const effectiveRawRight = isSingleChannelHardware ? rawLeftEnergy : rawRightEnergy;
    const effectiveRawRightBass = isSingleChannelHardware ? rawLeftBass : rawRightBass;

    const gate = current.noiseGate ?? DEFAULT_NOISE_GATE;
    const leftEnergy = applyNoiseGate(rawLeftEnergy, gate);
    const rightEnergy = applyNoiseGate(effectiveRawRight, gate);

    // Measure stereo energy without L+R waveform phase cancellation
    const combinedRawEnergy = Math.max(
      leftEnergy,
      rightEnergy,
      (leftEnergy + rightEnergy) * 0.55,
    );
    const energy = clamp(combinedRawEnergy, 0, 100);

    const leftBass = applyNoiseGate(rawLeftBass, gate * 0.85);
    const rightBass = applyNoiseGate(effectiveRawRightBass, gate * 0.85);
    const bassEnergy = clamp(Math.max(leftBass, rightBass), 0, 100);

    setLastEnergy(energy);
    setLastBassEnergy(bassEnergy);
    setLastLeftEnergy(leftEnergy);
    setLastRightEnergy(rightEnergy);

    void writeState({
      active: true,
      effect,
      energy,
      bassEnergy,
      leftEnergy,
      rightEnergy,
      stereoChannels: 2,
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
      // Request 2-channel stereo explicitly so browser does not downmix AUX to mono
      const baseConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: 2 },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: selectedDeviceId
            ? { ...baseConstraints, deviceId: { exact: selectedDeviceId } }
            : baseConstraints,
        });
      } catch (constraintErr) {
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

      const audioTrack = stream.getAudioTracks()[0];
      const trackSettings = audioTrack?.getSettings?.();
      const detectedChannels = trackSettings?.channelCount ?? 2;
      setChannelCount(detectedChannels);

      const audioContext = new AudioContext();
      if (audioContext.destination.maxChannelCount >= 2) {
        audioContext.destination.channelCount = 2;
        audioContext.destination.channelCountMode = "explicit";
      }

      const source = audioContext.createMediaStreamSource(stream);
      source.channelCount = 2;
      source.channelCountMode = "max";

      // High-pass filter at 35Hz to remove DC offset / stage thumps / AC hum while keeping stereo
      const highpass = audioContext.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 35;
      highpass.channelCount = 2;
      highpass.channelCountMode = "max";

      const gainNode = audioContext.createGain();
      gainNode.gain.value = optionsRef.current.inputGain ?? DEFAULT_INPUT_GAIN;
      gainNode.channelCount = 2;
      gainNode.channelCountMode = "max";

      // Split into Left (0) and Right (1) channels so stereo L & R are analyzed independently
      // (This also prevents L+R phase cancellation on AUX cables!)
      const splitter = audioContext.createChannelSplitter(2);

      const leftAnalyser = audioContext.createAnalyser();
      leftAnalyser.fftSize = 2048;
      leftAnalyser.smoothingTimeConstant = 0.12;

      const rightAnalyser = audioContext.createAnalyser();
      rightAnalyser.fftSize = 2048;
      rightAnalyser.smoothingTimeConstant = 0.12;

      source.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(splitter);

      splitter.connect(leftAnalyser, 0);
      splitter.connect(rightAnalyser, 1);

      // Stereo merger for optional stereo audio monitoring/output passthrough
      // If the hardware jack only captures channel 0 (mono jack), rightUpmixGain duplicates L -> R
      // so the transmitted audio output plays in full stereo on both speakers.
      const merger = audioContext.createChannelMerger(2);
      const rightDirectGain = audioContext.createGain();
      rightDirectGain.gain.value = detectedChannels === 1 ? 0 : 1;
      const rightUpmixGain = audioContext.createGain();
      rightUpmixGain.gain.value = detectedChannels === 1 ? 1 : 0;

      splitter.connect(merger, 0, 0); // Left -> Left output
      splitter.connect(rightDirectGain, 1);
      rightDirectGain.connect(merger, 0, 1); // Right -> Right output (when true stereo)
      splitter.connect(rightUpmixGain, 0);
      rightUpmixGain.connect(merger, 0, 1); // Left -> Right output (when 1-ch jack)

      const monitorGain = audioContext.createGain();
      monitorGain.gain.value = optionsRef.current.monitorAudio ? 1 : 0;
      merger.connect(monitorGain);
      monitorGain.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      monitorGainRef.current = monitorGain;
      rightUpmixGainRef.current = rightUpmixGain;
      rightDirectGainRef.current = rightDirectGain;
      analyserRef.current = leftAnalyser;
      leftAnalyserRef.current = leftAnalyser;
      rightAnalyserRef.current = rightAnalyser;
      mediaStreamRef.current = stream;

      const trackLabel = audioTrack?.label || null;
      setActiveDeviceLabel(trackLabel);
      setIsListening(true);

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

  // Update stereo monitor passthrough in real time
  useEffect(() => {
    if (monitorGainRef.current) {
      monitorGainRef.current.gain.value = monitorAudio ? 1 : 0;
    }
  }, [monitorAudio]);

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
    lastLeftEnergy,
    lastRightEnergy,
    channelCount,
    analyserNode: analyserRef.current,
    sampleRate: audioContextRef.current?.sampleRate ?? null,
    devices,
    activeDeviceLabel,
    refreshDevices,
  };
}

export async function writeLightshowState(partial: Partial<LightshowState>) {
  const energy = partial.energy ?? 0;
  await set(ref(getDb(), LIGHTSHOW_STATE_PATH), {
    design: partial.design ?? "radial",
    effect: partial.effect ?? "idle",
    energy,
    bassEnergy: partial.bassEnergy ?? 0,
    leftEnergy: partial.leftEnergy ?? energy,
    rightEnergy: partial.rightEnergy ?? energy,
    stereoChannels: partial.stereoChannels ?? 2,
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
    leftEnergy: 0,
    rightEnergy: 0,
    stereoChannels: 2,
    beat: false,
    updatedAt: Date.now(),
  });
}
