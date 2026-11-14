const A4_HZ = 440;
const A4_MIDI = 69;
const MIN_HZ = 80;   // ignore sub-bass rumble
const MAX_HZ = 4000; // ignore extreme highs that fool HPS

export function hzToMidi(hz: number): number {
  return A4_MIDI + 12 * Math.log2(hz / A4_HZ);
}

export function estimatePitch(
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
    if (hps[i] > peakVal) {
      peakVal = hps[i];
      peakBin = i;
    }
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
