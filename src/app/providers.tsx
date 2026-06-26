'use client';

import { ReactNode } from 'react';
import { GuestProvider } from '@/contexts/GuestContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <GuestProvider>
        {children}
        <Toaster position="top-right" richColors />
      </GuestProvider>
    </QueryProvider>
  );
}
