'use client';

import { ReactNode } from 'react';
import { usePageEnter } from '@/hooks/useAnimatedMount';

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const ref = usePageEnter();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
