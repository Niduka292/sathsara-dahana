"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function StarCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const mousePos = useRef({ x: -100, y: -100 });
  const animatedPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const lastParticleTime = useRef(0);

  // Detect desktop (hover + fine pointer) and reduced motion
  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsDesktop(hoverQuery.matches);
    setPrefersReducedMotion(motionQuery.matches);

    const handleHover = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    const handleMotion = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    hoverQuery.addEventListener("change", handleHover);
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      hoverQuery.removeEventListener("change", handleHover);
      motionQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  // Toggle cursor:none class on body
  useEffect(() => {
    if (isDesktop && !prefersReducedMotion) {
      document.body.classList.add("star-cursor-active");
    } else {
      document.body.classList.remove("star-cursor-active");
    }
    return () => {
      document.body.classList.remove("star-cursor-active");
    };
  }, [isDesktop, prefersReducedMotion]);

  // Spawn a trail particle at (x, y)
  const spawnParticle = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return;

    const particle = document.createElement("span");
    const size = 3 + Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 30;
    const driftY = (Math.random() - 0.5) * 30;

    // Randomly pick a color from the palette
    const colors = [
      "rgba(255,255,255,0.9)",
      "rgba(165,243,252,0.8)",
      "rgba(251,191,36,0.7)",
      "rgba(167,139,250,0.7)",
      "rgba(125,211,252,0.8)",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.className = "star-particle";
    particle.style.cssText = `
      position: fixed;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      z-index: 9998;
      --drift-x: ${driftX}px;
      --drift-y: ${driftY}px;
    `;

    container.appendChild(particle);

    // Remove after animation completes
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 600);
  }, []);

  // Track mouse position and create particles
  useEffect(() => {
    if (!isDesktop || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Spawn particles at a throttled rate (~every 30ms)
      const now = Date.now();
      if (now - lastParticleTime.current > 30) {
        spawnParticle(e.clientX, e.clientY);
        lastParticleTime.current = now;
      }
    };

    // Smooth follow animation for the main dot
    const animate = () => {
      const lerp = 0.15;
      animatedPos.current.x +=
        (mousePos.current.x - animatedPos.current.x) * lerp;
      animatedPos.current.y +=
        (mousePos.current.y - animatedPos.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${animatedPos.current.x - 5}px, ${animatedPos.current.y - 5}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isDesktop, prefersReducedMotion, spawnParticle]);

  // Don't render on touch/mobile or reduced motion
  if (!isDesktop || prefersReducedMotion) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <div className="w-[10px] h-[10px] rounded-full bg-gradient-to-br from-white via-blue-200 to-blue-400 shadow-[0_0_12px_rgba(147,197,253,0.8),0_0_24px_rgba(59,130,246,0.5)]" />
      </div>

      {/* Particle container */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden"
        style={{ willChange: "contents" }}
      />
    </>
  );
}
