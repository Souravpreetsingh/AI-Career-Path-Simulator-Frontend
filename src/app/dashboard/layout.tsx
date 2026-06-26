'use client';

import { ReactNode } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Sidebar } from '@/components/shared/Sidebar';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-20 pb-8 px-4 md:px-8 max-w-[1280px] relative">
        {children}
      </main>
    </div>
  );
}
