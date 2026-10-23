"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles, Grid, HelpCircle, X } from "lucide-react";
import VortexBackground from "../ui/VortexBackground";

const ROMAN_NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

// Target Time/Date for the Clock Puzzle: 10.31 (October 31st)
const TARGET_HOUR = 10;
const TARGET_MINUTE = 31;

// Standard 8-Puzzle Target: ["1", "2", "3", "4", "5", "6", "7", "8", ""]
const SOLVED_TILES = ["1", "2", "3", "4", "5", "6", "7", "8", ""];

// Solvable initial state (6 valid moves from solved state so it's fun and mobile-friendly)
const INITIAL_TILES = ["4", "1", "3", "2", "", "5", "7", "8", "6"];

type ClockMode = "realtime" | "rewinding" | "editable";

export default function PuzzleExperience() {
  // --- 8-PUZZLE STATE ---
  const [tiles, setTiles] = useState<string[]>(INITIAL_TILES);
  const touchStartRef = useRef<{ x: number; y: number; index: number } | null>(null);

  const isEightPuzzleSolved = tiles.every((tile, idx) => tile === SOLVED_TILES[idx]);

  // --- CLOCK STATE ---
  const [clockMode, setClockMode] = useState<ClockMode>("realtime");
  const [realTimeAngles, setRealTimeAngles] = useState<{
    hourAngle: number;
    minuteAngle: number;
    secondAngle: number;
  }>({ hourAngle: 0, minuteAngle: 0, secondAngle: 0 });

  // Editable clock state (starts at 03.15 when user clicks the rewinding clock)
  const [hour, setHour] = useState<number>(3);
  const [minute, setMinute] = useState<number>(15);
  const [draggingHand, setDraggingHand] = useState<"hour" | "minute" | null>(null);
  const [showClueModal, setShowClueModal] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  const isClockSolved =
    clockMode === "editable" && hour === TARGET_HOUR && minute === TARGET_MINUTE;

  const isAllSolved = isEightPuzzleSolved && isClockSolved;
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // 1. Real-time clock ticking when in "realtime" mode
  useEffect(() => {
    if (clockMode !== "realtime") return;

    const updateRealTime = () => {
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      const secondAngle = (s + ms / 1000) * 6;
      const minuteAngle = (m + s / 60) * 6;
      const hourAngle = (h + m / 60) * 30;

      setRealTimeAngles({ hourAngle, minuteAngle, secondAngle });
    };

    updateRealTime();
    const interval = setInterval(updateRealTime, 50);
    return () => clearInterval(interval);
  }, [clockMode]);

  // 2. When 8-puzzle is solved, automatically transition clock from "realtime" -> "rewinding"
  useEffect(() => {
    if (isEightPuzzleSolved && clockMode === "realtime") {
      setClockMode("rewinding");
    }
  }, [isEightPuzzleSolved, clockMode]);

  // 3. Show victory modal when both puzzles are solved
  useEffect(() => {
    if (isAllSolved) {
      const timer = setTimeout(() => setShowVictoryModal(true), 450);
      return () => clearTimeout(timer);
    } else {
      setShowVictoryModal(false);
    }
  }, [isAllSolved]);

  // --- CLOCK INTERACTION LOGIC (ONLY IN EDITABLE MODE) ---
  const editableMinuteAngle = minute * 6;
  const editableHourAngle = (hour % 12) * 30 + minute * 0.5;

  const updateClockFromPoint = useCallback(
    (clientX: number, clientY: number, handToMove: "hour" | "minute") => {
      if (!clockRef.current) return;
      const rect = clockRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;

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

  // Pick whichever hand is angularly closer when clicking directly on the dial face
  const pickClosestHand = useCallback(
    (clientX: number, clientY: number): "hour" | "minute" => {
      if (!clockRef.current) return "minute";
      const rect = clockRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;

      let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (deg < 0) deg += 360;

      const angleDiff = (a: number, b: number) => {
        const d = Math.abs(a - b) % 360;
        return d > 180 ? 360 - d : d;
      };

      const diffHour = angleDiff(deg, editableHourAngle);
      const diffMin = angleDiff(deg, editableMinuteAngle);
      return diffHour < diffMin ? "hour" : "minute";
    },
    [editableHourAngle, editableMinuteAngle]
  );

  useEffect(() => {
    if (!draggingHand || clockMode !== "editable") return;

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
  }, [draggingHand, clockMode, updateClockFromPoint]);

  // --- 8-PUZZLE INTERACTION LOGIC ---
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

    if (Math.max(absX, absY) > 20) {
      const emptyIndex = tiles.indexOf("");
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      if (absX > absY) {
        const swipeDirCol = dx > 0 ? 1 : -1;
        const targetTileRow = emptyRow;
        const targetTileCol = emptyCol - swipeDirCol;
        if (targetTileCol >= 0 && targetTileCol < 3) {
          moveTile(targetTileRow * 3 + targetTileCol);
          return;
        }
      } else {
        const swipeDirRow = dy > 0 ? 1 : -1;
        const targetTileRow = emptyRow - swipeDirRow;
        const targetTileCol = emptyCol;
        if (targetTileRow >= 0 && targetTileRow < 3) {
          moveTile(targetTileRow * 3 + targetTileCol);
          return;
        }
      }
    }

    if (startIdx >= 0) {
      moveTile(startIdx);
    }
  };

  const resetBlocks = () => {
    setTiles(INITIAL_TILES);
    setClockMode("realtime");
    setHour(3);
    setMinute(15);
    setShowClueModal(false);
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
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-cinzel text-[11px] uppercase tracking-[0.2em] text-blue-200/80 backdrop-blur-md transition-all hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>

          {clockMode === "editable" && (
            <button
              type="button"
              onClick={() => setShowClueModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/40 bg-[#a78bfa]/15 px-3.5 py-2 font-cinzel text-[10px] uppercase tracking-[0.2em] text-[#e9d5ff] backdrop-blur-md transition-all hover:bg-[#a78bfa]/25"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#c4b5fd]" />
              <span>Riddle Clue</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* TOP: ANALOG CLOCK (REALTIME -> REWINDING -> EDITABLE)        */}
        {/* ============================================================ */}
        <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative flex items-center justify-center w-full">
            {/* The Analog Clock Dial */}
            <div
              ref={clockRef}
              onClick={() => {
                if (clockMode === "rewinding") {
                  setClockMode("editable");
                  setShowClueModal(true);
                }
              }}
              onPointerDown={(e) => {
                if (clockMode !== "editable") return;
                e.preventDefault();
                const closest = pickClosestHand(e.clientX, e.clientY);
                setDraggingHand(closest);
                updateClockFromPoint(e.clientX, e.clientY, closest);
              }}
              className={`relative w-[210px] h-[210px] sm:w-[260px] sm:h-[260px] rounded-full select-none flex items-center justify-center transition-shadow duration-500 ${
                clockMode === "rewinding"
                  ? "cursor-pointer shadow-[0_0_50px_rgba(167,139,250,0.45)] animate-pulse"
                  : clockMode === "editable"
                  ? isClockSolved
                    ? "touch-none cursor-grab active:cursor-grabbing shadow-[0_0_55px_rgba(251,191,36,0.35)]"
                    : "touch-none cursor-grab active:cursor-grabbing shadow-[0_0_45px_rgba(59,130,246,0.25)]"
                  : "cursor-default shadow-[0_0_30px_rgba(59,130,246,0.12)]"
              }`}
            >
              {/* Dial SVG */}
              <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                <circle
                  cx="150"
                  cy="150"
                  r="142"
                  fill="#030716"
                  stroke={
                    isClockSolved
                      ? "#fbbf24"
                      : clockMode === "rewinding"
                      ? "#a78bfa"
                      : "#60a5fa"
                  }
                  strokeOpacity="0.55"
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
                      stroke={
                        isClockSolved
                          ? "#fbbf24"
                          : clockMode === "rewinding"
                          ? "#c4b5fd"
                          : isMajor
                          ? "#93c5fd"
                          : "#60a5fa"
                      }
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

              {/* --- MODE 1: NORMAL REAL-TIME CLOCK HANDS --- */}
              {clockMode === "realtime" && (
                <>
                  {/* Hour Hand */}
                  <div
                    style={{ transform: `rotate(${realTimeAngles.hourAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[3.5px] w-[7px] h-[26%] rounded-full bg-gradient-to-t from-blue-400 to-white shadow-[0_0_10px_rgba(96,165,250,0.8)] pointer-events-none z-20"
                  />
                  {/* Minute Hand */}
                  <div
                    style={{ transform: `rotate(${realTimeAngles.minuteAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[2px] w-[4px] h-[36%] rounded-full bg-gradient-to-t from-amber-500 to-[#fde68a] shadow-[0_0_10px_rgba(251,191,36,0.8)] pointer-events-none z-30"
                  />
                  {/* Second Hand */}
                  <div
                    style={{ transform: `rotate(${realTimeAngles.secondAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[1px] w-[2px] h-[40%] rounded-full bg-cyan-300/90 shadow-[0_0_8px_#67e8f9] pointer-events-none z-35"
                  />
                </>
              )}

              {/* --- MODE 2: RAPID ANTI-CLOCKWISE REWINDING HANDS --- */}
              {clockMode === "rewinding" && (
                <>
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[3.5px] w-[7px] h-[26%] rounded-full bg-gradient-to-t from-purple-400 to-white shadow-[0_0_15px_#a78bfa] pointer-events-none z-20"
                  />
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 0.35, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[2px] w-[4px] h-[36%] rounded-full bg-gradient-to-t from-amber-400 to-white shadow-[0_0_16px_#fbbf24] pointer-events-none z-30"
                  />
                </>
              )}

              {/* --- MODE 3: EDITABLE / DRAGGABLE PUZZLE HANDS --- */}
              {clockMode === "editable" && (
                <>
                  {/* Hour Hand */}
                  <div
                    style={{ transform: `rotate(${editableHourAngle}deg)` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingHand("hour");
                    }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[4px] w-[8px] h-[27%] rounded-full bg-gradient-to-t from-blue-400 to-white shadow-[0_0_12px_rgba(96,165,250,0.9)] cursor-grab active:cursor-grabbing z-20"
                  >
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-transform ${
                        draggingHand === "hour"
                          ? "border-white bg-blue-500 scale-125 shadow-[0_0_14px_#60a5fa]"
                          : "border-blue-200/80 bg-blue-600/80 shadow-[0_0_8px_#60a5fa]"
                      }`}
                    />
                  </div>

                  {/* Minute Hand */}
                  <div
                    style={{ transform: `rotate(${editableMinuteAngle}deg)` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingHand("minute");
                    }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[2.5px] w-[5px] h-[38%] rounded-full bg-gradient-to-t from-amber-500 to-[#fde68a] shadow-[0_0_14px_rgba(251,191,36,0.9)] cursor-grab active:cursor-grabbing z-30"
                  >
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-transform ${
                        draggingHand === "minute"
                          ? "border-white bg-amber-500 scale-125 shadow-[0_0_14px_#fbbf24]"
                          : "border-amber-200/80 bg-amber-500/80 shadow-[0_0_8px_#fbbf24]"
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Center Pin */}
              <div className="absolute w-4 h-4 rounded-full bg-[#fcd88b] border-2 border-[#030716] shadow-[0_0_10px_#fbbf24] z-40 pointer-events-none" />
            </div>

            {/* SIDE TIME / DATE DISPLAY (e.g., 10.31) IN EDITABLE STAGE */}
            <AnimatePresence>
              {clockMode === "editable" && (
                <motion.div
                  initial={{ opacity: 0, x: -12, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -12, scale: 0.9 }}
                  className={`ml-3 sm:ml-6 flex flex-col items-center justify-center rounded-2xl border px-3.5 py-2.5 sm:px-5 sm:py-3.5 backdrop-blur-xl transition-all ${
                    isClockSolved
                      ? "border-[#fbbf24] bg-[#fbbf24]/20 text-[#fcd88b] shadow-[0_0_30px_rgba(251,191,36,0.35)]"
                      : draggingHand
                      ? "border-blue-400 bg-blue-950/70 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)]"
                      : "border-blue-400/30 bg-[#050b1c]/90 text-blue-100"
                  }`}
                >
                  <span className="font-cinzel text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-blue-300/70 mb-0.5">
                    Date
                  </span>
                  <span className="font-cinzel text-lg sm:text-2xl font-bold tabular-nums tracking-wider">
                    {String(hour).padStart(2, "0")}.{String(minute).padStart(2, "0")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle status prompt below the clock only when rewinding or editable */}
          <AnimatePresence mode="wait">
            {clockMode === "rewinding" && (
              <motion.p
                key="rewinding-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 font-cinzel text-xs uppercase tracking-[0.25em] text-[#c4b5fd] animate-pulse text-center"
              >
                Time is unravelling... Tap the clock to seize the hands
              </motion.p>
            )}
            {clockMode === "editable" && (
              <motion.p
                key="editable-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 text-[11px] sm:text-xs text-blue-200/60 text-center"
              >
                Drag the clock hands to align the date from the riddle.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM: CLASSIC 8-PUZZLE                                     */}
        {/* ============================================================ */}
        <div
          className={`w-full rounded-3xl border p-5 sm:p-7 backdrop-blur-xl transition-all duration-500 ${
            isEightPuzzleSolved
              ? "border-[#fbbf24]/50 bg-[#081229]/80 shadow-[0_0_45px_rgba(251,191,36,0.18)]"
              : "border-blue-400/20 bg-[#050b1c]/80 shadow-[0_0_40px_rgba(59,130,246,0.12)]"
          }`}
        >
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Grid className={`h-4 w-4 ${isEightPuzzleSolved ? "text-[#fbbf24]" : "text-blue-400"}`} />
              <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
                8-Tile Sliding Puzzle
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isEightPuzzleSolved && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#fbbf24]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                </span>
              )}
              <button
                type="button"
                onClick={resetBlocks}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-blue-200/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-blue-100/60 mb-5">
            {isEightPuzzleSolved
              ? "The tiles are aligned in order! Look to the clock above."
              : "Swipe or tap the numbered blocks to arrange 1 through 8 in order."}
          </p>

          {/* 3x3 8-Puzzle Grid */}
          <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] aspect-square p-3 rounded-2xl border border-blue-400/20 bg-[#020512]/90 shadow-inner select-none touch-none">
            <div
              className="relative z-10 grid grid-cols-3 grid-rows-3 gap-2.5 w-full h-full"
              onTouchStart={(e) => handleTouchStart(e, -1)}
              onTouchEnd={handleTouchEnd}
            >
              {tiles.map((tileValue, idx) => {
                const isEmpty = tileValue === "";
                const isCorrectInPlace = tileValue === SOLVED_TILES[idx];

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
                    key={tileValue}
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
                      isEightPuzzleSolved
                        ? "bg-gradient-to-b from-[#fbbf24]/35 to-amber-600/25 border-2 border-[#fbbf24] text-white shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                        : isCorrectInPlace
                        ? "bg-blue-500/25 border border-blue-300/60 text-white"
                        : "bg-gradient-to-b from-blue-900/50 to-[#091536]/90 border border-blue-400/30 text-blue-100 hover:border-blue-300/60 active:scale-95"
                    }`}
                  >
                    <span>{tileValue}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CLUE POPUP MODAL WHEN USER CLICKS THE REWINDING CLOCK        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showClueModal && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClueModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-[#a78bfa]/50 bg-gradient-to-b from-[#0e1538] to-[#050816] p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(167,139,250,0.3)]"
            >
              <button
                type="button"
                onClick={() => setShowClueModal(false)}
                aria-label="Close clue"
                className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-[#c4b5fd]">
                The Timekeeper&apos;s Riddle
              </p>

              <h3 className="mt-2 font-cinzel text-xl sm:text-2xl font-bold uppercase text-white">
                When Shadows Awake
              </h3>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 text-xs sm:text-sm italic leading-relaxed text-blue-100/85 font-serif">
                &ldquo;Seek the night when lanterns glow, masks are worn, and whispers echo at the very end of the tenth moon.
                <br />
                <br />
                Let the <span className="text-blue-300 not-italic font-semibold">short hand mark the month</span>, and the{" "}
                <span className="text-[#fcd88b] not-italic font-semibold">long hand mark the final night</span>.&rdquo;
              </div>

              <button
                type="button"
                onClick={() => setShowClueModal(false)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-blue-500 px-6 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:opacity-95 transition-opacity"
              >
                Set The Clock
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                10.31 • October 31st Unlocked
              </p>

              <h3 className="mt-2 font-cinzel text-2xl sm:text-3xl font-bold uppercase text-white">
                The Gate of Time Opens
              </h3>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-blue-100/75">
                You solved the cipher and aligned the hands of time to{" "}
                <span className="text-[#fcd88b] font-semibold">10.31 (October 31st)</span>. Something beyond the ordinary awaits you on Halloween night at Sathsara Dahana 2026!
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
