"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SisiLogo from "../../../../assets/sisi-logo-no-bg.png";

export default function Introduction() {
  return (
    <section className="relative w-full min-h-screen py-24 bg-[#000511] overflow-hidden flex items-center z-10">
      {/* Background Subtle Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left Side: Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="flex-1 text-left order-2 lg:order-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-blue-500/50" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-cinzel">The Legacy</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-8 font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300">
              The Grand Extravaganza
            </h2>

            <div className="space-y-6 text-blue-100/70 font-light leading-relaxed text-sm md:text-base text-justify">
              <p>
                “Sisi Arundathee” is one of the most iconic cultural showcases organized by the Student Council of the Faculty of Applied Sciences at the University of Sri Jayewardenepura. Recognized as a vibrant celebration of creativity, the event has historically served as a platform where undergraduate students step beyond the boundaries of science to express their artistic talents through music, dance, and stage performances.
              </p>
              <p>
                Originating as an annual tradition, “Sisi Arundathee” has been described as a grand cultural extravaganza that brings together a diverse range of performances—from traditional Sri Lankan and South Asian dance forms to contemporary Western music and choreography. The event not only highlights the multifaceted talents of students but also reinforces the idea that scientific minds can equally thrive in artistic expression. In past editions, hundreds of students have taken part in dozens of performances, transforming the stage into a dynamic fusion of culture, creativity, and innovation.
              </p>
              <p>
                Beyond entertainment, “Sisi Arundathee” has also embodied a strong sense of social responsibility. Proceeds from the event have previously been directed toward community development initiatives, reflecting the faculty’s commitment to using student-driven creativity for meaningful societal impact.
              </p>
              <p>
                With a legacy spanning many years, the event has been a hallmark of student life within the Faculty of Applied Sciences. However, after its most recent edition in 2019, “Sisi Arundathee” has remained discontinued, marking a pause in what was once a highly anticipated annual tradition. Its absence has been strongly felt among students and alumni, further emphasizing its cultural and emotional significance within the university community.
              </p>
            </div>
          </motion.div>

          {/* Right Side: Portal Animation */}
          <div className="flex-1 flex justify-center lg:justify-end items-center relative order-1 lg:order-2 h-[400px] md:h-[500px] w-full lg:pr-[10%]">

            {/* 500px Master Wrapper to guarantee perfect 1:1 pixel sync for the center transition */}
            <div className="relative w-[500px] h-[500px]">

              {/* The Stationary Logo Container (Clipped near the portal's right edge) */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-10"
                animate={{
                  clipPath: [
                    "inset(0px -80px 0px -80px)",  // t=0.00  visible
                    "inset(0px 100px 0px -150px)",  // t=0.13  hide begins
                    "inset(0px 400px 0px -80px)",  // t=0.40  fully hidden
                    "inset(0px 400px 0px -80px)",  // t=0.68  still hidden (extended hold)
                    "inset(0px 80px 0px -120px)",  // t=0.82  reveal ENDS (portal clears right edge)
                    "inset(0px -80px 0px -80px)",  // t=1.00  visible
                  ]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.13, 0.40, 0.68, 0.82, 1.0]
                }}
              >
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <Image
                    src={SisiLogo}
                    alt="Sisi Arundathee Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_20px_rgba(147,197,253,0.8)]"
                  />
                </div>
              </motion.div>

              {/* The Moving Portal */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <motion.div
                  className="relative w-[180px] h-[350px] md:w-[220px] md:h-[450px] rounded-[100%]"
                  animate={{
                    x: [250, -250, 250], // Portal center travels from right edge (+250) to left edge (-250)
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(147,197,253,0.4) 0%, rgba(59,130,246,0.7) 50%, rgba(37,99,235,0.9) 100%)",
                    border: "8px solid #93c5fd",
                    boxShadow: "0 0 80px rgba(59,130,246,0.9), 0 0 20px rgba(255,255,255,0.4), inset 0 0 80px rgba(59,130,246,0.8), inset 0 0 20px rgba(255,255,255,0.5)",
                    filter: "drop-shadow(0 0 30px rgba(59,130,246,0.9))"
                  }}
                >
                  {/* Inner energetic pulse */}
                  <motion.div
                    className="absolute inset-0 rounded-[100%]"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
