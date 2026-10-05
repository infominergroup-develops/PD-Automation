/**
 * Sentences the PD form pre-fills from structured answers. The same wording is shown in the
 * form preview, the Decision tab's executive summary and the printed report, so it lives here.
 */

export interface BusinessVintageInput {
  years: number | '';
  approximate: boolean;
  previousOccupation: string;
  previousOccupationOther: string;
  reasonToLeave: string;
}

/** E.g. "Approximately 04 years in business. Prior to this, engaged in agriculture." ('' when nothing was entered). */
export function describeBusinessVintage({
  years,
  approximate,
  previousOccupation,
  previousOccupationOther,
  reasonToLeave,
}: BusinessVintageInput): string {
  const parts: string[] = [];
  if (approximate) parts.push('Approximately');
  if (years) parts.push(`${String(years).padStart(2, '0')} years in business.`);

  // Earlier occupation is only relevant for businesses under 10 years old
  if (years !== '' && years < 10) {
    if (previousOccupation)
      parts.push(
        `Prior to this, engaged in ${describePreviousOccupation(previousOccupation, previousOccupationOther)}.`,
      );
    const reason = reasonToLeave.trim();
    if (reason === 'Not informed') parts.push('Reason for leaving the last occupation was not informed.');
    else if (reason) parts.push(`Left the last occupation due to: ${reason}.`);
  }
  return parts.join(' ');
}

function describePreviousOccupation(occupation: string, detail: string): string {
  if (occupation === 'Other') return detail;
  if (occupation === 'Business') return `business (${detail})`;
  if (occupation === 'Salaried Employment') return `salaried employment (${detail})`;
  return occupation.toLowerCase();
}

export interface StaffingInput {
  externalStaffCount: number;
  managedBy: string[];
  managedByOther: string;
}

/** E.g. "2 external staff/labour engaged. Business operations are managed by Applicant, Son." */
export function describeStaffing({ externalStaffCount, managedBy, managedByOther }: StaffingInput): string {
  const staff =
    externalStaffCount === 0
      ? 'No external staff/labour is engaged.'
      : `${externalStaffCount} external staff/labour engaged.`;
  if (managedBy.length === 0) return staff;
  const managers = managedBy.map((m) => (m === 'Other' ? managedByOther : m)).join(', ');
  return `${staff} Business operations are managed by ${managers}.`;
}

const inr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export interface ExecutiveSummaryInput {
  applicantName: string;
  firmName: string;
  categoryName: string;
  /** Already-resolved vintage sentence (user's text, or describeBusinessVintage output). */
  vintage: string;
  monthlySales: number;
  grossMarginPct: number;
  grossProfit: number;
  operatingExpenses: number;
  existingEmis: number;
  householdExpenses: number;
  /** Family surplus before the proposed EMI, including co-applicant and other income. */
  disposableSurplus: number;
  appliedAmount: number;
  interestRatePct: number;
  tenureMonths: number;
  proposedEmi: number;
  dscrRatio: number;
  foirPct: number;
  residenceNeighbourCheckDone: boolean;
  residenceConfirmed: string;
  residenceNeighbourFeedback: string;
  residenceNegativeFeedback: boolean;
  residenceNegativeDetails: string;
  businessNeighbourFeedback: string;
}

export interface ExecutiveSummary {
  borrowerProfile: string;
  salesWaterfall: string;
  debtService: string;
  community: string;
}

export const EXECUTIVE_SUMMARY_TITLES: Record<keyof ExecutiveSummary, string> = {
  borrowerProfile: 'Borrower & Vintage Profile',
  salesWaterfall: 'Sales & Cash Flow Waterfall',
  debtService: 'Debt Service Capacity & Policy Compliance',
  community: 'Community Verification',
};

/**
 * The four-part executive summary shown on the Decision tab and printed in the reports.
 * `emphasize` wraps key figures (e.g. in <strong> for the HTML report); plain text by default.
 */
export function buildExecutiveSummary(
  input: ExecutiveSummaryInput,
  emphasize: (text: string) => string = (text) => text,
): ExecutiveSummary {
  const em = emphasize;
  const withinPolicy = input.dscrRatio >= 1.25 && input.foirPct <= 60;

  const residence = input.residenceNeighbourCheckDone
    ? [
        `Residence Neighbor Verification: Neighbours ${
          input.residenceConfirmed === 'Confirmed'
            ? 'confirmed'
            : (input.residenceConfirmed || 'did not confirm').toLowerCase()
        } that the applicant has been residing at the given address.`,
        `Feedback: ${input.residenceNeighbourFeedback || 'Not provided'}.`,
        input.residenceNegativeFeedback ? `Negative Details: ${input.residenceNegativeDetails}` : '',
      ]
    : ['Residence Neighbor Verification: Not Conducted.'];

  return {
    borrowerProfile: `${input.applicantName} operates ${em(input.firmName)} (${input.categoryName}). ${input.vintage}`,
    salesWaterfall:
      `The business generates an assessed monthly revenue of ${em(inr(input.monthlySales))}. ` +
      `Gross profit margin is assessed at ${em(`${input.grossMarginPct}% (${inr(input.grossProfit)})`)}. ` +
      `After total business operating expenses of ${em(inr(input.operatingExpenses))}, ` +
      `existing obligations of ${em(inr(input.existingEmis))}, ` +
      `and household living costs of ${em(inr(input.householdExpenses))}, ` +
      `net monthly disposable surplus stands at ${em(inr(input.disposableSurplus))}.`,
    debtService:
      `The requested micro-lending facility of ${em(inr(input.appliedAmount))} at ${input.interestRatePct}% for ` +
      `${input.tenureMonths} months requires a monthly EMI of ${em(inr(input.proposedEmi))}. ` +
      `The post-loan DSCR is calculated at ${em(`${input.dscrRatio}x`)} (policy threshold ≥ 1.25x) with FOIR at ` +
      `${em(`${input.foirPct}%`)} (policy cap ≤ 60%), ` +
      (withinPolicy
        ? 'fully satisfying institutional credit guidelines.'
        : 'falling outside standard institutional credit guidelines.'),
    community: [...residence, `Business Neighbor Verification: ${input.businessNeighbourFeedback || 'Not provided'}.`]
      .filter(Boolean)
      .join(' '),
  };
}
