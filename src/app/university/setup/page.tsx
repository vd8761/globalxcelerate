'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const universitySetupSchema = z.object({
  institution_name: z.string().min(2, 'Institution name is required'),
  department: z.string().min(2, 'Department is required'),
  position: z.string().min(2, 'Position is required'),
  institution_website: z.string().url('Enter a valid URL').or(z.literal('')),
});

type UniversitySetupData = z.infer<typeof universitySetupSchema>;

export default function UniversitySetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UniversitySetupData>({
    resolver: zodResolver(universitySetupSchema),
    defaultValues: {
      institution_name: '',
      department: '',
      position: '',
      institution_website: '',
    },
  });

  const onSubmit = async (data: UniversitySetupData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/profiles/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'university_admin', ...data }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error?.message || 'Setup failed. Please try again.');
        return;
      }
      router.push('/university/dashboard');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050607] p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Set Up Your University Profile</h1>
          <p className="mt-2 text-gray-400">Tell us about your institution and role</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="space-y-2">
            <Label htmlFor="institution_name" className="text-gray-200">Institution Name</Label>
            <Input id="institution_name" {...form.register('institution_name')} placeholder="University of Oxford" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.institution_name && <p className="text-sm text-red-400">{form.formState.errors.institution_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-gray-200">Department</Label>
            <Input id="department" {...form.register('department')} placeholder="Career Services" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.department && <p className="text-sm text-red-400">{form.formState.errors.department.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="text-gray-200">Your Position</Label>
            <Input id="position" {...form.register('position')} placeholder="Director of International Programs" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.position && <p className="text-sm text-red-400">{form.formState.errors.position.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution_website" className="text-gray-200">Institution Website (optional)</Label>
            <Input id="institution_website" {...form.register('institution_website')} placeholder="https://university.edu" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.institution_website && <p className="text-sm text-red-400">{form.formState.errors.institution_website.message}</p>}
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Setting up...' : 'Complete Setup'}
          </Button>
        </form>
      </div>
    </div>
  );
}
