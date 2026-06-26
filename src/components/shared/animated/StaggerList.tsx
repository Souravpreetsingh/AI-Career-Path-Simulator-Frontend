'use client';

import { ReactNode } from 'react';
import { useStaggerChildren } from '@/hooks/useAnimatedMount';

export function StaggerList({
  selector = '> *',
  stagger = 100,
  delay = 80,
  className,
  children,
}: {
  selector?: string;
  stagger?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useStaggerChildren(selector, { stagger, delay });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
