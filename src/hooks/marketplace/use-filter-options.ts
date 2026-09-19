'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface FilterOptions {
  countries: string[];
  skills: { id: string; name: string }[];
  industries: string[];
}

export function useFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const supabase = createClient();

      const [skillsRes, industriesRes, countriesRes] = await Promise.all([
        supabase.from('skills_master').select('id, name').order('name'),
        supabase.from('industries').select('name').order('name'),
        supabase.from('opportunities').select('location_country').eq('status', 'published'),
      ]);

      const uniqueCountries = [...new Set(
        (countriesRes.data || []).map((r: any) => r.location_country).filter(Boolean)
      )].sort();

      return {
        countries: uniqueCountries as string[],
        skills: skillsRes.data || [],
        industries: (industriesRes.data || []).map((i: any) => i.name),
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
