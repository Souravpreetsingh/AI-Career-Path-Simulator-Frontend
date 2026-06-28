'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveRobotSpline } from '@/components/blocks/interactive-3d-robot';
import { Button } from '@/components/ui/button';

const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode';

export default function Home() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <InteractiveRobotSpline
        scene={ROBOT_SCENE_URL}
        className="absolute inset-0 z-0"
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="h-full flex flex-col items-center justify-center text-center px-4 md:px-8">
          <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs text-white/80 font-medium pointer-events-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Career Guidance
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg leading-tight">
              Map Your{' '}
              <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Career Future
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 drop-shadow-md max-w-lg mx-auto leading-relaxed">
              Discover personalized career paths, analyze your skills, and get AI-driven roadmaps — all without signing up.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto pt-2">
              <Button onClick={() => router.push('/dashboard')}
                className="bg-white text-black hover:bg-white/90 h-12 px-8 rounded-xl text-sm font-medium shadow-lg">
                Get Started Free
              </Button>
              <Button onClick={() => router.push('/chat')}
                variant="outline"
                className="h-12 px-8 rounded-xl text-sm font-medium border-white/25 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
                Chat with AI
              </Button>
            </div>

            {/* Features row */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pointer-events-auto pt-4">
              {[
                { label: 'Career Paths', icon: 'route' },
                { label: 'Skill Analysis', icon: 'insights' },
                { label: 'AI Roadmaps', icon: 'smart_toy' },
              ].map((f) => (
                <div key={f.label}
                  className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                  <span className="text-lg block mb-0.5">{f.icon === 'route' ? '🛤️' : f.icon === 'insights' ? '📊' : '🤖'}</span>
                  <p className="text-xs text-white/70 font-medium">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
