"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

interface TimelineEvent {
  id: string;
  label: string;
  title: string;
  description: string;
  /** Hour shown on the clock once the step arrives (minute hand at 12) */
  hour: number;
}

const events: TimelineEvent[] = [
  {
    id: "act-1",
    label: "01 • THE FIRST NOTE",
    title: "Auditions Open",
    description:
      "A first step into a story yet to unfold. Voices, movements, and melodies come together as students step forward to take the stage.",
    hour: 12,
  },
  {
    id: "act-2",
    label: "02 • THE MOMENTS ARE CHOSEN",
    title: "Audition Results",
    description:
      "Every story begins with a choice. The voices and talents that will shape this year's Sathsara Dahana are revealed.",
    hour: 3,
  },
  {
    id: "act-3",
    label: "03 • THE PRELUDE",
    title: "Before It Unfolds",
    description:
      "A period of preparation before the journey takes form, where anticipation grows and something begins to emerge.",
    hour: 6,
  },
  {
    id: "act-4",
    label: "04 • SOMETHING IS ABOUT TO CHANGE",
    title: "The Theme Begins to Unfold",
    description:
      "A story waits beneath the surface. Piece by piece, the first clues begin to emerge.",
    hour: 8,
  },
  {
    id: "act-5",
    label: "05 • THE JOURNEY UNFOLDS",
    title: "Sathsara Dahana 2026",
    description:
      "An evening of music, movement, and expression — where every performance becomes part of something beyond the ordinary.",
    hour: 11,
  },
];

const SMOOTH = { stiffness: 80, damping: 24, restDelta: 0.0001 };

/** Clock node whose hands are driven by the row's scroll progress. */
function ClockDial({ progress, accent, hour }: { progress: MotionValue<number>; accent: string; hour: number }) {
  // Minute hand makes one full turn and stops at 12; hour hand moves one hour and stops on `hour`
  const hourAngle = (hour % 12) * 30;
  const minuteRotate = useTransform(progress, [0, 1], [-360, 0]);
  const hourRotate = useTransform(progress, [0, 1], [hourAngle - 30, hourAngle]);
  const ringGlow = useTransform(progress, [0.6, 1], [0.25, 1]);

  return (
    <div className="relative w-14 h-14 md:w-20 md:h-20">
      <motion.div
        style={{ opacity: ringGlow, boxShadow: `0 0 30px ${accent}, inset 0 0 18px ${accent}` }}
        className="absolute inset-0 rounded-full"
      />
      <svg viewBox="0 0 64 64" className="relative w-full h-full" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#02040d" stroke={accent} strokeOpacity="0.7" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="25" fill="none" stroke={accent} strokeOpacity="0.15" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="32"
            y1={i % 3 === 0 ? 5 : 7}
            x2="32"
            y2="10"
            stroke={accent}
            strokeOpacity={i % 3 === 0 ? 0.9 : 0.45}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            transform={`rotate(${i * 30} 32 32)`}
          />
        ))}
      </svg>
      {/* Hands are HTML elements pivoting on the dial's center, so the rotation is identical in every browser */}
      <motion.div
        style={{ rotate: hourRotate }}
        className="absolute left-1/2 bottom-1/2 w-[3px] h-[22%] -ml-[1.5px] origin-bottom rounded-full bg-white"
      />
      <motion.div
        style={{ rotate: minuteRotate, backgroundColor: accent }}
        className="absolute left-1/2 bottom-1/2 w-[2px] h-[34%] -ml-[1px] origin-bottom rounded-full"
      />
      <div className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white" />
    </div>
  );
}

function TimelineRow({ event, index }: { event: TimelineEvent; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isLeft = index % 2 === 0;
  const accent = index % 2 === 1 ? "#a78bfa" : "#60a5fa";

  // 0 when the row enters the bottom of the screen, 1 when it nears the middle
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ["start end", "center 55%"] });
  const progress = useSpring(scrollYProgress, SMOOTH);

  // Text arrives "from the distance": tiny, faded and blurred, then settles into place
  const textScale = useTransform(progress, [0, 1], reduceMotion ? [1, 1] : [0.35, 1]);
  const textOpacity = useTransform(progress, [0.15, 0.75], [0, 1]);
  const textBlur = useTransform(progress, [0, 0.8], reduceMotion ? [0, 0] : [14, 0]);
  const textFilter = useTransform(textBlur, (b) => `blur(${b}px)`);
  const textSkew = useTransform(progress, [0, 1], reduceMotion ? [0, 0] : [isLeft ? 8 : -8, 0]);

  // Portal rings burst open around the clock as the step arrives
  const portalScale = useTransform(progress, [0.2, 1], [0.3, 3.2]);
  const portalOpacity = useTransform(progress, [0.2, 0.55, 1], [0, 0.9, 0]);
  const portalScale2 = useTransform(progress, [0.4, 1], [0.3, 2.2]);
  const portalOpacity2 = useTransform(progress, [0.4, 0.7, 1], [0, 0.7, 0]);

  const textBlock = (
    <motion.div
      style={{
        scale: textScale,
        opacity: textOpacity,
        filter: textFilter,
        skewY: textSkew,
        transformOrigin: isLeft ? "right center" : "left center",
      }}
      className={`flex flex-col will-change-transform ${isLeft ? "md:items-end md:text-right" : ""}`}
    >
      <span
        className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-3 md:mb-4 font-cinzel"
        style={{ color: accent }}
      >
        {event.label}
      </span>
      <h3 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 font-cinzel text-white leading-tight">
        {event.title}
      </h3>
      <p className="text-blue-100/60 text-sm md:text-base leading-relaxed italic font-serif md:max-w-sm">
        {event.description}
      </p>
    </motion.div>
  );

  return (
    <div ref={rowRef} className="relative flex items-center w-full min-h-[180px]">
      {/* Left side (desktop) */}
      <div className="hidden md:block w-1/2 pr-24">{isLeft && textBlock}</div>

      {/* Clock node + portal rings */}
      <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-30">
        <motion.div
          style={{ scale: portalScale, opacity: portalOpacity, borderColor: accent }}
          className="absolute w-14 h-14 md:w-20 md:h-20 rounded-full border-2 pointer-events-none"
        />
        <motion.div
          style={{ scale: portalScale2, opacity: portalOpacity2, borderColor: accent }}
          className="absolute w-14 h-14 md:w-20 md:h-20 rounded-full border pointer-events-none"
        />
        <ClockDial progress={progress} accent={accent} hour={event.hour} />
      </div>

      {/* Right side (desktop) / all text (mobile) */}
      <div className="w-full md:w-1/2 pl-20 md:pl-24">
        <div className="md:hidden">{textBlock}</div>
        <div className="hidden md:block">{!isLeft && textBlock}</div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 60%"],
  });
  const beamScale = useSpring(scrollYProgress, SMOOTH);

  return (
    <section id="timeline" className="relative w-full py-20 md:py-40 bg-transparent overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-blue-300 rounded-full blur-[1px]" />
        <div className="absolute top-[40%] right-[15%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[60%] left-[20%] w-[2px] h-[2px] bg-white rounded-full" />
        <div className="absolute top-[80%] right-[25%] w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "1.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.5em" }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#a78bfa] text-[11px] font-bold uppercase mb-4 block font-cinzel text-glow-violet"
          >
            Fragments of Time
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-bold font-cinzel text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            The Path to What Lies Ahead
          </motion.h2>
        </div>

        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          {/* Beam track */}
          <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-[2px] bg-blue-500/10 -translate-x-1/2" />

          {/* Beam of light that fills with scroll */}
          <motion.div
            style={{ scaleY: beamScale }}
            className="absolute left-7 md:left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 origin-top z-20 rounded-full bg-gradient-to-b from-[#a78bfa] via-blue-400 to-cyan-300 shadow-[0_0_12px_rgba(96,165,250,0.9),0_0_30px_rgba(96,165,250,0.5)]"
          />

          {/* Energy pulses travelling down the lit part of the beam */}
          <motion.div
            style={{ scaleY: beamScale }}
            className="absolute left-7 md:left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 origin-top z-20 overflow-hidden pointer-events-none"
          >
            {[0, 1.4].map((delay) => (
              <motion.span
                key={delay}
                initial={{ top: "-15%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeIn" }}
                className="absolute left-0 w-full h-24 bg-gradient-to-b from-transparent via-white to-transparent"
              />
            ))}
          </motion.div>

          <div className="flex flex-col gap-24 md:gap-40">
            {events.map((event, index) => (
              <TimelineRow key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
