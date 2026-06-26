'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/services/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSuccess(res.data.message || 'Password reset link sent. Check your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-surface-container/60 backdrop-blur border-border/30">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <span className="text-primary text-xl">AI</span>
          </div>
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm text-foreground">
                {success}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                For demo: check the server logs for the reset token, then visit
                {' '}<Link href="/reset-password" className="text-primary hover:underline">/reset-password?token=...</Link>
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full border-border/50">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase text-muted-foreground">Email Address</Label>
                <Input id="email" type="email" placeholder="name@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required className="bg-surface-dim border-border/50" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                {loading ? 'Sending...' : 'Reset Password'}
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
