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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface VeinSegment {
  x1: number; y1: number;
  x2: number; y2: number;
  depth: number;
  armIndex: number;
  parentIdx: number;   // -1 for root arms
  childIndices: number[];
}

interface HexCell {
  cx: number;
  cy: number;
  dist: number;
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
// Math helpers
// ─────────────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return v < lo ? lo : v > hi ? hi : v; }

// ─────────────────────────────────────────────────────────────────────────────
// Color helpers
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
  r = clamp(r, 0, 255); g = clamp(g, 0, 255); b = clamp(b, 0, 255);
  const dimmed = clamp(iv * 1.4, 0, 1);
  return `rgba(${r},${g},${b},${(al * dimmed).toFixed(3)})`;
}

// Hex color — quantized lookup table built once, never rebuilt per frame
const HEX_STEPS = 32;
const hexColorTable: string[][] = (() => {
  const table: string[][] = [];
  for (let ei = 0; ei <= HEX_STEPS; ei++) {
    const energy = ei / HEX_STEPS;
    const row: string[] = [];
    for (let di = 0; di <= HEX_STEPS; di++) {
      const dist  = di / HEX_STEPS;
      const bloom = clamp(energy - dist * 0.85, 0, 1);
      let r: number, g: number, b: number;
      if (bloom < 0.4) {
        const t = bloom / 0.4;
        r = Math.round(lerp(20, 120, t)); g = 0; b = Math.round(lerp(40, 255, t));
      } else if (bloom < 0.75) {
        const t = (bloom - 0.4) / 0.35;
        r = Math.round(lerp(120, 220, t)); g = 0; b = 255;
      } else {
        const t = (bloom - 0.75) / 0.25;
        r = Math.round(lerp(220, 255, t)); g = Math.round(lerp(0, 180, t)); b = 255;
      }
      row.push(`rgb(${r},${g},${b})`);
    }
    table.push(row);
  }
  return table;
})();

function hexColor(dist: number, energy: number): string {
  const ei = Math.round(clamp(energy, 0, 1) * HEX_STEPS);
  const di = Math.round(clamp(dist,   0, 1) * HEX_STEPS);
  return hexColorTable[ei][di];
}

// Vein color — quantized lookup table
const VEIN_STEPS = 16;
const veinColorTable: string[][] = (() => {
  const table: string[][] = [];
  for (let ci = 0; ci <= VEIN_STEPS; ci++) {
    const c = ci / VEIN_STEPS;
    const row: string[] = [];
    for (let pi = 0; pi <= VEIN_STEPS; pi++) {
      const warmth = 1 - (pi / VEIN_STEPS);
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
      row.push(`rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`);
    }
    table.push(row);
  }
  return table;
})();

function veinColor(charge: number, pitchHeight: number): string {
  const ci = Math.round(clamp(charge,      0, 1) * VEIN_STEPS);
  const pi = Math.round(clamp(pitchHeight, 0, 1) * VEIN_STEPS);
  return veinColorTable[ci][pi];
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry builders — run once on resize
// ─────────────────────────────────────────────────────────────────────────────

const HEX_SIZE_DIV = 11;

function buildHexGrid(width: number, height: number): HexCell[] {
  const cells: HexCell[] = [];
  const size  = Math.min(width, height) / HEX_SIZE_DIV;
  const cellW = size * 2;
  const cellH = Math.sqrt(3) * size;
  const cols  = Math.ceil(width  / (cellW * 0.75)) + 2;
  const rows  = Math.ceil(height / cellH) + 2;
  const ox    = width  / 2;
  const oy    = height / 2;
  const maxD  = Math.sqrt(ox * ox + oy * oy);
  for (let col = -2; col < cols; col++) {
    for (let row = -2; row < rows; row++) {
      const cx = col * cellW * 0.75 + size;
      const cy = row * cellH + (col % 2 === 0 ? 0 : cellH / 2) + size;
      const dx = cx - ox;
      const dy = cy - oy;
      cells.push({ cx, cy, dist: clamp(Math.sqrt(dx * dx + dy * dy) / maxD, 0, 1) });
    }
  }
  return cells;
}

const ROOT_ARMS  = 8;
const CHARGE_DROP = 0.10;

function buildVeinSegments(width: number, height: number, seed: number): VeinSegment[] {
  const segs: VeinSegment[] = [];
  let rng = seed;
  const rand = () => { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; };
  const cx        = width  / 2;
  const cy        = height / 2;
  const STEP_BASE = Math.min(width, height) * 0.072;
  const SPREAD    = Math.PI / 6;
  const MAX_SEGS  = 300;

  // Build queue carries: x, y, depth, armIndex, angle, parentSegIdx (-1 = none)
  type QNode = { x: number; y: number; depth: number; armIndex: number; angle: number; parentSegIdx: number };
  const queue: QNode[] = [{ x: cx, y: cy, depth: 0, armIndex: -1, angle: 0, parentSegIdx: -1 }];

  while (queue.length > 0 && segs.length < MAX_SEGS) {
    const node = queue.shift()!;
    if (node.depth > 6) continue;

    const branchCount = node.depth === 0 ? ROOT_ARMS : (rand() < 0.4 ? 2 : 1);
    for (let b = 0; b < branchCount; b++) {
      if (segs.length >= MAX_SEGS) break;

      const angle = node.depth === 0
        ? (b / ROOT_ARMS) * Math.PI * 2
        : node.angle + (rand() - 0.5) * SPREAD * 2;

      const step  = STEP_BASE * (1 - node.depth * 0.06) * (0.85 + rand() * 0.3);
      const nx    = node.x + Math.cos(angle) * step;
      const ny    = node.y + Math.sin(angle) * step;
      const armIndex   = node.depth === 0 ? b : node.armIndex;
      const segIdx = segs.length;

      segs.push({
        x1: node.x, y1: node.y,
        x2: nx,     y2: ny,
        depth: node.depth + 1,
        armIndex,
        parentIdx: node.parentSegIdx,
        childIndices: [],
      });

      // Register this segment as a child of its parent
      if (node.parentSegIdx >= 0) {
        segs[node.parentSegIdx].childIndices.push(segIdx);
      }

      queue.push({ x: nx, y: ny, depth: node.depth + 1, armIndex, angle, parentSegIdx: segIdx });
    }
  }
  return segs;
}

function armChargeFactor(armIndex: number, pitchClass: number): number {
  if (pitchClass < 0) return 1;
  const targetArm = (pitchClass * ROOT_ARMS) / 12;
  let dist = Math.abs(armIndex - targetArm);
  if (dist > ROOT_ARMS / 2) dist = ROOT_ARMS - dist;
  return Math.pow(1 - dist / (ROOT_ARMS / 2), 1.8) * 0.9 + 0.1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MusicalVisual({
  design, energy, rawEnergy, bassEnergy, rawBassEnergy,
  pitchClass, pitchHeight, active, reducedMotion,
}: MusicalVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef  = useRef({ design, energy, rawEnergy, bassEnergy, rawBassEnergy, pitchClass, pitchHeight, active, reducedMotion });
  propsRef.current = { design, energy, rawEnergy, bassEnergy, rawBassEnergy, pitchClass, pitchHeight, active, reducedMotion };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // No alpha:false — keeps globalAlpha and gradients working correctly
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── geometry ─────────────────────────────────────────────────────────────
    let hexCells: HexCell[]     = [];
    let veinSegs: VeinSegment[] = [];
    // root-arm segment indices (depth === 1) — computed after build
    let rootSegIndices: number[] = [];
    // per-frame charge array, allocated once
    let segCharge = new Float32Array(0);
    let hexR      = 0;

    const rebuildGeometry = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      hexCells       = buildHexGrid(w, h);
      veinSegs       = buildVeinSegments(w, h, 42);
      rootSegIndices = veinSegs.map((s, i) => s.depth === 1 ? i : -1).filter(i => i >= 0);
      segCharge      = new Float32Array(veinSegs.length);
      hexR           = Math.min(w, h) / HEX_SIZE_DIV;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // DPR capped at 1.5 for mobile fps headroom
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width  = parent.clientWidth  * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width  = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildGeometry();
    };

    resize();
    window.addEventListener("resize", resize);

    // ── frame state ───────────────────────────────────────────────────────────
    let displayEnergy = 0;
    let displayBass   = 0;
    let time          = 0;
    let frameId       = 0;
    let smoothPitchH  = 0.5;

    // Supernova state
    const shockwaves: Shockwave[] = [];
    const debris:     Debris[]    = [];
    let prevAmp = 0;

    const spawnDetonation = (w: number, h: number, amp: number, pH: number) => {
      const diag  = Math.sqrt(w * w + h * h) * 0.55;
      const speed = 2.8 + amp * 5.5;
      shockwaves.push({ radius: 0, maxRadius: diag, speed, birthAmp: amp, opacity: 1 });
      if (amp > 0.5) {
        shockwaves.push({ radius: 0, maxRadius: diag, speed: speed * 1.35, birthAmp: amp * 0.6, opacity: 0.7 });
      }
      const count = Math.round(lerp(8, 38, amp));
      for (let i = 0; i < count; i++) {
        debris.push({
          angle:  Math.random() * Math.PI * 2,
          speed:  1.5 + Math.random() * amp * 7,
          radius: 0,
          size:   0.8 + Math.random() * (1.5 + amp * 2.5),
          decay:  0.96 - Math.random() * 0.04,
          opacity: 0.6 + Math.random() * 0.4,
          colorT: pH + (Math.random() - 0.5) * 0.2,
        });
      }
    };

    // ── DRAW: Supernova ───────────────────────────────────────────────────────
    const drawSupernova = (w: number, h: number, amp: number, bass: number, pH: number) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      if (amp > 0.18 && amp - prevAmp > 0.06) spawnDetonation(w, h, amp, pH);
      prevAmp = amp;

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw   = shockwaves[i];
        sw.radius += sw.speed;
        const prog  = sw.radius / sw.maxRadius;
        sw.opacity  = clamp(1 - prog * 1.1, 0, 1);
        if (sw.opacity <= 0.01) { shockwaves.splice(i, 1); continue; }
        const thick = (3 + sw.birthAmp * 8) * (1 - prog * 0.7);
        const fade  = 1 - prog * prog;
        ctx.beginPath();
        ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = novaColor(pH, sw.birthAmp * 0.85, sw.opacity * 0.3 * fade);
        ctx.lineWidth   = thick * 3.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = novaColor(pH, sw.birthAmp * 0.85, sw.opacity * fade);
        ctx.lineWidth   = thick;
        ctx.stroke();
      }

      for (let i = debris.length - 1; i >= 0; i--) {
        const d   = debris[i];
        d.radius += d.speed;
        d.speed  *= 0.985;
        d.opacity *= d.decay;
        if (d.opacity < 0.015) { debris.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx + Math.cos(d.angle) * d.radius, cy + Math.sin(d.angle) * d.radius, d.size, 0, Math.PI * 2);
        ctx.fillStyle = novaColor(clamp(d.colorT, 0, 1), 0.7 + d.opacity * 0.3, d.opacity);
        ctx.fill();
      }

      const breathe  = Math.sin(time * 1.6) * 0.012;
      const coreR    = Math.min(w, h) * (0.045 + amp * 0.08 + bass * 0.025 + breathe);
      const coronaR  = coreR * (3.5 + amp * 2.5);
      const corona   = ctx.createRadialGradient(cx, cy, coreR * 0.5, cx, cy, coronaR);
      corona.addColorStop(0,   novaColor(pH, amp,       0.35 + amp * 0.25));
      corona.addColorStop(0.4, novaColor(pH, amp * 0.7, 0.12 + amp * 0.1));
      corona.addColorStop(1,   novaColor(pH, 0,         0));
      ctx.beginPath(); ctx.arc(cx, cy, coronaR, 0, Math.PI * 2);
      ctx.fillStyle = corona; ctx.fill();

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0,   `rgba(255,255,255,${(0.85 + amp * 0.15).toFixed(2)})`);
      core.addColorStop(0.3, novaColor(pH, 1,   0.9));
      core.addColorStop(0.7, novaColor(pH, 0.8, 0.6));
      core.addColorStop(1,   novaColor(pH, 0.4, 0));
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = core; ctx.fill();
    };

    // ── DRAW: Hex Bloom ───────────────────────────────────────────────────────
    const HEX_ANGLE  = Math.PI / 3;
    const HEX_OFFSET = -Math.PI / 6;

    const traceHex = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = HEX_ANGLE * i + HEX_OFFSET;
        i === 0
          ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
          : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
    };

    const drawHexBloom = (w: number, h: number, amp: number, bass: number) => {
      ctx.fillStyle   = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      const breathe     = Math.sin(time * 1.1) * 0.04;
      const totalEnergy = clamp(amp + bass * 0.35 + breathe, 0, 1);
      const outerR      = hexR * 0.88;

      for (const cell of hexCells) {
        const bloom = clamp(totalEnergy - cell.dist * 0.82, 0, 1);

        if (bloom < 0.01) {
          traceHex(cell.cx, cell.cy, outerR);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "rgba(40,0,80,0.35)";
          ctx.lineWidth   = 0.5;
          ctx.stroke();
          continue;
        }

        const col = hexColor(cell.dist, totalEnergy);

        // Fill
        traceHex(cell.cx, cell.cy, outerR);
        ctx.globalAlpha = clamp(bloom * 0.85, 0, 0.9);
        ctx.fillStyle   = col;
        ctx.fill();

        // Border
        ctx.globalAlpha = clamp(bloom * 1.2, 0, 1);
        ctx.strokeStyle = col;
        ctx.lineWidth   = 0.8 + bloom * 2;
        ctx.stroke();

        // Inner glow
        if (bloom > 0.6) {
          traceHex(cell.cx, cell.cy, outerR * 0.55 * bloom);
          ctx.globalAlpha = (bloom - 0.6) * 0.7;
          ctx.fillStyle   = col;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    // ── DRAW: Plasma Veins ────────────────────────────────────────────────────
    // Charge propagation: BFS order from build guarantees every parent segment
    // appears at a lower index than its children, so a single forward pass
    // through segCharge correctly propagates from root arms to tips.

    const computeCharges = (rootCharge: number, pc: number) => {
      // Zero out
      segCharge.fill(0);
      // Seed root arms
      for (const idx of rootSegIndices) {
        segCharge[idx] = rootCharge * armChargeFactor(veinSegs[idx].armIndex, pc);
      }
      // Forward propagation — parent always has lower index (BFS build order)
      for (let i = 0; i < veinSegs.length; i++) {
        if (segCharge[i] < 0.01) continue;
        const childCharge = clamp(segCharge[i] - CHARGE_DROP, 0, 1);
        for (const ci of veinSegs[i].childIndices) {
          segCharge[ci] = childCharge;
        }
      }
    };

    const drawPlasmaVeins = (w: number, h: number, amp: number, bass: number, pc: number, pH: number) => {
      ctx.fillStyle   = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      const rawCharge  = clamp(Math.pow(amp, 0.6) + bass * 0.4, 0, 1);
      const pulse      = Math.sin(time * 2.8) * 0.18 + Math.sin(time * 1.1) * 0.07;
      const rootCharge = clamp(rawCharge + pulse * rawCharge, 0, 1);

      computeCharges(rootCharge, pc);

      ctx.lineCap  = "round";
      ctx.lineJoin = "round";

      // Pass 1 — core lines
      for (let i = 0; i < veinSegs.length; i++) {
        const charge = segCharge[i];
        if (charge < 0.01) continue;
        const seg = veinSegs[i];
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.strokeStyle = veinColor(charge, pH);
        ctx.globalAlpha = 0.5 + charge * 0.5;
        ctx.lineWidth   = clamp(2.8 - seg.depth * 0.32, 0.5, 2.8);
        ctx.stroke();
      }

      // Pass 2 — glow halos
      for (let i = 0; i < veinSegs.length; i++) {
        const charge = segCharge[i];
        if (charge < 0.15) continue;
        const seg = veinSegs[i];
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.strokeStyle = veinColor(charge, pH);
        ctx.globalAlpha = charge * charge * 0.5;
        ctx.lineWidth   = clamp(charge * charge * 18, 1, 18);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Center glow
      if (rootCharge > 0.08 && veinSegs.length > 0) {
        const cx  = veinSegs[0].x1;
        const cy  = veinSegs[0].y1;
        const glR = 8 + rootCharge * 28;
        const gr  = ctx.createRadialGradient(cx, cy, 0, cx, cy, glR);
        gr.addColorStop(0, veinColor(1,   pH));
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = rootCharge * 0.95;
        ctx.fillStyle   = gr;
        ctx.beginPath();
        ctx.arc(cx, cy, glR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    // ── RAF loop ──────────────────────────────────────────────────────────────
    const draw = () => {
      const {
        design: d, energy: e, rawEnergy: re,
        bassEnergy: be, rawBassEnergy: rbe,
        pitchClass: pc, pitchHeight: ph,
        active: isActive, reducedMotion: reduced,
      } = propsRef.current;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      displayEnergy = chaseValue(displayEnergy, normalizeVisualEnergy(e),  reduced ? 0.78 : 0.92, reduced ? 0.55 : 0.72);
      displayBass   = chaseValue(displayBass,   normalizeVisualEnergy(be), reduced ? 0.80 : 0.94, reduced ? 0.58 : 0.75);

      const bassLive = normalizeVisualEnergy(rbe) * 0.88 + displayBass * 0.12;
      const amp      = liveAmplitude(displayEnergy, normalizeVisualEnergy(re), bassLive);

      const safePh  = Number.isFinite(ph) ? ph : 0.5;
      smoothPitchH += (safePh - smoothPitchH) * (reduced ? 0.12 : 0.18);
      time         += reduced ? 0.008 : 0.016;

      // Always reset globalAlpha at top of frame
      ctx.globalAlpha = 1;

      if (!isActive) {
        displayEnergy = 0; displayBass = 0;
        shockwaves.length = 0; debris.length = 0; prevAmp = 0;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
        frameId = requestAnimationFrame(draw);
        return;
      }

      if (d === "radial") {
        drawSupernova(w, h, amp, bassLive, smoothPitchH);
      } else if (d === "grid") {
        drawHexBloom(w, h, amp, bassLive);
      } else {
        drawPlasmaVeins(w, h, amp, bassLive, pc ?? -1, smoothPitchH);
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
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