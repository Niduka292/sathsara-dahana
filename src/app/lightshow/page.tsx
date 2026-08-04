export const dynamic = "force-dynamic";

import type { Metadata, Viewport } from "next";
import { Orbitron } from "next/font/google";
import LightshowAudiencePage from "@/components/lightshow/LightshowAudiencePage";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Light Sync | Sathsara Dahana",
  description: "Join the synchronized audience light show.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#040408",
};

export default function LightshowPage() {
  return (
    <div className={`${orbitron.variable} h-[100dvh] overflow-hidden bg-[#040408]`}>
      <LightshowAudiencePage />
    </div>
  );
}
