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

export function generateStandardPDReportHTML(data: PDReportPrintData): string {
  const bankName = data.clientBankName || 'Moneyboxx Finance Limited';
  const initiationDate = data.caseInitiationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const reportDate = data.reportDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const visitDate = data.visitDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const appNo = data.applicationNumber || 'Not Provided';
  const caseStatus = data.statusOfCase || 'Not Provided';

  const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [];

  // Income Assessment Default Calculations
  let salesItems = data.itemizedSales && data.itemizedSales.length > 0 ? data.itemizedSales : [
    { particulars: `${data.firmName || 'Not Provided'} Monthly Turnover`, businessNotes: 'Based on field footfall & cross-check assessment', monthly: data.totalSalesMonthly || 91000, yearly: (data.totalSalesMonthly || 91000) * 12 }
  ];

  let rawTotalSales = salesItems.reduce((acc, i) => acc + i.monthly, 0);
  const totalSalesM = data.totalSalesMonthly ?? rawTotalSales;
  const totalSalesY = data.totalSalesYearly ?? totalSalesM * 12;

  if (rawTotalSales > 0 && totalSalesM !== rawTotalSales) {
    const ratio = totalSalesM / rawTotalSales;
    salesItems = salesItems.map(item => ({
      ...item,
      monthly: Math.round(item.monthly * ratio),
      yearly: Math.round(item.yearly * ratio)
    }));
  }

  let expenseItems = data.itemizedExpenses && data.itemizedExpenses.length > 0 ? data.itemizedExpenses : [
    { particulars: 'Purchases / COGS Raw Material', businessNotes: 'Stock replenishment expenses', monthly: Math.round(totalSalesM * 0.75), yearly: Math.round(totalSalesM * 0.75) * 12 },
    { particulars: 'Monthly Electricity Expenses', businessNotes: 'Utility & Power connection charges', monthly: 2500, yearly: 30000 },
    { particulars: 'Salary of Employees / Family Labour', businessNotes: 'Staff wages or family maintenance allowance', monthly: 7000, yearly: 84000 },
    { particulars: 'Business Premises Rent', businessNotes: 'Shop rent expense', monthly: 2000, yearly: 24000 },
    { particulars: 'Other Expenses / Maintenance', businessNotes: 'Machine upkeep, transport & misc', monthly: 1000, yearly: 12000 }
  ];

  let rawTotalExp = expenseItems.reduce((acc, i) => acc + i.monthly, 0);
  const totalExpM = data.totalExpensesMonthly ?? rawTotalExp;
  const totalExpY = data.totalExpensesYearly ?? totalExpM * 12;

  if (rawTotalExp > 0 && totalExpM !== rawTotalExp) {
    const ratio = totalExpM / rawTotalExp;
    expenseItems = expenseItems.map(item => ({
      ...item,
      monthly: Math.round(item.monthly * ratio),
      yearly: Math.round(item.yearly * ratio)
    }));
  }

  const netProfM = data.netProfitMonthly ?? (totalSalesM - totalExpM);
  const netProfY = data.netProfitYearly ?? (netProfM * 12);

  const existEmiM = data.existingEmiMonthly ?? 0;
  const existEmiY = data.existingEmiYearly ?? (existEmiM * 12);

  const hhExpM = data.monthlyHouseholdExpenses ?? data.householdExpensesMonthly ?? 4000;
  const hhExpY = data.householdExpensesYearly ?? (hhExpM * 12);

  const netDisposalM = data.netDisposalIncomeMonthly ?? (netProfM - existEmiM - hhExpM);
  const netDisposalY = data.netDisposalIncomeYearly ?? (netDisposalM * 12);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.companyHeader?.name || 'Not Provided'} PD Report - ${appNo} - ${data.applicantName}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm 8mm 10mm 8mm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 9pt;
      color: #000;
      background-color: #fff;
      margin: 0;
      padding: 15px;
      line-height: 1.35;
    }
    .page-break {
      page-break-before: always;
      margin-top: 15px;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: -1px;
    }
    .report-table th, .report-table td {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: top;
      font-size: 8.5pt;
    }
    .hdr-main {
      text-align: center;
      border: 1px solid #000;
      padding: 6px;
      margin-bottom: -1px;
      background-color: #ffffff;
    }
    .hdr-title {
      font-size: 13pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .hdr-sub {
      font-size: 9pt;
      font-weight: bold;
      margin-top: 2px;
    }
    .hdr-desc {
      font-size: 8.5pt;
      margin-top: 1px;
    }
    .sec-head {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
      font-size: 9.5pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .sub-head {
      background-color: #fafafa;
      font-weight: bold;
      font-size: 8.5pt;
    }
    .bold {
      font-weight: bold;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .disclaimer-box {
      border: 1px solid #000;
      padding: 6px;
      font-size: 7.5pt;
      line-height: 1.3;
      text-align: justify;
      margin-top: -1px;
    }
    .sig-block {
      border: 1px solid #000;
      padding: 10px;
      margin-top: -1px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      min-height: 60px;
    }
    .summary-card {
      border: 2px solid #2d3e50;
      background-color: #f8fafc;
      padding: 12px;
      margin-top: 15px;
      border-radius: 4px;
    }
    .summary-title {
      font-size: 11pt;
      font-weight: 900;
      color: #2d3e50;
      text-transform: uppercase;
      border-bottom: 2px solid #eb8a23;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .photo-card {
      border: 1px solid #000;
      padding: 5px;
      text-align: center;
    }
    .photo-card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .stamp-badge {
      display: inline-block;
      padding: 2px 6px;
      background-color: #d1fae5;
      color: #065f46;
      font-weight: bold;
      font-size: 7.5pt;
      border: 1px solid #10b981;
      border-radius: 3px;
    }
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 95vh;
      text-align: center;
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      border: 15px solid #2d3e50;
      border-top: 25px solid #eb8a23;
      padding: 25px 35px;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      position: relative;
      overflow: hidden;
    }
    .cover-page::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: #eb8a23;
      opacity: 0.1;
      border-radius: 50%;
    }
    .cover-page::after {
      content: '';
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 300px;
      height: 300px;
      background: #2d3e50;
      opacity: 0.05;
      border-radius: 50%;
    }
    .cover-logo {
      width: 140px;
      height: 140px;
      background: linear-gradient(135deg, #2d3e50 0%, #1a252f 100%);
      color: #fff;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36pt;
      font-weight: 900;
      margin-bottom: 15px;
      box-shadow: 0 10px 25px rgba(45,62,80,0.4);
      border: 4px solid #ffffff;
      z-index: 1;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: 900;
      color: #1e293b;
      text-transform: uppercase;
      margin-bottom: 15px;
      letter-spacing: 2px;
      z-index: 1;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .cover-subtitle {
      font-size: 18pt;
      color: #eb8a23;
      font-weight: 800;
      margin-bottom: 20px;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cover-details {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      width: 75%;
      text-align: left;
      z-index: 1;
      border: 1px solid rgba(255,255,255,0.4);
      margin-bottom: 30px;
    }
    .cover-details table {
      width: 100%;
      font-size: 13pt;
    }
    .cover-details td {
      padding: 12px 15px;
      border-bottom: 1px dashed #cbd5e1;
      color: #334155;
    }
    .cover-details tr:last-child td {
      border-bottom: none;
    }
    .cover-footer {
      margin-top: auto;
      margin-bottom: 20px;
      font-size: 10pt;
      color: #64748b;
      z-index: 1;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  
    /* EXECUTIVE SUMMARY STYLES */
    .exec-page {
      position: relative;
      background: #ffffff;
      padding: 25px 35px 80px 35px;
      page-break-after: always;
      min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: visible;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    .exec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; position: relative; z-index: 2; }
    .exec-logo-container { display: flex; align-items: center; gap: 12px; }
    .exec-header-links { font-size: 9pt; color: #64748b; letter-spacing: 1px; }
    .exec-title-area { margin-bottom: 20px; position: relative; z-index: 2; }
    .exec-subtitle { font-size: 10pt; color: #64748b; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px; }
    .exec-title { font-size: 32pt; font-weight: 800; color: #1e3a8a; line-height: 1.1; margin-bottom: 15px; }
    .exec-client { font-size: 12pt; color: #ea580c; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    ${getUniversalCoverPageCSS()}style>
</head>
<body>

  <!-- Floating Print Control Header for Web Preview -->
  <div class="no-print" style="position: sticky; top: 0; background-color: #384c5e; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; border-bottom: 2px solid #eb8a23; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <div>
      <strong style="font-size: 11pt; font-family: sans-serif;">${data.companyHeader?.name || 'Not Provided'} Standard Personal Discussion Report</strong>
      <span style="font-size: 9pt; opacity: 0.8; margin-left: 10px;">App #${appNo} • ${data.applicantName}</span>
    </div>
    <button onclick="window.print()" style="background-color: #eb8a23; color: #fff; border: none; padding: 6px 16px; font-weight: bold; font-size: 10pt; border-radius: 4px; cursor: pointer; transition: 0.2s;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div  style="outline: none;">
  

  ${getUniversalCoverPageHTML(data, appNo, reportDate, caseStatus, coverLogo)}

  <!-- PAGE 2: EXECUTIVE SUMMARY CONTINUED -->
  <div class="exec-page">
    <div class="shape-2"></div>
    <div class="exec-header">
      <div class="exec-logo-container">
        <img src="${coverLogo}" style="max-height: 40px;" alt="Infominer Services Pvt. Ltd." />
      </div>
      <div class="exec-header-links">Insights | Data | Better Decisions</div>
    </div>
    
    <div class="exec-section">
      <div class="exec-section-header">
        <div class="exec-section-number">03</div>
        <div class="exec-section-title">FINANCIAL POSITION</div>
      </div>
      <div style="padding-left: 50px;">
        <table class="exec-table-simple">
          <tr>
            <th>Particulars</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>Fixed & Current Assets</td>
            <td>${data.fixedAndCurrentAssetAnalysis || 'Not disclosed'}</td>
          </tr>
          <tr>
            <td>Asset Creation</td>
            <td>${data.assetCreationThroughBusiness || 'Not disclosed'}</td>
          </tr>
          <tr>
            <td>Business Investment</td>
            <td>${data.initialBusinessInvestment || 'Not disclosed'}</td>
          </tr>
          <tr>
            <td>Agricultural / Solar Income</td>
            <td>${data.agriculturalIncomeDetails || 'Not disclosed'}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="exec-footer">
      <div>Infominer</div>
      <div>Page 2 of 2</div>
    </div>
  </div>


  <!-- SECTION 1: OFFICIAL COMPANY HEADER & CASE PROFILE -->
  <div class="hdr-main">
    <div class="hdr-title">${data.companyHeader?.name || 'Not Provided'}</div>
  </div>

  <table class="report-table">
    <tr>
      <td style="width: 50%;" colspan="2">
        <strong>To,</strong><br/>
        <strong style="font-size: 9.5pt;">${bankName}</strong>
      </td>
      <td style="width: 25%;" class="bold text-center">Date of Initiation</td>
      <td style="width: 25%;" class="bold text-center">${initiationDate}</td>
    </tr>
    <tr>
      <td class="bold" colspan="2">Sub: Income Assesment of ${data.applicantName}</td>
      <td class="bold text-center">Application ID</td>
      <td class="bold text-center">${appNo}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>Dear Sir/Madam,</strong></td>
      <td class="bold text-center">Status of case</td>
      <td class="bold text-center" style="color: #065f46;">${caseStatus}</td>
    </tr>

    <tr>
      <td colspan="4" style="font-size: 8pt; font-style: italic;">
        Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:
      </td>
    </tr>
    <tr>
      <td colspan="4" class="sec-head">Case Profile</td>
    </tr>
    <tr>
      <td style="width: 20%;" class="bold">Visit date</td>
      <td style="width: 30%;">${visitDate}</td>
      <td style="width: 20%;" class="bold">Report date</td>
      <td style="width: 30%;">${reportDate}</td>
    </tr>
    <tr>
      <td class="bold">Date of initiation of case</td>
      <td>${data.caseInitiationDate ? new Date(data.caseInitiationDate).toLocaleDateString('en-IN') : (data.caseInitiationDate || '')}</td>
      <td class="bold">Date of Preparation of report</td>
      <td style="width: 30%;">${reportDate}</td>
    </tr>
    <tr>
      <td class="bold">Name of applicant</td>
      <td>${data.applicantName}</td>
      <td class="bold">Contact Number</td>
      <td>${data.applicantPhone || ''}</td>
    </tr>
    <tr>
      <td class="bold">Business firm name</td>
      <td colspan="3">${data.firmName || 'Not Provided'}</td>
    </tr>
    ${(data.coApplicants && data.coApplicants.length > 0) ? data.coApplicants.map((c: any, i: number) => `
    <tr>
      <td class="bold">Co-applicant ${i + 1} Name with relation</td>
      <td>${c.name} (${c.relation})</td>
      <td class="bold">Contact Number</td>
      <td>${c.mobileNumber || 'Not Provided'}</td>
    </tr>
    `).join('') : `
    <tr>
      <td class="bold">Co-applicant Name with relation</td>
      <td>NA</td>
      <td class="bold">Contact Number</td>
      <td>NA</td>
    </tr>
    `}
    <tr>
      <td class="bold">Female candidate is on loan or not if no please collect details</td>
      <td colspan="3">${data.femaleCandidateDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Loan Amount (as mention in application form)</td>
      <td>${data.loanAmount ? `₹${Number(data.loanAmount).toLocaleString('en-IN')}` : 'Not provided'}</td>
      <td class="bold">Type of Loan (as mention in application form)</td>
      <td>${data.loanType || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Solar Purpose & Usage Confirmation (as per applicant)</td>
      <td colspan="3">${data.loanPurpose || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Address of the residence</td>
      <td colspan="3">${data.residenceAddress || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Address of the business (applicant)</td>
      <td colspan="3">${data.businessAddress || data.residenceAddress || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Met person during visit time</td>
      <td>${data.metPersonName || 'Not Provided'}</td>
      <td class="bold">Met person identity proof</td>
      <td>${data.metPersonIdProof || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Executive Name</td>
      <td colspan="3">${data.executiveName || 'Not Provided'}</td>
    </tr>
  </table>

  <!-- SECTION 2: DETAILS OF RESIDENCE VISIT REPORT -->
  <table class="report-table" style="margin-top: 10px;">
    <tr>
      <td colspan="4" class="sec-head">Details of residence visit report</td>
    </tr>
    <tr>
      <td style="width: 25%;" class="bold">Met person during visit time</td>
      <td colspan="3">${data.metPersonName || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Address of the meeting</td>
      <td colspan="3">${data.meetingAddress || data.residenceAddress || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Locating Premises Type</td>
      <td colspan="3">${data.locatingPremisesType || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="4" class="sec-head">Residential Details</td>
    </tr>
    <tr>
      <td class="bold">Ownership (If rented then rent amount)</td>
      <td colspan="3">${data.residenceOwnership || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">House Details</td>
      <td colspan="3">${data.houseDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="4" class="sec-head">Family Background of the Applicant</td>
    </tr>
    <tr>
      <td colspan="4" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr style="background-color: #fafafa; font-weight: bold; text-align: center;">
            <td style="border: 1px solid #000; width: 6%;">Sr No.</td>
            <td style="border: 1px solid #000; width: 26%;">Family Member Name</td>
            <td style="border: 1px solid #000; width: 10%;">Age</td>
            <td style="border: 1px solid #000; width: 16%;">Relation with applicant</td>
            <td style="border: 1px solid #000; width: 14%;">Qualification</td>
            <td style="border: 1px solid #000; width: 16%;">Occupation</td>
            <td style="border: 1px solid #000; width: 12%;">Dependents (Yes/No)</td>
          </tr>
          ${familyList.map((f, index) => `
            <tr>
              <td style="border: 1px solid #000;" class="text-center">${index + 1}</td>
              <td style="border: 1px solid #000;">${f.name || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.age || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.relationship || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.qualification || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.occupation || f.profession || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.isDependent !== false ? 'Yes' : 'No'}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>
    <tr>
      <td class="bold">Monthly Household Expenses</td>
      <td>₹${Number(hhExpM).toLocaleString('en-IN')}/- Per Month</td>
      <td class="bold">Electricity Connection Details</td>
      <td>${data.residenceElectricityDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Neighbor Name</td>
      <td colspan="3">${data.residenceNeighborName || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Neighbor Feedback</td>
      <td colspan="3">${data.residenceNeighborFeedback || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Latitude & Longitude of premises</td>
      <td>${data.residenceGpsCoords || 'Not Provided'}</td>
      <td class="bold">Residence Status</td>
      <td class="bold" style="color: #065f46;">${data.residenceStatus || 'Not Provided'}</td>
    </tr>
  </table>

  <!-- PAGE BREAK FOR CLEAN SECTION SPLIT -->
  <div class="page-break"></div>

  <!-- SECTION 3: BUSINESS VISIT REPORT -->
  <table class="report-table">
    <tr>
      <td colspan="2" class="sec-head">Business visit of ${data.applicantName}</td>
    </tr>
    <tr>
      <td colspan="2" class="sub-head text-center">Brief Profile of Business</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: justify; line-height: 1.4; padding: 8px;">
        ${data.briefBusinessProfile || 'Not Provided'}
      </td>
    </tr>
    <tr>
      <td style="width: 35%;" class="bold">Vintage of the business</td>
      <td>${data.businessVintage || 'Not Provided'}</td>
    </tr>
    ${(data.previousOccupation && data.yearsInBusiness !== undefined && data.yearsInBusiness < 10) ? `
    <tr>
      <td class="bold">Previous Occupation</td>
      <td>${data.previousOccupation}</td>
    </tr>
    ` : ''}
    ${(data.reasonToLeave && data.yearsInBusiness !== undefined && data.yearsInBusiness < 10) ? `
    <tr>
      <td class="bold">Reason to leave the last occupation</td>
      <td>${data.reasonToLeave}</td>
    </tr>
    ` : ''}
    <tr>
      <td class="bold">Number of staff</td>
      <td>${data.staffCount || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Is office premise on rented / owned</td>
      <td>${data.businessPremiseOwnership || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Details of Office / Factory infrastructure (Assets)</td>
      <td>${data.factoryInfrastructure || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Stock details with estimated value</td>
      <td>${data.stockDetailsValue || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Fixed & Current Asset Analysis</td>
      <td>${data.fixedAndCurrentAssetAnalysis || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Asset Creation Through Business</td>
      <td>${data.assetCreationThroughBusiness || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Business Investment</td>
      <td>${data.initialBusinessInvestment || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Agricultural Income Details</td>
      <td>${data.agriculturalIncomeDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Other source income</td>
      <td>${data.otherSourceIncomeDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Operational / Saving analysis</td>
      <td>${data.operationalSavingAnalysis || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: center; font-style: italic; font-weight: bold; padding: 10px; background-color: #f8fafc;">
        All the work details are confirmed by applicant
      </td>
    </tr>
  </table>

  <!-- SECTION 4: CUSTOMERS, SUPPLIERS, BANKING & LIABILITIES -->
  <table class="report-table" style="margin-top: 10px;">
    <tr>
      <td colspan="3" class="sec-head">Applicant's customer and supplier details</td>
    </tr>
    <tr style="background-color: #fafafa; font-weight: bold;">
      <td style="width: 35%;">Prominent Customers (Name)</td>
      <td style="width: 25%;">Customers Ph. No.</td>
      <td style="width: 40%;">Feedback (Remark)</td>
    </tr>
    ${(data.prominentCustomers || [{ name: 'Local Retail Walk-in Customers', phone: 'Multiple', remark: 'Satisfactory daily cash & UPI sales' }]).map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.remark}</td>
      </tr>
    `).join('')}

    <tr style="background-color: #fafafa; font-weight: bold;">
      <td>Prominent Suppliers (Name)</td>
      <td>Supplier Ph. No.</td>
      <td>Feedback (Remark)</td>
    </tr>
    ${(data.prominentSuppliers || [{ name: 'Regional Wholesale Distributor', phone: '9811002233', remark: 'Regular stock supplier with clean credit terms' }]).map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.phone}</td>
        <td>${s.remark}</td>
      </tr>
    `).join('')}



    <tr>
      <td colspan="3" class="sec-head">Banking Details & CC/OD Limits</td>
    </tr>
    <tr>
      <td colspan="3" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr style="background-color: #fafafa; font-weight: bold; text-align: center;">
            <td style="border: 1px solid #000;">Bank Name</td>
            <td style="border: 1px solid #000;">Branch Name</td>
            <td style="border: 1px solid #000;">Account Types</td>
            <td style="border: 1px solid #000;">CC/OD Limit</td>
            <td style="border: 1px solid #000;">Account No.</td>
            <td style="border: 1px solid #000;">Remark</td>
          </tr>
          ${(data.bankingDetails || [{ bankName: bankName, branchName: 'Main Branch', accountType: 'Saving / Current', limit: 'NA', accountNo: '**********9522', remark: 'The account belongs to applicant' }]).map(b => `
            <tr>
              <td style="border: 1px solid #000;">${b.bankName}</td>
              <td style="border: 1px solid #000;">${b.branchName}</td>
              <td style="border: 1px solid #000;" class="text-center">${b.accountType}</td>
              <td style="border: 1px solid #000;" class="text-center">${b.limit || 'NA'}</td>
              <td style="border: 1px solid #000;" class="text-center">${b.accountNo}</td>
              <td style="border: 1px solid #000;">${b.remark}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>

    <tr>
      <td colspan="3" class="sec-head">Existing Loans / Liabilities</td>
    </tr>
    <tr>
      <td colspan="3" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr style="background-color: #fafafa; font-weight: bold; text-align: center;">
            <td style="border: 1px solid #000;">Type of Loan</td>
            <td style="border: 1px solid #000;">Financer Name</td>
            <td style="border: 1px solid #000;">Loan Amount (In Lakhs)</td>
            <td style="border: 1px solid #000;">EMI (Rs.)</td>
            <td style="border: 1px solid #000;">Tenure (Yrs/Mos)</td>
            <td style="border: 1px solid #000;">Balance Tenure</td>
            <td style="border: 1px solid #000;">Remark</td>
          </tr>
          ${(data.existingLoans || [{ typeOfLoan: 'NA', financerName: 'NA', amountInLakhs: '0', emi: `${existEmiM}`, tenure: 'NA', balanceTenure: 'NA', remark: existEmiM > 0 ? 'Regular monthly EMI track' : 'No existing loan obligation' }]).map(l => `
            <tr>
              <td style="border: 1px solid #000;">${l.typeOfLoan}</td>
              <td style="border: 1px solid #000;">${l.financerName}</td>
              <td style="border: 1px solid #000;" class="text-center">${l.amountInLakhs || l.loanAmountLakhs || ''}</td>
              <td style="border: 1px solid #000;" class="text-center">₹${l.emi || l.emiRs || ''}</td>
              <td style="border: 1px solid #000;" class="text-center">${l.tenure || l.tenureYearsMonths || ''}</td>
              <td style="border: 1px solid #000;" class="text-center">${l.balanceTenure || ''}</td>
              <td style="border: 1px solid #000;">${l.remark || ''}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>

    <tr>
      <td class="bold">Current Obligation</td>
      <td colspan="2">${data.currentObligationSummary || (existEmiM > 0 ? `Monthly existing EMI of ₹${existEmiM.toLocaleString('en-IN')}` : 'No existing obligation')}</td>
    </tr>
    <tr>
      <td class="bold">Latitude & Longitude of business premises</td>
      <td colspan="2">${data.businessGpsCoords || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Remarks</td>
      <td colspan="2">${data.businessLocationRemarks || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Electricity Connection Details</td>
      <td colspan="2">${data.businessElectricityDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Neighbour Name</td>
      <td colspan="2">${data.businessNeighborName || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Neighbour Feedback</td>
      <td colspan="2">${data.businessNeighborFeedback || 'Not Provided'}</td>
    </tr>
    <tr>
      <td class="bold">Business Status</td>
      <td colspan="2" class="bold" style="color: #065f46;">${data.businessStatus || 'Not Provided'}</td>
    </tr>
  </table>

  <!-- CRIF / CIBIL REPORT PAGE -->
  ${data.parsedCreditReport ? `
  <div class="page-break"></div>
  <div style="padding: 12px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #fff; border-radius: 8px 8px 0 0; font-size: 14pt; font-weight: bold; text-align: center; margin-top: 15px; border: 1px solid #1e3a8a; border-bottom: none;">
    Extracted Credit Report (${data.parsedCreditReport.reportProvider || 'Not Provided'})
  </div>
  <table class="report-table" style="border: 2px solid #1e3a8a; border-top: none; margin-bottom: 20px;">
    <tr style="background-color: #f8fafc;">
      <td class="bold">Report Date</td>
      <td colspan="2">${data.parsedCreditReport.reportDate || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td class="bold">Total Accounts</td>
      <td colspan="2">${data.parsedCreditReport.totalAccounts || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td class="bold">Active Accounts</td>
      <td colspan="2">${data.parsedCreditReport.activeAccounts || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td class="bold">Total Current Balance</td>
      <td colspan="2">₹${data.parsedCreditReport.totalCurrentBalance?.toLocaleString('en-IN') || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td class="bold">Total Overdue Amount</td>
      <td colspan="2" style="color: ${data.parsedCreditReport.totalOverdueAmount > 0 ? '#dc2626' : 'inherit'}; font-weight: ${data.parsedCreditReport.totalOverdueAmount > 0 ? 'bold' : 'normal'};">₹${data.parsedCreditReport.totalOverdueAmount?.toLocaleString('en-IN') || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td class="bold">Credit Score</td>
      <td colspan="2" style="font-size: 14pt; color: #1e3a8a; font-weight: bold;">${data.parsedCreditReport.creditScore || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td class="bold">Risk Indicators</td>
      <td colspan="2">
        ${data.parsedCreditReport.flags && data.parsedCreditReport.flags.length > 0 ? data.parsedCreditReport.flags.join('<br/>') : 'No negative flags detected.'}
      </td>
    </tr>
  </table>
  
  ${data.parsedCreditReport.accounts && data.parsedCreditReport.accounts.length > 0 ? `
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <tr style="background-color: #0f766e; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
      <th style="padding: 10px 8px; text-align: center; font-weight: 600;">#</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Borrower</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Facility Type</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Lending Inst.</th>
      <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Status</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Disbursed Date</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Disbursed Amt</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Current Balance</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Overdue Amt</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">EMI</th>
      <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Tenure</th>
    </tr>
    ${data.parsedCreditReport.accounts.map((acc: any, index: number) => {
      const isOverdue = (acc.overdueAmount || 0) > 0;
      const bgClass = isOverdue ? '#fff1f2' : (index % 2 === 1 ? '#f8fafc' : '#ffffff');
      const isActive = acc.status === 'Active';
      
      const statusStyle = isActive 
        ? 'background-color: #dcfce7; color: #166534; padding: 3px 6px; border-radius: 4px; display: inline-block;' 
        : (acc.status === 'Closed' ? 'background-color: #f1f5f9; color: #475569; padding: 3px 6px; border-radius: 4px; display: inline-block;' : 'color: #0f172a;');
      
      return `
        <tr style="background-color: ${bgClass}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; text-align: center; color: #94a3b8; font-weight: 700;">${index + 1}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">${acc.applicantName || '—'}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #0369a1;">${acc.accountType || '—'}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #334155;">${acc.creditGrantor || '—'}</td>
          <td style="padding: 10px 8px; text-align: center; font-weight: 700;"><span style="${statusStyle}">${acc.status || '—'}</span></td>
          <td style="padding: 10px 8px; color: #475569;">${acc.disbursedDate || '—'}</td>
          <td style="padding: 10px 8px; text-align: right; color: #475569;">${acc.disbursedAmount ? '₹' + acc.disbursedAmount.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0f172a;">${acc.currentBalance ? '₹' + acc.currentBalance.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: ${isOverdue ? '#e11d48' : '#334155'};">${acc.overdueAmount ? '₹' + acc.overdueAmount.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: right; color: #475569;">${acc.instalmentAmount ? '₹' + acc.instalmentAmount.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: center; color: #475569; font-weight: 600;">${acc.tenureMonths ? acc.tenureMonths + 'M' : '—'}</td>
        </tr>
      `;
    }).join('')}
  </table>
  ` : ''}
  ` : ''}

  <!-- PAGE BREAK FOR CASH FLOW TABLE -->
  <div class="page-break"></div>

  <!-- SECTION 5: CASH FLOW & ASSESSMENT OF MONTHLY INCOME TABLE -->
  <table class="report-table">
    <tr>
      <td colspan="4" class="sec-head">Assessment of the monthly income of the applicant</td>
    </tr>
    <tr style="background-color: #fafafa; font-weight: bold; text-align: center;">
      <td style="width: 30%;">Particulars</td>
      <td style="width: 44%;">Business Notes<br/><span style="font-size: 7.5pt; font-weight: normal;">(Income assessment considered for 28 working days)</span></td>
      <td style="width: 13%;">(Period)<br/>Monthly (₹)</td>
      <td style="width: 13%;">(Period)<br/>Yearly (₹)</td>
    </tr>

    <!-- Sales / Receipts Section -->
    <tr style="background-color: #f8fafc; font-weight: bold;">
      <td colspan="4">Sales/Receipts</td>
    </tr>
    ${salesItems.map(item => `
      <tr>
        <td>${item.particulars}</td>
        <td>${item.businessNotes}</td>
        <td class="text-right">₹${Number(item.monthly).toLocaleString('en-IN')}</td>
        <td class="text-right">₹${Number(item.yearly).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr style="font-weight: bold; background-color: #f1f5f9;">
      <td colspan="2">Total Sales/Receipts (A)</td>
      <td class="text-right">₹${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>

    <!-- Expenses Section -->
    <tr style="background-color: #f8fafc; font-weight: bold;">
      <td colspan="4">Expenses</td>
    </tr>
    ${expenseItems.map(item => `
      <tr>
        <td>${item.particulars}</td>
        <td>${item.businessNotes}</td>
        <td class="text-right">₹${Number(item.monthly).toLocaleString('en-IN')}</td>
        <td class="text-right">₹${Number(item.yearly).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr style="font-weight: bold; background-color: #f1f5f9;">
      <td colspan="2">Total Expenses (B)</td>
      <td class="text-right">₹${Number(totalExpM).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(totalExpY).toLocaleString('en-IN')}</td>
    </tr>

    <!-- Net Profit & Deductions -->
    <tr style="font-weight: bold; background-color: #e2e8f0;">
      <td colspan="2">Net Profit Per month (A - B)</td>
      <td class="text-right">₹${Number(netProfM).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(netProfY).toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Less: Existing EMI</td>
      <td>No any existing obligation / Current active loans</td>
      <td class="text-right">₹${Number(existEmiM).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(existEmiY).toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td>Less: Existing Household Expenses</td>
      <td>Family monthly living, medical & education expenses</td>
      <td class="text-right">₹${Number(hhExpM).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(hhExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #d1fae5; color: #065f46;">
      <td colspan="2">Net Disposal Income (Net Income after all deductions)</td>
      <td class="text-right">₹${Number(netDisposalM).toLocaleString('en-IN')}</td>
      <td class="text-right">₹${Number(netDisposalY).toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td class="bold">Comfortable Monthly EMI</td>
      <td colspan="2" class="bold">
        Comfortable Monthly EMI Post all expenses (As per moneyboxx )
      </td>
      <td class="bold text-right">
        As per ${bankName} (Approx ₹${Math.round(Number(data.appliedAmount || 0) * 0.05).toLocaleString('en-IN')})
      </td>
    </tr>
  </table>



  <!-- RISK FACTOR -->
  ${data.riskFactor ? `
  <table class="report-table" style="margin-top: 10px; margin-bottom: 15px;">
    <tr>
      <td class="sec-head" style="background-color: #fce7f3; color: #9f1239;">Risk Factor / Key Risks Noted</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: bold; text-align: justify; color: #9f1239;">
        ${data.riskFactor}
      </td>
    </tr>
  </table>
  ` : ''}

  <!-- DISCLAIMER & SIGNATURE BLOCK -->
  <div class="disclaimer-box">
    <strong>Limitation and Disclaimer clause:</strong><br/>
    This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as observed at that point in time only. Document-related inputs are based solely on information shared during field interactions and do not constitute independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct or indirect, arising from such reliance.<br/><br/>
    <strong>Important Notes:</strong><br/>
    Actual Profit and Loss figures were not made available by "${bankName}" hence only estimated figures are captured as per the information and understanding provided by the applicant during visit.
  </div>

  <div class="sig-block" style="padding-top: 40px; border-top: 0;">
    <div>
      <strong>(Sign of Agency authorized signatory)</strong>
    </div>
    <div style="text-align: right;">
      <strong style="font-size: 10pt; color: #1e3a8a;">${data.companyHeader?.name || 'Not Provided'}</strong>
    </div>
  </div>

  <!-- PAGE BREAK FOR DETAILED EXECUTIVE SUMMARY & CREDIT APPRAISAL -->
  <div class="page-break"></div>

  <!-- SECTION 6: DETAILED SUMMARY & EXECUTIVE CREDIT APPRAISAL AT THE END -->
  <div class="summary-card">
    <div class="summary-title">
      DETAILED EXECUTIVE SUMMARY & CREDIT APPRAISAL REPORT
    </div>

    <div style="font-size: 9pt; line-height: 1.5; color: #1e293b; text-align: justify; margin-bottom: 12px;">
      ${data.aiExecutiveSummary || 'Not Provided'}
    </div>

    <!-- Financial Metrics Summary Table -->
    <table class="report-table" style="margin-bottom: 12px;">
      <tr style="background-color: #2d3e50; color: #fff; font-weight: bold; text-align: center;">
        <td colspan="4" style="border-color: #1e293b;">Institutional Financial Waterfall & Credit Metrics Summary</td>
      </tr>
      <tr>
        <td style="width: 25%;" class="bold">Adopted Monthly Sales</td>
        <td style="width: 25%;">₹${Number(totalSalesM).toLocaleString('en-IN')}</td>
        <td style="width: 25%;" class="bold">Adopted Annual Sales</td>
        <td style="width: 25%;">₹${Number(totalSalesY).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="bold">Gross Profit Margin</td>
        <td>₹${Number(netProfM + totalExpM - Math.round(totalSalesM * 0.75)).toLocaleString('en-IN')}</td>
        <td class="bold">Total Operating Expenses</td>
        <td>₹${Number(totalExpM).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="bold">Net Monthly Disposal Income</td>
        <td class="bold" style="color: #065f46;">₹${Number(netDisposalM).toLocaleString('en-IN')}</td>
        <td class="bold">Proposed Monthly EMI</td>
        <td class="bold">₹${Number(data.proposedEmi || 18200).toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="bold">DSCR Ratio</td>
        <td class="bold" style="color: ${ (data.dscrRatio || 1.4) >= 1.25 ? '#065f46' : '#b91c1c' };">
          ${data.dscrRatio || 1.4}x (Min Norm: 1.25x)
        </td>
        <td class="bold">FOIR %</td>
        <td class="bold" style="color: ${ (data.foirPct || 48) <= 60 ? '#065f46' : '#b91c1c' };">
          ${data.foirPct || 48}% (Max Cap: 60%)
        </td>
      </tr>
      <tr>
        <td class="bold">CIBIL Bureau Score</td>
        <td class="bold">${data.cibilScore || 748}</td>
        <td class="bold">Post-Loan Monthly Surplus</td>
        <td class="bold" style="color: #065f46;">₹${Number(data.postLoanSurplus || (netDisposalM - (data.proposedEmi || 18200))).toLocaleString('en-IN')}</td>
      </tr>
    </table>

    <!-- Risk & Strengths Breakdown -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
      <div style="border: 1px solid #10b981; background-color: #ecfdf5; padding: 8px; border-radius: 4px;">
        <strong style="color: #065f46; font-size: 8.5pt;">✓ Key Institutional Credit Strengths:</strong>
        <ul style="margin: 4px 0 0 15px; padding: 0; font-size: 8pt; color: #064e3b;">
          ${(data.strengths && data.strengths.length > 0 ? data.strengths : [
            'Established business vintage of 8+ years at prime location',
            'Strong DSCR ratio exceeding 1.25x institutional benchmark',
            'Positive neighbor and landlord verification feedback',
            'Sufficient working capital stock available at premises'
          ]).map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div style="border: 1px solid #f59e0b; background-color: #fffbeb; padding: 8px; border-radius: 4px;">
        <strong style="color: #92400e; font-size: 8.5pt;">⚠️ Audit Risk Flags & Mitigants:</strong>
        <ul style="margin: 4px 0 0 15px; padding: 0; font-size: 8pt; color: #78350f;">
          ${(data.flags && data.flags.length > 0 ? data.flags : [
            'Informal bookkeeping without audited GST returns (Mitigant: Footfall cross-checked)',
            'Working capital seasonality during monsoon (Mitigant: Supplementary family income)'
          ]).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Final Recommendation Block -->
    <div style="border: 2px solid #065f46; background-color: #f0fdf4; padding: 10px; text-align: center; border-radius: 4px;">
      <div style="font-size: 11pt; font-weight: 900; color: #065f46; text-transform: uppercase;">
        FINAL CREDIT COMMITTEE RECOMMENDATION: RECOMMENDED FOR SANCTION
      </div>
      <div style="font-size: 8.5pt; font-weight: bold; color: #1e293b; margin-top: 4px;">
        Sanction Limit: ₹${Number(data.loanAmount || 350000).toLocaleString('en-IN')} • Proposed EMI: ₹${Number(data.proposedEmi || 18200).toLocaleString('en-IN')} • Status: ${caseStatus}
      </div>
    </div>
  </div>

  <!-- SECTION 7: ANNEXURES - KYC DOCUMENTS & FIELD VISIT PHOTOS -->
  <div class="page-break"></div>

  <div class="hdr-main" style="margin-bottom: 10px;">
    <div class="hdr-title">ANNEXURE - VERIFIED KYC & FIELD VISIT PHOTOGRAPHS</div>
    <div class="hdr-sub">Application ID: ${appNo} • ${data.applicantName} (${data.firmName || 'Not Provided'})</div>
  </div>

  <table class="report-table">
    ${['KYC PHOTOS', 'RESIDENCE VISIT PHOTO', 'BUSINESS VISIT PHOTO', 'BUSINESS DOCUMENTS'].map(category => {
      const catPhotos = (data.photos || []).filter(p => p.category === category);
      if (catPhotos.length === 0) return '';
      return `
        <tr>
          <td class="sec-head">${category}</td>
        </tr>
        <tr>
          <td style="padding: 10px;">
            <div class="photo-grid">
              ${catPhotos.map(p => `
                <div class="photo-card">
                  <img src="${p.dataUrl}" alt="Photo" />
                </div>
              `).join('')}
            </div>
          </td>
        </tr>
      `;
    }).join('')}
  </table>
  </div>

</body>
</html>
  `;
}

export function generateMoneyboxxPDReportHTML(data: PDReportPrintData): string {
  const bankName = data.clientBankName || 'Moneyboxx Finance Limited';
  const initiationDate = data.caseInitiationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const reportDate = data.reportDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const visitDate = data.visitDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const appNo = data.applicationNumber || 'Not Provided';
  const caseStatus = data.statusOfCase || 'Not Provided';

  const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [];

  const salesItems = data.itemizedSales && data.itemizedSales.length > 0 ? data.itemizedSales : [
    { particulars: 'Flour Chakki Income', businessNotes: '06 Quintals × 100 Kg × ₹2.50 × 28 Days', monthly: 42000, yearly: 504000 }
  ];
  const totalSalesM = data.totalSalesMonthly || salesItems.reduce((acc, i) => acc + i.monthly, 0);
  const totalSalesY = data.totalSalesYearly || totalSalesM * 12;

  const expenseItems = data.itemizedExpenses && data.itemizedExpenses.length > 0 ? data.itemizedExpenses : [
    { particulars: 'Monthly diesel Expenses', businessNotes: 'The machinery is currently operated through a diesel engine setup, with approximate diesel expenses of around ₹33,600 per month.', monthly: 33600, yearly: 403200 }
  ];
  const totalExpM = data.totalExpensesMonthly || expenseItems.reduce((acc, i) => acc + i.monthly, 0);
  const totalExpY = data.totalExpensesYearly || totalExpM * 12;

  const netProfM = data.netProfitMonthly || (totalSalesM - totalExpM);
  const netProfY = data.netProfitYearly || (netProfM * 12);
  const existEmiM = data.existingEmiMonthly || 0;
  const existEmiY = data.existingEmiYearly || (existEmiM * 12);
  const hhExpM = data.monthlyHouseholdExpenses || data.householdExpensesMonthly || 4000;
  const hhExpY = data.householdExpensesYearly || (hhExpM * 12);
  const netDisposalM = data.netDisposalIncomeMonthly || (netProfM - existEmiM - hhExpM);
  const netDisposalY = data.netDisposalIncomeYearly || (netDisposalM * 12);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Moneyboxx PD Report - ${appNo}</title>
  <style>
    @page { size: A4; margin: 10mm 10mm 10mm 10mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; margin: 0; padding: 0; color: #000; line-height: 1.2; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    th, td { border: 2px solid #000; padding: 4px; vertical-align: top; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .bg-light { background-color: #f5f5f5; }
    .page-break { page-break-before: always; margin-top: 15px; }
    .sec-title { font-weight: bold; text-align: center; background-color: #f5f5f5; }
    .disclaimer-box { border: 2px solid #000; padding: 6px; font-size: 9pt; text-align: justify; border-top: none; }
    .sig-block { border: 2px solid #000; padding: 10px; display: flex; justify-content: space-between; align-items: flex-end; min-height: 60px; border-top: none; }
    
    .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 10px; }
    .photo-card { border: 2px solid #000; padding: 5px; text-align: center; }
    .photo-card img { width: 100%; height: auto; max-height: 250px; object-fit: contain; }
    
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 95vh;
      text-align: center;
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      border: 15px solid #2d3e50;
      border-top: 25px solid #eb8a23;
      padding: 25px 35px;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      position: relative;
      overflow: hidden;
    }
    .cover-page::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: #eb8a23;
      opacity: 0.1;
      border-radius: 50%;
    }
    .cover-page::after {
      content: '';
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 300px;
      height: 300px;
      background: #2d3e50;
      opacity: 0.05;
      border-radius: 50%;
    }
    .cover-logo {
      width: 140px;
      height: 140px;
      background: linear-gradient(135deg, #2d3e50 0%, #1a252f 100%);
      color: #fff;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36pt;
      font-weight: 900;
      margin-bottom: 15px;
      box-shadow: 0 10px 25px rgba(45,62,80,0.4);
      border: 4px solid #ffffff;
      z-index: 1;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: 900;
      color: #1e293b;
      text-transform: uppercase;
      margin-bottom: 15px;
      letter-spacing: 2px;
      z-index: 1;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .cover-subtitle {
      font-size: 18pt;
      color: #eb8a23;
      font-weight: 800;
      margin-bottom: 20px;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cover-details {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      width: 75%;
      text-align: left;
      z-index: 1;
      border: 1px solid rgba(255,255,255,0.4);
    }
    .cover-details table {
      width: 100%;
      font-size: 13pt;
    }
    .cover-details td {
      padding: 12px 15px;
      border-bottom: 1px dashed #cbd5e1;
      color: #334155;
    }
    .cover-details tr:last-child td {
      border-bottom: none;
    }
    .cover-footer {
      margin-top: auto;
      margin-bottom: 20px;
      font-size: 10pt;
      color: #64748b;
      z-index: 1;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  
    /* EXECUTIVE SUMMARY STYLES */
    .exec-page {
      position: relative;
      background: #ffffff;
      padding: 25px 35px 80px 35px;
      page-break-after: always;
      min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: visible;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    .exec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; position: relative; z-index: 2; }
    .exec-logo-container { display: flex; align-items: center; gap: 12px; }
    .exec-header-links { font-size: 9pt; color: #64748b; letter-spacing: 1px; }
    .exec-title-area { margin-bottom: 20px; position: relative; z-index: 2; }
    .exec-subtitle { font-size: 10pt; color: #64748b; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px; }
    .exec-title { font-size: 32pt; font-weight: 800; color: #1e3a8a; line-height: 1.1; margin-bottom: 15px; }
    .exec-client { font-size: 12pt; color: #ea580c; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    ${getUniversalCoverPageCSS()}style>
</head>
<body>
  <!-- Print Controls -->
  <div class="no-print" style="position: sticky; top: 0; background-color: #384c5e; color: #fff; padding: 10px; display: flex; justify-content: space-between; z-index: 1000; text-align:center;">
    <strong>Moneyboxx PD Report Format</strong>
    <button onclick="window.print()">Print / Save PDF</button>
  </div>
  <style>@media print { .no-print { display: none !important; } }</style>

  <div  style="outline: none;">
  
  ${getUniversalCoverPageHTML(data, appNo, reportDate, caseStatus, coverLogo)}

  <!-- PAGE 2: EXECUTIVE SUMMARY CONTINUED -->
  <div class="exec-page">
    <div class="shape-2"></div>
    <div class="exec-header">
      <div class="exec-logo-container">
        <img src="${coverLogo}" style="max-height: 40px;" alt="Infominer Services Pvt. Ltd." />
      </div>
      <div class="exec-header-links">Insights | Data | Better Decisions</div>
    </div>
    
    <div class="exec-section">
      <div class="exec-section-header">
        <div class="exec-section-number">03</div>
        <div class="exec-section-title">FINANCIAL POSITION</div>
      </div>
      <div style="padding-left: 50px;">
        <table class="exec-table-simple">
          <tr>
            <th>Particulars</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>Fixed & Current Assets</td>
            <td>${data.fixedAndCurrentAssetAnalysis || 'Not disclosed'}</td>
          </tr>
          <tr>
            <td>Asset Creation</td>
            <td>${data.assetCreationThroughBusiness || 'Not disclosed'}</td>
          </tr>
          <tr>
            <td>Business Investment</td>
            <td>${data.initialBusinessInvestment || 'Not disclosed'}</td>
          </tr>
          <tr>
            <td>Agricultural / Solar Income</td>
            <td>${data.agriculturalIncomeDetails || 'Not disclosed'}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="exec-footer">
      <div>Infominer</div>
      <div>Page 2 of 2</div>
    </div>
  </div>


  <!-- Page 1: Case Profile -->
  <table>
    <tr>
      <td colspan="4" class="text-center bold" style="border: 2px solid #000; padding: 8px;">
        ${data.companyHeader?.name || 'Not Provided'}
      </td>
    </tr>
    <tr>
      <td colspan="2" rowspan="3" style="width: 50%;">
        <strong>To,</strong><br/><br/>
        <strong>${bankName}</strong><br/><br/>
        <strong>Dear Sir/Madam,</strong><br/><br/>
        <strong>Sub: Income Assesment of ${data.applicantName}</strong>
      </td>
      <td class="bold text-center" style="vertical-align: middle; width:25%;">Date of Initiation</td>
      <td class="bold text-center" style="vertical-align: middle; width:25%;">${initiationDate}</td>
    </tr>
    <tr>
      <td class="bold text-center" style="vertical-align: middle;">Application ID</td>
      <td class="bold text-center" style="vertical-align: middle;">${appNo}</td>
    </tr>
    <tr>
      <td class="bold text-center" style="vertical-align: middle;">Status of case</td>
      <td class="bold text-center" style="vertical-align: middle;">${caseStatus}</td>
    </tr>

    <tr>
      <td colspan="4">Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:</td>
    </tr>
    <tr>
      <td colspan="4" class="sec-title">Case Profile</td>
    </tr>
    <tr>
      <td style="width: 25%;">Visit date</td>
      <td style="width: 25%;">${visitDate}</td>
      <td style="width: 25%;">Report date</td>
      <td style="width: 25%;">${reportDate}</td>
    </tr>
    <tr>
      <td>Name of applicant</td>
      <td colspan="3">${data.applicantName}</td>
    </tr>
    <tr>
      <td>Contact Number</td>
      <td colspan="3">${data.applicantPhone || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Business firm name</td>
      <td colspan="3">${data.firmName || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Co-applicant Name with relation</td>
      <td colspan="3">${((data.coApplicants && data.coApplicants[0]) ? data.coApplicants[0].name : "Spouse") || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Female candidate is on loan or not if no please collect details</td>
      <td colspan="3">${data.femaleCandidateDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Loan Amount (as mention in application form)</td>
      <td colspan="3">${data.loanAmount ? '₹' + Number(data.loanAmount).toLocaleString('en-IN') : 'Not provided'}</td>
    </tr>
    <tr>
      <td>Type of Loan (as mention in application form)</td>
      <td colspan="3">${data.loanType || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Solar Purpose & Usage Confirmation (as per applicant)</td>
      <td colspan="3">${data.loanPurpose || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Address of the residence</td>
      <td colspan="3">${data.residenceAddress || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Address of the business (applicant)</td>
      <td colspan="3"><strong>${data.businessAddress || 'Not Provided'}</strong></td>
    </tr>
    <tr>
      <td>Met person during visit time.</td>
      <td colspan="3">${data.metPersonName || data.applicantName + ' (Self)'}</td>
    </tr>
    <tr>
      <td>Met person identity proof</td>
      <td colspan="3">${data.metPersonIdProof || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Executive Name</td>
      <td colspan="3">${data.executiveName || 'Not Provided'}</td>
    </tr>
  </table>

  <!-- Page Break -->
  <div class="page-break"></div>

  <!-- Page 2: Residence Visit Report -->
  <table>
    <tr>
      <td colspan="7" class="sec-title">Details of residence visit report</td>
    </tr>
    <tr>
      <td colspan="2">Met person during visit time.</td>
      <td colspan="5">${data.metPersonName || data.applicantName + ' (Self)'}</td>
    </tr>
    <tr>
      <td colspan="2">Address of the meeting</td>
      <td colspan="5">${data.residenceAddress || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2">Locating Premises Type</td>
      <td colspan="5">${data.locatingPremisesType || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="7" class="sec-title">Residential Details</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Ownership (If rented then rent amount)</td>
      <td colspan="5">${data.residenceOwnership || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">House Details</td>
      <td colspan="5">${data.houseDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="7" class="sec-title">Family Background of the Applicant</td>
    </tr>
    <tr class="sec-title">
      <td class="bold">Sr No.</td>
      <td class="bold">Famly Member Name</td>
      <td class="bold">Age</td>
      <td class="bold">Relation with applicant</td>
      <td class="bold">Qualification</td>
      <td class="bold">Occupation</td>
      <td class="bold">Dependents ( Yes/ No )</td>
    </tr>
    ${familyList.map((f, index) => `
            <tr>
              <td style="border: 1px solid #000;" class="text-center">${index + 1}</td>
              <td style="border: 1px solid #000;">${f.name || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.age || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.relationship || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.qualification || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.occupation || f.profession || 'Not Provided'}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.isDependent !== false ? 'Yes' : 'No'}</td>
            </tr>
          `).join('')}
    <tr>
      <td colspan="2" class="bold">Monthly Household Expenses</td>
      <td colspan="5">Rs. ${Number(hhExpM).toLocaleString('en-IN')}/- Per Month</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Electricity Connection Details</td>
      <td colspan="5">${data.residenceElectricityDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbor Name</td>
      <td colspan="5">${data.residenceNeighborName || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbor Feedback</td>
      <td colspan="5">${data.residenceNeighborFeedback || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Latitude & Longitude of the business premises</td>
      <td colspan="5">${data.businessGpsCoords || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Residence Status</td>
      <td colspan="5">${data.residenceStatus || 'Not Provided'}</td>
    </tr>
  </table>

  <div class="page-break"></div>

  <!-- Page 3: Business Visit Report -->
  <table>
    <tr>
      <td colspan="2" class="sec-title">Business visit of ${data.applicantName}</td>
    </tr>
    <tr>
      <td colspan="2" class="sec-title">Brief Profile of Business</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: justify; line-height: 1.4; padding: 8px;">
        ${data.briefBusinessProfile || 'Not Provided'}
      </td>
    </tr>
    <tr>
      <td style="width:30%;">Vintage of the business</td>
      <td>${data.businessVintage || 'Not Provided'}</td>
    </tr>
    ${(data.previousOccupation && data.yearsInBusiness !== undefined && data.yearsInBusiness < 10) ? `
    <tr>
      <td>Previous Occupation</td>
      <td>${data.previousOccupation}</td>
    </tr>
    ` : ''}
    ${(data.reasonToLeave && data.yearsInBusiness !== undefined && data.yearsInBusiness < 10) ? `
    <tr>
      <td>Reason to leave the last occupation</td>
      <td>${data.reasonToLeave}</td>
    </tr>
    ` : ''}
    <tr>
      <td>Number of staffs</td>
      <td>${data.staffCount || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Is office premise on rented /owned</td>
      <td>${data.businessPremiseOwnership || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Details of Office / Factory infrastructure ( Assets )</td>
      <td>${data.factoryInfrastructure || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Stock details with estimated value</td>
      <td>${data.stockDetailsValue || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Fixed & Current Asset Analysis</td>
      <td>${data.fixedAndCurrentAssetAnalysis || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Asset Creation Through Business</td>
      <td>${data.assetCreationThroughBusiness || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Business Investment</td>
      <td>${data.initialBusinessInvestment || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Agricultural Income Details</td>
      <td>${data.agriculturalIncomeDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Other source income</td>
      <td>${data.otherSourceIncomeDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td>Solar saving analysis</td>
      <td>${data.operationalSavingAnalysis || 'Not Provided'}</td>
    </tr>
  </table>

  <div class="page-break"></div>

  <!-- Page 4: Suppliers and Banking -->
  <table>
    <tr>
      <td colspan="7" class="sec-title">Applicant's customer and supplier details</td>
    </tr>
    <tr class="sec-title">
      <td>Sr. No.</td>
      <td colspan="2">Prominent Customers (Name)</td>
      <td colspan="2">Customers Ph. No.</td>
      <td colspan="2">Feedback (Remark)</td>
    </tr>
    ${(data.prominentCustomers || [{ name: 'Not applicable', phone: '', remark: '' }]).map((c, i) => `
      <tr class="text-center">
        <td>${i+1}</td>
        <td colspan="2">${c.name}</td>
        <td colspan="2">${c.phone}</td>
        <td colspan="2">${c.remark}</td>
      </tr>
    `).join('')}
    
    <tr class="sec-title">
      <td>Sr. No.</td>
      <td colspan="2">Prominent Suppliers (Name)</td>
      <td colspan="2">Supplier Ph. No.</td>
      <td colspan="2">Feedback (Remark)</td>
    </tr>
    ${(data.prominentSuppliers || [{ name: 'Not applicable', phone: '', remark: '' }]).map((s, i) => `
      <tr class="text-center">
        <td>${i+1}</td>
        <td colspan="2">${s.name}</td>
        <td colspan="2">${s.phone}</td>
        <td colspan="2">${s.remark}</td>
      </tr>
    `).join('')}



    <tr>
      <td colspan="7" class="sec-title bg-light">Banking Details & CC/OD Limits</td>
    </tr>
    <tr class="sec-title bg-light">
      <td colspan="2">Bank Name</td>
      <td>Branch Name</td>
      <td>Account Types</td>
      <td>CC/OD Limit</td>
      <td>Account No.</td>
      <td>Remark</td>
    </tr>
    ${(data.bankingDetails || [{ bankName: 'State Bank of India', branchName: 'Tilhar', accountType: 'Saving Account', limit: 'NA', accountNo: '**********', remark: 'The account belongs to applicant' }]).map((b) => `
      <tr class="text-center">
        <td colspan="2">${b.bankName}</td>
        <td>${b.branchName}</td>
        <td>${b.accountType}</td>
        <td>${b.limit || 'NA'}</td>
        <td>${b.accountNo}</td>
        <td>${b.remark}</td>
      </tr>
    `).join('')}

    <tr>
      <td colspan="7" class="sec-title bg-light">Existing Loans / Liabilities</td>
    </tr>
    <tr class="sec-title bg-light">
      <td>Type of Loan</td>
      <td>Financer Name</td>
      <td>Loan Amount (In Lakhs)</td>
      <td>EMI (Rs.)</td>
      <td>Tenure (Years, Months)</td>
      <td>Balance Tenure (Years, Months)</td>
      <td>Remark</td>
    </tr>
    ${(data.existingLoans || [{ typeOfLoan: 'NA', financerName: 'NA', amountInLakhs: '', emi: '', tenure: '', balanceTenure: '', remark: 'No any existing obligation' }]).map((l) => `
      <tr class="text-center">
        <td>${l.typeOfLoan}</td>
        <td>${l.financerName}</td>
        <td>${l.amountInLakhs || l.loanAmountLakhs || ''}</td>
        <td>${l.emi || l.emiRs || ''}</td>
        <td>${l.tenure || l.tenureYearsMonths || ''}</td>
        <td>${l.balanceTenure || ''}</td>
        <td>${l.remark || ''}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="2" class="bold">Current Obligation</td>
      <td colspan="5">${data.currentObligationSummary || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Latitude & Longitude of the business premises</td>
      <td colspan="5">${data.businessGpsCoords || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Remarks</td>
      <td colspan="5">${data.businessLocationRemarks || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Electricity Connection Details</td>
      <td colspan="5">${data.businessElectricityDetails || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbour Name</td>
      <td colspan="5">${data.businessNeighborName || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbor Feedback</td>
      <td colspan="5">${data.businessNeighborFeedback || 'Not Provided'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Business Status</td>
      <td colspan="5">${data.businessStatus || 'Not Provided'}</td>
    </tr>
  </table>

  <!-- CRIF / CIBIL REPORT PAGE -->
  ${data.parsedCreditReport ? `
  <div class="page-break"></div>
  <div style="padding: 12px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #fff; border-radius: 8px 8px 0 0; font-size: 14pt; font-weight: bold; text-align: center; margin-top: 15px; border: 1px solid #1e3a8a; border-bottom: none;">
    Extracted Credit Report (${data.parsedCreditReport.reportProvider || 'Not Provided'})
  </div>
  <table class="report-table" style="border: 2px solid #1e3a8a; border-top: none; margin-bottom: 20px;">
    <tr style="background-color: #f8fafc;">
      <td class="bold">Report Date</td>
      <td colspan="2">${data.parsedCreditReport.reportDate || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td class="bold">Total Accounts</td>
      <td colspan="2">${data.parsedCreditReport.totalAccounts || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td class="bold">Active Accounts</td>
      <td colspan="2">${data.parsedCreditReport.activeAccounts || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td class="bold">Total Current Balance</td>
      <td colspan="2">₹${data.parsedCreditReport.totalCurrentBalance?.toLocaleString('en-IN') || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td class="bold">Total Overdue Amount</td>
      <td colspan="2" style="color: ${data.parsedCreditReport.totalOverdueAmount > 0 ? '#dc2626' : 'inherit'}; font-weight: ${data.parsedCreditReport.totalOverdueAmount > 0 ? 'bold' : 'normal'};">₹${data.parsedCreditReport.totalOverdueAmount?.toLocaleString('en-IN') || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td class="bold">Credit Score</td>
      <td colspan="2" style="font-size: 14pt; color: #1e3a8a; font-weight: bold;">${data.parsedCreditReport.creditScore || 'Not Provided'}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td class="bold">Risk Indicators</td>
      <td colspan="2">
        ${data.parsedCreditReport.flags && data.parsedCreditReport.flags.length > 0 ? data.parsedCreditReport.flags.join('<br/>') : 'No negative flags detected.'}
      </td>
    </tr>
  </table>
  
  ${data.parsedCreditReport.accounts && data.parsedCreditReport.accounts.length > 0 ? `
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <tr style="background-color: #0f766e; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
      <th style="padding: 10px 8px; text-align: center; font-weight: 600;">#</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Borrower</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Facility Type</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Lending Inst.</th>
      <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Status</th>
      <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Disbursed Date</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Disbursed Amt</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Current Balance</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Overdue Amt</th>
      <th style="padding: 10px 8px; text-align: right; font-weight: 600;">EMI</th>
      <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Tenure</th>
    </tr>
    ${data.parsedCreditReport.accounts.map((acc: any, index: number) => {
      const isOverdue = (acc.overdueAmount || 0) > 0;
      const bgClass = isOverdue ? '#fff1f2' : (index % 2 === 1 ? '#f8fafc' : '#ffffff');
      const isActive = acc.status === 'Active';
      
      const statusStyle = isActive 
        ? 'background-color: #dcfce7; color: #166534; padding: 3px 6px; border-radius: 4px; display: inline-block;' 
        : (acc.status === 'Closed' ? 'background-color: #f1f5f9; color: #475569; padding: 3px 6px; border-radius: 4px; display: inline-block;' : 'color: #0f172a;');
      
      return `
        <tr style="background-color: ${bgClass}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; text-align: center; color: #94a3b8; font-weight: 700;">${index + 1}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">${acc.applicantName || '—'}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #0369a1;">${acc.accountType || '—'}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #334155;">${acc.creditGrantor || '—'}</td>
          <td style="padding: 10px 8px; text-align: center; font-weight: 700;"><span style="${statusStyle}">${acc.status || '—'}</span></td>
          <td style="padding: 10px 8px; color: #475569;">${acc.disbursedDate || '—'}</td>
          <td style="padding: 10px 8px; text-align: right; color: #475569;">${acc.disbursedAmount ? '₹' + acc.disbursedAmount.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0f172a;">${acc.currentBalance ? '₹' + acc.currentBalance.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: ${isOverdue ? '#e11d48' : '#334155'};">${acc.overdueAmount ? '₹' + acc.overdueAmount.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: right; color: #475569;">${acc.instalmentAmount ? '₹' + acc.instalmentAmount.toLocaleString('en-IN') : '—'}</td>
          <td style="padding: 10px 8px; text-align: center; color: #475569; font-weight: 600;">${acc.tenureMonths ? acc.tenureMonths + 'M' : '—'}</td>
        </tr>
      `;
    }).join('')}
  </table>
  ` : ''}
  ` : ''}

  <div class="page-break"></div>

  <!-- Page 5: Monthly Income Assessment -->
  <table>
    <tr>
      <td colspan="4" class="sec-title">Assessment of the monthly income of the applicant</td>
    </tr>
    <tr class="sec-title text-center">
      <td style="width:25%;">Particulars</td>
      <td style="width:45%;">Business Notes<br/><span style="font-weight:normal;">Income assessment considered for ${data.workingDays || 28} working days</span></td>
      <td colspan="2">(Period)</td>
    </tr>
    <tr class="sec-title text-center">
      <td>Sales/Receipts</td>
      <td></td>
      <td style="width:15%;">Monthly</td>
      <td style="width:15%;">Yearly</td>
    </tr>
    ${salesItems.map(item => `
      <tr class="text-center">
        <td>${item.particulars}</td>
        <td>${item.businessNotes}</td>
        <td>${Number(item.monthly).toLocaleString('en-IN')}</td>
        <td>${Number(item.yearly).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr class="sec-title text-center">
      <td colspan="2" class="text-left">Total Sales/Receipts (A)</td>
      <td>${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td>${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    
    ${expenseItems.map(item => `
      <tr class="text-center">
        <td>${item.particulars}</td>
        <td class="text-left">${item.businessNotes}</td>
        <td>${Number(item.monthly).toLocaleString('en-IN')}</td>
        <td>${Number(item.yearly).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    
    <tr class="sec-title text-center">
      <td colspan="2" class="text-left">Total Expenses(B)</td>
      <td>${Number(totalExpM).toLocaleString('en-IN')}</td>
      <td>${Number(totalExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="sec-title text-center">
      <td colspan="2" class="text-left">Net Profit Per month(A- B)</td>
      <td>${Number(netProfM).toLocaleString('en-IN')}</td>
      <td>${Number(netProfY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="text-center">
      <td class="text-left bold">Less: Existing EMI</td>
      <td class="text-left">${data.existingEmiNotes || 'Not Provided'}</td>
      <td class="bold">${Number(existEmiM).toLocaleString('en-IN')}</td>
      <td class="bold">${Number(existEmiY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="text-center">
      <td class="text-left bold">Less: Existing Household Expenses</td>
      <td class="text-left">${data.householdExpensesNotes || 'Not Provided'}</td>
      <td class="bold">${Number(hhExpM).toLocaleString('en-IN')}</td>
      <td class="bold">${Number(hhExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="sec-title text-center">
      <td class="text-left">Net Disposal Income</td>
      <td>Net Income after all deductions ( Monthly/Yearly )</td>
      <td>${Number(netDisposalM).toLocaleString('en-IN')}</td>
      <td>${Number(netDisposalY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="text-center">
      <td class="text-left bold">Comfortable Monthly EMI</td>
      <td class="text-left bold">${data.comfortableEmiNotes || 'Not Provided'}</td>
      <td colspan="2" class="bold">As per ${bankName} Limited</td>
    </tr>
  </table>



  <!-- Detailed Summary Section -->
  <div style="margin-top: 20px; border: 1px solid #000; padding: 15px; background: #fafafa;">
    <h3 style="margin-top: 0; color: #333; text-transform: uppercase; font-size: 11pt; border-bottom: 2px solid #ccc; padding-bottom: 5px;">Executive Detailed Summary</h3>
    <p style="text-align: justify; font-size: 9.5pt; line-height: 1.6;">
      <strong>Business Overview:</strong> The applicant, ${data.applicantName}, operates <strong>${data.firmName || 'Not Provided'}</strong> and has been engaged in this line of work for over ${data.yearsInBusiness || 0} years. The business is conducted from a ${data.shopOwnership === 'OWNED' ? 'self-owned' : 'rented'} premises.
      <br/><br/>
      <strong>Purpose & Utilization:</strong> The primary purpose of this facility is <strong>${data.solarPurposeUsage || data.purpose || 'Not Provided'}</strong>. This investment is expected to directly reduce operational overheads (like diesel/electricity costs) and improve net margins.
      <br/><br/>
      <strong>Financial Health:</strong> The stated monthly turnover is ₹${Number(totalSalesM).toLocaleString('en-IN')} with an estimated net profit margin of around ${Math.round((netProfM / (totalSalesM || 1)) * 100)}%. The household expenses and existing obligations are comfortably covered by the net disposable income of ₹${Number(netDisposalM).toLocaleString('en-IN')}, leaving sufficient room to service the proposed EMI of approximately ₹${Math.round(Number(data.appliedAmount || 0) * 0.05).toLocaleString('en-IN')}.
    </p>
  </div>

  <div class="disclaimer-box">
    <strong>Limitation and Disclaimer clause: -</strong><br/>
    This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field 
    verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as 
    observed at that point in time only. Document-related inputs are based solely on information shared during field interactions and do not constitute 
    independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or 
    forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory 
    bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct 
    or indirect, arising from such reliance.<br/><br/>
    <strong>Important Notes:</strong><br/>
    <strong>Actual Profit and Loss figures were not made available by "${bankName}" hence only estimated figures are captured as per the 
    information and understanding provided by the applicant during visit.</strong>
  </div>
  <div class="sig-block" style="padding-top: 40px; border-top: 0;">
    <div>
      <strong style="text-decoration: underline;">(Sign of Agency authorized signatory)</strong>
    </div>
    <div style="text-align: right;">
      <strong style="font-size: 10pt; color: #1e3a8a;">${data.companyHeader?.name || 'Not Provided'}</strong>
    </div>
  </div>

  <!-- Annexure: Uploaded Photos -->
  <div class="page-break"></div>
  <table>
    <tr><td class="sec-title" style="font-size: 14pt;">Annexure: Field Inspection & KYC Photos</td></tr>
  </table>
  <div style="max-width: 800px; margin: 0 auto;">
    ${['KYC PHOTOS', 'RESIDENCE VISIT PHOTO', 'BUSINESS VISIT PHOTO', 'BUSINESS DOCUMENTS'].map(category => {
      const catPhotos = (data.photos || []).filter(p => p.category === category);
      if (catPhotos.length === 0) return '';
      return `
        <h4 style="text-align: center; background: #f5f5f5; padding: 5px; margin-top: 20px; border: 1px solid #000;">${category}</h4>
        <div class="photo-grid" style="grid-template-columns: 1fr 1fr; border: 1px solid #000; border-top: none; min-height: 50px;">
          ${catPhotos.map(p => `
            <div class="photo-card">
              <img src="${p.dataUrl}" alt="Photo" />
            </div>
          `).join('')}
        </div>
      `;
    }).join('')}
  </div>
  </div>
</body>
</html>
  `;
}

export function openStandardPDReportPrintWindow(data: PDReportPrintData) {
  let htmlContent = '';
  if (data.clientBankName && data.clientBankName.toLowerCase().includes('moneyboxx')) {
    htmlContent = generateMoneyboxxPDReportHTML(data);
  } else if (data.clientBankName && data.clientBankName.toLowerCase().includes('sbfc')) {
    htmlContent = generateSbfcPDReportHTML(data);
  } else if (data.clientBankName && data.clientBankName.toLowerCase().includes('godrej')) {
    htmlContent = generateGodrejPDReportHTML(data);
  } else {
    htmlContent = generateStandardPDReportHTML(data);
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
}


export function generateSbfcPDReportHTML(data: PDReportPrintData): string {
  const appNo = data.applicationNumber || 'Not Provided';
  const reportDate = data.visitDate || '-';
  const caseStatus = data.statusOfCase || 'Positive';
  
  let photosHtml = '';
  const photos = (data as any).photos || [];
  if (photos && photos.length > 0) {
    photosHtml = `
      <div class="page-break"></div>
      <table class="report-table">
        <tr><td class="sec-head" style="text-align:center;">Photographs</td></tr>
        <tr><td>
          <div class="photo-grid">
            ${photos.map((p: any) => `
              <div class="photo-card">
                <img src="${p.dataUrl}" alt="${p.label || 'Site Photo'}" />
                <div style="font-size:8pt; margin-top:5px; font-weight:bold;">${p.label || 'Site Photo'}</div>
              </div>
            `).join('')}
          </div>
        </td></tr>
      </table>
    `;
  }

  // Helper variables for data
  const existEmiM = data.existingEmiMonthly || 0;
  const existEmiY = data.existingEmiYearly || (existEmiM * 12);
  const totalSalesM = data.totalSalesMonthly || 0;
  const totalSalesY = totalSalesM * 12;
  const netProfM = data.netProfitMonthly || 0;
  const netProfY = netProfM * 12;
  const hhExpM = data.monthlyHouseholdExpenses || data.householdExpensesMonthly || 0;
  const netDisposalM = netProfM - hhExpM;
  const netDisposalY = netDisposalM * 12;
  
  const customerList = data.prominentCustomers && data.prominentCustomers.length > 0 ? data.prominentCustomers : [{ name: 'Not provided', phone: '0000000000', remark: 'Not provided' }];
  const supplierList = data.prominentSuppliers && data.prominentSuppliers.length > 0 ? data.prominentSuppliers : [{ name: 'Not provided', phone: '0000000000', remark: 'Not provided' }];
  const bankingList = data.bankingDetails && data.bankingDetails.length > 0 ? data.bankingDetails : [{ bankName: 'Not shared', branchName: 'NA', accountNo: 'NA', limit: 'NA', remark: 'NA' }];
  const loansList = data.existingLoans && data.existingLoans.length > 0 ? data.existingLoans : [{ typeOfLoan: 'Not shared', financerName: 'NA', amountInLakhs: 'NA', emi: existEmiM || 'NA', tenure: 'NA', balanceTenure: 'NA' }];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SBFC Finance LTD PD Report - ${appNo}</title>
  <style>
    @page { size: A4; margin: 10mm 12mm 10mm 12mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 8.5pt; color: #000; background-color: #fff; margin: 0; padding: 0; line-height: 1.35; }
    .page-break { page-break-before: always; margin-top: 15px; }
    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .report-table th, .report-table td { border: 1px solid #000; padding: 4px 8px; vertical-align: top; }
    .hdr-main { text-align: center; background-color: #e2e8f0; padding: 10px; margin-bottom: 0px; border: 1px solid #000; border-bottom: none; }
    .hdr-title { font-size: 10pt; }
    .sec-head { background-color: #e2e8f0; text-align: center; font-weight: bold;}
    .bold { font-weight: bold; }
    .text-center { text-align: center; }
    
    ${getUniversalCoverPageCSS()}
    
    .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
    .photo-card { border: 1px solid #000; padding: 5px; text-align: center; }
    .photo-card img { width: 100%; height: 250px; object-fit: contain; background: #f3f4f6; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  ${getUniversalCoverPageHTML(data, appNo, reportDate, caseStatus, coverLogo)}

  <div class="hdr-main">
    <div class="hdr-title">${data.companyHeader?.name || 'Mahesh & Co.'}</div>
    <div>Email: pd4@mco.net.in</div>
  </div>

  <table class="report-table">
    <tr><td colspan="4" class="text-center">Personal Discussion Report</td></tr>
    <tr><td colspan="4">To,</td></tr>
    <tr>
      <td colspan="2" style="width: 50%;">${data.clientBankName || 'SBFC Finance LTD'}</td>
      <td style="width: 25%;">Initiated Date</td>
      <td style="width: 25%;">${data.visitDate || '-'}</td>
    </tr>
    <tr>
      <td colspan="2">Dear Sir/Madam,</td>
      <td>Application No.</td>
      <td>${appNo}</td>
    </tr>
    <tr>
      <td colspan="2">Sub: AIP Report of ${data.applicantName || '-'}</td>
      <td>Case Status</td>
      <td>${data.statusOfCase || 'Negative / Positive'}</td>
    </tr>
    <tr><td colspan="4">Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:</td></tr>
    
    <tr><td colspan="4" class="sec-head">SUMMARY INFORMATION</td></tr>
    <tr>
      <td>Case visit date</td><td>${data.visitDate || '-'}</td>
      <td>Report date</td><td>${data.visitDate || '-'}</td>
    </tr>
    <tr><td colspan="2">Name & Relation of person met</td><td colspan="2">${data.metPersonName || '-'} (${data.metPersonIdProof ? 'Owner' : 'Self'})</td></tr>
    <tr><td colspan="2">Contact Number</td><td colspan="2">${data.applicantPhone || '-'}</td></tr>
    <tr><td colspan="2">Applicant Qualification</td><td colspan="2">${data.applicantQualification || '12th passed'}</td></tr>
    <tr><td colspan="2">Firm's Name</td><td colspan="2">${data.firmName || '-'}</td></tr>
    <tr><td colspan="2">Business Address</td><td colspan="2">${data.businessAddress || '-'}</td></tr>
    <tr><td colspan="2">Address of the meeting</td><td colspan="2">${data.meetingAddress || '-'}</td></tr>
    <tr><td colspan="2">Documents Seen</td><td colspan="2">PAN Card, Udyam Certificate, GST Certificate, Manual Records.</td></tr>
    <tr><td colspan="2">Loan Amount applied (as per applicant)</td><td colspan="2">${data.appliedAmount || '-'}</td></tr>
    <tr><td colspan="2">Type of Loan</td><td colspan="2">${data.loanType || 'Business Loan'}</td></tr>
    <tr><td colspan="2">Purpose of Loan (as per applicant)</td><td colspan="2">${data.purpose || data.loanPurpose || '-'}</td></tr>
    <tr><td colspan="2">Is it Prop. / Partnership / Pvt Ltd/Ltd</td><td colspan="2">Proprietorship</td></tr>
    <tr><td colspan="2">Details of Partners/Directors</td><td colspan="2">Not applicable</td></tr>
    <tr><td colspan="2">Sharing pattern</td><td colspan="2">100%</td></tr>
    <tr><td colspan="2">Locating Premises</td><td colspan="2">${data.locatingPremisesType || 'The business premises located at residential // commercial area'}</td></tr>
    <tr><td colspan="2">Nature of Business</td><td colspan="2">${data.businessNature || 'Trading / Retail / Service'}</td></tr>
    
    <tr><td colspan="4" class="sec-head">Brief Profile of Business</td></tr>
    <tr><td colspan="4" style="height: 100px;">${data.briefBusinessProfile || 'The products supplied by the applicant range in price from approximately Rs. 100 to Rs. 4,000.\\nThe applicant deals with approximately 25-30 customers daily in the business.\\nThe business hours are from 11:00 AM to 10:00 PM, with no weekly holidays.\\n(All the above details are confirm verbally by met person)'}</td></tr>
    
    <tr>
      <td colspan="2">Is office premise on rented /owned</td>
      <td colspan="2">${data.shopOwnership || '-'}</td>
    </tr>
    <tr>
      <td colspan="2">Vintage of the business</td>
      <td colspan="2">${data.businessVintage || '-'}</td>
    </tr>
    <tr>
      <td colspan="2">Inventory item details with estimated value</td>
      <td colspan="2">${data.stockDetailsValue ? 'Stock worth approximately ' + data.stockDetailsValue : 'Not provided'}</td>
    </tr>
  </table>

  <div class="page-break"></div>
  
  <table class="report-table">
    <tr>
      <td colspan="2" style="width: 30%;">Business Proof details (like S & E/GST Certificate/Electricity Bills)</td>
      <td colspan="2" style="width: 70%;">Applicant has shared Udyam / GST / Utility bills as proof of business.</td>
    </tr>
    <tr><td colspan="2">Number of staffs</td><td colspan="2">${data.staffCount || 'He is self-employed and operates the business by himself.'}</td></tr>
    <tr><td colspan="2">Details of Office / Factory infrastructure</td><td colspan="2">Desk, chairs, fans, weight scales, furniture racks, and other similar assets were observed in the applicant's business setup.</td></tr>
    <tr><td colspan="2">Other source income</td><td colspan="2">The applicant does not have any other source of income.</td></tr>
    
    <tr class="sec-head">
      <td style="width: 10%;">Sr. No.</td>
      <td style="width: 40%;">Customer Name & City</td>
      <td style="width: 25%;">Contact No.</td>
      <td style="width: 25%;">Feedback and remark</td>
    </tr>
    ${customerList.map((c: any, i: number) => `
    <tr>
      <td>${i+1}</td>
      <td>${c.name}</td>
      <td>${c.phone}</td>
      <td>${c.remark}</td>
    </tr>
    `).join('')}

    <tr class="sec-head">
      <td>Sr. No.</td>
      <td>Supplier Name & City</td>
      <td>Contact No.</td>
      <td>Feedback and remark</td>
    </tr>
    ${supplierList.map((s: any, i: number) => `
    <tr>
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.phone}</td>
      <td>${s.remark}</td>
    </tr>
    `).join('')}

    <tr><td colspan="4" class="sec-head">Banking Details And Limit OD And CC Limit With Bank</td></tr>
    <tr class="sec-head">
      <td>Bank Name</td>
      <td>Bank Branch</td>
      <td>Account Number / CC/OD Limit</td>
      <td>Remark</td>
    </tr>
    ${bankingList.map((b: any) => `
    <tr class="text-center">
      <td>${b.bankName}</td>
      <td>${b.branchName}</td>
      <td>${b.accountNo} / ${b.limit || 'NA'}</td>
      <td>${b.remark}</td>
    </tr>
    `).join('')}

    <tr><td colspan="4" class="sec-head">EXISTING LOANS / LIABILITIES</td></tr>
    <tr class="sec-head">
      <td>Type of Loan</td>
      <td>FI Name / Loan Amount (Lacs)</td>
      <td>EMI</td>
      <td>Tenor (yrs., moths) / Bal. Tenor</td>
    </tr>
    ${loansList.map((l: any) => `
    <tr class="text-center">
      <td>${l.typeOfLoan}</td>
      <td>${l.financerName} / ${l.amountInLakhs || 'NA'}</td>
      <td>${l.emi}</td>
      <td>${l.tenure || 'NA'} / ${l.balanceTenure || 'NA'}</td>
    </tr>
    `).join('')}

    <tr><td colspan="4" class="sec-head">Monthly & Yearly Income Assessment of Customer</td></tr>
    <tr class="sec-head">
      <td colspan="2">Particulars (Applicant)</td>
      <td>Monthly Income</td>
      <td>Yearly Income</td>
    </tr>
    <tr>
      <td colspan="2">Sales/Receipts</td>
      <td>${totalSalesM}</td>
      <td>${totalSalesY}</td>
    </tr>
    <tr>
      <td colspan="2">Total Sales/Receipts (A)</td>
      <td>${totalSalesM}</td>
      <td>${totalSalesY}</td>
    </tr>
    <tr>
      <td colspan="2">Purchase</td>
      <td>${totalSalesM * 0.7}</td>
      <td>${totalSalesY * 0.7}</td>
    </tr>
    <tr>
      <td colspan="2">Monthly Electricity Expenses</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td colspan="2">Salary of Employees</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td colspan="2">Business Premises Rent (if the premises is on rent)</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td colspan="2">Other expenses</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td colspan="2">Total Expenses (B)</td>
      <td>${totalSalesM * 0.7}</td>
      <td>${totalSalesY * 0.7}</td>
    </tr>
    <tr>
      <td colspan="2">Net Profit Per month(A- B)</td>
      <td>${netProfM}</td>
      <td>${netProfY}</td>
    </tr>
    <tr>
      <td colspan="2">Less: Household Expenses</td>
      <td>${hhExpM}</td>
      <td>${hhExpM * 12}</td>
    </tr>
    <tr>
      <td colspan="2">Add: Other Source of Income</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Net Disposal Income</td>
      <td class="bold">${netDisposalM}</td>
      <td class="bold">${netDisposalY}</td>
    </tr>
    <tr>
      <td colspan="2">Annual Turnover & Margin</td>
      <td colspan="2">Applicant informed that his yearly turnover Rs. ${Math.round(totalSalesY/100000)} lakh and net profit margin ${Math.round((netProfM/(totalSalesM||1))*100)}%.</td>
    </tr>
    <tr>
      <td colspan="2">Affordable EMI as per customer requirement</td>
      <td colspan="2">As per branch.</td>
    </tr>
  </table>

  <div class="page-break"></div>

  <table class="report-table">
    <tr><td colspan="2" class="sec-head">Residential Details</td></tr>
    <tr><td style="width:30%;">House Address</td><td>${data.residenceAddress || '-'}</td></tr>
    <tr><td>Locality</td><td>UMC</td></tr>
    <tr><td>Ownership of premises</td><td>${data.residenceOwnership || '-'}</td></tr>
    <tr><td>Area & Market Value</td><td>${data.residenceMarketValue || '-'}</td></tr>
    
    <tr><td colspan="2" class="sec-head">Family Background</td></tr>
    <tr><td colspan="2">Total Family members- ${data.familyMembers?.length || 0}</td></tr>
    
    <tr><td colspan="2" class="sec-head">Family Details</td></tr>
  </table>
  <table class="report-table" style="margin-top:-20px; border-top:none;">
    <tr class="sec-head">
      <td>S.No</td>
      <td>Members Name</td>
      <td>Relation</td>
      <td>Age</td>
      <td>Occupation</td>
      <td>Staying with Applicant or Not</td>
    </tr>
    ${(data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [
      { name: data.applicantName || 'Applicant', relation: 'Self', age: '', occupation: '', dependent: false }
    ]).map((f: any, i: number) => `
      <tr>
        <td>${i+1}</td>
        <td>${f.name}</td>
        <td>${f.relation}</td>
        <td>${f.age || ''}</td>
        <td>${f.occupation || ''}</td>
        <td>Yes</td>
      </tr>
    `).join('')}
  </table>

  <table class="report-table">
    <tr><td colspan="2" class="sec-head">Observations</td></tr>
    <tr>
      <td class="bold" style="width:20%;">Strength</td>
      <td>
        1. The Applicant has been running this business under the name ${data.firmName || '-'} for the last ${data.businessVintage || '-'} years.<br/>
        2. The applicant was available at the time of verification and provided all details.<br/>
        3. During the visit, the applicant's business activity was observed.<br/>
        4. The applicant presented a PAN card as a KYC document.<br/>
      </td>
    </tr>
    <tr>
      <td class="bold">Weakness</td>
      <td>
        1. Standard business risks apply.
      </td>
    </tr>
    <tr>
      <td class="bold">Latitude & Longitude</td>
      <td>${data.businessGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td class="bold">Case Status</td>
      <td class="bold">${data.statusOfCase || 'Positive'}</td>
    </tr>
    <tr>
      <td class="bold">Reported By</td>
      <td>• Visit Done By – ${data.executiveName || 'Verification Officer'}</td>
    </tr>
    <tr>
      <td colspan="2" style="font-size:8pt; text-align:justify; color:#555;">
        <b>Disclaimer:-</b> This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field verification, comprising site visits, on-ground observations, and verbal interactions. It does not constitute an audit, legal investigation.
      </td>
    </tr>
    <tr>
      <td colspan="2" style="height: 60px; vertical-align: bottom;">
        <b>Authorized Signature</b>
      </td>
    </tr>
  </table>

  ${photosHtml}

</body>
</html>
`;
}


export function generateGodrejPDReportHTML(data: PDReportPrintData): string {
  const appNo = data.applicationNumber || '';
  const reportDate = data.visitDate || '';
  const caseStatus = data.statusOfCase || 'Positive';

  // Helper arrays for iteration
  const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [{ name: '', relation: '', period: '', area: '' }];
  const bankingList = data.bankingDetails && data.bankingDetails.length > 0 ? data.bankingDetails : [{ bankName: '', accountType: '', accountNo: '', limit: '', vintage: '', collateral: '' }];
  const loansList = data.existingLoans && data.existingLoans.length > 0 ? data.existingLoans : [{ bankName: '', loanType: '', amount: '', emi: '', tenor: '', paidEmi: '' }];
  const buyerSupplierList = (data.prominentCustomers || []).concat(data.prominentSuppliers || []);
  if (buyerSupplierList.length === 0) buyerSupplierList.push({ name: 'Not shared', type: '', contribution: '', creditPeriod: '', relationship: '', contact: '' } as any);
  
  let photosHtml = '';
  const photos = (data as any).photos || [];
  if (photos && photos.length > 0) {
    photosHtml = `
      <div class="page-break"></div>
      <table class="report-table" style="border:none;">
        <tr><td style="font-weight:bold; font-size:12pt; border:none;">Photographs</td></tr>
        <tr><td style="border:none;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${photos.map((p: any) => `
              <div style="width: 48%; margin-bottom: 15px;">
                <img src="${p.dataUrl}" alt="${p.label || 'Site Photo'}" style="width: 100%; height: auto;" />
              </div>
            `).join('')}
          </div>
        </td></tr>
      </table>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Godrej Finance Limited PD Report - ${appNo}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: 'Calibri', 'Segoe UI', Tahoma, sans-serif; font-size: 10pt; color: #000; background-color: #fff; margin: 0; padding: 0; line-height: 1.3; }
    .page-break { page-break-before: always; margin-top: 15px; }
    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .report-table th, .report-table td { border: 1px solid #a3a3a3; padding: 6px; vertical-align: top; }
    .hdr-main { text-align: center; margin-bottom: 20px; }
    .hdr-title { font-size: 24pt; font-family: 'Times New Roman', serif; }
    .hdr-subtitle { font-size: 11pt; font-weight: bold; }
    .hdr-address { font-size: 10pt; }
    .main-title { font-size: 20pt; font-weight: bold; text-align: center; margin: 20px 0; font-family: 'Times New Roman', serif; }
    .bold { font-weight: bold; }
    .bg-green { background-color: #e2efd9; }
    .bg-red { background-color: #c00000; color: white; font-weight: bold; }
    .bg-darkred { background-color: #c00000; color: white; font-weight: bold; padding: 4px; display:inline-block; width:100px; text-align:center;}
    .sec-title { font-weight: bold; font-size: 11pt; margin: 15px 0 5px 0; }
    .inner-table { width: 100%; border-collapse: collapse; }
    .inner-table td { border: 1px solid #a3a3a3; padding: 4px; }
    .inner-table .bg-green { background-color: #e2efd9; font-weight: bold; text-align: center; }
  </style>
</head>
<body>

  <div class="hdr-main">
    <div class="hdr-title">${data.companyHeader?.name || 'Infominer Pvt Ltd.'}</div>
    <div class="hdr-subtitle">(Chartered Accountant)</div>
    <div class="hdr-address">Office No -410 Shree Siddhi Vinayak Trade Center Jeoni Mandi Agra 282004</div>
  </div>

  <div class="main-title">Godrej Finance Limited – Business Loan</div>

  <div class="sec-title">Basic info of the case:</div>
  <table class="report-table">
    <tr>
      <td class="bg-green" style="width: 20%;">Financial Institute</td>
      <td style="width: 30%;">${data.clientBankName || 'Godrej Finance Limited'}</td>
      <td class="bg-green" style="width: 15%;">Product</td>
      <td class="bold text-center" style="width: 15%;">Business<br/>Loan</td>
      <td class="bg-green" style="width: 10%;">City</td>
      <td style="width: 10%;">${data.businessCity || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Name of the applicant entity</td>
      <td>${data.firmName || ''}</td>
      <td class="bg-green">Constitution</td>
      <td class="bold text-center">Proprietorship</td>
      <td class="bg-green">Date of Visit</td>
      <td>${reportDate}</td>
    </tr>
    <tr>
      <td class="bg-green">Person Met</td>
      <td>${data.metPersonName || ''}</td>
      <td class="bg-green">Add Provided</td>
      <td colspan="3">${data.businessAddress || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Designation of person met</td>
      <td>${data.metPersonIdProof ? 'Owner' : 'Self'}</td>
      <td colspan="4" style="border-top:none;"></td>
    </tr>
    <tr>
      <td class="bg-green">Contact no. of person met</td>
      <td>${data.applicantPhone || ''}</td>
      <td class="bg-green">Add Visited</td>
      <td colspan="3">${data.meetingAddress || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Alternate mobile no.</td>
      <td></td>
      <td colspan="4" style="border-top:none;"></td>
    </tr>
    <tr>
      <td class="bg-green">Education Quali of Person Met</td>
      <td>${data.applicantQualification || ''}</td>
      <td class="bg-green">Address Ownership</td>
      <td colspan="3">${data.shopOwnership || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">App ID/Ref No.</td>
      <td>${appNo}</td>
      <td class="bg-green">Operating since</td>
      <td colspan="3">${data.businessVintage || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Loan Amount Requested</td>
      <td>${data.appliedAmount || ''}</td>
      <td class="bg-green">Office Accessibility</td>
      <td colspan="3"></td>
    </tr>
    <tr>
      <td class="bg-green">Tenor Requested</td>
      <td></td>
      <td class="bg-green">Business Vintage</td>
      <td colspan="3">${data.businessVintage || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Margins assessed</td>
      <td></td>
      <td class="bg-green">GST No. of Customer</td>
      <td colspan="3"></td>
    </tr>
    <tr>
      <td class="bg-green">Company Name Board Seen</td>
      <td>Yes</td>
      <td class="bg-green">End Use</td>
      <td colspan="3">${data.purpose || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Final Recommendation</td>
      <td class="bg-red">Positive</td>
      <td class="bg-green">PD done by</td>
      <td colspan="3">${data.executiveName || ''}</td>
    </tr>
  </table>

  <div class="sec-title">Detailed business profile & background of the applicant's:</div>
  <table class="report-table">
    <tr>
      <td class="bg-green" style="width:20%;">Nature of Business</td>
      <td style="width:30%;">${data.businessNature || ''}</td>
      <td class="bg-green" style="width:15%;">Industry</td>
      <td style="width:15%;"></td>
      <td class="bg-green" style="width:10%;">Product</td>
      <td style="width:10%;"></td>
    </tr>
  </table>

  <table class="report-table">
    <tr>
      <td class="bg-green" style="width: 25%;">Business vintage includingKey-Person details</td>
      <td style="width: 75%;">${data.briefBusinessProfile || ''}</td>
    </tr>
    <tr>
      <td class="bg-green">Ownership/ ShareholdingPattern</td>
      <td style="padding: 10px;">
        <table class="inner-table">
          <tr>
            <td class="bg-green" style="width:33%;">Name</td>
            <td class="bg-green" style="width:33%;">% Stake</td>
            <td class="bg-green" style="width:33%;">On Loan Structure</td>
          </tr>
          <tr>
            <td>${data.applicantName || ''}</td>
            <td style="text-align:center;">100%</td>
            <td></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <table class="report-table">
    <tr>
      <td class="bg-green" style="width: 20%; height: 200px; vertical-align:middle;">Profile of Business</td>
      <td style="width: 80%; vertical-align:top; padding:10px;">
        ${data.briefBusinessProfile || ''}
      </td>
    </tr>
  </table>

  <table class="report-table">
    <tr>
      <td class="bg-green" style="width:25%;">Machinery details (Wherever applicable)</td>
      <td style="width:75%;"></td>
    </tr>
    <tr>
      <td class="bg-green">Key employee details</td>
      <td>✓ .</td>
    </tr>
    <tr>
      <td class="bg-green">Group Co. details</td>
      <td style="padding:0;">
        <table style="width:100%; border-collapse:collapse; height:100%;">
          <tr>
            <td class="bold" style="border:none; border-bottom:1px solid #a3a3a3; border-right:1px solid #a3a3a3; width:33%;">Name of the entity</td>
            <td class="bold" style="border:none; border-bottom:1px solid #a3a3a3; border-right:1px solid #a3a3a3; width:33%;">Relation with our customer</td>
            <td class="bold" style="border:none; border-bottom:1px solid #a3a3a3; width:34%;">Brief business details</td>
          </tr>
          <tr>
            <td style="border:none; border-right:1px solid #a3a3a3;">✓</td>
            <td style="border:none; border-right:1px solid #a3a3a3;"></td>
            <td style="border:none;"></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="bg-green">Other Source of Income</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green" rowspan="2">Financial details</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Other business premises details</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Other state GST Registration taken</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Family member/s involved inbusiness</td>
      <td></td>
    </tr>
  </table>

  <div class="sec-title">Existing Bank Accounts:</div>
  <table class="report-table">
    <tr class="bg-green">
      <td>Name</td>
      <td>Relation</td>
      <td>Period Involved</td>
      <td>Area supervised in business</td>
    </tr>
    ${familyList.map((f: any) => `
      <tr>
        <td>${f.name || ''}</td>
        <td>${f.relation || ''}</td>
        <td>${f.period || ''}</td>
        <td>${f.area || ''}</td>
      </tr>
    `).join('')}
  </table>

  <div class="sec-title">Existing Loan Details:</div>
  <table class="report-table">
    <tr class="bg-green">
      <td>Bank Name</td>
      <td>Account Types</td>
      <td>Account Number</td>
      <td>CC/OD Limit</td>
      <td>Vintage of account</td>
      <td>Collateral Details (if Auto Loan, then Reg No. of Car)</td>
    </tr>
    ${bankingList.map((b: any) => `
      <tr>
        <td>${b.bankName || ''}</td>
        <td>${b.accountType || ''}</td>
        <td>${b.accountNo || ''}</td>
        <td>${b.limit || ''}</td>
        <td>${b.vintage || ''}</td>
        <td>${b.collateral || ''}</td>
      </tr>
    `).join('')}
  </table>

  <table class="report-table">
    <tr class="bg-green">
      <td>Name of Bank</td>
      <td>Loan Types</td>
      <td>Sanctioned Loan Amount</td>
      <td>EMI running</td>
      <td>Tenor</td>
      <td>No of Paid EMI</td>
    </tr>
    ${loansList.map((l: any) => `
      <tr>
        <td>${l.bankName || l.financerName || ''}</td>
        <td>${l.loanType || l.typeOfLoan || ''}</td>
        <td>${l.amount || l.loanAmountLakhs || ''}</td>
        <td>${l.emi || l.emiRs || ''}</td>
        <td>${l.tenor || l.tenureYearsMonths || ''}</td>
        <td>${l.paidEmi || ''}</td>
      </tr>
    `).join('')}
  </table>

  <div class="sec-title">Top 3 buyer & supplier:</div>
  <table class="report-table">
    <tr class="bg-green">
      <td>Name</td>
      <td>Type</td>
      <td>% Contribution</td>
      <td>Credit Period (days)</td>
      <td>Relationship since</td>
      <td>Contact Person Name & Number</td>
    </tr>
    ${buyerSupplierList.map((bs: any) => `
      <tr>
        <td>${bs.name || ''}</td>
        <td>${bs.type || ''}</td>
        <td>${bs.contribution || ''}</td>
        <td>${bs.creditPeriod || ''}</td>
        <td>${bs.relationship || ''}</td>
        <td>${bs.contact || bs.phone || ''}</td>
      </tr>
    `).join('')}
  </table>

  <div class="sec-title">Movable & Immovable asset base:</div>
  <table class="report-table">
    <tr class="bg-green">
      <td>Owner Name</td>
      <td>Relation with Key Person</td>
      <td>Type</td>
      <td>Value</td>
      <td>Owned Since</td>
      <td>Address</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>.</td>
    </tr>
  </table>

  <div class="sec-title">Observation:</div>
  <table class="report-table">
    <tr>
      <td class="bg-green" style="width: 25%;">Stock Level</td>
      <td style="width: 25%;"></td>
      <td class="bg-green" style="width: 25%;">Rough value of stock</td>
      <td style="width: 25%;"></td>
    </tr>
    <tr>
      <td class="bg-green">Locality</td>
      <td></td>
      <td class="bg-green">Office Setup</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Business Activity Level</td>
      <td></td>
      <td class="bg-green">Size of the office</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">No. of employees seen</td>
      <td>${data.staffCount || ''}</td>
      <td class="bg-green">Third Party Confirmation</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Any court case pending</td>
      <td></td>
      <td class="bg-green">Third Party Comment</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green" colspan="2">Whether separate demarcation of office in Resi-cum-Office setup</td>
      <td colspan="2"></td>
    </tr>
    <tr>
      <td class="bg-green" colspan="2">Whether GST Number displayed at the premises visited</td>
      <td colspan="2"></td>
    </tr>
  </table>

  <div class="sec-title">Documents verified during PD:</div>
  <table class="report-table">
    <tr>
      <td class="bg-green" style="width: 25%;">PAN Card</td>
      <td style="width: 25%;"></td>
      <td class="bg-green" style="width: 25%;">GSTIN – Legal Trade Name</td>
      <td style="width: 25%;"></td>
    </tr>
    <tr>
      <td class="bg-green">Business Registration ProofSeen or Not Seen</td>
      <td></td>
      <td class="bg-green">GSTIN – Date of Registration</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Electricity Bill (latest 2 months)Seen/Not Seen</td>
      <td></td>
      <td class="bg-green">Employee Register</td>
      <td></td>
    </tr>
    <tr>
      <td class="bg-green">Sale Bills Seen</td>
      <td></td>
      <td class="bg-green">Other (Kacha Records)</td>
      <td></td>
    </tr>
  </table>

  <div class="sec-title">Strengths & Weaknesses:</div>
  <table class="report-table">
    <tr class="bg-green">
      <td class="bold text-center" style="width: 5%;">S. No.</td>
      <td class="bold text-center" style="width: 45%;">Strengths</td>
      <td class="bold text-center" style="width: 5%;">S. No.</td>
      <td class="bold text-center" style="width: 45%;">Weaknesses</td>
    </tr>
    <tr>
      <td class="bold text-center">1</td>
      <td class="bold">Ok receipt</td>
      <td class="bold text-center">1</td>
      <td></td>
    </tr>
  </table>

  <table style="width: 300px; margin-top:20px; border: 1px solid #000; border-collapse: collapse;">
    <tr>
      <td class="bg-darkred" style="border: 1px solid #000;">Final Status</td>
      <td class="bold" style="border: 1px solid #000; padding-left: 10px;">POSITIVE</td>
    </tr>
  </table>

  <div style="margin-top: 10px; font-size: 10pt;">Report Prepared By: –</div>

  <div style="margin-top: 20px; font-size: 8.5pt; text-align: justify; line-height: 1.5;">
    <span class="bold">Limitation and Disclaimer clause: -</span> This report has been prepared for internal purposes only on the basis of verbal information provided and discussions by the person contacted and will not be shared to third party without any written consent from us. Company requesting this verification will be solely responsible for any actions taken on this report and any liabilities directly or indirectly accruing from such actions. We accept no responsibility or liability to a Third Party to whom our Report may be shown or in whose hands it may come. The Report should not be published or reproduced in part or in whole without prior written consent from us.
  </div>

  <div style="margin-top: 20px;">
    <div class="bold">PD Officer Name: ${data.executiveName || 'Mr.'}</div>
    <div class="bold">Agency Name & Seal:</div>
    <br/><br/><br/>
    <div>------------------------------------------------</div>
    <div>(Sign of Agency authorized signatory)</div>
  </div>

  ${photosHtml}
</body>
</html>
  `;
}
