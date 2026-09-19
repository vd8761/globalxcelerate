'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Send, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const opportunityCategories = [
  { value: 'internships', label: 'Internship' },
  { value: 'global_immersion', label: 'Global Immersion' },
  { value: 'exchange', label: 'Exchange Program' },
  { value: 'industry_projects', label: 'Industry Project' },
  { value: 'research', label: 'Research' },
  { value: 'scholarships', label: 'Scholarship' },
  { value: 'graduate_careers', label: 'Graduate Career' },
] as const;

const workModes = [
  { value: 'on_site', label: 'On Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const durationUnits = [
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
] as const;

const compensationTypes = [
  { value: 'paid', label: 'Paid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'scholarship', label: 'Scholarship' },
] as const;

const compensationPeriods = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'total', label: 'Total' },
] as const;

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-600/20 text-gray-400 border-gray-700',
  pending_review: 'bg-yellow-600/20 text-yellow-400 border-yellow-700',
  published: 'bg-green-600/20 text-green-400 border-green-700',
  closed: 'bg-red-600/20 text-red-400 border-red-700',
  archived: 'bg-gray-600/20 text-gray-500 border-gray-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  closed: 'Closed',
  archived: 'Archived',
};

const editOpportunitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  category: z.enum(['internships', 'global_immersion', 'exchange', 'industry_projects', 'research', 'scholarships', 'graduate_careers']),
  description: z.string().min(50, 'Description must be at least 50 characters').max(10000),
  location_country: z.string().min(2, 'Country is required').max(100),
  location_city: z.string().max(100).optional(),
  work_mode: z.enum(['on_site', 'remote', 'hybrid']),
  duration_value: z.coerce.number().int().positive().optional().or(z.literal('')),
  duration_unit: z.enum(['weeks', 'months', 'years']).optional().or(z.literal('')),
  compensation_type: z.enum(['paid', 'stipend', 'unpaid', 'scholarship']).optional().or(z.literal('')),
  compensation_min: z.coerce.number().min(0).optional().or(z.literal('')),
  compensation_max: z.coerce.number().min(0).optional().or(z.literal('')),
  compensation_currency: z.string().max(3).optional(),
  compensation_period: z.enum(['hourly', 'weekly', 'monthly', 'annual', 'total']).optional().or(z.literal('')),
  start_date: z.string().optional(),
  application_deadline: z.string().optional(),
  visa_support: z.boolean().default(false),
  industry: z.string().max(100).optional(),
  spots_available: z.coerce.number().int().positive().optional().or(z.literal('')),
});

type EditOpportunityForm = z.infer<typeof editOpportunitySchema>;

interface OpportunityData {
  id: string;
  title: string;
  category: string;
  description: string;
  location_country: string;
  location_city: string | null;
  work_mode: string;
  duration_value: number | null;
  duration_unit: string | null;
  compensation_type: string | null;
  compensation_min: number | null;
  compensation_max: number | null;
  compensation_currency: string | null;
  compensation_period: string | null;
  start_date: string | null;
  application_deadline: string | null;
  visa_support: boolean;
  industry: string | null;
  spots_available: number | null;
  status: string;
  application_count: number;
  created_at: string;
  updated_at: string;
}

const inputStyles = 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20';

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditOpportunityForm>({
    resolver: zodResolver(editOpportunitySchema),
  });

  useEffect(() => {
    if (!id) return;

    async function fetchOpportunity() {
      try {
        const res = await fetch(`/api/v1/employer/opportunities/${id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error?.message ?? 'Failed to fetch opportunity');
        }
        const json = await res.json();
        const data = json.data ?? json;
        setOpportunity(data);

        // Pre-fill the form
        reset({
          title: data.title ?? '',
          category: data.category ?? 'internships',
          description: data.description ?? '',
          location_country: data.location_country ?? '',
          location_city: data.location_city ?? '',
          work_mode: data.work_mode ?? 'on_site',
          duration_value: data.duration_value ?? '',
          duration_unit: data.duration_unit ?? '',
          compensation_type: data.compensation_type ?? '',
          compensation_min: data.compensation_min ?? '',
          compensation_max: data.compensation_max ?? '',
          compensation_currency: data.compensation_currency ?? '',
          compensation_period: data.compensation_period ?? '',
          start_date: data.start_date ? data.start_date.slice(0, 16) : '',
          application_deadline: data.application_deadline ? data.application_deadline.slice(0, 16) : '',
          visa_support: data.visa_support ?? false,
          industry: data.industry ?? '',
          spots_available: data.spots_available ?? '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunity();
  }, [id, reset]);

  async function onSubmit(formData: EditOpportunityForm) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: Record<string, unknown> = {};

      // Only include fields that have values
      if (formData.title) payload.title = formData.title;
      if (formData.category) payload.category = formData.category;
      if (formData.description) payload.description = formData.description;
      if (formData.location_country) payload.location_country = formData.location_country;
      payload.location_city = formData.location_city || null;
      if (formData.work_mode) payload.work_mode = formData.work_mode;
      payload.duration_value = formData.duration_value ? Number(formData.duration_value) : null;
      payload.duration_unit = formData.duration_unit || null;
      payload.compensation_type = formData.compensation_type || null;
      payload.compensation_min = formData.compensation_min ? Number(formData.compensation_min) : null;
      payload.compensation_max = formData.compensation_max ? Number(formData.compensation_max) : null;
      payload.compensation_currency = formData.compensation_currency || null;
      payload.compensation_period = formData.compensation_period || null;
      payload.start_date = formData.start_date ? new Date(formData.start_date).toISOString() : null;
      payload.application_deadline = formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null;
      payload.visa_support = formData.visa_support;
      payload.industry = formData.industry || null;
      payload.spots_available = formData.spots_available ? Number(formData.spots_available) : null;

      const res = await fetch(`/api/v1/employer/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Failed to update opportunity');
      }

      const json = await res.json();
      setOpportunity((prev) => prev ? { ...prev, ...json.data } : prev);
      setSuccessMessage('Opportunity updated successfully');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/employer/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Failed to publish opportunity');
      }

      setOpportunity((prev) => prev ? { ...prev, status: 'published' } : prev);
      setSuccessMessage('Opportunity published successfully');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  }

  async function handleClose() {
    setClosing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/employer/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? 'Failed to close opportunity');
      }

      setOpportunity((prev) => prev ? { ...prev, status: 'closed' } : prev);
      setSuccessMessage('Opportunity closed successfully');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close');
    } finally {
      setClosing(false);
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050607] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-64 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state (when fetch fails entirely)
  if (error && !opportunity) {
    return (
      <div className="min-h-screen bg-[#050607] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link
            href="/employer/opportunities"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunities
          </Link>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/employer/opportunities"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Opportunity</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Update the details of your opportunity listing
              </p>
            </div>
          </div>

          {/* Status badge */}
          {opportunity && (
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 capitalize ${statusStyles[opportunity.status] ?? statusStyles.draft}`}
            >
              {statusLabels[opportunity.status] ?? opportunity.status}
            </Badge>
          )}
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {error && opportunity && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action buttons row */}
        {opportunity && (
          <div className="flex items-center gap-3">
            {opportunity.status === 'draft' && (
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publish
              </Button>
            )}
            {opportunity.status === 'published' && (
              <Button
                onClick={handleClose}
                disabled={closing}
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                {closing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Close
              </Button>
            )}
            <Link href={`/employer/applications?opportunity_id=${id}`}>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Applications ({opportunity.application_count ?? 0})
              </Button>
            </Link>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Basic Information</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Title</label>
              <Input
                {...register('title')}
                className={inputStyles}
                placeholder="e.g. Software Engineering Intern"
              />
              {errors.title && (
                <p className="text-red-400 text-xs">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Category</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {opportunityCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-red-400 text-xs">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Industry</label>
                <Input
                  {...register('industry')}
                  className={inputStyles}
                  placeholder="e.g. Technology, Finance"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Description</label>
              <Textarea
                {...register('description')}
                className={`${inputStyles} min-h-[160px]`}
                placeholder="Describe the opportunity in detail..."
              />
              {errors.description && (
                <p className="text-red-400 text-xs">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Location & Work Mode */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Location & Work Mode</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Country</label>
                <Input
                  {...register('location_country')}
                  className={inputStyles}
                  placeholder="e.g. Australia"
                />
                {errors.location_country && (
                  <p className="text-red-400 text-xs">{errors.location_country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">City</label>
                <Input
                  {...register('location_city')}
                  className={inputStyles}
                  placeholder="e.g. Sydney"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Work Mode</label>
                <Controller
                  name="work_mode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {workModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.work_mode && (
                  <p className="text-red-400 text-xs">{errors.work_mode.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Controller
                name="visa_support"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                )}
              />
              <label className="text-sm text-gray-400">Visa support available</label>
            </div>
          </div>

          {/* Duration & Dates */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Duration & Dates</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Duration</label>
                <div className="flex gap-3">
                  <Input
                    {...register('duration_value')}
                    type="number"
                    className={`${inputStyles} w-24`}
                    placeholder="e.g. 6"
                  />
                  <Controller
                    name="duration_unit"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className={`${inputStyles} flex-1`}>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Spots Available</label>
                <Input
                  {...register('spots_available')}
                  type="number"
                  className={inputStyles}
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Start Date</label>
                <Input
                  {...register('start_date')}
                  type="datetime-local"
                  className={inputStyles}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Application Deadline</label>
                <Input
                  {...register('application_deadline')}
                  type="datetime-local"
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Compensation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Compensation Type</label>
                <Controller
                  name="compensation_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {compensationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Payment Period</label>
                <Controller
                  name="compensation_period"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {compensationPeriods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Minimum</label>
                <Input
                  {...register('compensation_min')}
                  type="number"
                  className={inputStyles}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Maximum</label>
                <Input
                  {...register('compensation_max')}
                  type="number"
                  className={inputStyles}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Currency</label>
                <Input
                  {...register('compensation_currency')}
                  className={inputStyles}
                  placeholder="AUD"
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/employer/opportunities">
              <Button
                type="button"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
