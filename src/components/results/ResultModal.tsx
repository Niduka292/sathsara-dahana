"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX, X } from "lucide-react";
import type { ResultCategory, SelectionResult } from "@/src/data/dancingCrewResults";
import CongratulationsCard from "./CongratulationsCard";
import DownloadCardButton from "./DownloadCardButton";

type ResultModalProps = {
  isOpen: boolean;
  result: SelectionResult | null;
  searchedIndex: string;
  category: ResultCategory | null;
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

const categoryLabels: Record<ResultCategory, string> = {
  dancing: "Dancing",
  singing: "Singing",
  instrumental: "Instrumental",
};

export default function ResultModal({ isOpen, result, searchedIndex, category, onClose }: ResultModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

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
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isReserve = result?.status === "reserve";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#02040d]/85 p-3 backdrop-blur-xl sm:p-5"
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
            className={`relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-3xl border bg-[#050a18]/95 px-4 py-7 text-center shadow-2xl min-[375px]:px-5 sm:max-h-[calc(100dvh-2.5rem)] sm:px-10 sm:py-10 ${
              isReserve
                ? "border-violet-300/20 shadow-[0_0_80px_rgba(124,58,237,0.18)]"
                : result
                  ? "border-blue-300/25 shadow-[0_0_80px_rgba(59,130,246,0.24)]"
                  : "border-white/10 shadow-[0_0_70px_rgba(59,130,246,0.1)]"
            }`}
          >
            <div aria-hidden="true" className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent ${isReserve ? "via-violet-300/70" : "via-blue-300/70"} to-transparent`} />
            {result ? particles.map((particle, index) => (
              <motion.span
                key={index}
                aria-hidden="true"
                className={`absolute h-1 w-1 rounded-full ${isReserve ? "bg-violet-200 shadow-[0_0_10px_rgba(196,181,253,0.9)]" : "bg-blue-200 shadow-[0_0_10px_rgba(147,197,253,0.9)]"}`}
                style={{ left: particle.left, top: particle.top }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.7, 0.5], y: [6, -8, -18] }}
                transition={{ duration: 2.6, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            )) : null}

            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-white/35 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:right-4 sm:top-4"
              aria-label="Close result dialog"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            {result ? (
              <CongratulationsCard result={result} />
            ) : (
              <div className="py-4">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45">
                  <SearchX aria-hidden="true" className="h-7 w-7" />
                </div>
                <h2 id="result-modal-title" className="font-cinzel text-2xl font-bold text-white sm:text-3xl">Result Not Found</h2>
                <p id="result-modal-description" className="mx-auto mt-4 max-w-md text-sm leading-7 text-blue-100/55">
                  We couldn&apos;t find a result for this Index Number. Please check the number and try again.
                </p>
                {category ? <p className="mt-4 font-cinzel text-[10px] uppercase tracking-[0.22em] text-blue-200/35">{categoryLabels[category]}</p> : null}
                <p className="mt-3 break-all font-cinzel text-xs tracking-[0.12em] text-white/40">{searchedIndex}</p>
              </div>
            )}

            <div className={`mt-7 grid gap-3 ${result && !isReserve ? "sm:grid-cols-[1fr_auto]" : ""}`}>
              {result && !isReserve ? <DownloadCardButton result={result} /> : null}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-xl border border-white/10 bg-white/[0.04] px-6 font-cinzel text-[10px] font-bold uppercase tracking-[0.22em] text-white/75 transition hover:border-blue-300/35 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-xs"
              >
                {result ? "Close" : "Try Again"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
