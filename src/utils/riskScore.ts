/**
 * Automated credit risk score shown on the Decision tab ("Automated Credit Assessment & Risk Scoring Report").
 * DSCR and FOIR must be computed from the applicant's income sheet (see PDToolView `incomeSheet`), so the
 * score agrees with the figures printed in the report.
 */

export type RiskDecision = 'APPROVED' | 'CONDITIONAL' | 'REJECTED';

export interface RiskInput {
  dscrRatio: number;
  foirPct: number;
  /** Years in business, or years with the current employer for salaried applicants. */
  vintageYears: number;
  vintageLabel: 'business' | 'employment';
  /** Ownership as saved on the form, e.g. "Self-Owned", "OWN", "Rented", "RENTED", "Family-Owned". */
  residenceOwnership: string;
  premisesOwnership: string;
  neighborFeedback: string;
  landlordFeedback: string;
}

export interface RiskResult {
  score: number;
  decision: RiskDecision;
  flags: string[];
  strengths: string[];
}

type OwnershipKind = 'owned' | 'rented' | 'unknown';

/** The form stores ownership in several spellings ("Self-Owned", "OWN", "FAMILY", "Rented", "RENTED"). */
export function ownershipKind(value: string | undefined): OwnershipKind {
  const v = (value || '').toUpperCase();
  if (/RENT|LEASE/.test(v)) return 'rented';
  if (/OWN|FAMILY/.test(v)) return 'owned';
  return 'unknown';
}

export function assessRisk(input: RiskInput): RiskResult {
  let score = 85;
  const flags: string[] = [];
  const strengths: string[] = [];
  const { dscrRatio, foirPct, vintageYears, vintageLabel } = input;

  if (dscrRatio >= 1.25) {
    strengths.push(`Healthy DSCR of ${dscrRatio}x (exceeds 1.25x policy norm)`);
  } else {
    score -= 25;
    flags.push(`DSCR of ${dscrRatio}x is below standard 1.25x minimum requirement`);
  }

  if (foirPct <= 60) {
    strengths.push(`FOIR of ${foirPct}% within 60% cap`);
  } else {
    score -= 20;
    flags.push(`High FOIR obligation (${foirPct}% exceeds 60% threshold)`);
  }

  if (vintageYears >= 3) {
    strengths.push(`Stable ${vintageLabel} vintage of ${vintageYears} years`);
  } else {
    score -= 10;
    flags.push(`${vintageLabel === 'business' ? 'Business' : 'Employment'} vintage under 3 years`);
  }

  const residence = ownershipKind(input.residenceOwnership);
  if (residence === 'owned') {
    strengths.push('Applicant owns their residence, demonstrating stability');
    score += 5;
  } else if (residence === 'rented') {
    flags.push('Rented residence (monitor stability)');
    score -= 5;
  }

  const premises = ownershipKind(input.premisesOwnership);
  if (premises === 'owned') {
    strengths.push('Applicant owns the business premises, reducing operational risk');
    score += 5;
  } else if (premises === 'rented') {
    flags.push('Rented business premises');
    score -= 5;
  }

  const neighbor = input.neighborFeedback.toUpperCase();
  if (neighbor.includes('NEGATIVE')) {
    score -= 15;
    flags.push('Negative feedback received from neighbors');
  } else if (neighbor.includes('POSITIVE')) {
    strengths.push('Positive feedback received from neighbors');
  }

  if (input.landlordFeedback.toUpperCase().includes('NEGATIVE')) {
    score -= 15;
    flags.push('Negative feedback received from landlord');
  }

  score = Math.max(0, Math.min(100, score));

  let decision: RiskDecision = 'APPROVED';
  if (score < 50 || dscrRatio < 1.0) decision = 'REJECTED';
  else if (score < 75 || dscrRatio < 1.25 || foirPct > 65) decision = 'CONDITIONAL';

  return { score, decision, flags, strengths };
}
