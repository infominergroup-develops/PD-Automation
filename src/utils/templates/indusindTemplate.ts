import type { CreditAccount } from '../../types/creditTypes';
import { PDReportPrintData, formatReportDate, isProvided, reportPhotoSections } from '../pdReportPrinter';

/**
 * IndusInd Bank Limited PD report, laid out like the bank's Excel format ("Sample 2 - PD.xlsx"):
 * one 10-column grid (A–J) with the same merged cells, grey section bands and row order.
 */

// Column widths of the Excel sheet (A–J), as percentages of the page width.
const COL_WIDTHS = [8.43, 14.33, 13, 11, 11.11, 8.33, 7.33, 7.11, 8, 10.44];
const totalWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);

const INFOMINER_NAME = 'Infominer Services Pvt Ltd';
const INFOMINER_ADDRESS = '410, Shri Siddhi Vinayak Trade center, Jeoni Mandi, Agra - 282007';

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Escaped text, line breaks kept. */
const text = (v: unknown, fallback = 'NA') => {
  const s = isProvided(v) ? String(v).trim() : '';
  return s ? esc(s).replace(/\\n|\n/g, '<br/>') : fallback;
};
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');
/** dd/mm/yyyy, as printed in the bank's format. */
const slashDate = (d?: string) => (formatReportDate(d) || '').replace(/-/g, '/');

/** Label cell over columns A–C and value cell over D–J. */
const row = (label: string, value: string, opts: { valueAlign?: 'left' | 'center'; shadeValue?: boolean } = {}) => `
    <tr><td colspan="3">${label}</td><td colspan="7" class="${opts.valueAlign === 'center' ? 'c' : ''}${opts.shadeValue ? ' shade' : ''}">${value}</td></tr>`;
const band = (title: string, align: 'c' | 'l' = 'c') => `
    <tr><td colspan="10" class="shade ${align}">${title}</td></tr>`;
const gap = () => `
    <tr><td colspan="10" class="gap"></td></tr>`;

function lakhs(amount: number | null | undefined): string {
  if (!amount) return 'NA';
  return `${+(amount / 100000).toFixed(2)} Lakh`;
}

function tenor(months: number | null | undefined): string {
  if (!months) return 'NA';
  return months % 12 === 0 ? `${months / 12} years` : `${months} months`;
}

/** Y if the account was disbursed within six months of the report date, N otherwise, NA if unknown. */
function availedInLastSixMonths(disbursed: string | null | undefined, reportDate: string | undefined): string {
  const parse = (s?: string | null) => {
    if (!s) return NaN;
    const m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(s.trim());
    return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : new Date(s).getTime();
  };
  const from = parse(disbursed);
  const to = isNaN(parse(reportDate)) ? Date.now() : parse(reportDate);
  if (isNaN(from)) return 'NA';
  const sixMonthsBefore = new Date(to);
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
  return from >= sixMonthsBefore.getTime() ? 'Y' : 'N';
}

interface LoanRow { type: string; fi: string; amount: string; emi: string; tenor: string; balTenor: string; availed: string }

function existingLoanRows(data: PDReportPrintData): LoanRow[] {
  const active: CreditAccount[] = (data.parsedCreditReport?.accounts || []).filter((a) => a.status !== 'Closed');
  if (active.length > 0) {
    return active.map((a) => ({
      type: a.accountType || 'NA',
      fi: a.creditGrantor || 'NA',
      amount: lakhs(a.disbursedAmount),
      emi: a.instalmentAmount ? `${inr(a.instalmentAmount)}/-` : 'NA',
      tenor: tenor(a.tenureMonths),
      balTenor: 'NA',
      availed: availedInLastSixMonths(a.disbursedDate, data.reportDate || data.visitDate),
    }));
  }
  // The form saves amountInLakhs / emi / tenure; older records used loanAmountLakhs / emiRs / tenureYearsMonths
  const manual = (data.existingLoans || []) as Array<Record<string, string | number | undefined>>;
  return manual
    .filter((l) => isProvided(l.typeOfLoan) && l.typeOfLoan !== 'NA')
    .map((l) => {
      const amount = l.amountInLakhs ?? l.loanAmountLakhs;
      const emi = l.emi ?? l.emiRs;
      return {
        type: String(l.typeOfLoan),
        fi: String(l.financerName || 'NA'),
        amount: amount ? `${amount} Lakh` : 'NA',
        emi: emi ? `${inr(Number(emi) || 0)}/-` : 'NA',
        tenor: String(l.tenure || l.tenureYearsMonths || 'NA'),
        balTenor: String(l.balanceTenure || 'NA'),
        availed: 'NA',
      };
    });
}

export function generateIndusIndPDReportHTML(data: PDReportPrintData): string {
  const d = data.indusInd || ({} as NonNullable<PDReportPrintData['indusInd']>);
  const isMahesh = data.companyHeader?.id === 'mahesh';
  const companyName = isMahesh ? data.companyHeader!.name : INFOMINER_NAME;
  const companyAddress = isMahesh ? data.companyHeader!.address : INFOMINER_ADDRESS;
  const status = data.statusOfCase || 'Recommended';
  const applicant = data.applicantName || '';
  const coApplicant = (data.coApplicants && data.coApplicants[0]?.name) || data.coApplicantName || '';
  const monthlySales = Number(data.totalSalesMonthly) || 0;
  const annualSales = Number(data.totalSalesYearly) || monthlySales * 12;
  const workingDays = Number(data.workingDays) || 26;

  const signBoard = d.signBoard === 'Yes'
    ? `There is sign board available at the visited address with name of ${esc(data.firmName || '')}`
    : d.signBoard === 'No' ? 'There is no sign board available at the visited address.' : 'NA';
  const dailyCashFlow = isProvided(d.dailyCashFlow)
    ? text(d.dailyCashFlow)
    : monthlySales > 0 ? `Average daily Cash Inflow is Rs. ${inr(monthlySales / workingDays)}/-` : 'NA';
  const pct = (v?: string) => (isProvided(v) ? `${esc(v)}%` : 'NA');

  const contactLine = (c: { name: string; phone: string; remark: string }, i: number) =>
    `${i + 1}. ${esc(c.name)}${c.phone ? ` - ${esc(c.phone)}` : ''}${c.remark ? ` - ${esc(c.remark)}` : ''}`;
  const contacts = (list?: Array<{ name: string; phone: string; remark: string }>) =>
    list && list.length > 0 ? list.slice(0, 2).map(contactLine).join('<br/><br/>') : 'NA';

  const family = data.familyMembers || [];
  const relationOf = (f: (typeof family)[number]) => (/^self$/i.test(f.relationship || '') ? 'Applicant' : f.relationship || '-');
  const earning = family.filter((f) => !f.isDependent).length;

  const banking = (data.bankingDetails || []) as Array<Record<string, string>>;
  const loans = existingLoanRows(data);
  const placeholderLoans = ['BL', 'AL', 'PL', 'HL'];

  const residenceValue = isProvided(d.residencePropertyValue)
    ? `Value- Rs. ${inr(Number(d.residencePropertyValue) || 0)}/- Approx.` : 'NA';
  const residenceArea = isProvided(d.residencePropertyArea) ? `Area- ${esc(d.residencePropertyArea)} sq. ft. Approx.` : 'NA';
  const neighbour = [data.businessNeighborName, data.businessNeighborFeedback].filter(isProvided).map(esc).join(' - ') || 'NA';

  const photoSections = reportPhotoSections(data.photos);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>IndusInd Bank PD Report - ${esc(data.applicationNumber || applicant)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: Cambria, 'Times New Roman', serif; font-size: 10pt; color: #000; margin: 0; }
    table.grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .grid td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; text-align: left; word-wrap: break-word; }
    .grid td.c { text-align: center; vertical-align: middle; }
    .grid td.l { text-align: left; }
    .grid td.shade { background: #f2f2f2; }
    .grid td.gap { height: 12px; }
    .grid td.plain { border: none; }
    .grid tr.thead td { background: #f2f2f2; text-align: center; vertical-align: middle; }
    .grid td.head1 { font-size: 12pt; font-weight: bold; text-align: center; padding-top: 18px; }
    .grid td.head2 { font-size: 11pt; text-align: center; }
    .grid td.head3 { font-size: 11pt; font-weight: bold; text-align: center; border-bottom: 1px solid #000; }
    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .photo-grid img { width: 100%; height: 190px; object-fit: cover; display: block; }
    .photo-sec { font-weight: bold; text-decoration: underline; margin: 10px 0 4px; }
    .underline { text-decoration: underline; }
    @media print { .page-break { page-break-before: always; } }
  </style>
</head>
<body>
  <table class="grid">
    <colgroup>${COL_WIDTHS.map((w) => `<col style="width:${((w / totalWidth) * 100).toFixed(2)}%">`).join('')}</colgroup>
    <tr><td colspan="10" class="plain head1">${esc(companyName)}</td></tr>
    <tr><td colspan="10" class="plain head2">${esc(companyAddress)}</td></tr>
    <tr><td colspan="10" class="plain head3">PD Report</td></tr>

    <tr><td colspan="4" class="plain">To,</td><td colspan="2" class="shade c">Date of Issue</td><td colspan="4" class="c">${slashDate(data.reportDate || data.visitDate) || 'NA'}</td></tr>
    <tr><td colspan="4" class="plain">Credit Manager,</td><td colspan="2" class="shade c">SR. No</td><td colspan="4" class="c">${text(d.srNo)}</td></tr>
    <tr><td colspan="4" class="plain">IndusInd Bank Limited</td><td colspan="2" class="shade c">APS No</td><td colspan="4" class="c">${text(data.applicationNumber)}</td></tr>
    <tr><td colspan="4" class="plain"></td><td colspan="2" class="shade c">Status of PD</td><td colspan="4" class="c">${esc(status)}</td></tr>
    <tr><td colspan="10" class="plain">Dear Sir/Madam,</td></tr>
    <tr><td colspan="2" class="plain">Sub: PD Report of</td><td colspan="8" class="plain" style="border-bottom:1px solid #000;">${esc(applicant)}</td></tr>
    <tr><td colspan="10" class="plain">Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:</td></tr>

    ${band('Personal Discussion Report')}
    ${row('Branch Name', text(d.branchName))}
    <tr><td colspan="3">Name of Applicant</td><td colspan="3">${text(applicant)}</td><td colspan="2" class="shade c">Education Qualification</td><td colspan="2">${text(data.applicantQualification)}</td></tr>
    <tr><td colspan="3">Name of Co-Applicant</td><td colspan="3">${text(coApplicant)}</td><td colspan="2" class="shade c">Education Qualification</td><td colspan="2">${text(coApplicant ? d.coApplicantQualification : '')}</td></tr>
    ${row('Firm’s Name', text(data.firmName))}
    ${row('Address of the Business Place', text(data.businessAddress))}
    ${row('Person met Name', text(data.metPersonName))}
    ${row('Status of Entity', text(data.constitution))}
    ${row('Address of the meeting', text(data.meetingAddress))}
    ${row('Contact no of met person', text(data.applicantPhone))}
    ${row('Details of Documents verified', data.documentsSeen && data.documentsSeen.length ? esc(data.documentsSeen.join(', ')) : 'NA')}
    ${row('Date of meeting', slashDate(data.visitDate) || 'NA')}
    ${row('Applied Loan amount', data.appliedAmount ? `Rs. ${inr(Number(data.appliedAmount))}/-` : 'NA')}
    ${row('Type of Loan', text(data.loanType))}
    ${row('Locating Premises', text(d.locatingPremises))}
    ${row('If premise is Business cum Residence, Whether office is separately demarcated', text(data.businessPremiseOwnership))}
    ${row('Maintenance &amp; Set-up', text(d.maintenanceSetup))}
    ${row('Plant and Machinery details', text(data.machineryDetailsText || data.factoryInfrastructure))}
    ${row('Name Board/Sign Board Displayed', signBoard)}
    ${row('Nature of Business /Customer Profile/Brief Note of Business', text(data.briefBusinessProfile))}
    ${row('Is it Prop./Proprietorship/Pvt Ltd/Ltd', text(data.constitution))}
    ${row('Details of Proprietors/Proprietors', text(data.partnersDirectorsDetails))}
    ${row('Sharing pattern', text(data.sharingPattern))}
    ${row('Business Proof details (like shops and establishment certificate/ GST Certificate / Electricity Bills )', text(data.businessProofDetails))}
    ${row('Date of incorporation of the firm.// History of the firm / Registration No', text(data.businessVintage))}
    ${row('Business/Manufacturing /Marketing Process', text(d.businessProcess))}
    ${row('2 Prominent customers (Name, location, Ph. No.)', contacts(data.prominentCustomers))}
    ${row('2 Supplier name (Name, location, Ph. No.)', contacts(data.prominentSuppliers))}
    ${row('Annual turnover for the last three years (as per business statement - tax  receipts, challans, dairy, receipts, warehouse receipts &amp; other such documents)',
      annualSales > 0 ? `Approximately Annual gross turnover of the business is Rs. ${inr(annualSales)}/-.` : 'NA')}
    <tr><td colspan="3" rowspan="2">Gross &amp; Net margins % in Business</td><td colspan="2">Gross Margin %</td><td colspan="5">${pct(d.grossMarginPct)}</td></tr>
    <tr><td colspan="2">Net Margin %</td><td colspan="5">${pct(d.netMarginPct)}</td></tr>
    ${row('Other sources of Income', text(data.otherSourceIncomeDetails, 'There is no such other source of income.'))}
    ${row('No of Employees with Monthly pay-out', text(data.staffCount))}
    ${row('Business Cycle – What is stock valuation as on date', text(data.stockDetailsValue))}
    ${row('Dedup-Check', text(d.dedupCheck))}
    ${row('Daily cash Flow', dailyCashFlow)}
    ${row('Business Expenses (Capex, Opex Working Capital, Inventory)', text(d.businessExpenses))}
    ${row('VSTS ID', text(d.vstsId))}
    ${gap()}

    ${band('Banking Details And Limit OD And CC Limit With Bank', 'l')}
    <tr class="thead"><td colspan="2">Bank Name</td><td colspan="2">Bank Branch</td><td colspan="2">Account Number</td><td colspan="2">CC/OD Limit</td><td colspan="2">Remark</td></tr>
    ${(banking.length ? banking : [{}]).map((b) => `
    <tr><td colspan="2" class="c">${text(b.bankName)}</td><td colspan="2" class="c">${text(b.branchName)}</td><td colspan="2" class="c">${text(b.accountNo)}</td><td colspan="2" class="c">${text(b.limit || b.ccOdLimit)}</td><td colspan="2" class="c">${text(b.remark)}</td></tr>`).join('')}
    ${gap()}

    <tr><td colspan="10">EXISTING LOANS / LIABILITIES</td></tr>
    <tr class="thead"><td colspan="2">Type of Loan</td><td colspan="2">FI Name</td><td>Loan Amount (Lacs)</td><td colspan="2">EMI (Rs)</td><td>Tenor (yrs., moths)</td><td>Bal. Tenor (yrs., moths)</td><td>Availed in Last 6 months (Y/N)</td></tr>
    ${(loans.length ? loans : placeholderLoans.map((type) => ({ type, fi: 'NA', amount: 'NA', emi: 'NA', tenor: 'NA', balTenor: 'NA', availed: 'NA' }))).map((l) => `
    <tr><td colspan="2" class="c">${esc(l.type)}</td><td colspan="2" class="c">${esc(l.fi)}</td><td class="c">${esc(l.amount)}</td><td colspan="2" class="c">${esc(l.emi)}</td><td class="c">${esc(l.tenor)}</td><td class="c">${esc(l.balTenor)}</td><td class="c">${esc(l.availed)}</td></tr>`).join('')}
    ${gap()}

    ${band('Family Background')}
    <tr class="thead"><td>Sr. NO</td><td colspan="2">Name</td><td>Age</td><td>Relation</td><td colspan="2">Occupation</td><td colspan="3">Whether dependent or not</td></tr>
    ${family.map((f, i) => `
    <tr><td class="c">${i + 1}</td><td colspan="2" class="c">${text(f.name)}</td><td class="c">${f.age ? esc(f.age) : 'NA'}</td><td class="c">${esc(relationOf(f))}</td><td colspan="2" class="c">${text(f.occupation || f.profession)}</td><td colspan="3" class="c">${f.isDependent ? 'Dependent' : 'Not Dependent'}</td></tr>`).join('')}
    <tr><td></td><td colspan="2" class="c">Total Family Member Is - ${family.length}</td><td colspan="4" class="c">${family.length ? `(${family.map((f) => esc(relationOf(f))).join(', ')})` : ''}</td><td colspan="3" class="c">Earning Member Is - ${earning}</td></tr>
    ${gap()}

    ${band('Residential Details')}
    ${row('House Address', text(data.residenceAddress))}
    ${row('Locality (Posh area/Slum/UMC/LMC)', text(d.residenceLocality))}
    ${row('Ownership (If rented then rent amount)', text(data.residenceOwnership))}
    ${row('Market Value (as per applicant)', residenceValue)}
    ${row('Covered Area', residenceArea)}
    ${row('Other Property', text(d.otherProperty))}
    ${row('Vehicle Details', text(d.vehicleDetails))}
    ${gap()}

    ${row('Business Neighbor Check', neighbour)}
    ${row('Vintage of Business Confirmed by Neighbor', text(d.neighbourVintage))}
    ${row('End Use of The Fund', text(isProvided(data.loanPurpose) ? data.loanPurpose : data.loanType))}
    ${row('Affordable EMI As Per Applicant', text(d.affordableEmiApplicant))}
    ${row('Affordable Emi As Per Our Executive', text(d.affordableEmiExecutive))}
    <tr><td colspan="3" style="vertical-align:middle; height:160px;">Synopsis</td><td colspan="7">${text(d.synopsis)}</td></tr>
    <tr><td colspan="3" class="shade">Overall remarks</td><td colspan="7" class="shade c">${esc(status)}</td></tr>
  </table>

  <p style="margin-top:60px;" class="underline">Sign of Agency Authorized Signatory and Stamp -&gt;</p>
  ${photoSections.length ? `
  <p class="underline" style="margin:0;">Photographs:-</p>
  ${photoSections.map((s) => `
  <div class="photo-sec">${esc(s.title)}</div>
  <div class="photo-grid">${s.photos.map((p) => `<img src="${p.dataUrl}" alt="${esc(p.name || s.title)}" />`).join('')}</div>`).join('')}` : ''}
</body>
</html>`;
}
