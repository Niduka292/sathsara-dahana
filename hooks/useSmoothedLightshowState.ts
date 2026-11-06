"use client";

import { useEffect, useRef, useState } from "react";
import type { LightshowState } from "@/lib/lightshow/types";

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export function useSmoothedLightshowState(state: LightshowState) {
  const targetRef = useRef(state);
  const [display, setDisplay] = useState(state);

  useEffect(() => {
    targetRef.current = state;
  }, [state]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const target = targetRef.current;
      const rising = 0.96;
      const falling = 0.84;

      setDisplay((current) => {
        const targetLeft = target.leftEnergy ?? target.energy;
        const targetRight = target.rightEnergy ?? target.energy;
        const currentLeft = current.leftEnergy ?? current.energy;
        const currentRight = current.rightEnergy ?? current.energy;

        return {
          ...target,
          energy: lerp(
            current.energy,
            target.energy,
            target.energy >= current.energy ? rising : falling,
          ),
          bassEnergy: lerp(
            current.bassEnergy,
            target.bassEnergy,
            target.bassEnergy >= current.bassEnergy ? rising : falling,
          ),
          leftEnergy: lerp(
            currentLeft,
            targetLeft,
            targetLeft >= currentLeft ? rising : falling,
          ),
          rightEnergy: lerp(
            currentRight,
            targetRight,
            targetRight >= currentRight ? rising : falling,
          ),
          beat: false,
          effect: target.effect,
          design: target.design,
          active: target.active,
          updatedAt: target.updatedAt,
        };
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return display;
}
