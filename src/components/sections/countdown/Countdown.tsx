"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TARGET_DATE = new Date("2026-06-15T19:00:00");

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const calculateTimeLeft = () => {
      const difference = +TARGET_DATE - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="relative w-full py-24 bg-[#000511] overflow-hidden z-20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] w-8 md:w-16 bg-blue-500/30" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-blue-400/80 font-cinzel">The Portal Opens In</span>
            <div className="h-[1px] w-8 md:w-16 bg-blue-500/30" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-5xl">
            <CountdownItem label="Days" value={timeLeft.days} />
            <CountdownItem label="Hours" value={timeLeft.hours} />
            <CountdownItem label="Minutes" value={timeLeft.minutes} />
            <CountdownItem label="Seconds" value={timeLeft.seconds} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300/40 font-cinzel">
              Current Target
            </div>
            <div className="text-sm md:text-base text-blue-200/60 font-cinzel tracking-widest">
              JUNE 15, 2026 • 07:00 PM
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CountdownItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors duration-500" />
      <div className="relative flex flex-col items-center p-8 md:p-12 border border-blue-500/10 bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />
        
        <div className="relative h-16 md:h-24 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              {value.toString().padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>

        <span className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.3em] text-blue-400/60 font-medium font-cinzel">
          {label}
        </span>

        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-1 h-1 bg-blue-500/20 rounded-full" />
        <div className="absolute top-2 right-2 w-1 h-1 bg-blue-500/20 rounded-full" />
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-500/20 rounded-full" />
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-blue-500/20 rounded-full" />
      </div>
    </div>
  );
}
