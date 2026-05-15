"use client";

import { useEffect, useRef } from "react";

type ParticleType = "rect" | "leaf";

interface Particle {
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
  swayPhase: number;
  swayAmp: number;
}

const COLORS = ["#E0A800", "#F5C518", "#A0522D", "#B97049", "#E25822", "#8B5A2B"];
const SPAWN_INTERVAL_MS = 350;
const MAX_PARTICLES = 60;
const LEAF_RATIO = 0.3;

const leafImg = new Image();
leafImg.src = "/maple-leaf.svg";

export default function PodiumConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      cssW = parent.clientWidth;
      cssH = parent.clientHeight;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const particles: Particle[] = [];

    const makeParticle = (isLeaf: boolean): Particle => {
      const size = isLeaf ? 16 + Math.random() * 10 : 4 + Math.random() * 3;
      return {
        type: isLeaf ? "leaf" : "rect",
        x: Math.random() * cssW,
        y: -20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: isLeaf ? 0.2 + Math.random() * 0.3 : 0.35 + Math.random() * 0.55,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * (isLeaf ? 0.025 : 0.06),
        size,
        w: size,
        h: isLeaf ? size : 9 + Math.random() * 9,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: isLeaf ? 0.65 + Math.random() * 0.25 : 0.85 + Math.random() * 0.15,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: isLeaf ? 0.45 + Math.random() * 0.55 : 0.2 + Math.random() * 0.4,
      };
    };

    const drawParticle = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      if (p.type === "leaf" && leafImg.complete && leafImg.naturalWidth > 0) {
        ctx.drawImage(leafImg, -p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    };

    if (reduceMotion) {
      for (let i = 0; i < 16; i++) {
        const p = makeParticle(i % 3 === 0);
        p.x = Math.random() * cssW;
        p.y = Math.random() * cssH;
        p.vx = 0; p.vy = 0; p.rotationSpeed = 0; p.swayAmp = 0;
        p.alpha = 0.6;
        particles.push(p);
      }
      const drawStatic = () => {
        ctx.clearRect(0, 0, cssW, cssH);
        for (const p of particles) drawParticle(p);
      };
      if (leafImg.complete) drawStatic();
      else leafImg.onload = drawStatic;
      return () => ro.disconnect();
    }

    let lastSpawn = performance.now();
    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min(3, (now - lastTime) / 16.67);
      lastTime = now;
      ctx.clearRect(0, 0, cssW, cssH);

      if (now - lastSpawn > SPAWN_INTERVAL_MS && particles.length < MAX_PARTICLES) {
        particles.push(makeParticle(Math.random() < LEAF_RATIO));
        lastSpawn = now;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.003 * dt;
        p.x += (p.vx + Math.sin(now / 700 + p.swayPhase) * p.swayAmp) * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        if (p.y > cssH + 24) { particles.splice(i, 1); continue; }
        drawParticle(p);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
}
