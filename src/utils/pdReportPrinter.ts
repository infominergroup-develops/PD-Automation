// Dedicated Company Standard PD Report Printer Module
// Adheres strictly to Infominer Services Private Limited (Chartered Accountant) format

import { coverLogoBase64 as coverLogo } from '../images/logoBase64';


export function getUniversalCoverPageCSS(): string {
  return `
    .exec-page { position: relative; background: #ffffff; padding: 25px 35px 80px 35px; page-break-after: always; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; overflow: visible; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px; }
    .exec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; position: relative; z-index: 2; }
    .exec-logo-container { display: flex; align-items: center; gap: 12px; }
    .exec-header-links { font-size: 9pt; color: #64748b; letter-spacing: 1px; }
    .exec-title-area { margin-bottom: 20px; position: relative; z-index: 2; }
    .exec-subtitle { font-size: 10pt; color: #64748b; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px; }
    .exec-title { font-size: 32pt; font-weight: 800; color: #1e3a8a; line-height: 1.1; margin-bottom: 15px; }
    .exec-client { font-size: 12pt; color: #1e3a8a; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .exec-section { margin-bottom: 15px; position: relative; z-index: 2; }
    .exec-section-header { display: flex; align-items: center; background: #f1f5f9; border-radius: 6px; padding: 0; margin-bottom: 15px; overflow: hidden; }
    .exec-section-number { background: #1e3a8a; color: #ffffff; font-size: 14pt; font-weight: 700; padding: 10px 20px; }
    .exec-section-title { font-size: 11pt; font-weight: 700; color: #334155; padding-left: 20px; letter-spacing: 1px; text-transform: uppercase; }
    .exec-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff; }
    .exec-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; vertical-align: middle; }
    .exec-table tr:last-child td { border-bottom: none; }
    .exec-table .td-icon { width: 40px; text-align: center; color: #1e3a8a; border-right: 1px solid #e2e8f0; }
    .exec-table .td-label { width: 40%; color: #475569; font-weight: 600; border-right: 1px solid #e2e8f0; }
    .exec-table .td-value { color: #1e293b; font-weight: 500; }
    .exec-pill-green { background: #166534; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 9pt; font-weight: 600; display: inline-block; }
    .exec-overview-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background: #ffffff; page-break-inside: auto; break-inside: auto; }
    .exec-overview-icon { float: left; width: 60px; text-align: center; color: #1e3a8a; }
    .exec-overview-text { margin-left: 80px; font-size: 10pt; color: #334155; line-height: 1.6; border-left: 2px solid #e2e8f0; padding-left: 20px; text-align: justify; display: block; }
    .exec-overview-box::after { content: ""; display: table; clear: both; }
    .exec-footer { position: absolute; bottom: 20px; left: 40px; right: 40px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 9pt; color: #1e293b; font-weight: 600; z-index: 2; }
    .shape-1 { position: absolute; top: -50px; right: -50px; width: 300px; height: 300px; background: #fdf6e3; border-radius: 50%; z-index: 1; }
    .shape-3 { position: absolute; top: 150px; right: -20px; width: 100px; height: 300px; background: #e2e8f0; transform: rotate(45deg); z-index: 1; }
    .shape-4 { position: absolute; top: 100px; right: -80px; width: 100px; height: 300px; background: #fef08a; transform: rotate(45deg); z-index: 1; }
    .exec-icon svg { width: 24px; height: 24px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  `;
}

export function getUniversalCoverPageHTML(data: PDReportPrintData, appNo: string, reportDate: string, caseStatus: string, coverLogoSrc: string): string {
  const clientName = data.clientBankName || data.companyHeader?.name || 'INFOMINER SERVICES PVT. LTD.';
  return `
  <div class="exec-page">
    <div class="shape-1"></div>
    <div class="shape-3"></div>
    <div class="shape-4"></div>
    
    <div class="exec-header">
      <div class="exec-logo-container">
        <img src="${coverLogoSrc}" style="max-height: 40px;" alt="Logo" />
      </div>
      <div class="exec-header-links">Insights | Data | Better Decisions</div>
    </div>
    
    <div class="exec-title-area">
      <div class="exec-subtitle">EXECUTIVE SUMMARY</div>
      <div class="exec-title">Personal Discussion<br/>Credit Assessment Report</div>
      <div class="exec-client">${clientName}</div>
    </div>
    
    <div class="exec-section">
      <div class="exec-section-header">
        <div class="exec-section-number">01</div>
        <div class="exec-section-title">APPLICANT DETAILS</div>
      </div>
      <table class="exec-table">
        <tr>
          <td class="td-icon"><div class="exec-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div></td>
          <td class="td-label">Applicant Name</td>
          <td class="td-value">${data.applicantName || '-'}</td>
        </tr>
        <tr>
          <td class="td-icon"><div class="exec-icon"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div></td>
          <td class="td-label">Business / Firm</td>
          <td class="td-value">${data.firmName || 'Not provided'}</td>
        </tr>
        <tr>
          <td class="td-icon"><div class="exec-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><circle cx="8.5" cy="11.5" r="2.5"></circle><path d="M20 18v-2a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4v2"></path></svg></div></td>
          <td class="td-label">Application ID</td>
          <td class="td-value">${appNo}</td>
        </tr>
        <tr>
          <td class="td-icon"><div class="exec-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div></td>
          <td class="td-label">Loan Amount</td>
          <td class="td-value">₹${Number(data.appliedAmount || data.loanAmount || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="td-icon"><div class="exec-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div></td>
          <td class="td-label">Report Date</td>
          <td class="td-value">${reportDate}</td>
        </tr>
        <tr>
          <td class="td-icon"><div class="exec-icon"><svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg></div></td>
          <td class="td-label">Case Status</td>
          <td class="td-value"><div class="exec-pill-green">${caseStatus}</div></td>
        </tr>
      </table>
    </div>
    
    <div class="exec-section">
      <div class="exec-section-header">
        <div class="exec-section-number">02</div>
        <div class="exec-section-title">BUSINESS OVERVIEW</div>
      </div>
      <div class="exec-overview-box">
        <div class="exec-overview-icon">
          <div class="exec-icon"><svg viewBox="0 0 24 24" style="width: 36px; height: 36px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
        </div>
        <div class="exec-overview-text">
          ${data.briefBusinessProfile || 'The applicant is engaged in business activities as per the information shared during the personal discussion. The business appears to be operational and has been running as per the applicant’s statement.'}
        </div>
      </div>
    </div>
    
    <div class="exec-footer">
      <div>Infominer</div>
      <div>Cover Page</div>
    </div>
  </div>
  `;
}

export interface PDReportPrintData {
  companyHeader?: {
    name: string;
    cin: string;
    designation: string;
    address: string;
  };
  clientBankName?: string;
  caseInitiationDate?: string;
  reportDate?: string;
  visitDate?: string;
  applicationNumber?: string;
  statusOfCase?: string;
  
  // Applicant & Co-applicant Profile
  applicantName: string;
  applicantPhone?: string;
  coApplicants?: any[];
  femaleCandidateDetails?: string;
  firmName?: string;
  loanAmount?: number | string;
  loanType?: string;
  loanPurpose?: string;
  residenceAddress?: string;
  tataCapitalDistance?: string;
  additionalAddresses?: string[];
  businessAddress?: string;
  meetingAddress?: string;
  metPersonName?: string;
  metPersonIdProof?: string;
  executiveName?: string;

  // Residence Visit
  locatingPremisesType?: string;
  residenceOwnership?: string;
  houseDetails?: string;
  shopAreaSqFt?: number | string;
  yearsInBusiness?: number;
  shopOwnership?: string;
  solarPurposeUsage?: string;
  purpose?: string;
  appliedAmount?: number | string;
  familyMembers?: Array<{
    name: string;
    age: number | string;
    relationship: string;
    qualification?: string;
    profession?: string;
    occupation?: string;
    isDependent: boolean;
  }>;
  monthlyHouseholdExpenses?: number;
  residenceElectricityDetails?: string;
  residenceNeighborName?: string;
  residenceNeighborFeedback?: string;
  residenceGpsCoords?: string;
  residenceStatus?: string;

  // Business Visit
  briefBusinessProfile?: string;
  businessVintage?: string;
  previousOccupation?: string;
  reasonToLeave?: string;
  staffCount?: string;
  businessPremiseOwnership?: string;
  factoryInfrastructure?: string;
  stockDetailsValue?: string;
  fixedAndCurrentAssetAnalysis?: string;
  assetCreationThroughBusiness?: string;
  initialBusinessInvestment?: string;
  agriculturalIncomeDetails?: string;
  otherSourceIncomeDetails?: string;
  operationalSavingAnalysis?: string;

  // Customers & Suppliers & Banking & Liabilities
  prominentCustomers?: Array<{ name: string; phone: string; remark: string }>;
  prominentSuppliers?: Array<{ name: string; phone: string; remark: string }>;
  bankingDetails?: Array<{
    bankName: string;
    branchName: string;
    accountType: string;
    ccOdLimit: string;
    accountNo: string;
    remark: string;
  }>;
  existingLoans?: Array<{
    typeOfLoan: string;
    financerName: string;
    loanAmountLakhs: string;
    emiRs: string;
    tenureYearsMonths: string;
    balanceTenure: string;
    remark: string;
  }>;
  currentObligationSummary?: string;
  businessGpsCoords?: string;
  businessLocationRemarks?: string;
  businessElectricityDetails?: string;
  businessNeighborName?: string;
  businessNeighborFeedback?: string;
  businessStatus?: string;

  // Financial Waterfall & Assessment of Monthly Income
  itemizedSales?: Array<{
    particulars: string;
    businessNotes: string;
    monthly: number;
    yearly: number;
  }>;
  totalSalesMonthly?: number;
  totalSalesYearly?: number;
  workingDays?: number;

  itemizedExpenses?: Array<{
    particulars: string;
    businessNotes: string;
    monthly: number;
    yearly: number;
  }>;
  totalExpensesMonthly?: number;
  totalExpensesYearly?: number;

  netProfitMonthly?: number;
  netProfitYearly?: number;
  existingEmiMonthly?: number;
  existingEmiYearly?: number;
  existingEmiNotes?: string;
  householdExpensesMonthly?: number;
  householdExpensesYearly?: number;
  householdExpensesNotes?: string;
  netDisposalIncomeMonthly?: number;
  netDisposalIncomeYearly?: number;
  comfortableMonthlyEmi?: string;
  comfortableEmiNotes?: string;
  applicantQualification?: string;
  businessNature?: string;
  residenceMarketValue?: string;
  businessCity?: string;

  // Financial Ratios
  dscrRatio?: number;
  foirPct?: number;
  cibilScore?: number;
  riskScore?: number;
  riskLevel?: string;
  strengths?: string[];
  flags?: string[];
  proposedEmi?: number;
  postLoanSurplus?: number;

  // Risk Factor
  riskFactor?: string;

  // AI Narrative Summary
  aiExecutiveSummary?: string;

  // Photos
  photos?: Array<{
    id: string;
    name: string;
    dataUrl: string;
    category: string;
    gps?: { lat: number; lng: number; mapLink?: string };
  }>;

  // Parsed Credit Report Data
  parsedCreditReport?: any;
}


import { generateStandardPDReportHTML } from './templates/standardTemplate';
import { generateMoneyboxxPDReportHTML } from './templates/moneyboxxTemplate';
import { generateSbfcPDReportHTML } from './templates/sbfcTemplate';
import { generateGodrejPDReportHTML } from './templates/godrejTemplate';
import { generateTataCapitalPDReportHTML } from './templates/tataCapitalTemplate';

export {
  generateStandardPDReportHTML,
  generateMoneyboxxPDReportHTML,
  generateSbfcPDReportHTML,
  generateGodrejPDReportHTML,
  generateTataCapitalPDReportHTML
};

export function openStandardPDReportPrintWindow(data: PDReportPrintData) {
  if (data.clientBankName === 'Moneyboxx Finance Ltd') {
    openPDReportPrintWindow(generateMoneyboxxPDReportHTML(data), data.applicationNumber || 'Moneyboxx');
    return;
  }
  if (data.clientBankName === 'SBFC Finance LTD') {
    openPDReportPrintWindow(generateSbfcPDReportHTML(data), data.applicationNumber || 'SBFC');
    return;
  }
  if (data.clientBankName === 'Godrej Finance Limited') {
    openPDReportPrintWindow(generateGodrejPDReportHTML(data), data.applicationNumber || 'Godrej');
    return;
  }
  if (data.clientBankName === 'Tata Capital Limited') {
    openPDReportPrintWindow(generateTataCapitalPDReportHTML(data), data.applicationNumber || 'TataCapital');
    return;
  }
  openPDReportPrintWindow(generateStandardPDReportHTML(data), data.applicationNumber || 'Standard');
}

export function openMoneyboxxPDReportPrintWindow(data: PDReportPrintData) {
  openPDReportPrintWindow(generateMoneyboxxPDReportHTML(data), data.applicationNumber || 'Moneyboxx');
}

export function openSbfcPDReportPrintWindow(data: PDReportPrintData) {
  openPDReportPrintWindow(generateSbfcPDReportHTML(data), data.applicationNumber || 'SBFC');
}

export function openGodrejPDReportPrintWindow(data: PDReportPrintData) {
  openPDReportPrintWindow(generateGodrejPDReportHTML(data), data.applicationNumber || 'Godrej');
}

export function openTataCapitalPDReportPrintWindow(data: PDReportPrintData) {
  openPDReportPrintWindow(generateTataCapitalPDReportHTML(data), data.applicationNumber || 'TataCapital');
}

export function openPDReportPrintWindow(htmlContent: string, windowName: string) {
  const newWin = window.open('', '_blank');
  if (newWin) {
    newWin.document.open();
    newWin.document.write(htmlContent);
    newWin.document.close();
    setTimeout(() => {
      newWin.focus();
      newWin.print();
    }, 500);
  } else {
    alert('Please allow popups for this website to print the report.');
  }
}
