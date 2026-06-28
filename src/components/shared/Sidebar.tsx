'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/results', label: 'Career Paths', icon: 'insights' },
  { href: '/chat', label: 'AI Chat', icon: 'smart_toy' },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    animate(el, { translateX: [-60, 0], opacity: [0, 1], duration: 500, easing: 'easeOutCubic', delay: 100 });
  }, []);

  return (
    <aside ref={sidebarRef} className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface-container/60 backdrop-blur-xl border-r border-border py-8 z-40">
      <div className="px-6 mb-8 mt-16">
        <h2 className="text-lg font-semibold text-primary">Career Navigator</h2>
        <p className="text-xs text-muted-foreground uppercase mt-1">AI-Powered Future</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-muted-foreground hover:bg-surface-variant/50 hover:text-foreground'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 mt-auto mb-6">
        <Link
          href="/assessment"
          className="w-full bg-primary-container text-on-primary-container text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium"
        >
          <span>+</span> New Assessment
        </Link>
      </div>
    </aside>
  );
}
