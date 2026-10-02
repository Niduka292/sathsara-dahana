"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ReactNode, useRef } from "react";

interface TimelineEvent {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: ReactNode;
  blur?: boolean;
}

const events: TimelineEvent[] = [
  {
    id: "act-1",
    label: "ACT I • ANCIENT ECHOES",
    title: "The Dawn Raga",
    description:
      "A haunting journey back to the origins of melody — where the first notes ever hummed still tremble in the air of eternity.",
    icon: (
      <svg
        className="w-5 h-5 text-blue-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
  },
  {
    id: "act-2",
    label: "ACT II • THE GOLDEN ERA",
    title: "Voices of a Forgotten Empire",
    description:
      "Melodies that once drifted through palace corridors, carrying the weight of royalty, love, and loss across gilded halls.",
    icon: <span className="text-xl">⏳</span>,
  },
  {
    id: "act-3",
    label: "ACT III • THE TURNING POINT",
    title: "Revolution in C Minor",
    description:
      "When music became a weapon, a protest, a heartbeat for change — the songs that lit fires in the hearts of generations.",
    icon: <span className="text-xl">🎵</span>,
  },
  {
    id: "act-4",
    label: "ACT IV • THE SYNTHETIC AGE",
    title: "Neon Lullabies",
    description:
      "The fusion of ancient rhythms with synthetic beats, creating a bridge between the analog past and the boundless future.",
    icon: <span className="text-xl">🎹</span>,
  },
  {
    id: "act-5",
    label: "ACT V • THE FINAL CRESCENDO",
    title: "Echoes of Tomorrow",
    description:
      "What lies beyond the known spectrum of sound? A glimpse into the melodies that have yet to be written in the stars.",
    icon: <span className="text-xl">✨</span>,
  },
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 35,
    restDelta: 0.0001
  });

  return (
    <section id="timeline" ref={containerRef} className="relative w-full py-20 md:py-40 bg-transparent overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-blue-300 rounded-full blur-[1px]" />
        <div className="absolute top-[40%] right-[15%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[60%] left-[20%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[80%] right-[25%] w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#a78bfa] text-[11px] font-bold tracking-[0.5em] uppercase mb-4 block font-cinzel text-glow-violet"
          >
            Chronological Odyssey
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-bold font-cinzel text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] transform-gpu"
          >
            The Path of Sound
          </motion.h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Central Line Background */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] bg-blue-500/10 md:-translate-x-1/2" />
          
          {/* Active Scroll Progress Line */}
          <motion.div 
            style={{ scaleY }}
            className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 via-blue-400 to-cyan-300 md:-translate-x-1/2 origin-top z-20 transform-gpu"
          />

          <div className="flex flex-col gap-20 md:gap-40">
            {events.map((event, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex items-center w-full group transform-gpu"
                >
                  {/* Left Content (Desktop only) */}
                  <div className={`hidden md:flex w-1/2 pr-20 flex-col ${isEven ? "items-end text-right" : "opacity-0 pointer-events-none"}`}>
                    <span className={`text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-4 font-cinzel transition-colors duration-700 ease-[0.16,1,0.3,1] ${index % 2 === 1 ? "text-[#a78bfa]/60 group-hover:text-[#a78bfa]" : "text-blue-400/60 group-hover:text-blue-400"}`}>
                      {event.label}
                    </span>
                    <h3 className="text-2xl md:text-4xl font-bold mb-6 font-cinzel text-white group-hover:text-blue-200 transition-colors duration-700 ease-[0.16,1,0.3,1]">
                      {event.title}
                    </h3>
                    <p className="text-blue-100/50 text-sm md:text-base leading-relaxed italic font-serif max-w-sm group-hover:text-blue-100/80 transition-colors duration-700 ease-[0.16,1,0.3,1]">
                      {event.description}
                    </p>
                  </div>

                  {/* Center/Left Icon */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-30 transform-gpu">
                    <motion.div 
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-blue-400/30 bg-transparent flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] relative group-hover:border-blue-400 transition-all duration-700 ease-[0.16,1,0.3,1]"
                    >
                      <div className="relative z-10 scale-125 md:scale-150 transform-gpu">{event.icon}</div>
                      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[0.16,1,0.3,1]" />
                      {/* Decorative outer rings */}
                      <div className="absolute inset-[-8px] md:inset-[-12px] border border-blue-500/10 rounded-full animate-pulse" />
                    </motion.div>
                  </div>

                  {/* Right Content */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-20 flex flex-col ${!isEven ? "md:items-start md:text-left" : "md:items-start md:opacity-0 md:pointer-events-none"}`}>
                    <div className="md:hidden flex flex-col items-start text-left">
                       <span className="text-blue-400/60 text-[10px] font-bold tracking-[0.4em] uppercase mb-3 font-cinzel">
                          {event.label}
                        </span>
                        <h3 className="text-2xl font-bold mb-4 font-cinzel text-white leading-tight">
                          {event.title}
                        </h3>
                        <p className="text-blue-100/50 text-sm leading-relaxed italic font-serif">
                          {event.description}
                        </p>
                    </div>
                    {!isEven && (
                      <div className="hidden md:flex flex-col items-start text-left">
                        <span className={`text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-4 font-cinzel transition-colors duration-700 ease-[0.16,1,0.3,1] ${index % 2 === 1 ? "text-[#a78bfa]/60 group-hover:text-[#a78bfa]" : "text-blue-400/60 group-hover:text-blue-400"}`}>
                          {event.label}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-bold mb-6 font-cinzel text-white group-hover:text-blue-200 transition-colors duration-700 ease-[0.16,1,0.3,1]">
                          {event.title}
                        </h3>
                        <p className="text-blue-100/50 text-sm md:text-base leading-relaxed italic font-serif max-w-sm group-hover:text-blue-100/80 transition-colors duration-700 ease-[0.16,1,0.3,1]">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
