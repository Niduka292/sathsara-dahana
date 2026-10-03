"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import DahanaLogo from "../../../../assets/dahana-logo-no-bg.png";

// All rings are drawn on a 500×500 canvas centred at (250, 250)
const C = 250;
const BLUE = "#93c5fd";
const VIOLET = "#a78bfa";
const GOLD = "#fbbf24";
const NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

/** A full-size layer that spins forever around the centre (HTML transform, so the pivot is exact). */
function Spin({ seconds, reverse = false, children }: { seconds: number; reverse?: boolean; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      animate={reduceMotion ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={{ duration: seconds, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible" aria-hidden="true">
        {children}
      </svg>
    </motion.div>
  );
}

/** A clock hand pointing up from the centre, spinning at its own speed. */
function Hand({ seconds, length, width, color }: { seconds: number; length: string; width: number; color: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="absolute left-1/2 bottom-1/2 origin-bottom rounded-full"
      style={{ height: length, width, marginLeft: -width / 2, background: `linear-gradient(to top, transparent, ${color})` }}
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={{ duration: seconds, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function TimeAstrolabe() {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] xl:max-w-[500px] aspect-square">
      {/* Soft breathing glow behind everything */}
      <motion.div
        className="absolute inset-[12%] rounded-full bg-blue-500/20 blur-[60px]"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer ring: 60 minute ticks, slow clockwise */}
      <Spin seconds={120}>
        <circle cx={C} cy={C} r={236} fill="none" stroke={BLUE} strokeOpacity={0.35} strokeWidth={1} />
        <circle cx={C} cy={C} r={222} fill="none" stroke={BLUE} strokeOpacity={0.15} strokeWidth={1} />
        {Array.from({ length: 60 }).map((_, i) => (
          <line
            key={i}
            x1={C}
            y1={C - 236}
            x2={C}
            y2={C - (i % 5 === 0 ? 222 : 230)}
            stroke={BLUE}
            strokeOpacity={i % 5 === 0 ? 0.9 : 0.4}
            strokeWidth={i % 5 === 0 ? 2 : 1}
            transform={`rotate(${i * 6} ${C} ${C})`}
          />
        ))}
      </Spin>

      {/* Numeral ring: Roman hours, counter-clockwise */}
      <Spin seconds={90} reverse>
        <circle cx={C} cy={C} r={186} fill="none" stroke={VIOLET} strokeOpacity={0.3} strokeWidth={1} />
        {NUMERALS.map((numeral, i) => (
          <text
            key={numeral}
            x={C}
            y={C - 196}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={VIOLET}
            fillOpacity={0.85}
            fontSize={15}
            letterSpacing={1}
            className="font-cinzel"
            transform={`rotate(${i * 30} ${C} ${C})`}
          >
            {numeral}
          </text>
        ))}
      </Spin>

      {/* Inner dashed ring with gold markers, faster clockwise */}
      <Spin seconds={40}>
        <circle cx={C} cy={C} r={160} fill="none" stroke={BLUE} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 8" />
        {[0, 90, 180, 270].map((angle) => (
          <rect
            key={angle}
            x={C - 5}
            y={C - 165}
            width={10}
            height={10}
            fill={GOLD}
            fillOpacity={0.85}
            transform={`rotate(${angle} ${C} ${C}) rotate(45 ${C} ${C - 160})`}
          />
        ))}
      </Spin>

      {/* Tilted orbits with travelling sparks: gives the rings a gyroscope-like depth */}
      {[
        { tilt: -28, color: BLUE, dur: "7s" },
        { tilt: 28, color: VIOLET, dur: "9s" },
      ].map(({ tilt, color, dur }) => {
        const path = `M ${C - 215} ${C} a 215 62 0 1 0 430 0 a 215 62 0 1 0 -430 0`;
        return (
          <svg
            key={tilt}
            viewBox="0 0 500 500"
            className="absolute inset-0 w-full h-full overflow-visible"
            style={{ transform: `rotate(${tilt}deg)` }}
            aria-hidden="true"
          >
            <path d={path} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={1} />
            <circle r={4} fill="white" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
              <animateMotion dur={dur} repeatCount="indefinite" path={path} />
            </circle>
          </svg>
        );
      })}

      {/* Clock hands sweeping behind the logo */}
      <Hand seconds={60} length="30%" width={3} color={BLUE} />
      <Hand seconds={10} length="38%" width={1.5} color={GOLD} />

      {/* Centre: floating logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[46%] aspect-square will-change-transform"
        >
          <Image
            src={DahanaLogo}
            alt="Sathsara Dahana Logo"
            fill
            sizes="(min-width: 1280px) 230px, (min-width: 768px) 184px, 156px"
            className="object-contain drop-shadow-[0_0_24px_rgba(147,197,253,0.7)]"
          />
        </motion.div>
      </div>
    </div>
  );
}
