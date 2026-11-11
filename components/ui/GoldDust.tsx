'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  decay: number;
  gravity: number;
}

interface Props {
  trigger: boolean;
}

export const GoldDust: React.FC<Props> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
        y: window.innerHeight * 0.65,
        vx: (Math.random() - 0.5) * 6,
        vy: -(Math.random() * 8 + 3),
        radius: Math.random() * 4 + 1,
        alpha: 1,
        color: Math.random() > 0.5 ? '#D4AF37' : '#E8CC6A',
        decay: Math.random() * 0.012 + 0.008,
        gravity: 0.12,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        canvas.style.display = 'none';
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (canvas) canvas.style.display = 'none';
    };
  }, [trigger]);

  return <canvas ref={canvasRef} id="gold-dust-canvas" style={{ display: 'none' }} />;
};
