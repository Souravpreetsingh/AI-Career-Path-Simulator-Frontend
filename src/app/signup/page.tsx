'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', collegeName: '', course: '', graduationYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        collegeName: form.collegeName || undefined,
        course: form.course || undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
      });
      router.push('/assessment');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-surface-container/60 backdrop-blur border-border/30">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <span className="text-primary text-xl">+</span>
          </div>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>Start your AI-powered career journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs uppercase text-muted-foreground">Full Name</Label>
              <Input id="fullName" placeholder="Your name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required className="bg-surface-dim border-border/50" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs uppercase text-muted-foreground">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required className="bg-surface-dim border-border/50" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs uppercase text-muted-foreground">Password</Label>
              <Input id="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} required className="bg-surface-dim border-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="collegeName" className="text-xs uppercase text-muted-foreground">College</Label>
                <Input id="collegeName" placeholder="Optional" value={form.collegeName} onChange={(e) => update('collegeName', e.target.value)} className="bg-surface-dim border-border/50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="course" className="text-xs uppercase text-muted-foreground">Course</Label>
                <Input id="course" placeholder="Optional" value={form.course} onChange={(e) => update('course', e.target.value)} className="bg-surface-dim border-border/50" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
