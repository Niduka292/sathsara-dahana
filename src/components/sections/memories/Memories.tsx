"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import sisi1 from "../../../../assets/sisi-1.jpg";
import sisi2 from "../../../../assets/sisi-2.jpg";
import sisi3 from "../../../../assets/sisi-3.jpg";
import sisi4 from "../../../../assets/sisi-4.jpg";
import sisi5 from "../../../../assets/sisi-5.jpg";

interface MemoryItem {
  id: string;
  imageUrl: string;
}

const memories: MemoryItem[] = [
  {
    id: "m1",
    imageUrl: sisi1.src,
  },
  {
    id: "m2",
    imageUrl: sisi2.src,
  },
  {
    id: "m3",
    imageUrl: sisi3.src,
  },
  {
    id: "m4",
    imageUrl: sisi4.src,
  },
  {
    id: "m5",
    imageUrl: sisi5.src,
  },
];

export default function Memories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (isHovered) return;

    const intervalId = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [handleNext, isHovered]);

  const getPositionStyles = (index: number) => {
    const total = memories.length;
    // Calculate relative index ensuring positive modulo
    let relativeIndex = (index - currentIndex) % total;
    if (relativeIndex < 0) {
      relativeIndex += total;
    }

    if (relativeIndex === 0) {
      // Center
      return {
        zIndex: 30,
        x: "0%",
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
      };
    } else if (relativeIndex === 1 || relativeIndex === total - 1) {
      // Immediate Left or Right
      const isRight = relativeIndex === 1;
      return {
        zIndex: 20,
        x: isRight ? "40%" : "-40%",
        scale: 0.8,
        opacity: 0.4,
        filter: "blur(2px)",
      };
    } else {
      // Hidden behind
      const isRight = relativeIndex > total / 2;
      return {
        zIndex: 10,
        x: isRight ? "60%" : "-60%",
        scale: 0.6,
        opacity: 0,
        filter: "blur(4px)",
      };
    }
  };

  return (
    <section id="memories" className="relative w-full py-20 md:py-32 bg-[#000511] overflow-hidden flex flex-col items-center justify-center min-h-[600px] md:min-h-[800px]">
      {/* Background Starfield effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZyBmaWxsPSIjMWQ0ZWQ4IiBmaWxsLW9wYWNpdHk9IjAuNCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgLz48Y2lyY2xlIGN4PSIzODAiIGN5PSI4MCIgcj0iMS41IiAvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjMyMCIgcj0iMSIgLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSIyNTAigcj0iMS41IiAvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjkwIiByPSIwLjUiIC8+PC9nPjwvc3ZnPg==')] opacity-30" />
      </div>

      <div className="text-center mb-12 md:mb-16 relative z-10 px-6">
        <h2 className="text-3xl md:text-5xl font-bold font-cinzel text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-4">
          Echoes of the Past
        </h2>
        <p className="text-blue-200/60 font-serif italic text-base md:text-lg">
          Moments captured in the flow of time
        </p>
      </div>

      <div
        className="relative w-full max-w-6xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-12 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full border border-cyan-500/30 bg-[#000511]/80 backdrop-blur-sm flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 md:right-12 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full border border-cyan-500/30 bg-[#000511]/80 backdrop-blur-sm flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>

        {/* Carousel Cards */}
        <div className="relative w-[260px] h-[380px] md:w-[400px] md:h-[550px] flex justify-center items-center perspective-[1000px]">
          <AnimatePresence initial={false}>
            {memories.map((memory, index) => {
              const styles = getPositionStyles(index);

              return (
                <motion.div
                  key={memory.id}
                  className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden border-2 cursor-pointer shadow-2xl"
                  initial={false}
                  animate={{
                    x: styles.x,
                    scale: styles.scale,
                    opacity: styles.opacity,
                    zIndex: styles.zIndex,
                    filter: styles.filter,
                    borderColor: index === currentIndex ? "rgba(6, 182, 212, 0.6)" : "rgba(30, 58, 138, 0.3)",
                    boxShadow: index === currentIndex
                      ? "0 0 40px rgba(6, 182, 212, 0.2), 0 0 10px rgba(6, 182, 212, 0.5) inset"
                      : "0 0 20px rgba(0, 0, 0, 0.8)",
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="relative w-full h-full">
                    {/* Background Image */}
                    <img
                      src={memory.imageUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Dark gradient overlay for bottom text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000511] via-[#000511]/40 to-transparent opacity-90" />

                    {/* Card Content */}
                    <div
                      className="absolute bottom-0 left-0 w-full p-8 transition-opacity duration-300"
                      style={{ opacity: index === currentIndex ? 1 : 0 }}
                    >
                      {/* Underline decorative element matching design */}
                      <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
