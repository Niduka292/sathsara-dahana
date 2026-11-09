"use client";

import { useEffect, useRef } from "react";
import { applyDesignCssVariables, interpolateDesignPalette } from "@/lib/lightshow/design";
import { DESIGN_PALETTES, type LightshowDesign } from "@/lib/lightshow/types";

interface ShowBackgroundProps {
  design: LightshowDesign;
  energy: number;
  reducedMotion: boolean;
  active: boolean;
  hexBloomColor?: string;
}

export default function ShowBackground({
  design,
  energy,
  reducedMotion,
  active,
  hexBloomColor,
}: ShowBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousDesignRef = useRef(design);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fromDesign = previousDesignRef.current;
    const toDesign = design;

    const getPalette = (d: LightshowDesign) => {
      const p = { ...DESIGN_PALETTES[d] };
      if (d === "grid" && hexBloomColor) {
        p.primary = hexBloomColor;
      }
      return p;
    };

    if (fromDesign === toDesign) {
      applyDesignCssVariables(container, getPalette(toDesign));
      return;
    }

    const start = performance.now();
    const duration = reducedMotion ? 500 : 280;
    let frame = 0;

    const animate = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - start) / duration);
      const baseInterpolated = interpolateDesignPalette(fromDesign, toDesign, progress);
      if (toDesign === "grid" && hexBloomColor) {
        baseInterpolated.primary = hexBloomColor;
      }
      applyDesignCssVariables(container, baseInterpolated);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        previousDesignRef.current = toDesign;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [design, hexBloomColor, reducedMotion]);

  const wash = active ? Math.min(0.22, energy / 400) : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: active ? "var(--show-background, #000000)" : "#000000",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${wash}) 0%, transparent 70%)`,
          opacity: wash > 0 ? 1 : 0,
          transition: reducedMotion ? "opacity 300ms ease" : "opacity 40ms linear",
        }}
      />
    </div>
  );
}
