"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Sparkles, Music, Award, Volume2 } from "lucide-react";
import {
  orchestraMembers,
  ORCHESTRA_CATEGORIES,
  OrchestraCategory,
  OrchestraMember,
} from "@/src/data/orchestra";

export default function Orchestra() {
  const [activeCategory, setActiveCategory] = useState<OrchestraCategory>("All");
  const [selectedMember, setSelectedMember] = useState<OrchestraMember | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  const filteredMembers =
    activeCategory === "All"
      ? orchestraMembers
      : orchestraMembers.filter((m) => m.category === activeCategory);

  return (
    <section
      id="orchestra"
      className="relative min-h-screen py-24 sm:py-32 bg-[#02040d] overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      {/* STAGE LIGHTING & BACKDROP GLOWS */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-[30rem] w-[55rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/3 h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/3 h-[25rem] w-[25rem] rounded-full bg-indigo-500/10 blur-[120px]"
      />

      {/* Grid Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="mb-4 flex items-center gap-3 text-blue-400/80">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-400/60" />
            <Music className="h-4 w-4 animate-pulse text-blue-400" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-blue-300/80">
              Live Band Ensemble
            </span>
            <Music className="h-4 w-4 animate-pulse text-blue-400" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-400/60" />
          </div>

          <h2 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-50 to-blue-300/70 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Sathsara Orchestra
          </h2>

          <p className="mt-4 max-w-2xl font-sans text-sm sm:text-base text-blue-100/60 leading-relaxed">
            Experience the live band in motion.
            <span className="hidden md:inline"> Hover over any musician to bring them to life with full color and reveal their story.</span>
            <span className="inline md:hidden"> Tap on any musician to light them up in full color.</span>
          </p>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {ORCHESTRA_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`relative px-4 py-2 sm:px-6 sm:py-2 rounded-full font-cinzel text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-md ${
                activeCategory === category
                  ? "text-white bg-blue-600/30 border border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "text-blue-100/50 bg-white/[0.03] border border-white/10 hover:text-white hover:bg-white/[0.08] hover:border-blue-400/30"
              }`}
            >
              {category}
              {activeCategory === category && (
                <motion.div
                  layoutId="activeTabGlowOrchestra"
                  className="absolute inset-0 rounded-full border border-blue-400/80 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LIVE BAND STAGE ENSEMBLE (DESKTOP & TABLET VIEW)               */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden md:block relative w-full h-[520px] lg:h-[620px] rounded-3xl border border-blue-500/20 bg-gradient-to-b from-[#04081c]/60 via-[#020512] to-[#010208] shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden">
          
          {/* Overhead Stage Spotlights Effect */}
          <div className="absolute top-0 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,#38bdf8_0%,transparent_70%)] opacity-20 pointer-events-none" />
          
          {/* Stage Wooden/Neon Floor Platform */}
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-blue-950/40 via-blue-900/10 to-transparent border-t border-blue-400/20 shadow-[inset_0_10px_30px_rgba(59,130,246,0.1)]">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent shadow-[0_0_15px_#38bdf8]" />
          </div>

          {/* Freestanding Band Musicians Stage Formation */}
          <div className="relative w-full h-full max-w-6xl mx-auto">
            {orchestraMembers.map((member) => {
              const isHovered = hoveredMemberId === member.id;
              const isSelected = selectedMember?.id === member.id;
              const isActive = isHovered || isSelected;
              const isFilteredOut = activeCategory !== "All" && member.category !== activeCategory;

              return (
                <div
                  key={member.id}
                  style={{
                    left: member.stagePosition.desktop.left,
                    bottom: member.stagePosition.desktop.bottom,
                    zIndex: isActive ? 50 : member.stagePosition.desktop.zIndex,
                    width: member.stagePosition.desktop.width,
                    height: member.stagePosition.desktop.height,
                  }}
                  className={`absolute -translate-x-1/2 transition-all duration-700 ease-out cursor-pointer group ${
                    isFilteredOut ? "opacity-20 grayscale filter pointer-events-none scale-95" : "opacity-100"
                  }`}
                  onMouseEnter={() => setHoveredMemberId(member.id)}
                  onMouseLeave={() => setHoveredMemberId(null)}
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Stage Floor Spotlight Glow under player */}
                  <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-12 rounded-[100%] transition-all duration-500 blur-md pointer-events-none ${
                      isActive
                        ? "bg-cyan-400/50 opacity-100 scale-125 shadow-[0_0_30px_#38bdf8]"
                        : "bg-blue-600/20 opacity-40 group-hover:opacity-75"
                    }`}
                  />

                  {/* Freestanding Cutout PNG Musician Image */}
                  <div className="relative w-full h-full flex items-end justify-center">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      priority
                      sizes="300px"
                      className={`object-contain object-bottom transition-all duration-500 ease-out transform-gpu ${
                        isActive
                          ? "grayscale-0 opacity-100 scale-105 filter drop-shadow-[0_0_25px_rgba(59,130,246,0.85)]"
                          : "grayscale contrast-125 brightness-95 opacity-80 group-hover:opacity-100 group-hover:grayscale-0"
                      }`}
                    />
                  </div>

                  {/* Desktop Hover Pop-up / Detail Tooltip Card */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.92 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-[80%] left-1/2 -translate-x-1/2 w-72 p-4 rounded-2xl border border-blue-400/50 bg-[#060c28]/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(59,130,246,0.45)] z-50 pointer-events-none text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-cinzel tracking-wider text-blue-200 bg-blue-500/20 border border-blue-400/40">
                            {member.category}
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        </div>
                        <h4 className="font-cinzel text-base font-bold text-white tracking-wide">
                          {member.name}
                        </h4>
                        <p className="text-xs text-blue-300 font-semibold mt-0.5">
                          {member.role}
                        </p>
                        <p className="text-xs text-blue-100/75 mt-2 leading-relaxed">
                          {member.bio}
                        </p>
                        {member.experience && (
                          <div className="mt-2.5 pt-2 border-t border-blue-400/20 flex items-center gap-1.5 text-[11px] text-[#fcd88b]">
                            <Award className="w-3.5 h-3.5 text-[#fcd88b]" />
                            <span>{member.experience}</span>
                          </div>
                        )}
                        {/* Downward Pointer Triangle */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#060c28] border-r border-b border-blue-400/50 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MOBILE BAND STAGE & GALLERY VIEW (< md)                         */}
        {/* ------------------------------------------------------------- */}
        <div className="block md:hidden">
          {/* Mobile Band Stage Area */}
          <div className="relative w-full h-[380px] rounded-2xl border border-blue-500/20 bg-gradient-to-b from-[#04081c]/70 via-[#020512] to-[#010208] shadow-[0_0_40px_rgba(59,130,246,0.12)] overflow-hidden mb-8">
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-blue-950/40 to-transparent border-t border-blue-400/20" />
            
            {/* Freestanding Cutouts for Mobile Stage */}
            <div className="relative w-full h-full">
              {orchestraMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                const isFilteredOut = activeCategory !== "All" && member.category !== activeCategory;

                return (
                  <button
                    key={member.id}
                    type="button"
                    style={{
                      left: member.stagePosition.mobile.left,
                      bottom: member.stagePosition.mobile.bottom,
                      zIndex: isSelected ? 50 : member.stagePosition.mobile.zIndex,
                      width: member.stagePosition.mobile.width,
                      height: member.stagePosition.mobile.height,
                    }}
                    className={`absolute -translate-x-1/2 transition-all duration-500 cursor-pointer ${
                      isFilteredOut ? "opacity-20 grayscale pointer-events-none scale-90" : "opacity-100"
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    {/* Floor glow */}
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-[100%] transition-all blur-sm ${
                        isSelected ? "bg-cyan-400/60 opacity-100 scale-125 shadow-[0_0_20px_#38bdf8]" : "bg-blue-600/20 opacity-40"
                      }`}
                    />
                    
                    {/* Cutout PNG */}
                    <div className="relative w-full h-full flex items-end justify-center">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="180px"
                        className={`object-contain object-bottom transition-all duration-300 ${
                          isSelected
                            ? "grayscale-0 opacity-100 scale-105 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.9)]"
                            : "grayscale contrast-125 opacity-80"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Band Roster Selection Cards */}
          <div className="grid grid-cols-2 gap-3">
            {filteredMembers.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all backdrop-blur-md ${
                    isSelected
                      ? "border-blue-400/60 bg-blue-900/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "border-white/10 bg-white/[0.03] active:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative w-12 h-14 shrink-0 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="60px"
                      className={`object-contain object-bottom transition-all ${
                        isSelected ? "grayscale-0" : "grayscale opacity-75"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-cinzel text-xs font-bold text-white truncate">
                      {member.name}
                    </h4>
                    <p className="text-[10px] text-blue-300 truncate mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* POP-UP MODAL (Detailed View on Click/Tap)                     */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-400/50 bg-[#060c28] p-6 shadow-[0_0_60px_rgba(59,130,246,0.4)] backdrop-blur-2xl z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                aria-label="Close details modal"
                className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Full Color Cutout Stage Preview */}
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-b from-[#081035] to-[#020514] mb-5 flex items-end justify-center">
                {/* Spotlights */}
                <div className="absolute top-0 inset-x-0 h-24 bg-[radial-gradient(ellipse_at_top,#38bdf8_0%,transparent_70%)] opacity-30 pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-16 bg-blue-900/20 border-t border-blue-400/20" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-[100%] bg-cyan-400/40 blur-md" />

                <div className="relative w-48 h-56">
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    fill
                    sizes="200px"
                    className="object-contain object-bottom grayscale-0 filter drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
                  />
                </div>

                <div className="absolute bottom-3 left-4">
                  <span className="rounded-full bg-blue-500/20 border border-blue-400/40 px-3 py-1 font-cinzel text-[10px] uppercase tracking-wider text-blue-200 backdrop-blur-md">
                    {selectedMember.category}
                  </span>
                </div>
              </div>

              {/* Details Header */}
              <div>
                <h3 className="font-cinzel text-xl font-bold uppercase tracking-wide text-white">
                  {selectedMember.name}
                </h3>
                <p className="mt-1 font-sans text-sm font-semibold text-blue-300">
                  {selectedMember.role}
                </p>
                <p className="mt-4 font-sans text-xs sm:text-sm leading-relaxed text-blue-100/75">
                  {selectedMember.bio}
                </p>

                {selectedMember.experience && (
                  <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/[0.08] p-3 flex items-center gap-2 text-xs text-[#fcd88b]">
                    <Award className="h-4 w-4 shrink-0 text-[#fcd88b]" />
                    <span>{selectedMember.experience}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
