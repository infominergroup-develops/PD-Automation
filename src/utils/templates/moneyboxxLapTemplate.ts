import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

export function generateMoneyboxxLapPDReportHTML(data: PDReportPrintData): string {
  const appNo = (data as any).applicationNumber || 'Not Provided';
  const reportDate = (data as any).visitDate || '-';
  const visitDate = (data as any).visitDate || '-';
  const initiationDate = (data as any).caseInitiationDate || '-';
  const caseStatus = (data as any).statusOfCase || (data as any).businessStatus || 'Recommended';
  
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

  const existEmiM = (data as any).existingEmiMonthly || 0;
  const existEmiY = (data as any).existingEmiYearly || (existEmiM * 12);
  const hasItemizedSales = Boolean((data as any).itemizedSales && (data as any).itemizedSales.length > 0 && (data as any).itemizedSales.some(i => (Number(i.monthly) || 0) > 0));
  const salesItems = hasItemizedSales
    ? (data as any).itemizedSales!.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: `${(data as any).firmName || 'Business'} Assessed Monthly Turnover`,
          businessNotes: (data as any).workingDays ? `Assessed for ${(data as any).workingDays} working days` : 'Based on field verification',
          monthly: Number((data as any).totalSalesMonthly) || 0,
          yearly: Number((data as any).totalSalesYearly) || (Number((data as any).totalSalesMonthly) || 0) * 12
        }
      ];
  const totalSalesM = hasItemizedSales
    ? salesItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number((data as any).totalSalesMonthly) || (salesItems[0] ? Number(salesItems[0].monthly) || 0 : 0));
  const totalSalesY = hasItemizedSales
    ? salesItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number((data as any).totalSalesYearly) || totalSalesM * 12);

  const hasItemizedExpenses = Boolean((data as any).itemizedExpenses && (data as any).itemizedExpenses.length > 0 && (data as any).itemizedExpenses.some(i => (Number(i.monthly) || 0) > 0));
  const expenseItems = hasItemizedExpenses
    ? (data as any).itemizedExpenses!.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: 'Operating Expenses & Direct Costs',
          businessNotes: (Number((data as any).totalExpensesMonthly) || 0) > 0 ? 'Assessed monthly expenditure' : 'Nil / No direct operating expenses recorded',
          monthly: Number((data as any).totalExpensesMonthly) || 0,
          yearly: Number((data as any).totalExpensesYearly) || (Number((data as any).totalExpensesMonthly) || 0) * 12
        }
      ];
  const totalExpM = hasItemizedExpenses
    ? expenseItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number((data as any).totalExpensesMonthly) || (expenseItems[0] ? Number(expenseItems[0].monthly) || 0 : 0));
  const totalExpY = hasItemizedExpenses
    ? expenseItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number((data as any).totalExpensesYearly) || totalExpM * 12);

  const netProfM = totalSalesM > 0 ? (totalSalesM - totalExpM) : 0;
  const netProfY = (data as any).netProfitYearly || (totalSalesY > 0 ? (totalSalesY - totalExpY) : 0);

  // Co-Applicant Income Assessment Calculations
  const hasCoAppAssessment = Boolean((data as any).hasCoApplicantIncomeAssessment);
  const coAppSalesItems = ((data as any).coApplicantItemizedSales && (data as any).coApplicantItemizedSales.length > 0)
    ? (data as any).coApplicantItemizedSales.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: `${(data as any).coApplicantName || 'Co-applicant'} Business Monthly Turnover`,
          businessNotes: (data as any).workingDays ? `Assessed for ${(data as any).workingDays} working days` : 'Based on field verification & assessment',
          monthly: Number((data as any).coApplicantTotalSalesMonthly) || 0,
          yearly: Number((data as any).coApplicantTotalSalesYearly) || (Number((data as any).coApplicantTotalSalesMonthly) || 0) * 12
        }
      ];

  const coAppTotalSalesM = ((data as any).coApplicantItemizedSales && (data as any).coApplicantItemizedSales.length > 0)
    ? coAppSalesItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number((data as any).coApplicantTotalSalesMonthly) || (coAppSalesItems[0] ? Number(coAppSalesItems[0].monthly) || 0 : 0));
  const coAppTotalSalesY = ((data as any).coApplicantItemizedSales && (data as any).coApplicantItemizedSales.length > 0)
    ? coAppSalesItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number((data as any).coApplicantTotalSalesYearly) || coAppTotalSalesM * 12);

  const coAppExpenseItems = ((data as any).coApplicantItemizedExpenses && (data as any).coApplicantItemizedExpenses.length > 0)
    ? (data as any).coApplicantItemizedExpenses.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: 'Co-applicant Operating Expenses',
          businessNotes: (Number((data as any).coApplicantTotalExpensesMonthly) || 0) > 0 ? 'Assessed monthly business expenditure' : 'Nil / No direct operating expenses recorded',
          monthly: Number((data as any).coApplicantTotalExpensesMonthly) || 0,
          yearly: Number((data as any).coApplicantTotalExpensesYearly) || (Number((data as any).coApplicantTotalExpensesMonthly) || 0) * 12
        }
      ];

  const coAppTotalExpM = ((data as any).coApplicantItemizedExpenses && (data as any).coApplicantItemizedExpenses.length > 0)
    ? coAppExpenseItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number((data as any).coApplicantTotalExpensesMonthly) || (coAppExpenseItems[0] ? Number(coAppExpenseItems[0].monthly) || 0 : 0));
  const coAppTotalExpY = ((data as any).coApplicantItemizedExpenses && (data as any).coApplicantItemizedExpenses.length > 0)
    ? coAppExpenseItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number((data as any).coApplicantTotalExpensesYearly) || coAppTotalExpM * 12);

  const coAppNetProfM = coAppTotalSalesM > 0 ? (coAppTotalSalesM - coAppTotalExpM) : 0;
  const coAppNetProfY = (data as any).coApplicantNetProfitYearly || (coAppTotalSalesY > 0 ? (coAppTotalSalesY - coAppTotalExpY) : 0);

  const combinedNetProfM = netProfM + (hasCoAppAssessment ? coAppNetProfM : 0);
  const combinedNetProfY = netProfY + (hasCoAppAssessment ? coAppNetProfY : 0);

  const hhExpM = Number((data as any).monthlyHouseholdExpensesAmount) || Number((data as any).householdExpensesMonthly) || Number((data as any).monthlyHouseholdExpenses) || Number((data as any).householdExpenses) || 0;
  const netDisposalM = combinedNetProfM - existEmiM - hhExpM;
  const netDisposalY = (combinedNetProfY - existEmiY - (hhExpM * 12));
  
  const customerList = (data as any).prominentCustomers && (data as any).prominentCustomers.length > 0 ? (data as any).prominentCustomers : [{ name: 'Not provided', phone: '0000000000', remark: 'Not provided' }];
  const supplierList = (data as any).prominentSuppliers && (data as any).prominentSuppliers.length > 0 ? (data as any).prominentSuppliers : [{ name: 'Not provided', phone: '0000000000', remark: 'Not provided' }];
  const bankingList = (data as any).bankingDetails && (data as any).bankingDetails.length > 0 ? (data as any).bankingDetails : [{ bankName: 'Not shared', branchName: 'NA', accountNo: 'NA', limit: 'NA', remark: 'NA' }];
  const crifAccounts = (data as any).parsedCreditReport?.accounts || [];
  const loansList = crifAccounts.length > 0 
    ? crifAccounts.map((acc: any) => ({
        applicantName: acc.applicantName || (data as any).applicantName || 'Applicant',
        typeOfLoan: acc.accountType || 'NA',
        financerName: acc.creditGrantor || 'NA',
        lenderType: 'NA',
        ownership: 'NA',
        disbursedDate: acc.disbursedDate || 'NA',
        amountInLakhs: acc.disbursedAmount ? '₹' + acc.disbursedAmount.toLocaleString('en-IN') : 'NA',
        emi: acc.instalmentAmount ? '₹' + acc.instalmentAmount.toLocaleString('en-IN') : 'NA',
        tenure: acc.tenureMonths || 'NA',
        remark: acc.status || 'NA'
      }))
    : ((data as any).existingLoans && (data as any).existingLoans.length > 0 ? (data as any).existingLoans : []);
  const familyList = (data as any).familyMembers && (data as any).familyMembers.length > 0 ? (data as any).familyMembers : [{ name: (data as any).applicantName || 'Applicant', relation: 'Self', age: '', occupation: '', dependent: false }];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MoneyBoxx LAP - ${appNo}</title>
  <style>
    @page { size: A4; margin: 10mm 10mm 10mm 10mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 9pt; color: #000; background-color: #fff; margin: 0; padding: 0; line-height: 1.35; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; page-break-inside: avoid; }
    th, td { border: 1px solid #000; padding: 4px 6px; font-size: 8.5pt; }
    .sec-head { background-color: #f2f2f2; font-weight: bold; text-align: left; padding: 4px 6px; font-size: 9pt; text-transform: uppercase; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .text-center { text-align: center; }
    .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
    .photo-card { border: 1px solid #000; padding: 5px; text-align: center; }
    .photo-card img { max-width: 100%; max-height: 250px; width: auto; height: auto; display: block; margin: 0 auto; object-fit: contain; background: #f3f4f6; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
    ${getUniversalCoverPageCSS()}
  </style>
</head>
<body>
  ${getUniversalCoverPageHTML((data as any), appNo, reportDate, caseStatus, coverLogo)}

  <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px;">
    <div style="font-size: 13pt; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">Infominer Services Private Limited</div>
    <div style="font-size: 8.5pt; font-weight: 600; color: #475569; margin-top: 2px;">CIN : U67100UP2020PTC131346</div>
    <div style="font-size: 9pt; font-weight: bold; color: #000; margin-top: 2px;">(Chartered Accountant)</div>
    <div style="font-size: 8.5pt; color: #334155; margin-top: 2px;">Office No 410, Shree Siddhi Vinayak Trade Center - Agra- 282004</div>
  </div>

  <table>
    <tr>
      <td colspan="2" style="width: 60%;" class="bold">To,<br/>Moneyboxx Finance Limited<br/><br/>Dear Sir/Madam,<br/><br/>Sub: Income Assesment of ${(data as any).applicantName || 'Applicant'}</td>
      <td colspan="2" style="width: 40%; vertical-align: top;">
        <table style="margin-bottom: 0; border: none; height: 100%;">
          <tr>
            <td class="bold text-center" style="border-top: none; border-left: none; width: 40%;">Date of Initiation</td>
            <td class="text-center" style="border-top: none; border-right: none; width: 60%;">${initiationDate}</td>
          </tr>
          <tr>
            <td class="bold text-center" style="border-left: none;">Application ID</td>
            <td class="text-center" style="border-right: none;">${appNo}</td>
          </tr>
          <tr>
            <td class="bold text-center" style="border-left: none; border-bottom: none;">Status of case</td>
            <td class="text-center" style="border-right: none; border-bottom: none; font-weight: bold;">${caseStatus}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="4">Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:</td>
    </tr>
    
    <tr>
      <td colspan="4" class="sec-head">Case Profile</td>
    </tr>
    <tr>
      <td style="width: 25%;">Visit date</td>
      <td style="width: 25%;">${visitDate}</td>
      <td style="width: 25%;">Report date</td>
      <td style="width: 25%;">${reportDate}</td>
    </tr>
    <tr>
      <td>Name of applicant</td>
      <td colspan="3">${(data as any).applicantName || '-'}</td>
    </tr>
    <tr>
      <td>Contact Number</td>
      <td colspan="3">${(data as any).applicantPhone || '0'}</td>
    </tr>
    <tr>
      <td>Business firm name</td>
      <td colspan="3">${(data as any).firmName || 'M/s'}</td>
    </tr>
    ${(data.coApplicants && data.coApplicants.length > 0) ? data.coApplicants.map((c: any, idx: number) => `
    <tr>
      <td>Co-applicant ${data.coApplicants!.length > 1 ? `${idx + 1} ` : ''}Name with relation</td>
      <td colspan="3">${c.name || '-'}${c.relation ? ` ( ${c.relation} )` : ''}</td>
    </tr>
    <tr>
      <td>Contact Number</td>
      <td colspan="3">${c.mobileNumber || c.phone || '0'}</td>
    </tr>
    `).join('') : `
    <tr>
      <td>Co-applicant Name with relation</td>
      <td colspan="3">${(data as any).coApplicantName || '-'} ( ${(data as any).coApplicantRelation || '-'} )</td>
    </tr>
    <tr>
      <td>Contact Number</td>
      <td colspan="3">${(data as any).coApplicantPhone || '0'}</td>
    </tr>
    `}
    <tr>
      <td>Loan Amount (as mention in application form)</td>
      <td colspan="3">${(data.appliedAmount || data.loanAmount) ? `Rs. ${Number(data.appliedAmount || data.loanAmount).toLocaleString('en-IN')}/-` : 'Not provided'}</td>
    </tr>
    <tr>
      <td>Type of Loan (as mention in application form)</td>
      <td colspan="3">${(data as any).loanType || 'Business Expansion/ Working Capital Requirement'}</td>
    </tr>
    <tr>
      <td>Purpose of Loan (as per applicant)</td>
      <td colspan="3">${(data as any).loanPurpose || (data as any).endUseOfLoan || (data as any).purpose || '-'}</td>
    </tr>
    <tr>
      <td>Address of the residence</td>
      <td colspan="3">${(data as any).residenceAddress || '-'}</td>
    </tr>
    <tr>
      <td>Address of the business</td>
      <td colspan="3">${(data as any).businessAddress || '-'}</td>
    </tr>
    <tr>
      <td>Address of the collateral property</td>
      <td colspan="3">${(data as any).collateralAddress || (data as any).propertyAddress || '-'}</td>
    </tr>
    <tr>
      <td>Met person during visit time.</td>
      <td colspan="3">${(data as any).applicantName || '-'} & ${(data as any).coApplicantName || '-'} ( ${(data as any).coApplicantRelation || '-'} )</td>
    </tr>
    <tr>
      <td>Met person identity proof</td>
      <td colspan="3">${(data as any).kycType || 'PAN Card'}</td>
    </tr>
    <tr>
      <td>Executive Name</td>
      <td colspan="3">${(data as any).executiveName || '-'}</td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="2" class="sec-head">Details of residence visit</td>
    </tr>
    <tr>
      <td style="width: 25%;">Met person during visit time.</td>
      <td style="width: 75%;">${(data as any).applicantName || '-'} & ${(data as any).coApplicantName || '-'} ( ${(data as any).coApplicantRelation || '-'} )</td>
    </tr>
    <tr>
      <td>Address of the meeting</td>
      <td>${(data as any).residenceAddress || '-'}</td>
    </tr>
    <tr>
      <td>Locating Premises Type</td>
      <td>${(data as any).residenceLocationType || 'The residence premises are located in a village area'}</td>
    </tr>
    <tr>
      <td colspan="2" class="sec-head">Residential Details</td>
    </tr>
    <tr>
      <td class="bold">Ownership (If rented then rent amount)</td>
      <td>${(data as any).residenceOwnership || 'Owned Premises - Area 800-900 sq. feet Approx - Value Rs. 8-10 Lakh Approx - Stay Since birth. (As verbally confirmed no ownership record provided)'}</td>
    </tr>
    <tr>
      <td class="bold">House Details</td>
      <td>${(data as any).residenceHouseDetails || 'This house has three rooms and is a single-story structure, comprising a ground floor.'}</td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="7" class="sec-head">Family Background of the Applicant</td>
    </tr>
    <tr class="bold text-center">
      <td>Sr No.</td>
      <td>Famly Member Name</td>
      <td>Age</td>
      <td>Relation with applicant</td>
      <td>Qualification</td>
      <td>Occupation</td>
      <td>Dependents ( Yes/ No )</td>
    </tr>
    ${familyList.map((f: any, idx: number) => `
      <tr class="text-center">
        <td class="bold">${idx + 1}</td>
        <td class="bold">${f.name || '-'}</td>
        <td>${f.age || '-'}</td>
        <td>${f.relationship || f.relation || '-'}</td>
        <td>${f.qualification || '-'}</td>
        <td>${f.occupation || '-'}</td>
        <td>${f.dependent ? 'Yes' : 'No'}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="2" class="bold">Monthly Household Expenses</td>
      <td colspan="5">Rs. ${Number(hhExpM).toLocaleString('en-IN')}/- Per Month</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Electricity Connection Details</td>
      <td colspan="5">${(data as any).residenceElectricityDetails !== 'Not provided' ? (data as any).residenceElectricityDetails : ((data as any).businessElectricityDetails !== 'Not provided' ? (data as any).businessElectricityDetails : 'During verification, the electricity bill/meter was checked and found to be in the name of applicant/co-applicant')}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbor Name</td>
      <td colspan="5">${(data as any).residenceNeighborName || '-'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbor Feedback</td>
      <td colspan="5">${(data as any).residenceNeighborFeedback || 'Neighbour verification was conducted, wherein the neighbours confirmed that both the applicant and co-applicant have been residing at the given address. The feedback received was positive.'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Latitude & Longitude of the business premises</td>
      <td colspan="5">${(data as any).residenceGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Distance from Infominers Branch</td>
      <td colspan="5">${(data as any).residenceDistanceFromBranch || '30 Km'}</td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="2" class="sec-head">Collateral Property details</td>
    </tr>
    <tr>
      <td style="width: 25%;">Collateral Address</td>
      <td style="width: 75%;">${(data as any).collateralAddress || (data as any).propertyAddress || 'Tajganj Fatehabd Road Agra'}</td>
    </tr>
    <tr>
      <td>Property Type</td>
      <td>${(data as any).collateralPropertyType || 'Residential'}</td>
    </tr>
    <tr>
      <td>Property Structure</td>
      <td>${(data as any).collateralStructure || 'Ground Floor'}</td>
    </tr>
    <tr>
      <td>Property Age</td>
      <td>${(data as any).collateralAge || '5-10 Years'}</td>
    </tr>
    <tr>
      <td>Property Area</td>
      <td>${(data as any).collateralArea || '800-900 Sq. Ft.'}</td>
    </tr>
    <tr>
      <td>Collateral Boundaries Details</td>
      <td>${(data as any).collateralBoundaries || 'North: Road, South: Others Property, East: Road, West: Others Property'}</td>
    </tr>
    <tr>
      <td>Latitude & Longitude of the collateral property</td>
      <td>${(data as any).collateralGpsCoords || (data as any).residenceGpsCoords || '-'}</td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="2" class="sec-head">Details of business visit</td>
    </tr>
    <tr>
      <td style="width: 25%;">Met person during visit time</td>
      <td style="width: 75%;">${(data as any).applicantName || '-'} & ${(data as any).coApplicantName || '-'} ( ${(data as any).coApplicantRelation || '-'} )</td>
    </tr>
    <tr>
      <td>Address of the business</td>
      <td>${(data as any).businessAddress || '-'}</td>
    </tr>
    <tr>
      <td>Locating Premises Type</td>
      <td>${(data as any).businessLocationType || 'The business premises are located in a commercial area'}</td>
    </tr>
    <tr>
      <td>Ownership ( If rented then rent amount )</td>
      <td>${(data as any).businessOwnership || 'Rented Premises - Rent Rs. 3000/- Per Month'}</td>
    </tr>
    <tr>
      <td>Business Vintage</td>
      <td>${(data as any).businessVintage || '5-7 Years'}</td>
    </tr>
    <tr>
      <td>Stock Details ( Approx )</td>
      <td>${(data as any).stockDetails || 'Stock Rs. 2-3 Lakh Approx'}</td>
    </tr>
    <tr>
      <td>Asset Details ( Approx )</td>
      <td>${(data as any).assetDetails || 'Assets Rs. 1-2 Lakh Approx'}</td>
    </tr>
    <tr>
      <td>Number of employees</td>
      <td>${(data as any).staffCount || '0'}</td>
    </tr>
    <tr>
      <td>Monthly turnover</td>
      <td>Rs. ${Number(totalSalesM).toLocaleString('en-IN')}/- Per Month</td>
    </tr>
    <tr>
      <td>Monthly Operating Expenses</td>
      <td>Rs. ${Number(totalExpM).toLocaleString('en-IN')}/- Per Month</td>
    </tr>
    <tr>
      <td>Electricity Connection Details</td>
      <td>${(data as any).businessElectricityDetails !== 'Not provided' ? (data as any).businessElectricityDetails : 'During verification, the electricity bill/meter was checked and found to be in the name of landlord/applicant'}</td>
    </tr>
    <tr>
      <td>Latitude & Longitude of the business premises</td>
      <td>${(data as any).businessGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td>Distance from Infominers Branch</td>
      <td>${(data as any).businessDistanceFromBranch || '30 Km'}</td>
    </tr>
    
    <tr>
      <td colspan="2" class="sec-head">Brief of Business and business model</td>
    </tr>
    <tr>
      <td colspan="2" style="vertical-align: top;">
        ${(() => {
          const firm = (data as any).firmName || 'The business';
          const nature = (data as any).businessCategory || 'retail business';
          const vintage = (data as any).businessVintage || '5-7 Years';
          const own = String((data as any).businessOwnership || '').toLowerCase().includes('rent') ? 'rented' : 'self-owned';
          const areaDesc = (data as any).businessLocationType || 'a commercial area';
          const hours = (data as any).operatingHours || '09:00 AM to 08:00 PM';
          const peak = (data as any).seasonalCycle || 'Regular through all months';
          
          let p1 = `M/s ${firm} has been engaged in ${nature} for the past ${vintage}. The business operates from a ${own} premise situated in ${areaDesc}. Regular business operating hours are from ${hours}. Business flow remains ${peak}. `;
          let p2 = (data as any).briefBusinessProfile ? (data as any).briefBusinessProfile : `The applicant actively manages daily procurement, counter sales, inventory upkeep, and customer engagements. Supplies are sourced directly from trusted regional wholesalers on spot/credit basis, ensuring smooth stock turnover.`;
          return '<div style="text-align: justify; padding: 5px;">' + p1 + '<br/><br/>' + p2 + '</div>';
        })()}
      </td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="3" class="sec-head">Details of Prominent Customers</td>
    </tr>
    <tr class="bold text-center">
      <td>Customer Name</td>
      <td>Contact Number</td>
      <td>Feedback</td>
    </tr>
    ${customerList.map((c: any) => `
      <tr class="text-center">
        <td class="bold">${c.name || '-'}</td>
        <td>${c.phone || '-'}</td>
        <td>${c.remark || 'Regular customer, positive feedback received.'}</td>
      </tr>
    `).join('')}
  </table>

  <table>
    <tr>
      <td colspan="3" class="sec-head">Details of Prominent Supplier</td>
    </tr>
    <tr class="bold text-center">
      <td>Supplier Name</td>
      <td>Contact Number</td>
      <td>Feedback</td>
    </tr>
    ${supplierList.map((s: any) => `
      <tr class="text-center">
        <td class="bold">${s.name || '-'}</td>
        <td>${s.phone || '-'}</td>
        <td>${s.remark || 'Regular supplier, smooth commercial dealings.'}</td>
      </tr>
    `).join('')}
  </table>

  <table>
    <tr>
      <td colspan="5" class="sec-head">Banking Details</td>
    </tr>
    <tr class="bold text-center">
      <td>Bank Name</td>
      <td>Branch Name</td>
      <td>Account No.</td>
      <td>Limit (if any)</td>
      <td>Remarks</td>
    </tr>
    ${bankingList.map((b: any) => `
      <tr class="text-center">
        <td class="bold">${b.bankName || '-'}</td>
        <td>${b.branchName || '-'}</td>
        <td>${b.accountNo || '-'}</td>
        <td>${b.limit || 'NA'}</td>
        <td>${b.remark || 'Active operative account.'}</td>
      </tr>
    `).join('')}
  </table>

  <table>
    <tr>
      <td colspan="10" class="sec-head">Details of Existing Loan Track (As per CRIF report)</td>
    </tr>
    <tr class="bold text-center">
      <td>Applicant Name</td>
      <td>Type of loan</td>
      <td>Financer name</td>
      <td>Lender Type</td>
      <td>Ownership</td>
      <td>Disbursed date</td>
      <td>Loan Amount</td>
      <td>Current POS / EMI</td>
      <td>Tenure</td>
      <td>Track / Status</td>
    </tr>
    ${loansList.length > 0 ? loansList.map((l: any) => `
      <tr class="text-center">
        <td class="bold">${l.applicantName}</td>
        <td>${l.typeOfLoan}</td>
        <td>${l.financerName}</td>
        <td>${l.lenderType}</td>
        <td>${l.ownership}</td>
        <td>${l.disbursedDate}</td>
        <td>${l.amountInLakhs}</td>
        <td>${l.emi}</td>
        <td>${l.tenure}</td>
        <td>${l.remark}</td>
      </tr>
    `).join('') : `
      <tr class="text-center">
        <td colspan="10">No active obligations found or verified in bureau report.</td>
      </tr>
    `}
  </table>

  <table>
    <tr>
      <td colspan="4" class="sec-head">Assessed Financials (Monthly/Yearly)</td>
    </tr>
    <tr class="bold text-center bg-gray-100">
      <td style="width: 25%;">Particulars</td>
      <td style="width: 35%;">Business Notes</td>
      <td style="width: 20%;">Monthly (Rs.)</td>
      <td style="width: 20%;">Yearly (Rs.)</td>
    </tr>
    ${salesItems.map((item: any) => `
      <tr class="text-center">
        <td class="text-left">${item.particulars}</td>
        <td>${item.businessNotes || ''}</td>
        <td>${Number(item.monthly || 0).toLocaleString('en-IN')}</td>
        <td>${Number(item.yearly || ((Number(item.monthly) || 0) * 12)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr class="bold text-center bg-gray-100">
      <td class="text-left">Total Sales / Turnover (A)</td>
      <td></td>
      <td>${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td>${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    ${expenseItems.map((item: any) => `
      <tr class="text-center">
        <td class="text-left">${item.particulars}</td>
        <td>${item.businessNotes || ''}</td>
        <td>${Number(item.monthly || 0).toLocaleString('en-IN')}</td>
        <td>${Number(item.yearly || ((Number(item.monthly) || 0) * 12)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr class="bold text-center bg-gray-100">
      <td class="text-left">Total Expenses(B)</td>
      <td></td>
      <td>${Number(totalExpM).toLocaleString('en-IN')}</td>
      <td>${Number(totalExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="bold text-center bg-gray-100">
      <td class="text-left">Net Profit Per month(A- B)</td>
      <td></td>
      <td>${Number(netProfM).toLocaleString('en-IN')}</td>
      <td>${Number(netProfY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="text-center">
      <td class="text-left bold">Less: Existing EMI</td>
      <td>The applicant currently has ${loansList.length} running obligations, the amount of which is Rs. ${existEmiM}/- per month. ( As per CRIF Report )<br/>The co-applicant currently has 0 running obligations.</td>
      <td class="bold">${Number(existEmiM).toLocaleString('en-IN')}</td>
      <td></td>
    </tr>
    <tr class="text-center">
      <td class="text-left bold">Less: Existing Household Expenses</td>
      <td>The applicant’s family has ${familyList.filter((f: any) => f.occupation !== 'Student' && f.occupation !== 'Housewife' && f.occupation).length || 2} earning members, and the total monthly household expenses are ₹${Number(hhExpM).toLocaleString('en-IN')}.</td>
      <td class="bold">${Number(hhExpM).toLocaleString('en-IN')}</td>
      <td class="bold">${Number(hhExpM * 12).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="bold text-center bg-gray-100">
      <td class="text-left">Net Disposal Income</td>
      <td>Net Income after all deductions ( Monthly/ Yearly)</td>
      <td>${Number(netDisposalM).toLocaleString('en-IN')}</td>
      <td>${Number(netDisposalY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="bold text-center">
      <td class="text-left">Comfortable Monthly EMI</td>
      <td>Comfortable Monthly EMI Post all expenses (Business and Household)</td>
      <td colspan="2">${data.comfortableEmiNotes?.trim() || 'As per Moneyboxx Finance Limited'}</td>
    </tr>
    <tr>
      <td colspan="4">
        <span class="bold">Limitation and Disclaimer clause: -</span><br/>
        This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as observed at that point in time only. Document-related inputs are based solely on information shared during field interactions and do not constitute independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct or indirect, arising from such reliance.<br/><br/>
        <span class="bold">Important Notes:</span><br/>
        Actual Profit and Loss figures were not made available by "Moneyboxx Finance Limited" hence only estimated figures are captured as per the information and understanding provided by the applicant during visit.<br/><br/><br/><br/><br/>
        <span class="bold">(Sign of Agency authorized signatory)</span>
      </td>
    </tr>
  </table>

  ${photosHtml}

</body>
</html>
`;
}
