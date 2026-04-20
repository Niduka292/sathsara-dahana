"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SisiLogo from "../../../../assets/sisi-logo-no-bg.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-32 bg-[#000511]">
      {/* Background Orbits & Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-blue-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px] rounded-full border border-blue-500/5" />

        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

        {/* Subtle Stars */}
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-blue-300 rounded-full blur-[1px]" />
        <div className="absolute top-[30%] left-[80%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[70%] left-[20%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[80%] left-[85%] w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center text-center mt-12">
        <motion.div
          className="flex flex-col items-center"
        >
          {/* Requested Image above the event name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8 relative w-48 h-32 rounded-lg overflow-hidden border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          >
            <Image
              src={SisiLogo}
              alt="Sample Event Image"
              fill
              className="object-cover opacity-80"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <span className="text-blue-300/80 text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase mb-6 block font-cinzel">
              A Musical Journey Through Time
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[9rem] font-bold leading-none tracking-tight uppercase mb-6 font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            Sisi Arundathee
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="text-lg md:text-xl text-blue-200/60 mb-16 italic font-cinzel tracking-widest"
          >
            Where Every Note Echoes Across Centuries
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
            className="flex flex-col items-center mb-16"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-12 bg-blue-500/30" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400/80 font-cinzel">The Grand Event</span>
              <div className="h-[1px] w-12 bg-blue-500/30" />
            </div>
            <div className="text-lg md:text-xl tracking-[0.3em] font-cinzel text-white/90">
              15 <span className="text-blue-400">•</span> JUNE <span className="text-blue-400">•</span> 2025 <span className="mx-4 text-blue-500/50">|</span> 7:00 PM
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center"
          >
            <button className="relative px-8 py-4 bg-gradient-to-r from-blue-400/20 to-blue-600/20 border border-blue-400/40 text-blue-100 text-xs font-bold uppercase tracking-[0.2em] hover:bg-blue-500/30 hover:border-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] backdrop-blur-sm group overflow-hidden">
              <span className="relative z-10 font-cinzel">Secure Your Portal</span>
              <div className="absolute inset-0 bg-blue-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>

            <button className="relative px-8 py-4 bg-transparent border border-white/10 text-white/70 text-xs font-bold uppercase tracking-[0.2em] hover:text-white hover:border-white/30 transition-all group overflow-hidden">
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
    </section>
  );
}