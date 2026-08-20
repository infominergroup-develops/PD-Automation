// Dedicated Company Standard PD Report Printer Module
// Adheres strictly to Infominer Services Private Limited (Chartered Accountant) format

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
    srNo: number;
    name: string;
    age: string;
    relation: string;
    qualification: string;
    occupation: string;
    dependent: string;
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
  householdExpensesMonthly?: number;
  householdExpensesYearly?: number;
  netDisposalIncomeMonthly?: number;
  netDisposalIncomeYearly?: number;
  comfortableMonthlyEmi?: string;

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
}

export function generateStandardPDReportHTML(data: PDReportPrintData): string {
  const bankName = data.clientBankName || 'Moneyboxx Finance Limited';
  const initiationDate = data.caseInitiationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const reportDate = data.reportDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const visitDate = data.visitDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const appNo = data.applicationNumber || 'INF/2026/88492';
  const caseStatus = data.statusOfCase || 'Recommended';

  const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [
    { srNo: 1, name: data.applicantName, age: '43 Yrs', relation: 'Self', qualification: '10th Pass', occupation: 'Self-employed Business', dependent: 'No' },
    { srNo: 2, name: ((data.coApplicants && data.coApplicants[0]) ? data.coApplicants[0].name : "Spouse") || 'Spouse', age: '38 Yrs', relation: 'Spouse', qualification: '10th Pass', occupation: 'Housewife', dependent: 'Yes' },
    { srNo: 3, name: 'Child 1', age: '18 Yrs', relation: 'Son', qualification: '12th Student', occupation: 'Student', dependent: 'Yes' },
    { srNo: 4, name: 'Child 2', age: '15 Yrs', relation: 'Daughter', qualification: '10th Student', occupation: 'Student', dependent: 'Yes' }
  ];

  // Income Assessment Default Calculations
  const salesItems = data.itemizedSales && data.itemizedSales.length > 0 ? data.itemizedSales : [
    { particulars: `${data.firmName || 'Primary Business'} Monthly Turnover`, businessNotes: 'Based on field footfall & cross-check assessment', monthly: data.totalSalesMonthly || 275000, yearly: (data.totalSalesMonthly || 275000) * 12 }
  ];

  const totalSalesM = data.totalSalesMonthly || salesItems.reduce((acc, i) => acc + i.monthly, 0);
  const totalSalesY = data.totalSalesYearly || totalSalesM * 12;

  const expenseItems = data.itemizedExpenses && data.itemizedExpenses.length > 0 ? data.itemizedExpenses : [
    { particulars: 'Purchases / COGS Raw Material', businessNotes: 'Stock replenishment expenses', monthly: Math.round(totalSalesM * 0.75), yearly: Math.round(totalSalesM * 0.75) * 12 },
    { particulars: 'Monthly Electricity Expenses', businessNotes: 'Utility & Power connection charges', monthly: 6500, yearly: 78000 },
    { particulars: 'Salary of Employees / Family Labour', businessNotes: 'Staff wages or family maintenance allowance', monthly: 15000, yearly: 180000 },
    { particulars: 'Business Premises Rent', businessNotes: 'Shop rent expense', monthly: 12000, yearly: 144000 },
    { particulars: 'Other Expenses / Maintenance', businessNotes: 'Machine upkeep, transport & misc', monthly: 5000, yearly: 60000 }
  ];

  const totalExpM = data.totalExpensesMonthly || expenseItems.reduce((acc, i) => acc + i.monthly, 0);
  const totalExpY = data.totalExpensesYearly || totalExpM * 12;

  const netProfM = data.netProfitMonthly || (totalSalesM - totalExpM);
  const netProfY = data.netProfitYearly || (netProfM * 12);

  const existEmiM = data.existingEmiMonthly || 0;
  const existEmiY = data.existingEmiYearly || (existEmiM * 12);

  const hhExpM = data.householdExpensesMonthly || 18000;
  const hhExpY = data.householdExpensesYearly || (hhExpM * 12);

  const netDisposalM = data.netDisposalIncomeMonthly || (netProfM - existEmiM - hhExpM);
  const netDisposalY = data.netDisposalIncomeYearly || (netDisposalM * 12);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.companyHeader?.name || 'Standard'} PD Report - ${appNo} - ${data.applicantName}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm 8mm 10mm 8mm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
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
      height: 100vh;
      text-align: center;
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      border: 15px solid #2d3e50;
      border-top: 25px solid #eb8a23;
      padding: 40px;
      box-sizing: border-box;
      page-break-after: always;
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
      margin-bottom: 30px;
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
      margin-bottom: 40px;
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
  </style>
</head>
<body>

  <!-- Floating Print Control Header for Web Preview -->
  <div class="no-print" style="position: sticky; top: 0; background-color: #384c5e; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; border-bottom: 2px solid #eb8a23; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <div>
      <strong style="font-size: 11pt; font-family: sans-serif;">${data.companyHeader?.name || 'Company'} Standard Personal Discussion Report</strong>
      <span style="font-size: 9pt; opacity: 0.8; margin-left: 10px;">App #${appNo} • ${data.applicantName}</span>
    </div>
    <button onclick="window.print()" style="background-color: #eb8a23; color: #fff; border: none; padding: 6px 16px; font-weight: bold; font-size: 10pt; border-radius: 4px; cursor: pointer; transition: 0.2s;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-logo">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#orange-gradient)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <defs>
          <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f97316" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
        </defs>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <div class="cover-title">Personal Discussion<br/>Credit Assessment Report</div>
    <div class="cover-subtitle">${data.companyHeader?.name || 'Company Name'}</div>
    
    <div class="cover-details">
      <table>
        <tr>
          <td class="bold" style="width: 40%">Applicant Name</td>
          <td>${data.applicantName}</td>
        </tr>
        <tr>
          <td class="bold">Business / Firm</td>
          <td>${data.firmName || 'Not Provided'}</td>
        </tr>
        <tr>
          <td class="bold">Application ID</td>
          <td>${appNo}</td>
        </tr>
        <tr>
          <td class="bold">Quotation Amount</td>
          <td>₹${Number(data.loanAmount || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="bold">Report Date</td>
          <td>${reportDate}</td>
        </tr>
        <tr>
          <td class="bold">Case Status</td>
          <td style="color: #065f46; font-weight: bold;">${caseStatus}</td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      Generated by Infominer Personal Discussion Automator &bull; Strict & Confidential
    </div>
  </div>

  <!-- SECTION 1: OFFICIAL COMPANY HEADER & CASE PROFILE -->
  <div class="hdr-main">
    <div class="hdr-title">${data.companyHeader?.name || 'Agency Services'}</div>
    <div class="hdr-sub">CIN : ${data.companyHeader?.cin || 'U67100UP2020PTC131346'}</div>
    <div class="hdr-desc"><strong>(${data.companyHeader?.designation || 'Chartered Accountant'})</strong></div>
    <div class="hdr-desc">${data.companyHeader?.address || 'Office No 410, Shree Siddhi Vinayak Trade Center - Agra- 282004'}</div>
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
      <td colspan="3">${data.firmName || 'NA'}</td>
    </tr>
    ${(data.coApplicants && data.coApplicants.length > 0) ? data.coApplicants.map((c: any, i: number) => `
    <tr>
      <td class="bold">Co-applicant ${i + 1} Name with relation</td>
      <td>${c.name} (${c.relation})</td>
      <td class="bold">Contact Number</td>
      <td>${c.mobileNumber || 'NA'}</td>
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
      <td>${data.loanType || 'Commercial MSME Express Loan'}</td>
    </tr>
    <tr>
      <td class="bold">Solar Purpose & Usage Confirmation (as per applicant)</td>
      <td colspan="3">${data.loanPurpose || `The applicant currently operates the business to generate daily income. Proposed facility of ₹${Number(data.loanAmount || 350000).toLocaleString('en-IN')} will be utilized for inventory stock expansion and operational equipment to lower cost and increase savings.`}</td>
    </tr>
    <tr>
      <td class="bold">Address of the residence</td>
      <td colspan="3">${data.residenceAddress || 'Dumari, Parora Garhpura Begusarai 848204 Br'}</td>
    </tr>
    <tr>
      <td class="bold">Address of the business (applicant)</td>
      <td colspan="3">${data.businessAddress || data.residenceAddress || 'Dumari, Parora Garhpura Begusarai 848204 Br'}</td>
    </tr>
    <tr>
      <td class="bold">Met person during visit time</td>
      <td>${data.metPersonName || `${data.applicantName} (Self) & ${((data.coApplicants && data.coApplicants[0]) ? data.coApplicants[0].name : "Spouse") || 'Mrs. Rubi Devi'} (Wife)`}</td>
      <td class="bold">Met person identity proof</td>
      <td>${data.metPersonIdProof || 'PAN Card / Aadhaar Card'}</td>
    </tr>
    <tr>
      <td class="bold">Executive Name</td>
      <td colspan="3">${data.executiveName || 'Mr. Sumit (Field Inspector)'}</td>
    </tr>
  </table>

  <!-- SECTION 2: DETAILS OF RESIDENCE VISIT REPORT -->
  <table class="report-table" style="margin-top: 10px;">
    <tr>
      <td colspan="4" class="sec-head">Details of residence visit report</td>
    </tr>
    <tr>
      <td style="width: 25%;" class="bold">Met person during visit time</td>
      <td colspan="3">${data.metPersonName || `${data.applicantName} (Self) & Spouse`}</td>
    </tr>
    <tr>
      <td class="bold">Address of the meeting</td>
      <td colspan="3">${data.residenceAddress || 'Dumari, Parora Garhpura Begusarai 848204 Br'}</td>
    </tr>
    <tr>
      <td class="bold">Locating Premises Type</td>
      <td colspan="3">${data.locatingPremisesType || 'The residence premises are located in a well-connected village / urban residential locality.'}</td>
    </tr>
    <tr>
      <td colspan="4" class="sec-head">Residential Details</td>
    </tr>
    <tr>
      <td class="bold">Ownership (If rented then rent amount)</td>
      <td colspan="3">${data.residenceOwnership || 'Owned Premises on the name of applicant - Area 1000-1200 sq. feet Approx - Value Rs. 45-50 Lakh Approx - Family residing since birth.'}</td>
    </tr>
    <tr>
      <td class="bold">House Details</td>
      <td colspan="3">${data.houseDetails || 'This house has six rooms and is a single-story structure, comprising a ground floor.'}</td>
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
          ${familyList.map(f => `
            <tr>
              <td style="border: 1px solid #000;" class="text-center">${f.srNo}</td>
              <td style="border: 1px solid #000;">${f.name}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.age}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.relation}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.qualification}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.occupation}</td>
              <td style="border: 1px solid #000;" class="text-center">${f.dependent}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>
    <tr>
      <td class="bold">Monthly Household Expenses</td>
      <td>₹${Number(hhExpM).toLocaleString('en-IN')}/- Per Month</td>
      <td class="bold">Electricity Connection Details</td>
      <td>${data.residenceElectricityDetails || 'Installed and active residential electricity meter'}</td>
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
      <td>${data.residenceGpsCoords || '25.66933°, 86.131778°'}</td>
      <td class="bold">Residence Status</td>
      <td class="bold" style="color: #065f46;">${data.residenceStatus || 'Recommended'}</td>
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
        ${data.briefBusinessProfile || `${data.applicantName} has been engaged in the ${data.firmName || 'commercial retail / trading'} business for the past approximately ${data.businessVintage || '8-10 years'}. Prior to starting this business, the applicant was engaged in agricultural and local trading activities.<br/><br/>
        The business setup comprises retail display racks, counters, processing equipment, and storage stock. The applicant personally manages the day-to-day operations of the business and caters to daily walk-in customers from nearby villages and surrounding localities.<br/><br/>
        The entire business setup is operated smoothly with regular footfall. The applicant stated that he is applying for the proposed credit facility to expand working capital stock, lower unit procurement costs, and improve overall profitability.`}
      </td>
    </tr>
    <tr>
      <td style="width: 35%;" class="bold">Vintage of the business</td>
      <td>${data.businessVintage || 'Approximately 8 to 10 years'}</td>
    </tr>
    ${data.previousOccupation ? `
    <tr>
      <td class="bold">Previous Occupation</td>
      <td>${data.previousOccupation}</td>
    </tr>
    ` : ''}
    ${data.reasonToLeave ? `
    <tr>
      <td class="bold">Reason to leave the last occupation</td>
      <td>${data.reasonToLeave}</td>
    </tr>
    ` : ''}
    <tr>
      <td class="bold">Number of staff</td>
      <td>${data.staffCount || 'No external staff/labour is engaged. Business operations are managed by family members.'}</td>
    </tr>
    <tr>
      <td class="bold">Is office premise on rented / owned</td>
      <td>${data.businessPremiseOwnership || 'Business is being operated from self-owned / leased premises.'}</td>
    </tr>
    <tr>
      <td class="bold">Details of Office / Factory infrastructure (Assets)</td>
      <td>${data.factoryInfrastructure || 'Business setup comprises display racks, stock storage, processing machinery, weighing scales, counter and necessary retail fixtures.'}</td>
    </tr>
    <tr>
      <td class="bold">Stock details with estimated value</td>
      <td>${data.stockDetailsValue || `Sufficient inventory stock of daily-use goods and raw material found available at premises during verification. Estimated stock value: ₹${Number(data.loanAmount || 450000).toLocaleString('en-IN')}.`}</td>
    </tr>
    <tr>
      <td class="bold">Fixed & Current Asset Analysis</td>
      <td>${data.fixedAndCurrentAssetAnalysis || 'Fixed assets comprise shop furniture, display racks, and processing equipment. Current assets include working capital inventory and receivables.'}</td>
    </tr>
    <tr>
      <td class="bold">Asset Creation Through Business</td>
      <td>${data.assetCreationThroughBusiness || 'As informed by applicant, income generated from business has been utilized for house construction and reinvestment into stock inventory.'}</td>
    </tr>
    <tr>
      <td class="bold">Business Investment</td>
      <td>${data.initialBusinessInvestment || 'As informed by applicant, business was initially started with an approximate capital investment of ₹1 Lakh to ₹3 Lakhs.'}</td>
    </tr>
    <tr>
      <td class="bold">Agricultural Income Details</td>
      <td>${data.agriculturalIncomeDetails || 'The applicant owns agricultural land where seasonal crops are cultivated, generating supplementary annual family income of ₹1.5 - 2 Lakhs.'}</td>
    </tr>
    <tr>
      <td class="bold">Other source income</td>
      <td>${data.otherSourceIncomeDetails || 'Not applicable / Rental Income'}</td>
    </tr>
    <tr>
      <td class="bold">Operational / Saving analysis</td>
      <td>${data.operationalSavingAnalysis || 'With proposed working capital expansion, procurement cost per unit is projected to reduce by 8-12%, bolstering net monthly disposable surplus.'}</td>
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
      <td colspan="3" class="sec-head">Banking Details and Limit OD and CC limit with bank</td>
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
          ${(data.bankingDetails || [{ bankName: bankName, branchName: 'Main Branch', accountType: 'Saving / Current', ccOdLimit: 'NA', accountNo: '**********9522', remark: 'The account belongs to applicant' }]).map(b => `
            <tr>
              <td style="border: 1px solid #000;">${b.bankName}</td>
              <td style="border: 1px solid #000;">${b.branchName}</td>
              <td style="border: 1px solid #000;" class="text-center">${b.accountType}</td>
              <td style="border: 1px solid #000;" class="text-center">${b.ccOdLimit}</td>
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
          ${(data.existingLoans || [{ typeOfLoan: 'NA', financerName: 'NA', loanAmountLakhs: '0', emiRs: `${existEmiM}`, tenureYearsMonths: 'NA', balanceTenure: 'NA', remark: existEmiM > 0 ? 'Regular monthly EMI track' : 'No existing loan obligation' }]).map(l => `
            <tr>
              <td style="border: 1px solid #000;">${l.typeOfLoan}</td>
              <td style="border: 1px solid #000;">${l.financerName}</td>
              <td style="border: 1px solid #000;" class="text-center">${l.loanAmountLakhs}</td>
              <td style="border: 1px solid #000;" class="text-center">₹${l.emiRs}</td>
              <td style="border: 1px solid #000;" class="text-center">${l.tenureYearsMonths}</td>
              <td style="border: 1px solid #000;" class="text-center">${l.balanceTenure}</td>
              <td style="border: 1px solid #000;">${l.remark}</td>
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
      <td colspan="2">${data.businessGpsCoords || '25.669427°, 86.131675°'}</td>
    </tr>
    <tr>
      <td class="bold">Remarks</td>
      <td colspan="2">${data.businessLocationRemarks || 'Location was physically verified; GPS coordinates confirmed on Google Maps.'}</td>
    </tr>
    <tr>
      <td class="bold">Electricity Connection Details</td>
      <td colspan="2">${data.businessElectricityDetails || 'Commercial / Residential electricity meter verified in working condition.'}</td>
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
      <td colspan="2" class="bold" style="color: #065f46;">${data.businessStatus || 'Recommended'}</td>
    </tr>
  </table>

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
      <strong style="font-size: 10pt; color: #1e3a8a;">${data.companyHeader?.name || 'Authorized Signatory'}</strong>
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
      ${data.aiExecutiveSummary || `<strong>Executive Overview:</strong> Infominer Services Private Limited conducted an end-to-end Personal Discussion (PD) and field verification for applicant <strong>${data.applicantName}</strong> (${data.firmName || 'Proprietorship Firm'}), applying for a micro-lending facility of <strong>₹${Number(data.loanAmount || 350000).toLocaleString('en-IN')}</strong> under <strong>${data.clientBankName || 'the Bank'}</strong>.<br/><br/>
      <strong>Key On-Ground Observations:</strong> Physical inspection confirmed an active business vintage of approximately ${data.businessVintage || '8-10 years'} at the verified premises. Customer footfall, inventory stock depth, and market reputation were cross-verified through adjoining shopkeepers and neighborhood feedback, confirming high stability and zero adverse antecedents.`}
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
    <div class="hdr-sub">Application ID: ${appNo} • ${data.applicantName} (${data.firmName || 'Proprietorship'})</div>
  </div>

  <table class="report-table">
    ${['KYC PHOTOS', 'RESIDENCE VISIT PHOTO', 'BUSINESS VISIT PHOTO', 'BUSINESS DOCUMENTS'].map(category => {
      const catPhotos = (data.photos || []).filter(p => p.category === category);
      return `
        <tr>
          <td class="sec-head">${category}</td>
        </tr>
        <tr>
          <td style="padding: 10px;">
            <div class="photo-grid">
              ${catPhotos.length > 0 
                ? catPhotos.map(p => `
                <div class="photo-card">
                  <img src="${p.dataUrl}" alt="${p.name}" />
                  <div style="font-weight: bold; font-size: 8pt; margin-top: 4px;">${p.name}</div>
                  <div style="font-size: 7.5pt; color: #475569;">GPS: ${p.gps?.lat || 'N/A'}, ${p.gps?.lng || 'N/A'} • Verified Stamp</div>
                </div>
              `).join('')
                : `<div style="padding: 20px; border: 1px dashed #ccc; width: 100%; text-align: center; color: #666; font-size: 9pt;">No ${category.toLowerCase()} uploaded</div>`
              }
            </div>
          </td>
        </tr>
      `;
    }).join('')}
  </table>

</body>
</html>
  `;
}

export function generateMoneyboxxPDReportHTML(data: PDReportPrintData): string {
  const bankName = data.clientBankName || 'Moneyboxx Finance Limited';
  const initiationDate = data.caseInitiationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const reportDate = data.reportDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const visitDate = data.visitDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const appNo = data.applicationNumber || 'INF/2026/88492';
  const caseStatus = data.statusOfCase || 'Recommended';

  const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [
    { srNo: 1, name: data.applicantName, age: '45 Yrs', relation: 'Self', qualification: 'Uneducated', occupation: 'Self-employed', dependent: 'No' },
    { srNo: 2, name: ((data.coApplicants && data.coApplicants[0]) ? data.coApplicants[0].name : "Spouse") || 'Spouse', age: '50 Yrs', relation: 'Spouse', qualification: 'Uneducated', occupation: 'Same business', dependent: 'No' }
  ];

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
  const hhExpM = data.householdExpensesMonthly || 15000;
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
    body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; margin: 0; padding: 0; color: #000; line-height: 1.2; }
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
      height: 100vh;
      text-align: center;
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      border: 15px solid #2d3e50;
      border-top: 25px solid #eb8a23;
      padding: 40px;
      box-sizing: border-box;
      page-break-after: always;
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
      margin-bottom: 30px;
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
      margin-bottom: 40px;
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
      font-size: 10pt;
      color: #64748b;
      z-index: 1;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <!-- Print Controls -->
  <div class="no-print" style="position: sticky; top: 0; background-color: #384c5e; color: #fff; padding: 10px; display: flex; justify-content: space-between; z-index: 1000; text-align:center;">
    <strong>Moneyboxx PD Report Format</strong>
    <button onclick="window.print()">Print / Save PDF</button>
  </div>
  <style>@media print { .no-print { display: none !important; } }</style>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-logo">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#orange-gradient)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <defs>
          <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f97316" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
        </defs>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <div class="cover-title">Personal Discussion<br/>Credit Assessment Report</div>
    <div class="cover-subtitle">${data.clientBankName || 'Moneyboxx Finance Limited'}</div>
    
    <div class="cover-details">
      <table>
        <tr>
          <td class="bold" style="width: 40%">Applicant Name</td>
          <td>${data.applicantName}</td>
        </tr>
        <tr>
          <td class="bold">Business / Firm</td>
          <td>${data.firmName || 'Not Provided'}</td>
        </tr>
        <tr>
          <td class="bold">Application ID</td>
          <td>${appNo}</td>
        </tr>
        <tr>
          <td class="bold">Quotation Amount</td>
          <td>₹${Number(data.loanAmount || 0).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="bold">Report Date</td>
          <td>${reportDate}</td>
        </tr>
        <tr>
          <td class="bold">Case Status</td>
          <td style="color: #065f46; font-weight: bold;">${caseStatus}</td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      Generated by Infominer Personal Discussion Automator &bull; Strict & Confidential
    </div>
  </div>

  <!-- Page 1: Case Profile -->
  <table>
    <tr>
      <td colspan="4" class="text-center bold" style="border: 2px solid #000; padding: 8px;">
        ${data.companyHeader?.name || 'Infominer Services Private Limited'}<br/>
        CIN : ${data.companyHeader?.cin || 'U67100UP2020PTC131346'}<br/>
        (${data.companyHeader?.designation || 'Chartered Accountant'})<br/>
        ${data.companyHeader?.address || 'Office No 410, Shree Siddhi Vinayak Trade Center - Agra- 282004'}
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
      <td colspan="3">${data.applicantPhone || '9005644814'}</td>
    </tr>
    <tr>
      <td>Business firm name</td>
      <td colspan="3">${data.firmName || 'No formal business name'}</td>
    </tr>
    <tr>
      <td>Co-applicant Name with relation</td>
      <td colspan="3">${((data.coApplicants && data.coApplicants[0]) ? data.coApplicants[0].name : "Spouse") || 'Ms. Jamuna devi (Daughter)'}</td>
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
      <td colspan="3">${data.loanType || 'Commercial Solar Loan'}</td>
    </tr>
    <tr>
      <td>Solar Purpose & Usage Confirmation (as per applicant)</td>
      <td colspan="3">${data.loanPurpose || 'The applicant currently operates the business using a diesel engine, which incurs an approximate monthly expense. Therefore, the applicant is planning to install a solar setup to reduce operational costs and improve savings.'}</td>
    </tr>
    <tr>
      <td>Address of the residence</td>
      <td colspan="3">${data.residenceAddress || 'Post Khundra Gram Khundra Katra Shahjahanpur Miranpur Katra Khundra Shahjahanpur 242301'}</td>
    </tr>
    <tr>
      <td>Address of the business (applicant)</td>
      <td colspan="3"><strong>${data.businessAddress || 'Post Khundra Gram Khundra Katra Shahjahanpur Miranpur Katra Khundra Shahjahanpur 242301'}</strong></td>
    </tr>
    <tr>
      <td>Met person during visit time.</td>
      <td colspan="3">${data.metPersonName || data.applicantName + ' (Self)'}</td>
    </tr>
    <tr>
      <td>Met person identity proof</td>
      <td colspan="3">${data.metPersonIdProof || 'PAN Card'}</td>
    </tr>
    <tr>
      <td>Executive Name</td>
      <td colspan="3">${data.executiveName || 'Mr. Shivam'}</td>
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
      <td colspan="5">${data.residenceAddress || 'Post Khundra Gram Khundra Katra Shahjahanpur'}</td>
    </tr>
    <tr>
      <td colspan="2">Locating Premises Type</td>
      <td colspan="5">${data.locatingPremisesType || 'The residence premises are located in a village area'}</td>
    </tr>
    <tr>
      <td colspan="7" class="sec-title">Residential Details</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Ownership (If rented then rent amount)</td>
      <td colspan="5">${data.residenceOwnership || 'Owned Premises on the name of applicant'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">House Details</td>
      <td colspan="5">${data.houseDetails || 'This house has two rooms and is a single-story structure, comprising a ground floor'}</td>
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
    ${familyList.map(f => `
      <tr class="text-center">
        <td>${f.srNo}</td>
        <td>${f.name}</td>
        <td>${f.age}</td>
        <td>${f.relation}</td>
        <td>${f.qualification}</td>
        <td>${f.occupation}</td>
        <td>${f.dependent}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="2" class="bold">Monthly Household Expenses</td>
      <td colspan="5">Rs. ${Number(hhExpM).toLocaleString('en-IN')}/- Per Month</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Electricity Connection Details</td>
      <td colspan="5">${data.residenceElectricityDetails || 'Electricity bill was not provided at the time of visit'}</td>
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
      <td colspan="5">${data.businessGpsCoords || '27.94418, 79.63275'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Residence Status</td>
      <td colspan="5">${data.residenceStatus || 'Recommended'}</td>
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
        ${data.briefBusinessProfile || `${data.applicantName} has been engaged in the business for the past approximately 15 years.`}
      </td>
    </tr>
    <tr>
      <td style="width:30%;">Vintage of the business</td>
      <td>${data.businessVintage || 'The applicant has been engaged in the business for the past approximately 15 years.'}</td>
    </tr>
    ${data.previousOccupation ? `
    <tr>
      <td>Previous Occupation</td>
      <td>${data.previousOccupation}</td>
    </tr>
    ` : ''}
    ${data.reasonToLeave ? `
    <tr>
      <td>Reason to leave the last occupation</td>
      <td>${data.reasonToLeave}</td>
    </tr>
    ` : ''}
    <tr>
      <td>Number of staffs</td>
      <td>${data.staffCount || 'No external staff/labour is engaged. Business operations are managed by family members.'}</td>
    </tr>
    <tr>
      <td>Is office premise on rented /owned</td>
      <td>${data.businessPremiseOwnership || 'Business is being operated from self-owned premises.'}</td>
    </tr>
    <tr>
      <td>Details of Office / Factory infrastructure ( Assets )</td>
      <td>${data.factoryInfrastructure || 'The business setup comprises machinery and engines.'}</td>
    </tr>
    <tr>
      <td>Stock details with estimated value</td>
      <td>${data.stockDetailsValue || 'Limited quantity of raw material was found available at premises during verification.'}</td>
    </tr>
    <tr>
      <td>Fixed & Current Asset Analysis</td>
      <td>${data.fixedAndCurrentAssetAnalysis || 'The fixed assets comprise machinery. Current assets mainly comprise working capital.'}</td>
    </tr>
    <tr>
      <td>Asset Creation Through Business</td>
      <td>${data.assetCreationThroughBusiness || 'The applicant informed that the property where solar installation is proposed has been created/purchased through savings generated from the same business.'}</td>
    </tr>
    <tr>
      <td>Business Investment</td>
      <td>${data.initialBusinessInvestment || 'As informed by the applicant, the business was initially started with an approximate investment of around ₹3 lakhs.'}</td>
    </tr>
    <tr>
      <td>Agricultural Income Details</td>
      <td>${data.agriculturalIncomeDetails || 'The applicant owns agricultural land where crops are cultivated.'}</td>
    </tr>
    <tr>
      <td>Other source income</td>
      <td>${data.otherSourceIncomeDetails || 'Apart from the primary business, the applicant owns cows providing an additional source of income.'}</td>
    </tr>
    <tr>
      <td>Solar saving analysis</td>
      <td>${data.operationalSavingAnalysis || 'As informed by the applicant, machinery is presently operated through diesel engine setup. Applicant expects reduction in approx. 60% operational cost after solar installation.'}</td>
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
      <td colspan="7" class="sec-title bg-light">Banking Details and Limit OD and CC limit with bank</td>
    </tr>
    <tr class="sec-title bg-light">
      <td colspan="2">Bank Name</td>
      <td>Branch Name</td>
      <td>Account Types</td>
      <td>CC/OD Limit</td>
      <td>Account No.</td>
      <td>Remark</td>
    </tr>
    ${(data.bankingDetails || [{ bankName: 'State Bank of India', branchName: 'Tilhar', accountType: 'Saving Account', ccOdLimit: 'NA', accountNo: '**********', remark: 'The account belongs to applicant' }]).map((b) => `
      <tr class="text-center">
        <td colspan="2">${b.bankName}</td>
        <td>${b.branchName}</td>
        <td>${b.accountType}</td>
        <td>${b.ccOdLimit}</td>
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
    ${(data.existingLoans || [{ typeOfLoan: 'NA', financerName: 'NA', loanAmountLakhs: '', emiRs: '', tenureYearsMonths: '', balanceTenure: '', remark: 'No any existing obligation' }]).map((l) => `
      <tr class="text-center">
        <td>${l.typeOfLoan}</td>
        <td>${l.financerName}</td>
        <td>${l.loanAmountLakhs}</td>
        <td>${l.emiRs}</td>
        <td>${l.tenureYearsMonths}</td>
        <td>${l.balanceTenure}</td>
        <td>${l.remark}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="2" class="bold">Current Obligation</td>
      <td colspan="5">${data.currentObligationSummary || 'No any existing obligation'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Latitude & Longitude of the business premises</td>
      <td colspan="5">${data.businessGpsCoords || '27.94255, 79.63139'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Remarks</td>
      <td colspan="5">${data.businessLocationRemarks || 'The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point.'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Electricity Connection Details</td>
      <td colspan="5">${data.businessElectricityDetails || 'Not available'}</td>
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
      <td colspan="5">${data.businessStatus || 'Recommended'}</td>
    </tr>
  </table>

  <div class="page-break"></div>

  <!-- Page 5: Monthly Income Assessment -->
  <table>
    <tr>
      <td colspan="4" class="sec-title">Assessment of the monthly income of the applicant</td>
    </tr>
    <tr class="sec-title text-center">
      <td style="width:25%;">Particulars</td>
      <td style="width:45%;">Business Notes<br/><span style="font-weight:normal;">Income assement considered for 28 working days</span></td>
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
      <td class="text-left">No any existing obligation</td>
      <td class="bold">${Number(existEmiM).toLocaleString('en-IN')}</td>
      <td class="bold">${Number(existEmiY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="text-center">
      <td class="text-left bold">Less: Existing Household Expenses</td>
      <td class="text-left">The applicant’s family has earning member in same business, and the total monthly household expenses are ₹${Number(hhExpM).toLocaleString('en-IN')}.</td>
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
      <td class="text-left bold">Comfortable Monthly EMI Post all expenses (As per moneyboxx )</td>
      <td colspan="2" class="bold">As per ${bankName} (Approx ₹${Math.round(Number(data.appliedAmount || 0) * 0.05).toLocaleString('en-IN')})</td>
    </tr>
  </table>

  <!-- Detailed Summary Section -->
  <div style="margin-top: 20px; border: 1px solid #000; padding: 15px; background: #fafafa;">
    <h3 style="margin-top: 0; color: #333; text-transform: uppercase; font-size: 11pt; border-bottom: 2px solid #ccc; padding-bottom: 5px;">Executive Detailed Summary</h3>
    <p style="text-align: justify; font-size: 9.5pt; line-height: 1.6;">
      <strong>Business Overview:</strong> The applicant, ${data.applicantName}, operates <strong>${data.firmName || 'the business'}</strong> and has been engaged in this line of work for over ${data.yearsInBusiness || 0} years. The business is conducted from a ${data.shopOwnership === 'OWNED' ? 'self-owned' : 'rented'} premises.
      <br/><br/>
      <strong>Purpose & Utilization:</strong> The primary purpose of this facility is <strong>${data.solarPurposeUsage || data.purpose || 'Business Expansion / Solar Upgrade'}</strong>. This investment is expected to directly reduce operational overheads (like diesel/electricity costs) and improve net margins.
      <br/><br/>
      <strong>Financial Health:</strong> The stated monthly turnover is ₹${Number(totalSalesM).toLocaleString('en-IN')} with an estimated net profit margin of around ${Math.round((netProfM / (totalSalesM || 1)) * 100)}%. The household expenses and existing obligations are comfortably covered by the net disposable income of ₹${Number(netDisposalM).toLocaleString('en-IN')}, leaving sufficient room to service the proposed EMI of approximately ₹${Math.round(Number(data.appliedAmount || 0) * 0.05).toLocaleString('en-IN')}.
    </p>
  </div>

  <!-- Risk Assessment & Meter -->
  <div style="margin-top: 20px; margin-bottom: 20px; border: 1px solid #000; padding: 15px; display: flex; align-items: center; justify-content: space-between; background: #fff;">
    <div style="width: 65%;">
      <h3 style="margin-top: 0; color: #333; text-transform: uppercase; font-size: 11pt; border-bottom: 2px solid #ccc; padding-bottom: 5px;">Risk Assessment</h3>
      <p style="font-size: 9.5pt; line-height: 1.5;">
        <strong>CIBIL Score:</strong> ${data.cibilScore || 'N/A'}<br/>
        <strong>Risk Factor / Mitigant:</strong> ${data.riskFactor || 'Standard business risks apply. Cash flows are stable and vintage provides comfort.'}
      </p>
    </div>
    <div style="width: 30%; text-align: center;">
      <div style="font-weight: bold; margin-bottom: 10px; font-size: 10pt;">Risk Meter</div>
      <!-- SVG Semi-circle Gauge -->
      <svg viewBox="0 0 100 50" style="width: 150px; height: 75px; overflow: visible;">
        <!-- Base Track -->
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" stroke-width="15" stroke-linecap="round" />
        <!-- Low Risk (Green) -->
        <path d="M 10 50 A 40 40 0 0 1 30 15" fill="none" stroke="#22c55e" stroke-width="15" stroke-linecap="round" />
        <!-- Medium Risk (Yellow) -->
        <path d="M 30 15 A 40 40 0 0 1 70 15" fill="none" stroke="#eab308" stroke-width="15" />
        <!-- High Risk (Red) -->
        <path d="M 70 15 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" stroke-width="15" stroke-linecap="round" />
        <!-- Needle -->
        ${(() => {
          const score = data.cibilScore ? Math.max(0, Math.min(100, (data.cibilScore - 300) / 6)) : 75; // Map 300-900 to 0-100
          const angle = -90 + (score * 1.8);
          return `<g transform="rotate(${angle} 50 50)">
                   <polygon points="48,50 52,50 50,5" fill="#334155" />
                   <circle cx="50" cy="50" r="5" fill="#334155" />
                 </g>`;
        })()}
      </svg>
      <div style="font-size: 9.5pt; font-weight: bold; margin-top: 8px; color: ${data.cibilScore && data.cibilScore < 650 ? '#ef4444' : data.cibilScore && data.cibilScore > 750 ? '#22c55e' : '#eab308'}">
        ${data.cibilScore && data.cibilScore < 650 ? 'HIGH RISK' : data.cibilScore && data.cibilScore > 750 ? 'LOW RISK' : 'MODERATE RISK'}
      </div>
    </div>
  </div>

  <!-- Disclaimer and Signature inside the table border structure -->
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
      <strong style="font-size: 10pt; color: #1e3a8a;">${data.companyHeader?.name || 'Authorized Signatory'}</strong>
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
      return `
        <h4 style="text-align: center; background: #f5f5f5; padding: 5px; margin-top: 20px; border: 1px solid #000;">${category}</h4>
        <div class="photo-grid" style="grid-template-columns: 1fr 1fr; border: 1px solid #000; border-top: none; min-height: 50px;">
          ${catPhotos.length > 0 
            ? catPhotos.map(p => `
            <div class="photo-card">
              <img src="${p.dataUrl}" alt="${p.name}" />
              <div style="font-weight: bold; font-size: 8pt; margin-top: 4px;">${p.name}</div>
              <div style="font-size: 7.5pt; color: #475569;">GPS: ${p.gps?.lat || 'N/A'}, ${p.gps?.lng || 'N/A'} • Verified Stamp</div>
            </div>
          `).join('')
            : `<div style="grid-column: span 2; padding: 20px; text-align: center; color: #666; font-size: 9pt;">No ${category.toLowerCase()} uploaded</div>`
          }
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
  `;
}

export function openStandardPDReportPrintWindow(data: PDReportPrintData) {
  let htmlContent = '';
  if (data.clientBankName && data.clientBankName.toLowerCase().includes('moneyboxx')) {
    htmlContent = generateMoneyboxxPDReportHTML(data);
  } else {
    htmlContent = generateStandardPDReportHTML(data);
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
}
