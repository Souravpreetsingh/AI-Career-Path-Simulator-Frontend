'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useRoadmaps, useSaveRoadmap } from '@/hooks/useRoadmaps';
import { careerApi } from '@/services/api/career.api';
import { usePageEnter, useStaggerChildren } from '@/hooks/useAnimatedMount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShimmerLine } from '@/components/ui/shimmer';
import Link from 'next/link';
import { toast } from 'sonner';

function RoadmapsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const careerParam = searchParams.get('career');
  const { data: roadmaps, isLoading, refetch } = useRoadmaps();
  const saveMutation = useSaveRoadmap();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const pageRef = usePageEnter();
  const roadmapsRef = useStaggerChildren('.animate-roadmap-card', { stagger: 120, delay: 200 });

  async function markStepComplete(roadmap: any, step: string) {
    setUpdatingId(roadmap._id);
    try {
      const alreadyDone = (roadmap.completedSteps || []).includes(step);
      const completedSteps = alreadyDone
        ? (roadmap.completedSteps || [])
        : [...(roadmap.completedSteps || []), step];
      const progress = Math.min(Math.round((completedSteps.length / (roadmap.phases?.length || 1)) * 100), 100);
      await saveMutation.mutateAsync({
        careerId: roadmap.careerId?._id || roadmap.careerId,
        completedSteps,
        progress,
      });
      toast.success('Progress updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div ref={pageRef} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Career Roadmaps</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your learning journey.</p>
        </div>
        <Link href="/assessment">
          <Button className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 text-sm">
            + New Roadmap
          </Button>
        </Link>
      </div>

      {careerParam && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-foreground">
              Generate a roadmap for <strong>{careerParam}</strong>?
            </p>
            <Button
              size="sm"
              disabled={generating}
              onClick={async () => {
                if (!careerParam) return;
                setGenerating(true);
                try {
                  const res = await careerApi.findByTitle(careerParam);
                  const career = res.data.data;
                  if (!career) {
                    toast.error('Career not found');
                    setGenerating(false);
                    return;
                  }
                  await saveMutation.mutateAsync({
                    careerId: career._id,
                    phases: career.roadmapSteps || [
                      `Learn the basics of ${career.title}`,
                      `Build foundational ${career.title} skills`,
                      `Work on practical projects`,
                      `Get certified or complete advanced training`,
                      `Apply for ${career.title} roles`,
                    ],
                    completedSteps: [],
                    progress: 0,
                  });
                  toast.success(`Roadmap for ${career.title} created!`);
                  refetch();
                  router.replace('/roadmaps');
                } catch (err: any) {
                  const msg = err?.response?.data?.message || err?.message || 'Failed to create roadmap';
                  toast.error(msg);
                } finally {
                  setGenerating(false);
                }
              }}
              className="bg-primary-container text-on-primary-container text-xs"
            >
              Generate
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-surface-container/50 border-border/50">
              <CardContent className="p-6"><ShimmerLine className="h-32 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : roadmaps && roadmaps.length > 0 ? (
        <div ref={roadmapsRef} className="space-y-4">
          {roadmaps.map((roadmap: any) => (
            <Card key={roadmap._id} hover className="animate-roadmap-card bg-surface-container/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {roadmap.careerId?.title || 'Career Roadmap'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {roadmap.phases?.length || 0} steps · {roadmap.progress || 0}% complete
                    </p>
                  </div>
                  <Badge variant={roadmap.progress >= 100 ? 'default' : 'secondary'}>
                    {roadmap.progress >= 100 ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>

                <Progress value={roadmap.progress || 0} className="h-2 mb-4" />

                <div className="space-y-2">
                  {(roadmap.phases || []).map((phase: string, i: number) => {
                    const done = (roadmap.completedSteps || []).includes(phase);
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-variant/30 transition-colors">
                        <button
                          onClick={() => markStepComplete(roadmap, phase)}
                          disabled={updatingId === roadmap._id}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                            done ? 'bg-primary border-primary text-white' : 'border-border/50 hover:border-primary/50'
                          }`}
                        >
                          {done ? '✓' : ''}
                        </button>
                        <span className={`text-sm ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {phase}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/chat?q=${encodeURIComponent(`How do I learn ${roadmap.careerId?.title || 'this career'}?`)}`}>
                    <Button size="sm" variant="outline" className="text-xs border-border/50">Ask AI</Button>
                  </Link>
                  <Link href={`/results?career=${encodeURIComponent(roadmap.careerId?.title || '')}`}>
                    <Button size="sm" variant="outline" className="text-xs border-border/50">View Career</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-surface-container/50 border-border/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No roadmaps yet.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Complete an assessment and generate a roadmap for your top career matches.
            </p>
            <Link href="/assessment">
              <Button className="bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                Take Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RoadmapsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>}>
      <RoadmapsContent />
    </Suspense>
  );
}
