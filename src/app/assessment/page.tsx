'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAssessment } from '@/hooks/useAssessments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const skillOptions = [
  'Programming', 'Communication', 'Leadership', 'Problem Solving', 'Design',
  'Mathematics', 'Creativity', 'Machine Learning', 'Python', 'JavaScript',
  'Data Analysis', 'Cloud Architecture', 'Project Management', 'UI/UX', 'Databases',
  'Network Security', 'Linux', 'DevOps', 'Strategic Thinking', 'User Research',
];

const interestOptions = [
  { value: 'AI', label: 'AI & Machine Learning' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Business', label: 'Business & Management' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Design', label: 'Design & UX' },
];

export default function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const totalSteps = 3;
  const router = useRouter();
  const createMutation = useCreateAssessment();

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  async function handleSubmit() {
    try {
      const result = await createMutation.mutateAsync({
        selectedSkills,
        interests,
        careerGoals: careerGoals || undefined,
      });
      const recId = result?.recommendations?.topMatches?.[0]?.career ? 'latest' : '';
      router.push(recId ? `/results?assessmentId=${result.assessment?._id}` : '/results');
    } catch {
      // error handled by mutation
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Career Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your parameters for optimal path generation.</p>
        <div className="mt-4">
          <Progress value={(step / totalSteps) * 100} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground uppercase">
            <span>Initiation</span>
            <span className="text-primary">Phase {step}/{totalSteps}</span>
          </div>
        </div>
      </div>

      <Card className="bg-surface-container/50 border-border/50 min-h-[400px]">
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                Technical Competencies
              </h2>
              <p className="text-sm text-muted-foreground">Select your primary areas of expertise.</p>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary/20 border border-primary/40 text-primary'
                          : 'bg-surface-dim border border-border/50 text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{selectedSkills.length} skills selected</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                Career Interests
              </h2>
              <p className="text-sm text-muted-foreground">What field are you most interested in?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setInterests(opt.value)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      interests === opt.value
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'bg-surface-dim border-border/50 text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground">Career Goal (optional)</label>
                <input
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="e.g., High Salary, Startup, Remote Work"
                  className="w-full bg-surface-dim border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl text-primary">AI</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Ready for Analysis</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                We will analyze your {selectedSkills.length} skills and interest in {interests || 'your selected field'}
                to generate personalized career matches.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedSkills.slice(0, 8).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
                {selectedSkills.length > 8 && (
                  <Badge variant="outline" className="text-xs">+{selectedSkills.length - 8}</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="text-muted-foreground"
        >
          Back
        </Button>
        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && selectedSkills.length === 0 || step === 2 && !interests}
            className="bg-primary-container text-on-primary-container hover:bg-primary-container/90"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {createMutation.isPending ? 'Analyzing...' : 'Generate Results'}
          </Button>
        )}
      </div>
    </div>
  );
}
