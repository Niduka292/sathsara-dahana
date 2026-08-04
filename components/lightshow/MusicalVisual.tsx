"use client";

import { useEffect, useRef } from "react";
import {
  chaseValue,
  liveAmplitude,
  normalizeVisualEnergy,
} from "@/lib/lightshow/visualEnergy";
import type { LightshowDesign } from "@/lib/lightshow/types";

interface MusicalVisualProps {
  design: LightshowDesign;
  energy: number;
  rawEnergy: number;
  bassEnergy: number;
  rawBassEnergy: number;
  pitchClass: number;   // 0–11 (C=0 … B=11); -1 = none
  pitchHeight: number;  // 0–1  (low → high), pre-smoothed by BeatDetector
  active: boolean;
  reducedMotion: boolean;
}

interface VeinNode {
  x: number;
  y: number;
  children: number[];
  depth: number;
  armIndex: number;
}

interface HexCell {
  cx: number;
  cy: number;
  distFromCenter: number;
}

// ── Supernova types ───────────────────────────────────────────────────────────

interface Shockwave {
  radius: number;       // current radius in px
  maxRadius: number;    // screen diagonal — ring fades as it approaches this
  speed: number;        // px per frame at 60fps
  birthAmp: number;     // amplitude snapshot at spawn → drives thickness & color
  opacity: number;
}

interface Debris {
  angle: number;        // launch angle (radians)
  speed: number;        // px/frame
  radius: number;       // current distance from center
  size: number;         // dot radius
  decay: number;        // opacity multiplier per frame
  opacity: number;
  colorT: number;       // 0–1 position in nova color ramp
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 1 — Supernova
//
// Anatomy:
//   • A breathing core orb at screen center. At rest it pulses slowly.
//   • On each amplitude spike a Shockwave is born: an expanding ring that
//     travels to the screen edge then dies. Multiple rings can coexist.
//   • Each detonation also spawns a burst of Debris: tiny dots that fly
//     outward and fade, like stellar ejecta.
//   • pitchHeight shifts the color temperature of everything:
//       low  → deep red-orange (cool star)
//       mid  → white-yellow (main sequence)
//       high → blue-white (hot O-type)
// ─────────────────────────────────────────────────────────────────────────────

/** Nova color ramp: pitchHeight 0→1 × intensity 0→1 → rgba string */
function novaColor(pitchH: number, intensity: number, alpha: number): string {
  // Guard every input against NaN / out-of-range values that arrive during
  // the first few frames before smoothing has initialised.
  const pH = clamp(Number.isFinite(pitchH)   ? pitchH   : 0.5, 0, 1);
  const iv = clamp(Number.isFinite(intensity) ? intensity : 0,   0, 1);
  const al = clamp(Number.isFinite(alpha)     ? alpha     : 0,   0, 1);

  let r: number, g: number, b: number;

  if (pH < 0.5) {
    const t = pH / 0.5;
    // red-orange → yellow-white
    r = 255;
    g = Math.round(lerp(lerp(60, 120, iv), 255, t));
    b = Math.round(lerp(lerp(0,  30,  iv), lerp(180, 255, iv), t));
  } else {
    const t = (pH - 0.5) / 0.5;
    // yellow-white → blue-white
    r = Math.round(lerp(255, lerp(140, 200, iv), t));
    g = Math.round(lerp(255, lerp(180, 230, iv), t));
    b = 255;
  }

  // Clamp channels — lerp on edge values can drift a fraction outside 0-255
  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);

  // Dim unlit areas so the dark background stays dark
  const dimmed = clamp(iv * 1.4, 0, 1);
  return `rgba(${r},${g},${b},${(al * dimmed).toFixed(3)})`;
}

/** Shockwave ring color — slightly cooler/thinner than core */
function ringColor(pitchH: number, birthAmp: number, progress: number, alpha: number): string {
  const fade = 1 - progress * progress; // quadratic fade as ring expands
  return novaColor(pitchH, birthAmp * 0.85, alpha * fade);
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 2 — Hex Bloom (unchanged logic, pitch-aware)
// ─────────────────────────────────────────────────────────────────────────────

function buildHexGrid(width: number, height: number): HexCell[] {
  const cells: HexCell[] = [];
  const size = Math.min(width, height) / 11;
  const w = size * 2;
  const h = Math.sqrt(3) * size;
  const cols = Math.ceil(width / (w * 0.75)) + 2;
  const rows = Math.ceil(height / h) + 2;
  const ox = width / 2;
  const oy = height / 2;
  const maxDist = Math.sqrt(ox * ox + oy * oy);
  for (let col = -2; col < cols; col++) {
    for (let row = -2; row < rows; row++) {
      const cx = col * w * 0.75 + size;
      const cy = row * h + (col % 2 === 0 ? 0 : h / 2) + size;
      const dx = cx - ox;
      const dy = cy - oy;
      cells.push({
        cx, cy,
        distFromCenter: clamp(Math.sqrt(dx * dx + dy * dy) / maxDist, 0, 1),
      });
    }
  }
  return cells;
}

function hexBloomFactor(cell: HexCell, totalEnergy: number): number {
  return clamp(totalEnergy - cell.distFromCenter * 0.82, 0, 1);
}

function hexColor(dist: number, energy: number, alpha: number): string {
  const bloom = clamp(energy - dist * 0.85, 0, 1);
  let r: number, g: number, b: number;
  if (bloom < 0.4) {
    const t = bloom / 0.4;
    r = Math.round(lerp(20, 120, t));
    g = Math.round(lerp(0, 0, t));
    b = Math.round(lerp(40, 255, t));
  } else if (bloom < 0.75) {
    const t = (bloom - 0.4) / 0.35;
    r = Math.round(lerp(120, 220, t));
    g = Math.round(lerp(0, 0, t));
    b = 255;
  } else {
    const t = (bloom - 0.75) / 0.25;
    r = Math.round(lerp(220, 255, t));
    g = Math.round(lerp(0, 180, t));
    b = 255;
  }
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 3 — Plasma Veins (unchanged logic, pitch-aware)
// ─────────────────────────────────────────────────────────────────────────────

function buildVeinTree(width: number, height: number, seed: number): VeinNode[] {
  const nodes: VeinNode[] = [];
  let rng = seed;
  const rand = () => { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; };
  const cx = width / 2;
  const cy = height / 2;
  nodes.push({ x: cx, y: cy, children: [], depth: 0, armIndex: -1 });
  const MAX_NODES = 280;
  const STEP_MIN = Math.min(width, height) * 0.045;
  const STEP_MAX = Math.min(width, height) * 0.095;
  const ROOT_ARMS = 8;
  const queue: number[] = [0];
  while (nodes.length < MAX_NODES && queue.length > 0) {
    const pIdx = queue.shift()!;
    const parent = nodes[pIdx];
    if (parent.depth > 7) continue;
    const branchCount = parent.depth === 0 ? ROOT_ARMS : rand() < 0.45 ? 2 : 1;
    const baseAngle = parent.depth === 0
      ? 0
      : Math.atan2(
          parent.y - (nodes[Math.max(0, pIdx - 1)]?.y ?? cy),
          parent.x - (nodes[Math.max(0, pIdx - 1)]?.x ?? cx),
        );
    for (let b = 0; b < branchCount; b++) {
      if (nodes.length >= MAX_NODES) break;
      const angle = parent.depth === 0
        ? (b / ROOT_ARMS) * Math.PI * 2
        : baseAngle + (rand() - 0.5) * (Math.PI / 5) * 2;
      const step = STEP_MIN + rand() * (STEP_MAX - STEP_MIN);
      const armIndex = parent.depth === 0 ? b : parent.armIndex;
      const childIdx = nodes.length;
      nodes.push({
        x: parent.x + Math.cos(angle) * step,
        y: parent.y + Math.sin(angle) * step,
        children: [], depth: parent.depth + 1, armIndex,
      });
      parent.children.push(childIdx);
      queue.push(childIdx);
    }
  }
  return nodes;
}

function armCharge(armIndex: number, pitchClass: number, baseCharge: number): number {
  if (pitchClass < 0 || baseCharge < 0.05) return baseCharge;
  const targetArm = (pitchClass * 8) / 12;
  let dist = Math.abs(armIndex - targetArm);
  if (dist > 4) dist = 8 - dist;
  return clamp(baseCharge * lerp(1.0, 0.2, dist / 4), 0, 1);
}

function veinColor(charge: number, pitchHeight: number, alpha: number): string {
  const c = clamp(charge, 0, 1);
  const warmth = 1 - pitchHeight;
  let r: number, g: number, b: number;
  if (c < 0.5) {
    const t = c / 0.5;
    r = Math.round(lerp(0, lerp(40, 0, warmth), t));
    g = Math.round(lerp(30, 200, t));
    b = Math.round(lerp(120, 255, t));
  } else {
    const t = (c - 0.5) / 0.5;
    r = Math.round(lerp(lerp(40, 0, warmth), 255, t));
    g = Math.round(lerp(200, 255, t));
    b = 255;
  }
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MusicalVisual({
  design, energy, rawEnergy, bassEnergy, rawBassEnergy,
  pitchClass, pitchHeight, active, reducedMotion,
}: MusicalVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({
    design, energy, rawEnergy, bassEnergy, rawBassEnergy,
    pitchClass, pitchHeight, active, reducedMotion,
  });
  propsRef.current = {
    design, energy, rawEnergy, bassEnergy, rawBassEnergy,
    pitchClass, pitchHeight, active, reducedMotion,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // ── geometry caches ─────────────────────────────────────────────────────
    let hexCells: HexCell[] = [];
    let veinNodes: VeinNode[] = [];

    const rebuildGeometry = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      hexCells = buildHexGrid(w, h);
      veinNodes = buildVeinTree(w, h, 42);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildGeometry();
    };

    resize();
    window.addEventListener("resize", resize);

    // ── per-frame state ──────────────────────────────────────────────────────
    let displayEnergy = 0;
    let displayBass = 0;
    let time = 0;
    let frame = 0;
    let smoothPitchHeight = 0.5;

    // ── Supernova state ──────────────────────────────────────────────────────
    const shockwaves: Shockwave[] = [];
    const debrisPool: Debris[] = [];

    // Spike detection: fire a detonation when amplitude crosses a rising threshold
    let prevAmplitude = 0;
    const SPIKE_THRESHOLD = 0.18; // minimum amplitude to spawn a shockwave
    const SPIKE_RISE = 0.06;      // must rise by this much from previous frame

    const spawnDetonation = (
      width: number, height: number,
      amp: number, pitchH: number,
    ) => {
      const diagonal = Math.sqrt(width * width + height * height) * 0.55;
      const speed = 2.8 + amp * 5.5;

      shockwaves.push({
        radius: 0,
        maxRadius: diagonal,
        speed,
        birthAmp: amp,
        opacity: 1,
      });

      // Also spawn a second, slightly faster thinner ring for layering
      if (amp > 0.5) {
        shockwaves.push({
          radius: 0,
          maxRadius: diagonal,
          speed: speed * 1.35,
          birthAmp: amp * 0.6,
          opacity: 0.7,
        });
      }

      // Debris burst — scale count and speed with amplitude
      const debrisCount = Math.round(lerp(8, 38, amp));
      for (let i = 0; i < debrisCount; i++) {
        debrisPool.push({
          angle: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * amp * 7,
          radius: 0,
          size: 0.8 + Math.random() * (1.5 + amp * 2.5),
          decay: 0.96 - Math.random() * 0.04,
          opacity: 0.6 + Math.random() * 0.4,
          colorT: pitchH + (Math.random() - 0.5) * 0.2,
        });
      }
    };

    // ── DRAW: Supernova ──────────────────────────────────────────────────────
    const drawSupernova = (
      width: number, height: number,
      amp: number, bassLive: number, pitchH: number,
    ) => {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Spawn detonation on amplitude spikes
      const isSpike = amp > SPIKE_THRESHOLD && amp - prevAmplitude > SPIKE_RISE;
      if (isSpike) spawnDetonation(width, height, amp, pitchH);
      prevAmplitude = amp;

      // ── Shockwave rings ──
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        const progress = sw.radius / sw.maxRadius;
        sw.opacity = clamp(1 - progress * 1.1, 0, 1);

        if (sw.opacity <= 0.01) { shockwaves.splice(i, 1); continue; }

        const thickness = (3 + sw.birthAmp * 8) * (1 - progress * 0.7);

        // Outer soft halo
        context.beginPath();
        context.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        context.strokeStyle = ringColor(pitchH, sw.birthAmp, progress, sw.opacity * 0.3);
        context.lineWidth = thickness * 3.5;
        context.stroke();

        // Sharp bright ring
        context.beginPath();
        context.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        context.strokeStyle = ringColor(pitchH, sw.birthAmp, progress, sw.opacity);
        context.lineWidth = thickness;
        context.stroke();
      }

      // ── Debris ──
      for (let i = debrisPool.length - 1; i >= 0; i--) {
        const d = debrisPool[i];
        d.radius += d.speed;
        d.speed *= 0.985; // slight drag
        d.opacity *= d.decay;

        if (d.opacity < 0.015) { debrisPool.splice(i, 1); continue; }

        const px = cx + Math.cos(d.angle) * d.radius;
        const py = cy + Math.sin(d.angle) * d.radius;

        context.beginPath();
        context.arc(px, py, d.size, 0, Math.PI * 2);
        context.fillStyle = novaColor(
          clamp(d.colorT, 0, 1),
          0.7 + d.opacity * 0.3,
          d.opacity,
        );
        context.fill();
      }

      // ── Core orb ──
      // Breathes slowly at rest; swells on amplitude hits
      const breathe = Math.sin(time * 1.6) * 0.012;
      const coreRadius = Math.min(width, height) * (0.045 + amp * 0.08 + bassLive * 0.025 + breathe);

      // Outer corona glow (wide, soft)
      const coronaRadius = coreRadius * (3.5 + amp * 2.5);
      const corona = context.createRadialGradient(cx, cy, coreRadius * 0.5, cx, cy, coronaRadius);
      corona.addColorStop(0, novaColor(pitchH, amp, 0.35 + amp * 0.25));
      corona.addColorStop(0.4, novaColor(pitchH, amp * 0.7, 0.12 + amp * 0.1));
      corona.addColorStop(1, novaColor(pitchH, 0, 0));
      context.beginPath();
      context.arc(cx, cy, coronaRadius, 0, Math.PI * 2);
      context.fillStyle = corona;
      context.fill();

      // Inner bright core
      const core = context.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      core.addColorStop(0, `rgba(255,255,255,${(0.85 + amp * 0.15).toFixed(2)})`);
      core.addColorStop(0.3, novaColor(pitchH, 1, 0.9));
      core.addColorStop(0.7, novaColor(pitchH, 0.8, 0.6));
      core.addColorStop(1, novaColor(pitchH, 0.4, 0));
      context.beginPath();
      context.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      context.fillStyle = core;
      context.fill();
    };

    // ── DRAW: Hex Bloom ──────────────────────────────────────────────────────
    const HEX_SIDES = 6;
    const drawHexPath = (cx: number, cy: number, r: number) => {
      context.beginPath();
      for (let i = 0; i < HEX_SIDES; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0
          ? context.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
          : context.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      context.closePath();
    };

    const drawHexBloom = (
      width: number, height: number,
      amp: number, bassLive: number,
    ) => {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      const hexR = Math.min(width, height) / 11;
      const breathe = Math.sin(time * 1.1) * 0.04;
      const totalEnergy = clamp(amp + bassLive * 0.35 + breathe, 0, 1);
      for (const cell of hexCells) {
        const bloom = hexBloomFactor(cell, totalEnergy);
        if (bloom < 0.01) {
          drawHexPath(cell.cx, cell.cy, hexR * 0.88);
          context.strokeStyle = "rgba(40,0,80,0.35)";
          context.lineWidth = 0.5;
          context.stroke();
          continue;
        }
        drawHexPath(cell.cx, cell.cy, hexR * 0.88);
        context.fillStyle = hexColor(cell.distFromCenter, totalEnergy, clamp(bloom * 0.85, 0, 0.9));
        context.fill();
        drawHexPath(cell.cx, cell.cy, hexR * 0.88);
        context.strokeStyle = hexColor(cell.distFromCenter, totalEnergy, clamp(bloom * 1.2, 0, 1));
        context.lineWidth = 0.8 + bloom * 2;
        context.stroke();
        if (bloom > 0.6) {
          drawHexPath(cell.cx, cell.cy, hexR * 0.55 * bloom);
          context.fillStyle = hexColor(cell.distFromCenter, 1, (bloom - 0.6) * 0.7);
          context.fill();
        }
      }
    };

    // ── DRAW: Plasma Veins ───────────────────────────────────────────────────
    const drawVeinSegments = (
      nodeIdx: number, parentX: number, parentY: number,
      chargeIn: number, pitchH: number,
    ) => {
      const node = veinNodes[nodeIdx];
      if (!node) return;
      const charge = clamp(chargeIn - (0.08 + node.depth * 0.04), 0, 1);
      context.beginPath();
      context.moveTo(parentX, parentY);
      context.lineTo(node.x, node.y);
      context.strokeStyle = veinColor(charge, pitchH, 0.55 + charge * 0.45);
      context.lineWidth = clamp(2.5 - node.depth * 0.28, 0.4, 2.5);
      context.stroke();
      if (charge > 0.3) {
        context.beginPath();
        context.moveTo(parentX, parentY);
        context.lineTo(node.x, node.y);
        context.strokeStyle = veinColor(charge, pitchH, (charge - 0.3) * 0.35);
        context.lineWidth = clamp((3 - node.depth * 0.3) * 3.5 * charge, 1, 14);
        context.stroke();
      }
      for (const childIdx of node.children) {
        drawVeinSegments(childIdx, node.x, node.y, charge, pitchH);
      }
    };

    const drawPlasmaVeins = (
      width: number, height: number,
      amp: number, bassLive: number,
      pitchC: number, pitchH: number,
    ) => {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      const rootCharge = clamp(amp * 1.05 + bassLive * 0.35, 0, 1);
      const pulseBoost = rootCharge > 0.1
        ? Math.sin((time * 0.9 % 1) * Math.PI) * 0.28 * rootCharge
        : 0;
      const baseCharge = clamp(rootCharge + pulseBoost, 0, 1);
      context.lineCap = "round";
      context.lineJoin = "round";
      const root = veinNodes[0];
      if (!root) return;
      for (const childIdx of root.children) {
        const child = veinNodes[childIdx];
        if (!child) continue;
        drawVeinSegments(childIdx, root.x, root.y, armCharge(child.armIndex, pitchC, baseCharge), pitchH);
      }
      if (baseCharge > 0.15) {
        const gr = context.createRadialGradient(root.x, root.y, 0, root.x, root.y, 40 * baseCharge);
        gr.addColorStop(0, `rgba(200,255,255,${(baseCharge * 0.9).toFixed(2)})`);
        gr.addColorStop(1, "rgba(0,180,255,0)");
        context.fillStyle = gr;
        context.beginPath();
        context.arc(root.x, root.y, 40 * baseCharge, 0, Math.PI * 2);
        context.fill();
      }
    };

    // ── Main loop ────────────────────────────────────────────────────────────
    const draw = () => {
      const {
        design: d, energy: e, rawEnergy: re,
        bassEnergy: be, rawBassEnergy: rbe,
        pitchClass: pc, pitchHeight: ph,
        active: isActive, reducedMotion: reduced,
      } = propsRef.current;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      displayEnergy = chaseValue(displayEnergy, normalizeVisualEnergy(e),  reduced ? 0.78 : 0.92, reduced ? 0.55 : 0.72);
      displayBass   = chaseValue(displayBass,   normalizeVisualEnergy(be), reduced ? 0.80 : 0.94, reduced ? 0.58 : 0.75);

      const bassLive = normalizeVisualEnergy(rbe) * 0.88 + displayBass * 0.12;
      const amplitude = liveAmplitude(displayEnergy, normalizeVisualEnergy(re), bassLive);

      smoothPitchHeight += (ph - smoothPitchHeight) * (reduced ? 0.12 : 0.18);
      time += reduced ? 0.008 : 0.016;

      context.clearRect(0, 0, width, height);

      if (!isActive) {
        displayEnergy = 0;
        displayBass = 0;
        shockwaves.length = 0;
        debrisPool.length = 0;
        prevAmplitude = 0;
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        frame = requestAnimationFrame(draw);
        return;
      }

      if (d === "radial") {
        // "radial" slot → Supernova
        drawSupernova(width, height, amplitude, bassLive, smoothPitchHeight);
      } else if (d === "grid") {
        // "grid" slot → Hex Bloom
        drawHexBloom(width, height, amplitude, bassLive);
      } else {
        // "storm" slot → Plasma Veins
        drawPlasmaVeins(width, height, amplitude, bassLive, pc, smoothPitchHeight);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}