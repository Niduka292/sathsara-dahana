"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, Unlock, RotateCcw, Sparkles, Clock, Grid } from "lucide-react";
import VortexBackground from "../ui/VortexBackground";

const ROMAN_NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

// Target Time: 11:09
const TARGET_HOUR = 11;
const TARGET_MINUTE = 9;

// 3x3 Sliding Tile Grid
// Target is the center row (indices 3, 4, 5) spelling "F", "A", "S"
// Solvable initial configuration (even number of swaps from a solved state)
// Solved reference: ["D", "H", "N", "F", "A", "S", "2", "6", ""]
// Let's apply 12 valid legal moves from solved reference so it is 100% solvable and fun!
// Reference:
// 0: D, 1: H, 2: N
// 3: F, 4: A, 5: S
// 6: 2, 7: 6, 8: ""
// Move 1 (5->8): D, H, N, F, A, "", 2, 6, S
// Move 2 (4->5): D, H, N, F, "", A, 2, 6, S
// Move 3 (1->4): D, "", N, F, H, A, 2, 6, S
// Move 4 (0->1): "", D, N, F, H, A, 2, 6, S
// Move 5 (3->0): F, D, N, "", H, A, 2, 6, S
// Move 6 (4->3): F, D, N, H, "", A, 2, 6, S
// Move 7 (7->4): F, D, N, H, 6, A, 2, "", S
// Move 8 (8->7): F, D, N, H, 6, A, 2, S, ""
const INITIAL_TILES = ["F", "D", "N", "H", "6", "A", "2", "S", ""];

export default function PuzzleExperience() {
  // --- CLOCK PUZZLE STATE ---
  // Initial time: 03:30 so the user gets to move both hands
  const [hour, setHour] = useState<number>(3);
  const [minute, setMinute] = useState<number>(30);
  const [activeHand, setActiveHand] = useState<"hour" | "minute">("hour");
  const [draggingHand, setDraggingHand] = useState<"hour" | "minute" | null>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  const isClockSolved = hour === TARGET_HOUR && minute === TARGET_MINUTE;

  // --- BLOCK SLIDING PUZZLE STATE ---
  const [tiles, setTiles] = useState<string[]>(INITIAL_TILES);
  const touchStartRef = useRef<{ x: number; y: number; index: number } | null>(null);

  // Solved when the middle row (indices 3, 4, 5) spells F - A - S
  const isBlocksSolved = tiles[3] === "F" && tiles[4] === "A" && tiles[5] === "S";

  const isAllSolved = isClockSolved && isBlocksSolved;
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  useEffect(() => {
    if (isAllSolved) {
      const timer = setTimeout(() => setShowVictoryModal(true), 450);
      return () => clearTimeout(timer);
    } else {
      setShowVictoryModal(false);
    }
  }, [isAllSolved]);

  // --- CLOCK INTERACTION LOGIC ---
  const updateClockFromPoint = useCallback(
    (clientX: number, clientY: number, handToMove: "hour" | "minute") => {
      if (!clockRef.current) return;
      const rect = clockRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;

      // Angle in degrees where 12 o'clock is 0 deg, clockwise [0, 360)
      let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (deg < 0) deg += 360;

      if (handToMove === "minute") {
        const newMinute = Math.round(deg / 6) % 60;
        setMinute(newMinute);
      } else {
        let newHour = Math.round(deg / 30) % 12;
        if (newHour === 0) newHour = 12;
        setHour(newHour);
      }
    },
    []
  );

  useEffect(() => {
    if (!draggingHand) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      updateClockFromPoint(e.clientX, e.clientY, draggingHand);
    };

    const handlePointerUp = () => {
      setDraggingHand(null);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingHand, updateClockFromPoint]);

  // Calculate visual angles
  const minuteAngle = minute * 6;
  // Smooth hour hand angle (includes slight offset from minutes, or exact hour markers when dragging hour)
  const hourAngle = ((hour % 12) * 30) + (minute * 0.5);

  // --- BLOCK PUZZLE INTERACTION LOGIC ---
  const moveTile = useCallback((index: number) => {
    setTiles((prev) => {
      const emptyIndex = prev.indexOf("");
      if (emptyIndex === -1 || index === emptyIndex) return prev;

      const row = Math.floor(index / 3);
      const col = index % 3;
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
      if (!isAdjacent) return prev;

      const next = [...prev];
      next[emptyIndex] = next[index];
      next[index] = "";
      return next;
    });
  }, []);

  // Swipe gesture on the grid or individual tile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, index };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const startIdx = touchStartRef.current.index;
    touchStartRef.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // If it was a swipe (> 20px), check if swipe direction points toward the empty slot
    if (Math.max(absX, absY) > 20) {
      const emptyIndex = tiles.indexOf("");
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      if (absX > absY) {
        // Horizontal swipe
        const swipeDirCol = dx > 0 ? 1 : -1;
        // Either swiped the specific tile toward empty, or swiped anywhere on grid in that direction
        const targetTileRow = emptyRow;
        const targetTileCol = emptyCol - swipeDirCol;
        if (targetTileCol >= 0 && targetTileCol < 3) {
          const tileToMove = targetTileRow * 3 + targetTileCol;
          moveTile(tileToMove);
          return;
        }
      } else {
        // Vertical swipe
        const swipeDirRow = dy > 0 ? 1 : -1;
        const targetTileRow = emptyRow - swipeDirRow;
        const targetTileCol = emptyCol;
        if (targetTileRow >= 0 && targetTileRow < 3) {
          const tileToMove = targetTileRow * 3 + targetTileCol;
          moveTile(tileToMove);
          return;
        }
      }
    }

    // Fallback: if tapped or short drag on an adjacent tile, move it directly
    if (startIdx >= 0) {
      moveTile(startIdx);
    }
  };

  const resetBlocks = () => {
    setTiles(INITIAL_TILES);
  };

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-[#02040d] px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
      <VortexBackground />

      {/* Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/4 h-[28rem] w-[38rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center">
        {/* Top Bar Navigation */}
        <div className="w-full flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-cinzel text-[11px] uppercase tracking-[0.2em] text-blue-200/80 backdrop-blur-md transition-all hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-950/30 px-3.5 py-1.5 backdrop-blur-md">
            {isAllSolved ? (
              <Unlock className="h-3.5 w-3.5 text-[#fbbf24]" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-blue-400" />
            )}
            <span className="font-cinzel text-[10px] uppercase tracking-[0.22em] text-blue-200">
              {isAllSolved ? "Portal Unlocked" : `${(isClockSolved ? 1 : 0) + (isBlocksSolved ? 1 : 0)} / 2 Locks`}
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-6 sm:mb-10">
          <p className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.38em] text-[#a78bfa] mb-2">
            Secrets of Time
          </p>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400">
            The Chrono Cipher
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/60 max-w-md mx-auto">
            Align the hands of time and slide the ancient runes into place to unlock the gate.
          </p>
        </div>

        {/* ============================================================ */}
        {/* PUZZLE 1: ANALOG CLOCK INPUT (TOP)                           */}
        {/* ============================================================ */}
        <div
          className={`w-full rounded-3xl border p-5 sm:p-7 backdrop-blur-xl transition-all duration-500 mb-6 sm:mb-8 ${
            isClockSolved
              ? "border-[#fbbf24]/50 bg-[#081229]/80 shadow-[0_0_45px_rgba(251,191,36,0.18)]"
              : "border-blue-400/20 bg-[#050b1c]/80 shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          }`}
        >
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className={`h-4 w-4 ${isClockSolved ? "text-[#fbbf24]" : "text-blue-400"}`} />
              <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
                I. Align The Hands
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isClockSolved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#fbbf24]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Synchronized
                </span>
              ) : (
                <span className="font-cinzel text-xs tabular-nums tracking-widest text-blue-200/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Hand Selector Toggle for effortless touch accuracy */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              type="button"
              onClick={() => setActiveHand("hour")}
              className={`px-3.5 py-1.5 rounded-full font-cinzel text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
                activeHand === "hour"
                  ? "bg-blue-500/30 border border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                  : "bg-white/5 border border-white/10 text-blue-200/50 hover:text-white"
              }`}
            >
              Hour Hand ({hour})
            </button>
            <button
              type="button"
              onClick={() => setActiveHand("minute")}
              className={`px-3.5 py-1.5 rounded-full font-cinzel text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
                activeHand === "minute"
                  ? "bg-[#fbbf24]/25 border border-[#fbbf24] text-[#fcd88b] shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                  : "bg-white/5 border border-white/10 text-blue-200/50 hover:text-white"
              }`}
            >
              Minute Hand ({String(minute).padStart(2, "0")})
            </button>
          </div>

          {/* Interactive Analog Clock Dial */}
          <div className="flex flex-col items-center justify-center">
            <div
              ref={clockRef}
              onPointerDown={(e) => {
                e.preventDefault();
                setDraggingHand(activeHand);
                updateClockFromPoint(e.clientX, e.clientY, activeHand);
              }}
              className="relative w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] rounded-full select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center"
            >
              {/* Dial SVG */}
              <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                {/* Outer Glow Circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="142"
                  fill="#030716"
                  stroke={isClockSolved ? "#fbbf24" : "#60a5fa"}
                  strokeOpacity="0.5"
                  strokeWidth="2"
                />
                <circle
                  cx="150"
                  cy="150"
                  r="132"
                  fill="none"
                  stroke="#a78bfa"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                />

                {/* 60 Minute Ticks */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const isMajor = i % 5 === 0;
                  return (
                    <line
                      key={i}
                      x1="150"
                      y1="12"
                      x2="150"
                      y2={isMajor ? "24" : "18"}
                      stroke={isClockSolved ? "#fbbf24" : isMajor ? "#93c5fd" : "#60a5fa"}
                      strokeOpacity={isMajor ? 0.9 : 0.35}
                      strokeWidth={isMajor ? 2 : 1}
                      transform={`rotate(${i * 6} 150 150)`}
                    />
                  );
                })}

                {/* Roman Numerals */}
                {ROMAN_NUMERALS.map((num, i) => {
                  const angleRad = ((i * 30 - 90) * Math.PI) / 180;
                  const r = 106;
                  const x = 150 + r * Math.cos(angleRad);
                  const y = 150 + r * Math.sin(angleRad);
                  return (
                    <text
                      key={num}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isClockSolved ? "#fcd88b" : "#c4b5fd"}
                      fontSize="13"
                      className="font-cinzel font-bold pointer-events-none select-none"
                    >
                      {num}
                    </text>
                  );
                })}
              </svg>

              {/* HOUR HAND */}
              <div
                style={{ transform: `rotate(${hourAngle}deg)` }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveHand("hour");
                  setDraggingHand("hour");
                }}
                className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[4px] w-[8px] h-[27%] rounded-full bg-gradient-to-t from-blue-400 to-white shadow-[0_0_12px_rgba(96,165,250,0.9)] cursor-grab active:cursor-grabbing z-20"
              >
                {/* Grab Handle Knob on Tip */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-transform ${
                    activeHand === "hour"
                      ? "border-white bg-blue-500/80 scale-110 shadow-[0_0_12px_#60a5fa]"
                      : "border-blue-300/50 bg-blue-950/60"
                  }`}
                />
              </div>

              {/* MINUTE HAND */}
              <div
                style={{ transform: `rotate(${minuteAngle}deg)` }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveHand("minute");
                  setDraggingHand("minute");
                }}
                className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[2.5px] w-[5px] h-[38%] rounded-full bg-gradient-to-t from-amber-500 to-[#fde68a] shadow-[0_0_14px_rgba(251,191,36,0.9)] cursor-grab active:cursor-grabbing z-30"
              >
                {/* Grab Handle Knob on Tip */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-transform ${
                    activeHand === "minute"
                      ? "border-white bg-amber-500/90 scale-110 shadow-[0_0_12px_#fbbf24]"
                      : "border-amber-300/50 bg-amber-950/60"
                  }`}
                />
              </div>

              {/* Center Pin */}
              <div className="absolute w-4 h-4 rounded-full bg-[#fcd88b] border-2 border-[#030716] shadow-[0_0_10px_#fbbf24] z-40 pointer-events-none" />
            </div>

            <p className="mt-3 text-[11px] sm:text-xs text-blue-200/50 text-center">
              Drag the clock hands or tap anywhere on the dial to set the time.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PUZZLE 2: SWIPE BLOCK PUZZLE FOR "FAS" (BOTTOM)              */}
        {/* ============================================================ */}
        <div
          className={`w-full rounded-3xl border p-5 sm:p-7 backdrop-blur-xl transition-all duration-500 ${
            isBlocksSolved
              ? "border-[#fbbf24]/50 bg-[#081229]/80 shadow-[0_0_45px_rgba(251,191,36,0.18)]"
              : "border-blue-400/20 bg-[#050b1c]/80 shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          }`}
        >
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Grid className={`h-4 w-4 ${isBlocksSolved ? "text-[#fbbf24]" : "text-blue-400"}`} />
              <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
                II. Align The Crest
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isBlocksSolved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#fbbf24]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aligned
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resetBlocks}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-blue-200/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-blue-100/60 mb-5">
            Swipe or tap the blocks to form the faculty initials across the{" "}
            <span className="text-[#fcd88b] font-semibold">center row</span>.
          </p>

          {/* 3x3 Block Grid */}
          <div className="relative mx-auto w-full max-w-[270px] sm:max-w-[310px] aspect-square p-3 rounded-2xl border border-blue-400/20 bg-[#020512]/90 shadow-inner select-none touch-none">
            {/* Highlighted Center Target Row Indicator */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-1.5 right-1.5 top-1/2 -translate-y-1/2 h-[32%] rounded-xl border-2 transition-colors duration-500 ${
                isBlocksSolved
                  ? "border-[#fbbf24] bg-[#fbbf24]/10 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                  : "border-dashed border-blue-400/40 bg-blue-500/[0.04]"
              }`}
            />

            <div
              className="relative z-10 grid grid-cols-3 grid-rows-3 gap-2.5 w-full h-full"
              onTouchStart={(e) => handleTouchStart(e, -1)}
              onTouchEnd={handleTouchEnd}
            >
              {tiles.map((letter, idx) => {
                const isEmpty = letter === "";
                const isCenterRow = idx >= 3 && idx <= 5;
                const isCorrectInSlot =
                  (idx === 3 && letter === "F") ||
                  (idx === 4 && letter === "A") ||
                  (idx === 5 && letter === "S");

                if (isEmpty) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="w-full h-full rounded-xl bg-white/[0.015] border border-white/5"
                    />
                  );
                }

                return (
                  <motion.button
                    key={letter}
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    type="button"
                    onClick={() => moveTile(idx)}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleTouchStart(e, idx);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleTouchEnd(e);
                    }}
                    className={`relative flex items-center justify-center w-full h-full rounded-xl font-cinzel text-2xl sm:text-3xl font-bold select-none cursor-pointer transition-colors ${
                      isBlocksSolved && isCenterRow
                        ? "bg-gradient-to-b from-[#fbbf24]/40 to-amber-600/30 border-2 border-[#fbbf24] text-white shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                        : isCorrectInSlot
                        ? "bg-blue-500/30 border-2 border-blue-300 text-white shadow-[0_0_15px_rgba(96,165,250,0.4)]"
                        : "bg-gradient-to-b from-blue-900/50 to-[#091536]/90 border border-blue-400/30 text-blue-100 hover:border-blue-300/60 active:scale-95"
                    }`}
                  >
                    {letter}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Center Row Status */}
          <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-cinzel uppercase tracking-[0.25em] text-blue-200/60">
            <span>Center Row:</span>
            <span className={isBlocksSolved ? "text-[#fbbf24] font-bold" : "text-white"}>
              {tiles[3] || "_"} • {tiles[4] || "_"} • {tiles[5] || "_"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECRET REVEAL MODAL WHEN BOTH PUZZLES ARE SOLVED             */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showVictoryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVictoryModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-[#fbbf24]/50 bg-gradient-to-b from-[#0b1636] to-[#040817] p-6 sm:p-8 text-center shadow-[0_0_70px_rgba(251,191,36,0.3)]"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 text-[#fbbf24] shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>

              <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-[#fcd88b]">
                11:09 • FAS Unlocked
              </p>

              <h3 className="mt-2 font-cinzel text-2xl sm:text-3xl font-bold uppercase text-white">
                The Gate of Time Opens
              </h3>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-blue-100/75">
                You have synchronized the exact moment <span className="text-[#fcd88b] font-semibold">11:09</span> and aligned the mark of the{" "}
                <span className="text-[#fcd88b] font-semibold">Faculty of Applied Sciences (FAS)</span>. The journey beyond the ordinary awaits you at Sathsara Dahana 2026!
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowVictoryModal(false)}
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-cinzel text-xs uppercase tracking-[0.2em] text-blue-100 hover:bg-white/10 transition-colors"
                >
                  Inspect Puzzle
                </button>
                <Link
                  href="/"
                  className="rounded-full bg-gradient-to-r from-amber-500 to-[#fbbf24] px-6 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:opacity-95 transition-opacity"
                >
                  Return Home
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
