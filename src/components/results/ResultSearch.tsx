"use client";

import { FormEvent, RefObject } from "react";
import { LoaderCircle, Search } from "lucide-react";

type ResultSearchProps = {
  indexNumber: string;
  error: string;
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onIndexNumberChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ResultSearch({
  indexNumber,
  error,
  isLoading,
  inputRef,
  onIndexNumberChange,
  onSubmit,
}: ResultSearchProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="relative mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_60px_rgba(37,99,235,0.12)] backdrop-blur-2xl sm:p-8"
      noValidate
    >
      <div aria-hidden="true" className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

      <label htmlFor="index-number" className="mb-3 block font-cinzel text-[10px] uppercase tracking-[0.28em] text-blue-100/55 sm:text-xs">
        Index or Registration Number
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/45" />
          <input
            ref={inputRef}
            id="index-number"
            name="indexNumber"
            type="text"
            value={indexNumber}
            onChange={(event) => onIndexNumberChange(event.target.value)}
            placeholder="Enter your Index Number"
            autoComplete="off"
            aria-describedby={error ? "index-number-error" : undefined}
            aria-invalid={Boolean(error)}
            className="h-14 w-full rounded-xl border border-white/10 bg-black/25 pl-11 pr-4 text-sm uppercase tracking-[0.08em] text-white outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-white/25 focus:border-blue-400/55 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative h-14 overflow-hidden rounded-xl border border-blue-300/25 bg-blue-500/15 px-7 font-cinzel text-[10px] font-bold uppercase tracking-[0.24em] text-blue-50 shadow-[0_0_24px_rgba(59,130,246,0.12)] transition hover:border-blue-300/50 hover:bg-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-70 sm:text-xs"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Checking" : "Check Result"}
          </span>
          <span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </div>

      <div className="mt-3 min-h-5" aria-live="polite">
        {error
          ? <p id="index-number-error" className="text-xs text-rose-200/80">{error}</p>
          : <p className="text-xs text-blue-100/30">You can also use your registration number.</p>}
      </div>
    </form>
  );
}
