/**
 * Score Certifications dimension.
 * Factors: count, issuer weight, recency.
 */
const PREMIUM_ISSUERS = ['aws', 'google', 'microsoft', 'meta', 'ibm', 'oracle', 'cisco', 'salesforce', 'adobe', 'comptia'];

export function scoreCertifications(profile: Record<string, unknown>): number {
  const certifications = (profile.certifications || []) as Array<{
    issuer?: string;
    issued_at?: string;
    name?: string;
  }>;

  if (!certifications || certifications.length === 0) return 0;

  const PER_CERT_BASE = 12;
  let total = 0;

  for (const cert of certifications) {
    let certScore = PER_CERT_BASE;

    // Issuer weight
    const issuer = (cert.issuer || '').toLowerCase();
    if (PREMIUM_ISSUERS.some(p => issuer.includes(p))) {
      certScore *= 1.5;
    }

    // Recency decay
    if (cert.issued_at) {
      const yearsAgo = (Date.now() - new Date(cert.issued_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
      certScore *= Math.pow(0.9, Math.max(0, yearsAgo - 1));
    }

    total += certScore;
  }

  return Math.min(100, Math.max(0, Math.round(total)));
}
