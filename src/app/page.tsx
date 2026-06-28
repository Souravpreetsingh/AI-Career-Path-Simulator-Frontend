'use client';

import { useRouter } from 'next/navigation';
import { InteractiveRobotSpline } from '@/components/shared/InteractiveRobotSpline';
import { Button } from '@/components/ui/button';

const SPLINE_SCENE = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';

export default function Home() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Left — Spline 3D Robot */}
      <div className="hidden lg:flex w-[55%] h-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-surface-container">
        <div className="w-full h-full max-w-[700px] max-h-[700px]">
          <InteractiveRobotSpline scene={SPLINE_SCENE} className="w-full h-full" />
        </div>
      </div>

      {/* Right — Content */}
      <div className="flex-1 h-full flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-lg w-full space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Career Guidance
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Your{' '}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Future
            </span>
            {' '}Starts Here
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover personalized career paths, get AI-driven insights, and build 
            your roadmap to success. No sign-up required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => router.push('/dashboard')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-xl text-sm font-medium shadow-lg shadow-primary/20">
              Get Started Free
            </Button>
            <Button onClick={() => router.push('/chat')}
              variant="outline"
              className="h-12 px-8 rounded-xl text-sm font-medium border-border/40 bg-surface-container/50 hover:bg-surface-container">
              Talk to AI
            </Button>
          </div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { label: 'Career Paths', desc: 'Personalized roadmaps', icon: 'route' },
              { label: 'AI Chat', desc: 'Real-time guidance', icon: 'smart_toy' },
              { label: 'Skill Analysis', desc: 'Identify your strengths', icon: 'insights' },
              { label: 'Free Access', desc: 'No account needed', icon: 'lock_open' },
            ].map((f) => (
              <div key={f.label}
                className="p-3 rounded-xl bg-surface-container/50 border border-border/20 backdrop-blur-sm hover:bg-surface-container/80 hover:border-primary/20 transition-all">
                <span className="text-lg text-primary material-symbols-outlined mb-1 block">{f.icon}</span>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
