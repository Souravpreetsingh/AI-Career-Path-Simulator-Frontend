'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  opacity: number;
  el: HTMLDivElement;
}

export function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  const createParticle = useCallback((container: HTMLDivElement): Particle | null => {
    const size = Math.random() * 3 + 1;
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(168, 85, 247, 0.15);
      pointer-events: none;
    `;
    container.appendChild(el);

    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      el,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = Math.min(30, Math.floor(window.innerWidth / 40));
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const p = createParticle(container);
      if (p) particles.push(p);
    }
    particlesRef.current = particles;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16, 3);
      lastTime = time;

      for (const p of particles) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;

        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;

        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        p.el.style.opacity = String(p.opacity * (0.7 + 0.3 * Math.sin(time * 0.001 + p.x)));
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      for (const p of particles) {
        p.el.remove();
      }
      particlesRef.current = [];
    };
  }, [createParticle]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />;
}
