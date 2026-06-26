'use client';

import { ReactNode } from 'react';
import { GuestProvider } from '@/contexts/GuestContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { SiteBackground } from '@/components/SiteBackground';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <GuestProvider>
        <SiteBackground />
        {children}
        <Toaster position="top-right" richColors />
      </GuestProvider>
    </QueryProvider>
  );
}
