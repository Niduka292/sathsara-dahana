"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import { Sparkles, ChevronLeft, ChevronRight, Clock, Music, Star, Zap, ArrowDownUp } from "lucide-react";
import { artistsData } from "@/src/data/artists";

export default function Artists() {
  const [activeArtistIndex, setActiveArtistIndex] = useState(0);
  const [pendingArtistIndex, setPendingArtistIndex] = useState<number | null>(null);

  // Cycle State Machine:
  // "CONCEALED": Portal at top (y=0%), artist 100% sucked in / hidden
  // "REVEALING": Portal moving down (y=0% -> y=100%), revealing artist
  // "REVEALED": Portal at bottom (y=100%), artist 100% revealed
  // "CONCEALING": Portal moving up (y=100% -> y=0%), sucking artist back into portal
  const [cycleState, setCycleState] = useState<"CONCEALED" | "REVEALING" | "REVEALED" | "CONCEALING">("CONCEALED");

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.25, once: false });

  const activeArtist = artistsData[activeArtistIndex];
  const isTransitioning = cycleState === "REVEALING" || cycleState === "CONCEALING";

  // Request switching to artist at targetIdx (with cycle queueing)
  const requestArtistIndex = (targetIdx: number) => {
    if (targetIdx === activeArtistIndex && pendingArtistIndex === null) return;
    setPendingArtistIndex(targetIdx);

    // If currently fully revealed, start concealing immediately (portal moves UP to suck artist in)
    if (cycleState === "REVEALED") {
      setCycleState("CONCEALING");
    }
  };

  const handleNext = () => {
    const target = (activeArtistIndex + 1) % artistsData.length;
    requestArtistIndex(target);
  };

  const handlePrev = () => {
    const target = (activeArtistIndex - 1 + artistsData.length) % artistsData.length;
    requestArtistIndex(target);
  };

  // Start initial reveal when section scrolls into view
  useEffect(() => {
    if (isInView && cycleState === "CONCEALED" && pendingArtistIndex === null) {
      setCycleState("REVEALING");
    }
  }, [isInView, cycleState, pendingArtistIndex]);

  // Handle phase completion & queue processing
  const handlePhaseComplete = () => {
    if (cycleState === "REVEALING") {
      setCycleState("REVEALED");
      // If a user queued a click during reveal, start concealing to switch
      if (pendingArtistIndex !== null) {
        setCycleState("CONCEALING");
      }
    } else if (cycleState === "CONCEALING") {
      setCycleState("CONCEALED");
      // Swap artist data when completely sucked into portal at top
      if (pendingArtistIndex !== null) {
        setActiveArtistIndex(pendingArtistIndex);
        setPendingArtistIndex(null);
      }
      // Re-trigger reveal animation for newly selected artist
      setTimeout(() => {
        setCycleState("REVEALING");
      }, 60);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="artists"
      className="relative w-full py-24 md:py-36 bg-transparent overflow-hidden z-20"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 text-sky-300/90 mb-4"
          >
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-sky-400" />
            <Sparkles className="h-4 w-4 text-sky-300 animate-pulse" />
            <span className="font-cinzel text-xs uppercase tracking-[0.4em] text-sky-300 font-bold">
              Light Blue Portal Stage
            </span>
            <Sparkles className="h-4 w-4 text-sky-300 animate-pulse" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-400" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-100 to-sky-300"
          >
            The Performing Artists
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 font-cinzel text-xs sm:text-sm tracking-[0.2em] text-sky-100/70 max-w-xl italic"
          >
            Watch the light blue celestial portal move vertically to reveal and usher in each performing artist.
          </motion.p>
        </div>

        {/* Main Stage Grid: Portal Motion Display + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-6xl mx-auto">
          
          {/* VERTICAL PORTAL LOOP STAGE (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[480px] sm:min-h-[580px]">
            
            {/* Main Stage Container */}
            <div className="relative w-72 sm:w-[380px] h-[420px] sm:h-[500px] flex items-center justify-center z-10 overflow-visible">
              
              {/* ANIMATED PORTAL Y POSITION CONTROLLER */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ y: "0%" }}
                animate={
                  cycleState === "REVEALING" || cycleState === "REVEALED"
                    ? { y: "100%" }
                    : { y: "0%" }
                }
                transition={{
                  duration: cycleState === "REVEALING" ? 2.1 : cycleState === "CONCEALING" ? 1.8 : 0.1,
                  ease: cycleState === "REVEALING" ? [0.25, 1, 0.5, 1] : [0.5, 0, 0.75, 1],
                }}
                onAnimationComplete={handlePhaseComplete}
              >
                {/* LAYER 1: BACK HALF / TOP PORTAL DISK (z-0, BEHIND ARTIST) */}
                {/* Flatter 3D perspective ellipse with solid light blue color */}
                <div
                  style={{ clipPath: "inset(0% 0% 50% 0%)" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[38px] sm:h-[54px] rounded-[100%] border-[3px] border-sky-300 bg-[radial-gradient(ellipse_at_center,#e0f2fe_0%,#38bdf8_35%,#0284c7_75%,#0369a1_100%)] z-0"
                />

                {/* LAYER 3: FRONT HALF / BOTTOM PORTAL NEON RIM (z-20, IN FRONT OF ARTIST) */}
                {/* Flatter 3D perspective ellipse with solid light blue color */}
                <div
                  style={{ clipPath: "inset(49% 0% 0% 0%)" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[38px] sm:h-[54px] rounded-[100%] border-[3px] border-sky-300 bg-[radial-gradient(ellipse_at_center,#e0f2fe_0%,#38bdf8_35%,#0284c7_75%,#0369a1_100%)] z-20"
                />
              </motion.div>

              {/* LAYER 2: CLEAN ARTIST PHOTO (z-10, BETWEEN BACK HALF & FRONT HALF OF PORTAL) */}
              {/* Emerging from central horizontal axis: covers the top half (z-0) of portal when rising up */}
              <motion.div
                className="relative w-[82%] h-full flex items-center justify-center overflow-hidden z-10"
                animate={
                  cycleState === "REVEALING" || cycleState === "REVEALED"
                    ? {
                        clipPath: "inset(0% 0% 0% 0%)",
                        opacity: 1,
                      }
                    : {
                        clipPath: "inset(0% 0% 100% 0%)",
                        opacity: 0,
                      }
                }
                transition={{
                  duration: cycleState === "REVEALING" ? 2.1 : cycleState === "CONCEALING" ? 1.8 : 0.1,
                  ease: cycleState === "REVEALING" ? [0.25, 1, 0.5, 1] : [0.5, 0, 0.75, 1],
                }}
              >
                {/* Clean Pristine Artist Photo */}
                <div className="relative w-full h-full">
                  <Image
                    src={activeArtist.image}
                    alt={activeArtist.name}
                    fill
                    priority
                    className="object-cover object-top"
                  />
                </div>
              </motion.div>

            </div>

            {/* Controls & Nav Arrows with Queue Indicator */}
            <div className="flex items-center gap-6 mt-6 z-30">
              <button
                onClick={handlePrev}
                aria-label="Previous artist"
                className="w-10 h-10 rounded-full border border-sky-400/40 bg-[#060e24]/90 text-sky-300 flex items-center justify-center hover:bg-sky-500/25 hover:border-sky-400 hover:scale-110 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                {artistsData.map((_, idx) => {
                  const isCurrent = idx === activeArtistIndex;
                  const isPending = idx === pendingArtistIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => requestArtistIndex(idx)}
                      aria-label={`Go to artist ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "w-8 bg-sky-400"
                          : isPending
                          ? "w-5 bg-amber-400 animate-pulse"
                          : "w-2 bg-sky-400/30 hover:bg-sky-400/60"
                      }`}
                    />
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                aria-label="Next artist"
                className="w-10 h-10 rounded-full border border-sky-400/40 bg-[#060e24]/90 text-sky-300 flex items-center justify-center hover:bg-sky-500/25 hover:border-sky-400 hover:scale-110 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Cycle Status Indicator */}
            <div className="mt-3 flex items-center gap-2 text-[10px] font-cinzel uppercase tracking-[0.2em] text-sky-300/60">
              <ArrowDownUp size={12} className={isTransitioning ? "animate-spin text-sky-400" : ""} />
              <span>
                {cycleState === "REVEALING"
                  ? "Portal Revealing Artist..."
                  : cycleState === "CONCEALING"
                  ? "Sucking Artist into Portal..."
                  : pendingArtistIndex !== null
                  ? "Queued Next Transition..."
                  : "Portal Phase Locked"}
              </span>
            </div>

          </div>

          {/* ARTIST DETAILS PANEL (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <AnimatePresence mode="wait">
              {cycleState === "REVEALED" || cycleState === "REVEALING" ? (
                <motion.div
                  key={activeArtist.id}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full flex flex-col items-center lg:items-start"
                >
                  {/* Category & Badge Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-300 text-[11px] font-cinzel font-bold uppercase tracking-[0.2em]">
                      <Music size={13} className="text-sky-400" />
                      <span>{activeArtist.role}</span>
                    </div>

                    {activeArtist.badge && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-300 text-[10px] font-cinzel font-bold uppercase tracking-[0.2em]">
                        <Zap size={12} className="text-amber-300" />
                        <span>{activeArtist.badge}</span>
                      </div>
                    )}
                  </div>

                  {/* Artist Name */}
                  <h3 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white leading-tight mb-4">
                    {activeArtist.name}
                  </h3>

                  {/* Performance Time */}
                  {activeArtist.performanceTime && (
                    <div className="flex items-center gap-2.5 text-xs font-cinzel tracking-[0.15em] text-[#fcd88b] mb-6 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-400/30">
                      <Clock size={14} className="text-[#fcd88b]" />
                      <span>{activeArtist.performanceTime}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sky-100/75 text-sm sm:text-base leading-relaxed mb-8 font-cinzel italic max-w-md">
                    {activeArtist.description}
                  </p>

                  {/* Action CTA Button */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <a
                      href="#timeline"
                      className="relative px-6 py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 border border-sky-300/50 text-white font-cinzel text-xs font-bold uppercase tracking-[0.25em] rounded-xl hover:scale-[1.03] transition-all duration-300 flex items-center gap-2"
                    >
                      <Star size={14} />
                      <span>Full Program Schedule</span>
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

        </div>

        {/* THUMBNAIL SELECTOR BAR WITH QUEUED STATE HIGHLIGHT */}
        <div className="mt-16 sm:mt-24 max-w-4xl mx-auto">
          <p className="text-center font-cinzel text-[11px] uppercase tracking-[0.3em] text-sky-200/60 mb-6">
            Select Artist to Trigger Portal Transition
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {artistsData.map((artist, idx) => {
              const isActive = idx === activeArtistIndex;
              const isPending = idx === pendingArtistIndex;
              return (
                <button
                  key={artist.id}
                  onClick={() => requestArtistIndex(idx)}
                  className={`group relative flex flex-col items-center p-3.5 rounded-2xl border text-left transition-all duration-300 ${
                    isActive
                      ? "border-sky-400 bg-sky-500/15 scale-[1.04]"
                      : isPending
                      ? "border-amber-400/70 bg-amber-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-sky-400/40 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-xl overflow-hidden mb-3 border border-white/20">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className={`object-cover object-top transition-transform duration-500 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02040d] via-transparent to-transparent opacity-60" />

                    {isPending && (
                      <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="font-cinzel text-[9px] uppercase tracking-widest text-amber-200 bg-black/80 px-2 py-0.5 rounded-md font-bold">
                          Queued
                        </span>
                      </div>
                    )}
                  </div>

                  <span
                    className={`font-cinzel text-xs font-bold text-center uppercase tracking-wider line-clamp-1 ${
                      isActive ? "text-sky-300" : isPending ? "text-amber-300" : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {artist.name}
                  </span>
                  <span className="font-cinzel text-[9px] uppercase tracking-widest text-sky-200/40 mt-1 line-clamp-1">
                    {artist.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
