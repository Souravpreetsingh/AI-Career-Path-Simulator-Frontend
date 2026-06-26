'use client';

import { useRef } from 'react';
import { useCountUp } from '@/hooks/useAnimatedMount';

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, value, value > 0);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
