"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Close menu when clicking a link
  const closeMenu = () => setIsOpen(false);

  // Scroll Spy and Navbar Background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["introduction", "timeline", "memories", "sponsors"];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
      else if (window.scrollY < 100) setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "ABOUT", href: "#introduction", id: "introduction" },
    { name: "TIMELINE", href: "#timeline", id: "timeline" },
    { name: "GALLERY", href: "#memories", id: "memories" },
    { name: "SPONSORS", href: "#sponsors", id: "sponsors" },
  ];

  return (
    <>
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] 
    w-[92%] md:w-[98%] max-w-6xl
    px-6 md:px-10 py-4
    flex justify-between items-center 
    rounded-full transition-all duration-500
    ${scrolled ? "bg-black/40 border-white/20 py-3" : "bg-white/5 border-white/10"}
    backdrop-blur-2xl
    border 
    shadow-[0_0_40px_rgba(59,130,246,0.12)]`}>

        {/* Left Logo */}
        <motion.div
          className="text-white text-lg md:text-xl font-cinzel tracking-widest cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <Link href="/">Sisi <span className="text-blue-400">Arundathee</span></Link>
        </motion.div>

        {/* Center Links (Desktop) */}
        <div className="hidden lg:flex gap-10 text-[11px] uppercase tracking-[0.3em] font-cinzel">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-all duration-300 relative group ${activeSection === link.id ? "text-blue-400" : "text-white/70 hover:text-white"}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-[1px] bg-blue-400 transition-all duration-300 ${activeSection === link.id ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </div>

        {/* Right Glow Accent / Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-10 h-10 rounded-full 
      bg-blue-500/20 blur-md animate-pulse" />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-[#000511]/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="text-2xl font-cinzel tracking-[0.3em] text-white/80 hover:text-blue-400 transition-colors block py-2"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Decorative background element for mobile menu */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}