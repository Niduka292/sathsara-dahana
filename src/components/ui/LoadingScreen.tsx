"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import DahanaLogo from "../../../assets/dahana-logo-no-bg.png";
import "../../styles/animations.css";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent scroll while loading
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "unset";
    }, 2800);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, []);

  const titleText = "Sathsara Dahana";
  const letters = titleText.split("");

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#02040d]"
        >
          {/* Background glow effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Central blue glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
            {/* Gold accent glow */}
            <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-[#fbbf24]/5 rounded-full blur-[120px]" />
            {/* Violet accent glow */}
            <div className="absolute top-[60%] right-[30%] w-[250px] h-[250px] bg-[#a78bfa]/5 rounded-full blur-[100px]" />
          </div>

          {/* Pulsing ring behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border border-blue-500/20 animate-loader-pulse-ring" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="w-56 h-56 md:w-72 md:h-72 rounded-full border border-[#fbbf24]/10 animate-loader-pulse-ring"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-24 h-16 md:w-36 md:h-24 mb-8 z-10"
          >
            <Image
              src={DahanaLogo}
              alt="Sathsara Dahana Logo"
              fill
              sizes="(min-width: 768px) 144px, 96px"
              className="object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]"
              priority
            />
          </motion.div>

          {/* Title — letter-by-letter stagger */}
          <div className="relative z-10 flex flex-wrap justify-center overflow-hidden mb-12 px-4">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`text-lg sm:text-2xl md:text-4xl lg:text-5xl font-cinzel font-bold tracking-normal sm:tracking-wider ${
                  letter === " " ? "mx-2" : ""
                } text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300`}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="relative z-10 text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.5em] text-white/30 font-cinzel mb-16"
          >
            A Musical Journey Through Time
          </motion.p>

          {/* Progress bar */}
          <div className="relative z-10 w-48 md:w-64 h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-[#fbbf24] to-[#a78bfa] rounded-full animate-loader-progress shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>

          {/* Loading text */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{
              delay: 0.8,
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="relative z-10 mt-6 text-[9px] uppercase tracking-[0.4em] text-white/20 font-cinzel"
          >
            Entering the portal
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
