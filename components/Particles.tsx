"use client";

import { useEffect, useRef } from "react";

type Wave = {
  amplitude: number;
  wavelength: number;
  speed: number;
  phase: number;
  verticalOffset: number;
  lineWidth: number;
  opacity: number;
};

const WAVE_COUNT = 4;

export function Particles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let viewWidth = 0;
    let viewHeight = 0;

    const waves: Wave[] = Array.from({ length: WAVE_COUNT }, (_, index) => ({
      amplitude: 18 + index * 6,
      wavelength: 160 + index * 40,
      speed: 0.6 + index * 0.12,
      phase: Math.random() * Math.PI * 2,
      verticalOffset: 0.22 + index * 0.18,
      lineWidth: 1 + index * 0.4,
      opacity: 0.16 + index * 0.09,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      viewWidth = rect.width;
      viewHeight = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = () => {
      ctx.clearRect(0, 0, viewWidth, viewHeight);

      const time = performance.now() / 1000;

      const backdrop = ctx.createLinearGradient(0, 0, 0, viewHeight);
      backdrop.addColorStop(0, "rgba(0, 187, 255, 0.04)");
      backdrop.addColorStop(0.5, "rgba(13, 0, 99, 0)");
      backdrop.addColorStop(1, "rgba(102, 225, 255, 0.05)");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      waves.forEach((wave, waveIndex) => {
        const gradient = ctx.createLinearGradient(0, 0, viewWidth, 0);
        gradient.addColorStop(0, "rgba(0, 187, 255, 0.18)");
        gradient.addColorStop(0.5, "rgba(102, 225, 255, 0.28)");
        gradient.addColorStop(1, "rgba(0, 187, 255, 0.18)");

        ctx.beginPath();
        for (let x = 0; x <= viewWidth; x += 2) {
          const normalizedX = x / wave.wavelength;
          const oscillation = Math.sin(normalizedX + wave.phase + time * wave.speed);
          const y = viewHeight * wave.verticalOffset + oscillation * wave.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = wave.lineWidth;
        ctx.globalAlpha = wave.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;

        waves[waveIndex].phase += 0.002;
      });

      animationFrameId = window.requestAnimationFrame(step);
    };

    const handleResize = () => {
      resize();
    };

    resize();
    animationFrameId = window.requestAnimationFrame(step);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}

export default Particles;
