export function mapAudioToVisualEnergy(energy: number, bassEnergy: number): number {
  return Math.min(100, Math.max(0, energy * 0.72 + bassEnergy * 0.48));
}

export function normalizeVisualEnergy(value: number): number {
  return Math.max(0, Math.min(100, value)) / 100;
}

export function chaseValue(
  current: number,
  target: number,
  risingFactor = 0.55,
  fallingFactor = 0.32,
): number {
  const factor = target >= current ? risingFactor : fallingFactor;
  return current + (target - current) * factor;
}

/** Direct live amplitude from mic energy + bass — no scripted shaping. */
export function liveAmplitude(smoothed: number, raw: number, bass: number): number {
  const mixed = smoothed * 0.1 + raw * 0.9;
  return Math.min(1, mixed * 0.68 + bass * 0.32);
}
