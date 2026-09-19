'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const providerSetupSchema = z.object({
  organization_name: z.string().min(2, 'Organization name is required'),
  program_type: z.string().min(1, 'Select a program type'),
  description: z.string().min(10, 'Provide a brief description (min 10 characters)'),
  website: z.string().url('Enter a valid URL').or(z.literal('')),
});

type ProviderSetupData = z.infer<typeof providerSetupSchema>;

const PROGRAM_TYPES = [
  'Internship Programs', 'Exchange Programs', 'Fellowship Programs',
  'Scholarship Programs', 'Training & Certifications', 'Study Abroad',
  'Volunteer Programs', 'Research Programs', 'Other',
];

export default function ProviderSetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProviderSetupData>({
    resolver: zodResolver(providerSetupSchema),
    defaultValues: {
      organization_name: '',
      program_type: '',
      description: '',
      website: '',
    },
  });

  const onSubmit = async (data: ProviderSetupData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/profiles/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'program_provider', ...data }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error?.message || 'Setup failed. Please try again.');
        return;
      }
      router.push('/provider/dashboard');
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
          <h1 className="text-3xl font-bold text-white">Set Up Your Provider Profile</h1>
          <p className="mt-2 text-gray-400">Tell us about your organization and programs</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="space-y-2">
            <Label htmlFor="organization_name" className="text-gray-200">Organization Name</Label>
            <Input id="organization_name" {...form.register('organization_name')} placeholder="Global Education Network" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.organization_name && <p className="text-sm text-red-400">{form.formState.errors.organization_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">Program Type</Label>
            <Select onValueChange={(v) => form.setValue('program_type', v)} defaultValue="">
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select program type" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.program_type && <p className="text-sm text-red-400">{form.formState.errors.program_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">Description</Label>
            <Textarea id="description" {...form.register('description')} placeholder="Briefly describe your organization and programs..." className="bg-gray-800 border-gray-700 text-white min-h-[100px]" />
            {form.formState.errors.description && <p className="text-sm text-red-400">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-gray-200">Website (optional)</Label>
            <Input id="website" {...form.register('website')} placeholder="https://example.org" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.website && <p className="text-sm text-red-400">{form.formState.errors.website.message}</p>}
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
