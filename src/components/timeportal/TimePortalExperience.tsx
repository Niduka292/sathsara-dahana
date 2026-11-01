"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Compass,
  RotateCcw,
  Zap,
  Globe,
  Cpu,
  Layers,
  Terminal,
  History,
  Radio,
} from "lucide-react";
import VortexBackground from "../ui/VortexBackground";

export type TimeEra = "past" | "near-past" | "present" | "near-future" | "future";

interface EraMetadata {
  id: TimeEra;
  label: string;
  rangeLabel: string;
  designParadigm: string;
  tagline: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  features: string[];
  artifactTitle: string;
  artifactQuote: string;
}

const ERA_CONFIG: Record<TimeEra, EraMetadata> = {
  past: {
    id: "past",
    label: "THE DEEP PAST",
    rangeLabel: "Before 2023",
    designParadigm: "Web 1.0 • Classic 90s OS Bevel & CRT Terminal",
    tagline: "Dial-Up Echoes & Pixel Horizons",
    description:
      "You have arrived in the foundational era of the digital web. Interfaces are built from tactile 3D bevelled gray chrome, bitmap monospace fonts, phosphor CRT scanlines, and classic window title bars.",
    accentColor: "#00ff66",
    secondaryColor: "#000080",
    features: [
      "3D Outset/Inset Classic Bevel Chrome",
      "CRT Phosphor Scanlines & Monospace Typography",
      "ChronoNavigator 4.0 Address Bar & Hit Counter",
    ],
    artifactTitle: "ARCHIVE_LOG_1998.TXT",
    artifactQuote:
      "Before algorithms shaped the stream, every melody was shared across copper wires and glowing cathode-ray tubes.",
  },
  "near-past": {
    id: "near-past",
    label: "THE NEAR PAST",
    rangeLabel: "2023 – Yesterday",
    designParadigm: "Early-2020s Neo-Brutalist Bento & Analog Warmth",
    tagline: "Recent Memories Cast in Amber",
    description:
      "You are revisiting the recent chapters of 2023–2026. The interface transforms into an editorial Neo-Brutalist Bento layout with warm amber tones, crisp 2px structural borders, hard offset shadows, and tactile archival cards.",
    accentColor: "#f59e0b",
    secondaryColor: "#fb7185",
    features: [
      "Neo-Brutalist Hard Offset Shadows & 2px Borders",
      "Modular Bento Grid Architecture",
      "Warm Analog Amber & Archival Editorial Typography",
    ],
    artifactTitle: "Rehearsal Tape • Faculty of Applied Sciences",
    artifactQuote:
      "Every late-night rehearsal between 2023 and today laid the foundation for the stage that now awaits.",
  },
  present: {
    id: "present",
    label: "THE PRESENT",
    rangeLabel: "Today • Current Temporal Anchor",
    designParadigm: "Sathsara Dahana 2026 • Cosmic Vortex & Astrolabe Glass",
    tagline: "Where Every Note Echoes Through Time",
    description:
      "You are anchored in the exact present moment. The portal resonates with the signature Sathsara Dahana cosmic aesthetic—deep space starlight, sacred astrolabe geometry, Cinzel serif typography, and luminous blue-violet glass.",
    accentColor: "#60a5fa",
    secondaryColor: "#a78bfa",
    features: [
      "Cosmic Particle Vortex & Sacred Astrolabe Rings",
      "Cinematic Cinzel Typography & Starlight Glow",
      "Deep-Space Translucent Glassmorphism",
    ],
    artifactTitle: "The Living Stage • Present Day",
    artifactQuote:
      "Past and future converge right here. The curtain rises on the present symphony.",
  },
  "near-future": {
    id: "near-future",
    label: "THE NEAR FUTURE",
    rangeLabel: "Tomorrow – End of 2028",
    designParadigm: "2027–2028 Spatial Computing • Aurora Frosted Glass",
    tagline: "Weightless Depth & Luminous Horizons",
    description:
      "Welcome to the late-2020s spatial web. Flat screens have dissolved into depth-aware translucent glass panes floating in an aurora lightfield, with specular rim lighting and fluid ambient intelligence.",
    accentColor: "#34d399",
    secondaryColor: "#38bdf8",
    features: [
      "Spatial Computing Floating Glass Panes",
      "Specular Rim Highlights & Aurora Mesh Lightfields",
      "Zero-Gravity Depth Layers & Ambient Motion",
    ],
    artifactTitle: "Spatial Echo • 2027–2028 Broadcast",
    artifactQuote:
      "The songs performed tonight still ripple outward, suspended in weightless spatial harmony across the years ahead.",
  },
  future: {
    id: "future",
    label: "THE FAR FUTURE",
    rangeLabel: "After 2028 (2029 & Beyond)",
    designParadigm: "Post-2028 Quantum Cyber-HUD • Neural Holography",
    tagline: "Beyond the Event Horizon",
    description:
      "You have breached the post-2028 temporal boundary. Traditional web layouts are replaced by a high-frequency Quantum Neural HUD featuring chamfered geometric frames, neon cyan-magenta telemetry, and a live singularity core.",
    accentColor: "#00f5d4",
    secondaryColor: "#ff2a85",
    features: [
      "Chamfered Polygon HUD Frames & Laser Grid",
      "Bioluminescent Cyan/Magenta Quantum Telemetry",
      "Multi-Axis Singularity Core Visualizer",
    ],
    artifactTitle: "QUANTUM_MEMORY_NODE // 2029+",
    artifactQuote:
      "Decades from now, the frequencies of Sathsara Dahana remain encoded in the quantum lattice of time.",
  },
};

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

/** Validation rules for the 3 Chrono-Calibration questions */
const QUESTIONS = [
  {
    id: "q1",
    label: "Chrono Calibration I • Temporal Unit",
    question: "How many minutes are in one hour?",
    placeholder: "Enter the number of minutes...",
    hint: "A standard hour on the astrolabe dial.",
    validate: (val: string) => {
      const normalized = val.trim().toLowerCase();
      return normalized === "60" || normalized === "sixty";
    },
  },
  {
    id: "q2",
    label: "Chrono Calibration II • Harmonic Identity",
    question: "What is the two-word name of this musical celebration?",
    placeholder: "e.g. Sathsara ...",
    hint: "Look at the emblem of our musical journey through time.",
    validate: (val: string) => {
      const normalized = val.trim().toLowerCase().replace(/\s+/g, " ");
      return normalized === "sathsara dahana";
    },
  },
  {
    id: "q3",
    label: "Chrono Calibration III • Celestial Cycle",
    question: "How many months are in a calendar year?",
    placeholder: "Enter the number of months...",
    hint: " matches the Roman numerals around the grand clock.",
    validate: (val: string) => {
      const normalized = val.trim().toLowerCase();
      return normalized === "12" || normalized === "twelve";
    },
  },
] as const;

export default function TimePortalExperience() {
  const [todayStr, setTodayStr] = useState<string>("2026-10-29");
  const [answers, setAnswers] = useState<{ q1: string; q2: string; q3: string }>({
    q1: "",
    q2: "",
    q3: "",
  });
  const [touched, setTouched] = useState<{ q1: boolean; q2: boolean; q3: boolean; date: boolean }>({
    q1: false,
    q2: false,
    q3: false,
    date: false,
  });
  const [targetDate, setTargetDate] = useState<string>("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Transition & Active Era state
  const [isWarping, setIsWarping] = useState(false);
  const [warpDisplayYear, setWarpDisplayYear] = useState<string>("2026");
  const [warpDisplayDate, setWarpDisplayDate] = useState<string>("2026-10-29");
  const [warpFromDate, setWarpFromDate] = useState<string>("2026-10-29");
  const [warpToDate, setWarpToDate] = useState<string>("2026-10-29");
  const [activeEra, setActiveEra] = useState<TimeEra | null>(null);
  const [travelledDate, setTravelledDate] = useState<string>("");
  const warpIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const today = getTodayDateString(new Date());
    setTodayStr(today);
    setTargetDate(today);
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

  const validation = useMemo(() => {
    const q1Valid = QUESTIONS[0].validate(answers.q1);
    const q2Valid = QUESTIONS[1].validate(answers.q2);
    const q3Valid = QUESTIONS[2].validate(answers.q3);
    const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(targetDate) && !Number.isNaN(Date.parse(targetDate));
    const allValid = q1Valid && q2Valid && q3Valid && dateValid;
    const validCount = [q1Valid, q2Valid, q3Valid].filter(Boolean).length;

    return { q1Valid, q2Valid, q3Valid, dateValid, allValid, validCount };
  }, [answers, targetDate]);

  const previewEra = useMemo(() => {
    if (!validation.dateValid) return null;
    return resolveEraFromDate(targetDate, todayStr);
  }, [targetDate, todayStr, validation.dateValid]);

  const triggerTimeWarp = (destinationDate: string) => {
    const nextEra = resolveEraFromDate(destinationDate, todayStr);
    // Start from the previously visited date if available, otherwise today's date
    const previousDate = travelledDate || todayStr;
    const startYear = Number(previousDate.slice(0, 4)) || new Date().getFullYear();
    const endYear = Number(destinationDate.slice(0, 4)) || startYear;

    const [sY, sM, sD] = previousDate.split("-").map(Number);
    const [eY, eM, eD] = destinationDate.split("-").map(Number);
    const startMs = new Date(sY, (sM || 1) - 1, sD || 1).getTime();
    const endMs = new Date(eY, (eM || 1) - 1, eD || 1).getTime();

    // Initialize odometer immediately at the previous date/year before ticking
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
    setTouched({ q1: true, q2: true, q3: true, date: true });

    if (!validation.allValid) {
      return;
    }

    triggerTimeWarp(targetDate);
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
    <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
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
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-[#02040d]"
          >
            {/* Radial Warp Streaks & Expanding Astrolabe Rings */}
            <div className="relative flex items-center justify-center w-full h-full">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
                  animate={{
                    scale: [0.15, 1.8, 4.8],
                    opacity: [0, 0.9, 0],
                    rotate: i % 2 === 0 ? 240 : -240,
                  }}
                  transition={{
                    duration: 1.8,
                    delay: i * 0.18,
                    repeat: Infinity,
                    ease: "easeIn",
                  }}
                  className="absolute w-64 h-64 rounded-full border-2 pointer-events-none"
                  style={{
                    borderColor:
                      i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#a78bfa" : "#fbbf24",
                    boxShadow:
                      i % 2 === 0
                        ? "0 0 50px rgba(96,165,250,0.6), inset 0 0 30px rgba(167,139,250,0.4)"
                        : "0 0 50px rgba(251,191,36,0.5)",
                  }}
                />
              ))}

              {/* High-Speed Starlight Tunnel Rays */}
              <motion.div
                animate={{ rotate: 360, scale: [0.9, 1.35, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                className="absolute w-[680px] h-[680px] rounded-full opacity-50 pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(96,165,250,0.45) 20deg, transparent 40deg, rgba(167,139,250,0.5) 120deg, transparent 150deg, rgba(251,191,36,0.45) 240deg, transparent 280deg, rgba(56,189,248,0.5) 330deg, transparent 360deg)",
                  filter: "blur(18px)",
                }}
              />

              {/* Central Chrono Odometer */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.85, 1.06, 1], opacity: 1 }}
                className="relative z-10 flex flex-col items-center text-center px-6 py-8 rounded-3xl bg-black/65 border border-white/20 backdrop-blur-2xl shadow-[0_0_90px_rgba(96,165,250,0.5)]"
              >
                <span className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.45em] text-blue-300 mb-2">
                  Traversing Temporal Continuum
                </span>
                <div className="font-cinzel text-5xl sm:text-7xl font-bold tracking-[0.18em] text-white text-glow tabular-nums">
                  {warpDisplayYear}
                </div>
                <div className="mt-2 text-sm sm:text-base font-mono tracking-[0.22em] text-blue-200 tabular-nums">
                  {warpDisplayDate}
                </div>
                <div className="mt-2.5 text-[11px] sm:text-xs font-mono tracking-[0.2em] text-amber-300">
                  {warpFromDate} → {warpToDate}
                </div>
                <div className="mt-5 w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full bg-gradient-to-r from-blue-400 via-violet-400 to-amber-300"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* VIEW 1: STARTING INTERFACE (CURRENT SATHSARA DAHANA COSMIC THEME)     */}
      {/* ===================================================================== */}
      {!activeEra && (
        <div className="relative min-h-screen w-full bg-[#02040d]/90 text-white py-10 sm:py-14 px-4 sm:px-6 flex flex-col justify-between">
          <VortexBackground />

          {/* Ambient Glows matching Introduction & Puzzle */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
          </div>

          {/* Top Navigation Bar */}
          <header className="relative z-10 container mx-auto max-w-6xl flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-cinzel uppercase tracking-[0.25em] text-white/80 hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all backdrop-blur-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Return Home</span>
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-950/30 px-4 py-1.5 text-[11px] font-cinzel uppercase tracking-[0.25em] text-blue-200 backdrop-blur-xl">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Date: {travelledDate || todayStr}</span>
            </div>
          </header>

          {/* Main Content Grid */}
          <main className="relative z-10 container mx-auto max-w-6xl my-8 sm:my-12">
            <div className="text-center mb-10 sm:mb-12">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#a78bfa] text-glow-violet block mb-3"
              >
                Sathsara Dahana • Temporal Gateway
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.35)]"
              >
                The Time Portal
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-3 max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-blue-100/65 font-light leading-relaxed"
              >
                Calibrate the three harmonic locks below and select your destination date. Once all three answers are verified, the portal will open and reshape itself into your target era.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Interactive Astrolabe Portal Visualizer */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                  {/* Outer Glow */}
                  <div
                    className={`absolute inset-4 rounded-full blur-[55px] transition-all duration-700 ${
                      validation.allValid
                        ? "bg-amber-400/30 scale-105"
                        : "bg-blue-500/20 scale-95"
                    }`}
                  />

                  {/* Spinning Ring 1 */}
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: validation.allValid ? 20 : 60,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    viewBox="0 0 300 300"
                    className="absolute inset-0 w-full h-full"
                  >
                    <circle
                      cx="150"
                      cy="150"
                      r="140"
                      fill="none"
                      stroke={validation.q1Valid ? "#fbbf24" : "#93c5fd"}
                      strokeOpacity="0.45"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                    />
                    <circle
                      cx="150"
                      cy="150"
                      r="128"
                      fill="none"
                      stroke="#93c5fd"
                      strokeOpacity="0.2"
                      strokeWidth="1"
                    />
                  </motion.svg>

                  {/* Spinning Ring 2 */}
                  <motion.svg
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: validation.allValid ? 15 : 45,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    viewBox="0 0 300 300"
                    className="absolute inset-0 w-full h-full"
                  >
                    <circle
                      cx="150"
                      cy="150"
                      r="104"
                      fill="none"
                      stroke={validation.q2Valid ? "#fbbf24" : "#a78bfa"}
                      strokeOpacity="0.55"
                      strokeWidth="1.5"
                    />
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <circle
                        key={deg}
                        cx="150"
                        cy="46"
                        r="4"
                        fill={validation.q2Valid ? "#fbbf24" : "#a78bfa"}
                        transform={`rotate(${deg} 150 150)`}
                      />
                    ))}
                  </motion.svg>

                  {/* Spinning Ring 3 */}
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: validation.allValid ? 10 : 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    viewBox="0 0 300 300"
                    className="absolute inset-0 w-full h-full"
                  >
                    <circle
                      cx="150"
                      cy="150"
                      r="74"
                      fill="none"
                      stroke={validation.q3Valid ? "#fbbf24" : "#60a5fa"}
                      strokeOpacity="0.65"
                      strokeWidth="2"
                      strokeDasharray="16 8"
                    />
                  </motion.svg>

                  {/* Center Portal Core */}
                  <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-[#05091a]/90 border border-white/15 backdrop-blur-xl shadow-[0_0_40px_rgba(59,130,246,0.3)] text-center p-3">
                    <span className="font-cinzel text-[9px] uppercase tracking-[0.3em] text-blue-300/70">
                      Locks Engaged
                    </span>
                    <span className="font-cinzel text-2xl sm:text-3xl font-bold text-white mt-1">
                      {validation.validCount} / 3
                    </span>
                    <span
                      className={`mt-1.5 text-[9px] font-cinzel uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${
                        validation.allValid
                          ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
                          : "border-white/10 bg-white/5 text-white/50"
                      }`}
                    >
                      {validation.allValid ? "Portal Ready" : "Calibrating"}
                    </span>
                  </div>
                </div>

                {/* Live Destination Era Preview Pill */}
                {previewEra && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-xl text-center max-w-xs w-full">
                    <p className="text-[10px] font-cinzel uppercase tracking-[0.3em] text-blue-300/70">
                      Target Coordinate Preview
                    </p>
                    <p className="mt-1 font-cinzel text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                      {ERA_CONFIG[previewEra].label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/55">
                      {ERA_CONFIG[previewEra].rangeLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: 3 Validated Questions + Date Input Form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(2,4,13,0.8)] space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h2 className="font-cinzel text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-white">
                        Temporal Calibration Console
                      </h2>
                      <p className="text-xs text-blue-200/60 mt-0.5">
                        Answer all 3 security questions and choose your destination date.
                      </p>
                    </div>
                    <Compass className="w-6 h-6 text-blue-400 shrink-0" />
                  </div>

                  {/* 3 Validated Questions */}
                  <div className="space-y-4">
                    {QUESTIONS.map((q, index) => {
                      const key = q.id as keyof typeof answers;
                      const value = answers[key];
                      const isFieldValid =
                        index === 0
                          ? validation.q1Valid
                          : index === 1
                          ? validation.q2Valid
                          : validation.q3Valid;
                      const showError = (touched[key] || submitAttempted) && !isFieldValid;

                      return (
                        <div
                          key={q.id}
                          className={`rounded-2xl border p-4 transition-all ${
                            isFieldValid
                              ? "border-emerald-400/45 bg-emerald-950/15"
                              : showError
                              ? "border-rose-500/50 bg-rose-950/15"
                              : "border-white/10 bg-black/35"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-cinzel text-[10px] uppercase tracking-[0.28em] text-blue-300/80">
                              {q.label}
                            </span>
                            {isFieldValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-cinzel uppercase tracking-wider text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            ) : showError ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-cinzel uppercase tracking-wider text-rose-300">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Invalid Answer
                              </span>
                            ) : null}
                          </div>

                          <label
                            htmlFor={`portal-${q.id}`}
                            className="block text-xs sm:text-sm font-medium text-white mb-2"
                          >
                            {q.question}
                          </label>

                          <input
                            id={`portal-${q.id}`}
                            type="text"
                            value={value}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            onBlur={() =>
                              setTouched((prev) => ({ ...prev, [key]: true }))
                            }
                            placeholder={q.placeholder}
                            autoComplete="off"
                            className="w-full rounded-xl border border-white/15 bg-[#050816]/90 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-blue-400 focus:outline-none transition-colors"
                          />

                          {showError && (
                            <p className="mt-1.5 text-[11px] text-rose-300/90">
                              Hint: {q.hint}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Destination Date Selector (Input #4) */}
                  <div className="rounded-2xl border border-blue-400/25 bg-blue-950/15 p-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-cinzel text-[10px] uppercase tracking-[0.28em] text-amber-300">
                        Chrono Coordinate IV • Target Date
                      </span>
                      <span className="text-[10px] font-cinzel uppercase tracking-wider text-blue-200/70">
                        Any Date Allowed
                      </span>
                    </div>

                    <label
                      htmlFor="portal-target-date"
                      className="block text-xs sm:text-sm font-medium text-white mb-2"
                    >
                      Select or enter the date you wish to travel to:
                    </label>

                    <div className="relative">
                      <input
                        id="portal-target-date"
                        type="date"
                        value={targetDate}
                        onChange={(e) => {
                          setTargetDate(e.target.value);
                          setTouched((prev) => ({ ...prev, date: true }));
                        }}
                        className="w-full rounded-xl border border-white/20 bg-[#050816]/90 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none transition-colors [color-scheme:dark]"
                      />
                    </div>

                    {/* Quick Preset Era Coordinates for fast testing */}
                    <div className="mt-3">
                      <span className="block text-[10px] font-cinzel uppercase tracking-[0.22em] text-white/45 mb-2">
                        Quick Era Coordinate Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "Past (1999)", date: "1999-12-31" },
                          { label: "Near Past (2024)", date: "2024-06-15" },
                          { label: "Present (Today)", date: todayStr },
                          { label: "Near Future (2027)", date: "2027-08-20" },
                          { label: "Future (2035)", date: "2035-01-01" },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setTargetDate(preset.date)}
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-cinzel uppercase tracking-wider transition-all cursor-pointer ${
                              targetDate === preset.date
                                ? "border-amber-400/70 bg-amber-400/20 text-amber-200"
                                : "border-white/10 bg-white/5 text-white/65 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {submitAttempted && !validation.allValid && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2.5 text-xs text-rose-200 text-center">
                      Please answer all 3 calibration questions correctly and choose a valid date to unlock the Time Portal.
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full rounded-full py-3.5 px-6 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      validation.allValid
                        ? "bg-gradient-to-r from-blue-600 via-violet-600 to-amber-500 text-white shadow-[0_0_35px_rgba(139,92,246,0.5)] hover:scale-[1.01]"
                        : "bg-white/10 border border-white/15 text-white/60 hover:bg-white/15"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Initiate Time Travel</span>
                  </button>
                </form>
              </div>
            </div>
          </main>

          <footer className="relative z-10 text-center text-[11px] font-cinzel uppercase tracking-[0.3em] text-white/35">
            Sathsara Dahana 2026 • Temporal Navigation System
          </footer>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: DESTINATION ERA INTERFACES (5 DISTINCT WEB DESIGN ERAS)       */}
      {/* ===================================================================== */}
      {activeEra && (
        <EraDestinationInterface
          era={activeEra}
          travelledDate={travelledDate}
          formattedDate={formattedTravelledDate}
          todayStr={todayStr}
          onSelectNewDate={(nextDate) => {
            setTargetDate(nextDate);
            triggerTimeWarp(nextDate);
          }}
          onReturnToOrigin={handleResetToOrigin}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* ERA-SPECIFIC WEB DESIGN DESTINATION COMPONENT                             */
/* ========================================================================= */

interface EraDestinationProps {
  era: TimeEra;
  travelledDate: string;
  formattedDate: string;
  todayStr: string;
  onSelectNewDate: (date: string) => void;
  onReturnToOrigin: () => void;
}

function EraDestinationInterface({
  era,
  travelledDate,
  formattedDate,
  todayStr,
  onSelectNewDate,
  onReturnToOrigin,
}: EraDestinationProps) {
  const [quickDate, setQuickDate] = useState(travelledDate);
  const meta = ERA_CONFIG[era];

  useEffect(() => {
    setQuickDate(travelledDate);
  }, [travelledDate]);

  /* ----------------------------------------------------------------------- */
  /* 1. PAST ERA (BEFORE 2023) — WEB 1.0 / 90s RETRO OS & CRT TERMINAL       */
  /* ----------------------------------------------------------------------- */
  if (era === "past") {
    return (
      <div className="min-h-screen w-full bg-[#004f4f] text-black font-mono p-3 sm:p-6 relative overflow-hidden">
        {/* CRT Scanline Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-40 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          {/* Classic Windows 95/98 Outer Window Frame */}
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#202020] border-b-[#202020] shadow-[4px_4px_0px_#000000]">
            {/* Classic Navy Title Bar */}
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00ff66]" />
                <span>ChronoNavigator 4.0 — [Era: {meta.label} ({travelledDate})]</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onReturnToOrigin}
                  className="bg-[#c0c0c0] text-black px-2 py-0.5 text-xs font-bold border border-t-white border-l-white border-r-black border-b-black cursor-pointer active:border-t-black"
                >
                  X
                </button>
              </div>
            </div>

            {/* Classic Browser Menu & URL Bar */}
            <div className="px-3 py-2 border-b border-[#808080] space-y-2 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-black/80">
                <span className="underline">F</span>ile
                <span className="underline">E</span>dit
                <span className="underline">V</span>iew
                <span className="underline">G</span>o
                <span className="underline">B</span>ookmarks
                <span className="ml-auto font-bold text-[#000080]">
                  [WEB 1.0 ARCHIVE MODE: PRE-2023]
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold">Location:</span>
                <div className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-[#000080] truncate">
                  http://www.sathsaradahana.org/timeportal/archive/{travelledDate}/index.html
                </div>
                <button
                  type="button"
                  onClick={onReturnToOrigin}
                  className="bg-[#c0c0c0] px-3 py-1 font-bold border-2 border-t-white border-l-white border-r-black border-b-black hover:bg-[#d4d4d4] cursor-pointer"
                >
                  &lt;&lt; Back to 2026 Portal
                </button>
              </div>
            </div>

            {/* Inner Document Viewport */}
            <div className="m-3 bg-[#00140a] text-[#00ff66] border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white p-5 sm:p-8 space-y-6">
              {/* Retro Banner */}
              <div className="border-2 border-dashed border-[#00ff66] p-3 text-center bg-[#002612]">
                <p className="text-xs uppercase tracking-widest text-[#ffff00]">
                  *** TEMPORAL DISPLACEMENT CONFIRMED • ERA: {meta.rangeLabel.toUpperCase()} ***
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold mt-2 text-white">
                  {meta.label}: {formattedDate}
                </h1>
                <p className="text-xs sm:text-sm text-[#00ff66]/80 mt-1">
                  {meta.designParadigm}
                </p>
              </div>

              {/* 2-Column Web 1.0 Table Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Sidebar Table Cell */}
                <div className="border-2 border-[#00ff66]/60 p-4 bg-black/50 space-y-4">
                  <div className="text-xs font-bold uppercase bg-[#00ff66] text-black px-2 py-1">
                    :: SYSTEM STATUS ::
                  </div>
                  <div className="text-xs space-y-2">
                    <p>&gt; DATE: {travelledDate}</p>
                    <p>&gt; ERA: BEFORE 2023</p>
                    <p>&gt; DISPLAY: VGA 640x480</p>
                    <p>&gt; AUDIO: MIDI SYNTH</p>
                  </div>
                  <div className="border border-[#00ff66]/40 p-2 text-center">
                    <span className="text-[10px] block text-white/70">VISITOR COUNTER</span>
                    <span className="font-bold text-lg tracking-widest text-[#ffff00]">
                      [001998]
                    </span>
                  </div>
                </div>

                {/* Main Content Cell */}
                <div className="md:col-span-2 border-2 border-[#00ff66]/60 p-4 bg-black/50 space-y-4">
                  <div className="text-xs font-bold uppercase bg-[#00ff66] text-black px-2 py-1">
                    :: {meta.artifactTitle} ::
                  </div>
                  <p className="text-sm leading-relaxed text-[#b8ffd4]">
                    {meta.description}
                  </p>
                  <blockquote className="border-l-4 border-[#ffff00] pl-3 py-1 text-xs italic text-[#ffff00]">
                    &ldquo;{meta.artifactQuote}&rdquo;
                  </blockquote>
                  <div className="space-y-1 pt-2">
                    <p className="text-xs font-bold text-white uppercase">
                      Era Web Design Characteristics:
                    </p>
                    <ul className="text-xs space-y-1 list-disc list-inside text-[#00ff66]">
                      {meta.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Jump to Another Date Bar */}
              <EraDateSwitcher
                quickDate={quickDate}
                todayStr={todayStr}
                onChangeDate={setQuickDate}
                onTravel={() => onSelectNewDate(quickDate)}
                onReturn={onReturnToOrigin}
                variant="past"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* 2. NEAR PAST ERA (2023 – PRESENT) — NEO-BRUTALIST BENTO & ANALOG ARCHIVE*/
  /* ----------------------------------------------------------------------- */
  if (era === "near-past") {
    return (
      <div className="min-h-screen w-full bg-[#161311] text-[#fef3c7] p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Editorial Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#211c18] border-2 border-amber-400 p-4 shadow-[6px_6px_0px_#f59e0b]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
                <History className="w-3.5 h-3.5" />
                {meta.label}
              </span>
              <span className="font-mono text-xs sm:text-sm text-amber-200/80">
                {meta.rangeLabel} • {formattedDate}
              </span>
            </div>
            <button
              type="button"
              onClick={onReturnToOrigin}
              className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-y-0.5 transition-transform cursor-pointer"
            >
              Return to Portal
            </button>
          </div>

          {/* Bento Grid Layout (2023-2025 Web Design Trend) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Hero Bento Tile */}
            <div className="md:col-span-8 rounded-3xl bg-[#241e1a] border-2 border-amber-400/80 p-6 sm:p-8 shadow-[8px_8px_0px_#d97706] flex flex-col justify-between">
              <div>
                <span className="inline-block font-mono text-xs uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/40 px-3 py-1 rounded-md">
                  {meta.designParadigm}
                </span>
                <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white mt-4 leading-tight">
                  {meta.tagline}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-amber-100/80 leading-relaxed">
                  {meta.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-400/20 flex flex-wrap gap-2">
                {meta.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-lg bg-black/40 border border-amber-400/40 px-3 py-1.5 text-xs font-mono text-amber-200"
                  >
                    ✦ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Analog Dial Bento Tile */}
            <div className="md:col-span-4 rounded-3xl bg-gradient-to-br from-amber-500 to-rose-500 text-black border-2 border-black p-6 shadow-[8px_8px_0px_#f59e0b] flex flex-col items-center justify-center text-center">
              <Radio className="w-12 h-12 mb-3 stroke-[2.2]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest">
                ARCHIVAL TIMESTAMP
              </span>
              <p className="font-cinzel text-3xl font-black mt-2">{travelledDate}</p>
              <p className="mt-3 text-xs font-medium bg-black/15 px-3 py-1.5 rounded-full">
                2023 – Present Memory Window
              </p>
            </div>

            {/* Quote Bento Tile */}
            <div className="md:col-span-12 rounded-3xl bg-[#1e1916] border-2 border-rose-400/70 p-6 shadow-[6px_6px_0px_#fb7185]">
              <p className="font-mono text-xs uppercase tracking-widest text-rose-300">
                {meta.artifactTitle}
              </p>
              <p className="mt-2 font-serif text-lg sm:text-xl italic text-white">
                &ldquo;{meta.artifactQuote}&rdquo;
              </p>
            </div>
          </div>

          <EraDateSwitcher
            quickDate={quickDate}
            todayStr={todayStr}
            onChangeDate={setQuickDate}
            onTravel={() => onSelectNewDate(quickDate)}
            onReturn={onReturnToOrigin}
            variant="near-past"
          />
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* 3. PRESENT ERA (TODAY) — SATHSARA DAHANA 2026 COSMIC VORTEX THEME       */
  /* ----------------------------------------------------------------------- */
  if (era === "present") {
    return (
      <div className="relative min-h-screen w-full bg-[#02040d]/90 text-white p-4 sm:p-8">
        <VortexBackground />
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 backdrop-blur-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-blue-300">
                {meta.label} • {formattedDate}
              </span>
            </div>
            <button
              type="button"
              onClick={onReturnToOrigin}
              className="rounded-full border border-blue-400/40 bg-blue-500/15 px-4 py-1.5 font-cinzel text-[11px] uppercase tracking-[0.25em] text-blue-100 hover:bg-blue-500/25 transition-colors cursor-pointer"
            >
              Recalibrate Portal
            </button>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 sm:p-12 backdrop-blur-2xl text-center shadow-[0_0_70px_rgba(59,130,246,0.2)]">
            <span className="font-cinzel text-xs uppercase tracking-[0.4em] text-[#a78bfa] text-glow-violet">
              {meta.designParadigm}
            </span>
            <h1 className="mt-3 font-cinzel text-4xl sm:text-6xl font-bold uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400">
              {meta.tagline}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-blue-100/75 leading-relaxed">
              {meta.description}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {meta.features.map((f) => (
                <div
                  key={f}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-blue-100/85 font-cinzel tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 mb-2" />
                  {f}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
              <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-amber-300">
                {meta.artifactTitle}
              </p>
              <p className="mt-2 font-serif italic text-base text-white/90">
                &ldquo;{meta.artifactQuote}&rdquo;
              </p>
            </div>
          </div>

          <EraDateSwitcher
            quickDate={quickDate}
            todayStr={todayStr}
            onChangeDate={setQuickDate}
            onTravel={() => onSelectNewDate(quickDate)}
            onReturn={onReturnToOrigin}
            variant="present"
          />
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* 4. NEAR FUTURE ERA (PRESENT – END OF 2028) — SPATIAL COMPUTING GLASS    */
  /* ----------------------------------------------------------------------- */
  if (era === "near-future") {
    return (
      <div className="relative min-h-screen w-full bg-[#06101e] text-white p-4 sm:p-8 overflow-hidden">
        {/* Aurora Spatial Lightfield Mesh */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-20 left-1/4 w-[650px] h-[650px] rounded-full bg-emerald-400/20 blur-[150px]" />
          <div className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full bg-sky-400/20 blur-[150px]" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          {/* Floating Spatial Pill Top Bar */}
          <div className="mx-auto flex flex-wrap items-center justify-between gap-4 rounded-full bg-white/[0.12] border border-white/30 px-6 py-3 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                {meta.label} • {formattedDate}
              </span>
            </div>
            <button
              type="button"
              onClick={onReturnToOrigin}
              className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-1.5 text-xs font-medium tracking-wider text-white transition-all cursor-pointer"
            >
              Exit Spatial View
            </button>
          </div>

          {/* Spatial Computing Glass Window */}
          <div className="rounded-[36px] bg-white/[0.09] border border-white/30 p-8 sm:p-12 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.45)] space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 border border-emerald-300/40 px-3.5 py-1 text-xs font-medium text-emerald-200">
                  <Globe className="w-3.5 h-3.5" />
                  {meta.designParadigm}
                </span>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                  {meta.tagline}
                </h1>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  {meta.description}
                </p>
              </div>

              {/* Floating Spatial Orb */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto md:mx-0 w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-400/40 via-sky-300/40 to-indigo-400/50 border border-white/50 backdrop-blur-2xl shadow-[0_0_60px_rgba(52,211,153,0.45),inset_0_0_30px_rgba(255,255,255,0.5)] flex flex-col items-center justify-center text-center p-4 shrink-0"
              >
                <span className="text-[10px] uppercase tracking-widest text-white/80">
                  SPATIAL OS
                </span>
                <span className="text-lg font-bold text-white mt-1">{travelledDate}</span>
                <span className="text-[10px] text-emerald-200 mt-0.5">2027–2028</span>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {meta.features.map((f) => (
                <div
                  key={f}
                  className="rounded-3xl bg-white/[0.08] border border-white/25 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-xs sm:text-sm text-white/90"
                >
                  {f}
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-indigo-500/15 border border-white/25 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                {meta.artifactTitle}
              </p>
              <p className="mt-2 text-base sm:text-lg font-light text-white">
                &ldquo;{meta.artifactQuote}&rdquo;
              </p>
            </div>
          </div>

          <EraDateSwitcher
            quickDate={quickDate}
            todayStr={todayStr}
            onChangeDate={setQuickDate}
            onTravel={() => onSelectNewDate(quickDate)}
            onReturn={onReturnToOrigin}
            variant="near-future"
          />
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* 5. FAR FUTURE ERA (AFTER 2028) — QUANTUM CYBER-HOLOGRAPHIC HUD          */
  /* ----------------------------------------------------------------------- */
  return (
    <div className="relative min-h-screen w-full bg-[#02010a] text-[#00f5d4] font-mono p-4 sm:p-8 overflow-hidden">
      {/* Quantum Laser Grid Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,245,212,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,42,133,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Cyber HUD Header */}
        <div className="border border-[#00f5d4]/60 bg-[#050314]/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,245,212,0.2)]">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#ff2a85] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white">
              {`${meta.label} // NODE: ${travelledDate}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onReturnToOrigin}
            className="border border-[#ff2a85] bg-[#ff2a85]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#ff2a85] hover:bg-[#ff2a85]/30 transition-colors cursor-pointer"
          >
            [DISENGAGE QUANTUM LINK]
          </button>
        </div>

        {/* Main Holographic HUD Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 border border-[#00f5d4]/50 bg-[#060318]/90 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,245,212,0.15)] space-y-6 relative">
            <div className="inline-flex items-center gap-2 border border-[#ff2a85]/60 bg-[#ff2a85]/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[#ff2a85]">
              <Zap className="w-3.5 h-3.5" />
              {meta.designParadigm}
            </div>

            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(0,245,212,0.5)]">
              {meta.tagline}
            </h1>

            <p className="text-xs sm:text-sm text-[#a8fff2]/80 leading-relaxed">
              {meta.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {meta.features.map((f, i) => (
                <div
                  key={f}
                  className="border border-[#00f5d4]/40 bg-black/60 p-3.5 text-xs text-white"
                >
                  <span className="text-[10px] text-[#ff2a85] block mb-1">
                    SYS_SPEC_0{i + 1}
                  </span>
                  {f}
                </div>
              ))}
            </div>

            <div className="border-l-4 border-[#00f5d4] bg-[#00f5d4]/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#00f5d4]">
                {meta.artifactTitle}
              </p>
              <p className="mt-1.5 text-sm text-white">
                &ldquo;{meta.artifactQuote}&rdquo;
              </p>
            </div>
          </div>

          {/* Quantum Singularity Core Telemetry */}
          <div className="lg:col-span-4 border border-[#ff2a85]/50 bg-[#060318]/90 p-6 flex flex-col items-center justify-center text-center relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#00f5d4]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-[#ff2a85]"
              />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f5d4]/30 to-[#ff2a85]/40 border border-white/50 flex flex-col items-center justify-center shadow-[0_0_40px_#00f5d4]">
                <span className="text-[9px] text-white/70">ERA &gt; 2028</span>
                <span className="text-sm font-bold text-white mt-0.5">
                  {travelledDate}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#00f5d4]">
              QUANTUM TELEMETRY: LOCKED
            </p>
            <p className="mt-1 text-[11px] text-white/60">{formattedDate}</p>
          </div>
        </div>

        <EraDateSwitcher
          quickDate={quickDate}
          todayStr={todayStr}
          onChangeDate={setQuickDate}
          onTravel={() => onSelectNewDate(quickDate)}
          onReturn={onReturnToOrigin}
          variant="future"
        />
      </div>
    </div>
  );
}

/* ========================================================================= */
/* SHARED DESTINATION BAR TO TEST OTHER DATES / ERAS INSTANTLY               */
/* ========================================================================= */

function EraDateSwitcher({
  quickDate,
  todayStr,
  onChangeDate,
  onTravel,
  onReturn,
  variant,
}: {
  quickDate: string;
  todayStr: string;
  onChangeDate: (d: string) => void;
  onTravel: () => void;
  onReturn: () => void;
  variant: TimeEra;
}) {
  const presets = [
    { label: "Past (1999)", date: "1999-12-31" },
    { label: "Near Past (2024)", date: "2024-06-15" },
    { label: "Present (Today)", date: todayStr },
    { label: "Near Future (2027)", date: "2027-08-20" },
    { label: "Future (2035)", date: "2035-01-01" },
  ];

  const containerStyle =
    variant === "past"
      ? "border-2 border-[#00ff66] bg-black p-4 text-[#00ff66]"
      : variant === "near-past"
      ? "rounded-2xl border-2 border-amber-400 bg-[#211c18] p-5 text-amber-100 shadow-[6px_6px_0px_#f59e0b]"
      : variant === "present"
      ? "rounded-3xl border border-white/15 bg-white/5 p-5 text-white backdrop-blur-2xl"
      : variant === "near-future"
      ? "rounded-3xl border border-white/30 bg-white/10 p-5 text-white backdrop-blur-3xl"
      : "border border-[#00f5d4]/60 bg-[#050314]/90 p-5 text-[#00f5d4]";

  return (
    <div className={containerStyle}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Jump to Another Temporal Coordinate</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChangeDate(p.date)}
                className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-current/30 hover:border-current rounded cursor-pointer transition-colors"
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
            className="rounded-lg border border-current/40 bg-black/50 px-3 py-2 text-xs text-white [color-scheme:dark]"
          />
          <button
            type="button"
            onClick={onTravel}
            className="rounded-lg bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            Time Warp
          </button>
          <button
            type="button"
            onClick={onReturn}
            className="inline-flex items-center gap-1.5 rounded-lg border border-current/40 px-3 py-2 text-xs uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
