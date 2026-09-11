import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

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
    ${getUniversalCoverPageCSS()}</style>
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
    ${data.additionalAddresses && data.additionalAddresses.length > 0 ? data.additionalAddresses.map((addr, idx) => `
    <tr>
      <td>Additional Address ${idx + 1}</td>
      <td colspan="3"><strong>${addr}</strong></td>
    </tr>
    `).join('') : ''}
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
