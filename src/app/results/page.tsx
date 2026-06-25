'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAssessmentResults } from '@/hooks/useAssessments';
import { useRecommendationHistory } from '@/hooks/useRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get('assessmentId');

  const { data: assessmentData, isLoading: assessLoading } = useAssessmentResults();

  const { data: recHistory, isLoading: recLoading } = useRecommendationHistory({
    limit: 1,
    ...(assessmentId ? {} : {}),
  });

  const isLoading = assessLoading || recLoading;

  const latestAssessment = assessmentData?.latest;
  const matchPercentages: Record<string, number> = latestAssessment?.matchPercentages || {};
  const recommendations = assessmentData?.recommendations;

  const sortedMatches = Object.entries(matchPercentages)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <Badge variant="outline" className="mb-3 text-primary border-primary/30">
          Assessment Complete
        </Badge>
        <h1 className="text-2xl font-bold text-foreground">Your Career Matches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your skills and interests, here are your optimal career paths.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-surface-container/50 border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedMatches.length === 0 ? (
        <Card className="bg-surface-container/50 border-border/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No assessment results found.</p>
            <Link href="/assessment">
              <Button className="bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                Take Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMatches.slice(0, 3).map(([career, percentage], idx) => (
            <Card key={career} className={`bg-surface-container/50 border-border/50 relative overflow-hidden ${
              idx === 0 ? 'ring-1 ring-primary/30' : ''
            }`}>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-semibold text-foreground">{career}</h2>
                      {idx === 0 && <Badge className="bg-primary/20 text-primary border-primary/30">Best Match</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">High Demand</Badge>
                      <Badge variant="outline" className="text-xs">Tech</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-primary">{percentage}%</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Match Score</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Compatibility</span>
                    <span className="text-primary font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Why Recommended</h3>
                    <p className="text-sm text-foreground">
                      Your skills align well with the core requirements of {career}.
                    </p>
                  </div>
                  <div className="bg-surface-dim/50 rounded-lg p-3 border border-border/30">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Market Outlook</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Growth</span>
                      <span className="text-tertiary font-medium">+High Demand</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link href={`/roadmaps?career=${encodeURIComponent(career)}`}>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary">
                      View Roadmap
                    </Button>
                  </Link>
                  <Link href={`/chat?q=${encodeURIComponent(`How do I become a ${career}?`)}`}>
                    <Button size="sm" variant="outline" className="border-border/50 text-muted-foreground">
                      Ask AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {recommendations?.topMatches && recommendations.topMatches.length > 0 && (
            <Card className="bg-surface-container/50 border-border/50">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">AI Insights</h3>
                <div className="space-y-3">
                  {recommendations.insights?.slice(0, 4).map((insight: any, i: number) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface-variant/30 border border-border/30">
                      <Badge variant={insight.type === 'strength' ? 'default' : insight.type === 'weakness' ? 'destructive' : 'secondary'} className="h-fit text-xs capitalize">
                        {insight.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Link href="/assessment">
              <Button variant="outline" className="border-border/50">Retake Assessment</Button>
            </Link>
            <Link href="/chat">
              <Button className="bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                Chat with AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>}>
      <ResultsContent />
    </Suspense>
  );
}
