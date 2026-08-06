export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import LightshowJoinPage from "@/components/lightshow/LightshowJoinPage";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Join Light Show | Sathsara Dahana",
  description: "Scan to join the synchronized audience light show.",
};

export default function LightshowJoinRoute() {
  return (
    <div className={`${orbitron.variable} min-h-screen bg-[#040408]`}>
      <LightshowJoinPage />
    </div>
  );
}
