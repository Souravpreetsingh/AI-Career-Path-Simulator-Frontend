'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useDashboardActivity, useDashboardRecommendations } from '@/hooks/useDashboard';
import { useDashboardSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activity, isLoading: activityLoading, refetch: refetchActivity } = useDashboardActivity();
  const { data: recommendations, isLoading: recLoading, refetch: refetchRecs } = useDashboardRecommendations();

  const socket = useDashboardSocket(token);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    setWsConnected(socket.connected);
  }, [socket.connected]);

  useEffect(() => {
    const unsubStats = socket.onStats((data) => {
      refetchStats();
    });
    const unsubActivity = socket.onActivity(() => {
      refetchActivity();
    });
    const unsubRecs = socket.onRecommendations(() => {
      refetchRecs();
    });
    return () => { unsubStats(); unsubActivity(); unsubRecs(); };
  }, [socket, refetchStats, refetchActivity, refetchRecs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}.</h1>
          <p className="text-muted-foreground text-sm mt-1">Here is your career overview.</p>
        </div>
        {wsConnected && <span className="flex items-center gap-1 text-xs text-green-500"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface-container/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> :
              <p className="text-3xl font-bold text-primary">{stats?.totalAssessments || 0}</p>}
          </CardContent>
        </Card>
        <Card className="bg-surface-container/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Roadmaps</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> :
              <p className="text-3xl font-bold text-tertiary">{stats?.totalRoadmaps || 0}</p>}
          </CardContent>
        </Card>
        <Card className="bg-surface-container/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Chats</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> :
              <p className="text-3xl font-bold text-secondary">{stats?.totalChats || 0}</p>}
          </CardContent>
        </Card>
      </div>

      {stats?.recommendedCareer && (
        <Card className="bg-surface-container/50 border-border/50 relative overflow-hidden">
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
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activity?.recentAssessments?.length > 0 ? (
              <div className="space-y-3">
                {activity.recentAssessments.slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
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
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-surface-variant/30 border border-border/30">
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
