"use client";

import { Mic2, Music2, Sparkles, Trophy } from "lucide-react";
import type { SelectionResult } from "@/src/data/dancingCrewResults";
import { articleForRole, getResultHighlight } from "@/src/lib/resultPresentation";

type ResultSummaryProps = {
  result: SelectionResult;
};

export default function ResultSummary({ result }: ResultSummaryProps) {
  const isReserve = result.status === "reserve";
  const highlight = getResultHighlight(result);
  const isInstrumentalSelected = result.category === "instrumental" && !isReserve;

  return (
    <div className="relative text-center">
      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${isReserve ? "border-violet-300/25 bg-violet-400/10 text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.18)]" : "border-blue-300/30 bg-blue-400/10 text-blue-200 shadow-[0_0_30px_rgba(96,165,250,0.25)]"}`}>
        {isReserve
          ? <Sparkles aria-hidden="true" className="h-7 w-7" />
          : result.category === "singing"
            ? <Mic2 aria-hidden="true" className="h-7 w-7" />
            : result.category === "instrumental"
              ? <Music2 aria-hidden="true" className="h-7 w-7" />
              : <Trophy aria-hidden="true" className="h-7 w-7" />}
      </div>

      <div className={`mb-3 flex items-center justify-center gap-2 font-cinzel text-[10px] uppercase tracking-[0.22em] ${isReserve ? "text-violet-200/70" : "text-blue-300/70"}`}>
        <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        {isReserve ? "Reserve Performer" : "Official Selection"}
        <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
      </div>

      <h2 id="result-modal-title" className="font-cinzel text-[clamp(1.35rem,6vw,2rem)] font-bold leading-tight text-white">
        {isReserve ? "Thank You for Your Performance" : "Congratulations!"}
      </h2>

      {!isReserve ? (
        <p id="result-modal-description" className="mx-auto mt-4 max-w-md text-sm leading-7 text-blue-100/55">
          {isInstrumentalSelected
            ? `You have been selected as ${articleForRole(highlight)} ${highlight} in the Sathsara Dahana 2026 Orchestra.`
            : `You have been selected for the ${highlight} of Sathsara Dahana 2026.`}
        </p>
      ) : null}

      <div className={`mx-auto mt-5 inline-flex max-w-full rounded-full border px-5 py-2 font-cinzel text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-xs ${isReserve ? "border-violet-300/25 bg-violet-400/10 text-violet-100" : "border-blue-300/25 bg-blue-400/10 text-blue-100"}`}>
        <span className="break-words">{highlight}</span>
      </div>

      <p className="mx-auto mt-5 max-w-md break-words font-cinzel text-[clamp(1.1rem,5vw,1.5rem)] font-semibold leading-snug text-white">
        {result.name}
      </p>

      <div className="my-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8">
        <div className="bg-[#070c19] px-4 py-4">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-white/35">Index Number</span>
          <span className="mt-2 block break-all font-cinzel text-sm tracking-[0.08em] text-blue-100">{result.indexNumber}</span>
        </div>
      </div>

      {isReserve ? (
        <div id="result-modal-description" className="mx-auto max-w-md space-y-3 text-sm leading-6 text-violet-100/60">
          <p>You have been placed on our Reserve Performers list.</p>
          <p>While you are not currently included in the main performance lineup, we truly appreciated your performance and would like to consider you for future performance opportunities with Sathsara Dahana.</p>
          <p className="font-medium text-violet-100/75">Stay connected — your journey may continue with us.</p>
        </div>
      ) : (
        <p className="text-xs leading-6 text-blue-100/40">Welcome to Sathsara Dahana 2026.</p>
      )}
    </div>
  );
}
