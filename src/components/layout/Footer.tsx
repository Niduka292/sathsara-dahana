"use client";

import { motion } from "framer-motion";
import { Facebook, MapPin } from "lucide-react";
import Link from "next/link";
import DeveloperCredits from "../developer-credits/DeveloperCredits";

// lucide-react has no TikTok icon, so it is drawn inline
function TikTok({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61591371196907&sfnsn=mo&mibextid=RUbZ1f",
    Icon: Facebook,
  },
  { label: "TikTok", href: "https://www.tiktok.com/@sathsara_dahana", Icon: TikTok },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#02040d] pt-20 pb-8 md:pt-32 md:pb-12 overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-16 mb-12 sm:mb-20">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl md:text-3xl font-cinzel tracking-widest text-white mb-8 block">
              Sathsara <span className="text-blue-400">Dahana</span>
            </Link>
            <p className="text-blue-100/40 text-sm md:text-base leading-relaxed max-w-md mb-8">
              Sathsara Dahana 2026 — where music, movement, and expression come alive.
              <br />
              A celebration of talent, creativity, and moments beyond the ordinary.
            </p>
            <div className="flex gap-6">
              {socialLinks.map(({ label, href, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
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
              {[
                { label: "Introduction", href: "/#introduction" },
                { label: "Timeline", href: "/#timeline" },
                { label: "Results", href: "/results" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-blue-100/40 hover:text-blue-300 transition-colors text-sm uppercase tracking-widest"
                  >
                    {item.label}
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
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.3em] text-blue-100/20 font-cinzel">
            © {new Date().getFullYear()} Sathsara Dahana • Designed with Stardust
          </div>
        </div>
        <DeveloperCredits />
      </div>
    </footer>
  );
}
