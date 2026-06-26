'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as anime from 'animejs';

export function usePageEnter(delay = 80) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    anime.utils.set(el, { opacity: 0, translateY: 20 });
    anime.animate(el, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: 'easeOutCubic',
      delay,
    });
  }, [delay]);

  return ref;
}

export function useStaggerChildren(
  selector: string,
  options?: { stagger?: number; delay?: number; from?: 'start' | 'end' | 'center' },
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const play = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll(selector);
    if (items.length === 0) return;

    items.forEach((el, i) => {
      const elHtml = el as HTMLElement;
      elHtml.style.opacity = '0';
      elHtml.style.transform = 'translateY(12px)';
      const timeout = setTimeout(() => {
        elHtml.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
        elHtml.style.opacity = '1';
        elHtml.style.transform = 'translateY(0)';
      }, (options?.delay ?? 80) + i * (options?.stagger ?? 100));
      // store timeout for cleanup
      (elHtml as any)._animTimeout = timeout;
    });
  }, [selector, options?.stagger, options?.delay, options?.from]);

  useEffect(() => {
    play();
    return () => {
      if (containerRef.current) {
        containerRef.current.querySelectorAll(selector).forEach((el) => {
          clearTimeout((el as any)._animTimeout);
        });
      }
    };
  }, [play]);

  return containerRef;
}

export function useCountUp(ref: React.RefObject<HTMLElement | null>, target: number, enabled = true) {
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    anime.animate(el, {
      innerHTML: [0, target],
      duration: 1000,
      easing: 'easeOutCubic',
      round: 1,
    });
  }, [ref, target, enabled]);
}
