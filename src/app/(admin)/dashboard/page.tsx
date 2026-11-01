"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Trash2,
  Lock,
  KeyRound,
  LogOut,
} from "lucide-react";
import type { FirstWinnerRecord } from "@/src/app/api/puzzle/winner/route";
import { clearMultiClientStorage } from "@/src/lib/puzzleFingerprint";

export default function AdminDashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [winner, setWinner] = useState<FirstWinnerRecord | null>(null);

  const fetchWinner = useCallback(async (passwordHeader?: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (passwordHeader) {
        headers["x-dashboard-password"] = passwordHeader;
      }

      const res = await fetch("/api/puzzle/winner?admin=1", {
        cache: "no-store",
        headers,
      });

      if (res.status === 401) {
        setAuthenticated(false);
        return false;
      }

      if (res.ok) {
        const data = (await res.json()) as {
          authenticated?: boolean;
          claimed: boolean;
          winner: FirstWinnerRecord | null;
        };
        setAuthenticated(true);
        setWinner(data.winner ?? null);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    void fetchWinner();
  }, [fetchWinner]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || submittingPassword) return;

    setSubmittingPassword(true);
    setAuthError(null);

    const ok = await fetchWinner(password.trim());
    if (!ok) {
      setAuthError("Invalid dashboard password. Please try again.");
    } else {
      setPassword("");
    }
    setSubmittingPassword(false);
  };

  const handleLockDashboard = async () => {
    try {
      await fetch("/api/puzzle/winner?logout=1", { cache: "no-store" });
    } catch {
      // Ignore logout error
    }
    setAuthenticated(false);
    setWinner(null);
  };

  const handleResetPuzzleHistory = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await Promise.all([
        fetch("/api/puzzle/winner", { method: "DELETE", cache: "no-store" }),
        fetch("/api/puzzle/daily", { method: "DELETE", cache: "no-store" }),
        clearMultiClientStorage(),
      ]);
      setWinner(null);
    } catch {
      // Ignore reset errors
    } finally {
      setResetting(false);
    }
  };

  // --- PASSWORD GATE ---
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#050207] text-white flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md rounded-3xl border border-[#a78bfa]/35 bg-gradient-to-b from-[#240713]/95 to-[#090206]/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(159,18,57,0.3)] text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 text-[#fbbf24] shadow-[0_0_25px_rgba(251,191,36,0.35)]">
            <Lock className="h-5 w-5" />
          </div>

          <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-[#c4b5fd]">
            Restricted Access
          </p>
          <h1 className="mt-2 font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-[0.15em] text-white">
            Dashboard Protected
          </h1>
          <p className="mt-2 text-xs text-[#e9d5ff]/70">
            Enter the administrator password to view or manage puzzle submissions.
          </p>

          {checkingAuth ? (
            <div className="mt-6 py-4 font-cinzel text-xs uppercase tracking-[0.25em] text-[#c4b5fd]">
              Checking session...
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label
                  htmlFor="dashboard-password"
                  className="block font-cinzel text-[10px] uppercase tracking-[0.22em] text-[#c4b5fd] mb-1.5"
                >
                  Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a78bfa]/70" />
                  <input
                    id="dashboard-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#a78bfa]/30 bg-[#14040a]/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-[#fbbf24] focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-xs text-rose-300 text-center" role="alert">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingPassword}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-[#fbbf24] px-6 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.45)] hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                <span>{submittingPassword ? "Verifying..." : "Unlock Dashboard"}</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              href="/puzzle"
              className="inline-flex items-center gap-1.5 font-cinzel text-[11px] uppercase tracking-[0.2em] text-[#e9d5ff]/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#93c5fd]" />
              <span>Return to Puzzle</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- UNLOCKED DASHBOARD ---
  return (
    <main className="min-h-screen bg-[#050207] text-white px-4 py-14 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/puzzle"
              className="inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-[#1a0610]/80 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.2em] text-[#e9d5ff] hover:border-[#93c5fd]/60 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#93c5fd]" />
              <span>Puzzle</span>
            </Link>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-[0.15em] text-white">
              Puzzle Winner Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchWinner()}
              className="inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-white/5 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.18em] text-[#e9d5ff] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => void handleResetPuzzleHistory()}
              disabled={resetting}
              className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/50 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-900/60 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>{resetting ? "Resetting..." : "Reset History"}</span>
            </button>

            <a
              href="/api/puzzle/winner?format=csv"
              download="sathsara-dahana-first-puzzle-winner.csv"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-[#fbbf24] px-5 py-2 font-cinzel text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:opacity-95 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Excel (.csv)</span>
            </a>

            <button
              type="button"
              onClick={() => void handleLockDashboard()}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.18em] text-white/75 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Winner Card */}
        <div className="rounded-3xl border border-[#a78bfa]/30 bg-gradient-to-b from-[#1f0610]/90 to-[#0a0207]/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(159,18,57,0.25)]">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-5 w-5 text-[#fbbf24]" />
              <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-white">
                #1 First Finisher Record
              </h2>
            </div>

            {winner ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#fcd88b]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Claimed &amp; Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/30 bg-white/5 px-3 py-1 font-cinzel text-[10px] uppercase tracking-widest text-[#c4b5fd]">
                <Clock className="h-3.5 w-3.5" /> Awaiting 1st Finisher
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center font-cinzel text-xs uppercase tracking-[0.25em] text-[#c4b5fd]">
              Loading winner record...
            </div>
          ) : !winner ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 py-12 px-4 text-center">
              <p className="font-cinzel text-sm uppercase tracking-[0.2em] text-[#e9d5ff]">
                No one has completed the puzzle yet
              </p>
              <p className="mt-2 text-xs text-[#c4b5fd]/70">
                As soon as the first person solves both stages and submits their details, they will appear here and in the Excel export.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#a78bfa]/25 bg-black/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#a78bfa]/20 bg-[#2a0815]/60 font-cinzel text-[10px] uppercase tracking-[0.2em] text-[#c4b5fd]">
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Registration No.</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Completed At</th>
                    <th className="py-3.5 px-4">Puzzle Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-cinzel font-bold text-[#fbbf24]">#1</td>
                    <td className="py-4 px-4 font-medium text-white">{winner.fullName}</td>
                    <td className="py-4 px-4 font-mono text-[#93c5fd]">
                      {winner.registrationNumber}
                    </td>
                    <td className="py-4 px-4 text-[#e9d5fd]">{winner.email}</td>
                    <td className="py-4 px-4 text-[#c4b5fd]">{winner.completedAtLocal}</td>
                    <td className="py-4 px-4 font-mono text-[#fcd88b]">
                      {winner.solveTimeSeconds != null ? `${winner.solveTimeSeconds}s` : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
