"use client";

import React, { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  angle: number;
  distance: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

export const VortexBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 200;
    let width: number;
    let height: number;
    let centerX: number;
    let centerY: number;

    const colors = [
      '#ffffff', // Star Light White
      '#a5f3fc', // Star Light Cyan
      '#7dd3fc', // Sky Blue
      '#e0f2fe', // Very light blue
      '#fbbf24', // Gold
      '#fcd34d', // Light Gold
      '#a78bfa', // Violet
      '#c4b5fd', // Light Violet
    ];

    const initParticle = (p?: Partial<Particle>): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      return {
        x: 0,
        y: 0,
        angle: angle,
        distance: p?.distance ?? Math.random() * maxDist,
        speed: 0.5 + Math.random() * 2,
        size: 0.5 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.2 + Math.random() * 0.6,
        ...p,
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      centerX = width / 2;
      centerY = height / 2;

      particles = Array.from({ length: particleCount }, () => initParticle());
    };

    window.addEventListener('resize', resize);
    resize();

    let lastTime = 0;

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 16.67; // Normalized to 60fps
      lastTime = time;

      // Motion trails with Deep Space color
      ctx.fillStyle = 'rgba(2, 4, 13, 0.15)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p, i) => {
        // Spiral movement
        p.distance -= p.speed * deltaTime;
        p.angle += 0.005 * deltaTime;

        // Convert radial to cartesian
        p.x = centerX + Math.cos(p.angle) * p.distance;
        p.y = centerY + Math.sin(p.angle) * p.distance;

        // Rebirth when reaching center
        if (p.distance < 10) {
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
          particles[i] = initParticle({ distance: maxDist });
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * (1 - p.distance / (Math.sqrt(centerX * centerX + centerY * centerY)));
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className="fixed inset-0 bg-[#02040d]" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default VortexBackground;
