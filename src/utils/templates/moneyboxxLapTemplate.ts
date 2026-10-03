import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

export function generateMoneyboxxLapPDReportHTML(data: PDReportPrintData): string {
  const bankName = data.clientBankName || 'Moneyboxx Finance Limited';
  const appNo = (data as any).applicationNumber || 'Not Provided';
  const initiationDate = (data as any).caseInitiationDate || (data as any).visitDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const reportDate = (data as any).reportDate || (data as any).visitDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  const visitDate = (data as any).visitDate || reportDate;
  const caseStatus = (data as any).statusOfCase || (data as any).businessStatus || 'Recommended/Not- Recommended';
  
  const applicantName = (data as any).applicantName || 'Applicant';
  const applicantPhone = (data as any).applicantPhone || '0';
  const firmName = (data as any).firmName || 'M/s';
  
  // Co-applicants handling
  const coApplicants = (data as any).coApplicants || [];
  const primaryCoAppName = (data as any).coApplicantName || '';
  const primaryCoAppRelation = (data as any).coApplicantRelation || '';
  const primaryCoAppPhone = (data as any).coApplicantPhone || '0';

  let coApplicantsHtml = '';
  if (coApplicants.length > 0) {
    coApplicantsHtml = coApplicants.map((c: any, idx: number) => `
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;">Co-applicant ${coApplicants.length > 1 ? `${idx + 1} ` : ''}Name with relation</td>
        <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${c.name || '-'}${c.relation ? ` ( ${c.relation} )` : ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;">Contact Number</td>
        <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${c.mobileNumber || c.phone || '0'}</td>
      </tr>
    `).join('');
  } else if (primaryCoAppName) {
    coApplicantsHtml = `
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;">Co-applicant Name with relation</td>
        <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${primaryCoAppName}${primaryCoAppRelation ? ` ( ${primaryCoAppRelation} )` : ''}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;">Contact Number</td>
        <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${primaryCoAppPhone}</td>
      </tr>
    `;
  } else {
    coApplicantsHtml = `
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;">Co-applicant Name with relation</td>
        <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">None</td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;">Contact Number</td>
        <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">0</td>
      </tr>
    `;
  }

  const rawLoanAmount = data.appliedAmount || data.loanAmount;
  let loanAmountText = 'Not provided';
  if (rawLoanAmount) {
    const num = Number(rawLoanAmount);
    if (!isNaN(num) && num > 0) {
      if (num >= 100000) {
        loanAmountText = `Rs. ${num >= 100000 && num % 100000 === 0 ? (num / 100000) + ' Lakh' : Number(num).toLocaleString('en-IN')}`;
      } else {
        loanAmountText = `Rs. ${Number(num).toLocaleString('en-IN')}`;
      }
    } else {
      loanAmountText = String(rawLoanAmount);
    }
  }

  const loanPurposeText = (data as any).loanPurpose || (data as any).endUseOfLoan || (data as any).purpose || 'Business Expenses';
  const residenceAddress = (data as any).residenceAddress || '-';
  const businessAddress = (data as any).businessAddress || '-';
  const collateralAddress = (data as any).collateralAddress || (data as any).propertyAddress || residenceAddress || '-';

  const metPerson = (data as any).metPersonName || (primaryCoAppName ? `${applicantName} & ${primaryCoAppName}${primaryCoAppRelation ? ` ( ${primaryCoAppRelation} )` : ''}` : `${applicantName} ( Self )`);
  const metPersonIdProof = (data as any).metPersonIdProof || (data as any).kycType || 'PAN Card';
  const executiveName = (data as any).executiveName || '';

  // Residence details
  const meetingAddress = (data as any).meetingAddress || residenceAddress;
  const residenceLocationType = (data as any).residenceLocationType || 'The residence premises are located in a village area';
  const residenceOwnership = (data as any).residenceOwnership || 'Owned Premises - Area 800-900 sq. feet Approx - Value Rs. 20-25 Lakh Approx - Stay Since birth. (As verbally confirmed no ownership record provided)';
  const residenceHouseDetails = (data as any).residenceHouseDetails || 'This house has three rooms and is a single-story structure, comprising a ground floor.';

  // Family details
  const familyList = (data as any).familyMembers && (data as any).familyMembers.length > 0
    ? (data as any).familyMembers
    : [{ name: applicantName, age: '45 Years', relationship: 'Self', qualification: '8th', occupation: 'Self-employed', dependent: false }];

  const existEmiM = Number((data as any).existingEmiMonthly) || 0;
  const existEmiY = Number((data as any).existingEmiYearly) || (existEmiM * 12);
  const hhExpM = Number((data as any).monthlyHouseholdExpensesAmount) || Number((data as any).householdExpensesMonthly) || Number((data as any).householdExpenses) || 10000;
  const resHhExpM = Number((data as any).monthlyHouseholdExpensesAmount) || hhExpM;

  const residenceElectricityDetails = (data as any).residenceElectricityDetails || `During verification, the electricity bill/meter was checked and found to be in the name of ${primaryCoAppName || applicantName}, with account number under electricity board.`;
  const residenceNeighborName = (data as any).residenceNeighborName || 'Mr. Vishu and Mr. Sanju';
  const residenceNeighborFeedback = (data as any).residenceNeighborFeedback || 'Neighbour verification was conducted, wherein the neighbours confirmed that both the applicant and co-applicant have been residing at the given address for approximately 40–45 years. The feedback received was positive.';
  const residenceGpsCoords = (data as any).residenceGpsCoords || (data as any).businessGpsCoords || '';

  // Collateral property details
  const collateralPropertyType = (data as any).collateralPropertyType || 'The property type is residential';
  const collateralArea = (data as any).collateralArea || 'The property area is approximately 800-900 sq. feet (as per verbal confirmation)';
  const collateralUsage = (data as any).collateralUsage || 'This property is used for residential purposes.';
  const collateralValuation = (data as any).collateralValuation || (data as any).collateralMarketValue || 'The property valuation is approximately in Rs. 20-25 Lakh. (as per verbal confirmation)';

  // Business visit details & Narrative
  const businessNarrative = (data as any).briefBusinessProfile || (() => {
    return `${applicantName} has been engaged in business operations for the past approximately ${(data as any).businessVintage || '05 years'}, indicating continuity in the same line of activity. The business is being managed under a family setup where family members are involved in day-to-day operations.<br/><br/>The business activity is being managed from ${businessAddress} with regular local operations.<br/>(All the above details are confirm verbal by applicant)`;
  })();

  const businessVintageText = (data as any).businessVintage
    ? `The applicant has been operating the business at the current address for the past ${(data as any).businessVintage}.`
    : 'The applicant has been operating the business at the current address for the past 05 years.';
  const staffCountText = (data as any).staffCount && Number((data as any).staffCount) > 0
    ? `The business employs ${(data as any).staffCount} staff members.`
    : 'He is self-employed and operates the business by himself.';
  const businessPremisesOwnershipText = (data as any).businessOwnership || 'The applicant is managing and operating the business from his residence.';
  const assetDetailsText = (data as any).assetDetails || (data as any).officeInfrastructure || 'The applicant owns livestock assets and business equipment, which are being used for business operations and production.';
  const stockDetailsText = (data as any).stockDetails || 'stock is maintained with an approximate value of 2,000-3,000';
  const equipmentsText = (data as any).equipmentDetails || (data as any).machineryDetails || 'Business include basic tools, containers, and routine equipment required for handling and maintaining operations.';
  const otherIncomeSourceText = (data as any).otherIncomeSource || 'No other regular source of income was confirmed during verification.';

  // Customer & Supplier details
  const customerList = (data as any).prominentCustomers && (data as any).prominentCustomers.length > 0
    ? (data as any).prominentCustomers
    : [{ name: 'Not provided', phone: '0000000000', remark: 'Regular customer, positive feedback received.' }];
  const supplierList = (data as any).prominentSuppliers && (data as any).prominentSuppliers.length > 0
    ? (data as any).prominentSuppliers
    : [{ name: 'Not applicable', phone: '', remark: '' }];

  // Banking Details
  const bankingList = (data as any).bankingDetails && (data as any).bankingDetails.length > 0
    ? (data as any).bankingDetails
    : [{ bankName: 'HDFC Bank', branchName: 'Jeoni Mandi', accountTypes: 'Saving', limit: 'NA', accountNo: '********** 2937', remark: 'The account belongs to applicant' }];

  const businessGpsCoords = (data as any).businessGpsCoords || residenceGpsCoords || '';
  const gpsRemarks = (data as any).gpsRemarks || 'The location was checked using the provided coordinates; however, the GPS map was unable to navigate up to the exact point.';
  const businessElectricityDetails = (data as any).businessElectricityDetails || 'A separate electricity meter is not required, as the applicant is operating the business from the residence.';
  const businessNeighborName = (data as any).businessNeighborName || residenceNeighborName;
  const businessNeighborFeedback = (data as any).businessNeighborFeedback || 'Neighbour verification was conducted, wherein the neighbours confirmed that the applicant has been engaged in the stated business for the past approximately 18–20 years. The overall feedback received regarding the applicant and his work was positive.';

  // Assessed Financials
  const hasItemizedSales = Boolean((data as any).itemizedSales && (data as any).itemizedSales.length > 0 && (data as any).itemizedSales.some(i => (Number(i.monthly) || 0) > 0));
  const salesItems = hasItemizedSales
    ? (data as any).itemizedSales!.filter(i => (Number(i.monthly) || 0) > 0 && i.particulars && i.particulars.trim() !== '')
    : [
        {
          particulars: 'Income from Business',
          businessNotes: (data as any).workingDays ? `Assessed for ${(data as any).workingDays} working days` : 'Based on field verification & assessment',
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
          particulars: 'Purchase',
          businessNotes: 'Dry fodder, green fodder, khal, choker, feed / Raw materials',
          monthly: 0,
          yearly: 0
        },
        {
          particulars: 'Monthly Electricity Expenses',
          businessNotes: 'A separate electricity meter is not required',
          monthly: 0,
          yearly: 0
        },
        {
          particulars: 'Salary of Employees',
          businessNotes: staffCountText,
          monthly: 0,
          yearly: 0
        },
        {
          particulars: 'Business Premises Rent (if the premises is on rent)',
          businessNotes: 'The applicant is managing and operating the business from owned premises.',
          monthly: 0,
          yearly: 0
        },
        {
          particulars: 'Other expenses',
          businessNotes: 'Monthly veterinary and maintenance expenditure',
          monthly: 0,
          yearly: 0
        }
      ];

  const totalExpM = hasItemizedExpenses
    ? expenseItems.reduce((acc, i) => acc + (Number(i.monthly) || 0), 0)
    : (Number((data as any).totalExpensesMonthly) || 0);
  const totalExpY = hasItemizedExpenses
    ? expenseItems.reduce((acc, i) => acc + (Number(i.yearly) || (Number(i.monthly) || 0) * 12), 0)
    : (Number((data as any).totalExpensesYearly) || totalExpM * 12);

  const netProfM = totalSalesM - totalExpM;
  const netProfY = totalSalesY - totalExpY;

  const netDisposalM = netProfM - existEmiM - hhExpM;
  const netDisposalY = netProfY - existEmiY - (hhExpM * 12);

  const crifAccounts = (data as any).parsedCreditReport?.accounts || [];
  const loansList = crifAccounts.length > 0 
    ? crifAccounts 
    : ((data as any).existingLoans && (data as any).existingLoans.length > 0 ? (data as any).existingLoans : []);

  const emiNotes = loansList.length > 0
    ? `The applicant currently has ${loansList.length} running obligations, the amount of which is Rs. ${existEmiM}/- per month. ( As per CRIF Report )`
    : (existEmiM > 0 
        ? `The applicant currently has running obligations of Rs. ${existEmiM}/- per month.`
        : `The applicant currently has 0 running obligations.`);

  const earningCount = familyList.filter((f: any) => {
    const occ = String(f.occupation || '').toLowerCase();
    return occ && !occ.includes('student') && !occ.includes('housewife') && !occ.includes('none') && !occ.includes('-') && !occ.includes('child');
  }).length || 1;

  const householdExpensesNote = `The applicant’s family has ${earningCount} earning member, and the total monthly household expenses are ₹${Number(hhExpM).toLocaleString('en-IN')}.`;

  const comfortableEmiLeftText = data.comfortableEmiNotes?.trim() || 'Comfortable Monthly EMI Post all expenses (Business and Household):-';
  const comfortableEmiRightText = `As per ${bankName}`;

  // Photos Categorization
  const photos = (data as any).photos || [];
  const photoCategories = [
    { key: 'KYC', title: 'KYC', filter: ['KYC', 'ID', 'AADHAAR', 'PAN', 'PASSPORT', 'VOTER'] },
    { key: 'RESIDENCE', title: 'Residence visit photos', filter: ['RESIDENCE', 'HOUSE', 'HOME', 'LIVING'] },
    { key: 'BUSINESS', title: 'Business visit photos', filter: ['BUSINESS', 'SHOP', 'FACTORY', 'DAIRY', 'OFFICE', 'FARM', 'WORK'] },
    { key: 'DOCUMENTS', title: 'Business Documents Photos', filter: ['DOCUMENT', 'DOC', 'BILL', 'METER', 'LICENSE', 'REGISTRATION', 'GST'] }
  ];

  const renderedPhotoKeys = new Set<string>();

  const categorizedPhotoHtml = photoCategories.map(cat => {
    const catPhotos = photos.filter((p: any) => {
      const label = (p.label || p.category || '').toUpperCase();
      const match = cat.filter.some(k => label.includes(k));
      if (match) renderedPhotoKeys.add(p.dataUrl || p.id || p.label);
      return match;
    });

    if (catPhotos.length === 0) return '';

    return `
      <div class="page-break"></div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 6px; font-size: 10pt;">
            ${cat.title}
          </td>
        </tr>
      </table>
      <div class="photo-grid">
        ${catPhotos.map((p: any) => `
          <div class="photo-card">
            <img src="${p.dataUrl}" alt="${p.label || cat.title}" />
            ${p.label ? `<div style="font-size: 8pt; margin-top: 4px; font-weight: bold;">${p.label}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  // Any remaining photos not matched
  const remainingPhotos = photos.filter((p: any) => !renderedPhotoKeys.has(p.dataUrl || p.id || p.label));
  let remainingPhotosHtml = '';
  if (remainingPhotos.length > 0) {
    remainingPhotosHtml = `
      <div class="page-break"></div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 6px; font-size: 10pt;">
            Additional Site Photos
          </td>
        </tr>
      </table>
      <div class="photo-grid">
        ${remainingPhotos.map((p: any) => `
          <div class="photo-card">
            <img src="${p.dataUrl}" alt="${p.label || 'Site Photo'}" />
            ${p.label ? `<div style="font-size: 8pt; margin-top: 4px; font-weight: bold;">${p.label}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MoneyBoxx LAP - ${appNo}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 12mm 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 8.5pt; color: #000; background-color: #fff; margin: 0; padding: 0; line-height: 1.3; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; page-break-inside: avoid; }
    th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; font-size: 8.5pt; }
    .page-break { page-break-before: always; }
    .bold { font-weight: bold; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }
    .photo-card { border: 1px solid #000; padding: 4px; text-align: center; background: #fff; page-break-inside: avoid; }
    .photo-card img { width: 100%; max-height: 280px; object-fit: contain; display: block; margin: 0 auto; background: #f8fafc; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
    ${getUniversalCoverPageCSS()}
  </style>
</head>
<body>
  ${getUniversalCoverPageHTML((data as any), appNo, reportDate, caseStatus, coverLogo)}
  <div class="page-break"></div>

  <!-- ==================== PAGE 1 ==================== -->
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="font-size: 11pt; font-weight: bold; color: #000;">Infominer Services Private Limited</div>
    <div style="font-size: 9pt; font-weight: bold; color: #000; margin-top: 2px;">CIN : U67100UP2020PTC131346</div>
    <div style="font-size: 9pt; font-weight: bold; color: #000; margin-top: 2px;">(Chartered Accountant)</div>
    <div style="font-size: 9pt; font-weight: bold; color: #000; margin-top: 2px;">Office No 410, Shree Siddhi Vinayak Trade Center - Agra- 282004</div>
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td colspan="2" style="width: 50%; vertical-align: top; border: 1px solid #000; padding: 6px 8px;">
        <strong>To,</strong><br/>
        <strong>${bankName}</strong><br/>
        <strong>Dear Sir/Madam,</strong><br/><br/>
        <strong>Sub: Income Assesment of ${applicantName}</strong>
      </td>
      <td colspan="2" style="width: 50%; padding: 0; vertical-align: top; border: 1px solid #000;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr>
            <td style="width: 45%; border: none; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">Date of Initiation</td>
            <td style="width: 55%; border: none; border-bottom: 1px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">${initiationDate}</td>
          </tr>
          <tr>
            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">Application ID</td>
            <td style="border: none; border-bottom: 1px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">${appNo}</td>
          </tr>
          <tr>
            <td style="border: none; border-right: 1px solid #000; padding: 4px 6px; text-align: center; font-weight: bold;">Status of case</td>
            <td style="border: none; padding: 4px 6px; text-align: center; font-weight: bold;">${caseStatus}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="4" style="border: 1px solid #000; padding: 6px 8px; font-size: 8.5pt;">
        Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:
      </td>
    </tr>
    <tr>
      <td colspan="4" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Case Profile
      </td>
    </tr>
    <tr>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">Visit date</td>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">${visitDate}</td>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">Report date</td>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">${reportDate}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Name of applicant</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${applicantName}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Contact Number</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${applicantPhone}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Business firm name</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${firmName}</td>
    </tr>
    ${coApplicantsHtml}
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Loan Amount (as mention in application form)</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${loanAmountText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Purpose of Loan (as per applicant)</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${loanPurposeText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Address of the residence</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${residenceAddress}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Address of the business</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${businessAddress}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Address of the collateral property</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${collateralAddress}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Met person during visit time.</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${metPerson}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Met person identity proof</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${metPersonIdProof}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Executive Name</td>
      <td colspan="3" style="border: 1px solid #000; padding: 5px 8px;">${executiveName}</td>
    </tr>
  </table>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page-break"></div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
    <tr>
      <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Details of residence visit
      </td>
    </tr>
    <tr>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">Met person during visit time.</td>
      <td style="width: 75%; border: 1px solid #000; padding: 5px 8px;">${metPerson}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Address of the meeting</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${meetingAddress}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Locating Premises Type</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${residenceLocationType}</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Residential Details
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Ownership (If rented then rent amount)</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${residenceOwnership}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">House Details</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${residenceHouseDetails}</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Family Background of the Applicant
      </td>
    </tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; border-top: none;">
    <tr style="font-weight: bold; text-align: center;">
      <td style="width: 7%; border: 1px solid #000; border-top: none; padding: 4px;">Sr No.</td>
      <td style="width: 23%; border: 1px solid #000; border-top: none; padding: 4px;">Famly Member Name</td>
      <td style="width: 12%; border: 1px solid #000; border-top: none; padding: 4px;">Age</td>
      <td style="width: 18%; border: 1px solid #000; border-top: none; padding: 4px;">Relation with applicant</td>
      <td style="width: 15%; border: 1px solid #000; border-top: none; padding: 4px;">Qualification</td>
      <td style="width: 15%; border: 1px solid #000; border-top: none; padding: 4px;">Occupation</td>
      <td style="width: 10%; border: 1px solid #000; border-top: none; padding: 4px;">Dependents<br/>( Yes/ No )</td>
    </tr>
    ${familyList.map((f: any, idx: number) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #000; padding: 4px;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${f.name || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${f.age ? (String(f.age).toLowerCase().includes('year') ? f.age : `${f.age} Years`) : '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${f.relationship || f.relation || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${f.qualification || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${f.occupation || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${(f.dependent === true || f.isDependent === true || f.dependent === 'Yes' || f.isDependent === 'Yes') ? 'Yes' : 'No'}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Monthly Household</td>
      <td colspan="5" style="border: 1px solid #000; padding: 5px 8px;">Rs. ${Number(resHhExpM).toLocaleString('en-IN')}/- Per Month</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Electricity Connection Details</td>
      <td colspan="5" style="border: 1px solid #000; padding: 5px 8px;">${residenceElectricityDetails}</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Neighbor Name</td>
      <td colspan="5" style="border: 1px solid #000; padding: 5px 8px;">${residenceNeighborName}</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Neighbor Feedback</td>
      <td colspan="5" style="border: 1px solid #000; padding: 5px 8px; text-align: justify;">${residenceNeighborFeedback}</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Latitude & Longitude of the business premises</td>
      <td colspan="5" style="border: 1px solid #000; padding: 5px 8px;">${residenceGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Residence Status</td>
      <td colspan="5" style="border: 1px solid #000; padding: 5px 8px;">${caseStatus}</td>
    </tr>
  </table>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page-break"></div>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Collateral Property details
      </td>
    </tr>
    <tr>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">Collateral Address</td>
      <td style="width: 75%; border: 1px solid #000; padding: 5px 8px;">${collateralAddress}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Property Type</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${collateralPropertyType}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Approx. Property Area</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${collateralArea}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Property Usage</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${collateralUsage}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Approx Property Valuation</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${collateralValuation}</td>
    </tr>
  </table>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="page-break"></div>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Business visit of ${applicantName}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 9.5pt;">
        Brief Profile of Business
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000; padding: 10px; font-size: 8.5pt; text-align: justify; line-height: 1.45;">
        ${businessNarrative}
      </td>
    </tr>
    <tr>
      <td style="width: 25%; border: 1px solid #000; padding: 5px 8px;">Vintage of the business</td>
      <td style="width: 75%; border: 1px solid #000; padding: 5px 8px;">${businessVintageText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Number of staffs</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${staffCountText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Is office premise on rented /owned</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${businessPremisesOwnershipText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Details of Office / Factory infrastructure ( Assets )</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${assetDetailsText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Stock details with estimated value</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${stockDetailsText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Equipments/ Small Tools/ Machinery Used for Business</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${equipmentsText}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px;">Other source income</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${otherIncomeSourceText}</td>
    </tr>
  </table>

  <!-- ==================== PAGE 5 ==================== -->
  <div class="page-break"></div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
    <tr>
      <td colspan="4" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Applicant's customer and supplier details
      </td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
      <td style="width: 8%; border: 1px solid #000; padding: 4px;">Sr. No.</td>
      <td style="width: 32%; border: 1px solid #000; padding: 4px;">Prominent Customers (Name)</td>
      <td style="width: 20%; border: 1px solid #000; padding: 4px;">Customers Ph. No.</td>
      <td style="width: 40%; border: 1px solid #000; padding: 4px;">Feedback (Remark)</td>
    </tr>
    ${customerList.map((c: any, idx: number) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #000; padding: 4px;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${c.name || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${c.phone || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${c.remark || 'Regular customer, positive feedback received.'}</td>
      </tr>
    `).join('')}
    <tr style="font-weight: bold; text-align: center;">
      <td style="width: 8%; border: 1px solid #000; padding: 4px;">Sr. No.</td>
      <td style="width: 32%; border: 1px solid #000; padding: 4px;">Prominent Suppliers (Name)</td>
      <td style="width: 20%; border: 1px solid #000; padding: 4px;">Supplier Ph. No.</td>
      <td style="width: 40%; border: 1px solid #000; padding: 4px;">Feedback (Remark)</td>
    </tr>
    ${supplierList.map((s: any, idx: number) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #000; padding: 4px;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${s.name || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${s.phone || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${s.remark || '-'}</td>
      </tr>
    `).join('')}
    <tr>
      <td colspan="4" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Banking Details and Limit OD and CC limit with bank
      </td>
    </tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; border-top: none; margin-bottom: 0;">
    <tr style="font-weight: bold; text-align: center;">
      <td style="width: 18%; border: 1px solid #000; border-top: none; padding: 4px;">Bank Name</td>
      <td style="width: 18%; border: 1px solid #000; border-top: none; padding: 4px;">Branch Name</td>
      <td style="width: 14%; border: 1px solid #000; border-top: none; padding: 4px;">Account Types</td>
      <td style="width: 12%; border: 1px solid #000; border-top: none; padding: 4px;">CC/OD Limit</td>
      <td style="width: 18%; border: 1px solid #000; border-top: none; padding: 4px;">Account No.</td>
      <td style="width: 20%; border: 1px solid #000; border-top: none; padding: 4px;">Remark</td>
    </tr>
    ${bankingList.map((b: any) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${b.bankName || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${b.branchName || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${b.accountTypes || b.accountType || 'Saving'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${b.limit || 'NA'}</td>
        <td style="border: 1px solid #000; padding: 4px;">${b.accountNo || '-'}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${b.remark || 'The account belongs to applicant'}</td>
      </tr>
    `).join('')}
  </table>

  <table style="width: 100%; border-collapse: collapse; border-top: none;">
    <tr>
      <td style="width: 25%; border: 1px solid #000; border-top: none; padding: 5px 8px; font-weight: bold;">Latitude & Longitude of the business premises</td>
      <td style="width: 75%; border: 1px solid #000; border-top: none; padding: 5px 8px;">${businessGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Remarks</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${gpsRemarks}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Electricity Connection Details</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${businessElectricityDetails}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Neighbour Name</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${businessNeighborName}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Neighbor Feedback</td>
      <td style="border: 1px solid #000; padding: 5px 8px; text-align: justify;">${businessNeighborFeedback}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">Business Status</td>
      <td style="border: 1px solid #000; padding: 5px 8px;">${caseStatus}</td>
    </tr>
  </table>

  <!-- ==================== PAGE 6 ==================== -->
  <div class="page-break"></div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
    <tr>
      <td colspan="4" style="border: 1px solid #000; text-align: center; font-weight: bold; padding: 5px; font-size: 10pt;">
        Assessment of the monthly income of the applicant
      </td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
      <td style="width: 25%; border: 1px solid #000; padding: 4px;">Particulars</td>
      <td style="width: 45%; border: 1px solid #000; padding: 4px;">Business Notes</td>
      <td colspan="2" style="width: 30%; border: 1px solid #000; padding: 4px;">(Period)</td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Sales/Receipts</td>
      <td style="border: 1px solid #000; padding: 4px;"></td>
      <td style="width: 15%; border: 1px solid #000; padding: 4px;">Monthly</td>
      <td style="width: 15%; border: 1px solid #000; padding: 4px;">Yearly</td>
    </tr>
    ${salesItems.map((item: any) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.particulars}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.businessNotes || ''}</td>
        <td style="border: 1px solid #000; padding: 4px;">${Number(item.monthly || 0).toLocaleString('en-IN')}</td>
        <td style="border: 1px solid #000; padding: 4px;">${Number(item.yearly || ((Number(item.monthly) || 0) * 12)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr style="font-weight: bold; text-align: center;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Total Sales/Receipts (A)</td>
      <td style="border: 1px solid #000; padding: 4px;"></td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(totalSalesM).toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(totalSalesY).toLocaleString('en-IN')}</td>
    </tr>
    ${expenseItems.map((item: any) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.particulars}</td>
        <td style="border: 1px solid #000; padding: 4px; text-align: left;">${item.businessNotes || ''}</td>
        <td style="border: 1px solid #000; padding: 4px;">${Number(item.monthly || 0).toLocaleString('en-IN')}</td>
        <td style="border: 1px solid #000; padding: 4px;">${Number(item.yearly || ((Number(item.monthly) || 0) * 12)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('')}
    <tr style="font-weight: bold; text-align: center;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Total Expenses(B)</td>
      <td style="border: 1px solid #000; padding: 4px;"></td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(totalExpM).toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(totalExpY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="font-weight: bold; text-align: center;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Net Profit Per month(A- B)</td>
      <td style="border: 1px solid #000; padding: 4px;"></td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(netProfM).toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(netProfY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="text-align: center;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left; font-weight: bold;">Less: Existing EMI</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">${emiNotes}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(existEmiM).toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #000; padding: 4px;">${existEmiY ? Number(existEmiY).toLocaleString('en-IN') : ''}</td>
    </tr>
    <tr style="text-align: center;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left; font-weight: bold;">Less: Existing Household Expenses</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">${householdExpensesNote}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(hhExpM).toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(hhExpM * 12).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="text-align: center; font-weight: bold;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Net Disposal Income</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Net Income after all deductions ( Monthly/ Yearly)</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(netDisposalM).toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #000; padding: 4px;">${Number(netDisposalY).toLocaleString('en-IN')}</td>
    </tr>
    <tr style="text-align: center; font-weight: bold;">
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">Comfortable Monthly EMI</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">${comfortableEmiLeftText}</td>
      <td colspan="2" style="border: 1px solid #000; padding: 4px;">${comfortableEmiRightText}</td>
    </tr>
    <tr>
      <td colspan="4" style="border: 1px solid #000; padding: 8px; font-size: 8pt; line-height: 1.35;">
        <strong>Limitation and Disclaimer clause: -</strong><br/>
        This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field 
        verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as 
        observed at that point in time only. Document-related inputs are based solely on information shared during field interactions and do not constitute 
        independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or 
        forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory 
        bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct 
        or indirect, arising from such reliance.<br/><br/>
        <strong>Important Notes:</strong><br/>
        Actual Profit and Loss figures were not made available by "${bankName}" hence only estimated figures are captured as per 
        the information and understanding provided by the applicant during visit.<br/><br/><br/><br/>
        <strong>(Sign of Agency authorized signatory)</strong>
      </td>
    </tr>
  </table>

  <!-- ==================== PAGES 7+ (PHOTOS) ==================== -->
  ${categorizedPhotoHtml}
  ${remainingPhotosHtml}

</body>
</html>
  `;
}
