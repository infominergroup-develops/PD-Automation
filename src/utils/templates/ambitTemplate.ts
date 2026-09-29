import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

export function generateAmbitPDReportHTML(data: PDReportPrintData): string {
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
  <title>Ambit Capital Private Limited - ${appNo}</title>
  <style>
    @page { size: A4; margin: 10mm 10mm 10mm 10mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 9pt; color: #000; background-color: #fff; margin: 0; padding: 0; line-height: 1.35; }
    .page-break { page-break-before: always; margin-top: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
    .sec-head { text-align: center; font-weight: bold; font-size: 10pt; background-color: #f3f4f6;}
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
  <table>
    <tr>
      <td colspan="2" style="width: 60%;" class="bold">To,<br/>Ambit Capital Private Limited<br/><br/>Dear Sir/Madam,<br/><br/>Sub: Income Assesment of ${(data as any).applicantName || 'Applicant'}</td>
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
      <td colspan="7" class="sec-head">Brief of family member and residence verification status</td>
    </tr>
    <tr>
      <td colspan="7" style="vertical-align: top;">
        ${(() => {
          const ownership = String((data as any).residenceOwnership || '').toLowerCase();
          const isRented = ownership.includes('rent');
          const ownershipText = isRented ? 'rented' : 'self-owned';
          const houseDetails = (data as any).residenceHouseDetails ? (data as any).residenceHouseDetails : 'This house has three rooms and is a single-story structure, comprising a ground floor.';
          
          let p1 = `The applicant, ${(data as any).applicantName || 'the applicant'}, resides with their family in their ${ownershipText} residential premises. `;
          p1 += `As verbally confirmed, ${houseDetails} `;
          
          let p2 = '';
          const self = familyList.find((f: any) => String(f.relationship || f.relation).toLowerCase() === 'self' || f.name === (data as any).applicantName);
          if (self) {
            p2 += `The applicant, ${self.name || (data as any).applicantName}, aged ${self.age || '-'} years, has completed ${self.qualification || '-'} and is ${self.occupation || 'self-employed'}. `;
          } else {
            p2 += `The applicant, ${(data as any).applicantName || 'the applicant'}, is self-employed. `;
          }

          const otherAdults = familyList.filter((f: any) => f !== self && (!f.age || Number(f.age) >= 18));
          if (otherAdults.length > 0) {
            otherAdults.forEach((f: any) => {
              p2 += `Their ${f.relationship || f.relation || 'family member'}, ${f.name || '-'}, aged ${f.age || '-'} years, has completed ${f.qualification || '-'} and is ${f.occupation || '-'}. `;
            });
          }

          const minors = familyList.filter((f: any) => f !== self && f.age && Number(f.age) < 18);
          if (minors.length > 0) {
            p2 += `The family also includes ${minors.length} children/grandchildren: ${minors.map((m: any) => `${m.name}, aged ${m.age} years`).join('; ')}, all of whom are dependent. `;
          }

          p2 += `Monthly household expenses are approximately Rs. ${Number(hhExpM).toLocaleString('en-IN')}/-.`;
          const resElec = String((data as any).residenceElectricityDetails || '');
          const busElec = String((data as any).businessElectricityDetails || '');
          const isNotProvided = resElec.toLowerCase().includes('not provided') && busElec.toLowerCase().includes('not provided');
          let p3 = `During the visit, the electricity bill was ${isNotProvided ? 'not provided' : 'checked'}.`;

          return '<div style="text-align: justify; padding: 5px;">' + p1 + '<br/><br/>' + p2 + '<br/><br/>' + p3 + '<br/><br/><span style="color: gray;">(All the above details are confirm verbally)</span></div>';
        })()}
      </td>
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
      <td colspan="2" class="bold">Residence Status</td>
      <td colspan="5">Recommended</td>
    </tr>
  </table>

  <div class="page-break"></div>
  <table>
    <tr>
      <td colspan="2" class="sec-head">Collateral Property details</td>
    </tr>
    <tr>
      <td style="width: 25%;">Collateral Address</td>
      <td style="width: 75%;">${(data as any).collateralAddress || (data as any).propertyAddress || '-'}</td>
    </tr>
    <tr>
      <td>Property Type</td>
      <td>${(data as any).collateralPropertyType || (data as any).propertyType || 'The property type is residential'}</td>
    </tr>
    <tr>
      <td>Approx. Property Area</td>
      <td>${(data as any).collateralPropertyArea || (data as any).propertyArea || 'The property area is approximately 800-900 sq. feet (as per verbal confirmation)'}</td>
    </tr>
    <tr>
      <td>Property Usage</td>
      <td>${(data as any).collateralPropertyUsage || (data as any).propertyUsage || 'This property is used for residential purposes.'}</td>
    </tr>
    <tr>
      <td>Approx Property Valuation</td>
      <td>${(data as any).collateralValuation || (data as any).propertyValuation || 'The property valuation is approximately in Rs. 8-10 Lakh. (as per verbal confirmation)'}</td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="2" class="sec-head">Business visit of ${(data as any).applicantName || 'Applicant'}</td>
    </tr>
    <tr>
      <td colspan="2" class="sec-head">Brief Profile of Business</td>
    </tr>
    <tr>
      <td colspan="2" style="height: 200px; vertical-align: top;">
        ${(data as any).briefBusinessProfile && (data as any).briefBusinessProfile !== 'Not provided' ? (data as any).briefBusinessProfile.replace(/\\n/g, '<br/>') + '<br/><br/>' : ''}
        (All the above details are confirm verbal by applicant)
      </td>
    </tr>
    <tr>
      <td style="width: 25%;">Vintage of the business</td>
      <td style="width: 75%;">${(data as any).businessVintage || 'The applicant has been operating the business at the current address for the past 04 years.'}</td>
    </tr>
    <tr>
      <td>Number of staffs</td>
      <td>${(data as any).numberOfStaff || 'He is self-employed and operates the business by himself.'}</td>
    </tr>
    <tr>
      <td>Is office premise on rented /owned</td>
      <td>${(data as any).businessOwnership || 'The applicant is managing and operating the business from his residence.'}</td>
    </tr>
    <tr>
      <td>Details of Office / Factory infrastructure ( Assets )</td>
      <td>${(data as any).businessInfra || '-'}</td>
    </tr>
    <tr>
      <td>Stock details with estimated value</td>
      <td>${(data as any).stockDetails || '-'}</td>
    </tr>
    <tr>
      <td>Equipments/ Small Tools/ Machinery Used for Business</td>
      <td>${(data as any).equipmentDetails || '-'}</td>
    </tr>
    <tr>
      <td>Other source income</td>
      <td>${(data as any).otherIncome || 'No other regular source of income was confirmed during verification.'}</td>
    </tr>
  </table>

  <div class="page-break"></div>
  <table>
    <tr>
      <td colspan="4" class="sec-head">Applicant's customer and supplier details</td>
    </tr>
    <tr class="bold text-center">
      <td style="width: 10%;">Sr. No.</td>
      <td style="width: 30%;">Prominent Customers (Name)</td>
      <td style="width: 20%;">Customers Ph. No.</td>
      <td style="width: 40%;">Feedback (Remark)</td>
    </tr>
    ${customerList.map((c: any, idx: number) => `
      <tr class="text-center">
        <td>${idx + 1}</td>
        <td>${c.name || '-'}</td>
        <td>${c.phone || '-'}</td>
        <td>${c.remark || '-'}</td>
      </tr>
    `).join('')}
    <tr class="bold text-center">
      <td>Sr. No.</td>
      <td>Prominent Suppliers (Name)</td>
      <td>Supplier Ph. No.</td>
      <td>Feedback (Remark)</td>
    </tr>
    ${supplierList.map((s: any, idx: number) => `
      <tr class="text-center">
        <td>${idx + 1}</td>
        <td>${s.name || '-'}</td>
        <td>${s.phone || '-'}</td>
        <td>${s.remark || '-'}</td>
      </tr>
    `).join('')}
    
    <tr>
      <td colspan="4" class="sec-head">Banking Details and Limit OD and CC limit with bank</td>
    </tr>
    <tr>
      <td colspan="4" style="padding: 0; border: none;">
        <table style="margin-bottom: 0; border: none;">
          <tr class="bold text-center">
            <td style="border-top: none; border-left: none;">Bank Name</td>
            <td style="border-top: none;">Branch Name</td>
            <td style="border-top: none;">Account Types</td>
            <td style="border-top: none;">CC/OD Limit</td>
            <td style="border-top: none;">Account No.</td>
            <td style="border-top: none; border-right: none;">Remark</td>
          </tr>
          ${bankingList.map((b: any) => `
            <tr class="text-center">
              <td style="border-left: none; border-bottom: none;">${b.bankName || '-'}</td>
              <td style="border-bottom: none;">${b.branchName || '-'}</td>
              <td style="border-bottom: none;">${b.accountType || '-'}</td>
              <td style="border-bottom: none;">${b.limit || 'NA'}</td>
              <td style="border-bottom: none;">${b.accountNo || '-'}</td>
              <td style="border-right: none; border-bottom: none;">${b.remark || '-'}</td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Latitude & Longitude of the business premises</td>
      <td colspan="2">${(data as any).businessGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Remarks</td>
      <td colspan="2">${(data as any).businessLocationRemarks || 'The location was checked using the provided coordinates.'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Electricity Connection Details</td>
      <td colspan="2">${(data as any).businessElectricityDetails !== 'Not provided' ? (data as any).businessElectricityDetails : ((data as any).residenceElectricityDetails !== 'Not provided' ? (data as any).residenceElectricityDetails : 'A separate electricity meter is not required, as the applicant is operating the business from the residence.')}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbour Name</td>
      <td colspan="2">${(data as any).businessNeighborName || '-'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Neighbor Feedback</td>
      <td colspan="2">${(data as any).businessNeighborFeedback || 'Neighbour verification was conducted, wherein the neighbours confirmed that the applicant has been engaged in the stated business for the past approximately 18–20 years. The overall feedback received regarding the applicant and his work was positive.'}</td>
    </tr>
    <tr>
      <td colspan="2" class="bold">Business Status</td>
      <td colspan="2">Recommended</td>
    </tr>
  </table>

  ${loansList.length > 0 ? `
  <div class="page-break"></div>
  <table>
    <tr>
      <td colspan="11" class="sec-head">Existing Loans / Liabilities</td>
    </tr>
    <tr class="bold text-center" style="font-size: 8pt;">
      <td>Sr. No.</td>
      <td>Applicant Name</td>
      <td>Account Type</td>
      <td>Financer Name</td>
      <td>Lender Type</td>
      <td>Ownership</td>
      <td>Disbursed Date</td>
      <td>Disbursed Amount</td>
      <td>Instalment Amount</td>
      <td>Tenure (months)</td>
      <td>Remarks</td>
    </tr>
    ${loansList.map((l: any, idx: number) => `
      <tr class="text-center" style="font-size: 8pt;">
        <td>${idx + 1}</td>
        <td>${l.applicantName || (data as any).applicantName || '-'}</td>
        <td>${l.typeOfLoan || '-'}</td>
        <td>${l.financerName || '-'}</td>
        <td>${l.lenderType || '-'}</td>
        <td>${l.ownership || '-'}</td>
        <td>${l.disbursedDate || '-'}</td>
        <td>${l.amountInLakhs || l.loanAmountLakhs || '-'}</td>
        <td>${l.emi || l.emiRs || '-'}</td>
        <td>${l.tenure || l.tenureYearsMonths || '-'}</td>
        <td>${l.remark || '-'}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="2" class="text-center" style="font-size: 8pt;">Current Obligation</td>
      <td colspan="9" style="font-size: 8pt;">
        The applicant currently has ${loansList.length} running obligations, the amount of which is Rs. ${existEmiM}/- per month. ( As per CRIF Report )
      </td>
    </tr>
  </table>
  ` : ''}

  <div class="page-break"></div>
  <table>
    <tr>
      <td colspan="4" class="sec-head" style="text-decoration: underline;">Assessment of the monthly income of the applicant</td>
    </tr>
    <tr class="bold text-center">
      <td style="width: 30%;">Particulars</td>
      <td style="width: 40%;">Business Notes</td>
      <td colspan="2" style="width: 30%;">(Period)</td>
    </tr>
    <tr class="bold text-center bg-gray-100">
      <td class="text-left">Sales/Receipts</td>
      <td></td>
      <td style="width: 15%;">Monthly</td>
      <td style="width: 15%;">Yearly</td>
    </tr>
    <tr class="text-center">
      <td class="text-left">Income from Business</td>
      <td></td>
      <td>${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td>${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="bold text-center bg-gray-100">
      <td class="text-left">Total Sales/Receipts (A)</td>
      <td></td>
      <td>${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td>${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    <tr class="text-center">
      <td class="text-left">Purchase</td>
      <td></td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr class="text-center">
      <td class="text-left">Monthly Electricity Expenses</td>
      <td>A separate electricity meter is not required, as the applicant is operating the business from the residence.</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr class="text-center">
      <td class="text-left">Salary of Employees</td>
      <td>He is self-employed and operates the business by himself.</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr class="text-center">
      <td class="text-left">Business Premises Rent<br/>(if the premises is on rent)</td>
      <td>The applicant is managing and operating the business from his residence.</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr class="text-center">
      <td class="text-left">Other expenses</td>
      <td>Monthly veterinary and maintenance expenditure</td>
      <td>0</td>
      <td>0</td>
    </tr>
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
      <td colspan="2">${data.comfortableEmiNotes?.trim() || 'As per Ambit Capital'}</td>
    </tr>
    <tr>
      <td colspan="4">
        <span class="bold">Limitation and Disclaimer clause: -</span><br/>
        This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as observed at that point in time only. Document-related inputs are based solely on information shared during field interactions and do not constitute independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct or indirect, arising from such reliance.<br/><br/>
        <span class="bold">Important Notes:</span><br/>
        Actual Profit and Loss figures were not made available by "Ambit Capital Private Limited" hence only estimated figures are captured as per the information and understanding provided by the applicant during visit.<br/><br/><br/><br/><br/>
        <span class="bold">(Sign of Agency authorized signatory)</span>
      </td>
    </tr>
  </table>

  ${photosHtml}

</body>
</html>
`;
}
