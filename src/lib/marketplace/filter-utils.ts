import type { MarketplaceFilters, FilterChip } from '@/types/marketplace';
import { DEFAULT_PAGE_SIZE, CATEGORY_LABELS } from './constants';

const DEFAULTS: Partial<MarketplaceFilters> = {
  q: '',
  category: [],
  country: '',
  city: '',
  workMode: '',
  compensationType: [],
  startDateFrom: '',
  startDateTo: '',
  skills: [],
  visaSupport: false,
  industry: [],
  sort: 'newest',
  order: 'desc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export function serializeFilters(filters: Partial<MarketplaceFilters>): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);
  if (filters.category?.length) params.set('category', filters.category.join(','));
  if (filters.country) params.set('country', filters.country);
  if (filters.city) params.set('city', filters.city);
  if (filters.workMode) params.set('workMode', filters.workMode);
  if (filters.durationMin) params.set('durationMin', String(filters.durationMin));
  if (filters.durationMax) params.set('durationMax', String(filters.durationMax));
  if (filters.durationUnit && filters.durationUnit !== 'months') params.set('durationUnit', filters.durationUnit);
  if (filters.compensationType?.length) params.set('compensationType', filters.compensationType.join(','));
  if (filters.compensationMin) params.set('compensationMin', String(filters.compensationMin));
  if (filters.compensationMax) params.set('compensationMax', String(filters.compensationMax));
  if (filters.startDateFrom) params.set('startDateFrom', filters.startDateFrom);
  if (filters.startDateTo) params.set('startDateTo', filters.startDateTo);
  if (filters.deadlineWithin) params.set('deadlineWithin', String(filters.deadlineWithin));
  if (filters.matchMin) params.set('matchMin', String(filters.matchMin));
  if (filters.skills?.length) params.set('skills', filters.skills.join(','));
  if (filters.visaSupport) params.set('visaSupport', 'true');
  if (filters.industry?.length) params.set('industry', filters.industry.join(','));
  if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
  if (filters.order && filters.order !== 'desc') params.set('order', filters.order);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  if (filters.pageSize && filters.pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(filters.pageSize));

  return params;
}

export function deserializeFilters(params: URLSearchParams): Partial<MarketplaceFilters> {
  const filters: Partial<MarketplaceFilters> = {};

  const q = params.get('q');
  if (q) filters.q = q;

  const category = params.get('category');
  if (category) filters.category = category.split(',').filter(Boolean) as MarketplaceFilters['category'];

  const country = params.get('country');
  if (country) filters.country = country;

  const city = params.get('city');
  if (city) filters.city = city;

  const workMode = params.get('workMode');
  if (workMode) filters.workMode = workMode as MarketplaceFilters['workMode'];

  const durationMin = params.get('durationMin');
  if (durationMin) filters.durationMin = Number(durationMin);

  const durationMax = params.get('durationMax');
  if (durationMax) filters.durationMax = Number(durationMax);

  const durationUnit = params.get('durationUnit');
  if (durationUnit) filters.durationUnit = durationUnit as MarketplaceFilters['durationUnit'];

  const compensationType = params.get('compensationType');
  if (compensationType) filters.compensationType = compensationType.split(',').filter(Boolean) as MarketplaceFilters['compensationType'];

  const compensationMin = params.get('compensationMin');
  if (compensationMin) filters.compensationMin = Number(compensationMin);

  const compensationMax = params.get('compensationMax');
  if (compensationMax) filters.compensationMax = Number(compensationMax);

  const startDateFrom = params.get('startDateFrom');
  if (startDateFrom) filters.startDateFrom = startDateFrom;

  const startDateTo = params.get('startDateTo');
  if (startDateTo) filters.startDateTo = startDateTo;

  const deadlineWithin = params.get('deadlineWithin');
  if (deadlineWithin) filters.deadlineWithin = Number(deadlineWithin);

  const matchMin = params.get('matchMin');
  if (matchMin) filters.matchMin = Number(matchMin);

  const skills = params.get('skills');
  if (skills) filters.skills = skills.split(',').filter(Boolean);

  const visaSupport = params.get('visaSupport');
  if (visaSupport === 'true') filters.visaSupport = true;

  const industry = params.get('industry');
  if (industry) filters.industry = industry.split(',').filter(Boolean);

  const sort = params.get('sort');
  if (sort) filters.sort = sort as MarketplaceFilters['sort'];

  const order = params.get('order');
  if (order) filters.order = order as MarketplaceFilters['order'];

  const page = params.get('page');
  if (page) filters.page = Number(page);

  const pageSize = params.get('pageSize');
  if (pageSize) filters.pageSize = Number(pageSize);

  return filters;
}

export function getActiveFilterCount(filters: Partial<MarketplaceFilters>): number {
  let count = 0;
  if (filters.q) count++;
  if (filters.category?.length) count++;
  if (filters.country) count++;
  if (filters.city) count++;
  if (filters.workMode) count++;
  if (filters.durationMin || filters.durationMax) count++;
  if (filters.compensationType?.length) count++;
  if (filters.compensationMin || filters.compensationMax) count++;
  if (filters.startDateFrom || filters.startDateTo) count++;
  if (filters.deadlineWithin) count++;
  if (filters.matchMin) count++;
  if (filters.skills?.length) count++;
  if (filters.visaSupport) count++;
  if (filters.industry?.length) count++;
  return count;
}

export function getActiveFilterLabels(filters: Partial<MarketplaceFilters>): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.q) {
    chips.push({ key: 'q', label: 'Search', value: `"${filters.q}"` });
  }
  filters.category?.forEach((cat) => {
    chips.push({ key: 'category', label: 'Category', value: CATEGORY_LABELS[cat] || cat });
  });
  if (filters.country) {
    chips.push({ key: 'country', label: 'Country', value: filters.country });
  }
  if (filters.city) {
    chips.push({ key: 'city', label: 'City', value: filters.city });
  }
  if (filters.workMode) {
    const labels: Record<string, string> = { on_site: 'On-site', remote: 'Remote', hybrid: 'Hybrid' };
    chips.push({ key: 'workMode', label: 'Mode', value: labels[filters.workMode] || filters.workMode });
  }
  if (filters.durationMin || filters.durationMax) {
    chips.push({ key: 'duration', label: 'Duration', value: `${filters.durationMin || 0}-${filters.durationMax || '∞'} ${filters.durationUnit || 'months'}` });
  }
  filters.compensationType?.forEach((type) => {
    chips.push({ key: 'compensationType', label: 'Pay', value: type.charAt(0).toUpperCase() + type.slice(1) });
  });
  if (filters.visaSupport) {
    chips.push({ key: 'visaSupport', label: 'Visa', value: 'Sponsorship Available' });
  }
  filters.skills?.forEach((skill) => {
    chips.push({ key: 'skills', label: 'Skill', value: skill });
  });
  filters.industry?.forEach((ind) => {
    chips.push({ key: 'industry', label: 'Industry', value: ind });
  });
  if (filters.matchMin) {
    chips.push({ key: 'matchMin', label: 'Min Match', value: `${filters.matchMin}%` });
  }
  if (filters.deadlineWithin) {
    chips.push({ key: 'deadlineWithin', label: 'Deadline', value: `Within ${filters.deadlineWithin} days` });
  }

  return chips;
}

export function removeFilter(
  filters: Partial<MarketplaceFilters>,
  key: string,
  value?: string
): Partial<MarketplaceFilters> {
  const updated = { ...filters };

  switch (key) {
    case 'q': updated.q = ''; break;
    case 'category':
      updated.category = value
        ? (updated.category || []).filter((c) => CATEGORY_LABELS[c] !== value && c !== value)
        : [];
      break;
    case 'country': updated.country = ''; updated.city = ''; break;
    case 'city': updated.city = ''; break;
    case 'workMode': updated.workMode = ''; break;
    case 'duration':
      updated.durationMin = undefined as unknown as number;
      updated.durationMax = undefined as unknown as number;
      break;
    case 'compensationType':
      updated.compensationType = value
        ? (updated.compensationType || []).filter((t) => t !== value.toLowerCase())
        : [];
      break;
    case 'visaSupport': updated.visaSupport = false; break;
    case 'skills':
      updated.skills = value
        ? (updated.skills || []).filter((s) => s !== value)
        : [];
      break;
    case 'industry':
      updated.industry = value
        ? (updated.industry || []).filter((i) => i !== value)
        : [];
      break;
    case 'matchMin': updated.matchMin = undefined as unknown as number; break;
    case 'deadlineWithin': updated.deadlineWithin = undefined as unknown as number; break;
    default: break;
  }

  // Reset page on filter removal
  updated.page = 1;
  return updated;
}
