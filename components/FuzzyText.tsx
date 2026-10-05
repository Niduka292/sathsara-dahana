"use client";

import React, { useEffect, useRef } from 'react';

interface FuzzyTextProps {
  children: React.ReactNode;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  fuzzRange?: number;
  fps?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  transitionDuration?: number;
  clickEffect?: boolean;
  glitchMode?: boolean;
  glitchInterval?: number;
  glitchDuration?: number;
  gradient?: string[] | null;
  letterSpacing?: number;
  className?: string;
}

const FuzzyText: React.FC<FuzzyTextProps> = ({
  children,
  fontSize,
  fontWeight = 900,
  fontFamily = 'inherit',
  color = '#ffffff',
  enableHover = true,
  baseIntensity = 0.15,
  hoverIntensity = 0.45,
  fuzzRange = 20,
  fps = 60,
  direction = 'horizontal',
  transitionDuration = 0.2,
  clickEffect = true,
  glitchMode = true,
  glitchInterval = 3000,
  glitchDuration = 250,
  gradient = ['#ffffff', '#f0f9ff', '#93c5fd'],
  letterSpacing = 0,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let isCancelled = false;
    let glitchTimeoutId: ReturnType<typeof setTimeout>;
    let glitchEndTimeoutId: ReturnType<typeof setTimeout>;
    let clickTimeoutId: ReturnType<typeof setTimeout>;

    const init = async () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Determine container / parent style for responsive font sizing
      const parent = canvas.parentElement;
      const computedStyle = window.getComputedStyle(parent || canvas);
      const computedFontFamily =
        fontFamily !== 'inherit'
          ? fontFamily
          : computedStyle.fontFamily || 'Cinzel, sans-serif';
      const computedFontWeight = fontWeight || computedStyle.fontWeight || '900';

      // 2. Parse numeric font size safely (never pass clamp/calc strings directly to ctx.font)
      let numericFontSize: number;
      if (typeof fontSize === 'number') {
        numericFontSize = fontSize;
      } else if (typeof fontSize === 'string' && /^\d+(\.\d+)?px$/.test(fontSize)) {
        numericFontSize = parseFloat(fontSize);
      } else {
        // Measure from computed style of container
        const parentFontSize = parseFloat(computedStyle.fontSize);
        if (!isNaN(parentFontSize) && parentFontSize > 0) {
          numericFontSize = parentFontSize;
        } else {
          // Fallback measurement element
          const temp = document.createElement('span');
          temp.style.fontSize = typeof fontSize === 'string' ? fontSize : '3rem';
          temp.style.visibility = 'hidden';
          temp.style.position = 'absolute';
          document.body.appendChild(temp);
          numericFontSize = parseFloat(window.getComputedStyle(temp).fontSize) || 48;
          document.body.removeChild(temp);
        }
      }

      numericFontSize = Math.max(numericFontSize, 16);
      const fontString = `${computedFontWeight} ${numericFontSize}px ${computedFontFamily}`;

      try {
        await document.fonts.load(fontString);
      } catch {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const text = React.Children.toArray(children).join('');
      if (!text) return;

      // Offscreen canvas for rendering clean text
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = fontString;
      offCtx.textBaseline = 'alphabetic';

      // Calculate width and metrics
      let totalWidth = 0;
      if (letterSpacing !== 0) {
        for (const char of text) {
          totalWidth += offCtx.measureText(char).width + letterSpacing;
        }
        totalWidth -= letterSpacing;
      } else {
        totalWidth = offCtx.measureText(text).width;
      }

      const metrics = offCtx.measureText(text);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = letterSpacing !== 0 ? totalWidth : (metrics.actualBoundingBoxRight ?? metrics.width);
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.25;

      const textBoundingWidth = Math.ceil(letterSpacing !== 0 ? totalWidth : actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 12;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      const xOffset = extraWidthBuffer / 2;
      offCtx.font = fontString;
      offCtx.textBaseline = 'alphabetic';

      if (gradient && Array.isArray(gradient) && gradient.length >= 2) {
        const grad = offCtx.createLinearGradient(0, 0, 0, tightHeight);
        gradient.forEach((c, i) => grad.addColorStop(i / (gradient.length - 1), c));
        offCtx.fillStyle = grad;
      } else {
        offCtx.fillStyle = color;
      }

      if (letterSpacing !== 0) {
        let xPos = xOffset;
        for (const char of text) {
          offCtx.fillText(char, xPos, actualAscent);
          xPos += offCtx.measureText(char).width + letterSpacing;
        }
      } else {
        offCtx.fillText(text, xOffset - actualLeft, actualAscent);
      }

      const effectiveFuzz = Math.min(fuzzRange, Math.max(4, numericFontSize * 0.2));
      const horizontalMargin = effectiveFuzz + 16;
      const verticalMargin = direction === 'vertical' || direction === 'both' ? effectiveFuzz + 8 : 4;

      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight + verticalMargin * 2;

      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveTop = verticalMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;
      let isClicking = false;
      let isGlitching = false;
      let currentIntensity = baseIntensity;
      let targetIntensity = baseIntensity;
      let lastFrameTime = 0;
      const frameDuration = 1000 / fps;

      const startGlitchLoop = () => {
        if (!glitchMode || isCancelled) return;
        glitchTimeoutId = setTimeout(() => {
          if (isCancelled) return;
          isGlitching = true;
          glitchEndTimeoutId = setTimeout(() => {
            isGlitching = false;
            startGlitchLoop();
          }, glitchDuration);
        }, glitchInterval);
      };

      if (glitchMode) startGlitchLoop();

      const run = (timestamp: number) => {
        if (isCancelled) return;

        if (timestamp - lastFrameTime < frameDuration) {
          animationFrameId = window.requestAnimationFrame(run);
          return;
        }
        lastFrameTime = timestamp;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(horizontalMargin, verticalMargin);

        if (isClicking || isGlitching) {
          targetIntensity = 1;
        } else if (isHovering) {
          targetIntensity = hoverIntensity;
        } else {
          targetIntensity = baseIntensity;
        }

        if (transitionDuration > 0) {
          const step = 1 / ((transitionDuration * 1000) / frameDuration);
          if (currentIntensity < targetIntensity) {
            currentIntensity = Math.min(currentIntensity + step, targetIntensity);
          } else if (currentIntensity > targetIntensity) {
            currentIntensity = Math.max(currentIntensity - step, targetIntensity);
          }
        } else {
          currentIntensity = targetIntensity;
        }

        for (let j = 0; j < tightHeight; j++) {
          let dx = 0;
          let dy = 0;
          if (direction === 'horizontal' || direction === 'both') {
            dx = Math.floor(currentIntensity * (Math.random() - 0.5) * effectiveFuzz);
          }
          if (direction === 'vertical' || direction === 'both') {
            dy = Math.floor(currentIntensity * (Math.random() - 0.5) * effectiveFuzz * 0.5);
          }
          ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j + dy, offscreenWidth, 1);
        }

        ctx.restore();
        animationFrameId = window.requestAnimationFrame(run);
      };

      animationFrameId = window.requestAnimationFrame(run);

      const isInsideTextArea = (x: number, y: number) =>
        x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        isHovering = isInsideTextArea(x, y);
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      const handleClick = () => {
        if (!clickEffect) return;
        isClicking = true;
        clearTimeout(clickTimeoutId);
        clickTimeoutId = setTimeout(() => {
          isClicking = false;
        }, 200);
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (!enableHover && !clickEffect) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        if (!touch) return;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        isHovering = isInsideTextArea(x, y);
        if (clickEffect) handleClick();
      };

      const handleTouchEnd = () => {
        isHovering = false;
      };

      if (enableHover) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
        canvas.addEventListener('touchend', handleTouchEnd);
      }

      if (clickEffect) {
        canvas.addEventListener('click', handleClick);
      }

      return () => {
        window.cancelAnimationFrame(animationFrameId);
        clearTimeout(glitchTimeoutId);
        clearTimeout(glitchEndTimeoutId);
        clearTimeout(clickTimeoutId);
        if (enableHover) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('touchend', handleTouchEnd);
        }
        if (clickEffect) {
          canvas.removeEventListener('click', handleClick);
        }
      };
    };

    let cleanupFn: (() => void) | undefined;
    init().then((cleanup) => {
      cleanupFn = cleanup;
    });

    const handleResize = () => {
      if (cleanupFn) cleanupFn();
      init().then((cleanup) => {
        cleanupFn = cleanup;
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (cleanupFn) cleanupFn();
    };
  }, [
    children,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    enableHover,
    baseIntensity,
    hoverIntensity,
    fuzzRange,
    fps,
    direction,
    transitionDuration,
    clickEffect,
    glitchMode,
    glitchInterval,
    glitchDuration,
    gradient,
    letterSpacing
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`inline-block max-w-full h-auto align-middle select-none pointer-events-auto ${className}`}
    />
  );
};

export default FuzzyText;
