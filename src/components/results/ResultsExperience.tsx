"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Guitar, HeartCrack, LoaderCircle, Mic2, PersonStanding } from "lucide-react";
import type { ResultCategory, SelectionResult } from "@/src/data/dancingCrewResults";
import { lookupAllResults } from "@/src/services/results.client";
import { downloadResultCard } from "@/src/lib/downloadResultCard";
import CongratulationsCard from "./CongratulationsCard";
import ResultSearch from "./ResultSearch";

// ─── pageant button config ────────────────────────────────────────────────────
const categories: { id: ResultCategory; label: string; Icon: React.ComponentType<{ className?: string; "aria-hidden"?: string }> }[] = [
  { id: "dancing",      label: "Dancing",      Icon: PersonStanding },
  { id: "singing",      label: "Singing",       Icon: Mic2 },
  { id: "instrumental", label: "Instrumental",  Icon: Guitar },
];

const categoryMeta: Record<ResultCategory, { label: string }> = {
  dancing:      { label: "Dancing Crew" },
  singing:      { label: "Singing Crew" },
  instrumental: { label: "Instrumental" },
};

// ─── single result card + download button ─────────────────────────────────────
function ResultEntry({ result }: { result: SelectionResult }) {
  const cardRef       = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dlError, setDlError]             = useState("");

  const isReserve = result.status === "reserve";
  const meta      = categoryMeta[result.category];
  const CatIcon   = categories.find((c) => c.id === result.category)?.Icon ?? Guitar;

  const handleDownload = async () => {
    if (isDownloading || !cardRef.current) return;
    setIsDownloading(true);
    setDlError("");
    try {
      await downloadResultCard(cardRef.current, result);
    } catch {
      setDlError("Could not create the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl sm:p-7 ${
        isReserve
          ? "border-violet-300/20 bg-violet-950/20 shadow-[0_0_40px_rgba(124,58,237,0.12)]"
          : "border-blue-300/25 bg-blue-950/20 shadow-[0_0_40px_rgba(59,130,246,0.14)]"
      }`}
    >
      {/* top shimmer */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent ${
          isReserve ? "via-violet-300/60" : "via-blue-300/60"
        } to-transparent`}
      />

      {/* category badge */}
      <div className="mb-4 flex items-center gap-2">
        <CatIcon aria-hidden="true" className={`h-4 w-4 ${isReserve ? "text-violet-300/70" : "text-blue-300/70"}`} />
        <span className={`font-cinzel text-[9px] uppercase tracking-[0.26em] ${isReserve ? "text-violet-200/55" : "text-blue-200/55"}`}>
          {meta.label} · {isReserve ? "Reserve" : "Selected"}
        </span>
      </div>

      {/* participant info */}
      <p className="font-cinzel text-lg font-bold text-white sm:text-xl">{result.name}</p>
      <p className="mt-1 font-cinzel text-xs tracking-[0.12em] text-white/45">{result.indexNumber}</p>
      {result.instrument && (
        <p className="mt-1 text-xs text-blue-200/55">{result.instrument}</p>
      )}

      {/* hidden printable card – off-screen for html-to-image */}
      <div className="pointer-events-none fixed left-[-10000px] top-0 w-[480px]" aria-hidden="true">
        <CongratulationsCard ref={cardRef} result={result} />
      </div>

      {/* download button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 font-cinzel text-[9px] font-bold uppercase tracking-[0.16em] text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-60 sm:text-[10px] ${
            isReserve
              ? "border-violet-300/30 bg-violet-500/20 hover:border-violet-200/50 hover:bg-violet-500/30"
              : "border-blue-300/30 bg-blue-500/20 hover:border-blue-200/50 hover:bg-blue-500/30"
          }`}
        >
          {isDownloading
            ? <LoaderCircle aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" />
            : <Download aria-hidden="true" className="h-4 w-4 shrink-0" />}
          {isDownloading
            ? "Creating Image…"
            : isReserve
              ? "Download Reserve Card"
              : "Download Congratulations Card"}
        </button>
        {dlError && <p className="mt-2 text-xs text-rose-200/80" role="alert">{dlError}</p>}
      </div>
    </motion.div>
  );
}

// ─── main experience ──────────────────────────────────────────────────────────
export default function ResultsExperience() {
  // selected pageant filters (empty = all)
  const [selectedCategories, setSelectedCategories] = useState<Set<ResultCategory>>(new Set());

  const [query,       setQuery]       = useState("");
  const [error,       setError]       = useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results,     setResults]     = useState<SelectionResult[]>([]);
  const [lastQuery,   setLastQuery]   = useState("");

  const inputRef            = useRef<HTMLInputElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const toggleCategory = (id: ResultCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    // reset results when filters change
    setHasSearched(false);
    setResults([]);
    setError("");
  };

  const closeController = useCallback(() => {
    requestControllerRef.current?.abort();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter your name or index number.");
      inputRef.current?.focus();
      return;
    }

    closeController();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setError("");
    setResults([]);
    setIsLoading(true);
    setHasSearched(false);

    try {
      const found = await lookupAllResults(trimmedQuery, controller.signal);

      // If the user picked specific pageants, filter to those only
      const filtered =
        selectedCategories.size === 0
          ? found
          : found.filter((r) => selectedCategories.has(r.category));

      setResults(filtered);
      setLastQuery(trimmedQuery);
      setHasSearched(true);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("We could not check your result right now. Please try again.");
    } finally {
      if (requestControllerRef.current === controller) setIsLoading(false);
    }
  };

  const hasResults = results.length > 0;

  return (
    <>
      {/* ── Pageant selector buttons ────────────────────────────────────── */}
      <fieldset className="mx-auto mt-12 max-w-3xl">
        <legend className="mb-5 w-full text-center font-cinzel text-[10px] uppercase tracking-[0.3em] text-blue-100/50 sm:text-xs">
          Select a result category (optional)
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {categories.map(({ id, label, Icon }) => {
            const isSelected = selectedCategories.has(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleCategory(id)}
                aria-pressed={isSelected}
                className={`group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-5 font-cinzel text-xs uppercase tracking-[0.2em] backdrop-blur-xl transition duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                  isSelected
                    ? "border-blue-300/50 bg-blue-500/20 text-white shadow-[0_0_35px_rgba(59,130,246,0.18)]"
                    : "border-white/10 bg-white/[0.035] text-white/50 hover:border-blue-300/30 hover:bg-blue-500/10 hover:text-white"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-6 w-6 transition ${isSelected ? "text-blue-200" : "text-blue-300/45 group-hover:text-blue-200"}`}
                />
                {label}
              </button>
            );
          })}
        </div>
        {selectedCategories.size > 0 && (
          <p className="mt-3 text-center text-[10px] text-blue-200/35">
            Filtering by: {[...selectedCategories].map((c) => categoryMeta[c].label).join(" · ")}
            {" · "}
            <button
              type="button"
              onClick={() => { setSelectedCategories(new Set()); setHasSearched(false); setResults([]); }}
              className="underline hover:text-blue-200/60"
            >
              Clear filter
            </button>
          </p>
        )}
      </fieldset>

      {/* ── Search box ──────────────────────────────────────────────────── */}
      <ResultSearch
        query={query}
        error={error}
        isLoading={isLoading}
        inputRef={inputRef}
        onQueryChange={(value) => {
          setQuery(value);
          if (error) setError("");
        }}
        onSubmit={handleSubmit}
      />

      {/* ── Results / sorry state ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Results found */}
        {hasSearched && hasResults && (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-10 max-w-3xl"
          >
            <p className="mb-6 text-center font-cinzel text-[10px] uppercase tracking-[0.28em] text-green-300/70 sm:text-xs">
              🎉 Found {results.length} selection{results.length > 1 ? "s" : ""} for &ldquo;{lastQuery}&rdquo;
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <AnimatePresence>
                {results.map((result) => (
                  <ResultEntry
                    key={`${result.category}-${result.indexNumber}`}
                    result={result}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Sorry – not found */}
        {hasSearched && !hasResults && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-10 max-w-xl"
          >
            <div className="relative overflow-hidden rounded-3xl border border-rose-300/15 bg-rose-950/15 p-8 text-center backdrop-blur-xl shadow-[0_0_50px_rgba(244,63,94,0.08)]">
              <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-rose-300/15 bg-rose-500/10">
                <HeartCrack aria-hidden="true" className="h-7 w-7 text-rose-300/60" />
              </div>
              <h2 className="font-cinzel text-xl font-bold text-white sm:text-2xl">We&apos;re Sorry!</h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-blue-100/50">
                We could not find any selections matching{" "}
                <span className="font-medium text-white/70">&ldquo;{lastQuery}&rdquo;</span>
                {selectedCategories.size > 0 && (
                  <span> in the selected category filter</span>
                )}.
              </p>
              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-blue-100/35">
                Thank you for participating in Sathsara Dahana. Keep pursuing your passion — your music journey is just beginning!
              </p>
              <div aria-hidden="true" className="mt-6 flex items-center justify-center gap-2 text-rose-300/20">
                <span className="h-px w-16 bg-current" />
                <span className="font-cinzel text-[10px] uppercase tracking-[0.3em]">Sathsara Dahana 2026</span>
                <span className="h-px w-16 bg-current" />
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}
