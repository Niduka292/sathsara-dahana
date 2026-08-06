"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import DahanaLogo from "../../../../assets/dahana-logo-no-bg.png";
import FuzzyText from '../../../../components/FuzzyText';
import VortexBackground from "../../ui/VortexBackground";
import "../../../styles/animations.css";


export default function Hero() {

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-32 bg-transparent">
      <VortexBackground />
      
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center text-center mt-12">
        <motion.div
          className="flex flex-col items-center"
        >
          {/* Requested Image above the event name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 relative w-32 h-20 md:w-48 md:h-32 group transform-gpu animate-vortex-pulse"
          >
            <Image
              src={DahanaLogo}
              alt="Sample Event Image"
              fill
              className="object-contain opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 ease-[0.16,1,0.3,1]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-white/60 text-[10px] md:text-xs font-medium uppercase mb-6 block font-cinzel tracking-[0.4em]">
              A Musical Journey Through Time
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[9.5rem] font-bold leading-none tracking-tighter uppercase mb-6 font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white/90 via-white/80 to-blue-200/50 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] transform-gpu"
          >
            <FuzzyText>
              Sathsara Dahana
            </FuzzyText>

          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-white/50 mb-16 italic font-cinzel tracking-[0.2em] max-w-2xl"
          >
            Where Every Note Echoes Across Centuries
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center mb-16"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium font-cinzel">The Grand Event</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-white/20" />
            </div>
            <div className="flex flex-col items-center gap-4 text-2xl md:text-4xl tracking-[0.4em] font-cinzel text-white/80 font-bold">
              <div>
                6 <span className="text-blue-400/60">•</span> SEPTEMBER <span className="text-blue-400/60">•</span> 2026
              </div>
              <div>7:00 PM</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl justify-center px-6"
          >
            <button className="relative px-10 py-5 bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-md group overflow-hidden rounded-sm">
              <span className="relative z-10 font-cinzel">Secure Your Portal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-[0.16,1,0.3,1]" />
            </button>

            <button className="relative px-10 py-5 bg-white/5 border border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] hover:text-white/80 hover:border-white/20 transition-all duration-500 group overflow-hidden rounded-sm backdrop-blur-sm">
              <span className="relative z-10 font-cinzel">Explore The Journey</span>
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer transform-gpu"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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