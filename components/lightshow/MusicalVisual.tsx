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
  pitchClass: number;
  pitchHeight: number;
  active: boolean;
  reducedMotion: boolean;
}

interface VeinNode {
  x: number;
  y: number;
  parentX: number; // actual parent coords stored at build time — no index math needed
  parentY: number;
  children: number[];
  depth: number;
  armIndex: number;
  angle: number;   // cumulative angle from root — used for outward spread check
}

interface HexCell {
  cx: number;
  cy: number;
  distFromCenter: number;
}

interface Shockwave {
  radius: number;
  maxRadius: number;
  speed: number;
  birthAmp: number;
  opacity: number;
}

interface Debris {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  decay: number;
  opacity: number;
  colorT: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 1 — Supernova
// ─────────────────────────────────────────────────────────────────────────────

function novaColor(pitchH: number, intensity: number, alpha: number): string {
  const pH = clamp(Number.isFinite(pitchH)   ? pitchH   : 0.5, 0, 1);
  const iv = clamp(Number.isFinite(intensity) ? intensity : 0,   0, 1);
  const al = clamp(Number.isFinite(alpha)     ? alpha     : 0,   0, 1);

  let r: number, g: number, b: number;
  if (pH < 0.5) {
    const t = pH / 0.5;
    r = 255;
    g = Math.round(lerp(lerp(60, 120, iv), 255, t));
    b = Math.round(lerp(lerp(0, 30, iv), lerp(180, 255, iv), t));
  } else {
    const t = (pH - 0.5) / 0.5;
    r = Math.round(lerp(255, lerp(140, 200, iv), t));
    g = Math.round(lerp(255, lerp(180, 230, iv), t));
    b = 255;
  }

  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);

  const dimmed = clamp(iv * 1.4, 0, 1);
  return `rgba(${r},${g},${b},${(al * dimmed).toFixed(3)})`;
}

function ringColor(pitchH: number, birthAmp: number, progress: number, alpha: number): string {
  const fade = 1 - progress * progress;
  return novaColor(pitchH, birthAmp * 0.85, alpha * fade);
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 2 — Hex Bloom
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
    g = 0;
    b = Math.round(lerp(40, 255, t));
  } else if (bloom < 0.75) {
    const t = (bloom - 0.4) / 0.35;
    r = Math.round(lerp(120, 220, t));
    g = 0;
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
// DESIGN 3 — Plasma Veins
//
// Fixes vs previous version:
//   1. VeinNode stores parentX/parentY at build time — no index-math bug.
//   2. Branch angles use stored node.angle (cumulative from root arm) with a
//      small random spread, so branches always grow outward, never inward.
//   3. Charge attenuation is flat per segment (not multiplied by depth) so
//      tips at depth 7 still carry meaningful charge.
//   4. Sensitivity: rootCharge formula boosted; arm selection sharpened.
// ─────────────────────────────────────────────────────────────────────────────

function buildVeinTree(width: number, height: number, seed: number): VeinNode[] {
  const nodes: VeinNode[] = [];
  let rng = seed;
  const rand = () => { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; };

  const cx = width / 2;
  const cy = height / 2;

  // Root node — no parent coords needed, draw call skips it
  nodes.push({ x: cx, y: cy, parentX: cx, parentY: cy, children: [], depth: 0, armIndex: -1, angle: 0 });

  const MAX_NODES = 320;
  // Step sized to reach screen edges from center across ~6 segments
  const STEP_BASE = Math.min(width, height) * 0.072;
  const ROOT_ARMS = 8;
  const SPREAD = Math.PI / 6; // max angular deviation per branch (30°)

  const queue: number[] = [0];

  while (nodes.length < MAX_NODES && queue.length > 0) {
    const pIdx = queue.shift()!;
    const parent = nodes[pIdx];
    if (parent.depth > 6) continue;

    const branchCount = parent.depth === 0 ? ROOT_ARMS : (rand() < 0.4 ? 2 : 1);

    for (let b = 0; b < branchCount; b++) {
      if (nodes.length >= MAX_NODES) break;

      let angle: number;
      if (parent.depth === 0) {
        // Evenly spaced root arms
        angle = (b / ROOT_ARMS) * Math.PI * 2;
      } else {
        // Deviate from parent's outward angle — stays in same quadrant
        angle = parent.angle + (rand() - 0.5) * SPREAD * 2;
      }

      // Step shrinks slightly with depth so tips cluster near extremities
      const step = STEP_BASE * (1 - parent.depth * 0.06) * (0.85 + rand() * 0.3);
      const nx = parent.x + Math.cos(angle) * step;
      const ny = parent.y + Math.sin(angle) * step;

      const childIdx = nodes.length;
      nodes.push({
        x: nx, y: ny,
        parentX: parent.x, parentY: parent.y,
        children: [],
        depth: parent.depth + 1,
        armIndex: parent.depth === 0 ? b : parent.armIndex,
        angle,
      });
      parent.children.push(childIdx);
      queue.push(childIdx);
    }
  }
  return nodes;
}

function armCharge(armIndex: number, pitchClass: number, baseCharge: number): number {
  if (pitchClass < 0 || baseCharge < 0.02) return baseCharge;
  const targetArm = (pitchClass * ROOT_ARMS_COUNT) / 12;
  let dist = Math.abs(armIndex - targetArm);
  if (dist > ROOT_ARMS_COUNT / 2) dist = ROOT_ARMS_COUNT - dist;
  // Sharper falloff than before: dist 0 → 1.0×, dist 4 → 0.1×
  const multiplier = Math.pow(1 - dist / (ROOT_ARMS_COUNT / 2), 1.8);
  return clamp(baseCharge * lerp(0.1, 1.0, multiplier), 0, 1);
}

const ROOT_ARMS_COUNT = 8;

function veinColor(charge: number, pitchHeight: number, alpha: number): string {
  const c = clamp(charge, 0, 1);
  const warmth = 1 - clamp(Number.isFinite(pitchHeight) ? pitchHeight : 0.5, 0, 1);
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
  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);
  return `rgba(${r},${g},${b},${clamp(alpha, 0, 1).toFixed(3)})`;
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

    let displayEnergy = 0;
    let displayBass = 0;
    let time = 0;
    let frame = 0;
    let smoothPitchHeight = 0.5;

    // Supernova state
    const shockwaves: Shockwave[] = [];
    const debrisPool: Debris[] = [];
    let prevAmplitude = 0;
    const SPIKE_THRESHOLD = 0.18;
    const SPIKE_RISE = 0.06;

    const spawnDetonation = (width: number, height: number, amp: number, pitchH: number) => {
      const diagonal = Math.sqrt(width * width + height * height) * 0.55;
      const speed = 2.8 + amp * 5.5;
      shockwaves.push({ radius: 0, maxRadius: diagonal, speed, birthAmp: amp, opacity: 1 });
      if (amp > 0.5) {
        shockwaves.push({ radius: 0, maxRadius: diagonal, speed: speed * 1.35, birthAmp: amp * 0.6, opacity: 0.7 });
      }
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
    const drawSupernova = (width: number, height: number, amp: number, bassLive: number, pitchH: number) => {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      if (amp > SPIKE_THRESHOLD && amp - prevAmplitude > SPIKE_RISE) {
        spawnDetonation(width, height, amp, pitchH);
      }
      prevAmplitude = amp;

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        const progress = sw.radius / sw.maxRadius;
        sw.opacity = clamp(1 - progress * 1.1, 0, 1);
        if (sw.opacity <= 0.01) { shockwaves.splice(i, 1); continue; }
        const thickness = (3 + sw.birthAmp * 8) * (1 - progress * 0.7);
        context.beginPath();
        context.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        context.strokeStyle = ringColor(pitchH, sw.birthAmp, progress, sw.opacity * 0.3);
        context.lineWidth = thickness * 3.5;
        context.stroke();
        context.beginPath();
        context.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        context.strokeStyle = ringColor(pitchH, sw.birthAmp, progress, sw.opacity);
        context.lineWidth = thickness;
        context.stroke();
      }

      for (let i = debrisPool.length - 1; i >= 0; i--) {
        const d = debrisPool[i];
        d.radius += d.speed;
        d.speed *= 0.985;
        d.opacity *= d.decay;
        if (d.opacity < 0.015) { debrisPool.splice(i, 1); continue; }
        context.beginPath();
        context.arc(cx + Math.cos(d.angle) * d.radius, cy + Math.sin(d.angle) * d.radius, d.size, 0, Math.PI * 2);
        context.fillStyle = novaColor(clamp(d.colorT, 0, 1), 0.7 + d.opacity * 0.3, d.opacity);
        context.fill();
      }

      const breathe = Math.sin(time * 1.6) * 0.012;
      const coreRadius = Math.min(width, height) * (0.045 + amp * 0.08 + bassLive * 0.025 + breathe);
      const coronaRadius = coreRadius * (3.5 + amp * 2.5);
      const corona = context.createRadialGradient(cx, cy, coreRadius * 0.5, cx, cy, coronaRadius);
      corona.addColorStop(0, novaColor(pitchH, amp, 0.35 + amp * 0.25));
      corona.addColorStop(0.4, novaColor(pitchH, amp * 0.7, 0.12 + amp * 0.1));
      corona.addColorStop(1, novaColor(pitchH, 0, 0));
      context.beginPath();
      context.arc(cx, cy, coronaRadius, 0, Math.PI * 2);
      context.fillStyle = corona;
      context.fill();

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

    const drawHexBloom = (width: number, height: number, amp: number, bassLive: number) => {
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
    //
    // Each segment is drawn using the node's stored parentX/parentY — no index
    // lookup needed. Charge attenuation is a flat 0.10 per segment so tips at
    // depth 6 still receive ~0.4 charge at rootCharge=1.0.
    //
    // Sensitivity tuning:
    //   rootCharge = amp^0.6 so even moderate energy (0.3) gives 0.55 charge.
    //   Pulse wave adds ±0.25 so the veins breathe visibly between beats.
    //   Glow lineWidth scales with charge² for a sharper bloom-vs-dark contrast.

    const CHARGE_DROP_PER_SEGMENT = 0.10; // flat, not depth-multiplied

    const drawVeinSegment = (node: VeinNode, chargeIn: number, pitchH: number) => {
      const charge = clamp(chargeIn - CHARGE_DROP_PER_SEGMENT, 0, 1);
      if (charge < 0.01) return; // nothing to draw

      // Core line
      context.beginPath();
      context.moveTo(node.parentX, node.parentY);
      context.lineTo(node.x, node.y);
      context.strokeStyle = veinColor(charge, pitchH, 0.5 + charge * 0.5);
      context.lineWidth = clamp(2.8 - node.depth * 0.32, 0.5, 2.8);
      context.stroke();

      // Glow halo — scales with charge squared for a punchy bloom
      if (charge > 0.15) {
        context.beginPath();
        context.moveTo(node.parentX, node.parentY);
        context.lineTo(node.x, node.y);
        context.strokeStyle = veinColor(charge, pitchH, charge * charge * 0.5);
        context.lineWidth = clamp(charge * charge * 18, 1, 18);
        context.stroke();
      }

      for (const childIdx of node.children) {
        const child = veinNodes[childIdx];
        if (child) drawVeinSegment(child, charge, pitchH);
      }
    };

    const drawPlasmaVeins = (
      width: number, height: number,
      amp: number, bassLive: number,
      pitchC: number, pitchH: number,
    ) => {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);

      // Boosted root charge: power curve so low energy still shows veins
      const rawCharge = clamp(Math.pow(amp, 0.6) + bassLive * 0.4, 0, 1);
      // Breathing pulse — makes veins visibly animate even between spikes
      const pulse = Math.sin(time * 2.8) * 0.18 + Math.sin(time * 1.1) * 0.07;
      const rootCharge = clamp(rawCharge + pulse * rawCharge, 0, 1);

      context.lineCap = "round";
      context.lineJoin = "round";

      const root = veinNodes[0];
      if (!root) return;

      for (const childIdx of root.children) {
        const child = veinNodes[childIdx];
        if (!child) continue;
        const ac = armCharge(child.armIndex, pitchC, rootCharge);
        drawVeinSegment(child, ac, pitchH);
      }

      // Center glow node
      if (rootCharge > 0.08) {
        const glowR = 8 + rootCharge * 28;
        const gr = context.createRadialGradient(root.x, root.y, 0, root.x, root.y, glowR);
        gr.addColorStop(0, veinColor(1, pitchH, rootCharge * 0.95));
        gr.addColorStop(0.5, veinColor(0.6, pitchH, rootCharge * 0.4));
        gr.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = gr;
        context.beginPath();
        context.arc(root.x, root.y, glowR, 0, Math.PI * 2);
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

      const safePh = Number.isFinite(ph) ? ph : 0.5;
      smoothPitchHeight += (safePh - smoothPitchHeight) * (reduced ? 0.12 : 0.18);
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
        drawSupernova(width, height, amplitude, bassLive, smoothPitchHeight);
      } else if (d === "grid") {
        drawHexBloom(width, height, amplitude, bassLive);
      } else {
        drawPlasmaVeins(width, height, amplitude, bassLive, pc ?? -1, smoothPitchHeight);
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