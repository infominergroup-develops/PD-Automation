import { describe, expect, it } from 'vitest';
import { buildExecutiveSummary, describeBusinessVintage, describeStaffing } from '../src/utils/pdSummaries';

// Verbatim copies of the inline template expressions these helpers replaced
const legacyVintage = (
  businessAgeYears: number | '',
  businessAgeApprox: boolean,
  previousOccupation: string,
  previousOccupationOther: string,
  reasonToLeave: string,
) =>
  `${businessAgeApprox ? 'Approximately ' : ''}${businessAgeYears ? `${String(businessAgeYears).padStart(2, '0')} years in business.` : ''}${businessAgeYears !== '' && businessAgeYears < 10 ? `${previousOccupation ? ` Prior to this, engaged in ${previousOccupation === 'Other' ? previousOccupationOther : previousOccupation === 'Business' ? `business (${previousOccupationOther})` : previousOccupation === 'Salaried Employment' ? `salaried employment (${previousOccupationOther})` : previousOccupation.toLowerCase()}.` : ''}${reasonToLeave ? (reasonToLeave === 'Not informed' ? ' Reason for leaving the last occupation was not informed.' : reasonToLeave.trim() ? ` Left the last occupation due to: ${reasonToLeave.trim()}.` : '') : ''}` : ''}`.trim();

const legacyStaffing = (externalStaffCount: number, businessManagedBy: string[], businessManagedByOther: string) =>
  `${externalStaffCount === 0 ? 'No external staff/labour is engaged. ' : `${externalStaffCount} external staff/labour engaged. `}${businessManagedBy.length > 0 ? `Business operations are managed by ${businessManagedBy.map((m) => (m === 'Other' ? businessManagedByOther : m)).join(', ')}.` : ''}`.trim();

describe('describeBusinessVintage', () => {
  it('matches the previous wording for every combination of answers', () => {
    for (const years of ['', 0, 3, 9, 10, 25] as const)
      for (const approximate of [false, true])
        for (const previousOccupation of ['', 'Agriculture', 'Other', 'Business', 'Salaried Employment'])
          for (const reasonToLeave of ['', '  ', 'Not informed', ' Better income ']) {
            const input = {
              years,
              approximate,
              previousOccupation,
              previousOccupationOther: 'Tailoring',
              reasonToLeave,
            };
            // The old expression left a double space when "approximately" was ticked without a year count
            expect(describeBusinessVintage(input)).toBe(
              legacyVintage(years, approximate, previousOccupation, 'Tailoring', reasonToLeave).replace(/ {2,}/g, ' '),
            );
          }
  });

  it('reads naturally', () => {
    expect(
      describeBusinessVintage({
        years: 4,
        approximate: true,
        previousOccupation: 'Agriculture',
        previousOccupationOther: '',
        reasonToLeave: 'Better income',
      }),
    ).toBe(
      'Approximately 04 years in business. Prior to this, engaged in agriculture. Left the last occupation due to: Better income.',
    );
  });
});

describe('describeStaffing', () => {
  it('matches the previous wording for every combination of answers', () => {
    for (const externalStaffCount of [0, 1, 4])
      for (const managedBy of [[], ['Applicant'], ['Applicant', 'Son'], ['Other'], ['Applicant', 'Other']]) {
        expect(describeStaffing({ externalStaffCount, managedBy, managedByOther: 'Nephew' })).toBe(
          legacyStaffing(externalStaffCount, managedBy, 'Nephew'),
        );
      }
  });
});

describe('buildExecutiveSummary', () => {
  const input = {
    applicantName: 'Asha Verma',
    firmName: 'Verma Atta Chakki',
    categoryName: 'Atta Chakki',
    vintage: '06 years in business.',
    monthlySales: 150000,
    grossMarginPct: 20,
    grossProfit: 30000,
    operatingExpenses: 8000,
    existingEmis: 3000,
    householdExpenses: 9000,
    disposableSurplus: 25000,
    appliedAmount: 300000,
    interestRatePct: 24,
    tenureMonths: 36,
    proposedEmi: 11770,
    dscrRatio: 2.12,
    foirPct: 41,
    residenceNeighbourCheckDone: true,
    residenceConfirmed: 'Confirmed',
    residenceNeighbourFeedback: 'Positive',
    residenceNegativeFeedback: false,
    residenceNegativeDetails: '',
    businessNeighbourFeedback: 'Runs the mill for years',
  };

  it('writes each section from the figures it is given', () => {
    const summary = buildExecutiveSummary(input);
    expect(summary.borrowerProfile).toBe('Asha Verma operates Verma Atta Chakki (Atta Chakki). 06 years in business.');
    expect(summary.salesWaterfall).toContain('existing obligations of ₹3,000');
    expect(summary.salesWaterfall).toContain('net monthly disposable surplus stands at ₹25,000.');
    expect(summary.debtService).toContain('requires a monthly EMI of ₹11,770');
    expect(summary.debtService).toMatch(/fully satisfying institutional credit guidelines\.$/);
    expect(summary.community).toBe(
      'Residence Neighbor Verification: Neighbours confirmed that the applicant has been residing at the given address. ' +
        'Feedback: Positive. Business Neighbor Verification: Runs the mill for years.',
    );
  });

  it('flags a case outside DSCR / FOIR policy and an unverified residence', () => {
    const summary = buildExecutiveSummary({ ...input, dscrRatio: 1.1, residenceNeighbourCheckDone: false });
    expect(summary.debtService).toMatch(/falling outside standard institutional credit guidelines\.$/);
    expect(summary.community).toMatch(/^Residence Neighbor Verification: Not Conducted\./);
  });

  it('emphasises key figures when asked (HTML report)', () => {
    const html = buildExecutiveSummary(input, (text) => `<b>${text}</b>`);
    expect(html.borrowerProfile).toContain('<b>Verma Atta Chakki</b>');
    expect(html.salesWaterfall).toContain('<b>₹1,50,000</b>');
    expect(html.debtService).toContain('<b>2.12x</b>');
  });
});
