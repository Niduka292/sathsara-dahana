"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 flex justify-between items-center bg-transparent backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <motion.div 
          className="text-white text-xl md:text-2xl font-cinzel tracking-widest hover:text-blue-200 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <Link href="/">( S A )</Link>
        </motion.div>
      </div>

      <div className="hidden lg:flex gap-12 text-[11px] font-medium uppercase tracking-[0.3em] font-cinzel text-white/80">
        <Link href="#acts" className="hover:text-blue-300 transition-colors">THE ACTS</Link>
        <Link href="#artists" className="hover:text-blue-300 transition-colors">ARTISTS</Link>
        <Link href="#countdown" className="hover:text-blue-300 transition-colors">COUNTDOWN</Link>
        <Link href="#venue" className="hover:text-blue-300 transition-colors">VENUE</Link>
        <Link href="#tickets" className="hover:text-blue-300 transition-colors">TICKETS</Link>
      </div>
    </nav>
  );
}