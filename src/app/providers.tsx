'use client';

import { ReactNode } from 'react';
import { GuestProvider } from '@/contexts/GuestContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import SpotlightBackground from '@/components/ui/spotlight-background';
import { FloatingParticles } from '@/components/ui/floating-particles';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <GuestProvider>
        <SpotlightBackground>
          <FloatingParticles />
          {children}
          <Toaster position="top-right" richColors />
        </SpotlightBackground>
      </GuestProvider>
    </QueryProvider>
  );
}
