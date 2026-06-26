'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { usePageEnter, useStaggerChildren } from '@/hooks/useAnimatedMount';
import { useAuth } from '@/contexts/GuestContext';
import { useDashboardStats, useDashboardActivity, useDashboardRecommendations } from '@/hooks/useDashboard';
import { useDashboardSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShimmerLine } from '@/components/ui/shimmer';
import Link from 'next/link';

function StatsCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!ref.current || value === 0) return;
    animate(ref.current, { innerHTML: [0, value], duration: 1000, easing: 'easeOutCubic', round: 1 });
  }, [value]);
  return (
    <Card hover className="bg-surface-container/50 border-border/50 animate-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p ref={ref} className={`text-3xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activity, isLoading: activityLoading, refetch: refetchActivity } = useDashboardActivity();
  const { data: recommendations, isLoading: recLoading, refetch: refetchRecs } = useDashboardRecommendations();

  const socket = useDashboardSocket(token);
  const [wsConnected, setWsConnected] = useState(false);
  const pageRef = usePageEnter();
  const cardsRef = useStaggerChildren('.animate-card', { stagger: 120, delay: 200 });
  const activityRef = useStaggerChildren('.animate-activity-item', { stagger: 80, delay: 400 });
  const recsRef = useStaggerChildren('.animate-rec-item', { stagger: 80, delay: 400 });

  useEffect(() => {
    setWsConnected(socket.connected);
  }, [socket.connected]);

  useEffect(() => {
    const unsubStats = socket.onStats((data) => { refetchStats(); });
    const unsubActivity = socket.onActivity(() => { refetchActivity(); });
    const unsubRecs = socket.onRecommendations(() => { refetchRecs(); });
    return () => { unsubStats(); unsubActivity(); unsubRecs(); };
  }, [socket, refetchStats, refetchActivity, refetchRecs]);

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}.</h1>
          <p className="text-muted-foreground text-sm mt-1">Here is your career overview.</p>
        </div>
        {wsConnected && <span className="flex items-center gap-1 text-xs text-green-500"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live</span>}
      </div>

      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Assessments" value={stats?.totalAssessments || 0} color="text-primary" icon="assessment" />
        <StatsCard label="Roadmaps" value={stats?.totalRoadmaps || 0} color="text-tertiary" icon="roadmap" />
        <StatsCard label="Chats" value={stats?.totalChats || 0} color="text-secondary" icon="chat" />
      </div>

      {stats?.recommendedCareer && (
        <Card hover className="bg-surface-container/50 border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Match</p>
              <p className="text-lg font-semibold text-foreground">{stats.recommendedCareer.title}</p>
              <p className="text-sm text-muted-foreground">Match Score: {stats.recommendedCareer.percentage}%</p>
            </div>
            <div className="text-4xl font-bold text-primary">{stats.recommendedCareer.percentage}%</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface-container/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <ShimmerLine key={i} className="h-12 w-full" />)}
              </div>
            ) : activity?.recentAssessments?.length > 0 ? (
              <div ref={activityRef} className="space-y-3">
                {activity.recentAssessments.slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="animate-activity-item flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.interests} Assessment</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.completedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/30">{a.matchPercentages ? 'Complete' : 'Partial'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assessments yet. <Link href="/assessment" className="text-primary hover:underline">Take one now.</Link></p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface-container/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {recLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <ShimmerLine key={i} className="h-16 w-full" />)}
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div ref={recsRef} className="space-y-3">
                {recommendations.map((rec: any, i: number) => (
                  <div key={i} className="animate-rec-item p-3 rounded-lg bg-surface-variant/30 border border-border/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
                        {rec.priority}
                      </Badge>
                      <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete an assessment to get recommendations.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
