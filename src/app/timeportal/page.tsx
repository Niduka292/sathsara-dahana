import type { Metadata } from "next";
import TimePortalExperience from "@/src/components/timeportal/TimePortalExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Time Portal | Sathsara Dahana 2026",
  description:
    "Calibrate the temporal gateway and travel across five distinct eras of time and web design at Sathsara Dahana 2026.",
};

export default function TimePortalPage() {
  // Direct URL access enabled for testing without requiring puzzle completion first.
  return <TimePortalExperience />;
}
