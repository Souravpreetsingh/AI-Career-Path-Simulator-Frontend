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
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              This is interactive 3d robot Whobee
            </h1>
            <p className="text-lg md:text-xl text-white/80 drop-shadow-md max-w-lg mx-auto">
              Your AI-powered career guide — discover paths, skills, and roadmaps.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto pt-2">
              <Button onClick={() => router.push('/dashboard')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-xl text-sm font-medium shadow-lg shadow-primary/20">
                Get Started Free
              </Button>
              <Button onClick={() => router.push('/chat')}
                variant="outline"
                className="h-12 px-8 rounded-xl text-sm font-medium border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
                Talk to AI
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
