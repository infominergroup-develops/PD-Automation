const fs = require('fs');
let content = fs.readFileSync('src/utils/pdReportPrinter.ts', 'utf8');

const anchorStr = `        \${data.parsedCreditReport.flags && data.parsedCreditReport.flags.length > 0 ? data.parsedCreditReport.flags.join('<br/>') : 'No negative flags detected.'}
      </td>
    </tr>`;

const replacementTable = `
    \${data.parsedCreditReport.accounts && data.parsedCreditReport.accounts.length > 0 ? \`
    <tr>
      <td colspan="7" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse; border: none; font-size: 8px;">
          <tr style="background-color: #2d3e50; color: #ffffff; font-weight: bold; text-align: left; text-transform: uppercase;">
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center;">#</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">Borrower</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">Facility Type</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">Lending Inst.</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">Category</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center;">Status</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">Disbursed Date</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right;">Disbursed Amt</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right;">Current Balance</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right;">Overdue Amt</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right;">EMI</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center;">Tenure</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center;">ROI</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">Last Paid</td>
            <td style="border: 1px solid #e2e8f0; padding: 4px;">As On</td>
          </tr>
          \${\`\${data.parsedCreditReport.accounts.map((acc: any, index: number) => {
            const isOverdue = (acc.overdueAmount || 0) > 0;
            const bgClass = isOverdue ? '#fef2f2' : (index % 2 === 1 ? '#fcfcfd' : '#ffffff');
            const isActive = acc.status === 'Active';
            
            return \\\`
              <tr style="background-color: \${bgClass};">
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center; color: #94a3b8; font-weight: bold;">\${index + 1}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; font-weight: bold; color: #1e293b;">\${acc.applicantName || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; font-weight: bold; color: #2d3e50;">\${acc.accountType || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; font-weight: bold; color: #2d3e50;">\${acc.creditGrantor || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #475569; font-weight: bold; font-size: 6px;">\${acc.lenderType || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center; font-weight: bold; color: \${isActive ? '#16a34a' : (acc.status === 'Closed' ? '#64748b' : '#2d3e50')};">\${acc.status || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #475569;">\${acc.disbursedDate || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right; color: #475569;">\${acc.disbursedAmount ? '₹' + acc.disbursedAmount.toLocaleString('en-IN') : '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right; font-weight: bold; color: #1e293b;">\${acc.currentBalance ? '₹' + acc.currentBalance.toLocaleString('en-IN') : '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right; font-weight: bold; color: \${isOverdue ? '#dc2626' : '#1e293b'};">\${acc.overdueAmount ? '₹' + acc.overdueAmount.toLocaleString('en-IN') : '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: right; color: #475569;">\${acc.instalmentAmount ? '₹' + acc.instalmentAmount.toLocaleString('en-IN') : '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center; color: #475569;">\${acc.tenureMonths ? acc.tenureMonths + 'M' : '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; text-align: center; color: #475569;">\${acc.interestRate ? acc.interestRate + '%' : '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #475569;">\${acc.lastPaymentDate || '—'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #475569;">\${acc.asOnDate || '—'}</td>
              </tr>
            \\\`;
          }).join('')}\`}
        </table>
      </td>
    </tr>
    \` : ''}`;

// We only want to inject this in the generateMoneyboxxPDReportHTML function.
// Let's find the position.
const parts = content.split('export function generateMoneyboxxPDReportHTML');
if (parts.length === 2) {
  let moneyboxxBody = parts[1];
  
  if (moneyboxxBody.includes(anchorStr) && !moneyboxxBody.includes('acc.lastPaymentDate')) {
    moneyboxxBody = moneyboxxBody.replace(anchorStr, anchorStr + replacementTable);
    content = parts[0] + 'export function generateMoneyboxxPDReportHTML' + moneyboxxBody;
    fs.writeFileSync('src/utils/pdReportPrinter.ts', content, 'utf8');
    console.log('Successfully injected table to Moneyboxx template');
  } else {
    console.error('Could not find anchor or table already exists in Moneyboxx template');
    process.exit(1);
  }
} else {
  console.error('Could not find generateMoneyboxxPDReportHTML function');
  process.exit(1);
}
