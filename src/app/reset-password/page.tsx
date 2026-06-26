'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api/auth.api';
import { usePageEnter } from '@/hooks/useAnimatedMount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ResetContent() {
  const searchParams = useSearchParams();
  const pageRef = usePageEnter();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      setSuccess(res.data.message || 'Password reset successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={pageRef} className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-surface-container/60 backdrop-blur border-border/30">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <span className="text-primary text-xl">AI</span>
          </div>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm text-foreground">
                {success}
              </div>
              <Link href="/login">
                <Button className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  No reset token found. Please use the link from your email.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs uppercase text-muted-foreground">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Min. 8 characters" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                  className="bg-surface-dim border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs uppercase text-muted-foreground">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Re-enter new password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="bg-surface-dim border-border/50" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading || !token} className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline">Log in</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>}>
      <ResetContent />
    </Suspense>
  );
}
