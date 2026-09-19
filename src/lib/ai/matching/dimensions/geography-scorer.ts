import type { DimensionScore } from '../types';

interface StudentLocation {
  current_country?: string;
  current_city?: string;
}

interface StudentPreferences {
  visa_eligible_countries?: string[];
}

interface OpportunityLocation {
  location_country?: string;
  location_city?: string;
  visa_support?: boolean;
}

const CONTINENT_MAP: Record<string, string> = {
  // Major countries mapped to continents
  'united states': 'north_america', 'canada': 'north_america', 'mexico': 'north_america',
  'brazil': 'south_america', 'argentina': 'south_america', 'colombia': 'south_america', 'chile': 'south_america',
  'united kingdom': 'europe', 'germany': 'europe', 'france': 'europe', 'spain': 'europe',
  'italy': 'europe', 'netherlands': 'europe', 'sweden': 'europe', 'switzerland': 'europe',
  'poland': 'europe', 'portugal': 'europe', 'ireland': 'europe', 'austria': 'europe',
  'china': 'asia', 'japan': 'asia', 'south korea': 'asia', 'india': 'asia',
  'singapore': 'asia', 'malaysia': 'asia', 'indonesia': 'asia', 'thailand': 'asia',
  'vietnam': 'asia', 'philippines': 'asia', 'pakistan': 'asia', 'bangladesh': 'asia',
  'uae': 'asia', 'united arab emirates': 'asia', 'saudi arabia': 'asia', 'qatar': 'asia',
  'turkey': 'asia', 'israel': 'asia', 'jordan': 'asia', 'oman': 'asia', 'bahrain': 'asia', 'kuwait': 'asia',
  'australia': 'oceania', 'new zealand': 'oceania',
  'south africa': 'africa', 'nigeria': 'africa', 'kenya': 'africa', 'egypt': 'africa',
  'morocco': 'africa', 'ghana': 'africa', 'ethiopia': 'africa',
};

function getContinent(country: string): string | null {
  return CONTINENT_MAP[country.toLowerCase()] || null;
}

/**
 * Calculate geography dimension score based on proximity and visa eligibility.
 */
export function calculateGeographyScore(
  studentLocation: StudentLocation,
  studentPreferences: StudentPreferences,
  opportunityLocation: OpportunityLocation
): DimensionScore {
  if (!studentLocation.current_country || !opportunityLocation.location_country) {
    return { score: 60, weight: 0, weighted_score: 0, label: 'Geography' };
  }

  const studentCountry = studentLocation.current_country.toLowerCase();
  const oppCountry = opportunityLocation.location_country.toLowerCase();

  // Same city
  if (
    studentLocation.current_city &&
    opportunityLocation.location_city &&
    studentLocation.current_city.toLowerCase() === opportunityLocation.location_city.toLowerCase() &&
    studentCountry === oppCountry
  ) {
    return { score: 100, weight: 0, weighted_score: 0, label: 'Geography' };
  }

  // Same country
  if (studentCountry === oppCountry) {
    return { score: 80, weight: 0, weighted_score: 0, label: 'Geography' };
  }

  const studentContinent = getContinent(studentCountry);
  const oppContinent = getContinent(oppCountry);

  // Same continent
  if (studentContinent && oppContinent && studentContinent === oppContinent) {
    return { score: 60, weight: 0, weighted_score: 0, label: 'Geography' };
  }

  // Different continent — check visa eligibility
  const visaEligible =
    opportunityLocation.visa_support ||
    studentPreferences.visa_eligible_countries?.some(
      c => c.toLowerCase() === oppCountry
    );

  const score = visaEligible ? 40 : 20;
  return { score, weight: 0, weighted_score: 0, label: 'Geography' };
}
