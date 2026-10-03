"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Silkscreen, VT323 } from "next/font/google";
import DahanaLogo from "../../../assets/dahana-logo-no-bg.png";
import "../../styles/animations.css";

const pixelTitle = Silkscreen({ subsets: ["latin"], weight: ["400", "700"] });
const pixelBody = VT323({ subsets: ["latin"], weight: "400" });

const LOAD_DURATION = 2800;
const TOTAL_BLOCKS = 20;

const STATUS_STEPS = [
  "BOOTING SYSTEM...",
  "LOADING STAGE ASSETS...",
  "TUNING INSTRUMENTS...",
  "WARMING UP THE LIGHTS...",
  "READY.",
];

// Olive LCD palette, matching the classic monochrome desktop look
const INK = "#1f2414";
const PAPER = "#959d78";
const PAPER_DARK = "#7f8763";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent scroll while loading
    document.body.style.overflow = "hidden";

    const start = Date.now();
    const ticker = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / (LOAD_DURATION - 300)) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(ticker);
    }, 80);

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "unset";
    }, LOAD_DURATION);

    return () => {
      clearInterval(ticker);
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, []);

  const filledBlocks = Math.round((progress / 100) * TOTAL_BLOCKS);
  const statusIndex = Math.min(
    STATUS_STEPS.length - 1,
    Math.floor((progress / 100) * (STATUS_STEPS.length - 1))
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          // CRT "power off": collapse to a line, then fade
          exit={{ scaleY: [1, 0.004, 0.004], opacity: [1, 1, 0] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1], ease: "easeIn" }}
          className={`${pixelBody.className} fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-hidden`}
          style={{ backgroundColor: PAPER, color: INK }}
        >
          {/* Subtle scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.12]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${INK} 0px, ${INK} 1px, transparent 1px, transparent 3px)`,
            }}
          />

          {/* Screen border */}
          <div className="absolute inset-2 md:inset-3 pointer-events-none border-[6px]" style={{ borderColor: INK }} />

          {/* Window */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
            className="relative z-10 w-full max-w-[520px] border-4"
            style={{ borderColor: INK, backgroundColor: PAPER, boxShadow: `6px 6px 0 ${INK}` }}
          >
            {/* Title bar */}
            <div
              className={`${pixelTitle.className} flex items-center justify-between px-3 py-1.5 text-[11px] md:text-xs tracking-wider`}
              style={{ backgroundColor: INK, color: PAPER }}
            >
              <span>SATHSARA_DAHANA.EXE</span>
              <div className="flex gap-1.5">
                {["_", "□", "×"].map((glyph) => (
                  <span
                    key={glyph}
                    className="w-4 h-4 flex items-center justify-center border leading-none"
                    style={{ borderColor: PAPER }}
                  >
                    {glyph}
                  </span>
                ))}
              </div>
            </div>

            {/* Fake tabs */}
            <div className="flex border-b-4" style={{ borderColor: INK }}>
              {["LOADER", "STAGE", "ABOUT"].map((tab, i) => (
                <span
                  key={tab}
                  className={`${pixelTitle.className} flex-1 text-center text-[10px] py-1.5 border-r-4 last:border-r-0`}
                  style={
                    i === 0
                      ? { backgroundColor: INK, color: PAPER, borderColor: INK }
                      : { borderColor: INK, backgroundColor: PAPER_DARK }
                  }
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="px-5 md:px-8 pt-6 pb-7 flex flex-col items-center">
              {/* Logo, rendered as a dark monochrome silhouette */}
              <div className="relative w-20 h-14 md:w-28 md:h-20 mb-4">
                <Image
                  src={DahanaLogo}
                  alt="Sathsara Dahana Logo"
                  fill
                  sizes="(min-width: 768px) 112px, 80px"
                  className="object-contain [filter:grayscale(1)_brightness(0.25)_contrast(1.4)]"
                  priority
                />
              </div>

              {/* Title */}
              <h1
                className={`${pixelTitle.className} text-center font-bold text-2xl sm:text-3xl md:text-4xl leading-none tracking-wide`}
                style={{ textShadow: `3px 3px 0 ${PAPER_DARK}` }}
              >
                SATHSARA
                <br />
                DAHANA
              </h1>

              <p className="mt-3 text-lg md:text-xl tracking-widest opacity-80">
                A MUSICAL JOURNEY THROUGH TIME
              </p>

              {/* Status line */}
              <div className="w-full mt-6 flex items-center justify-between text-lg md:text-xl">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2" style={{ borderColor: INK }}>
                    <span
                      className="block w-full h-full"
                      style={{ backgroundColor: progress >= 100 ? INK : "transparent" }}
                    />
                  </span>
                  {STATUS_STEPS[statusIndex]}
                </span>
                <span className="tabular-nums">{String(progress).padStart(3, "0")}%</span>
              </div>

              {/* Segmented progress bar */}
              <div
                className="w-full mt-2 p-1 border-4 flex gap-[3px]"
                style={{ borderColor: INK }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
                  <span
                    key={i}
                    className="flex-1 h-4"
                    style={{ backgroundColor: i < filledBlocks ? INK : PAPER_DARK }}
                  />
                ))}
              </div>

              {/* Dotted divider, like the retro slider track */}
              <div
                className="w-full h-[3px] mt-6"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, ${INK} 0px, ${INK} 3px, transparent 3px, transparent 7px)`,
                }}
              />

              {/* Blinking prompt */}
              <p className="w-full mt-3 text-lg md:text-xl">
                C:\&gt; ENTERING THE PORTAL
                <span className="animate-retro-blink">_</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
