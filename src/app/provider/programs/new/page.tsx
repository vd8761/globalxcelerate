'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location_country: '',
    location_city: '',
    work_mode: '',
    duration_value: '',
    duration_unit: '',
    start_date: '',
    application_deadline: '',
    spots_available: '',
    requirements: '',
    eligibility_criteria: '',
  });

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.category || !formData.description.trim() || !formData.location_country.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title, category, description, and location country are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        location_country: formData.location_country.trim(),
      };
      if (formData.location_city.trim()) payload.location_city = formData.location_city.trim();
      if (formData.work_mode) payload.work_mode = formData.work_mode;
      if (formData.duration_value) payload.duration_value = parseInt(formData.duration_value, 10);
      if (formData.duration_unit) payload.duration_unit = formData.duration_unit;
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.application_deadline) payload.application_deadline = formData.application_deadline;
      if (formData.spots_available) payload.spots_available = parseInt(formData.spots_available, 10);
      if (formData.requirements.trim()) payload.requirements = formData.requirements.trim();
      if (formData.eligibility_criteria.trim()) payload.eligibility_criteria = formData.eligibility_criteria.trim();

      const res = await fetch('/api/v1/provider/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create program');
      }

      router.push('/provider/programs');
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/provider/programs"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">Create New Program</h1>
          <p className="text-gray-400 mt-1">Fill in the details to create a new program listing</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Program Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Summer Research Program 2026"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="global_immersion">Global Immersion</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="scholarships">Scholarships</SelectItem>
                    <SelectItem value="internships">Internships</SelectItem>
                    <SelectItem value="industry_projects">Industry Projects</SelectItem>
                    <SelectItem value="graduate_careers">Graduate Careers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the program, objectives, and what participants will gain..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_country" className="text-gray-300">Location Country *</Label>
                  <Input
                    id="location_country"
                    placeholder="e.g. United States"
                    value={formData.location_country}
                    onChange={(e) => handleChange('location_country', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_city" className="text-gray-300">Location City</Label>
                  <Input
                    id="location_city"
                    placeholder="e.g. Boston"
                    value={formData.location_city}
                    onChange={(e) => handleChange('location_city', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Work Mode */}
              <div className="space-y-2">
                <Label htmlFor="work_mode" className="text-gray-300">Work Mode</Label>
                <Select value={formData.work_mode} onValueChange={(val) => handleChange('work_mode', val)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="on_site">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_value" className="text-gray-300">Duration Value</Label>
                  <Input
                    id="duration_value"
                    type="number"
                    min="1"
                    placeholder="e.g. 8"
                    value={formData.duration_value}
                    onChange={(e) => handleChange('duration_value', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_unit" className="text-gray-300">Duration Unit</Label>
                  <Select value={formData.duration_unit} onValueChange={(val) => handleChange('duration_unit', val)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-gray-300">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="application_deadline" className="text-gray-300">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleChange('application_deadline', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Spots Available */}
              <div className="space-y-2">
                <Label htmlFor="spots_available" className="text-gray-300">Spots Available</Label>
                <Input
                  id="spots_available"
                  type="number"
                  min="1"
                  placeholder="e.g. 25"
                  value={formData.spots_available}
                  onChange={(e) => handleChange('spots_available', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-gray-300">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List any prerequisites or requirements for applicants..."
                  value={formData.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <Label htmlFor="eligibility_criteria" className="text-gray-300">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility_criteria"
                  placeholder="Describe who is eligible to apply..."
                  value={formData.eligibility_criteria}
                  onChange={(e) => handleChange('eligibility_criteria', e.target.value)}
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
                <Link
                  href="/provider/programs"
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
