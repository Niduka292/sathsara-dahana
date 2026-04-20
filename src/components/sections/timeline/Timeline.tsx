"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

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
    blur: true,
  },
  {
    id: "act-5",
    label: "ACT V • THE FINAL CRESCENDO",
    title: "Echoes of Tomorrow",
    description:
      "What lies beyond the known spectrum of sound? A glimpse into the melodies that have yet to be written in the stars.",
    icon: <span className="text-xl">✨</span>,
    blur: true,
  },
];

export default function Timeline() {
  return (
    <section className="relative w-full py-32 bg-[#000511] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-blue-300 rounded-full blur-[1px]" />
        <div className="absolute top-[40%] right-[15%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[60%] left-[20%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[80%] right-[25%] w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="relative max-w-4xl mx-auto">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-blue-500/20 -translate-x-1/2" />
          
          {/* Subtle line glow */}
          <div className="absolute left-1/2 top-[20%] bottom-[20%] w-[1px] bg-blue-400/30 -translate-x-1/2 blur-[2px]" />

          <div className="flex flex-col gap-24">
            {events.map((event, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`relative flex items-center w-full ${
                    event.blur ? "opacity-30 blur-[4px] select-none" : ""
                  }`}
                >
                  {/* Left Content */}
                  <div className={`w-1/2 pr-12 md:pr-16 flex flex-col ${isEven ? "items-end text-right" : "items-end opacity-0 pointer-events-none"}`}>
                    {isEven && (
                      <>
                        <span className="text-blue-300/80 text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase mb-4 font-cinzel">
                          {event.label}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-bold mb-4 font-cinzel text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          {event.title}
                        </h3>
                        <p className="text-blue-200/60 text-sm md:text-base leading-relaxed italic font-serif max-w-sm">
                          {event.description}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Center Icon */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-blue-500/30 bg-[#000511] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] z-10 relative">
                      {event.icon}
                      {/* Decorative outer rings */}
                      <div className="absolute inset-[-8px] border border-blue-500/10 rounded-full" />
                      {/* Very faint empty circle decoration randomly placed near line (from design) */}
                      {index === 0 && (
                        <div className="absolute -bottom-24 right-8 w-6 h-6 rounded-full border border-blue-500/20" />
                      )}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className={`w-1/2 pl-12 md:pl-16 flex flex-col ${!isEven ? "items-start text-left" : "items-start opacity-0 pointer-events-none"}`}>
                    {!isEven && (
                      <>
                        <span className="text-blue-300/80 text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase mb-4 font-cinzel">
                          {event.label}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-bold mb-4 font-cinzel text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          {event.title}
                        </h3>
                        <p className="text-blue-200/60 text-sm md:text-base leading-relaxed italic font-serif max-w-sm">
                          {event.description}
                        </p>
                      </>
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
