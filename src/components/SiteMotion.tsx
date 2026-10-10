'use client';

import { useEffect, useLayoutEffect } from 'react';

const THEME_KEY = 'theme';

function readDark() {
  try {
    return localStorage.getItem(THEME_KEY) !== 'light';
  } catch {
    return true;
  }
}

function setTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  } catch {
    /* private mode */
  }
}

export default function SiteMotion() {
  useLayoutEffect(() => {
    setTheme(readDark());
  }, []);

  useEffect(() => {
    const onDoubleClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a, button, input, textarea, select')) return;

      window.getSelection()?.removeAllRanges();

      const nextDark = !document.documentElement.classList.contains('dark');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const x = event.clientX;
      const y = event.clientY;

      if (!document.startViewTransition || reduced) {
        setTheme(nextDark);
        return;
      }

      const transition = document.startViewTransition(() => {
        setTheme(nextDark);
      });

      transition.ready
        .then(() => {
          const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
          );
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${Math.ceil(radius)}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 600,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        })
        .catch(() => {});
    };

    document.addEventListener('dblclick', onDoubleClick);
    return () => document.removeEventListener('dblclick', onDoubleClick);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return undefined;
    }

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();

    const COUNT = 8;
    const DUR = 420;
    const R0 = 7;
    const R1 = 26;
    const LEN = 10;
    const WIDTH = 2;

    type Burst = { x: number; y: number; t0: number; rot: number; color: string };
    let bursts: Burst[] = [];
    let rafId = 0;

    const draw = (now: number) => {
      rafId = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive: Burst[] = [];
      for (const burst of bursts) {
        const progress = (now - burst.t0) / DUR;
        if (progress >= 1) continue;
        alive.push(burst);
        const eased = 1 - (1 - progress) ** 3;
        const radius = R0 + (R1 - R0) * eased;
        const length = LEN * (1 - eased);
        ctx.strokeStyle = burst.color;
        ctx.globalAlpha = 1 - progress * progress;
        ctx.lineWidth = WIDTH * dpr;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < COUNT; i++) {
          const angle = burst.rot + (i / COUNT) * Math.PI * 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          ctx.moveTo((burst.x + cos * radius) * dpr, (burst.y + sin * radius) * dpr);
          ctx.lineTo((burst.x + cos * (radius + length)) * dpr, (burst.y + sin * (radius + length)) * dpr);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      bursts = alive;
      if (bursts.length) rafId = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const spawn = (x: number, y: number) => {
      bursts.push({
        x,
        y,
        t0: performance.now(),
        rot: Math.random() * Math.PI,
        color: getComputedStyle(document.body).color || '#000',
      });
      if (!rafId) rafId = requestAnimationFrame(draw);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      spawn(event.clientX, event.clientY);
    };

    window.addEventListener('resize', resize);
    document.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('pointerdown', onPointerDown);
      if (rafId) cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);

  return null;
}
