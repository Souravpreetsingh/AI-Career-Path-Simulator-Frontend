'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/GuestContext';
import { useDashboardStats } from '@/hooks/useDashboard';
import { userApi, UpdateProfileDto } from '@/services/api/user.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    collegeName: user?.collegeName || '',
    course: user?.course || '',
    graduationYear: user?.graduationYear?.toString() || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const dto: UpdateProfileDto = {
        fullName: form.fullName,
        collegeName: form.collegeName || undefined,
        course: form.course || undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
      };
      const res = await userApi.updateProfile(dto);
      updateUser(res.data.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>

      <Card className="bg-surface-container/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Personal Info</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="text-xs border-border/50"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-2xl text-primary">{user?.fullName?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="text-xs mt-1 capitalize">{user?.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                disabled={!editing}
                className="bg-surface-dim border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">College</Label>
              <Input
                value={form.collegeName}
                onChange={(e) => setForm((p) => ({ ...p, collegeName: e.target.value }))}
                disabled={!editing}
                className="bg-surface-dim border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">Course</Label>
              <Input
                value={form.course}
                onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
                disabled={!editing}
                className="bg-surface-dim border-border/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">Graduation Year</Label>
              <Input
                value={form.graduationYear}
                onChange={(e) => setForm((p) => ({ ...p, graduationYear: e.target.value }))}
                disabled={!editing}
                className="bg-surface-dim border-border/50"
              />
            </div>
          </div>

          {editing && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-container text-on-primary-container hover:bg-primary-container/90"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface-container/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">AI Alignment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-surface-variant/30 border border-border/30 text-center">
                <p className="text-2xl font-bold text-primary">{stats?.totalAssessments || 0}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">Assessments</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-variant/30 border border-border/30 text-center">
                <p className="text-2xl font-bold text-tertiary">{stats?.totalRoadmaps || 0}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">Roadmaps</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-variant/30 border border-border/30 text-center">
                <p className="text-2xl font-bold text-secondary">{stats?.totalChats || 0}</p>
                <p className="text-xs text-muted-foreground uppercase mt-1">Chat Sessions</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface-container/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-variant/30 border border-border/30">
            <div>
              <p className="text-sm text-foreground">Member since</p>
              <p className="text-xs text-muted-foreground">Active account</p>
            </div>
            <Badge variant="outline" className="text-tertiary border-tertiary/30">Active</Badge>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
