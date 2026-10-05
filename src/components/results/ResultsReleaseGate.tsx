"use client";

import { motion } from "framer-motion";
import { useResultsRelease } from "@/hooks/useResultsRelease";
import { RESULTS_RELEASE_LABEL } from "@/src/lib/resultsRelease";
import ResultsExperience from "./ResultsExperience";
import ResultsHero from "./ResultsHero";
import CountdownSeconds from "./CountdownSeconds";

export default function ResultsReleaseGate({ initialNow }: { initialNow: number }) {
  const { released, countdown } = useResultsRelease(initialNow);

  return (
    <>
      <ResultsHero released={released} />
      {released ? <ResultsExperience /> : (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          aria-labelledby="results-countdown-heading"
          className="mx-auto mt-14 w-full max-w-xl rounded-3xl border border-blue-400/15 bg-[#060b1d]/70 p-4 text-center shadow-[0_0_60px_rgba(59,130,246,0.12)] backdrop-blur-md sm:p-9"
        >
          <h3 id="results-countdown-heading" className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#fcd88b] sm:text-sm">
            Results reveal in
          </h3>
          <div role="timer" aria-label="Time until results release" className="mt-7 grid grid-cols-4 gap-2 sm:gap-4">
            {Object.entries(countdown!).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <div className="rounded-xl border border-blue-300/20 bg-white/[0.035] py-4 font-cinzel text-2xl tabular-nums text-white shadow-[0_0_24px_rgba(59,130,246,0.12)] sm:py-5 sm:text-4xl">
                  {label === "seconds" ? <CountdownSeconds value={value} /> : String(value).padStart(2, "0")}
                </div>
                <p className="mt-3 font-cinzel text-[8px] uppercase tracking-[0.08em] text-blue-100/60 sm:text-[10px] sm:tracking-[0.16em]">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-7 text-sm leading-6 text-blue-100/60">Sathsara Dahana 2026 results are almost here.</p>
          <p className="mt-3 text-sm text-[#fcd88b]">{RESULTS_RELEASE_LABEL}</p>
          <p className="mt-1 text-xs text-blue-100/40">Sri Lanka Time (Asia/Colombo)</p>
        </motion.section>
      )}
    </>
  );
}
