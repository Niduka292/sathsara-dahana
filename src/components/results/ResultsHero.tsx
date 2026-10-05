import { Sparkles } from "lucide-react";

export default function ResultsHero({ released }: { released: boolean }) {
  return (
    <header className="mx-auto flex max-w-4xl flex-col items-center text-center">
      <div className="mb-6 flex items-center gap-4 text-blue-300/70">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-400/60" />
        <Sparkles aria-hidden="true" className="h-4 w-4" />
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-400/60" />
      </div>

      <p className="mb-5 font-cinzel text-[10px] uppercase tracking-[0.38em] text-blue-200/55 sm:text-xs">
        Selection Portal
      </p>
      <h1 className="font-cinzel text-4xl font-bold uppercase leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-50 to-blue-300/60 drop-shadow-[0_0_28px_rgba(59,130,246,0.35)] sm:text-6xl lg:text-7xl">
        Sathsara Dahana 2026
      </h1>
      <h2 className="mt-5 font-cinzel text-sm uppercase tracking-[0.2em] text-white/70 sm:text-lg sm:tracking-[0.3em]">
        Selection Results
      </h2>
      {released && (
        <p className="mt-6 max-w-xl text-sm leading-7 text-blue-100/45 sm:text-base">
          Choose your category, then enter your index number to check your selection status.
        </p>
      )}
    </header>
  );
}
