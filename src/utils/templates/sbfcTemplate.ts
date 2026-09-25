import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

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

  const hasItemizedSales = Boolean(data.itemizedSales && data.itemizedSales.length > 0 && data.itemizedSales.some(i => (Number(i.monthly) || 0) > 0));
  const salesItems = hasItemizedSales
    ? data.itemizedSales!.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: `${data.firmName || 'Business'} Assessed Monthly Turnover`,
          businessNotes: data.workingDays ? `Assessed for ${data.workingDays} working days` : 'Based on field verification',
          monthly: Number(data.totalSalesMonthly) || 0,
          yearly: Number(data.totalSalesYearly) || (Number(data.totalSalesMonthly) || 0) * 12
        }
      ];
  const totalSalesM = hasItemizedSales
    ? salesItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number(data.totalSalesMonthly) || (salesItems[0] ? Number(salesItems[0].monthly) || 0 : 0));
  const totalSalesY = hasItemizedSales
    ? salesItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number(data.totalSalesYearly) || totalSalesM * 12);
  
  const hasItemizedExpenses = Boolean(data.itemizedExpenses && data.itemizedExpenses.length > 0 && data.itemizedExpenses.some(i => (Number(i.monthly) || 0) > 0));
  const expenseItems = hasItemizedExpenses
    ? data.itemizedExpenses!.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: 'Operating Expenses & Direct Costs',
          businessNotes: (Number(data.totalExpensesMonthly) || 0) > 0 ? 'Assessed monthly expenditure' : 'Nil / No direct operating expenses recorded',
          monthly: Number(data.totalExpensesMonthly) || 0,
          yearly: Number(data.totalExpensesYearly) || (Number(data.totalExpensesMonthly) || 0) * 12
        }
      ];
  const totalExpM = hasItemizedExpenses
    ? expenseItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number(data.totalExpensesMonthly) || (expenseItems[0] ? Number(expenseItems[0].monthly) || 0 : 0));
  const totalExpY = hasItemizedExpenses
    ? expenseItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number(data.totalExpensesYearly) || totalExpM * 12);

  const netProfM = totalSalesM > 0 ? (totalSalesM - totalExpM) : 0;
  const netProfY = data.netProfitYearly || (netProfM * 12);

  // Co-Applicant Income Assessment Calculations
  const hasCoAppAssessment = Boolean(data.hasCoApplicantIncomeAssessment);
  const coAppSalesItems = (data.coApplicantItemizedSales && data.coApplicantItemizedSales.length > 0)
    ? data.coApplicantItemizedSales.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: `${data.coApplicantName || 'Co-applicant'} Business Monthly Turnover`,
          businessNotes: data.workingDays ? `Assessed for ${data.workingDays} working days` : 'Based on field verification & assessment',
          monthly: Number(data.coApplicantTotalSalesMonthly) || 0,
          yearly: Number(data.coApplicantTotalSalesYearly) || (Number(data.coApplicantTotalSalesMonthly) || 0) * 12
        }
      ];

  const coAppTotalSalesM = (data.coApplicantItemizedSales && data.coApplicantItemizedSales.length > 0)
    ? coAppSalesItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number(data.coApplicantTotalSalesMonthly) || (coAppSalesItems[0] ? Number(coAppSalesItems[0].monthly) || 0 : 0));
  const coAppTotalSalesY = (data.coApplicantItemizedSales && data.coApplicantItemizedSales.length > 0)
    ? coAppSalesItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number(data.coApplicantTotalSalesYearly) || coAppTotalSalesM * 12);

  const coAppExpenseItems = (data.coApplicantItemizedExpenses && data.coApplicantItemizedExpenses.length > 0)
    ? data.coApplicantItemizedExpenses.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: 'Co-applicant Operating Expenses',
          businessNotes: (Number(data.coApplicantTotalExpensesMonthly) || 0) > 0 ? 'Assessed monthly business expenditure' : 'Nil / No direct operating expenses recorded',
          monthly: Number(data.coApplicantTotalExpensesMonthly) || 0,
          yearly: Number(data.coApplicantTotalExpensesYearly) || (Number(data.coApplicantTotalExpensesMonthly) || 0) * 12
        }
      ];

  const coAppTotalExpM = (data.coApplicantItemizedExpenses && data.coApplicantItemizedExpenses.length > 0)
    ? coAppExpenseItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number(data.coApplicantTotalExpensesMonthly) || (coAppExpenseItems[0] ? Number(coAppExpenseItems[0].monthly) || 0 : 0));
  const coAppTotalExpY = (data.coApplicantItemizedExpenses && data.coApplicantItemizedExpenses.length > 0)
    ? coAppExpenseItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number(data.coApplicantTotalExpensesYearly) || coAppTotalExpM * 12);

  const coAppNetProfM = coAppTotalSalesM > 0 ? (coAppTotalSalesM - coAppTotalExpM) : 0;
  const coAppNetProfY = data.coApplicantNetProfitYearly || (coAppNetProfM * 12);

  const combinedNetProfM = netProfM + (hasCoAppAssessment ? coAppNetProfM : 0);
  const combinedNetProfY = netProfY + (hasCoAppAssessment ? coAppNetProfY : 0);

  const hhExpM = data.householdExpensesMonthly ?? data.monthlyHouseholdExpenses ?? 0;
  const netDisposalM = combinedNetProfM - existEmiM - hhExpM;
  const netDisposalY = (combinedNetProfY - existEmiY - (hhExpM * 12));
  
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
    .photo-card img { max-width: 100%; max-height: 250px; width: auto; height: auto; display: block; margin: 0 auto; object-fit: contain; background: #f3f4f6; }
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
    ${data.additionalAddresses && data.additionalAddresses.length > 0 ? data.additionalAddresses.map((addr, idx) => `
    <tr><td colspan="2">Additional Address ${idx + 1}</td><td colspan="2">${addr}</td></tr>
    `).join('') : ''}
    <tr><td colspan="2">Address of the meeting</td><td colspan="2">${data.meetingAddress || '-'}</td></tr>
    <tr><td colspan="2">Documents Seen</td><td colspan="2">${data.documentsSeen && data.documentsSeen.length > 0 ? data.documentsSeen.join(', ') : 'Not provided'}</td></tr>
    <tr><td colspan="2">Loan Amount applied (as per applicant)</td><td colspan="2">${data.appliedAmount || '-'}</td></tr>
    <tr><td colspan="2">Type of Loan</td><td colspan="2">${data.loanType || 'Business Loan'}</td></tr>
    <tr><td colspan="2">Purpose of Loan (as per applicant)</td><td colspan="2">${data.purpose || data.loanPurpose || '-'}</td></tr>
    <tr><td colspan="2">Is it Prop. / Partnership / Pvt Ltd/Ltd</td><td colspan="2">${data.constitution || 'Proprietorship'}</td></tr>
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
    ${data.monthlyRent ? `
    <tr>
      <td colspan="2">Monthly Rent</td>
      <td colspan="2">₹${data.monthlyRent}</td>
    </tr>
    ` : ''}
    ${data.shopAreaSqFt ? `
    <tr>
      <td colspan="2">Shop Area (Sq. Ft.)</td>
      <td colspan="2">${data.shopAreaSqFt}</td>
    </tr>
    ` : ''}
    <tr>
      <td colspan="2">Vintage of the business</td>
      <td colspan="2">${data.businessVintage || '-'}</td>
    </tr>
    <tr>
      <td colspan="2">Inventory item details with estimated value</td>
      <td colspan="2">${data.inventoryValue ? '₹' + data.inventoryValue : (data.stockDetailsValue ? 'Stock worth approximately ' + data.stockDetailsValue : 'Not provided')}</td>
    </tr>
    ${data.businessRemark ? `
    <tr>
      <td colspan="2">Business Remarks</td>
      <td colspan="2">${data.businessRemark}</td>
    </tr>
    ` : ''}
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
    ${salesItems.map(item => `
    <tr>
      <td colspan="2">${item.particulars}</td>
      <td>₹${Number(item.monthly).toLocaleString('en-IN')}</td>
      <td>₹${Number(item.yearly).toLocaleString('en-IN')}</td>
    </tr>
    `).join('')}
    <tr style="font-weight: bold; background-color: #f1f5f9;">
      <td colspan="2">Total Sales/Receipts (A)</td>
      <td>₹${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td>₹${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    ${expenseItems.map(item => `
    <tr>
      <td colspan="2">${item.particulars}</td>
      <td>₹${Number(item.monthly).toLocaleString('en-IN')}</td>
      <td>₹${Number(item.yearly).toLocaleString('en-IN')}</td>
    </tr>
    `).join('')}
    <tr style="font-weight: bold; background-color: #f1f5f9;">
      <td colspan="2">Total Expenses (B)</td>
      <td>₹${Number(totalExpM).toLocaleString('en-IN')}</td>
      <td>₹${Number(totalExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #e2e8f0;">
      <td colspan="2">Net Profit Per month(A- B)</td>
      <td>₹${Number(netProfM).toLocaleString('en-IN')}</td>
      <td>₹${Number(netProfY).toLocaleString('en-IN')}</td>
    </tr>

    ${hasCoAppAssessment ? `
    <tr><td colspan="4" class="sec-head" style="background-color: #2d3e50; color: #fff;">Assessment of the monthly income of the co-applicant ${data.coApplicantName ? `(${data.coApplicantName})` : ''}</td></tr>
    <tr class="sec-head">
      <td colspan="2">Particulars (Co-applicant)</td>
      <td>Monthly Income</td>
      <td>Yearly Income</td>
    </tr>
    ${coAppSalesItems.map(item => `
    <tr>
      <td colspan="2">${item.particulars}</td>
      <td>₹${Number(item.monthly).toLocaleString('en-IN')}</td>
      <td>₹${Number(item.yearly).toLocaleString('en-IN')}</td>
    </tr>
    `).join('')}
    <tr style="font-weight: bold; background-color: #f1f5f9;">
      <td colspan="2">Total Sales/Receipts (A)</td>
      <td>₹${Number(coAppTotalSalesM).toLocaleString('en-IN')}</td>
      <td>₹${Number(coAppTotalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    ${coAppExpenseItems.map(item => `
    <tr>
      <td colspan="2">${item.particulars}</td>
      <td>₹${Number(item.monthly).toLocaleString('en-IN')}</td>
      <td>₹${Number(item.yearly).toLocaleString('en-IN')}</td>
    </tr>
    `).join('')}
    <tr style="font-weight: bold; background-color: #f1f5f9;">
      <td colspan="2">Total Expenses (B)</td>
      <td>₹${Number(coAppTotalExpM).toLocaleString('en-IN')}</td>
      <td>₹${Number(coAppTotalExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #e2e8f0;">
      <td colspan="2">Co-applicant Net Profit Per month(A- B)</td>
      <td>₹${Number(coAppNetProfM).toLocaleString('en-IN')}</td>
      <td>₹${Number(coAppNetProfY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #fde68a; color: #78350f;">
      <td colspan="2">Total Combined Household Net Business Profit</td>
      <td>₹${Number(combinedNetProfM).toLocaleString('en-IN')}</td>
      <td>₹${Number(combinedNetProfY).toLocaleString('en-IN')}</td>
    </tr>
    ` : ''}

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
      <td colspan="2">Applicant informed that his yearly turnover Rs. ${Math.round((totalSalesY + (hasCoAppAssessment ? coAppTotalSalesY : 0))/100000)} lakh and net profit margin ${Math.round(((combinedNetProfM)/(totalSalesM + (hasCoAppAssessment ? coAppTotalSalesM : 0) || 1))*100)}%.</td>
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
      { name: data.applicantName || 'Applicant', relationship: 'Self', age: '', profession: '', dependent: false }
    ]).map((f: any, i: number) => `
      <tr>
        <td>${i+1}</td>
        <td>${f.name}</td>
        <td>${f.relationship || f.relation || ''}</td>
        <td>${f.age || ''}</td>
        <td>${f.profession || f.occupation || ''}</td>
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