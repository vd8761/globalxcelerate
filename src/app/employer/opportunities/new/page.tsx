'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const opportunitySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.enum([
    'internships',
    'global_immersion',
    'exchange',
    'industry_projects',
    'research',
    'scholarships',
    'graduate_careers',
  ]),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location_country: z.string().min(1, 'Country is required'),
  location_city: z.string().optional(),
  work_mode: z.enum(['on_site', 'remote', 'hybrid']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration_value: z.coerce.number().optional(),
  duration_unit: z.enum(['weeks', 'months', 'years']).optional(),
  compensation_type: z.enum(['paid', 'stipend', 'unpaid', 'scholarship']).optional(),
  compensation_amount: z.coerce.number().optional(),
  compensation_currency: z.string().optional(),
  compensation_period: z.enum(['hourly', 'weekly', 'monthly', 'annual', 'total']).optional(),
  min_gpa: z.coerce.number().min(0).max(4.0).optional(),
  min_gx_score: z.coerce.number().min(0).max(100).optional(),
  visa_support: z.boolean().default(false),
  skills: z.string().optional(),
  deadline: z.string().optional(),
  max_applications: z.coerce.number().optional(),
  required_documents: z.array(z.string()).default([]),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

const inputStyles =
  'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20';

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      work_mode: 'on_site',
      compensation_currency: 'USD',
      visa_support: false,
      required_documents: [],
    },
  });

  const onSubmit = async (data: OpportunityFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...data,
      skills: data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      const response = await fetch('/api/v1/employer/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create opportunity');
      }

      router.push('/employer/opportunities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentOptions = [
    { id: 'resume', label: 'Resume' },
    { id: 'transcript', label: 'Transcript' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-[#050607]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/employer/opportunities">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Opportunity</h1>
            <p className="text-gray-400 mt-1">Fill in the details to publish a new opportunity</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g. Software Engineering Intern"
                  className={inputStyles}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internships">Internships</SelectItem>
                        <SelectItem value="global_immersion">Global Immersion</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="industry_projects">Industry Projects</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="scholarships">Scholarships</SelectItem>
                        <SelectItem value="graduate_careers">Graduate Careers</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the opportunity in detail..."
                  rows={5}
                  className={inputStyles}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Country <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register('location_country')}
                  placeholder="e.g. United States"
                  className={inputStyles}
                />
                {errors.location_country && (
                  <p className="mt-1 text-sm text-red-400">{errors.location_country.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">City</label>
                <Input
                  {...register('location_city')}
                  placeholder="e.g. San Francisco"
                  className={inputStyles}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Work Mode <span className="text-red-400">*</span>
                </label>
                <Controller
                  name="work_mode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_site">On-site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Duration */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Duration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Start Date</label>
                <Input
                  type="date"
                  {...register('start_date')}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">End Date</label>
                <Input
                  type="date"
                  {...register('end_date')}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Duration Value</label>
                <Input
                  type="number"
                  {...register('duration_value')}
                  placeholder="e.g. 3"
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Duration Unit</label>
                <Controller
                  name="duration_unit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Compensation */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Compensation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                <Controller
                  name="compensation_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="stipend">Stipend</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Amount</label>
                <Input
                  type="number"
                  {...register('compensation_amount')}
                  placeholder="e.g. 5000"
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Currency</label>
                <Input
                  {...register('compensation_currency')}
                  placeholder="USD"
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Period</label>
                <Controller
                  name="compensation_period"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="total">Total</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Requirements */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Minimum GPA (0 - 4.0)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.0"
                  {...register('min_gpa')}
                  placeholder="e.g. 3.0"
                  className={inputStyles}
                />
                {errors.min_gpa && (
                  <p className="mt-1 text-sm text-red-400">{errors.min_gpa.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Minimum GX Score (0 - 100)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...register('min_gx_score')}
                  placeholder="e.g. 70"
                  className={inputStyles}
                />
                {errors.min_gx_score && (
                  <p className="mt-1 text-sm text-red-400">{errors.min_gx_score.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <Controller
                  name="visa_support"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="visa_support"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-700 data-[state=checked]:bg-blue-600"
                    />
                  )}
                />
                <label htmlFor="visa_support" className="text-sm font-medium text-gray-400">
                  Visa support provided
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Required Skills (comma-separated)
                </label>
                <Input
                  {...register('skills')}
                  placeholder="e.g. Python, React, Data Analysis"
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          {/* Section 6: Application Settings */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Application Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Application Deadline
                </label>
                <Input
                  type="date"
                  {...register('deadline')}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Maximum Applications
                </label>
                <Input
                  type="number"
                  {...register('max_applications')}
                  placeholder="e.g. 100"
                  className={inputStyles}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Required Documents
                </label>
                <div className="flex flex-wrap gap-4">
                  <Controller
                    name="required_documents"
                    control={control}
                    render={({ field }) => (
                      <>
                        {documentOptions.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`doc-${doc.id}`}
                              checked={field.value?.includes(doc.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, doc.id]);
                                } else {
                                  field.onChange(current.filter((d) => d !== doc.id));
                                }
                              }}
                              className="border-gray-700 data-[state=checked]:bg-blue-600"
                            />
                            <label
                              htmlFor={`doc-${doc.id}`}
                              className="text-sm text-gray-400"
                            >
                              {doc.label}
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <Link href="/employer/opportunities">
              <Button type="button" variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Opportunity
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
