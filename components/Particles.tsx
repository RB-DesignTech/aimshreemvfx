"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  hue: number;
};

const PARTICLE_COUNT = 140;

export function Particles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    let viewWidth = 0;
    let viewHeight = 0;

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

    const spawnParticle = (): Particle => {
      const hue = 25 + Math.random() * 20;
      return {
        x: Math.random() * (viewWidth || 1),
        y: Math.random() * (viewHeight || 1),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.8 + 0.6,
        life: Math.random() * 200 + 80,
        hue,
      };
    };

    const ensureParticles = () => {
      while (particles.length < PARTICLE_COUNT) {
        particles.push(spawnParticle());
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, viewWidth, viewHeight);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;
        particle.vx += Math.sin(performance.now() / 1000 + index) * 0.002;
        particle.vy += Math.cos(performance.now() / 1100 + index) * 0.002;

        if (particle.life <= 0 || particle.x < 0 || particle.y < 0 || particle.x > viewWidth || particle.y > viewHeight) {
          particles[index] = spawnParticle();
          return;
        }

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 12
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 65%, 0.9)`);
        gradient.addColorStop(0.5, `hsla(${particle.hue + 15}, 100%, 55%, 0.35)`);
        gradient.addColorStop(1, "rgba(10, 10, 30, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);
        ctx.fill();
      });

      ensureParticles();
      animationFrameId = window.requestAnimationFrame(step);
    };

    const handleResize = () => {
      resize();
    };

    resize();
    ensureParticles();
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
