"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useBpmBeat
 *
 * When `active` and `manualMode` are both true, fires a repeating beat pulse
 * timed to `bpm`. Returns `beatEnergy` — a number that spikes to `energy`
 * on each beat then decays exponentially back to the resting `energy` level.
 *
 * The caller should pass this value in place of (or blended with) the
 * normal manualEnergy when constructing the LightshowState for MusicalVisual,
 * so designs receive a transient amplitude spike on every beat.
 *
 * Usage:
 *   const beatEnergy = useBpmBeat({ bpm, energy: manualEnergy / 100, active, manualMode });
 *   // beatEnergy is 0–1; scale to your state shape as needed
 */

interface UseBpmBeatOptions {
  bpm: number;        // 60–180
  energy: number;     // 0–1, base amplitude set by the manual energy slider
  active: boolean;
  manualMode: boolean;
}

export function useBpmBeat({ bpm, energy, active, manualMode }: UseBpmBeatOptions): number {
  const [beatEnergy, setBeatEnergy] = useState(0);

  // Refs so the RAF loop always sees fresh values without needing to restart
  const bpmRef      = useRef(bpm);
  const energyRef   = useRef(energy);
  const activeRef   = useRef(active);
  const manualRef   = useRef(manualMode);

  bpmRef.current    = bpm;
  energyRef.current = energy;
  activeRef.current = active;
  manualRef.current = manualMode;

  useEffect(() => {
    let rafId: number;
    let lastBeatTime = performance.now();
    let currentEnergy = 0;

    // How fast the beat spike decays back to resting energy.
    // Faster BPM → faster decay so beats don't bleed into each other.
    const decayRate = () => {
      const msPerBeat = (60 / bpmRef.current) * 1000;
      // Decay to ~10% of spike within half a beat interval
      return Math.pow(0.10, 1 / (msPerBeat * 0.5 / 16.67));
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      if (!activeRef.current || !manualRef.current) {
        currentEnergy = 0;
        setBeatEnergy(0);
        lastBeatTime = now;
        return;
      }

      const msPerBeat = (60 / bpmRef.current) * 1000;
      const elapsed   = now - lastBeatTime;

      if (elapsed >= msPerBeat) {
        // Fire beat — spike to full energy (with a little headroom boost)
        currentEnergy = Math.min(1, energyRef.current * 1.25 + 0.15);
        lastBeatTime  = now - (elapsed % msPerBeat); // keep phase drift minimal
      } else {
        // Decay toward resting energy level between beats
        const dr = decayRate();
        currentEnergy = currentEnergy * dr + energyRef.current * (1 - dr);
      }

      setBeatEnergy(currentEnergy);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []); // intentionally empty — values are read via refs

  return beatEnergy;
}