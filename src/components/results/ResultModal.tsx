"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, LoaderCircle, SearchX, Sparkles, Trophy, X } from "lucide-react";
import type { SelectionResult } from "@/src/data/dancingCrewResults";
import { downloadResultCard } from "@/src/lib/downloadResultCard";

type ResultModalProps = {
  isOpen: boolean;
  result: SelectionResult | null;
  searchedIndex: string;
  categoryName: string;
  onClose: () => void;
};

const particles = [
  { left: "12%", top: "18%", delay: 0.1 },
  { left: "22%", top: "75%", delay: 0.35 },
  { left: "40%", top: "12%", delay: 0.6 },
  { left: "63%", top: "17%", delay: 0.25 },
  { left: "80%", top: "70%", delay: 0.5 },
  { left: "89%", top: "28%", delay: 0.75 },
];

export default function ResultModal({ isOpen, result, searchedIndex, categoryName, onClose }: ResultModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusableElements?.length) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsDownloading(false);
      setDownloadError("");
    }
  }, [isOpen]);

  const handleDownload = async () => {
    if (!result || isDownloading) return;
    setIsDownloading(true);
    setDownloadError("");
    try {
      await downloadResultCard(result, categoryName);
    } catch {
      setDownloadError("We could not create the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isSelected = Boolean(result);
  const title = isSelected
    ? result?.name
      ? `Congratulations, ${result.name}!`
      : "Congratulations!"
    : "Result Not Found";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#02040d]/85 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-modal-title"
            aria-describedby="result-modal-description"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-lg overflow-hidden rounded-3xl border bg-[#050a18]/95 px-6 py-9 text-center shadow-2xl sm:px-10 sm:py-11 ${
              isSelected
                ? "border-blue-300/25 shadow-[0_0_80px_rgba(59,130,246,0.24)]"
                : "border-white/10 shadow-[0_0_70px_rgba(59,130,246,0.1)]"
            }`}
          >
            <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
            {isSelected ? particles.map((particle, index) => (
              <motion.span
                key={index}
                aria-hidden="true"
                className="absolute h-1 w-1 rounded-full bg-blue-200 shadow-[0_0_10px_rgba(147,197,253,0.9)]"
                style={{ left: particle.left, top: particle.top }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.7, 0.5], y: [6, -8, -18] }}
                transition={{ duration: 2.6, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            )) : null}

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-white/35 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              aria-label="Close result dialog"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border ${isSelected ? "border-blue-300/30 bg-blue-400/10 text-blue-200 shadow-[0_0_30px_rgba(96,165,250,0.25)]" : "border-white/10 bg-white/5 text-white/45"}`}>
              {isSelected ? <Trophy aria-hidden="true" className="h-7 w-7" /> : <SearchX aria-hidden="true" className="h-7 w-7" />}
            </div>

            {isSelected ? (
              <div className="mb-3 flex items-center justify-center gap-2 font-cinzel text-[10px] uppercase tracking-[0.25em] text-blue-300/70">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                Selected
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              </div>
            ) : null}
            <h2 id="result-modal-title" className="font-cinzel text-2xl font-bold text-white sm:text-3xl">
              {title}
            </h2>
            <p id="result-modal-description" className="mx-auto mt-4 max-w-md text-sm leading-7 text-blue-100/55">
              {isSelected
                ? `You are selected for the ${categoryName} of Sathsara Dahana 2026.`
                : `We could not find this index number in the selected ${categoryName} list. Please check your index number and try again.`}
            </p>

            {isSelected ? (
              <>
                <div className="my-6 overflow-hidden rounded-2xl border border-white/8 bg-white/8">
                  <div className="bg-[#070c19] px-4 py-4">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-white/35">Index Number</span>
                    <span className="mt-2 block font-cinzel text-sm tracking-[0.1em] text-blue-100">{result?.indexNumber}</span>
                  </div>
                </div>
                <p className="text-xs leading-6 text-blue-100/40">
                  We are excited to have you as part of the Sathsara Dahana 2026 {categoryName}.
                </p>
              </>
            ) : (
              <p className="mt-5 font-cinzel text-xs tracking-[0.16em] text-white/40">{searchedIndex}</p>
            )}

            {downloadError ? <p className="mt-5 text-xs text-rose-200/80" role="alert">{downloadError}</p> : null}

            <div className={`mt-7 grid gap-3 ${isSelected ? "sm:grid-cols-[1fr_auto]" : ""}`}>
              {isSelected ? (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/30 bg-blue-500/20 px-5 font-cinzel text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_24px_rgba(59,130,246,0.12)] transition hover:border-blue-200/55 hover:bg-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-70 sm:text-xs"
                >
                  {isDownloading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Download aria-hidden="true" className="h-4 w-4" />}
                  {isDownloading ? "Creating Image" : "Download Congratulations Card"}
                </button>
              ) : null}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-xl border border-white/10 bg-white/[0.04] px-6 font-cinzel text-[10px] font-bold uppercase tracking-[0.25em] text-white/75 transition hover:border-blue-300/35 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-xs"
              >
                {isSelected ? "Close" : "Try Again"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
