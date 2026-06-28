'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveRobotSpline } from '@/components/blocks/interactive-3d-robot';
import { Button } from '@/components/ui/button';

const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode';

export default function Home() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Left — Robot */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-center relative overflow-hidden [&_.spline-watermark]:hidden [&_canvas+div]:hidden">
        <InteractiveRobotSpline
          scene={ROBOT_SCENE_URL}
          className="w-full h-full"
        />
      </div>

      {/* Right — Content */}
      <div className="flex-1 h-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 relative">
        {/* Decorative glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg mx-auto space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Career Guidance
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Map Your{' '}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Career Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover personalized career paths, analyze your skills, and get AI-driven 
            roadmaps — all without signing up.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => router.push('/dashboard')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-xl text-sm font-medium shadow-lg shadow-primary/20">
              Get Started Free
            </Button>
            <Button onClick={() => router.push('/chat')}
              variant="outline"
              className="h-12 px-8 rounded-xl text-sm font-medium border-border/40 bg-surface-container/50 hover:bg-surface-container">
              Chat with AI
            </Button>
          </div>

          {/* Features row */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { label: 'Career Paths', icon: 'route' },
              { label: 'Skill Analysis', icon: 'insights' },
              { label: 'AI Roadmaps', icon: 'smart_toy' },
            ].map((f) => (
              <div key={f.label}
                className="p-3 rounded-xl bg-surface-container/50 border border-border/20 backdrop-blur-sm text-center hover:bg-surface-container/80 hover:border-primary/20 transition-all">
                <span className="text-xl text-primary material-symbols-outlined block mb-1">{f.icon}</span>
                <p className="text-xs text-muted-foreground font-medium">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
