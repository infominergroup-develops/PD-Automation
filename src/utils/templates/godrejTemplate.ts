import { PDReportPrintData } from '../pdReportPrinter';
import { getUniversalCoverPageCSS, getUniversalCoverPageHTML } from '../pdReportPrinter';
import { coverLogoBase64 as coverLogo } from '../../images/logoBase64';

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
    
    ${getUniversalCoverPageCSS()}
  </style>
</head>
<body>
  ${getUniversalCoverPageHTML(data, appNo, reportDate, caseStatus, coverLogo)}

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
    ${data.additionalAddresses && data.additionalAddresses.length > 0 ? data.additionalAddresses.map((addr, idx) => `
    <tr>
      <td class="bg-green">Addl. Address ${idx + 1}</td>
      <td colspan="5">${addr}</td>
    </tr>
    `).join('') : ''}
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