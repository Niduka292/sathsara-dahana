"use client";

import { useEffect, useRef } from "react";
import { useBeatDetection } from "@/hooks/useBeatDetection";
import type { LightshowDesign } from "@/lib/lightshow/types";

interface BeatDetectorProps {
  enabled: boolean;
  design: LightshowDesign;
  manualEnergy: number;
  manualMode: boolean;
  active: boolean;
  onEnergyChange?: (
    energy: number,
    bassEnergy: number,
    pitchClass: number,   // 0–11  (C=0 … B=11); -1 when no pitch detected
    pitchHeight: number,  // 0–1   (low → high), smoothed
  ) => void;
  onError?: (message: string | null) => void;
}

// ── Lightweight pitch estimator ───────────────────────────────────────────────
//
// Uses the HPS (Harmonic Product Spectrum) algorithm on the existing
// AnalyserNode frequency data already provided by useBeatDetection.
// No extra microphone permission is needed — we reuse the same audio graph.
//
// Steps:
//  1. Find the dominant frequency bin via HPS (downsamples & multiplies spectrum).
//  2. Convert bin index → Hz using sampleRate and fftSize.
//  3. Convert Hz → MIDI note number → pitch class (0–11).
//  4. Smooth pitchHeight with an exponential moving average so visuals don't
//     flicker on every frame.

const A4_HZ = 440;
const A4_MIDI = 69;
const MIN_HZ = 80;   // ignore sub-bass rumble
const MAX_HZ = 4000; // ignore extreme highs that fool HPS

function hzToMidi(hz: number): number {
  return A4_MIDI + 12 * Math.log2(hz / A4_HZ);
}

function estimatePitch(
  frequencyData: Uint8Array,
  sampleRate: number,
  fftSize: number,
): { pitchClass: number; pitchHeight: number } | null {
  const binCount = frequencyData.length; // = fftSize / 2
  const binHz = sampleRate / fftSize;

  const minBin = Math.max(1, Math.floor(MIN_HZ / binHz));
  const maxBin = Math.min(binCount - 1, Math.floor(MAX_HZ / binHz));

  // Convert Uint8 magnitude → linear power
  const power = new Float32Array(binCount);
  for (let i = minBin; i <= maxBin; i++) {
    power[i] = frequencyData[i] / 255;
  }

  // HPS: multiply spectrum with downsampled copies (3 harmonics)
  const HPS_HARMONICS = 3;
  const hps = new Float32Array(binCount);
  for (let i = minBin; i <= maxBin; i++) {
    hps[i] = power[i];
    for (let h = 2; h <= HPS_HARMONICS; h++) {
      const hBin = Math.round(i * h);
      if (hBin < binCount) hps[i] *= power[hBin];
    }
  }

  // Find peak
  let peakBin = minBin;
  let peakVal = 0;
  for (let i = minBin; i <= maxBin; i++) {
    if (hps[i] > peakVal) { peakVal = hps[i]; peakBin = i; }
  }

  // Reject if signal is too weak (silence / noise floor)
  if (peakVal < 0.002) return null;

  const hz = peakBin * binHz;
  const midi = hzToMidi(hz);
  if (midi < 0 || midi > 127) return null;

  const pitchClass = Math.round(midi) % 12;
  // pitchHeight: MIDI 36 (C2) → 0, MIDI 96 (C7) → 1
  const pitchHeight = Math.min(1, Math.max(0, (midi - 36) / 60));

  return { pitchClass, pitchHeight };
}

export default function BeatDetector({
  enabled,
  design,
  manualEnergy,
  manualMode,
  active,
  onEnergyChange,
  onError,
}: BeatDetectorProps) {
  const { lastEnergy, lastBassEnergy, error, analyserNode, sampleRate } =
    useBeatDetection({
      enabled,
      design,
      manualEnergy,
      manualMode,
      active,
    });

  // Smoothed pitch state lives in a ref so it doesn't trigger re-renders
  const pitchRef = useRef({ pitchClass: -1, pitchHeight: 0.5 });
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // ── Pitch polling loop ──────────────────────────────────────────────────────
  // We poll the analyser at ~30 fps independently of the energy callbacks to
  // keep pitch smooth without flooding the parent with state updates.
  useEffect(() => {
    if (!analyserNode || !sampleRate) return;

    const fftSize = analyserNode.fftSize;
    const binCount = analyserNode.frequencyBinCount;
    freqDataRef.current = new Uint8Array(binCount) as Uint8Array<ArrayBuffer>;

    let rafId: number;
    let lastDispatch = 0;
    const DISPATCH_INTERVAL_MS = 33; // ~30 fps pitch updates

    const SMOOTH_UP   = 0.25; // how fast pitchHeight rises
    const SMOOTH_DOWN = 0.10; // how fast it falls (slower = trails nicely)

    const poll = (ts: number) => {
      rafId = requestAnimationFrame(poll);
      if (!freqDataRef.current || !active) return;

      analyserNode.getByteFrequencyData(freqDataRef.current);
      const result = estimatePitch(freqDataRef.current, sampleRate, fftSize);

      if (result) {
        // Smooth pitchHeight exponentially
        const prev = pitchRef.current.pitchHeight;
        const alpha = result.pitchHeight > prev ? SMOOTH_UP : SMOOTH_DOWN;
        pitchRef.current = {
          pitchClass: result.pitchClass,
          pitchHeight: prev + (result.pitchHeight - prev) * alpha,
        };
      } else {
        // Decay toward centre when no pitch detected
        pitchRef.current = {
          pitchClass: pitchRef.current.pitchClass,
          pitchHeight: pitchRef.current.pitchHeight * 0.95,
        };
      }

      // Throttle dispatch so parent re-renders stay cheap
      if (ts - lastDispatch >= DISPATCH_INTERVAL_MS) {
        lastDispatch = ts;
        onEnergyChange?.(
          lastEnergy,
          lastBassEnergy,
          pitchRef.current.pitchClass,
          pitchRef.current.pitchHeight,
        );
      }
    };

    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [analyserNode, sampleRate, active, lastEnergy, lastBassEnergy, onEnergyChange]);

  // ── Fallback: fire energy callback even when analyser isn't available ───────
  // (manualMode, SSR, or hook version that doesn't expose analyserNode)
  useEffect(() => {
    if (analyserNode) return; // handled above
    onEnergyChange?.(
      lastEnergy,
      lastBassEnergy,
      pitchRef.current.pitchClass,
      pitchRef.current.pitchHeight,
    );
  }, [lastEnergy, lastBassEnergy, analyserNode, onEnergyChange]);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  return null;
}