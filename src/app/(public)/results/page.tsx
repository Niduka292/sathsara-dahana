import type { Metadata } from "next";
import ResultsExperience from "@/src/components/results/ResultsExperience";
import ResultsHero from "@/src/components/results/ResultsHero";
import VortexBackground from "@/src/components/ui/VortexBackground";

export const metadata: Metadata = {
  title: "Selection Results | Sathsara Dahana 2026",
  description: "Check the Sathsara Dahana 2026 Dancing, Singing, and Instrumental selection results.",
};

export default function ResultsPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#02040d] px-5 pb-24 pt-36 sm:px-6 sm:pb-32 sm:pt-44">
      <VortexBackground />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-28 h-[32rem] w-[42rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <ResultsHero />
        <ResultsExperience />
      </div>
    </section>
  );
}
