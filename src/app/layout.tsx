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
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        <Providers>
          <main className="w-screen h-screen overflow-hidden">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
