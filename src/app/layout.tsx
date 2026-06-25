import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'AI Career Path Simulator',
  description: 'Discover your future career with AI-powered analysis and personalized roadmaps.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} font-sans bg-background text-on-background antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
