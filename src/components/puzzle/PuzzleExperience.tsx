"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Grid,
  HelpCircle,
  X,
  Timer,
  Lock,
  Flame,
  Trophy,
  Send,
  RefreshCw,
} from "lucide-react";
import VortexBackground from "../ui/VortexBackground";
import type { PublicLeaderboardEntry } from "@/src/app/api/puzzle/winner/route";
import {
  getDeviceFingerprint,
  readMultiClientStorage,
  writeMultiClientStorage,
  syncServerDailyPuzzleState,
  type DailyPuzzleRecord,
} from "@/src/lib/puzzleFingerprint";

const ROMAN_NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

// Theme palette matching the reference TimeAstrolabe image
const ICE_BLUE = "#93c5fd";
const VIOLET = "#a78bfa";
const GOLD = "#fbbf24";

// Target Time/Date for the Clock Puzzle: 07.18 (July 18)
const TARGET_HOUR = 7;
const TARGET_MINUTE = 18;

// 1-minute (60-second) countdown constraint & daily limits
const PUZZLE_TIME_LIMIT_SEC = 60;
const PUZZLE_TIME_LIMIT_MS = PUZZLE_TIME_LIMIT_SEC * 1000;
const MAX_DAILY_TRIES = 3;
const MAX_MANUAL_SHUFFLES = 2;

// Standard 15-Puzzle (4x4) Target: ["1".."15", ""]
const GRID_SIZE = 4;
const SOLVED_TILES = [
  "1", "2", "3", "4",
  "5", "6", "7", "8",
  "9", "10", "11", "12",
  "13", "14", "15", "",
];

// Deterministic SSR fallback state (randomized on client mount & every reset)
const INITIAL_TILES = [
  "5", "1", "2", "4",
  "9", "6", "3", "8",
  "13", "10", "7", "12",
  "14", "11", "15", "",
];

/** Returns local date key YYYY-MM-DD so limits reset at 00:00 local midnight. */
function getLocalDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns formatted HH:MM:SS remaining until 00:00 local midnight. */
function getTimeUntilMidnightText(now = new Date()): string {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.ceil(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

/**
 * Generates a randomized, guaranteed-solvable 15-puzzle (4x4) board by making
 * non-backtracking valid sliding moves across the grid from the solved state.
 */
function generateRandomSolvableTiles(previousTiles?: string[], shuffleSteps = 28): string[] {
  const current = [...SOLVED_TILES];
  let emptyIdx = current.indexOf("");
  let lastEmptyIdx = -1;

  for (let step = 0; step < shuffleSteps; step++) {
    const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
    const emptyCol = emptyIdx % GRID_SIZE;
    const neighbors: number[] = [];

    if (emptyRow > 0) neighbors.push((emptyRow - 1) * GRID_SIZE + emptyCol);
    if (emptyRow < GRID_SIZE - 1) neighbors.push((emptyRow + 1) * GRID_SIZE + emptyCol);
    if (emptyCol > 0) neighbors.push(emptyRow * GRID_SIZE + (emptyCol - 1));
    if (emptyCol < GRID_SIZE - 1) neighbors.push(emptyRow * GRID_SIZE + (emptyCol + 1));

    const candidates = neighbors.filter((n) => n !== lastEmptyIdx);
    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)];

    current[emptyIdx] = current[chosenIdx];
    current[chosenIdx] = "";
    lastEmptyIdx = emptyIdx;
    emptyIdx = chosenIdx;
  }

  // Ensure it is neither already solved nor identical to the previous board
  const isSolved = current.every((tile, idx) => tile === SOLVED_TILES[idx]);
  const isSameAsPrev =
    previousTiles && current.every((tile, idx) => tile === previousTiles[idx]);

  if (isSolved || isSameAsPrev) {
    return generateRandomSolvableTiles(previousTiles, shuffleSteps + 1);
  }

  return current;
}

type ClockMode = "realtime" | "stopwatch" | "rewinding" | "editable";

export default function PuzzleExperience() {
  // --- 15-PUZZLE STATE ---
  const [tiles, setTiles] = useState<string[]>(INITIAL_TILES);

  const isFifteenPuzzleSolved = tiles.every((tile, idx) => tile === SOLVED_TILES[idx]);

  // --- DAILY LIMITS STATE (3 TRIES / DAY, 2 MANUAL SHUFFLES, RESETS AT 00:00) ---
  const [currentDateKey, setCurrentDateKey] = useState<string>(() => getLocalDateKey());
  const [triesUsed, setTriesUsed] = useState<number>(0);
  const [shufflesUsed, setShufflesUsed] = useState<number>(0);
  const [midnightCountdown, setMidnightCountdown] = useState<string>("00:00:00");

  const triesRemaining = Math.max(0, MAX_DAILY_TRIES - triesUsed);
  const shufflesRemaining = Math.max(0, MAX_MANUAL_SHUFFLES - shufflesUsed);
  const isOutOfTries = triesRemaining <= 0 && !isFifteenPuzzleSolved;

  // --- CLOCK & 30s STOPWATCH STATE ---
  // Starts in "realtime" showing actual clock time until user makes their first move
  const [clockMode, setClockMode] = useState<ClockMode>("realtime");
  const [realTimeAngles, setRealTimeAngles] = useState<{
    hourAngle: number;
    minuteAngle: number;
    secondAngle: number;
  }>({ hourAngle: 0, minuteAngle: 0, secondAngle: 0 });

  const [timeLeftMs, setTimeLeftMs] = useState<number>(PUZZLE_TIME_LIMIT_MS);
  const [solveTimeSec, setSolveTimeSec] = useState<number | null>(null);
  const [timeoutNotice, setTimeoutNotice] = useState<boolean>(false);
  const deadlineRef = useRef<number>(0);

  // Editable clock state (starts at 03.15 when user clicks the rewinding clock)
  const [hour, setHour] = useState<number>(3);
  const [minute, setMinute] = useState<number>(15);
  const [draggingHand, setDraggingHand] = useState<"hour" | "minute" | null>(null);
  const [showClueModal, setShowClueModal] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  const isClockSolved =
    clockMode === "editable" && hour === TARGET_HOUR && minute === TARGET_MINUTE;

  const isAllSolved = isFifteenPuzzleSolved && isClockSolved;
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // --- TOP 10 LEADERBOARD & SUBMISSION STATE ---
  const [winnerLoading, setWinnerLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<PublicLeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [myEntry, setMyEntry] = useState<{
    rank: number;
    fullName: string;
    registrationNumber: string;
    solveTimeSeconds: number | null;
    inTop10: boolean;
  } | null>(null);
  const [submittedCurrentSolve, setSubmittedCurrentSolve] = useState(false);
  const [fullName, setFullName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submittingWinner, setSubmittingWinner] = useState(false);
  const [winnerFeedback, setWinnerFeedback] = useState<string | null>(null);
  const [winnerFeedbackIsError, setWinnerFeedbackIsError] = useState(false);

  const fetchLeaderboardData = useCallback(async (markSolved = false) => {
    setLoadingLeaderboard(true);
    try {
      const storedToken =
        typeof window !== "undefined"
          ? sessionStorage.getItem("sd_puzzle_winner_token") || ""
          : "";
      const fp = await getDeviceFingerprint();
      const solvedParam = markSolved ? "&solved=1" : "";
      const res = await fetch(
        `/api/puzzle/winner?fp=${encodeURIComponent(fp)}${solvedParam}&token=${encodeURIComponent(
          storedToken
        )}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        leaderboard?: PublicLeaderboardEntry[];
        myEntry?: {
          rank: number;
          fullName: string;
          registrationNumber: string;
          solveTimeSeconds: number | null;
          inTop10: boolean;
        } | null;
      };
      if (Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
      if (data.myEntry) {
        setMyEntry(data.myEntry);
      }
    } catch {
      // Ignore network error
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  // Persist daily state across localStorage + IndexedDB + CacheStorage + Server (IP + Fingerprint + HttpOnly Cookie + Firebase)
  const saveDailyState = useCallback(
    (
      nextTriesUsed: number,
      nextShufflesUsed: number,
      attemptInProgress = false,
      dateKeyOverride?: string
    ) => {
      const dateKey = dateKeyOverride ?? getLocalDateKey();
      const record: DailyPuzzleRecord = {
        dateKey,
        triesUsed: Math.min(MAX_DAILY_TRIES, nextTriesUsed),
        shufflesUsed: Math.min(MAX_MANUAL_SHUFFLES, nextShufflesUsed),
        attemptInProgress,
      };

      writeMultiClientStorage(record);

      void syncServerDailyPuzzleState(record, false).then((synced) => {
        if (synced.dateKey === getLocalDateKey()) {
          setTriesUsed((prev) => Math.max(prev, synced.triesUsed));
          setShufflesUsed((prev) => Math.max(prev, synced.shufflesUsed));
        }
      });
    },
    []
  );

  // Load daily state from multi-storage + server fingerprint/IP on initial client mount
  useEffect(() => {
    let cancelled = false;
    setTiles(generateRandomSolvableTiles(INITIAL_TILES));
    const todayKey = getLocalDateKey();
    setCurrentDateKey(todayKey);
    setMidnightCountdown(getTimeUntilMidnightText());

    async function hydrateDailyState() {
      const localRecord = await readMultiClientStorage(todayKey);
      const recoveredLocalTries = Math.min(
        MAX_DAILY_TRIES,
        localRecord.triesUsed + (localRecord.attemptInProgress ? 1 : 0)
      );
      const recoveredLocalShuffles = Math.min(
        MAX_MANUAL_SHUFFLES,
        localRecord.shufflesUsed
      );

      if (!cancelled) {
        setTriesUsed(recoveredLocalTries);
        setShufflesUsed(recoveredLocalShuffles);
      }

      const initialPayload: DailyPuzzleRecord = {
        dateKey: todayKey,
        triesUsed: recoveredLocalTries,
        shufflesUsed: recoveredLocalShuffles,
        attemptInProgress: false,
      };
      writeMultiClientStorage(initialPayload);

      // Sync with server (checks IP + Hardware Fingerprint + HttpOnly Cookie + Firebase)
      const serverSynced = await syncServerDailyPuzzleState(initialPayload, true);
      if (!cancelled && serverSynced.dateKey === todayKey) {
        setTriesUsed(Math.min(MAX_DAILY_TRIES, serverSynced.triesUsed));
        setShufflesUsed(Math.min(MAX_MANUAL_SHUFFLES, serverSynced.shufflesUsed));
      }
    }

    // Pre-fill solver profile from localStorage if they submitted previously
    try {
      const savedProfile = localStorage.getItem("sd_puzzle_solver_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as {
          fullName?: string;
          registrationNumber?: string;
          email?: string;
        };
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.registrationNumber) setRegistrationNumber(parsed.registrationNumber);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {
      // Ignore storage error
    }

    void hydrateDailyState();
    void fetchLeaderboardData(false);
    return () => {
      cancelled = true;
    };
  }, [fetchLeaderboardData]);

  // Monitor 00:00 midnight rollover & update countdown to 00:00
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const todayKey = getLocalDateKey(now);
      setMidnightCountdown(getTimeUntilMidnightText(now));

      if (todayKey !== currentDateKey) {
        // 00:00 reached! Reset daily tries and manual shuffles
        setCurrentDateKey(todayKey);
        setTriesUsed(0);
        setShufflesUsed(0);
        setTimeoutNotice(false);
        setClockMode("realtime");
        setTimeLeftMs(PUZZLE_TIME_LIMIT_MS);
        setTiles((prev) => generateRandomSolvableTiles(prev));
        saveDailyState(0, 0, false, todayKey);
      }
    };

    const interval = setInterval(checkMidnight, 1000);
    return () => clearInterval(interval);
  }, [currentDateKey, saveDailyState]);

  // Handle automatic timeout when 30-second stopwatch expires (consumes 1 try)
  const handleAutoTimeout = useCallback(() => {
    setTiles((prev) => generateRandomSolvableTiles(prev));
    setClockMode("realtime");
    setHour(3);
    setMinute(15);
    setShowClueModal(false);
    setTimeLeftMs(PUZZLE_TIME_LIMIT_MS);
    setTimeoutNotice(true);

    setTriesUsed((prevTries) => {
      const nextTries = Math.min(MAX_DAILY_TRIES, prevTries + 1);
      saveDailyState(nextTries, shufflesUsed, false);
      return nextTries;
    });
  }, [saveDailyState, shufflesUsed]);

  // Handle manual Shuffle button click (limited to 2 manual shuffles per day)
  const handleManualShuffle = useCallback(() => {
    if (isOutOfTries || shufflesUsed >= MAX_MANUAL_SHUFFLES || isFifteenPuzzleSolved) {
      return;
    }

    const nextShuffles = Math.min(MAX_MANUAL_SHUFFLES, shufflesUsed + 1);
    setShufflesUsed(nextShuffles);
    saveDailyState(triesUsed, nextShuffles, false);

    setTiles((prev) => generateRandomSolvableTiles(prev));
    setClockMode("realtime");
    setHour(3);
    setMinute(15);
    setShowClueModal(false);
    setTimeLeftMs(PUZZLE_TIME_LIMIT_MS);
    setTimeoutNotice(false);
  }, [isOutOfTries, shufflesUsed, isFifteenPuzzleSolved, saveDailyState, triesUsed]);

  // Clear timeout notice banner after 2.6s
  useEffect(() => {
    if (!timeoutNotice) return;
    const timer = setTimeout(() => setTimeoutNotice(false), 2600);
    return () => clearTimeout(timer);
  }, [timeoutNotice]);

  // 1a. Actual Real-Time Clock ticking when in "realtime" mode (before user makes a move)
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

  // 1b. 30-Second Stopwatch Countdown when in "stopwatch" mode (after user starts moving)
  useEffect(() => {
    if (clockMode !== "stopwatch" || isFifteenPuzzleSolved) return;

    const tick = () => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      if (remaining <= 0) {
        handleAutoTimeout();
      } else {
        setTimeLeftMs(remaining);
      }
    };

    tick();
    const interval = setInterval(tick, 40);
    return () => clearInterval(interval);
  }, [clockMode, isFifteenPuzzleSolved, handleAutoTimeout]);

  // 2. When 15-puzzle is solved, record solve time, clear attemptInProgress, and transition clock to "rewinding"
  useEffect(() => {
    if (isFifteenPuzzleSolved && (clockMode === "stopwatch" || clockMode === "realtime")) {
      const elapsedSec = Number(
        ((PUZZLE_TIME_LIMIT_MS - timeLeftMs) / 1000).toFixed(2)
      );
      setSolveTimeSec(Math.max(0.5, elapsedSec));
      saveDailyState(triesUsed, shufflesUsed, false);
      setClockMode("rewinding");
      setTimeoutNotice(false);
    }
  }, [isFifteenPuzzleSolved, clockMode, timeLeftMs, saveDailyState, triesUsed, shufflesUsed]);

  // 3. Show victory modal & refresh Top 10 Leaderboard when puzzle is solved
  useEffect(() => {
    if (isAllSolved) {
      let cancelled = false;
      setWinnerLoading(true);
      setSubmittedCurrentSolve(false);
      setWinnerFeedback(null);

      fetchLeaderboardData(true).finally(() => {
        if (!cancelled) setWinnerLoading(false);
      });

      const timer = setTimeout(() => setShowVictoryModal(true), 450);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    } else {
      setShowVictoryModal(false);
    }
  }, [isAllSolved, fetchLeaderboardData]);

  // Handle Top 10 Leaderboard form submission (keeps fastest time per Registration Number)
  const handleClaimFirstWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingWinner) return;

    setSubmittingWinner(true);
    setWinnerFeedback(null);
    setWinnerFeedbackIsError(false);

    try {
      const fingerprint = await getDeviceFingerprint();
      const res = await fetch("/api/puzzle/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          registrationNumber,
          email,
          solveTimeSeconds: solveTimeSec,
          fingerprint,
        }),
      });

      const data = (await res.json()) as {
        claimed?: boolean;
        status?: string;
        rank?: number;
        inTop10?: boolean;
        bestTimeSeconds?: number | null;
        myEntry?: {
          rank: number;
          fullName: string;
          registrationNumber: string;
          solveTimeSeconds: number | null;
          inTop10: boolean;
        } | null;
        leaderboard?: PublicLeaderboardEntry[];
        redirectTo?: string;
        winnerToken?: string;
        message?: string;
      };

      if (res.ok || res.status === 201) {
        if (typeof window !== "undefined") {
          try {
            if (data.winnerToken) {
              sessionStorage.setItem("sd_puzzle_winner_token", data.winnerToken);
            }
            localStorage.setItem(
              "sd_puzzle_solver_profile",
              JSON.stringify({
                fullName: fullName.trim(),
                registrationNumber: registrationNumber.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
              })
            );
          } catch {}
        }

        if (Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        }
        if (data.myEntry) {
          setMyEntry(data.myEntry);
        }
        setSubmittedCurrentSolve(true);
        setWinnerFeedbackIsError(false);
        setWinnerFeedback(
          data.message ??
            "Your solve time has been recorded on the leaderboard!"
        );
      } else {
        setWinnerFeedbackIsError(true);
        setWinnerFeedback(data.message ?? "Please check your details and try again.");
      }
    } catch {
      setWinnerFeedbackIsError(true);
      setWinnerFeedback("Network error while submitting. Please try again.");
    } finally {
      setSubmittingWinner(false);
    }
  };

  // --- STOPWATCH DERIVED VALUES ---
  const secondsRemaining = Math.ceil(timeLeftMs / 1000);
  const displayMinutes = Math.floor(secondsRemaining / 60);
  const displaySeconds = secondsRemaining % 60;
  const formattedStopwatch = `${String(displayMinutes).padStart(2, "0")}:${String(
    displaySeconds
  ).padStart(2, "0")}`;
  const progressFraction = Math.max(0, Math.min(1, timeLeftMs / PUZZLE_TIME_LIMIT_MS));
  // Stopwatch main hand sweeps 360 deg over 60 seconds (starts at XII = 360° and counts down to 0°)
  const stopwatchSweepAngle = progressFraction * 360;
  // Sub-second hand sweeps once per second for stopwatch feel
  const subSecondAngle = ((PUZZLE_TIME_LIMIT_MS - timeLeftMs) % 1000) * 0.36;
  const isLowTime = clockMode === "stopwatch" && secondsRemaining <= 10;

  const stopwatchRingRadius = 122;
  const stopwatchRingCircumference = 2 * Math.PI * stopwatchRingRadius;
  const stopwatchStrokeDashoffset =
    stopwatchRingCircumference * (1 - progressFraction);

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

  // --- 15-PUZZLE (4x4) INTERACTION LOGIC ---
  const moveTile = useCallback(
    (index: number) => {
      if (isOutOfTries || isFifteenPuzzleSolved) return;

      const emptyIndex = tiles.indexOf("");
      if (emptyIndex === -1 || index === emptyIndex) return;

      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
      const emptyCol = emptyIndex % GRID_SIZE;

      // Allow moves if the tapped tile shares the same row or column as the blank space (single tile or chunk)
      if (row !== emptyRow && col !== emptyCol) return;

      const next = [...tiles];

      if (row === emptyRow) {
        // Shift tiles horizontally along the row towards the empty space
        if (col < emptyCol) {
          for (let c = emptyCol; c > col; c--) {
            next[row * GRID_SIZE + c] = next[row * GRID_SIZE + (c - 1)];
          }
        } else {
          for (let c = emptyCol; c < col; c++) {
            next[row * GRID_SIZE + c] = next[row * GRID_SIZE + (c + 1)];
          }
        }
        next[row * GRID_SIZE + col] = "";
      } else {
        // Shift tiles vertically along the column towards the empty space
        if (row < emptyRow) {
          for (let r = emptyRow; r > row; r--) {
            next[r * GRID_SIZE + col] = next[(r - 1) * GRID_SIZE + col];
          }
        } else {
          for (let r = emptyRow; r < row; r++) {
            next[r * GRID_SIZE + col] = next[(r + 1) * GRID_SIZE + col];
          }
        }
        next[row * GRID_SIZE + col] = "";
      }

      setTiles(next);

      // Start the 30-second stopwatch on the user's first valid move
      const willBeSolved = next.every((tile, idx) => tile === SOLVED_TILES[idx]);
      if (clockMode === "realtime" && !willBeSolved) {
        deadlineRef.current = Date.now() + PUZZLE_TIME_LIMIT_MS;
        setTimeLeftMs(PUZZLE_TIME_LIMIT_MS);
        setTimeoutNotice(false);
        setClockMode("stopwatch");
        saveDailyState(triesUsed, shufflesUsed, true);
      }
    },
    [isOutOfTries, isFifteenPuzzleSolved, tiles, clockMode, saveDailyState, triesUsed, shufflesUsed]
  );

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-[#050207] px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
      <VortexBackground />

      {/* Deep Crimson & Violet Ambient Glows matching the Astrolabe image */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[22%] h-[30rem] w-[38rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-red-700/25 blur-[135px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[58%] h-[26rem] w-[34rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-rose-900/20 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center">
        {/* Top Bar Navigation */}
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/25 bg-[#1a0610]/70 px-4 py-2 font-cinzel text-[11px] uppercase tracking-[0.2em] text-[#e9d5ff] backdrop-blur-md transition-all hover:border-[#93c5fd]/50 hover:bg-[#2d0a1a]/80 hover:text-white shadow-[0_0_20px_rgba(159,18,57,0.25)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#93c5fd]" />
            <span>Back</span>
          </Link>

          {clockMode === "editable" && (
            <button
              type="button"
              onClick={() => setShowClueModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#2d0a16]/80 px-3.5 py-2 font-cinzel text-[10px] uppercase tracking-[0.2em] text-[#fde68a] backdrop-blur-md transition-all hover:bg-[#3f0e20] shadow-[0_0_20px_rgba(251,191,36,0.2)]"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#fbbf24]" />
              <span>Riddle Clue</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* TOP: ASTROLABE ANALOG CLOCK (REALTIME -> STOPWATCH -> EDIT)  */}
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
              className={`relative w-[225px] h-[225px] sm:w-[275px] sm:h-[275px] rounded-full select-none flex items-center justify-center transition-shadow duration-500 ${
                clockMode === "rewinding"
                  ? "cursor-pointer shadow-[0_0_60px_rgba(167,139,250,0.45)] animate-pulse"
                  : clockMode === "editable"
                  ? isClockSolved
                    ? "touch-none cursor-grab active:cursor-grabbing shadow-[0_0_65px_rgba(251,191,36,0.4)]"
                    : "touch-none cursor-grab active:cursor-grabbing shadow-[0_0_55px_rgba(225,29,72,0.35)]"
                  : isLowTime
                  ? "cursor-default shadow-[0_0_55px_rgba(239,68,68,0.45)]"
                  : "cursor-default shadow-[0_0_45px_rgba(159,18,57,0.35)]"
              }`}
            >
              {/* Breathing Crimson Glow Behind Clock matching the image */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[6%] rounded-full bg-red-600/30 blur-[36px]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[16%] rounded-full bg-rose-500/20 blur-[24px]"
              />

              {/* Dial SVG */}
              <svg viewBox="0 0 300 300" className="relative z-10 w-full h-full overflow-visible">
                <defs>
                  {/* Deep crimson-burgundy radial fill matching the uploaded image */}
                  <radialGradient id="astrolabeDialGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#520c1d" />
                    <stop offset="48%" stopColor="#2e0611" />
                    <stop offset="80%" stopColor="#140309" />
                    <stop offset="100%" stopColor="#070208" />
                  </radialGradient>
                </defs>

                {/* Main Dial Background */}
                <circle
                  cx="150"
                  cy="150"
                  r="144"
                  fill="url(#astrolabeDialGrad)"
                  stroke={
                    isClockSolved
                      ? GOLD
                      : isLowTime
                      ? "#f87171"
                      : clockMode === "rewinding"
                      ? VIOLET
                      : ICE_BLUE
                  }
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />

                {/* Inner Outer-Track Ring */}
                <circle
                  cx="150"
                  cy="150"
                  r="134"
                  fill="none"
                  stroke={ICE_BLUE}
                  strokeOpacity="0.2"
                  strokeWidth="1"
                />

                {/* 60 Minute/Second Ticks */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const isMajor = i % 5 === 0;
                  return (
                    <line
                      key={i}
                      x1="150"
                      y1="6"
                      x2="150"
                      y2={isMajor ? "16" : "11"}
                      stroke={
                        isClockSolved
                          ? GOLD
                          : isLowTime && isMajor
                          ? "#fca5a5"
                          : isMajor
                          ? ICE_BLUE
                          : VIOLET
                      }
                      strokeOpacity={isMajor ? 0.9 : 0.35}
                      strokeWidth={isMajor ? 2 : 1}
                      transform={`rotate(${i * 6} 150 150)`}
                    />
                  );
                })}

                {/* Stopwatch 30s Depleting Progress Ring (Only visible once user starts moving) */}
                {clockMode === "stopwatch" && (
                  <circle
                    cx="150"
                    cy="150"
                    r={stopwatchRingRadius}
                    fill="none"
                    stroke={isLowTime ? "#ef4444" : GOLD}
                    strokeOpacity={isLowTime ? 0.85 : 0.65}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={stopwatchRingCircumference}
                    strokeDashoffset={stopwatchStrokeDashoffset}
                    transform="rotate(-90 150 150)"
                  />
                )}

                {/* Violet Numeral Ring Circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="112"
                  fill="none"
                  stroke={VIOLET}
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />

                {/* Roman Numerals */}
                {ROMAN_NUMERALS.map((num, i) => {
                  const angleRad = ((i * 30 - 90) * Math.PI) / 180;
                  const r = 122;
                  const x = 150 + r * Math.cos(angleRad);
                  const y = 150 + r * Math.sin(angleRad);
                  return (
                    <text
                      key={num}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isClockSolved ? "#fcd88b" : VIOLET}
                      fillOpacity="0.9"
                      fontSize="11"
                      letterSpacing="0.5"
                      className="font-cinzel font-semibold pointer-events-none select-none"
                    >
                      {num}
                    </text>
                  );
                })}

                {/* Inner Dotted Ring with 4 Gold Diamonds matching the image */}
                <circle
                  cx="150"
                  cy="150"
                  r="94"
                  fill="none"
                  stroke={VIOLET}
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  strokeDasharray="1.5 6"
                />
                {[25, 115, 205, 295].map((angle) => (
                  <rect
                    key={angle}
                    x="146.5"
                    y="52.5"
                    width="7"
                    height="7"
                    fill={GOLD}
                    fillOpacity="0.9"
                    transform={`rotate(${angle} 150 150) rotate(45 150 56)`}
                  />
                ))}

                {/* Tilted Astrolabe Elliptical Orbits matching the image */}
                <ellipse
                  cx="150"
                  cy="150"
                  rx="126"
                  ry="38"
                  fill="none"
                  stroke={VIOLET}
                  strokeOpacity="0.28"
                  strokeWidth="1"
                  transform="rotate(-26 150 150)"
                />
                <ellipse
                  cx="150"
                  cy="150"
                  rx="126"
                  ry="38"
                  fill="none"
                  stroke={VIOLET}
                  strokeOpacity="0.28"
                  strokeWidth="1"
                  transform="rotate(26 150 150)"
                />
              </svg>

              {/* --- MODE 0: ACTUAL REAL-TIME CLOCK HANDS (BEFORE FIRST MOVE) --- */}
              {clockMode === "realtime" && (
                <>
                  {/* Hour Hand (Ice Blue) */}
                  <div
                    style={{ transform: `rotate(${realTimeAngles.hourAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[2.5px] w-[5px] h-[26%] rounded-full bg-gradient-to-t from-transparent via-[#93c5fd] to-white shadow-[0_0_10px_rgba(147,197,253,0.85)] pointer-events-none z-20"
                  />
                  {/* Minute Hand (Gold) */}
                  <div
                    style={{ transform: `rotate(${realTimeAngles.minuteAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[1.5px] w-[3px] h-[36%] rounded-full bg-gradient-to-t from-transparent via-[#fbbf24] to-[#fde68a] shadow-[0_0_10px_rgba(251,191,36,0.85)] pointer-events-none z-30"
                  />
                  {/* Second Hand (Violet/White) */}
                  <div
                    style={{ transform: `rotate(${realTimeAngles.secondAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[0.75px] w-[1.5px] h-[40%] rounded-full bg-gradient-to-t from-transparent via-[#c4b5fd] to-white shadow-[0_0_8px_#a78bfa] pointer-events-none z-35"
                  />
                </>
              )}

              {/* --- MODE 1: 30-SECOND STOPWATCH COUNTDOWN (ONCE MOVING STARTS) --- */}
              {clockMode === "stopwatch" && (
                <>
                  {/* Digital Stopwatch Readout inside the lower half of the dial */}
                  <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-10 sm:pb-12">
                    <div
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 backdrop-blur-md transition-colors ${
                        isLowTime
                          ? "border-red-500/60 bg-red-950/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
                          : "border-[#a78bfa]/35 bg-[#1b050d]/85 text-[#f3e8ff] shadow-[0_0_12px_rgba(167,139,250,0.2)]"
                      }`}
                    >
                      <Timer
                        className={`h-3 w-3 ${
                          isLowTime ? "text-red-400" : "text-[#fbbf24]"
                        }`}
                      />
                      <span className="font-cinzel text-xs sm:text-sm font-bold tabular-nums tracking-wider">
                        {formattedStopwatch}
                      </span>
                    </div>
                  </div>

                  {/* Fast Sub-Second Hand (Gold thin hand like in the image) */}
                  <div
                    style={{ transform: `rotate(${subSecondAngle}deg)` }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[1px] w-[2px] h-[38%] rounded-full bg-gradient-to-t from-transparent via-[#fbbf24]/80 to-[#fde68a] shadow-[0_0_8px_#fbbf24] pointer-events-none z-25"
                  />

                  {/* Main 30s Countdown Stopwatch Hand (Ice-Blue hand like in the image) */}
                  <div
                    style={{ transform: `rotate(${stopwatchSweepAngle}deg)` }}
                    className={`absolute left-1/2 bottom-1/2 origin-bottom -ml-[2.5px] w-[5px] h-[32%] rounded-full pointer-events-none z-30 ${
                      isLowTime
                        ? "bg-gradient-to-t from-red-600/40 via-red-400 to-white shadow-[0_0_14px_#ef4444]"
                        : "bg-gradient-to-t from-transparent via-[#93c5fd] to-white shadow-[0_0_12px_rgba(147,197,253,0.9)]"
                    }`}
                  />
                </>
              )}

              {/* --- MODE 2: RAPID ANTI-CLOCKWISE REWINDING HANDS --- */}
              {clockMode === "rewinding" && (
                <>
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[3px] w-[6px] h-[27%] rounded-full bg-gradient-to-t from-transparent via-[#93c5fd] to-white shadow-[0_0_15px_#93c5fd] pointer-events-none z-20"
                  />
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 0.35, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[1.5px] w-[3px] h-[38%] rounded-full bg-gradient-to-t from-transparent via-[#fbbf24] to-[#fde68a] shadow-[0_0_16px_#fbbf24] pointer-events-none z-30"
                  />
                </>
              )}

              {/* --- MODE 3: EDITABLE / DRAGGABLE PUZZLE HANDS --- */}
              {clockMode === "editable" && (
                <>
                  {/* Hour Hand (Ice Blue) */}
                  <div
                    style={{ transform: `rotate(${editableHourAngle}deg)` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingHand("hour");
                    }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[3.5px] w-[7px] h-[27%] rounded-full bg-gradient-to-t from-[#60a5fa]/40 via-[#93c5fd] to-white shadow-[0_0_12px_rgba(147,197,253,0.9)] cursor-grab active:cursor-grabbing z-20"
                  >
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-transform ${
                        draggingHand === "hour"
                          ? "border-white bg-[#60a5fa] scale-125 shadow-[0_0_14px_#93c5fd]"
                          : "border-[#93c5fd] bg-[#1e3a8a]/85 shadow-[0_0_8px_#93c5fd]"
                      }`}
                    />
                  </div>

                  {/* Minute Hand (Gold) */}
                  <div
                    style={{ transform: `rotate(${editableMinuteAngle}deg)` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingHand("minute");
                    }}
                    className="absolute left-1/2 bottom-1/2 origin-bottom -ml-[2px] w-[4px] h-[38%] rounded-full bg-gradient-to-t from-amber-600/40 via-[#fbbf24] to-[#fde68a] shadow-[0_0_14px_rgba(251,191,36,0.9)] cursor-grab active:cursor-grabbing z-30"
                  >
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-transform ${
                        draggingHand === "minute"
                          ? "border-white bg-amber-500 scale-125 shadow-[0_0_14px_#fbbf24]"
                          : "border-amber-200/80 bg-amber-600/85 shadow-[0_0_8px_#fbbf24]"
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Center Glowing White/Gold Astrolabe Pin */}
              <div className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#93c5fd] shadow-[0_0_12px_#ffffff,0_0_20px_#93c5fd] z-40 pointer-events-none" />
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
                      ? "border-[#93c5fd] bg-[#2d0a1a]/85 text-white shadow-[0_0_25px_rgba(147,197,253,0.35)]"
                      : "border-[#a78bfa]/35 bg-[#16040c]/90 text-[#f3e8ff]"
                  }`}
                >
                  <span className="font-cinzel text-lg sm:text-2xl font-bold tabular-nums tracking-wider">
                    {String(hour).padStart(2, "0")}.{String(minute).padStart(2, "0")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status prompt below the clock */}
          <AnimatePresence mode="wait">
            {isOutOfTries ? (
              <motion.p
                key="out-of-tries-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 font-cinzel text-xs uppercase tracking-[0.2em] text-[#fca5a5] text-center"
              >
                Daily tries exhausted — Resets at 00:00 ({midnightCountdown})
              </motion.p>
            ) : timeoutNotice ? (
              <motion.p
                key="timeout-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 font-cinzel text-xs uppercase tracking-[0.2em] text-[#fca5a5] text-center"
              >
                1 min elapsed — Try lost! ({triesRemaining} {triesRemaining === 1 ? "try" : "tries"} left today)
              </motion.p>
            ) : clockMode === "stopwatch" ? (
              <motion.p
                key="stopwatch-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 font-cinzel text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#c4b5fd]/80 text-center"
              >
                1-minute countdown active — Solve before time runs out!
              </motion.p>
            ) : clockMode === "rewinding" ? (
              <motion.p
                key="rewinding-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 font-cinzel text-xs uppercase tracking-[0.25em] text-[#fde68a] animate-pulse text-center"
              >
                Time is unravelling... Seize the hands
              </motion.p>
            ) : clockMode === "editable" ? (
              <motion.p
                key="editable-prompt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 text-[11px] sm:text-xs text-[#e9d5ff]/75 text-center"
              >
                Drag the clock hands to align the date from the riddle.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM: CLASSIC 15-PUZZLE                                     */}
        {/* ============================================================ */}
        <div
          className={`w-full rounded-3xl border p-5 sm:p-7 backdrop-blur-xl transition-all duration-500 ${
            isFifteenPuzzleSolved
              ? "border-[#fbbf24]/55 bg-gradient-to-b from-[#2b0916]/85 to-[#0f0309]/90 shadow-[0_0_50px_rgba(251,191,36,0.2)]"
              : "border-[#a78bfa]/25 bg-gradient-to-b from-[#1f0610]/85 to-[#0a0207]/90 shadow-[0_0_45px_rgba(159,18,57,0.22)]"
          }`}
        >
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Grid
                className={`h-4 w-4 ${
                  isFifteenPuzzleSolved ? "text-[#fbbf24]" : "text-[#93c5fd]"
                }`}
              />
              <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
                15-Tile Sliding Puzzle
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Daily Tries Indicator */}
              {!isFifteenPuzzleSolved && (
                <span
                  title="Daily tries remaining (resets at 00:00)"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-cinzel text-[10px] uppercase tracking-widest ${
                    isOutOfTries
                      ? "border-red-500/40 bg-red-950/60 text-red-300"
                      : "border-[#a78bfa]/30 bg-[#2a0815]/70 text-[#f3e8ff]"
                  }`}
                >
                  <Flame
                    className={`h-3 w-3 ${
                      isOutOfTries ? "text-red-400" : "text-[#fbbf24]"
                    }`}
                  />
                  <span>
                    Tries: {triesRemaining}/{MAX_DAILY_TRIES}
                  </span>
                </span>
              )}

              {isFifteenPuzzleSolved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#fbbf24]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                </span>
              ) : clockMode === "stopwatch" ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-cinzel text-[10px] uppercase tracking-widest tabular-nums ${
                    isLowTime
                      ? "border-red-500/50 bg-red-950/60 text-red-300"
                      : "border-[#a78bfa]/30 bg-[#2a0815]/70 text-[#e9d5ff]"
                  }`}
                >
                  <Timer className="h-3 w-3 text-[#fbbf24]" />
                  {secondsRemaining}s
                </span>
              ) : null}

              {/* Manual Shuffle Button (Max 2 per day) */}
              <button
                type="button"
                onClick={handleManualShuffle}
                disabled={isOutOfTries || shufflesRemaining <= 0 || isFifteenPuzzleSolved}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest transition-colors ${
                  isOutOfTries || shufflesRemaining <= 0 || isFifteenPuzzleSolved
                    ? "border-white/10 bg-white/[0.03] text-white/35 cursor-not-allowed"
                    : "bg-white/5 border-[#a78bfa]/25 text-[#e9d5ff]/85 hover:bg-[#a78bfa]/15 hover:text-white cursor-pointer"
                }`}
              >
                <RotateCcw className="h-3 w-3 text-[#93c5fd]" />
                <span>Shuffle ({shufflesRemaining}/{MAX_MANUAL_SHUFFLES})</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#e9d5ff]/65 mb-5">
            {isFifteenPuzzleSolved
              ? "The tiles are aligned in order! Look to the clock above."
              : isOutOfTries
              ? "You have used all 3 tries for today. The cipher resets at 00:00."
              : clockMode === "stopwatch"
              ? "Arrange tiles 1 through 15 in order before the 1-minute stopwatch runs out."
              : "Make your first move to start the 1-minute countdown."}
          </p>

          {/* 4x4 15-Puzzle Grid */}
          <div className="relative mx-auto w-full max-w-[290px] sm:max-w-[340px] aspect-square p-3 rounded-2xl border border-[#a78bfa]/25 bg-[#090206]/95 shadow-[inset_0_0_30px_rgba(136,19,55,0.25)] select-none touch-manipulation overflow-hidden">
            <div className="relative z-10 grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
              {tiles.map((tileValue, idx) => {
                const isEmpty = tileValue === "";
                const isCorrectInPlace = tileValue === SOLVED_TILES[idx];

                if (isEmpty) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="w-full h-full rounded-xl bg-[#1a050d]/40 border border-[#a78bfa]/10"
                    />
                  );
                }

                return (
                  <motion.button
                    key={tileValue}
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    type="button"
                    disabled={isOutOfTries}
                    onClick={() => moveTile(idx)}
                    className={`relative flex items-center justify-center w-full h-full rounded-xl font-cinzel text-lg sm:text-2xl font-bold select-none touch-manipulation transition-colors ${
                      isOutOfTries
                        ? "bg-gradient-to-b from-[#290712]/50 to-[#120308]/70 border border-white/10 text-white/30 cursor-not-allowed"
                        : isFifteenPuzzleSolved
                        ? "bg-gradient-to-b from-[#fbbf24]/35 via-[#9f1239]/45 to-[#4c0519]/70 border-2 border-[#fbbf24] text-white shadow-[0_0_18px_rgba(251,191,36,0.35)] cursor-pointer"
                        : isCorrectInPlace
                        ? "bg-gradient-to-b from-[#6b1129]/85 to-[#300714]/95 border border-[#fbbf24]/65 text-[#fde68a] shadow-[0_0_14px_rgba(251,191,36,0.2)] cursor-pointer"
                        : "bg-gradient-to-b from-[#3d0a1a]/80 to-[#17040b]/95 border border-[#a78bfa]/35 text-[#f3e8ff] hover:border-[#93c5fd]/70 active:scale-95 cursor-pointer"
                    }`}
                  >
                    <span>{tileValue}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Locked Overlay when all 3 daily tries are exhausted */}
            <AnimatePresence>
              {isOutOfTries && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090206]/90 backdrop-blur-md p-5 text-center"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-red-500/40 bg-red-950/60 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <p className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
                    Daily Limit Reached
                  </p>
                  <p className="mt-1 text-[11px] text-[#e9d5ff]/70">
                    All 3 tries used for today.
                  </p>
                  <div className="mt-3 rounded-full border border-[#a78bfa]/35 bg-[#1f0610]/90 px-3.5 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.2em] text-[#fde68a] tabular-nums">
                    Resets at 00:00 • {midnightCountdown}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile / Short Screen Digital Countdown (Below Puzzle Grid) */}
          {!isFifteenPuzzleSolved && !isOutOfTries && (
            <div className="mt-4 flex justify-center sm:hidden">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md transition-all ${
                  clockMode === "stopwatch"
                    ? isLowTime
                      ? "border-red-500/70 bg-red-950/85 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.55)] animate-pulse"
                      : "border-[#a78bfa]/45 bg-[#1f0612]/90 text-[#fde68a] shadow-[0_0_16px_rgba(251,191,36,0.25)]"
                    : "border-white/15 bg-black/40 text-white/70"
                }`}
              >
                <Timer
                  className={`h-3.5 w-3.5 ${
                    clockMode === "stopwatch"
                      ? isLowTime
                        ? "text-red-400"
                        : "text-[#fbbf24]"
                      : "text-white/40"
                  }`}
                />
                <span className="font-cinzel text-xs font-bold tracking-wider">
                  {clockMode === "stopwatch" ? (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#e9d5ff]/70 mr-1.5">
                        Time Left:
                      </span>
                      <span className="tabular-nums text-sm font-black text-white">
                        {formattedStopwatch}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 mr-1.5">
                        Time Limit:
                      </span>
                      <span className="tabular-nums text-sm font-semibold text-white/80">
                        01:00
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* PUBLIC TOP 10 FASTEST SOLVERS LEADERBOARD                     */}
        {/* ============================================================ */}
        <div
          id="puzzle-leaderboard"
          className="mt-6 sm:mt-8 w-full rounded-3xl border border-[#a78bfa]/25 bg-gradient-to-b from-[#1f0610]/85 to-[#0a0207]/90 p-5 sm:p-7 backdrop-blur-xl shadow-[0_0_45px_rgba(159,18,57,0.22)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[#fbbf24]" />
              <div>
                <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
                  Top 10 Leaderboard
                </h2>
                <p className="text-[11px] text-[#e9d5ff]/65">
                  Ranked by fastest 15-puzzle solve time (best time per Reg No.)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {myEntry && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#fcd88b]">
                  <Trophy className="h-3 w-3 text-[#fbbf24]" />
                  <span>
                    Your Rank: #{myEntry.rank}
                    {myEntry.solveTimeSeconds != null ? ` (${myEntry.solveTimeSeconds.toFixed(2)}s)` : ""}
                  </span>
                </span>
              )}

              <button
                type="button"
                onClick={() => void fetchLeaderboardData(false)}
                disabled={loadingLeaderboard}
                title="Refresh Leaderboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/25 bg-white/5 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#e9d5ff]/85 hover:bg-[#a78bfa]/15 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 text-[#93c5fd] ${
                    loadingLeaderboard ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loadingLeaderboard && leaderboard.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 py-8 px-4 text-center font-cinzel text-xs uppercase tracking-[0.2em] text-[#c4b5fd]">
              Loading Top 10 Leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 py-8 px-4 text-center">
              <p className="font-cinzel text-xs sm:text-sm uppercase tracking-[0.2em] text-[#e9d5ff]">
                No Solvers Recorded Yet
              </p>
              <p className="mt-1.5 text-xs text-[#c4b5fd]/70">
                Solve the 15-puzzle and align the clock to claim the #1 spot on the Top 10 Leaderboard!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#a78bfa]/20 bg-[#090206]/85">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#a78bfa]/20 bg-[#2a0815]/60 font-cinzel text-[10px] uppercase tracking-[0.18em] text-[#c4b5fd]">
                    <th className="py-3 px-3.5 sm:px-4">Rank</th>
                    <th className="py-3 px-3.5 sm:px-4">Name</th>
                    <th className="py-3 px-3.5 sm:px-4">Reg No.</th>
                    <th className="py-3 px-3.5 sm:px-4 text-right">Best Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                  {leaderboard.map((entry) => {
                    const isMe =
                      myEntry?.registrationNumber &&
                      entry.registrationNumber.toUpperCase() ===
                        myEntry.registrationNumber.toUpperCase();
                    const isFirst = entry.rank === 1;
                    const isSecond = entry.rank === 2;
                    const isThird = entry.rank === 3;

                    return (
                      <tr
                        key={entry.registrationNumber}
                        className={`transition-colors ${
                          isMe
                            ? "bg-[#fbbf24]/15 hover:bg-[#fbbf24]/20"
                            : isFirst
                            ? "bg-[#fbbf24]/[0.06] hover:bg-[#fbbf24]/10"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <td className="py-3 px-3.5 sm:px-4 font-cinzel font-bold whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] border ${
                              isFirst
                                ? "border-[#fbbf24]/60 bg-[#fbbf24]/20 text-[#fcd88b] shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                                : isSecond
                                ? "border-slate-300/50 bg-slate-300/15 text-slate-200"
                                : isThird
                                ? "border-amber-600/50 bg-amber-700/20 text-amber-300"
                                : "border-[#a78bfa]/25 bg-white/5 text-[#c4b5fd]"
                            }`}
                          >
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 sm:px-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <span>{entry.fullName}</span>
                            {isMe && (
                              <span className="rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/20 px-2 py-0.5 font-cinzel text-[9px] uppercase tracking-wider text-[#fcd88b]">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 sm:px-4 font-mono text-xs text-[#93c5fd] whitespace-nowrap">
                          {entry.registrationNumber}
                        </td>
                        <td className="py-3 px-3.5 sm:px-4 text-right font-mono font-bold tabular-nums text-[#fcd88b] whitespace-nowrap">
                          {entry.solveTimeSeconds != null
                            ? `${entry.solveTimeSeconds.toFixed(2)}s`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-[#a78bfa]/50 bg-gradient-to-b from-[#2e0716] via-[#17040c] to-[#080206] p-6 sm:p-8 text-center shadow-[0_0_65px_rgba(159,18,57,0.45)]"
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
                Where It Began
              </h3>

              <div className="mt-4 rounded-2xl border border-[#a78bfa]/20 bg-black/30 p-4 sm:p-5 text-xs sm:text-sm italic leading-relaxed text-[#f3e8ff]/90 font-serif">
                &ldquo;Before the stage came alive and the journey began, eager voices gathered, each hoping to earn their place. It was the first step towards something unforgettable. When did it all begin?
                <br />
                <br />
                Let the <span className="text-[#93c5fd] not-italic font-semibold">short hand mark the month</span>, and the{" "}
                <span className="text-[#fcd88b] not-italic font-semibold">long hand mark the first date</span>.&rdquo;
              </div>

              <button
                type="button"
                onClick={() => setShowClueModal(false)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#9f1239] via-[#7e22ce] to-[#3b82f6] px-6 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_25px_rgba(167,139,250,0.45)] hover:opacity-95 transition-opacity"
              >
                Set The Clock
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* SECRET REVEAL & TOP 10 LEADERBOARD SUBMISSION MODAL          */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showVictoryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVictoryModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative z-10 my-auto w-full max-w-md rounded-3xl border border-[#fbbf24]/50 bg-gradient-to-b from-[#330817] via-[#19040d] to-[#070206] p-6 sm:p-8 text-center shadow-[0_0_70px_rgba(251,191,36,0.3)]"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 text-[#fbbf24] shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>

              <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-[#fcd88b]">
                {submittedCurrentSolve && myEntry
                  ? `RANK #${myEntry.rank} ON LEADERBOARD`
                  : "07.18 • JULY 18 UNLOCKED"}
              </p>

              <h3 className="mt-1.5 font-cinzel text-xl sm:text-2xl font-bold uppercase text-white">
                {submittedCurrentSolve
                  ? "TIME RECORDED!"
                  : "CHRONO CIPHER SOLVED!"}
              </h3>

              {solveTimeSec != null && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#fbbf24]/45 bg-[#fbbf24]/15 px-4 py-1.5 font-cinzel text-xs font-bold uppercase tracking-widest text-[#fcd88b]">
                  <Timer className="h-3.5 w-3.5 text-[#fbbf24]" />
                  <span>15-Puzzle Time: {solveTimeSec.toFixed(2)}s</span>
                </div>
              )}

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#f3e8ff]/80">
                {submittedCurrentSolve ? (
                  <>
                    {winnerFeedback ||
                      "Your fastest solve time has been updated on the Top 10 Leaderboard and the Time Portal is unlocked!"}
                  </>
                ) : (
                  <>
                    You solved the cipher and aligned the hands of time to{" "}
                    <span className="text-[#fcd88b] font-semibold">07.18 (July 18)</span>!
                    Submit your details below to record your fastest time on the Top 10 Leaderboard.
                  </>
                )}
              </p>

              {/* --- TOP 10 LEADERBOARD SUBMISSION FORM OR CONFIRMATION --- */}
              {winnerLoading ? (
                <div className="mt-5 rounded-2xl border border-[#a78bfa]/25 bg-black/30 p-4 text-xs font-cinzel uppercase tracking-widest text-[#c4b5fd]">
                  Checking leaderboard...
                </div>
              ) : !submittedCurrentSolve ? (
                <form
                  onSubmit={handleClaimFirstWinner}
                  className="mt-5 rounded-2xl border border-[#fbbf24]/35 bg-black/40 p-4 sm:p-5 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-[#fbbf24]" />
                    <span className="font-cinzel text-xs font-bold uppercase tracking-[0.18em] text-[#fcd88b]">
                      Submit Time to Leaderboard
                    </span>
                  </div>
                  <p className="text-[11px] text-[#e9d5ff]/75 mb-3.5 leading-relaxed">
                    We keep your fastest time per Registration Number and display the Top 10 fastest solvers.
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block font-cinzel text-[9px] uppercase tracking-[0.2em] text-[#c4b5fd] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Saman Perera"
                        className="w-full rounded-xl border border-[#a78bfa]/30 bg-[#14040a]/90 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#fbbf24] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-cinzel text-[9px] uppercase tracking-[0.2em] text-[#c4b5fd] mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. AS2023XXX"
                        className="w-full rounded-xl border border-[#a78bfa]/30 bg-[#14040a]/90 px-3.5 py-2 text-xs uppercase text-white placeholder:normal-case placeholder:text-white/30 focus:border-[#fbbf24] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-cinzel text-[9px] uppercase tracking-[0.2em] text-[#c4b5fd] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. samanperera@gmail.com"
                        className="w-full rounded-xl border border-[#a78bfa]/30 bg-[#14040a]/90 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#fbbf24] focus:outline-none"
                      />
                    </div>
                  </div>

                  {winnerFeedback && (
                    <p
                      className={`mt-2.5 text-[11px] text-center ${
                        winnerFeedbackIsError ? "text-red-300" : "text-emerald-300"
                      }`}
                    >
                      {winnerFeedback}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingWinner}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-[#fbbf24] px-5 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.45)] hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingWinner ? "Submitting..." : "Submit Time to Leaderboard"}</span>
                  </button>

                  <div className="mt-3 text-center">
                    <Link
                      href="/timeportal"
                      className="inline-flex items-center gap-1.5 font-cinzel text-[10px] uppercase tracking-[0.2em] text-[#c4b5fd] hover:text-white transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-[#fbbf24]" />
                      <span>Skip &amp; Visit Time Portal</span>
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl border border-[#fbbf24]/45 bg-[#fbbf24]/10 p-5 text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#fcd88b]">
                    <CheckCircle2 className="h-4 w-4 text-[#fbbf24]" />
                    <span>
                      {myEntry
                        ? `RANK #${myEntry.rank} • BEST TIME: ${
                            myEntry.solveTimeSeconds != null
                              ? `${myEntry.solveTimeSeconds.toFixed(2)}s`
                              : "RECORDED"
                          }`
                        : "LEADERBOARD UPDATED"}
                    </span>
                  </div>
                  <p className="text-xs text-[#f3e8ff]/90 leading-relaxed">
                    Your best time for <span className="font-mono text-[#93c5fd]">{myEntry?.registrationNumber || registrationNumber.toUpperCase()}</span> is saved on the leaderboard.
                  </p>
                  <Link
                    href="/timeportal"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-[#fbbf24] px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.45)] hover:opacity-95 transition-opacity"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>VISIT THE TIME PORTAL</span>
                  </Link>
                </div>
              )}

              <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowVictoryModal(false)}
                  className="rounded-full border border-[#a78bfa]/30 bg-white/5 px-5 py-2.5 font-cinzel text-xs uppercase tracking-[0.2em] text-[#f3e8ff] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  View Leaderboard
                </button>
                <Link
                  href="/"
                  className="rounded-full bg-white/10 border border-white/20 px-6 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white/20 transition-colors"
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
