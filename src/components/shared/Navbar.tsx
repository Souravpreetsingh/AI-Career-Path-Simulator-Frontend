'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/GuestContext';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/results', label: 'Results' },
  { href: '/chat', label: 'Assistant' },
  { href: '/profile', label: 'Profile' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    animate(el, { translateY: [-20, 0], opacity: [0, 1], duration: 400, easing: 'easeOutCubic' });
  }, []);

  return (
    <nav ref={navRef} className="bg-surface/60 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-border shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto">
        <Link href="/dashboard" className="font-semibold text-primary tracking-tight text-lg">
          AI Career Path Simulator
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <span key={link.href} className="group">
                <Link
                  href={link.href}
                  className={`relative text-sm transition-colors ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-primary transition-all duration-300 ease-out ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.fullName}</span>
          <button
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg hover:border-primary/50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
