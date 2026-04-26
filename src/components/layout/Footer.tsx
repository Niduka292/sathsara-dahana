"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#02040d] pt-32 pb-12 overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl md:text-3xl font-cinzel tracking-widest text-white mb-8 block">
              Sisi <span className="text-blue-400">Arundathee</span>
            </Link>
            <p className="text-blue-100/40 text-sm md:text-base leading-relaxed max-w-md mb-8">
              A celestial journey through the evolution of sound. Join us as we explore the melodies that define our past and shape our future.
            </p>
            <div className="flex gap-6">
              {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-blue-400 hover:border-blue-400/50 transition-all bg-white/5"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-cinzel tracking-widest text-xs uppercase mb-8 opacity-60">Navigation</h4>
            <ul className="space-y-4">
              {["Introduction", "Timeline","Sponsors", "Team"].map((item) => (
                <li key={item}>
                  <Link 
                    href={`#${item.toLowerCase()}`} 
                    className="text-blue-100/40 hover:text-blue-300 transition-colors text-sm uppercase tracking-widest"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-cinzel tracking-widest text-xs uppercase mb-8 opacity-60">The Portal</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-blue-100/40">
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <span className="text-sm">Faculty of Applied Sciences,<br/>University of Sri Jayewardenepura</span>
              </li>
              <li className="flex items-center gap-4 text-blue-100/40">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span className="text-sm">+94 11 234 5678</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-blue-100/20 font-cinzel">
            © {new Date().getFullYear()} Sisi Arundathee • Designed with Stardust
          </div>
          
          <div className="flex gap-8 text-[10px] md:text-xs uppercase tracking-[0.3em] text-blue-100/20 font-cinzel">
            <a href="#" className="hover:text-blue-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-300 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
