"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import DahanaLogo from "../../../../assets/dahana-logo-no-bg.png";

export default function Introduction() {
  return (
    <section id="introduction" className="relative w-full min-h-screen py-32 bg-transparent overflow-hidden flex items-center z-10">
      {/* Background Subtle Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">

          {/* Left Side: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-left order-2 lg:order-1 transform-gpu lg:ml-15"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="h-[1px] w-16 bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-blue-400 font-bold font-cinzel">The Cosmic Legacy</span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase mb-12 font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 leading-tight">
              A Grand <br />Extravaganza
            </h2>

            <div className="space-y-8 text-blue-100/70 font-light leading-relaxed text-base md:text-lg text-justify">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="first-letter:text-5xl first-letter:font-cinzel first-letter:mr-3 first-letter:float-left first-letter:text-blue-400"
              >
                "Sisi Arundathee" is one of the most iconic cultural showcases organized by the Student Council of the Faculty of Applied Sciences at the University of Sri Jayewardenepura. Recognized as a vibrant celebration of creativity, the event has historically served as a platform where undergraduate students step beyond the boundaries of science to express their artistic talents through music, dance, and stage performances.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                Originating as an annual tradition, "Sisi Arundathee" has been described as a grand cultural extravaganza that brings together a diverse range of performances—from traditional Sri Lankan and South Asian dance forms to contemporary Western music and choreography. The event not only highlights the multifaceted talents of students but also reinforces the idea that scientific minds can equally thrive in artistic expression.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="p-8 border-l-2 border-blue-500/30 bg-blue-500/5 backdrop-blur-sm rounded-r-2xl italic font-serif text-blue-200/80 transform-gpu"
              >
                "Proceeds from the event have previously been directed toward community development initiatives, reflecting the faculty's commitment to using student-driven creativity for meaningful societal impact."
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                With a legacy spanning many years, the event has been a hallmark of student life. After its most recent edition in 2019, "Sisi Arundathee" has remained discontinued, marking a pause in what was once a highly anticipated annual tradition. Its absence has been strongly felt, further emphasizing its cultural and emotional significance within the university community.
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