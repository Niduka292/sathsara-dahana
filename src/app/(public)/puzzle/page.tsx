import type { Metadata } from "next";
import PuzzleExperience from "@/src/components/puzzle/PuzzleExperience";

export const metadata: Metadata = {
  title: "The Chrono Cipher | Sathsara Dahana 2026",
  description: "Unlock the secrets of time at Sathsara Dahana 2026.",
};

export default function PuzzlePage() {
  return <PuzzleExperience />;
}
