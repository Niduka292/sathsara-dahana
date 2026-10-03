"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { SelectionResult } from "@/src/data/dancingCrewResults";

type ResultsTableProps = {
  results: SelectionResult[];
  categoryName: string;
};

type SortKey = "indexNumber" | "name" | "registrationNumber";

export default function ResultsTable({ results, categoryName }: ResultsTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("indexNumber");
  const [ascending, setAscending] = useState(true);
  const hasInstruments = results.some((result) => Boolean(result.instrument));
  const hasReserveResults = results.some((result) => result.status === "reserve");

  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return results
      .filter((result) => !normalizedQuery
        || result.indexNumber.toLocaleLowerCase().includes(normalizedQuery)
        || result.name.toLocaleLowerCase().includes(normalizedQuery)
        || result.registrationNumber.toLocaleLowerCase().includes(normalizedQuery)
        || result.instrument?.toLocaleLowerCase().includes(normalizedQuery))
      .sort((first, second) => {
        const comparison = first[sortKey].localeCompare(second[sortKey], undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return ascending ? comparison : -comparison;
      });
  }, [ascending, query, results, sortKey]);

  const changeSort = (key: SortKey) => {
    if (key === sortKey) setAscending((current) => !current);
    else {
      setSortKey(key);
      setAscending(true);
    }
  };

  const selectedResults = filteredResults.filter((result) => result.status === "selected");
  const reserveResults = filteredResults.filter((result) => result.status === "reserve");

  const renderTable = (
    sectionResults: SelectionResult[],
    sectionLabel: string,
    reserve = false,
  ) => (
    <section aria-labelledby={`${reserve ? "reserve" : "selected"}-results-heading`}>
      {hasReserveResults ? (
        <div className={`mb-4 flex items-center gap-3 ${reserve ? "mt-12" : ""}`}>
          <span aria-hidden="true" className={`h-px flex-1 bg-gradient-to-r from-transparent ${reserve ? "via-violet-300/25" : "via-blue-300/25"}`} />
          <h4
            id={`${reserve ? "reserve" : "selected"}-results-heading`}
            className={`font-cinzel text-xs uppercase tracking-[0.24em] ${reserve ? "text-violet-200/75" : "text-blue-200/75"}`}
          >
            {sectionLabel}
          </h4>
          <span aria-hidden="true" className={`h-px flex-1 bg-gradient-to-l from-transparent ${reserve ? "via-violet-300/25" : "via-blue-300/25"}`} />
        </div>
      ) : null}

      <div className={`overflow-hidden rounded-2xl border bg-white/[0.035] backdrop-blur-xl ${reserve ? "border-violet-300/15 shadow-[0_0_45px_rgba(124,58,237,0.08)]" : "border-white/10 shadow-[0_0_45px_rgba(37,99,235,0.08)]"}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[43rem] border-collapse text-left text-sm">
            <caption className="sr-only">{sectionLabel} — {categoryName}</caption>
            <thead className={`border-b font-cinzel text-[10px] uppercase tracking-[0.2em] ${reserve ? "border-violet-300/10 bg-violet-500/[0.06] text-violet-100/60" : "border-white/10 bg-blue-500/[0.06] text-blue-100/55"}`}>
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">No.</th>
                <th scope="col" className="px-5 py-4 font-medium">
                  <button type="button" onClick={() => changeSort("indexNumber")} className="flex items-center gap-2 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                    Index Number <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  <button type="button" onClick={() => changeSort("name")} className="flex items-center gap-2 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                    Name <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  <button type="button" onClick={() => changeSort("registrationNumber")} className="flex items-center gap-2 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                    Registration Number <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </th>
                {hasInstruments ? <th scope="col" className="px-5 py-4 font-medium">Instrument / Role</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-blue-50/65">
              {sectionResults.map((result, index) => (
                <tr key={result.indexNumber} className="transition hover:bg-white/[0.035]">
                  <td className="px-5 py-4 text-white/30">{index + 1}</td>
                  <td className="px-5 py-4 font-cinzel text-xs tracking-[0.1em] text-blue-100/80">{result.indexNumber}</td>
                  <td className="px-5 py-4">{result.name}</td>
                  <td className="px-5 py-4 font-cinzel text-xs tracking-[0.1em] text-blue-100/70">{result.registrationNumber}</td>
                  {hasInstruments ? <td className="px-5 py-4 text-white/55">{result.instrument || "—"}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sectionResults.length === 0 ? (
          <div className="border-t border-white/[0.06] px-6 py-10 text-center text-sm text-blue-100/40">
            No {sectionLabel.toLocaleLowerCase()} match your search.
          </div>
        ) : null}
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-blue-300/60">{categoryName}</p>
          <h3 className="mt-2 font-cinzel text-2xl text-white sm:text-3xl">Full Results</h3>
        </div>
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search participants</span>
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search participants…"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/25 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      {renderTable(selectedResults, hasReserveResults ? "Selected Performers" : "Selected Participants")}
      {hasReserveResults ? renderTable(reserveResults, "Reserve Performers", true) : null}
      <p className="mt-4 text-right text-xs text-white/25" aria-live="polite">
        {selectedResults.length} selected{hasReserveResults ? ` · ${reserveResults.length} reserve` : ""}
      </p>
    </div>
  );
}
