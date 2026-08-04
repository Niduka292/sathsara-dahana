export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import LightshowOperatorPage from "@/components/lightshow/LightshowOperatorPage";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Light Show Control | Sathsara Dahana",
  description: "Operator panel for the synchronized audience light show.",
};

export default function LightshowAdminPage() {
  return (
    <div className={`${orbitron.variable} min-h-screen bg-[#040408]`}>
      <LightshowOperatorPage />
    </div>
  );
}
