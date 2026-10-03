"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import DahanaLogo from "../../../../assets/dahana-logo-no-bg.png";

export default function Introduction() {
  return (
    <section id="introduction" className="relative w-full min-h-screen py-20 md:py-32 bg-transparent overflow-hidden flex items-center z-10">
      {/* Background Subtle Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-32">

          {/* Left Side: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-left order-2 lg:order-1 transform-gpu lg:ml-15"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="h-[1px] w-16 bg-gradient-to-r from-[#a78bfa] to-transparent" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-[#a78bfa] font-bold font-cinzel text-glow-violet">The Cosmic Legacy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold uppercase mb-8 md:mb-12 font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 leading-tight">
              Beyond The <br />Ordinary
            </h2>

            <div className="space-y-8 text-blue-100/70 font-light leading-relaxed text-base md:text-lg text-justify">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="first-letter:text-5xl first-letter:font-cinzel first-letter:mr-3 first-letter:float-left first-letter:text-blue-400"
              >
                {`Sathsara Dahana 2026 is a cultural showcase organized by the Faculty of Applied Sciences, University of Sri Jayewardenepura, bringing together the artistic talents of its undergraduate community in celebration of creativity, expression, and togetherness.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`At its heart, Sathsara Dahana is an occasion where 2nd and 3rd year undergraduates take the stage to welcome the newest members of the faculty, the 1st year freshers through an evening of music, dance, drama, and orchestral performances. It marks the beginning of a new chapter of university life through a shared celebration of art and creativity.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`The event brings together a wide range of artistic traditions and styles, including Sinhala, Tamil, English, Western, and traditional Sri Lankan influences. Each performance reflects the creativity, dedication, and diverse talents of students who step beyond their academic disciplines to express themselves through art.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`Adding a distinctive character to this year's edition is a carefully crafted theme that gives the evening its own identity. Through music, movement, emotion, and imagination, Sathsara Dahana 2026 offers an experience that extends beyond individual performances.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`More than a cultural showcase, Sathsara Dahana reflects the spirit of the Faculty of Applied Sciences, where academic pursuits and artistic expression come together. It provides students with a platform to explore their talents, collaborate creatively, and create lasting memories within the university community.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`Sathsara Dahana 2026 invites the students of the University of Sri Jayewardenepura to experience an evening created by the students of the Faculty of Applied Sciences, a celebration of art, creativity, connection, and new beginnings.`}
              </motion.p>
            </div>
          </motion.div>

          {/* Right Side: Portal Animation - Hidden on mobile */}
          <div className="hidden xl:flex flex-1 justify-end items-center relative order-1 xl:order-2 h-[500px] w-full xl:pr-[10%] transform-gpu">

            {/* Master Wrapper */}
            <div className="relative w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] aspect-square">

              {/*
                LAYER 1 — Clip mask (controls visibility window).
                Only animates clipPath. No transforms here so the
                clip boundary stays perfectly anchored to the wrapper.
              */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20"
                animate={{
                  clipPath: [
                    "inset(0px -80px 0px -80px)",
                    "inset(0px 100px 0px -150px)",
                    "inset(0px 400px 0px -80px)",
                    "inset(0px 400px 0px -80px)",
                    "inset(0px 80px 0px -120px)",
                    "inset(0px -80px 0px -80px)",
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.032, 0.38, 0.66, 0.95, 1.0]
                }}
              >
                {/*
                  LAYER 2 — Float (purely translates Y).
                  Completely independent animation — duration 3.5s
                  is not a divisor of 8s so the phase drifts naturally,
                  preventing the float from ever looking mechanical or looped.
                  willChange: "transform" keeps this on the GPU compositor.
                */}
                <motion.div
                  animate={{ y: [-12, 12, -12] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ willChange: "transform" }}
                >
                  <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64">
                    <Image
                      src={DahanaLogo}
                      alt="Sathsara Dahana Logo"
                      fill
                      className="object-contain drop-shadow-[0_0_20px_rgba(147,197,253,0.8)]"
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* The Moving Portal */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <motion.div
                  className="relative w-[120px] h-[220px] md:w-[180px] md:h-[350px] lg:w-[220px] lg:h-[450px] rounded-[100%]"
                  animate={{
                    x: ["110%", "-110%", "110%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(147,197,253,0.4) 0%, rgba(59,130,246,0.7) 50%, rgba(37,99,235,0.9) 100%)",
                    border: "8px solid #93c5fd",
                    boxShadow: "0 0 80px rgba(59,130,246,0.9), 0 0 20px rgba(255,255,255,0.4), inset 0 0 80px rgba(59,130,246,0.8), inset 0 0 20px rgba(255,255,255,0.5)",
                    willChange: "transform",
                  }}
                >
                  {/* Inner energetic pulse — CSS-driven to keep off JS thread */}
                  <motion.div
                    className="absolute inset-0 rounded-[100%]"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      boxShadow: "inset 0 0 100px rgba(255,255,255,0.7)"
                    }}
                  />
                </motion.div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}