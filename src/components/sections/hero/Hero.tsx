"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import SisiLogo from "../../../../assets/sisi-logo-no-bg.png";
import FuzzyText from '../../../../components/FuzzyText';
import Prism from '../../../../components/Prism';


export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-32 bg-[#000511]">
      <div className="absolute inset-0 z-0 pointer-events-none 
                opacity-80 blur-[70px] saturate-150 mix-blend-screen">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={1.8}
          baseWidth={3.0}
          scale={3.6}
          hueShift={0}
          colorFrequency={1.5}
          noise={0.05}
          glow={1.5}
        />
      </div> 
      {/* Background Orbits & Stars with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        animate={{
          x: mousePosition.x * -1,
          y: mousePosition.y * -1,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-blue-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px] rounded-full border border-blue-500/5" />

        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center text-center mt-12">
        <motion.div
          className="flex flex-col items-center"
        >
          {/* Requested Image above the event name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-8 relative w-32 h-20 md:w-48 md:h-32 rounded-lg overflow-hidden border border-blue-400/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] group"
          >
            <Image
              src={SisiLogo}
              alt="Sample Event Image"
              fill
              className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          >
            <span className="text-blue-300/80 text-[10px] md:text-xs font-medium uppercase mb-6 block font-cinzel tracking-[0.4em]">
              A Musical Journey Through Time
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[9.5rem] font-bold leading-none tracking-tight uppercase mb-6 font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            <FuzzyText>
              Sisi Arundathee
            </FuzzyText>

          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
            className="text-lg md:text-xl text-blue-200/60 mb-16 italic font-cinzel tracking-[0.2em] max-w-2xl"
          >
            Where Every Note Echoes Across Centuries
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center mb-16"
          >
            <div className="flex items-center gap-6 mb-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-blue-500/50" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-medium font-cinzel">The Grand Event</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-blue-500/50" />
            </div>
            <div className="text-xl md:text-2xl tracking-[0.4em] font-cinzel text-white/90 font-bold">
              15 <span className="text-blue-400">•</span> JUNE <span className="text-blue-400">•</span> 2026 <span className="mx-4 text-blue-500/30">|</span> 7:00 PM
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl justify-center px-6"
          >
            <button className="relative px-10 py-5 bg-blue-600/10 border border-blue-400/50 text-blue-100 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-blue-600/30 hover:border-blue-400 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] backdrop-blur-md group overflow-hidden rounded-sm">
              <span className="relative z-10 font-cinzel">Secure Your Portal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </button>

            <button className="relative px-10 py-5 bg-white/5 border border-white/10 text-white/70 text-[11px] font-bold uppercase tracking-[0.3em] hover:text-white hover:border-white/40 transition-all group overflow-hidden rounded-sm backdrop-blur-sm">
              <span className="relative z-10 font-cinzel">Explore The Journey</span>
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => {
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }}
      >
        <div className="w-[20px] h-[34px] border-[1.5px] border-blue-500/40 rounded-full flex justify-center p-1">
          <div className="w-[2px] h-[6px] bg-blue-400 rounded-full" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.4em] font-cinzel text-blue-300/80">Scroll</span>
      </motion.div>

    </section >
  );
}