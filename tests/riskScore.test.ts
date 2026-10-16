import { describe, expect, it } from 'vitest';
import { assessRisk, ownershipKind, type RiskInput } from '../src/utils/riskScore';

const base: RiskInput = {
  dscrRatio: 2,
  foirPct: 40,
  vintageYears: 5,
  vintageLabel: 'business',
  residenceOwnership: '',
  premisesOwnership: '',
  neighborFeedback: '',
  landlordFeedback: '',
};

describe('ownershipKind', () => {
  it('understands every spelling the form saves', () => {
    for (const v of ['Self-Owned', 'OWN', 'Owned', 'Family-Owned', 'FAMILY']) expect(ownershipKind(v), v).toBe('owned');
    for (const v of ['Rented', 'RENTED', 'Leased']) expect(ownershipKind(v), v).toBe('rented');
    for (const v of ['', 'RESIDENCE_CUM_BUSINESS', 'Other']) expect(ownershipKind(v), v).toBe('unknown');
  });
});

describe('assessRisk', () => {
  it('a strong case scores 85 and is approved', () => {
    expect(assessRisk(base)).toMatchObject({ score: 85, decision: 'APPROVED' });
  });

  it('owned residence and premises add 5 each (the form saves "Self-Owned" / "OWN")', () => {
    const r = assessRisk({ ...base, residenceOwnership: 'Self-Owned', premisesOwnership: 'OWN' });
    expect(r.score).toBe(95);
    expect(r.strengths).toContain('Applicant owns their residence, demonstrating stability');
  });

  it('uses the vintage it is given, worded for salaried applicants', () => {
    expect(assessRisk({ ...base, vintageYears: 1 }).flags).toContain('Business vintage under 3 years');
    expect(assessRisk({ ...base, vintageYears: 18, vintageLabel: 'employment' }).strengths).toContain('Stable employment vintage of 18 years');
  });

  it('weak income-sheet ratios reject the case', () => {
    const r = assessRisk({ ...base, dscrRatio: 0.8, foirPct: 85 });
    expect(r.score).toBe(40);
    expect(r.decision).toBe('REJECTED');
  });

  it('borderline DSCR makes it conditional', () => {
    expect(assessRisk({ ...base, dscrRatio: 1.1 }).decision).toBe('CONDITIONAL');
  });
});
