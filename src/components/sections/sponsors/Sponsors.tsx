"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo from "../../../../assets/sisi-logo-no-bg.png";

interface Sponsor {
  id: string;
  name: string;
  tier: string;
  color: string;
}

const sponsors: Sponsor[] = [
  { id: "1", name: "Astra Tech", tier: "Platinum", color: "#60a5fa" },
  { id: "2", name: "Nebula Systems", tier: "Gold", color: "#c084fc" },
  { id: "3", name: "Zenith Labs", tier: "Gold", color: "#2dd4bf" },
  { id: "4", name: "Stellar Ventures", tier: "Silver", color: "#f472b6" },
  { id: "5", name: "Orion Dynamics", tier: "Silver", color: "#fbbf24" },
  { id: "6", name: "Cosmic Creative", tier: "Silver", color: "#34d399" },
  { id: "7", name: "Nova Solutions", tier: "Bronze", color: "#94a3b8" },
  { id: "8", name: "Galactic Media", tier: "Bronze", color: "#f87171" },
];

export default function Sponsors() {
  // Double the sponsors array to create a seamless loop
  const doubledSponsors = [...sponsors, ...sponsors];

  return (
    <section id="sponsors" className="relative w-full py-24 bg-[#000511] overflow-hidden border-t border-white/5">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold font-cinzel text-white/80 tracking-widest mb-2">
          Our Partners
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto" />
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Infinite Scroll Container */}
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {doubledSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.id}-${index}`}
              className="inline-flex flex-col items-center justify-center mx-6 px-12 py-10 min-w-[280px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-cyan-500/40 hover:bg-white/[0.05] transition-all duration-500 group cursor-pointer"
            >
              {/* Logo/Image Container */}
              <div className="relative w-20 h-20 mb-6 group-hover:scale-110 transition-transform duration-500">
                {/* Glow Effect behind logo */}
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: sponsor.color }}
                />
                <div className="relative w-full h-full bg-[#000a1f] rounded-full border border-white/10 flex items-center justify-center overflow-hidden p-3">
                  <img
                    src={logo.src}
                    alt={sponsor.name}
                    className="w-full h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ 
                      filter: `grayscale(1) brightness(1.5) drop-shadow(0 0 5px ${sponsor.color}44)`,
                      // We use hue-rotate to make the same logo look like different brandings
                      rotate: `${index * 45}deg` 
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xl font-cinzel font-bold text-white/70 group-hover:text-white transition-colors">
                  {sponsor.name}
                </span>
                <span 
                  className="text-[10px] uppercase tracking-[0.3em] font-medium mt-2"
                  style={{ color: sponsor.color }}
                >
                  {sponsor.tier} Partner
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Overlays for smooth fading at edges */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#000511] via-[#000511]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#000511] via-[#000511]/80 to-transparent z-10 pointer-events-none" />
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
