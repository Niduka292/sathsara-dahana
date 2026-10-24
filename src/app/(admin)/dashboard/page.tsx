"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Download, RefreshCw, Trophy, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import type { FirstWinnerRecord } from "@/src/app/api/puzzle/winner/route";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<FirstWinnerRecord | null>(null);

  const fetchWinner = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/puzzle/winner?admin=1", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          claimed: boolean;
          winner: FirstWinnerRecord | null;
        };
        setWinner(data.winner ?? null);
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWinner();
  }, [fetchWinner]);

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchWinner()}
              className="inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-white/5 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.18em] text-[#e9d5ff] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <a
              href="/api/puzzle/winner?format=csv"
              download="sathsara-dahana-first-puzzle-winner.csv"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-[#fbbf24] px-5 py-2 font-cinzel text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:opacity-95 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Excel (.csv)</span>
            </a>
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
                    <td className="py-4 px-4 text-[#e9d5ff]">{winner.email}</td>
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
