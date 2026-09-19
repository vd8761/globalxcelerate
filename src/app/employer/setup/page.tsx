'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const employerSetupSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  job_title: z.string().min(2, 'Your job title is required'),
  industry: z.string().min(1, 'Select an industry'),
  company_size: z.string().min(1, 'Select company size'),
  company_website: z.string().url('Enter a valid URL').or(z.literal('')),
});

type EmployerSetupData = z.infer<typeof employerSetupSchema>;

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Media', 'Energy', 'Real Estate', 'Other',
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export default function EmployerSetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EmployerSetupData>({
    resolver: zodResolver(employerSetupSchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      industry: '',
      company_size: '',
      company_website: '',
    },
  });

  const onSubmit = async (data: EmployerSetupData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/profiles/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'employer', ...data }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error?.message || 'Setup failed. Please try again.');
        return;
      }
      router.push('/employer/dashboard');
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
          <h1 className="text-3xl font-bold text-white">Set Up Your Employer Profile</h1>
          <p className="mt-2 text-gray-400">Tell us about your company to get started</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-gray-200">Company Name</Label>
            <Input id="company_name" {...form.register('company_name')} placeholder="Acme Corp" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.company_name && <p className="text-sm text-red-400">{form.formState.errors.company_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title" className="text-gray-200">Your Job Title</Label>
            <Input id="job_title" {...form.register('job_title')} placeholder="HR Manager" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.job_title && <p className="text-sm text-red-400">{form.formState.errors.job_title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">Industry</Label>
            <Select onValueChange={(v) => form.setValue('industry', v)} defaultValue="">
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.industry && <p className="text-sm text-red-400">{form.formState.errors.industry.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">Company Size</Label>
            <Select onValueChange={(v) => form.setValue('company_size', v)} defaultValue="">
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.company_size && <p className="text-sm text-red-400">{form.formState.errors.company_size.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website" className="text-gray-200">Company Website (optional)</Label>
            <Input id="company_website" {...form.register('company_website')} placeholder="https://example.com" className="bg-gray-800 border-gray-700 text-white" />
            {form.formState.errors.company_website && <p className="text-sm text-red-400">{form.formState.errors.company_website.message}</p>}
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
