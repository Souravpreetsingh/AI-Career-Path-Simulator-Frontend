'use client';

import { cn } from '@/lib/utils';

export function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={cn(
          'absolute inset-0',
          '[--white-gradient:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)]',
          '[--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)]',
          '[--aurora:repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)]',
          '[background-image:var(--white-gradient),var(--aurora)]',
          'dark:[background-image:var(--dark-gradient),var(--aurora)]',
          '[background-size:300%,_200%]',
          '[background-position:50%_50%,50%_50%]',
          'filter blur-[10px] invert dark:invert-0',
          "after:content-[''] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]",
          'after:dark:[background-image:var(--dark-gradient),var(--aurora)]',
          'after:[background-size:200%,_100%]',
          'after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference',
          'opacity-50 will-change-transform',
          '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]',
        )}
      />
    </div>
  );
}
