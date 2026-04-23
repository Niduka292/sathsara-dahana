"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] 
  w-[98%] max-w-6xl
  px-6 md:px-10 py-4
  flex justify-between items-center 
  rounded-full
  bg-white/5 backdrop-blur-2xl
  border border-white/20
  shadow-[0_0_40px_rgba(59,130,246,0.12)]">

      {/* Left Logo */}
      <motion.div
        className="text-white text-lg md:text-xl font-cinzel tracking-widest cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <Link href="/">Sisi Arundathee</Link>
      </motion.div>

      {/* Center Links */}
      <div className="hidden lg:flex gap-10 text-[11px] uppercase tracking-[0.3em] font-cinzel text-white/70">
        <Link href="#introduction" className="hover:text-blue-300 transition-colors">
          ABOUT
        </Link>
        <Link href="#timeline" className="hover:text-blue-300 transition-colors">
          TIMELINE
        </Link>
        <Link href="#memories" className="hover:text-blue-300 transition-colors">
          GALLERY
        </Link>
        <Link href="#sponsors" className="hover:text-blue-300 transition-colors">
          SPONSORS
        </Link>
      </div>

      {/* Right Glow Accent (optional visual balance) */}
      <div className="hidden md:block w-10 h-10 rounded-full 
    bg-blue-500/20 blur-md animate-pulse" />
    </nav>
  );
}