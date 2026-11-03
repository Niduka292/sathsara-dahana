"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Lock, RotateCcw } from "lucide-react";

export type TimeEra = "past" | "near-past" | "present" | "near-future" | "future";

interface EraMetadata {
  id: TimeEra;
  label: string;
  rangeLabel: string;
  buildVersion: string;
  designParadigm: string;
  tagline: string;
  description: string;
  stabilityRating: string;
  threatRating: string;
  frequencyMhz: string;
  features: string[];
  artifactTitle: string;
  artifactQuote: string;
  ditherCells: { name: string; state: string; code: string }[];
}

const ERA_CONFIG: Record<TimeEra, EraMetadata> = {
  past: {
    id: "past",
    label: "THE DEEP PAST",
    rangeLabel: "Before 2023",
    buildVersion: "SYS_BUILD // 0.11a-LEGACY_WIREFRAME",
    designParadigm: "BLUE_MATRIX // RAW_CRT_VECTOR_GRID [PRE-2023]",
    tagline: "UNCOMPILED ARCHIVAL ECHOES",
    description:
      "Temporal coordinate locked prior to 2023. The Blue Matrix wireframe reconstructs early copper-wire transmissions in raw 1-bit Bayer dither and unshaded vector geometry. Multiple texture nodes remain uncompiled.",
    stabilityRating: "■■■■□□□□□□",
    threatRating: "★★☆☆☆",
    frequencyMhz: "14.400 MHz",
    features: [
      "1-BIT BAYER DITHER RASTERIZATION",
      "UNSHADED CRT VECTOR CATHODE MESH",
      "RAW MEMORY DUMP // SECTOR 1998-2022",
    ],
    artifactTitle: "ARCHIVE_LOG_1998.RAW // SECTOR_01",
    artifactQuote:
      "Before algorithms shaped the stream, every melody was shared across copper wires and glowing cathode-ray tubes.",
    ditherCells: [
      { name: "MODULATION", state: "1-BIT_RAW", code: "0x001" },
      { name: "ATKINSON", state: "LEGACY", code: "0x008" },
      { name: "BAYER_2X2", state: "COARSE", code: "0x01B" },
      { name: "SIERRA_SYNC", state: "MISSING", code: "0x000" },
    ],
  },
  "near-past": {
    id: "near-past",
    label: "THE NEAR PAST",
    rangeLabel: "2023 – Yesterday",
    buildVersion: "SYS_BUILD // 0.28b-ARCHIVE_DOSSIER",
    designParadigm: "BLUE_MATRIX // SUBJECT_DOSSIER_WIREFRAME [2023–2026]",
    tagline: "RECENT MEMORY TRACE IN BLUEPRINT",
    description:
      "Revisiting recent temporal chapters (2023–Yesterday). The unfinished Matrix interface mounts rehearsal telemetry, biometric dither scans, and acoustic stage schematics recorded before the current anchor date.",
    stabilityRating: "■■■■■■■□□□",
    threatRating: "★★★☆☆",
    frequencyMhz: "184.200 MHz",
    features: [
      "ACOUSTIC REHEARSAL WAVEFORM BUFFER",
      "ATKINSON BIOMETRIC DITHER SCANNER",
      "STAGE BLUEPRINT WIREFRAME OVERLAY",
    ],
    artifactTitle: "REHEARSAL_TAPE_FAS.RAW // SECTOR_02",
    artifactQuote:
      "Every late-night rehearsal between 2023 and today laid the foundation for the stage that now awaits.",
    ditherCells: [
      { name: "MODULATION", state: "ARCHIVED", code: "0x02A" },
      { name: "ATKINSON", state: "DITHER_4B", code: "0x03C" },
      { name: "BAYER_MATRIX", state: "LOCKED", code: "0x04E" },
      { name: "SIERRA_SYNC", state: "PARTIAL", code: "0x05F" },
    ],
  },
  present: {
    id: "present",
    label: "THE PRESENT",
    rangeLabel: "Today • Current Temporal Anchor",
    buildVersion: "SYS_BUILD // 0.42b-ORIGIN_SYNC",
    designParadigm: "BLUE_MATRIX // LIVE_STAGE_WIREFRAME [0-POINT_ANCHOR]",
    tagline: "WHERE EVERY NOTE ECHOES IN THE MATRIX",
    description:
      "Anchored in the exact present coordinate. The Blue Matrix prototype streams real-time harmonic telemetry from the Sathsara Dahana stage while asteroid 2026 UA1 phase-locks the sub-lunar corridor.",
    stabilityRating: "■■■■■■■■■□",
    threatRating: "★★★☆☆",
    frequencyMhz: "221.500 MHz",
    features: [
      "0-POINT TEMPORAL ANCHOR SYNCHRONIZATION",
      "SUB-LUNAR ASTEROID 2026 UA1 TELEMETRY",
      "LIVE HARMONIC OSCILLOSCOPE BUS (07.18)",
    ],
    artifactTitle: "LIVE_STAGE_NODE.RAW // 07.18_ORIGIN",
    artifactQuote:
      "Past and future converge right here. The curtain rises on the present symphony inside the blue wireframe grid.",
    ditherCells: [
      { name: "MODULATION", state: "ACTIVE", code: "0x07A" },
      { name: "ATKINSON", state: "DITHER_8B", code: "0x08B" },
      { name: "BAYER_MATRIX", state: "SYNCED", code: "0x09C" },
      { name: "SIERRA_SYNC", state: "LIVE_BUS", code: "0x0AD" },
    ],
  },
  "near-future": {
    id: "near-future",
    label: "THE NEAR FUTURE",
    rangeLabel: "Tomorrow – End of 2028",
    buildVersion: "SYS_BUILD // 0.74rc-SPATIAL_MESH",
    designParadigm: "BLUE_MATRIX // SPATIAL_PROJECTION_GRID [2026–2028]",
    tagline: "UNRENDERED HORIZONS & SPATIAL VECTORS",
    description:
      "Projected into the 2026–2028 near-future corridor. Future stage broadcasts appear as multi-layered isometric wireframe planes and uncompiled spatial shaders suspended in the blue digital rain.",
    stabilityRating: "■■■■■■□□□□",
    threatRating: "★★★★☆",
    frequencyMhz: "443.000 MHz",
    features: [
      "ISOMETRIC SPATIAL WIREFRAME PLANES",
      "PREDICTIVE HARMONIC ECHO PROJECTION",
      "UNCOMPILED HOLOGRAPHIC SHADER NODES [X]",
    ],
    artifactTitle: "SPATIAL_ECHO_2028.RAW // SECTOR_04",
    artifactQuote:
      "The songs performed tonight still ripple outward, suspended in raw wireframe geometry across the years ahead.",
    ditherCells: [
      { name: "MODULATION", state: "PREDICTIVE", code: "0x11A" },
      { name: "ATKINSON", state: "SPATIAL", code: "0x12F" },
      { name: "BAYER_MATRIX", state: "DRAFT_MESH", code: "0x14C" },
      { name: "SIERRA_SYNC", state: "UNCOMPILED", code: "0x19E" },
    ],
  },
  future: {
    id: "future",
    label: "THE FAR FUTURE",
    rangeLabel: "After 2028 (2029 & Beyond)",
    buildVersion: "SYS_BUILD // 0.99x-SINGULARITY_RAW",
    designParadigm: "BLUE_MATRIX // QUANTUM_LATTICE_PROTOTYPE [2029+]",
    tagline: "BEYOND THE WIREFRAME EVENT HORIZON",
    description:
      "Breached the post-2028 boundary. The interface operates in raw quantum lattice debug mode—rendering hyper-dense concentric wireframe singularities, tachyon phase anomalies, and deep-time harmonic logs.",
    stabilityRating: "■■■□□□□□□□",
    threatRating: "★★★★★",
    frequencyMhz: "998.750 MHz",
    features: [
      "HYPER-DENSE TOROIDAL SINGULARITY MESH",
      "TACHYON CAUSALITY BYPASS TELEMETRY",
      "DEEP-TIME QUANTUM MEMORY LATTICE",
    ],
    artifactTitle: "QUANTUM_MEMORY_NODE // 2029+_RAW",
    artifactQuote:
      "Decades from now, the frequencies of Sathsara Dahana remain encoded in the blue wireframe lattice of time.",
    ditherCells: [
      { name: "MODULATION", state: "OVERDRIVE", code: "0xFF1" },
      { name: "ATKINSON", state: "QUANTUM", code: "0xFF4" },
      { name: "BAYER_MATRIX", state: "HYPER_GRID", code: "0xFF8" },
      { name: "SIERRA_SYNC", state: "PARADOX", code: "0xFFF" },
    ],
  },
};

/** Fictional Temporal Direction Models for the "Model selection - Temporal Direction" input */
const TEMPORAL_MODELS = [
  {
    id: "RETRO-VORTEX-09",
    code: "CHRONO_DRIFT // RETRO-SYNTH v0.9",
    direction: "RETROGRADE_VECTOR [⏪ -Δt]",
    status: "EXPERIMENTAL",
  },
  {
    id: "TACHYON-FOLD-X2",
    code: "TACHYON_FOLD // CAUSALITY-BYPASS",
    direction: "PROGRADE_VECTOR [⏩ +Δt]",
    status: "UNSTABLE",
  },
  {
    id: "UA1-SINGULARITY",
    code: "ASTEROID_2026_UA1 // EINSTEIN-ROSEN",
    direction: "SUB_LUNAR_PHASE_LOCK [◈ 0-PT]",
    status: "CALIBRATING",
  },
  {
    id: "KERR-B34-SHIFT",
    code: "KERR_METRIC //SUBJECT_A-34_BRIDGE",
    direction: "ORTHOGONAL_TIMELINE [⧖ ±Ψ]",
    status: "WIREFRAME_ONLY",
  },
] as const;

/** Formats a Date object as local YYYY-MM-DD */
function getTodayDateString(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Classifies a YYYY-MM-DD date string into one of the 5 eras relative to today */
export function resolveEraFromDate(dateStr: string, todayStr: string): TimeEra {
  if (dateStr === todayStr) {
    return "present";
  }
  if (dateStr < "2023-01-01") {
    return "past";
  }
  if (dateStr < todayStr) {
    return "near-past";
  }
  if (dateStr <= "2028-12-31") {
    return "near-future";
  }
  return "future";
}

/** Blue Matrix Digital Rain Background Canvas */
function BlueMatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const fontSize = 14;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン2026UA1HEXΔΨΩ";
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTime = 0;
    const draw = (time: number) => {
      animationFrameId = requestAnimationFrame(draw);
      if (time - lastTime < 45) return;
      lastTime = time;

      ctx.fillStyle = "rgba(1, 6, 15, 0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright cyan-white head, electric blue trail
        ctx.fillStyle = Math.random() > 0.88 ? "#e0f2fe" : "#0ea5e9";
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
    />
  );
}

/** Corner node squares matching the wireframe reference image */
function WireframeCorners() {
  return (
    <>
      <span className="pointer-events-none absolute -top-[3px] -left-[3px] h-1.5 w-1.5 bg-[#7dd3fc] shadow-[0_0_8px_#38bdf8]" />
      <span className="pointer-events-none absolute -top-[3px] -right-[3px] h-1.5 w-1.5 bg-[#7dd3fc] shadow-[0_0_8px_#38bdf8]" />
      <span className="pointer-events-none absolute -bottom-[3px] -left-[3px] h-1.5 w-1.5 bg-[#7dd3fc] shadow-[0_0_8px_#38bdf8]" />
      <span className="pointer-events-none absolute -bottom-[3px] -right-[3px] h-1.5 w-1.5 bg-[#7dd3fc] shadow-[0_0_8px_#38bdf8]" />
    </>
  );
}

// Toggle to hide/lock the interactive Time Portal interface while it is still in the making
const IS_PORTAL_LOCKED = true;

export default function TimePortalExperience() {
  const [todayStr, setTodayStr] = useState<string>("2026-11-01");

  // 6 Interface Inputs from Reference Specification (cleared of default/placeholder values):
  // 1. Username - Temporal Identity / User ID
  // 2. Password - Access Key
  // 3. Time Jump Year - Destination Year
  // 4. Time Jump Month - Destination Month
  // 5. Time Jump Date - Destination Day
  // 6. Model selection - Temporal Direction
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [jumpYear, setJumpYear] = useState<string>("");
  const [jumpMonth, setJumpMonth] = useState<string>("");
  const [jumpDay, setJumpDay] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(TEMPORAL_MODELS[0].id);

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Transition & Active Era state
  const [isWarping, setIsWarping] = useState(false);
  const [warpDisplayYear, setWarpDisplayYear] = useState<string>("2026");
  const [warpDisplayDate, setWarpDisplayDate] = useState<string>("2026-11-01");
  const [warpFromDate, setWarpFromDate] = useState<string>("2026-11-01");
  const [warpToDate, setWarpToDate] = useState<string>("2026-11-01");
  const [activeEra, setActiveEra] = useState<TimeEra | null>(null);
  const [travelledDate, setTravelledDate] = useState<string>("");
  const warpIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const today = getTodayDateString(now);
    setTodayStr(today);
    setWarpDisplayDate(today);
    setWarpDisplayYear(today.slice(0, 4));
  }, []);

  useEffect(() => {
    return () => {
      if (warpIntervalRef.current !== null) {
        window.clearInterval(warpIntervalRef.current);
      }
    };
  }, []);

  // Compose YYYY-MM-DD from the 3 date inputs
  const composedDateResult = useMemo(() => {
    const y = Number(jumpYear.trim());
    const m = Number(jumpMonth.trim());
    const d = Number(jumpDay.trim());

    const yearValid = Number.isInteger(y) && y >= 100 && y <= 9999;
    const monthValid = Number.isInteger(m) && m >= 1 && m <= 12;
    const maxDaysInMonth = yearValid && monthValid ? new Date(y, m, 0).getDate() : 31;
    const dayValid = Number.isInteger(d) && d >= 1 && d <= maxDaysInMonth;

    const dateValid = yearValid && monthValid && dayValid;
    const formatted = dateValid
      ? `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      : "";

    return { yearValid, monthValid, dayValid, dateValid, formatted };
  }, [jumpYear, jumpMonth, jumpDay]);

  const validation = useMemo(() => {
    const usernameValid = username.trim().length >= 2;
    const passwordValid = password.trim().length >= 2;
    const modelValid = TEMPORAL_MODELS.some((m) => m.id === selectedModel);
    const { yearValid, monthValid, dayValid, dateValid, formatted } = composedDateResult;
    const allValid = usernameValid && passwordValid && dateValid && modelValid;

    const validCount = [
      usernameValid,
      passwordValid,
      yearValid,
      monthValid,
      dayValid,
      modelValid,
    ].filter(Boolean).length;

    return {
      usernameValid,
      passwordValid,
      yearValid,
      monthValid,
      dayValid,
      dateValid,
      modelValid,
      allValid,
      validCount,
      targetDate: formatted,
    };
  }, [username, password, selectedModel, composedDateResult]);

  const previewEra = useMemo(() => {
    if (!validation.dateValid || !validation.targetDate) return null;
    return resolveEraFromDate(validation.targetDate, todayStr);
  }, [validation.dateValid, validation.targetDate, todayStr]);

  const currentModelMeta = useMemo(
    () => TEMPORAL_MODELS.find((m) => m.id === selectedModel) ?? TEMPORAL_MODELS[0],
    [selectedModel]
  );

  const applyPresetDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    if (y) setJumpYear(y);
    if (m) setJumpMonth(m);
    if (d) setJumpDay(d);
  };

  const triggerTimeWarp = (destinationDate: string) => {
    const nextEra = resolveEraFromDate(destinationDate, todayStr);
    const previousDate = travelledDate || todayStr;
    const startYear = Number(previousDate.slice(0, 4)) || new Date().getFullYear();
    const endYear = Number(destinationDate.slice(0, 4)) || startYear;

    const [sY, sM, sD] = previousDate.split("-").map(Number);
    const [eY, eM, eD] = destinationDate.split("-").map(Number);
    const startMs = new Date(sY, (sM || 1) - 1, sD || 1).getTime();
    const endMs = new Date(eY, (eM || 1) - 1, eD || 1).getTime();

    setWarpFromDate(previousDate);
    setWarpToDate(destinationDate);
    setWarpDisplayYear(String(startYear));
    setWarpDisplayDate(previousDate);
    setIsWarping(true);

    let step = 0;
    const totalSteps = 22;

    if (warpIntervalRef.current !== null) {
      window.clearInterval(warpIntervalRef.current);
    }

    warpIntervalRef.current = window.setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / totalSteps);
      const interpolatedYear = Math.round(startYear + (endYear - startYear) * progress);
      setWarpDisplayYear(String(interpolatedYear));

      if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
        const currentMs = Math.round(startMs + (endMs - startMs) * progress);
        setWarpDisplayDate(getTodayDateString(new Date(currentMs)));
      }
    }, 85);

    window.setTimeout(() => {
      if (warpIntervalRef.current !== null) {
        window.clearInterval(warpIntervalRef.current);
        warpIntervalRef.current = null;
      }
      setWarpDisplayYear(destinationDate.slice(0, 4));
      setWarpDisplayDate(destinationDate);
      setTravelledDate(destinationDate);
      setActiveEra(nextEra);
      setIsWarping(false);
    }, 2300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validation.allValid || !validation.targetDate) {
      return;
    }

    triggerTimeWarp(validation.targetDate);
  };

  const handleResetToOrigin = () => {
    setActiveEra(null);
  };

  const formattedTravelledDate = useMemo(() => {
    if (!travelledDate) return "";
    const [y, m, d] = travelledDate.split("-").map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [travelledDate]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-100">
      {/* ===================================================================== */}
      {/* COMMON TIME-TRAVEL WORMHOLE TRANSITION OVERLAY                        */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            key="time-warp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-[#01050d] font-mono"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
                  animate={{
                    scale: [0.15, 1.8, 4.8],
                    opacity: [0, 0.9, 0],
                    rotate: i % 2 === 0 ? 180 : -180,
                  }}
                  transition={{
                    duration: 1.7,
                    delay: i * 0.16,
                    repeat: Infinity,
                    ease: "easeIn",
                  }}
                  className="absolute w-64 h-64 border border-[#38bdf8] pointer-events-none"
                  style={{
                    boxShadow:
                      "0 0 35px rgba(56,189,248,0.55), inset 0 0 25px rgba(14,165,233,0.35)",
                  }}
                />
              ))}

              {/* Central Blue Matrix Wireframe Odometer */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 flex flex-col items-center text-center px-8 py-7 bg-[#020816]/95 border border-[#38bdf8] shadow-[0_0_80px_rgba(56,189,248,0.5)]"
              >
                <WireframeCorners />
                <span className="text-[10px] uppercase tracking-[0.35em] text-[#7dd3fc] mb-2">
                  {`// EXECUTING_VECTOR: ${currentModelMeta.id}`}
                </span>
                <div className="text-5xl sm:text-7xl font-bold tracking-[0.18em] text-[#e0f2fe] drop-shadow-[0_0_20px_rgba(56,189,248,0.9)] tabular-nums">
                  {warpDisplayYear}
                </div>
                <div className="mt-2 text-sm sm:text-base tracking-[0.25em] text-[#38bdf8] tabular-nums">
                  {warpDisplayDate}
                </div>
                <div className="mt-2 text-[11px] tracking-[0.2em] text-[#7dd3fc]/80">
                  {warpFromDate} &gt;&gt;&gt; {warpToDate}
                </div>
                <div className="mt-4 w-56 h-2 border border-[#38bdf8]/60 bg-[#01050d] p-0.5">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.1, ease: "linear" }}
                    className="h-full bg-[#38bdf8] shadow-[0_0_12px_#38bdf8]"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* LOCKED / COMING SOON MATRIX VIEW (PUBLIC GATEWAY IN THE MAKING)       */}
      {/* ===================================================================== */}
      {IS_PORTAL_LOCKED && (
        <div className="relative min-h-screen w-full bg-[#01050c] text-[#bae6fd] font-mono py-6 sm:py-10 px-4 sm:px-6 flex flex-col justify-between overflow-hidden">
          {/* Blue Matrix Rain Background */}
          <BlueMatrixRain />

          {/* CRT Scanlines & Phosphor Blue Vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 3px)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(14, 165, 233, 0.14) 0%, rgba(2, 8, 23, 0.72) 68%, rgba(1, 4, 10, 0.95) 100%)",
            }}
          />

          {/* Subtle Background Blueprint Grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(rgba(56, 189, 248, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.18) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          {/* Top Matrix Status Bar */}
          <div className="relative z-20 mx-auto w-full max-w-6xl flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#7dd3fc]">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 border border-[#38bdf8]/50 bg-[#031024]/80 px-2.5 py-1 text-[#bae6fd] hover:bg-[#38bdf8] hover:text-[#01050c] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>EXIT_NODE</span>
              </Link>
              <span>{"SYS_BUILD // 0.42b-LOCKED"}</span>
            </div>
            <span className="hidden md:inline text-[#38bdf8]/70">
              {"MATRIX_BLUE_WIREFRAME // TEMPORAL_GATEWAY"}
            </span>
            <span className="text-[#38bdf8]">
              STATUS: IN_DEVELOPMENT
            </span>
          </div>

          {/* Center Coming Soon Matrix Wireframe Terminal */}
          <div className="relative z-20 my-auto mx-auto w-full max-w-[300px] sm:max-w-xl py-4 sm:py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative border border-[#38bdf8]/80 bg-[#020a18]/80 sm:bg-[#020a18]/92 shadow-[0_0_50px_rgba(14,165,233,0.25),inset_0_0_30px_rgba(14,165,233,0.1)] backdrop-blur-sm sm:backdrop-blur-md"
            >
              <WireframeCorners />

              {/* Terminal Header Strip */}
              <div className="flex items-center justify-between border-b border-[#38bdf8]/65 bg-[#38bdf8]/10 px-3 py-1.5 sm:px-4 sm:py-2.5 text-[8px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em]">
                <span className="font-bold text-[#e0f2fe] truncate">
                  {"PROJECT #2026-UA1 /// TIME_PORTAL"}
                </span>
                <span className="border border-[#38bdf8]/60 bg-[#38bdf8]/15 px-1.5 py-0.5 text-[7px] sm:text-[9px] text-[#7dd3fc] shrink-0 ml-2">
                  LOCKED
                </span>
              </div>

              {/* Terminal Body */}
              <div className="px-4 py-5 sm:px-10 sm:py-12 text-center flex flex-col items-center">
                {/* Lock & Wireframe Ring */}
                <div className="relative mb-3 sm:mb-6 flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-dashed border-[#38bdf8]/60 rounded-full"
                  />
                  <div className="absolute inset-1.5 sm:inset-2 border border-[#38bdf8]/40 bg-[#031229]/90 shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center justify-center">
                    <Lock className="h-4 w-4 sm:h-7 sm:w-7 text-[#7dd3fc] animate-pulse" />
                  </div>
                </div>

                <p className="text-[8px] sm:text-xs uppercase tracking-[0.28em] sm:tracking-[0.35em] text-[#38bdf8] mb-1 sm:mb-2">
                  {"// TEMPORAL_GATEWAY_STATUS //"}
                </p>

                <h1 className="text-xl sm:text-5xl font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#e0f2fe] drop-shadow-[0_0_22px_rgba(56,189,248,0.75)]">
                  COMING SOON
                </h1>

                <div className="my-3 sm:my-5 h-[1px] w-28 sm:w-40 bg-gradient-to-r from-transparent via-[#38bdf8]/75 to-transparent" />

                <p className="max-w-md text-[10px] sm:text-sm leading-relaxed tracking-[0.1em] sm:tracking-[0.12em] text-[#bae6fd]/90">
                  Temporal coordinates are still stabilizing. Public transit remains locked until phase alignment is complete.
                </p>

                <p className="mt-2 sm:mt-2.5 text-[8px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#7dd3fc]/65">
                  {"[ CALIBRATION_IN_PROGRESS // STAND_BY ]"}
                </p>

                {/* Animated Wireframe Progress Bar */}
                <div className="mt-3.5 sm:mt-6 w-full max-w-[210px] sm:max-w-xs border border-[#38bdf8]/60 bg-[#01050d] p-1">
                  <div className="flex items-center justify-between text-[7px] sm:text-[8px] uppercase tracking-[0.2em] text-[#7dd3fc] px-1 mb-0.5 sm:mb-1">
                    <span>COMPILER_SYNC</span>
                    <span>LOCKED</span>
                  </div>
                  <div className="h-1 sm:h-1.5 w-full bg-[#020c1b] overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_10px_#38bdf8]"
                    />
                  </div>
                </div>

                {/* Return Home Action */}
                <div className="mt-4 sm:mt-8">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 sm:gap-2 border border-[#7dd3fc] bg-[#021024] hover:bg-[#38bdf8] text-[#e0f2fe] hover:text-[#01050c] px-4 py-1.5 sm:px-6 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em] transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7)]"
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>RETURN HOME</span>
                  </Link>
                </div>
              </div>

              {/* Terminal Footer Strip */}
              <div className="border-t border-[#38bdf8]/50 bg-[#010612] px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#38bdf8]/75">
                <span>PUBLIC_ACCESS: RESTRICTED</span>
                <span>{todayStr}</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Raw Prototype Footer */}
          <div className="relative z-20 mx-auto w-full max-w-6xl flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#38bdf8]/75">
            <span>{"2026 // SATHSARA_DAHANA_CHRONO_SUBSYSTEM"}</span>
            <span>PORTAL_INTERFACE_LOCKED // COMING_SOON</span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: BLUE MATRIX / UNFINISHED WIREFRAME PROTOTYPE INTERFACE        */}
      {/* ===================================================================== */}
      {!IS_PORTAL_LOCKED && !activeEra && (
        <div className="relative min-h-screen w-full bg-[#01050c] text-[#bae6fd] font-mono py-6 sm:py-10 px-3 sm:px-6 flex flex-col justify-between overflow-hidden">
          {/* Blue Matrix Rain Background */}
          <BlueMatrixRain />

          {/* CRT Scanlines & Phosphor Blue Vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 3px)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.12) 0%, rgba(2, 8, 23, 0.65) 70%, rgba(1, 4, 10, 0.92) 100%)",
            }}
          />

          {/* Main Outer Prototype Blueprint Container */}
          <div className="relative z-20 mx-auto w-full max-w-6xl space-y-3">
            {/* Top Raw Metadata Strip (like "FIGMA ... KRONA" / "DITHERING ALGORITHMS ... DITHERTONE PRO" in reference) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#7dd3fc]">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 border border-[#38bdf8]/50 bg-[#031024]/80 px-2.5 py-1 text-[#bae6fd] hover:bg-[#38bdf8] hover:text-[#01050c] transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>EXIT_NODE</span>
                </Link>
                <span>{"SYS_BUILD // 0.42b-UNFINISHED"}</span>
              </div>
              <span className="hidden md:inline text-[#38bdf8]/70">
                {"MATRIX_BLUE_WIREFRAME // EXPERIMENTAL_PORTAL"}
              </span>
              <span className="text-[#38bdf8]">
                ANCHOR_DATE: {travelledDate || todayStr}
              </span>
            </div>

            {/* Primary Wireframe Frame */}
            <div className="relative border border-[#38bdf8]/75 bg-[#020a18]/90 shadow-[0_0_50px_rgba(14,165,233,0.22),inset_0_0_35px_rgba(14,165,233,0.08)]">
              <WireframeCorners />

              {/* Frame Header Row ("PROJECT #1406 /// TRENDS #2026" style) */}
              <div className="grid grid-cols-12 border-b border-[#38bdf8]/65 text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                <div className="col-span-7 sm:col-span-5 px-3 py-2 border-r border-[#38bdf8]/65 flex items-center justify-between text-[#e0f2fe] font-bold">
                  <span>PROJECT #2026-UA1</span>
                  <span className="text-[9px] px-1.5 py-0.5 border border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#7dd3fc]">
                    WIP_PROTOTYPE
                  </span>
                </div>
                <div className="col-span-5 sm:col-span-4 px-3 py-2 sm:border-r border-[#38bdf8]/65 flex items-center justify-between text-[#38bdf8]">
                  <span>{"///"}</span>
                  <span>SUBJECT A-34</span>
                </div>
                <div className="hidden sm:flex sm:col-span-3 px-3 py-2 items-center justify-between text-[#7dd3fc]">
                  <span>MEM_LOCK: {validation.validCount}/6</span>
                  <span className="inline-flex gap-1">
                    <span className="px-1 border border-[#38bdf8] text-[9px]">M</span>
                    <span className="px-1 border border-[#38bdf8] bg-[#38bdf8] text-[#01050c] text-[9px] font-bold">
                      TX
                    </span>
                  </span>
                </div>
              </div>

              {/* Main 2-Column Blueprint Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* ========================================================= */}
                {/* LEFT COLUMN: 3D WIREFRAME ROOM, GLOBE, UNFINISHED BLOCKS  */}
                {/* ========================================================= */}
                <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#38bdf8]/65 flex flex-col justify-between">
                  {/* Top Split: Unfinished Placeholder Viewport + Wireframe Globe */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-[#38bdf8]/65">
                    {/* Left Sub-Box: 3D Perspective Wireframe Tunnel with [X] Unfinished Nodes */}
                    <div className="sm:col-span-7 relative p-3 border-b sm:border-b-0 sm:border-r border-[#38bdf8]/65 min-h-[210px] flex flex-col justify-between overflow-hidden bg-[#010612]">
                      <div className="flex items-center justify-between text-[9px] tracking-[0.18em] text-[#7dd3fc]/80 z-10">
                        <span>{"VIEWPORT_01 // 3D_TUNNEL"}</span>
                        <span className="text-[#38bdf8]">[WIREFRAME_ONLY]</span>
                      </div>

                      {/* 3D Perspective Room Grid SVG (Matches Center Panel of Reference) */}
                      <svg
                        viewBox="0 0 320 180"
                        className="w-full h-40 my-1 overflow-visible"
                        aria-hidden="true"
                      >
                        {/* Outer & Inner Perspective Rectangles */}
                        <rect
                          x="4"
                          y="4"
                          width="312"
                          height="172"
                          fill="none"
                          stroke="#38bdf8"
                          strokeOpacity="0.6"
                          strokeWidth="1"
                        />
                        <rect
                          x="36"
                          y="24"
                          width="248"
                          height="132"
                          fill="none"
                          stroke="#38bdf8"
                          strokeOpacity="0.35"
                          strokeWidth="0.75"
                        />
                        <rect
                          x="68"
                          y="44"
                          width="184"
                          height="92"
                          fill="none"
                          stroke="#38bdf8"
                          strokeOpacity="0.4"
                          strokeWidth="0.75"
                        />
                        <rect
                          x="100"
                          y="64"
                          width="120"
                          height="52"
                          fill="rgba(14,165,233,0.06)"
                          stroke="#7dd3fc"
                          strokeOpacity="0.7"
                          strokeWidth="1"
                        />

                        {/* Perspective Diagonal Rays */}
                        <line x1="4" y1="4" x2="100" y2="64" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
                        <line x1="316" y1="4" x2="220" y2="64" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
                        <line x1="4" y1="176" x2="100" y2="116" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
                        <line x1="316" y1="176" x2="220" y2="116" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />

                        {/* Mid-Grid Rays */}
                        <line x1="160" y1="4" x2="160" y2="64" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />
                        <line x1="160" y1="116" x2="160" y2="176" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />
                        <line x1="4" y1="90" x2="100" y2="90" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />
                        <line x1="220" y1="90" x2="316" y2="90" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />

                        {/* Unfinished Placeholder [X] Boxes (like Panel 1 top-left) */}
                        <g stroke="#7dd3fc" strokeWidth="1">
                          <rect x="20" y="130" width="24" height="24" fill="#010816" />
                          <line x1="20" y1="130" x2="44" y2="154" />
                          <line x1="44" y1="130" x2="20" y2="154" />

                          <rect x="272" y="22" width="24" height="24" fill="#010816" />
                          <line x1="272" y1="22" x2="296" y2="46" />
                          <line x1="296" y1="22" x2="272" y2="46" />
                        </g>

                        {/* Dithered Anomaly Core in Center */}
                        <ellipse
                          cx="160"
                          cy="78"
                          rx="38"
                          ry="13"
                          fill="rgba(56,189,248,0.22)"
                          stroke="#e0f2fe"
                          strokeWidth="1"
                          strokeDasharray="3 2"
                        />
                        <ellipse
                          cx="160"
                          cy="104"
                          rx="30"
                          ry="9"
                          fill="rgba(14,165,233,0.15)"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x="160"
                          y="93"
                          textAnchor="middle"
                          fill="#e0f2fe"
                          fontSize="8"
                          letterSpacing="2"
                        >
                          {validation.targetDate || "UNSET_COORD"}
                        </text>
                      </svg>

                      <div className="flex items-center justify-between text-[9px] tracking-[0.15em] text-[#38bdf8]/80 z-10">
                        <span>ERR_SHADER_04: UNCOMPILED</span>
                        <span>FPS: 24.0</span>
                      </div>
                    </div>

                    {/* Right Sub-Box: Wireframe Sphere Globe (Matches Panel 1 Top-Right) */}
                    <div className="sm:col-span-5 p-3 flex flex-col justify-between bg-[#010816]">
                      <div>
                        <div className="text-[11px] font-bold tracking-[0.2em] text-[#e0f2fe]">
                          PORTAL
                        </div>
                        <div className="text-[10px] tracking-[0.2em] text-[#38bdf8]">
                          #2026_UA1
                        </div>
                        <div className="mt-1.5 space-y-0.5 text-[8px] tracking-[0.15em] text-[#7dd3fc]/70 uppercase">
                          <p>GLOBAL_MESH: RAW</p>
                          <p>TEXTURE_PASS: NONE</p>
                          <p>TEMPORAL_LOCK: {validation.allValid ? "READY" : "PENDING"}</p>
                        </div>
                      </div>

                      {/* Rotating Wireframe Sphere SVG */}
                      <div className="my-2 flex items-center justify-center">
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                          viewBox="0 0 120 120"
                          className="w-28 h-28"
                          aria-hidden="true"
                        >
                          <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="1.2"
                          />
                          {[42, 28, 14].map((rx) => (
                            <ellipse
                              key={`v-${rx}`}
                              cx="60"
                              cy="60"
                              rx={rx}
                              ry="52"
                              fill="none"
                              stroke="#38bdf8"
                              strokeOpacity="0.65"
                              strokeWidth="0.8"
                            />
                          ))}
                          {[38, 22, 8].map((ry) => (
                            <ellipse
                              key={`h-${ry}`}
                              cx="60"
                              cy="60"
                              rx="52"
                              ry={ry}
                              fill="none"
                              stroke="#7dd3fc"
                              strokeOpacity="0.55"
                              strokeWidth="0.8"
                            />
                          ))}
                          <circle
                            cx="60"
                            cy="60"
                            r="4"
                            fill="#e0f2fe"
                          />
                        </motion.svg>
                      </div>

                      <div className="flex items-center justify-between text-[8px] tracking-[0.15em] text-[#7dd3fc] border-t border-[#38bdf8]/40 pt-1">
                        <span>1999</span>
                        <span>----</span>
                        <span>{jumpYear || "2026"}</span>
                        <span>----</span>
                        <span>2035</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Strip: 4 Sub-Module Dither Cells (Matches Panel 2 middle row) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#38bdf8]/65 bg-[#010714]">
                    {[
                      { name: "MODULATION", state: "ACTIVE", code: "0x01A" },
                      { name: "ATKINSON", state: "DITHER_8B", code: "0x02F" },
                      { name: "BAYER_MATRIX", state: "RAW_GRID", code: "0x04C" },
                      { name: "SIERRA_SYNC", state: "UNFINISHED", code: "0x09E" },
                    ].map((cell, idx) => (
                      <div
                        key={cell.name}
                        className={`p-2.5 flex flex-col justify-between border-[#38bdf8]/50 ${
                          idx < 3 ? "sm:border-r" : ""
                        } ${idx % 2 === 0 ? "border-r sm:border-r" : ""} ${
                          idx < 2 ? "border-b sm:border-b-0" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between text-[8px] text-[#7dd3fc]/70">
                          <span>{cell.code}</span>
                          <span className="h-1.5 w-1.5 bg-[#38bdf8]" />
                        </div>

                        {/* Dithered Scan Portrait / Reticle Placeholder */}
                        <div className="my-2 h-14 border border-dashed border-[#38bdf8]/45 bg-[#020c20] relative flex items-center justify-center overflow-hidden">
                          <div
                            className="absolute inset-0 opacity-35"
                            style={{
                              backgroundImage:
                                "radial-gradient(#38bdf8 1px, transparent 1px)",
                              backgroundSize: "4px 4px",
                            }}
                          />
                          <span className="relative z-10 text-[9px] tracking-[0.15em] text-[#bae6fd] bg-[#01050c]/85 px-1.5 py-0.5 border border-[#38bdf8]/50">
                            {cell.state}
                          </span>
                        </div>

                        <div className="border border-[#38bdf8]/60 py-0.5 text-center text-[9px] tracking-[0.18em] text-[#e0f2fe] bg-[#38bdf8]/10">
                          {cell.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Strip: Sine-Wave Oscilloscope & Hex Telemetry (Matches Panel 2 & 3 bottom) */}
                  <div className="p-3 bg-[#010612] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[9px] tracking-[0.2em] text-[#7dd3fc] mb-1.5">
                      <span>{"// HARMONIC_WAVEFORM_OSCILLOSCOPE"}</span>
                      <span>FREQ: 221.500 MHz</span>
                    </div>

                    <div className="relative border border-[#38bdf8]/60 bg-[#01050d] p-2">
                      <svg viewBox="0 0 400 64" className="w-full h-14 overflow-visible">
                        {/* Background Oscilloscope Grid */}
                        {[0, 16, 32, 48, 64].map((y) => (
                          <line
                            key={`gy-${y}`}
                            x1="0"
                            y1={y}
                            x2="400"
                            y2={y}
                            stroke="#38bdf8"
                            strokeOpacity="0.22"
                            strokeWidth="0.7"
                          />
                        ))}
                        {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
                          <line
                            key={`gx-${x}`}
                            x1={x}
                            y1="0"
                            x2={x}
                            y2="64"
                            stroke="#38bdf8"
                            strokeOpacity="0.22"
                            strokeWidth="0.7"
                          />
                        ))}
                        {/* Primary Glowing Sine Wave */}
                        <path
                          d="M 0 32 Q 25 4, 50 32 T 100 32 T 150 32 T 200 32 T 250 32 T 300 32 T 350 32 T 400 32"
                          fill="none"
                          stroke="#e0f2fe"
                          strokeWidth="1.8"
                          style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
                        />
                        {/* Secondary Phase-Shifted Wave */}
                        <path
                          d="M 0 32 Q 25 60, 50 32 T 100 32 T 150 32 T 200 32 T 250 32 T 300 32 T 350 32 T 400 32"
                          fill="none"
                          stroke="#38bdf8"
                          strokeOpacity="0.6"
                          strokeWidth="1"
                          strokeDasharray="3 2"
                        />
                      </svg>
                    </div>

                    {/* Raw Hex/Numeric Dump Row */}
                    <div className="mt-2 grid grid-cols-6 sm:grid-cols-10 gap-1 text-[8px] sm:text-[9px] tracking-[0.14em] text-[#38bdf8]/85 tabular-nums">
                      {[
                        "48 69",
                        "00084",
                        "76 63",
                        "077 88",
                        "24450",
                        "43 45",
                        "331 09",
                        "2026U",
                        "A1 07",
                        "18 00",
                      ].map((hex, i) => (
                        <span key={i} className="truncate">
                          {hex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN: 6 TABULAR WIREFRAME INPUTS + EXECUTION      */}
                {/* ========================================================= */}
                <div className="lg:col-span-6 flex flex-col justify-between bg-[#020917]">
                  <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full justify-between">
                    <div>
                      {/* Section Header Banner */}
                      <div className="px-4 py-2.5 border-b border-[#38bdf8]/65 bg-[#38bdf8]/10 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#e0f2fe]">
                          {"// TEMPORAL_INTERFACE_INPUTS [RAW_FORM]"}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">
                          STATUS: {validation.allValid ? "LOCKED_IN" : "INCOMPLETE"}
                        </span>
                      </div>

                      {/* 6 Tabular Input Rows styled after "// DESIGNER_ ... VASILCHENKO OLGA" */}
                      <div className="divide-y divide-[#38bdf8]/55">
                        {/* 1. Username - Temporal Identity / User ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-1.5 sm:gap-3 hover:bg-[#38bdf8]/[0.05] transition-colors">
                          <label
                            htmlFor="tp-username"
                            className="sm:col-span-5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc] flex flex-col"
                          >
                            <span className="font-bold text-[#e0f2fe]">{"// USERNAME_"}</span>
                            <span className="text-[9px] text-[#38bdf8]/75">
                              Temporal Identity / User ID
                            </span>
                          </label>
                          <div className="sm:col-span-7 flex items-center gap-2">
                            <input
                              id="tp-username"
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              autoComplete="off"
                              className="w-full border border-[#38bdf8]/60 bg-[#01050d] px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-[#e0f2fe] focus:border-[#e0f2fe] focus:shadow-[0_0_12px_rgba(56,189,248,0.45)] focus:outline-none"
                            />
                            <span
                              className={`text-[9px] px-1.5 py-1 border ${
                                validation.usernameValid
                                  ? "border-[#38bdf8] bg-[#38bdf8]/20 text-[#e0f2fe]"
                                  : "border-rose-500/60 bg-rose-950/40 text-rose-300"
                              }`}
                            >
                              {validation.usernameValid ? "OK" : "ERR"}
                            </span>
                          </div>
                        </div>

                        {/* 2. Password - Access Key */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-1.5 sm:gap-3 hover:bg-[#38bdf8]/[0.05] transition-colors">
                          <label
                            htmlFor="tp-password"
                            className="sm:col-span-5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc] flex flex-col"
                          >
                            <span className="font-bold text-[#e0f2fe]">{"// PASSWORD_"}</span>
                            <span className="text-[9px] text-[#38bdf8]/75">
                              Access Key
                            </span>
                          </label>
                          <div className="sm:col-span-7 flex items-center gap-2">
                            <input
                              id="tp-password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              autoComplete="off"
                              className="w-full border border-[#38bdf8]/60 bg-[#01050d] px-3 py-1.5 text-xs tracking-[0.2em] text-[#e0f2fe] focus:border-[#e0f2fe] focus:shadow-[0_0_12px_rgba(56,189,248,0.45)] focus:outline-none"
                            />
                            <span
                              className={`text-[9px] px-1.5 py-1 border ${
                                validation.passwordValid
                                  ? "border-[#38bdf8] bg-[#38bdf8]/20 text-[#e0f2fe]"
                                  : "border-rose-500/60 bg-rose-950/40 text-rose-300"
                              }`}
                            >
                              {validation.passwordValid ? "KEY" : "ERR"}
                            </span>
                          </div>
                        </div>

                        {/* 3. Time Jump Year - Destination Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-1.5 sm:gap-3 hover:bg-[#38bdf8]/[0.05] transition-colors">
                          <label
                            htmlFor="tp-year"
                            className="sm:col-span-5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc] flex flex-col"
                          >
                            <span className="font-bold text-[#e0f2fe]">{"// TIME_JUMP_YEAR_"}</span>
                            <span className="text-[9px] text-[#38bdf8]/75">
                              Destination Year (YYYY)
                            </span>
                          </label>
                          <div className="sm:col-span-7 flex items-center gap-2">
                            <input
                              id="tp-year"
                              type="number"
                              min={100}
                              max={9999}
                              value={jumpYear}
                              onChange={(e) => setJumpYear(e.target.value)}
                              className="w-full border border-[#38bdf8]/60 bg-[#01050d] px-3 py-1.5 text-xs tracking-[0.2em] text-[#e0f2fe] tabular-nums focus:border-[#e0f2fe] focus:shadow-[0_0_12px_rgba(56,189,248,0.45)] focus:outline-none"
                            />
                            <span
                              className={`text-[9px] px-1.5 py-1 border ${
                                validation.yearValid
                                  ? "border-[#38bdf8] bg-[#38bdf8]/20 text-[#e0f2fe]"
                                  : "border-rose-500/60 bg-rose-950/40 text-rose-300"
                              }`}
                            >
                              YR
                            </span>
                          </div>
                        </div>

                        {/* 4. Time Jump Month - Destination Month */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-1.5 sm:gap-3 hover:bg-[#38bdf8]/[0.05] transition-colors">
                          <label
                            htmlFor="tp-month"
                            className="sm:col-span-5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc] flex flex-col"
                          >
                            <span className="font-bold text-[#e0f2fe]">{"// TIME_JUMP_MONTH_"}</span>
                            <span className="text-[9px] text-[#38bdf8]/75">
                              Destination Month (01–12)
                            </span>
                          </label>
                          <div className="sm:col-span-7 flex items-center gap-2">
                            <input
                              id="tp-month"
                              type="number"
                              min={1}
                              max={12}
                              value={jumpMonth}
                              onChange={(e) => setJumpMonth(e.target.value)}
                              className="w-full border border-[#38bdf8]/60 bg-[#01050d] px-3 py-1.5 text-xs tracking-[0.2em] text-[#e0f2fe] tabular-nums focus:border-[#e0f2fe] focus:shadow-[0_0_12px_rgba(56,189,248,0.45)] focus:outline-none"
                            />
                            <span
                              className={`text-[9px] px-1.5 py-1 border ${
                                validation.monthValid
                                  ? "border-[#38bdf8] bg-[#38bdf8]/20 text-[#e0f2fe]"
                                  : "border-rose-500/60 bg-rose-950/40 text-rose-300"
                              }`}
                            >
                              MO
                            </span>
                          </div>
                        </div>

                        {/* 5. Time Jump Date - Destination Day */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-1.5 sm:gap-3 hover:bg-[#38bdf8]/[0.05] transition-colors">
                          <label
                            htmlFor="tp-day"
                            className="sm:col-span-5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc] flex flex-col"
                          >
                            <span className="font-bold text-[#e0f2fe]">{"// TIME_JUMP_DATE_"}</span>
                            <span className="text-[9px] text-[#38bdf8]/75">
                              Destination Day (01–31)
                            </span>
                          </label>
                          <div className="sm:col-span-7 flex items-center gap-2">
                            <input
                              id="tp-day"
                              type="number"
                              min={1}
                              max={31}
                              value={jumpDay}
                              onChange={(e) => setJumpDay(e.target.value)}
                              className="w-full border border-[#38bdf8]/60 bg-[#01050d] px-3 py-1.5 text-xs tracking-[0.2em] text-[#e0f2fe] tabular-nums focus:border-[#e0f2fe] focus:shadow-[0_0_12px_rgba(56,189,248,0.45)] focus:outline-none"
                            />
                            <span
                              className={`text-[9px] px-1.5 py-1 border ${
                                validation.dayValid
                                  ? "border-[#38bdf8] bg-[#38bdf8]/20 text-[#e0f2fe]"
                                  : "border-rose-500/60 bg-rose-950/40 text-rose-300"
                              }`}
                            >
                              DY
                            </span>
                          </div>
                        </div>

                        {/* 6. Model selection - Temporal Direction (Fictional Models) */}
                        <div className="px-4 py-3 space-y-2 hover:bg-[#38bdf8]/[0.05] transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor="tp-model"
                              className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#7dd3fc]"
                            >
                              <span className="font-bold text-[#e0f2fe]">
                                {"// MODEL_SELECTION_"}
                              </span>{" "}
                              <span className="text-[9px] text-[#38bdf8]/75">
                                (Temporal Direction)
                              </span>
                            </label>
                            <span className="text-[9px] uppercase tracking-[0.16em] text-[#38bdf8]">
                              {currentModelMeta.direction}
                            </span>
                          </div>

                          <select
                            id="tp-model"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full border border-[#38bdf8]/70 bg-[#01050d] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#e0f2fe] focus:border-[#e0f2fe] focus:outline-none cursor-pointer"
                          >
                            {TEMPORAL_MODELS.map((m) => (
                              <option key={m.id} value={m.id} className="bg-[#01050d] text-[#e0f2fe]">
                                {`${m.code} — ${m.direction}`}
                              </option>
                            ))}
                          </select>

                          {/* Wireframe Quick Model Matrix Pills */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {TEMPORAL_MODELS.map((m) => {
                              const active = selectedModel === m.id;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => setSelectedModel(m.id)}
                                  className={`px-2 py-1 text-left border text-[9px] uppercase tracking-[0.12em] transition-colors cursor-pointer truncate ${
                                    active
                                      ? "border-[#e0f2fe] bg-[#38bdf8]/25 text-[#e0f2fe] font-bold shadow-[0_0_10px_rgba(56,189,248,0.35)]"
                                      : "border-[#38bdf8]/35 bg-[#01050d]/80 text-[#7dd3fc]/70 hover:border-[#38bdf8]"
                                  }`}
                                >
                                  {active ? "■ " : "□ "}
                                  {m.id}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Live Diagnostic Readout Rows (Matching Panel 1 & Panel 3 telemetry rows) */}
                        <div className="grid grid-cols-12 items-center px-4 py-2 text-[10px] uppercase tracking-[0.18em]">
                          <span className="col-span-5 text-[#7dd3fc]">{"// TARGET_ERA_"}</span>
                          <span className="col-span-7 text-right font-bold text-[#e0f2fe]">
                            {previewEra ? ERA_CONFIG[previewEra].label : "INVALID_COORDINATE"}
                          </span>
                        </div>

                        <div className="grid grid-cols-12 items-center px-4 py-2 text-[10px] uppercase tracking-[0.18em]">
                          <span className="col-span-5 text-[#7dd3fc]">{"// STABILITY_"}</span>
                          <span className="col-span-7 text-right text-[#38bdf8] tracking-[0.25em]">
                            ■■■■■■□□□□ <span className="text-[9px] text-[#e0f2fe]">UNSTABLE</span>
                          </span>
                        </div>

                        {/* Debug Quick Era Coordinate Presets */}
                        <div className="px-4 py-2.5 bg-[#010612]">
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]/80 mb-1.5">
                            <span>{"// QUICK_TEST_COORDINATES [DEBUG]:"}</span>
                            <span>{validation.targetDate || "----"}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "PAST [1999]", date: "1999-12-31" },
                              { label: "NEAR_PAST [2024]", date: "2024-06-15" },
                              { label: "PRESENT [TODAY]", date: todayStr },
                              { label: "NEAR_FUT [2027]", date: "2027-08-20" },
                              { label: "FAR_FUT [2035]", date: "2035-01-01" },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => applyPresetDate(preset.date)}
                                className={`px-2 py-1 border text-[9px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                                  validation.targetDate === preset.date
                                    ? "border-[#e0f2fe] bg-[#38bdf8] text-[#01050c] font-bold"
                                    : "border-[#38bdf8]/45 bg-[#020a18] text-[#7dd3fc] hover:border-[#38bdf8] hover:text-[#e0f2fe]"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Banner if Invalid */}
                    {submitAttempted && !validation.allValid && (
                      <div className="mx-4 mt-2 border border-rose-500/70 bg-rose-950/40 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-rose-200">
                        {"ERR_INVALID_PARAMS // VERIFY USERNAME, ACCESS_KEY & VALID CALENDAR DATE."}
                      </div>
                    )}

                    {/* Bottom Execution Block (Styled like Panel 1's oversized "TRENDS" + directional chevrons) */}
                    <div className="p-4 border-t border-[#38bdf8]/65 bg-[#010612] space-y-2.5">
                      <button
                        type="submit"
                        className="group relative w-full border-2 border-[#7dd3fc] bg-[#021024] hover:bg-[#38bdf8] text-[#e0f2fe] hover:text-[#01050c] py-3.5 px-5 transition-all shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_40px_rgba(56,189,248,0.75)] cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] tracking-[0.25em] uppercase opacity-80">
                            [EXEC_WARP]
                          </span>
                          <span className="text-lg sm:text-2xl font-black tracking-[0.28em] uppercase">
                            TIME JUMP
                          </span>
                          <span className="text-xs tracking-[0.2em] font-bold">
                            &gt;&gt;&gt;&gt;
                          </span>
                        </div>
                      </button>

                      {/* Decorative Wireframe Wedge Bar (like bottom of Panel 1) */}
                      <div className="grid grid-cols-4 gap-2 pt-0.5" aria-hidden="true">
                        {[0, 1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className="h-3 border border-[#38bdf8]/50 bg-[linear-gradient(90deg,rgba(56,189,248,0.35)_0%,rgba(56,189,248,0.05)_100%)] flex items-center justify-end pr-1"
                          >
                            <span className="h-1.5 w-1 bg-[#7dd3fc]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom Raw Prototype Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#38bdf8]/75">
              <span>{"2026 // SATHSARA_DAHANA_CHRONO_SUBSYSTEM"}</span>
              <span>WARNING: UI_SHELL_INCOMPLETE [WIREFRAME_DEBUG_ENABLED]</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: DESTINATION ERA INTERFACES (5 DISTINCT WEB DESIGN ERAS)       */}
      {/* ===================================================================== */}
      {!IS_PORTAL_LOCKED && activeEra && (
        <EraDestinationInterface
          era={activeEra}
          travelledDate={travelledDate}
          formattedDate={formattedTravelledDate}
          todayStr={todayStr}
          operatorId={username}
          temporalModel={currentModelMeta.code}
          onSelectNewDate={(nextDate) => {
            applyPresetDate(nextDate);
            triggerTimeWarp(nextDate);
          }}
          onReturnToOrigin={handleResetToOrigin}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* ERA-SPECIFIC BLUE MATRIX WIREFRAME DESTINATION COMPONENT                  */
/* ========================================================================= */

interface EraDestinationProps {
  era: TimeEra;
  travelledDate: string;
  formattedDate: string;
  todayStr: string;
  operatorId: string;
  temporalModel: string;
  onSelectNewDate: (date: string) => void;
  onReturnToOrigin: () => void;
}

/** Era-specific 3D wireframe SVG schematic rendered inside the primary viewport */
function EraWireframeSchematic({
  era,
  travelledDate,
}: {
  era: TimeEra;
  travelledDate: string;
}) {
  return (
    <svg
      viewBox="0 0 360 200"
      className="w-full h-48 my-1 overflow-visible"
      aria-hidden="true"
    >
      {/* Common 3D Perspective Room Wireframe (Matches Center Reference Panel) */}
      <rect
        x="4"
        y="4"
        width="352"
        height="192"
        fill="none"
        stroke="#38bdf8"
        strokeOpacity="0.65"
        strokeWidth="1"
      />
      <rect
        x="40"
        y="26"
        width="280"
        height="148"
        fill="none"
        stroke="#38bdf8"
        strokeOpacity="0.35"
        strokeWidth="0.75"
      />
      <rect
        x="76"
        y="48"
        width="208"
        height="104"
        fill="none"
        stroke="#38bdf8"
        strokeOpacity="0.4"
        strokeWidth="0.75"
      />
      <rect
        x="112"
        y="70"
        width="136"
        height="60"
        fill="rgba(14,165,233,0.06)"
        stroke="#7dd3fc"
        strokeOpacity="0.75"
        strokeWidth="1"
      />

      {/* Perspective Corner Diagonal Rays */}
      <line x1="4" y1="4" x2="112" y2="70" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
      <line x1="356" y1="4" x2="248" y2="70" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
      <line x1="4" y1="196" x2="112" y2="130" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
      <line x1="356" y1="196" x2="248" y2="130" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />

      {/* Mid-Grid Rays */}
      <line x1="180" y1="4" x2="180" y2="70" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />
      <line x1="180" y1="130" x2="180" y2="196" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />
      <line x1="4" y1="100" x2="112" y2="100" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />
      <line x1="248" y1="100" x2="356" y2="100" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 3" />

      {/* Unfinished Placeholder [X] Boxes (like Reference Panel 1 top-left) */}
      <g stroke="#7dd3fc" strokeWidth="1">
        <rect x="18" y="148" width="26" height="26" fill="#010816" />
        <line x1="18" y1="148" x2="44" y2="174" />
        <line x1="44" y1="148" x2="18" y2="174" />

        <rect x="314" y="20" width="26" height="26" fill="#010816" />
        <line x1="314" y1="20" x2="340" y2="46" />
        <line x1="340" y1="20" x2="314" y2="46" />
      </g>

      {/* ERA-SPECIFIC CENTRAL WIREFRAME OBJECT */}
      {era === "past" && (
        /* Deep Past: Low-Poly CRT Terminal & Magnetic Tape Spools */
        <g stroke="#e0f2fe" strokeWidth="1.1" fill="rgba(56,189,248,0.12)">
          <rect x="135" y="68" width="90" height="58" />
          <rect x="143" y="75" width="74" height="40" fill="#01050d" stroke="#38bdf8" />
          <circle cx="163" cy="95" r="10" fill="none" stroke="#7dd3fc" strokeDasharray="2 2" />
          <circle cx="197" cy="95" r="10" fill="none" stroke="#7dd3fc" strokeDasharray="2 2" />
          <line x1="163" y1="85" x2="197" y2="85" stroke="#e0f2fe" />
          <polygon points="125,134 235,134 245,146 115,146" fill="rgba(14,165,233,0.18)" stroke="#38bdf8" />
        </g>
      )}

      {era === "near-past" && (
        /* Near Past: Circuit Board Schematic & Acoustic Stage Blueprint (Reference Panel 3) */
        <g stroke="#e0f2fe" strokeWidth="1" fill="none">
          <rect x="132" y="66" width="96" height="68" fill="rgba(14,165,233,0.1)" stroke="#38bdf8" />
          <rect x="162" y="82" width="36" height="36" fill="#010816" stroke="#e0f2fe" strokeWidth="1.4" />
          <line x1="162" y1="118" x2="198" y2="82" stroke="#7dd3fc" />
          {/* Circuit Traces */}
          <polyline points="132,80 150,80 162,90" stroke="#7dd3fc" />
          <polyline points="228,85 210,85 198,95" stroke="#7dd3fc" />
          <polyline points="132,115 148,115 162,106" stroke="#7dd3fc" />
          <polyline points="228,118 212,118 198,108" stroke="#7dd3fc" />
          <circle cx="150" cy="80" r="2.5" fill="#e0f2fe" />
          <circle cx="210" cy="85" r="2.5" fill="#e0f2fe" />
          <circle cx="148" cy="115" r="2.5" fill="#e0f2fe" />
          <circle cx="212" cy="118" r="2.5" fill="#e0f2fe" />
        </g>
      )}

      {era === "present" && (
        /* Present: Dual Harmonic Vortex & Asteroid 2026 UA1 Core (Reference Panel 2) */
        <g>
          <ellipse
            cx="180"
            cy="84"
            rx="46"
            ry="16"
            fill="rgba(56,189,248,0.22)"
            stroke="#e0f2fe"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <ellipse
            cx="180"
            cy="116"
            rx="38"
            ry="12"
            fill="rgba(14,165,233,0.18)"
            stroke="#38bdf8"
            strokeWidth="1.1"
          />
          <circle cx="180" cy="100" r="22" fill="none" stroke="#7dd3fc" strokeDasharray="2 2" />
          <circle cx="180" cy="100" r="4" fill="#e0f2fe" />
        </g>
      )}

      {era === "near-future" && (
        /* Near Future: Isometric Spatial Floating Wireframe Layers */
        <g stroke="#e0f2fe" strokeWidth="1" fill="rgba(56,189,248,0.1)">
          <polygon points="180,58 236,80 180,102 124,80" />
          <polygon points="180,78 236,100 180,122 124,100" stroke="#7dd3fc" />
          <polygon points="180,98 236,120 180,142 124,120" stroke="#38bdf8" />
          <line x1="180" y1="58" x2="180" y2="142" stroke="#e0f2fe" strokeDasharray="2 2" />
        </g>
      )}

      {era === "future" && (
        /* Far Future: Hyper-Dense Quantum Torus & Singularity Lattice */
        <g stroke="#e0f2fe" fill="none">
          <circle cx="180" cy="100" r="42" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="180" cy="100" r="30" stroke="#7dd3fc" strokeWidth="1" />
          <ellipse cx="180" cy="100" rx="42" ry="15" stroke="#e0f2fe" strokeWidth="1.1" />
          <ellipse cx="180" cy="100" rx="15" ry="42" stroke="#e0f2fe" strokeWidth="1.1" />
          <polygon
            points="180,64 216,100 180,136 144,100"
            stroke="#38bdf8"
            strokeWidth="1"
            fill="rgba(56,189,248,0.15)"
          />
          <circle cx="180" cy="100" r="5" fill="#e0f2fe" />
        </g>
      )}

      {/* Coordinate Stamp Overlay */}
      <text
        x="180"
        y="186"
        textAnchor="middle"
        fill="#e0f2fe"
        fontSize="8.5"
        letterSpacing="2.5"
      >
        {`COORD_LOCK // ${travelledDate} [${era.toUpperCase()}]`}
      </text>
    </svg>
  );
}

function EraDestinationInterface({
  era,
  travelledDate,
  formattedDate,
  todayStr,
  operatorId,
  temporalModel,
  onSelectNewDate,
  onReturnToOrigin,
}: EraDestinationProps) {
  const [quickDate, setQuickDate] = useState(travelledDate);
  const meta = ERA_CONFIG[era];
  const destinationYear = travelledDate.slice(0, 4) || "2026";

  useEffect(() => {
    setQuickDate(travelledDate);
  }, [travelledDate]);

  return (
    <div className="relative min-h-screen w-full bg-[#01050c] text-[#bae6fd] font-mono py-6 sm:py-10 px-3 sm:px-6 flex flex-col justify-between overflow-hidden">
      {/* Unified Blue Matrix Rain Background across ALL eras */}
      <BlueMatrixRain />

      {/* CRT Scanlines & Phosphor Blue Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.12) 0%, rgba(2, 8, 23, 0.65) 70%, rgba(1, 4, 10, 0.92) 100%)",
        }}
      />

      {/* Main Outer Prototype Blueprint Container */}
      <div className="relative z-20 mx-auto w-full max-w-6xl space-y-3">
        {/* Top Raw Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] sm:text-xs tracking-[0.22em] uppercase text-[#7dd3fc]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToOrigin}
              className="inline-flex items-center gap-1.5 border border-[#38bdf8]/60 bg-[#031024]/85 px-2.5 py-1 text-[#e0f2fe] hover:bg-[#38bdf8] hover:text-[#01050c] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>RETURN_TO_INPUT_MATRIX</span>
            </button>
            <span>{meta.buildVersion}</span>
          </div>
          <span className="hidden md:inline text-[#38bdf8]/80">
            {meta.designParadigm}
          </span>
          <span className="text-[#e0f2fe] font-bold">
            {`ACTIVE_NODE: ${travelledDate}`}
          </span>
        </div>

        {/* Primary Wireframe Blueprint Frame */}
        <div className="relative border border-[#38bdf8]/75 bg-[#020a18]/90 shadow-[0_0_50px_rgba(14,165,233,0.22),inset_0_0_35px_rgba(14,165,233,0.08)]">
          <WireframeCorners />

          {/* Frame Header Row ("PROJECT #2026-UA1 /// SUBJECT A-34" style) */}
          <div className="grid grid-cols-12 border-b border-[#38bdf8]/65 text-[10px] sm:text-xs uppercase tracking-[0.2em]">
            <div className="col-span-7 sm:col-span-5 px-3 py-2 border-r border-[#38bdf8]/65 flex items-center justify-between text-[#e0f2fe] font-bold">
              <span>{`ERA // ${meta.label}`}</span>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#7dd3fc]">
                UNFINISHED_UI
              </span>
            </div>
            <div className="col-span-5 sm:col-span-4 px-3 py-2 sm:border-r border-[#38bdf8]/65 flex items-center justify-between text-[#38bdf8]">
              <span>{"///"}</span>
              <span className="truncate">{`OP: ${operatorId}`}</span>
            </div>
            <div className="hidden sm:flex sm:col-span-3 px-3 py-2 items-center justify-between text-[#7dd3fc]">
              <span>{`YEAR: ${destinationYear}`}</span>
              <span className="inline-flex gap-1">
                <span className="px-1 border border-[#38bdf8] text-[9px]">M</span>
                <span className="px-1 border border-[#38bdf8] bg-[#38bdf8] text-[#01050c] text-[9px] font-bold">
                  TX
                </span>
              </span>
            </div>
          </div>

          {/* Main 2-Column Blueprint Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ============================================================= */}
            {/* LEFT COLUMN: ERA 3D WIREFRAME ROOM, GLOBE, DITHER, WAVEFORM    */}
            {/* ============================================================= */}
            <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#38bdf8]/65 flex flex-col justify-between">
              {/* Top Split: Era 3D Wireframe Tunnel + Rotating Meridian Sphere */}
              <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-[#38bdf8]/65">
                <div className="sm:col-span-7 relative p-3 border-b sm:border-b-0 sm:border-r border-[#38bdf8]/65 min-h-[225px] flex flex-col justify-between overflow-hidden bg-[#010612]">
                  <div className="flex items-center justify-between text-[9px] tracking-[0.18em] text-[#7dd3fc]/80 z-10">
                    <span>{`SCHEMATIC // ${era.toUpperCase()}`}</span>
                    <span className="text-[#38bdf8]">[RAW_MESH]</span>
                  </div>

                  <EraWireframeSchematic era={era} travelledDate={travelledDate} />

                  <div className="flex items-center justify-between text-[9px] tracking-[0.15em] text-[#38bdf8]/80 z-10">
                    <span>TEXTURE_SHADER: UNCOMPILED</span>
                    <span>{`WINDOW: ${meta.rangeLabel.toUpperCase()}`}</span>
                  </div>
                </div>

                {/* Right Sub-Box: Wireframe Sphere & Biometric Dither Block */}
                <div className="sm:col-span-5 p-3 flex flex-col justify-between bg-[#010816]">
                  <div>
                    <div className="text-[11px] font-bold tracking-[0.2em] text-[#e0f2fe]">
                      {meta.label}
                    </div>
                    <div className="text-[10px] tracking-[0.18em] text-[#38bdf8]">
                      {`#${destinationYear}_NODE`}
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[8px] tracking-[0.15em] text-[#7dd3fc]/75 uppercase">
                      <p>{`RANGE: ${meta.rangeLabel}`}</p>
                      <p>RENDER_MODE: WIREFRAME</p>
                      <p>CAUSALITY: LOCKED</p>
                    </div>
                  </div>

                  {/* Rotating Wireframe Sphere SVG */}
                  <div className="my-2 flex items-center justify-center">
                    <motion.svg
                      animate={{ rotate: era === "past" ? -360 : 360 }}
                      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                      viewBox="0 0 120 120"
                      className="w-28 h-28"
                      aria-hidden="true"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                      />
                      {[42, 28, 14].map((rx) => (
                        <ellipse
                          key={`ev-${rx}`}
                          cx="60"
                          cy="60"
                          rx={rx}
                          ry="52"
                          fill="none"
                          stroke="#38bdf8"
                          strokeOpacity="0.65"
                          strokeWidth="0.8"
                        />
                      ))}
                      {[38, 22, 8].map((ry) => (
                        <ellipse
                          key={`eh-${ry}`}
                          cx="60"
                          cy="60"
                          rx="52"
                          ry={ry}
                          fill="none"
                          stroke="#7dd3fc"
                          strokeOpacity="0.55"
                          strokeWidth="0.8"
                        />
                      ))}
                      <circle cx="60" cy="60" r="4" fill="#e0f2fe" />
                    </motion.svg>
                  </div>

                  <div className="flex items-center justify-between text-[8px] tracking-[0.15em] text-[#7dd3fc] border-t border-[#38bdf8]/40 pt-1">
                    <span>1998</span>
                    <span>----</span>
                    <span className="text-[#e0f2fe] font-bold">{destinationYear}</span>
                    <span>----</span>
                    <span>2035</span>
                  </div>
                </div>
              </div>

              {/* Middle Strip: 4 Era-Specific Sub-Module Dither Cells (Matches Panel 2 middle row) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#38bdf8]/65 bg-[#010714]">
                {meta.ditherCells.map((cell, idx) => (
                  <div
                    key={cell.name}
                    className={`p-2.5 flex flex-col justify-between border-[#38bdf8]/50 ${
                      idx < 3 ? "sm:border-r" : ""
                    } ${idx % 2 === 0 ? "border-r sm:border-r" : ""} ${
                      idx < 2 ? "border-b sm:border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between text-[8px] text-[#7dd3fc]/70">
                      <span>{cell.code}</span>
                      <span className="h-1.5 w-1.5 bg-[#38bdf8]" />
                    </div>

                    <div className="my-2 h-14 border border-dashed border-[#38bdf8]/45 bg-[#020c20] relative flex items-center justify-center overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-35"
                        style={{
                          backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
                          backgroundSize: "4px 4px",
                        }}
                      />
                      <span className="relative z-10 text-[9px] tracking-[0.15em] text-[#bae6fd] bg-[#01050c]/85 px-1.5 py-0.5 border border-[#38bdf8]/50">
                        {cell.state}
                      </span>
                    </div>

                    <div className="border border-[#38bdf8]/60 py-0.5 text-center text-[9px] tracking-[0.18em] text-[#e0f2fe] bg-[#38bdf8]/10">
                      {cell.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Strip: Sine-Wave Oscilloscope & Hex Telemetry (Matches Panel 2 & 3 bottom) */}
              <div className="p-3 bg-[#010612] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] tracking-[0.2em] text-[#7dd3fc] mb-1.5">
                  <span>{"// ERA_HARMONIC_OSCILLOSCOPE"}</span>
                  <span>{`FREQ: ${meta.frequencyMhz}`}</span>
                </div>

                <div className="relative border border-[#38bdf8]/60 bg-[#01050d] p-2">
                  <svg viewBox="0 0 400 64" className="w-full h-14 overflow-visible">
                    {[0, 16, 32, 48, 64].map((y) => (
                      <line
                        key={`egy-${y}`}
                        x1="0"
                        y1={y}
                        x2="400"
                        y2={y}
                        stroke="#38bdf8"
                        strokeOpacity="0.22"
                        strokeWidth="0.7"
                      />
                    ))}
                    {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
                      <line
                        key={`egx-${x}`}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="64"
                        stroke="#38bdf8"
                        strokeOpacity="0.22"
                        strokeWidth="0.7"
                      />
                    ))}
                    <path
                      d="M 0 32 Q 25 4, 50 32 T 100 32 T 150 32 T 200 32 T 250 32 T 300 32 T 350 32 T 400 32"
                      fill="none"
                      stroke="#e0f2fe"
                      strokeWidth="1.8"
                      style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
                    />
                    <path
                      d="M 0 32 Q 25 60, 50 32 T 100 32 T 150 32 T 200 32 T 250 32 T 300 32 T 350 32 T 400 32"
                      fill="none"
                      stroke="#38bdf8"
                      strokeOpacity="0.6"
                      strokeWidth="1"
                      strokeDasharray="3 2"
                    />
                  </svg>
                </div>

                <div className="mt-2 grid grid-cols-5 sm:grid-cols-10 gap-1 text-[8px] sm:text-[9px] tracking-[0.14em] text-[#38bdf8]/85 tabular-nums">
                  {[
                    destinationYear,
                    "00084",
                    "76 63",
                    "077 88",
                    "24450",
                    "43 45",
                    "331 09",
                    "2026U",
                    "A1 07",
                    "18 00",
                  ].map((hex, i) => (
                    <span key={i} className="truncate">
                      {hex}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* RIGHT COLUMN: SUBJECT / ERA DOSSIER & TELEMETRY (PANEL 1 & 3) */}
            {/* ============================================================= */}
            <div className="lg:col-span-6 flex flex-col justify-between bg-[#020917]">
              <div>
                {/* Dossier Section Header */}
                <div className="px-4 py-2.5 border-b border-[#38bdf8]/65 bg-[#38bdf8]/10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#e0f2fe]">
                    {`// TEMPORAL_DOSSIER: ${meta.label}`}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">
                    DISPLACEMENT: CONFIRMED
                  </span>
                </div>

                {/* Tabular Wireframe Rows (Styled like Reference Panel 1 & Panel 3) */}
                <div className="divide-y divide-[#38bdf8]/55 text-[10px] sm:text-xs uppercase tracking-[0.18em]">
                  <div className="grid grid-cols-12 items-center px-4 py-2.5">
                    <span className="col-span-5 text-[#7dd3fc]">{"// OPERATOR_ID_"}</span>
                    <span className="col-span-7 text-right font-bold text-[#e0f2fe] truncate">
                      {operatorId}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center px-4 py-2.5">
                    <span className="col-span-5 text-[#7dd3fc]">{"// INCEPT_DATE_"}</span>
                    <span className="col-span-7 text-right font-bold text-[#e0f2fe]">
                      { `${travelledDate} (${formattedDate})` }
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center px-4 py-2.5">
                    <span className="col-span-5 text-[#7dd3fc]">{"// ERA_WINDOW_"}</span>
                    <span className="col-span-7 text-right text-[#38bdf8]">
                      {meta.rangeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center px-4 py-2.5">
                    <span className="col-span-5 text-[#7dd3fc]">{"// DIRECTION_MODEL_"}</span>
                    <span className="col-span-7 text-right text-[#bae6fd] truncate">
                      {temporalModel}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center px-4 py-2.5">
                    <span className="col-span-5 text-[#7dd3fc]">{"// STABILITY_"}</span>
                    <span className="col-span-7 text-right text-[#38bdf8] tracking-[0.22em]">
                      {meta.stabilityRating}{" "}
                      <span className="text-[9px] text-[#e0f2fe]">UNSTABLE</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center px-4 py-2.5">
                    <span className="col-span-5 text-[#7dd3fc]">{"// THREAT_LEVEL_"}</span>
                    <span className="col-span-7 text-right text-[#e0f2fe] tracking-[0.25em]">
                      {meta.threatRating}
                    </span>
                  </div>
                </div>

                {/* Era Narrative & Unfinished Blueprint Specification Block */}
                <div className="p-4 border-t border-b border-[#38bdf8]/65 bg-[#010612] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#7dd3fc]">
                      {meta.designParadigm}
                    </span>
                    <span className="text-[9px] tracking-[0.18em] text-[#38bdf8]">
                      [RAW_BUFFER]
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-2xl font-black uppercase tracking-[0.2em] text-[#e0f2fe] drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]">
                    {meta.tagline}
                  </h1>

                  <p className="text-xs leading-relaxed text-[#bae6fd]/85 tracking-[0.06em]">
                    {meta.description}
                  </p>

                  {/* Era Wireframe Spec Rows */}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {meta.features.map((feat, idx) => (
                      <div
                        key={feat}
                        className="flex items-center justify-between border border-[#38bdf8]/45 bg-[#020a18] px-3 py-1.5 text-[10px] tracking-[0.15em] text-[#e0f2fe]"
                      >
                        <span>{`■ SPEC_0${idx + 1}: ${feat}`}</span>
                        <span className="text-[9px] text-[#38bdf8]">[ACTIVE]</span>
                      </div>
                    ))}
                  </div>

                  {/* Intercepted Era Artifact Box */}
                  <div className="border border-dashed border-[#7dd3fc]/70 bg-[#020c20]/90 p-3 space-y-1">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#7dd3fc]">
                      <span>{`// ${meta.artifactTitle}`}</span>
                      <span>DECRYPTED</span>
                    </div>
                    <p className="text-xs italic text-[#e0f2fe] leading-relaxed">
                      &ldquo;{meta.artifactQuote}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Oversized Era Banner (Matches Panel 1 "TRENDS" + Wireframe Wedges) */}
              <div className="p-4 bg-[#010612] space-y-2.5">
                <div className="border-2 border-[#7dd3fc] bg-[#021024] px-4 py-3 flex items-center justify-between shadow-[0_0_25px_rgba(56,189,248,0.25)]">
                  <span className="text-[10px] tracking-[0.22em] text-[#7dd3fc]">
                    {`NODE_${destinationYear}`}
                  </span>
                  <span className="text-base sm:text-xl font-black tracking-[0.26em] text-[#e0f2fe] uppercase">
                    {meta.label}
                  </span>
                  <button
                    type="button"
                    onClick={onReturnToOrigin}
                    className="border border-[#38bdf8] bg-[#38bdf8] text-[#01050c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#e0f2fe] transition-colors cursor-pointer"
                  >
                    RECONFIGURE
                  </button>
                </div>

                {/* Decorative Wireframe Wedge Bar */}
                <div className="grid grid-cols-4 gap-2 pt-0.5" aria-hidden="true">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-3 border border-[#38bdf8]/50 bg-[linear-gradient(90deg,rgba(56,189,248,0.35)_0%,rgba(56,189,248,0.05)_100%)] flex items-center justify-end pr-1"
                    >
                      <span className="h-1.5 w-1 bg-[#7dd3fc]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Blue Matrix Wireframe Coordinate Switcher */}
        <EraDateSwitcher
          quickDate={quickDate}
          todayStr={todayStr}
          onChangeDate={setQuickDate}
          onTravel={() => onSelectNewDate(quickDate)}
          onReturn={onReturnToOrigin}
        />

        {/* Bottom Raw Prototype Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#38bdf8]/75">
          <span>{"2026 // SATHSARA_DAHANA_CHRONO_SUBSYSTEM"}</span>
          <span>WARNING: UI_SHELL_INCOMPLETE [WIREFRAME_DEBUG_ENABLED]</span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SHARED BLUE MATRIX WIREFRAME COORDINATE SWITCHER BAR                      */
/* ========================================================================= */

function EraDateSwitcher({
  quickDate,
  todayStr,
  onChangeDate,
  onTravel,
  onReturn,
}: {
  quickDate: string;
  todayStr: string;
  onChangeDate: (d: string) => void;
  onTravel: () => void;
  onReturn: () => void;
}) {
  const presets = [
    { label: "PAST [1999]", date: "1999-12-31" },
    { label: "NEAR_PAST [2024]", date: "2024-06-15" },
    { label: "PRESENT [TODAY]", date: todayStr },
    { label: "NEAR_FUT [2027]", date: "2027-08-20" },
    { label: "FAR_FUT [2035]", date: "2035-01-01" },
  ];

  return (
    <div className="relative border border-[#38bdf8]/75 bg-[#020a18]/90 p-4 text-[#bae6fd] shadow-[0_0_30px_rgba(14,165,233,0.18)]">
      <WireframeCorners />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#e0f2fe]">
            <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{"// JUMP_TO_ANOTHER_TEMPORAL_COORDINATE [WIREFRAME_BUS]"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChangeDate(p.date)}
                className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] border transition-colors cursor-pointer ${
                  quickDate === p.date
                    ? "border-[#e0f2fe] bg-[#38bdf8] text-[#01050c] font-bold"
                    : "border-[#38bdf8]/45 bg-[#010612] text-[#7dd3fc] hover:border-[#38bdf8] hover:text-[#e0f2fe]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={quickDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="border border-[#38bdf8]/65 bg-[#01050d] px-3 py-1.5 text-xs tracking-[0.16em] text-[#e0f2fe] [color-scheme:dark] focus:border-[#e0f2fe] focus:outline-none"
          />
          <button
            type="button"
            onClick={onTravel}
            className="border border-[#7dd3fc] bg-[#38bdf8] text-[#01050c] hover:bg-[#e0f2fe] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.4)]"
          >
            TIME JUMP &gt;&gt;&gt;
          </button>
          <button
            type="button"
            onClick={onReturn}
            className="inline-flex items-center gap-1.5 border border-[#38bdf8]/60 bg-[#010612] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[#7dd3fc] hover:border-[#e0f2fe] hover:text-[#e0f2fe] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>INPUT_FORM</span>
          </button>
        </div>
      </div>
    </div>
  );
}
