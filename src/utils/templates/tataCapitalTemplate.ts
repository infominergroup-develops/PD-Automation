import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

export function generateTataCapitalPDReportHTML(data: PDReportPrintData): string {
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
  const familyList = data.familyMembers && data.familyMembers.length > 0 ? data.familyMembers : [{ name: data.applicantName || 'Applicant', relation: 'Self', age: '', occupation: '', dependent: false }];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tata Capital Limited PD Report - ${appNo}</title>
  <style>
    @page { size: A4; margin: 10mm 12mm 10mm 12mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 8.5pt; color: #000; background-color: #fff; margin: 0; padding: 0; line-height: 1.35; }
    .page-break { page-break-before: always; margin-top: 15px; }
    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .report-table th, .report-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
    .hdr-main { text-align: center; background-color: #e2e8f0; padding: 15px; border: 1px solid #000; border-bottom: none; }
    .hdr-title { font-size: 11pt; }
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
    <div>(Chartered Accountant)</div>
    <div>207, Second Floor, Padam Business Park, Sikandara, Agra-282007</div>
    <div>Email: info@mco.net.in</div>
  </div>

  <table class="report-table">
    <tr><td colspan="4" class="text-center">Personal Discussion Report</td></tr>
    <tr><td colspan="4">To,</td></tr>
    <tr>
      <td colspan="2" style="width: 50%;">Tata Capital Limited</td>
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
      <td>${data.statusOfCase || 'Positive'}</td>
    </tr>
    <tr><td colspan="4">Please refer to your instructions on the captioned matter. In this connection, we submit our report as under:</td></tr>
    
    <tr><td colspan="4" class="sec-head">SUMMARY INFORMATION</td></tr>
    <tr>
      <td colspan="2" style="width:50%;">Case visit date</td>
      <td colspan="2" style="padding:0;">
        <table style="width:100%; height:100%; border-collapse:collapse;">
          <tr>
            <td style="width:50%; border:none; border-right:1px solid #000;">${data.visitDate || '-'}</td>
            <td style="width:50%; border:none;" class="sec-head">Report date</td>
            <td style="width:50%; border:none; border-left:1px solid #000;">${data.visitDate || '-'}</td>
          </tr>
        </table>
      </td>
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
    <tr><td colspan="4" style="height: 120px; vertical-align: top;">${data.briefBusinessProfile || 'The applicant deals with approximately 25-30 customers daily in the business.\\n(All the above details are confirm verbally by met person)'}</td></tr>
    
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
      <td colspan="2" class="sec-head" style="width:30%; text-align:left;">Business Proof details (like S & E/GST Certificate/Electricity Bills)</td>
      <td colspan="4" style="width:70%;">Applicant has shared Udyam / GST / Utility bills as proof of business.</td>
    </tr>
    <tr><td colspan="2">Number of staffs</td><td colspan="4">${data.staffCount || 'He is self-employed and operates the business by himself.'}</td></tr>
    <tr><td colspan="2">Details of Office / Factory infrastructure</td><td colspan="4">Desk, chairs, fans, weight scales, furniture racks, and other similar assets were observed in the applicant's business setup.</td></tr>
    <tr><td colspan="2">Other source income</td><td colspan="4">The applicant does not have any other source of income.</td></tr>
    
    <tr class="sec-head">
      <td style="width: 10%;">Sr. No.</td>
      <td style="width: 40%;" colspan="2">Customer Name & City</td>
      <td style="width: 25%;">Contact No.</td>
      <td style="width: 25%;" colspan="2">Feedback and remark</td>
    </tr>
    ${customerList.map((c: any, i: number) => `
    <tr>
      <td>${i+1}</td>
      <td colspan="2">${c.name}</td>
      <td>${c.phone}</td>
      <td colspan="2">${c.remark}</td>
    </tr>
    `).join('')}

    <tr class="sec-head">
      <td>Sr. No.</td>
      <td colspan="2">Supplier Name & City</td>
      <td>Contact No.</td>
      <td colspan="2">Feedback and remark</td>
    </tr>
    ${supplierList.map((s: any, i: number) => `
    <tr>
      <td>${i+1}</td>
      <td colspan="2">${s.name}</td>
      <td>${s.phone}</td>
      <td colspan="2">${s.remark}</td>
    </tr>
    `).join('')}

    <tr><td colspan="6" class="sec-head">Banking Details And Limit OD And CC Limit With Bank</td></tr>
    <tr class="sec-head">
      <td colspan="2">Bank Name</td>
      <td>Bank Branch</td>
      <td>Account Number</td>
      <td>CC/OD Limit</td>
      <td>Remark</td>
    </tr>
    ${bankingList.map((b: any) => `
    <tr class="text-center">
      <td colspan="2">${b.bankName}</td>
      <td>${b.branchName}</td>
      <td>${b.accountNo}</td>
      <td>${b.limit || 'NA'}</td>
      <td>${b.remark}</td>
    </tr>
    `).join('')}

    <tr><td colspan="6" class="sec-head">EXISTING LOANS / LIABILITIES</td></tr>
    <tr class="sec-head">
      <td colspan="2">Type of Loan</td>
      <td>FI Name</td>
      <td>Loan Amount (Lacs)</td>
      <td>EMI</td>
      <td>Tenor (yrs., moths)</td>
    </tr>
    ${loansList.map((l: any) => `
    <tr class="text-center">
      <td colspan="2">${l.typeOfLoan}</td>
      <td>${l.financerName}</td>
      <td>${l.amountInLakhs || 'NA'}</td>
      <td>${l.emi}</td>
      <td>${l.tenure || 'NA'}</td>
    </tr>
    `).join('')}
  </table>

  <table class="report-table">
    <tr class="sec-head">
      <td style="width:40%;">Particulars</td>
      <td style="width:40%;">Applicant</td>
      <td style="width:20%;">Remarks</td>
    </tr>
    <tr>
      <td></td>
      <td>
        <table style="width:100%; border-collapse:collapse; height:100%;">
          <tr>
            <td style="width:50%; border:none; border-right:1px solid #000;">Monthly Income</td>
            <td style="width:50%; border:none;">Yearly Income</td>
          </tr>
        </table>
      </td>
      <td></td>
    </tr>
    <tr>
      <td>Total Sales/Receipts (A)</td>
      <td>
        <table style="width:100%; border-collapse:collapse; height:100%;">
          <tr>
            <td style="width:50%; text-align:center; border:none; border-right:1px solid #000;">${totalSalesM}</td>
            <td style="width:50%; text-align:center; border:none;">${totalSalesY}</td>
          </tr>
        </table>
      </td>
      <td></td>
    </tr>
    <tr style="height:40px;"><td></td><td>
      <table style="width:100%; border-collapse:collapse; height:100%;"><tr><td style="width:50%; border:none; border-right:1px solid #000;"></td><td style="border:none;"></td></tr></table>
    </td><td></td></tr>
    <tr style="height:40px;"><td></td><td>
      <table style="width:100%; border-collapse:collapse; height:100%;"><tr><td style="width:50%; border:none; border-right:1px solid #000;"></td><td style="border:none;"></td></tr></table>
    </td><td></td></tr>
    <tr style="height:40px;"><td></td><td>
      <table style="width:100%; border-collapse:collapse; height:100%;"><tr><td style="width:50%; border:none; border-right:1px solid #000;"></td><td style="border:none;"></td></tr></table>
    </td><td></td></tr>
    <tr>
      <td class="sec-head" style="text-align:left;">Total Expenses (B)</td>
      <td class="sec-head">
        <table style="width:100%; border-collapse:collapse; height:100%;">
          <tr>
            <td style="width:50%; text-align:center; border:none; border-right:1px solid #000;">0</td>
            <td style="width:50%; text-align:center; border:none;">0</td>
          </tr>
        </table>
      </td>
      <td>Total Monthly Expenses</td>
    </tr>
    <tr>
      <td class="sec-head" style="text-align:left;">Net Profit Per month(A- B)</td>
      <td>
        <table style="width:100%; border-collapse:collapse; height:100%;">
          <tr>
            <td style="width:50%; text-align:center; border:none; border-right:1px solid #000;">${netProfM}</td>
            <td style="width:50%; text-align:center; border:none;">${netProfY}</td>
          </tr>
        </table>
      </td>
      <td></td>
    </tr>
  </table>

  <div class="page-break"></div>

  <table class="report-table">
    <tr><td style="width:30%;">Less: Household Expenses</td><td>${hhExpM}</td><td>${hhExpM * 12}</td><td></td></tr>
    <tr><td>Add: Other Source of Income</td><td>0</td><td>0</td><td></td></tr>
    <tr class="sec-head" style="text-align:left;"><td>Net Disposal Income</td><td style="text-align:center;">${netDisposalM}</td><td style="text-align:center;">${netDisposalY}</td><td></td></tr>
    <tr><td>Annual Turnover & Margin</td><td colspan="3">Applicant informed that his yearly turnover Rs. ${Math.round(totalSalesY/100000)} lakh and net profit margin ${Math.round((netProfM/(totalSalesM||1))*100)}%.</td></tr>
    <tr><td>Affordable EMI as per customer requirement</td><td colspan="3">As per branch.</td></tr>

    <tr><td colspan="4" class="sec-head">Residential Details</td></tr>
    <tr><td>House Address</td><td colspan="3">${data.residenceAddress || '-'}</td></tr>
    <tr><td>Locality (Posh area/Slum/UMC/LMC)</td><td colspan="3">UMC</td></tr>
    <tr><td>Ownership of premises</td><td colspan="3">${data.residenceOwnership || '-'}</td></tr>
    <tr><td>Area & Market Value</td><td colspan="3">${data.residenceMarketValue || '-'}</td></tr>
    <tr><td>Family Background</td><td colspan="3">Total Family members- ${data.familyMembers?.length || 0}</td></tr>
  </table>

  <table class="report-table">
    <tr><td colspan="6" class="sec-head">Family Details</td></tr>
    <tr class="sec-head">
      <td>S.No</td>
      <td>Members Name</td>
      <td>Relation</td>
      <td>Age</td>
      <td>Occupation</td>
      <td>Staying with Applicant or Not</td>
    </tr>
    ${familyList.map((f: any, i: number) => `
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
      <td class="sec-head" style="width:25%; text-align:left;">Strength</td>
      <td>
        1. The Applicant has been running this business under the name ${data.firmName || '-'} for the last ${data.businessVintage || '-'} years.<br/>
        2. The applicant was available at the time of verification and provided all details.<br/>
        3. During the visit, the applicant's business activity was observed.<br/>
      </td>
    </tr>
    <tr>
      <td class="sec-head" style="text-align:left;">Weakness</td>
      <td>
        1. Standard business risks apply.
      </td>
    </tr>
    <tr>
      <td class="sec-head" style="text-align:left;">Latitude & Longitude of the business premises</td>
      <td>${data.businessGpsCoords || '-'}</td>
    </tr>
    <tr>
      <td class="sec-head" style="text-align:left;">Case Status</td>
      <td class="bold">${data.statusOfCase || 'Positive'}</td>
    </tr>
    <tr>
      <td class="sec-head" style="text-align:left;">Reported By</td>
      <td>${data.executiveName || 'Verification Officer'}</td>
    </tr>
    <tr>
      <td class="sec-head" style="text-align:left;">• Distance from Tata Capital Office (In Km’s):</td>
      <td>${data.tataCapitalDistance || '5-10 Km (Approx)'}</td>
    </tr>
    <tr>
      <td colspan="2" style="font-size:8pt; text-align:justify; color:#555; background-color:#e2e8f0;">
        <span style="text-decoration: underline; font-weight: bold; color: #000;">Disclamer :-</span><br/>
        This report is prepared exclusively for the internal risk assessment purposes of the recipient institution. The findings are based on limited field verification, comprising site visits, on-ground observations, and verbal interactions with personnel available at the time of visit, and reflect conditions as observed at that point in time only. Document related inputs are based solely on information shared during field interactions and do not constitute independent authentication or forensic validation by any issuing or competent authority. This report does not constitute an audit, legal investigation, or forensic activity and shall not be treated as legal evidence or relied upon by any external party, including law enforcement agencies, courts, or regulatory bodies. Any reliance placed on this report shall be strictly at the sole risk of the recipient. The issuing entity expressly disclaims all consequences, direct or indirect, arising from such reliance.
      </td>
    </tr>
  </table>
  
  <div class="page-break"></div>

  <table class="report-table" style="border:none;">
    <tr><td style="height: 100px; border:none; border-bottom:1px solid #000; width: 300px; padding:0; vertical-align:top; background-color:#e2e8f0;">
      <span style="font-size:8pt; padding:5px; display:block;">Authorized Signature</span>
    </td>
    <td style="border:none;"></td></tr>
  </table>

  ${photosHtml}

</body>
</html>
  `;
}
