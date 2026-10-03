"use client";

import { motion } from "framer-motion";
import TimeAstrolabe from "./TimeAstrolabe";

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
              <span className="text-[11px] uppercase tracking-[0.4em] text-[#a78bfa] font-bold font-cinzel text-glow-violet">Where Time Tells a Story</span>
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
                {`At its heart, Sathsara Dahana is an occasion where 2nd and 3rd year undergraduates take the stage to welcome the newest members of the faculty, the 1st year freshers, through an evening of music, dance, drama, and orchestral performances. It marks the beginning of a new chapter of university life through a shared celebration of art and creativity.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`The event brings together diverse artistic traditions, including Sinhala, Tamil, English, Western, and traditional Sri Lankan influences. Each performance reflects the creativity and dedication of students who step beyond their academic disciplines to express themselves through art. This year's edition introduces a carefully crafted theme that gives the evening its own identity, bringing together music, movement, emotion, and imagination.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {`More than a cultural showcase, Sathsara Dahana reflects the spirit of the Faculty of Applied Sciences, providing students with a platform to explore their talents, collaborate creatively, and create lasting memories. Sathsara Dahana 2026 invites the University of Sri Jayewardenepura community to experience an evening celebrating art, creativity, connection, and new beginnings.`}
              </motion.p>
            </div>
          </motion.div>

          {/* Right Side: Time machine astrolabe (above the text on phones and tablets) */}
          <div className="flex flex-1 justify-center lg:justify-end items-center relative order-1 lg:order-2 w-full py-4 lg:py-0 lg:h-[500px] xl:pr-[10%]">
            <TimeAstrolabe />
          </div>

        </div>
      </div>
    </section>
  );
}