import type { CreditAccount } from '../../types/creditTypes';
import {
  PDReportPrintData,
  formatReportDate,
  getUniversalCoverPageCSS,
  getUniversalCoverPageHTML,
  isProvided,
} from '../pdReportPrinter';

const LENDER = 'Ambit Finvest Pvt. Ltd.';

const fmt = (n: unknown) => (Number(n) || 0).toLocaleString('en-IN');
const orDash = (v: unknown) => (isProvided(v) ? v : '-');
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const countWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const pad2 = (n: number) => String(n).padStart(2, '0');

// Photo groups in the order the Ambit salaried format lists them.
const PHOTO_SECTIONS: Array<{ category: string; title: string }> = [
  { category: 'KYC PHOTOS', title: 'KYC' },
  { category: 'RESIDENCE VISIT PHOTO', title: 'Residence visit photos' },
  { category: 'Collateral Photos', title: 'Collateral Property' },
  { category: 'BUSINESS VISIT PHOTO', title: 'Office visit photos' },
  { category: 'BUSINESS DOCUMENTS', title: 'Office Documents Photos' },
];

// Older saved records may still carry these legacy keys alongside the typed ones.
type FamilyRow = NonNullable<PDReportPrintData['familyMembers']>[number] & {
  relation?: string;
  education?: string;
  dependent?: boolean | string;
};
interface BankRow {
  bankName?: string;
  branchName?: string;
  accountType?: string;
  limit?: string;
  ccOdLimit?: string;
  accountNo?: string;
  remark?: string;
}
interface CoApplicantRow {
  name?: string;
  relation?: string;
  mobileNumber?: string;
  phone?: string;
}

interface ReportLine {
  particulars: string;
  businessNotes?: string;
  monthly: number;
  yearly?: number;
}

const filledLines = (lines?: ReportLine[]) =>
  (lines || []).filter(l => (Number(l.monthly) || 0) > 0 && l.particulars && l.particulars.trim() !== '');
const sumMonthly = (lines: ReportLine[]) => lines.reduce((s, l) => s + (Number(l.monthly) || 0), 0);
const sumYearly = (lines: ReportLine[]) =>
  lines.reduce((s, l) => s + (Number(l.yearly) || (Number(l.monthly) || 0) * 12), 0);

function lineRows(lines: ReportLine[]): string {
  return lines
    .map(
      l => `
    <tr class="text-center">
      <td class="text-left">${l.particulars}</td>
      <td class="text-left">${l.businessNotes || ''}</td>
      <td>${fmt(l.monthly)}</td>
      <td>${fmt(l.yearly || (Number(l.monthly) || 0) * 12)}</td>
    </tr>`,
    )
    .join('');
}

function loanAmountText(data: PDReportPrintData): string {
  const amt = Number(data.appliedAmount || data.loanAmount) || 0;
  if (amt <= 0) return 'Not provided';
  return amt >= 100000 ? `${+(amt / 100000).toFixed(2)} Lakh` : `Rs. ${fmt(amt)}/-`;
}

/** Ambit Finvest income-assessment report for a salaried applicant (office visit instead of business visit). */
export function generateAmbitSalariedPDReportHTML(data: PDReportPrintData): string {
  const appNo = data.applicationNumber || 'Not Provided';
  const initiationDate = formatReportDate(data.caseInitiationDate) || '-';
  const visitDate = formatReportDate(data.visitDate) || '-';
  const reportDate = formatReportDate(data.reportDate || data.visitDate) || '-';
  const caseStatus = data.statusOfCase || data.businessStatus || 'Recommended';
  const applicant = data.applicantName || 'Applicant';

  // Co-applicant (first one) for the top sheet and the CRIF obligation split.
  const coApp: CoApplicantRow | null = data.coApplicants && data.coApplicants.length > 0 ? data.coApplicants[0] : null;
  const coAppName = coApp?.name || data.coApplicantName || '';
  const coAppRelation = coApp?.relation || data.coApplicantRelation || '';
  const coAppPhone = coApp?.mobileNumber || coApp?.phone || data.coApplicantPhone || '0';

  // ---- Applicant income sheet: salary (A) − expenses (B), less the applicant's share of household ----
  const incomeLines = filledLines(data.itemizedSales as ReportLine[]);
  const salaryLines: ReportLine[] = incomeLines.length > 0
    ? incomeLines
    : [{ particulars: 'Income from office', businessNotes: '', monthly: Number(data.totalSalesMonthly) || 0 }];
  const totalIncomeM = sumMonthly(salaryLines);
  const totalIncomeY = sumYearly(salaryLines);

  const expenseLines = filledLines(data.itemizedExpenses as ReportLine[]);
  const shownExpenses: ReportLine[] = expenseLines.length > 0
    ? expenseLines
    : [{ particulars: 'Other expenses', businessNotes: '', monthly: 0 }];
  const totalExpM = sumMonthly(expenseLines);
  const totalExpY = sumYearly(expenseLines);

  const netM = totalIncomeM - totalExpM;
  const netY = totalIncomeY - totalExpY;

  const householdM = Number(data.householdExpensesMonthly) || Number(data.householdExpenses)
    || Number(data.monthlyHouseholdExpenses) || 0;
  const earners = Math.max(1, Math.round(Number(data.earningMembersCount) || 1));
  const householdShareM = Math.round(householdM / earners);
  const householdNote = isProvided(data.householdExpensesNotes)
    ? data.householdExpensesNotes!
    : earners > 1
      ? `The applicant’s family has ${countWord(earners)} earning members, and the total monthly household expenses are ₹${fmt(householdM)}. Accordingly, the expense per earning member comes to approximately ₹${fmt(householdShareM)} per month.`
      : `The applicant is the only earning member of the family, and the total monthly household expenses are ₹${fmt(householdM)}.`;

  const netDisposalM = netM - householdShareM;
  const netDisposalY = netY - householdShareM * 12;

  // ---- Existing loans (CRIF), split between applicant and co-applicant ----
  const crifAccounts: CreditAccount[] = data.parsedCreditReport?.accounts || [];
  const isCoAppLoan = (owner?: string | null) =>
    Boolean(coAppName && owner && owner.trim().toLowerCase() === coAppName.trim().toLowerCase());
  const appAccounts = crifAccounts.filter(a => !isCoAppLoan(a.applicantName));
  const coAppAccounts = crifAccounts.filter(a => isCoAppLoan(a.applicantName));
  const emiOf = (accounts: CreditAccount[]) => accounts.reduce((s, a) => s + (Number(a.instalmentAmount) || 0), 0);
  const appEmiM = crifAccounts.length > 0 ? emiOf(appAccounts) : Number(data.existingEmiMonthly) || 0;
  const coAppEmiM = emiOf(coAppAccounts);
  const obligationLine = (who: string, count: number, emi: number) =>
    count > 0 || emi > 0
      ? `The ${who} currently has ${pad2(count)} running obligations, the amount of which is Rs. ${fmt(emi)}/- per month. ( As per CRIF Report )`
      : `The ${who} currently has no running obligations.`;

  const loanRows = crifAccounts.length > 0
    ? crifAccounts.map((a, i) => `
      <tr class="text-center small">
        <td>${i + 1}</td>
        <td>${a.applicantName || applicant}</td>
        <td>${a.accountType || '-'}</td>
        <td>${a.creditGrantor || '-'}</td>
        <td>${a.lenderType || '-'}</td>
        <td>${a.ownership || (isCoAppLoan(a.applicantName) ? 'Co-applicant' : 'Applicant')}</td>
        <td>${a.disbursedDate || '-'}</td>
        <td>${a.disbursedAmount ? fmt(a.disbursedAmount) : '-'}</td>
        <td>${a.instalmentAmount ? fmt(a.instalmentAmount) : '-'}</td>
        <td>${a.tenureMonths || '-'}</td>
        <td>${a.status || '-'}</td>
      </tr>`).join('')
    : `<tr class="text-center small"><td>1</td><td colspan="10">No existing loans reported.</td></tr>`;

  // ---- Co-applicant income sheet (only when the co-applicant's business was assessed) ----
  const coSales = filledLines(data.coApplicantItemizedSales as ReportLine[]);
  const coExpenses = filledLines(data.coApplicantItemizedExpenses as ReportLine[]);
  const coSalesM = coSales.length > 0 ? sumMonthly(coSales) : Number(data.coApplicantTotalSalesMonthly) || 0;
  const coSalesY = coSales.length > 0 ? sumYearly(coSales) : coSalesM * 12;
  const coExpM = coExpenses.length > 0 ? sumMonthly(coExpenses) : Number(data.coApplicantTotalExpensesMonthly) || 0;
  const coExpY = coExpenses.length > 0 ? sumYearly(coExpenses) : coExpM * 12;
  const coNetM = coSalesM - coExpM;
  // With more than one earning member the co-applicant carries a share of the household too.
  const coHouseholdM = earners > 1 ? householdShareM : 0;
  const coDisposalM = coNetM - coAppEmiM - coHouseholdM;
  const showCoAppSheet = Boolean(data.hasCoApplicantBusiness) || coSalesM > 0;

  const staffList = (data.officeStaffContacts || []).filter(s => s.name);
  const bankingList = (data.bankingDetails || []) as BankRow[];
  const familyList: FamilyRow[] = data.familyMembers && data.familyMembers.length > 0
    ? data.familyMembers
    : [{ name: applicant, age: '', relationship: 'Self', occupation: 'Salaried', isDependent: false }];
  const showCollateral = Boolean(data.hasCollateral) || isProvided(data.collateralAddress);
  const residenceElectricity = isProvided(data.residenceElectricityDetails)
    ? data.residenceElectricityDetails
    : 'During verification, the electricity bill/meter was not found';

  const photoPages = PHOTO_SECTIONS.map(({ category, title }) => {
    const group = (data.photos || []).filter(p => p.category === category);
    if (group.length === 0) return '';
    return `
  <div class="page-break"></div>
  <table>
    <tr><td class="sec-head">${title}</td></tr>
    <tr><td>
      <div class="photo-grid">
        ${group.map(p => `
          <div class="photo-card">
            <img src="${p.dataUrl}" alt="${p.name || title}" />
            <div class="photo-caption">${p.name || title}</div>
          </div>`).join('')}
      </div>
    </td></tr>
  </table>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${LENDER} (Salaried) - ${appNo}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 9pt; color: #000; background: #fff; margin: 0; padding: 0; line-height: 1.35; }
    .page-break { page-break-before: always; margin-top: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
    .sec-head { text-align: center; font-weight: bold; font-size: 10pt; background-color: #f3f4f6; }
    .label { background-color: #f3f4f6; width: 25%; }
    .bold { font-weight: bold; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .shade { background-color: #e5e7eb; font-weight: bold; }
    .small { font-size: 8pt; }
    .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .photo-card { border: 1px solid #000; padding: 5px; text-align: center; }
    .photo-card img { max-width: 100%; max-height: 250px; display: block; margin: 0 auto; object-fit: contain; }
    .photo-caption { font-size: 8pt; margin-top: 5px; font-weight: bold; }
    @media print { .no-print { display: none !important; } }
    ${getUniversalCoverPageCSS()}
  </style>
</head>
<body>
  ${getUniversalCoverPageHTML(data, appNo, reportDate, caseStatus)}

  <table>
    <tr><td colspan="4" class="sec-head" style="font-size: 12pt;">${data.companyHeader?.name || 'Infominer Services Pvt. Ltd.'}</td></tr>
    <tr><td colspan="4">To,</td></tr>
    <tr>
      <td colspan="2" style="width: 50%; vertical-align: top;">${LENDER}<br/><br/>Dear Sir/Madam,<br/><br/>Sub: Income Assesment of ${applicant}</td>
      <td colspan="2" style="padding: 0;">
        <table style="margin: 0; border: none;">
          <tr><td class="label text-center" style="border-top: none; border-left: none; width: 45%;">Date of Initiation</td><td class="text-center" style="border-top: none; border-right: none;">${initiationDate}</td></tr>
          <tr><td class="label text-center" style="border-left: none;">Application ID</td><td class="text-center" style="border-right: none;">${appNo}</td></tr>
          <tr><td class="label text-center" style="border-left: none; border-bottom: none;">Status of case</td><td class="text-center" style="border-right: none; border-bottom: none;">${caseStatus}</td></tr>
        </table>
      </td>
    </tr>
    <tr><td colspan="4">Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:</td></tr>
    <tr><td colspan="4" class="sec-head">Case Profile</td></tr>
    <tr><td class="label">Visit date</td><td>${visitDate}</td><td class="label">Report date</td><td>${reportDate}</td></tr>
    <tr><td class="label">Name of applicant</td><td colspan="3">${applicant}</td></tr>
    <tr><td class="label">Contact Number</td><td colspan="3">${data.applicantPhone || '0'}</td></tr>
    <tr><td class="label">Office firm name</td><td colspan="3">${orDash(data.firmName)}</td></tr>
    <tr><td class="label">Co-applicant Name with relation</td><td colspan="3">${coAppName ? `${coAppName}${coAppRelation ? ` (${coAppRelation})` : ''}` : '-'}</td></tr>
    <tr><td class="label">Contact Number</td><td colspan="3">${coAppName ? coAppPhone : '-'}</td></tr>
    <tr><td class="label">Loan Amount (Provided)</td><td colspan="3">${loanAmountText(data)}</td></tr>
    <tr><td class="label">Product</td><td colspan="3">${orDash(data.loanType)}</td></tr>
    <tr><td class="label">Purpose of Loan (as per applicant)</td><td colspan="3">${orDash(data.loanPurpose)}</td></tr>
    <tr><td class="label">Address of the residence</td><td colspan="3">${orDash(data.residenceAddress)}</td></tr>
    <tr><td class="label">Address of the Office</td><td colspan="3">${orDash(data.businessAddress)}</td></tr>
    <tr><td class="label">Address of the collateral property</td><td colspan="3">${orDash(data.collateralAddress)}</td></tr>
    <tr><td class="label">Met person during visit time.</td><td colspan="3">${orDash(data.metPersonName)}</td></tr>
    <tr><td class="label">Met person identity proof</td><td colspan="3">${data.metPersonIdProof || 'PAN Card'}</td></tr>
    <tr><td class="label">Executive Name</td><td colspan="3">${orDash(data.executiveName)}</td></tr>
  </table>

  <div class="page-break"></div>
  <table>
    <tr><td colspan="7" class="sec-head">Details of residence visit</td></tr>
    <tr><td colspan="2" class="label">Met person during visit time.</td><td colspan="5">${orDash(data.metPersonName)}</td></tr>
    <tr><td colspan="2" class="label">Address of the meeting</td><td colspan="5">${orDash(data.residenceAddress)}</td></tr>
    <tr><td colspan="2" class="label">Locating Premises Type</td><td colspan="5">${data.locatingPremisesType || 'The residence premises are located in a city area'}</td></tr>
    <tr><td colspan="7" class="sec-head">Residential Details</td></tr>
    <tr><td colspan="2" class="label">Ownership (If rented then rent amount)</td><td colspan="5">${orDash(data.residenceOwnership)}</td></tr>
    <tr><td colspan="2" class="label">House Details</td><td colspan="5">${orDash(data.residenceHouseDetails)}</td></tr>
    <tr><td colspan="7" class="sec-head">Family Background of the Applicant</td></tr>
    <tr class="bold text-center label">
      <td>Sr No.</td><td>Famly Member Name</td><td>Age</td><td>Relation with applicant</td><td>Qualification</td><td>Occupation</td><td>Dependents ( Yes/ No )</td>
    </tr>
    ${familyList.map((f, i) => {
      const dependent = [f.isDependent, f.dependent].some(v => v === true || String(v).toLowerCase() === 'true' || v === 'Yes');
      const age = f.age ? (String(f.age).toLowerCase().includes('year') ? f.age : `${f.age} Years`) : '-';
      return `
    <tr class="text-center">
      <td>${i + 1}</td><td>${f.name || '-'}</td><td>${age}</td><td>${f.relationship || f.relation || '-'}</td>
      <td>${f.qualification || f.education || '-'}</td><td>${f.occupation || f.profession || '-'}</td><td>${dependent ? 'Yes' : 'No'}</td>
    </tr>`;
    }).join('')}
    <tr><td colspan="2" class="label">Monthly Household Expenses</td><td colspan="5">Rs. ${fmt(householdM)}/- Per Month</td></tr>
    <tr><td colspan="2" class="label">Electricity Connection Details</td><td colspan="5">${residenceElectricity}</td></tr>
    <tr><td colspan="2" class="label">Neighbor Name</td><td colspan="5">${orDash(data.residenceNeighborName)}</td></tr>
    <tr><td colspan="2" class="label">Neighbor Feedback</td><td colspan="5">${orDash(data.residenceNeighborFeedback)}</td></tr>
    <tr><td colspan="2" class="label">Latitude & Longitude of the business premises</td><td colspan="5">${orDash(data.residenceGpsCoords)}</td></tr>
    <tr><td colspan="2" class="label">Residence Status</td><td colspan="5">${data.residenceStatus && isProvided(data.residenceStatus) ? data.residenceStatus : caseStatus}</td></tr>
  </table>

  ${showCollateral ? `
  <div class="page-break"></div>
  <table>
    <tr><td colspan="2" class="sec-head">Collateral Property details</td></tr>
    <tr><td class="label">Collateral Address</td><td>${orDash(data.collateralAddress)}</td></tr>
    <tr><td class="label">Property Type</td><td>${data.collateralPropertyType ? `The property type is ${String(data.collateralPropertyType).toLowerCase()}` : '-'}</td></tr>
    <tr><td class="label">Approx. Property Area</td><td>${data.collateralPropertyArea ? `The property area is approximately ${data.collateralPropertyArea} sq. feet (as per verbal confirmation)` : '-'}</td></tr>
    <tr><td class="label">Property Usage</td><td>${orDash(data.collateralPropertyUsage)}</td></tr>
    <tr><td class="label">Approx Property Valuation</td><td>${data.collateralValuation ? `The property valuation is approximately in Rs. ${data.collateralValuation}. (as per verbal confirmation)` : '-'}</td></tr>
    <tr><td class="label">Remarks</td><td>${orDash(data.collateralRemarks)}</td></tr>
  </table>` : ''}

  <div class="page-break"></div>
  <table>
    <tr><td colspan="6" class="sec-head">Office visit of ${applicant}</td></tr>
    <tr><td colspan="6" class="sec-head">Brief Profile of Business</td></tr>
    <tr><td colspan="6" style="height: 160px; vertical-align: top;">
      ${isProvided(data.briefBusinessProfile) ? String(data.briefBusinessProfile).replace(/\\n|\n/g, '<br/>') + '<br/><br/>' : ''}
      (All the above details are confirm verbal by applicant)
    </td></tr>
    <tr><td colspan="2" class="label">Vintage of the Office</td><td colspan="4">${orDash(data.businessVintage)}</td></tr>
    <tr><td colspan="2" class="label">Other source income</td><td colspan="4">${isProvided(data.otherSourceIncomeDetails) ? data.otherSourceIncomeDetails : 'No other regular source of income was confirmed during verification.'}</td></tr>
    <tr><td colspan="6" class="sec-head">Applicant's customer and supplier details</td></tr>
    <tr class="bold text-center label"><td>Sr. No.</td><td colspan="2">Staff (Name)</td><td>Staff Ph. No.</td><td colspan="2">Feedback (Remark)</td></tr>
    ${(staffList.length > 0 ? staffList : [{ name: '-', phone: '-', remark: '' }]).map((s, i) => `
    <tr class="text-center"><td>${i + 1}</td><td colspan="2">${s.name}</td><td>${s.phone || '-'}</td><td colspan="2">${s.remark || ''}</td></tr>`).join('')}
    <tr><td colspan="6" class="sec-head" style="text-decoration: underline;">Banking Details and Limit OD and CC limit with bank</td></tr>
    <tr class="bold text-center label"><td>Bank Name</td><td>Branch Name</td><td>Account Types</td><td>CC/OD Limit</td><td>Account No.</td><td>Remark</td></tr>
    ${(bankingList.length > 0 ? bankingList : [{} as BankRow]).map(b => `
    <tr class="text-center">
      <td>${b.bankName || '-'}</td><td>${b.branchName || '-'}</td><td>${b.accountType || '-'}</td>
      <td>${b.limit || b.ccOdLimit || 'NA'}</td><td>${b.accountNo || '-'}</td><td class="text-left">${b.remark || '-'}</td>
    </tr>`).join('')}
    <tr><td colspan="2" class="label">Current Obligation</td><td colspan="4">${isProvided(data.currentObligationSummary) ? data.currentObligationSummary : 'As per the applicant, no loan is currently running in his name.'}</td></tr>
    <tr><td colspan="2" class="label">Staff Name</td><td colspan="4">${orDash(data.businessNeighborName)}</td></tr>
    <tr><td colspan="2" class="label">Staff Feedback</td><td colspan="4">${orDash(data.businessNeighborFeedback)}</td></tr>
    <tr><td colspan="2" class="label">Business Status</td><td colspan="4">${data.businessStatus || caseStatus}</td></tr>
  </table>

  <div class="page-break"></div>
  <table>
    <tr><td colspan="11" class="sec-head" style="text-decoration: underline;">Existing Loans / Liabilities</td></tr>
    <tr class="bold text-center small label">
      <td>Sr. No.</td><td>Applicant Name</td><td>Account Type</td><td>Financer Name</td><td>Lender Type</td><td>Ownership</td>
      <td>Disbursed Date</td><td>Disbursed Amount</td><td>Instalment Amount</td><td>Tenure (months)</td><td>Remarks</td>
    </tr>
    ${loanRows}
    <tr>
      <td colspan="3" class="label text-center small">Current Obligation</td>
      <td colspan="8" class="small">
        ${obligationLine('applicant', crifAccounts.length > 0 ? appAccounts.length : (appEmiM > 0 ? 1 : 0), appEmiM)}
        ${coAppName ? `<br/>${obligationLine('co-applicant', coAppAccounts.length, coAppEmiM)}` : ''}
      </td>
    </tr>
  </table>

  <div class="page-break"></div>
  <table>
    <tr><td colspan="4" class="sec-head" style="text-decoration: underline;">Assessment of the monthly income of the applicant</td></tr>
    <tr class="bold text-center label"><td style="width: 25%;">Particulars</td><td style="width: 45%;">Office Notes</td><td colspan="2">(Period)</td></tr>
    <tr class="shade text-center"><td class="text-left">Sales/Receipts</td><td></td><td style="width: 15%;">Monthly</td><td style="width: 15%;">Yearly</td></tr>
    ${lineRows(salaryLines)}
    <tr class="shade text-center"><td>Total Sales/Receipts (A)</td><td></td><td>${fmt(totalIncomeM)}</td><td>${fmt(totalIncomeY)}</td></tr>
    ${lineRows(shownExpenses)}
    <tr class="shade text-center"><td class="text-left">Total Expenses(B)</td><td></td><td>${fmt(totalExpM)}</td><td>${fmt(totalExpY)}</td></tr>
    <tr class="shade text-center"><td class="text-left">Net Profit Per month(A- B)</td><td></td><td>${fmt(netM)}</td><td>${fmt(netY)}</td></tr>
    <tr class="text-center">
      <td class="text-left label">Less: Existing Household Expenses</td>
      <td class="text-left">${householdNote}</td>
      <td>${fmt(householdShareM)}</td><td>${fmt(householdShareM * 12)}</td>
    </tr>
    <tr class="text-center"><td class="text-left label">Net Disposal Income</td><td>Net Income after all deductions ( Monthly/ Yearly)</td><td>${fmt(netDisposalM)}</td><td>${fmt(netDisposalY)}</td></tr>
    <tr class="text-center">
      <td class="text-left label">Comfortable Monthly EMI</td>
      <td class="text-left">${data.comfortableEmiNotes?.trim() || 'Comfortable Monthly EMI Post all expenses (Office and Household):'}</td>
      <td colspan="2">As Per Ambit Finvest</td>
    </tr>
  </table>

  ${showCoAppSheet ? `
  <table>
    <tr><td colspan="4" class="sec-head" style="text-decoration: underline;">Assessment of the monthly income of the Co-Applicant</td></tr>
    <tr class="bold text-center label"><td style="width: 25%;">Particulars</td><td style="width: 45%;">Business Notes</td><td colspan="2">Co-Applicant (Period)</td></tr>
    <tr class="shade text-center"><td class="text-left">Sales/Receipts</td><td></td><td style="width: 15%;">Monthly</td><td style="width: 15%;">Yearly</td></tr>
    ${lineRows(coSales.length > 0 ? coSales : [{ particulars: 'Income from Business', monthly: coSalesM }])}
    <tr class="shade text-center"><td>Total Sales/Receipts (A)</td><td></td><td>${fmt(coSalesM)}</td><td>${fmt(coSalesY)}</td></tr>
    ${lineRows(coExpenses.length > 0 ? coExpenses : [{ particulars: 'Other expenses', monthly: coExpM }])}
    <tr class="shade text-center"><td class="text-left">Total Expenses(B)</td><td></td><td>${fmt(coExpM)}</td><td>${fmt(coExpY)}</td></tr>
    <tr class="shade text-center"><td class="text-left">Net Profit Per month(A- B)</td><td></td><td>${fmt(coNetM)}</td><td>${fmt(coSalesY - coExpY)}</td></tr>
    <tr class="text-center"><td class="text-left label">Less: Existing EMI</td><td class="text-left">${obligationLine('co-applicant', coAppAccounts.length, coAppEmiM)}</td><td>${fmt(coAppEmiM)}</td><td>${fmt(coAppEmiM * 12)}</td></tr>
    <tr class="text-center"><td class="text-left label">Less: Existing Household Expenses</td><td class="text-left">As verbally confirmed by applicant</td><td>${fmt(coHouseholdM)}</td><td>${fmt(coHouseholdM * 12)}</td></tr>
    <tr class="text-center"><td class="text-left label">Net Disposal Monthly Income</td><td>Net Income after all deductions ( Monthly )</td><td colspan="2">${fmt(coDisposalM)}</td></tr>
    <tr class="text-center"><td class="text-left label">Net Disposal Annual Income</td><td>Net income after all deductions ( Annual )</td><td colspan="2">${fmt(coDisposalM * 12)}</td></tr>
  </table>` : ''}

  <table>
    <tr><td style="font-size: 8pt;">
      <span class="bold">Limitation and Disclaimer clause: -</span><br/>
      This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as observed at that point in time only. Document-related inputs are based solely on information shared during field interactions and do not constitute independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct or indirect, arising from such reliance.<br/><br/>
      <span class="bold">Important Notes:</span><br/>
      Actual Profit and Loss figures were not made available by "Ambit Finvest Private Limited" hence only estimated figures are captured as per the information and understanding provided by the applicant during visit.<br/><br/><br/><br/>
      <span class="bold" style="text-decoration: underline;">(Sign of Agency authorized signatory)</span>
    </td></tr>
  </table>

  ${photoPages}
</body>
</html>
`;
}
