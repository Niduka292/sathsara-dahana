"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Guitar, Mic2, PersonStanding, Users } from "lucide-react";
import type { ResultCategory, SelectionResult } from "@/src/data/dancingCrewResults";
import { loadCategoryResults, lookupSelectionResult } from "@/src/services/results.client";
import ResultModal from "./ResultModal";
import ResultSearch from "./ResultSearch";
import ResultsTable from "./ResultsTable";

const categories = [
  { id: "dancing" as const, label: "Dancing", Icon: PersonStanding },
  { id: "singing" as const, label: "Singing", Icon: Mic2 },
  { id: "instrumental" as const, label: "Instrumental", Icon: Guitar },
];

export default function ResultsExperience() {
  const [selectedCategory, setSelectedCategory] = useState<ResultCategory | null>(null);
  const [indexNumber, setIndexNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchedResult, setMatchedResult] = useState<SelectionResult | null>(null);
  const [searchedIndex, setSearchedIndex] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [fullResults, setFullResults] = useState<SelectionResult[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const listControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    requestControllerRef.current?.abort();
    listControllerRef.current?.abort();
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const selectCategory = (category: ResultCategory) => {
    requestControllerRef.current?.abort();
    listControllerRef.current?.abort();
    setSelectedCategory(category);
    setIndexNumber("");
    setError("");
    setMatchedResult(null);
    setSearchedIndex("");
    setIsModalOpen(false);
    setShowTable(false);
    setFullResults([]);
    setIsTableLoading(false);
    setTableError("");
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleFullResults = async () => {
    if (!selectedCategory || isTableLoading) return;
    if (showTable) {
      setShowTable(false);
      return;
    }
    if (fullResults.length) {
      setShowTable(true);
      return;
    }

    setIsTableLoading(true);
    setTableError("");
    listControllerRef.current?.abort();
    const controller = new AbortController();
    listControllerRef.current = controller;
    try {
      const results = await loadCategoryResults(selectedCategory, controller.signal);
      if (listControllerRef.current !== controller) return;
      setFullResults(results);
      setShowTable(true);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setTableError("We could not load the full results right now. Please try again.");
    } finally {
      if (listControllerRef.current === controller) setIsTableLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCategory || isLoading) return;
    const normalizedIndex = indexNumber.trim();

    if (!normalizedIndex) {
      setError("Please enter your index number.");
      inputRef.current?.focus();
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setError("");
    setMatchedResult(null);
    setIsModalOpen(false);
    setIsLoading(true);

    try {
      const result = await lookupSelectionResult(selectedCategory, normalizedIndex, controller.signal);
      setMatchedResult(result);
      setSearchedIndex(normalizedIndex);
      setIsModalOpen(true);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("We could not check your result right now. Please try again.");
    } finally {
      if (requestControllerRef.current === controller) setIsLoading(false);
    }
  };

  return (
    <>
      <fieldset className="mx-auto mt-12 max-w-3xl">
        <legend className="mb-5 w-full text-center font-cinzel text-[10px] uppercase tracking-[0.3em] text-blue-100/50 sm:text-xs">
          Select a result category
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {categories.map(({ id, label, Icon }) => {
            const isSelected = selectedCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectCategory(id)}
                aria-pressed={isSelected}
                className={`group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-5 font-cinzel text-xs uppercase tracking-[0.2em] backdrop-blur-xl transition duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                  isSelected
                    ? "border-blue-300/50 bg-blue-500/20 text-white shadow-[0_0_35px_rgba(59,130,246,0.18)]"
                    : "border-white/10 bg-white/[0.035] text-white/50 hover:border-blue-300/30 hover:bg-blue-500/10 hover:text-white"
                }`}
              >
                <Icon aria-hidden="true" className={`h-6 w-6 transition ${isSelected ? "text-blue-200" : "text-blue-300/45 group-hover:text-blue-200"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <AnimatePresence mode="wait">
        {selectedCategory ? (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ResultSearch
              indexNumber={indexNumber}
              error={error}
              isLoading={isLoading}
              inputRef={inputRef}
              onIndexNumberChange={(value) => {
                setIndexNumber(value);
                if (error) setError("");
              }}
              onSubmit={handleSubmit}
            />

            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={toggleFullResults}
                disabled={isTableLoading}
                aria-expanded={showTable}
                aria-controls="full-results"
                className="flex min-h-12 items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-6 font-cinzel text-[10px] uppercase tracking-[0.22em] text-white/60 backdrop-blur-xl transition hover:border-blue-300/30 hover:bg-blue-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-xs"
              >
                <Users aria-hidden="true" className="h-4 w-4 text-blue-300/65" />
                {isTableLoading ? "Loading Results" : showTable ? "Hide Full Results" : "View Full Results"}
                <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-500 ${showTable ? "rotate-180" : ""}`} />
              </button>
              {tableError ? <p className="text-xs text-rose-200/80" role="alert">{tableError}</p> : null}
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="category-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-7 text-center text-sm text-blue-100/35"
          >
            Select Dancing, Singing, or Instrumental to continue.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showTable ? (
          <motion.section
            id="full-results"
            initial={{ opacity: 0, height: 0, y: 18 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-20">
              <ResultsTable
                results={fullResults}
                categoryName={categories.find((item) => item.id === selectedCategory)?.label ?? "Selection"}
              />
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <ResultModal
        isOpen={isModalOpen}
        result={matchedResult}
        searchedIndex={searchedIndex}
        category={selectedCategory}
        onClose={closeModal}
      />
    </>
  );
}
