const fs = require('fs');
let content = fs.readFileSync('src/utils/pdReportPrinter.ts', 'utf8');

const targetStr = `          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <td style="border: 1px solid #000; padding: 2px;">#</td>
            <td style="border: 1px solid #000; padding: 2px;">Borrower</td>
            <td style="border: 1px solid #000; padding: 2px;">Facility Type</td>
            <td style="border: 1px solid #000; padding: 2px;">Lending Inst.</td>
            <td style="border: 1px solid #000; padding: 2px;">Category</td>
            <td style="border: 1px solid #000; padding: 2px;">Status</td>
            <td style="border: 1px solid #000; padding: 2px;">Disbursed Date</td>
            <td style="border: 1px solid #000; padding: 2px;">Disbursed Amt</td>
            <td style="border: 1px solid #000; padding: 2px;">Current Balance</td>
            <td style="border: 1px solid #000; padding: 2px;">Overdue Amt</td>
            <td style="border: 1px solid #000; padding: 2px;">EMI</td>
            <td style="border: 1px solid #000; padding: 2px;">Tenure</td>
            <td style="border: 1px solid #000; padding: 2px;">ROI</td>
            <td style="border: 1px solid #000; padding: 2px;">Last Paid</td>
            <td style="border: 1px solid #000; padding: 2px;">As On</td>
          </tr>
          \${data.parsedCreditReport.accounts.map((acc: any, index: number) => \`
            <tr>
              <td style="border: 1px solid #000; padding: 2px; text-align: center;">\${index + 1}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.applicantName || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.accountType || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.creditGrantor || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.lenderType || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px; color: \${acc.status === 'Active' ? '#16a34a' : '#64748b'};">\${acc.status || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.disbursedDate || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹\${acc.disbursedAmount?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹\${acc.currentBalance?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right; color: \${acc.overdueAmount > 0 ? '#dc2626' : 'inherit'};">₹\${acc.overdueAmount?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹\${acc.instalmentAmount?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: center;">\${acc.tenureMonths || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: center;">\${acc.interestRate ? acc.interestRate + '%' : '—'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.lastPaymentDate || '—'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.asOnDate || '—'}</td>
            </tr>
          \`).join('')}`;

const replaceStr = `          <tr style="background-color: #2d3e50; color: #ffffff; font-weight: bold; text-align: left; text-transform: uppercase;">
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
          \${data.parsedCreditReport.accounts.map((acc: any, index: number) => {
            const isOverdue = (acc.overdueAmount || 0) > 0;
            const bgClass = isOverdue ? '#fef2f2' : (index % 2 === 1 ? '#fcfcfd' : '#ffffff');
            const isActive = acc.status === 'Active';
            
            return \`
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
            \`;
          }).join('')}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/utils/pdReportPrinter.ts', content, 'utf8');
  console.log('Successfully applied exact styling.');
} else {
  console.error('Target string not found!');
  process.exit(1);
}
