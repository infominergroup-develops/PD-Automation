const fs = require('fs');
let content = fs.readFileSync('src/utils/pdReportPrinter.ts', 'utf8');

const targetStr = `          \${data.parsedCreditReport.accounts.map(acc => \`
            <tr>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.creditGrantor || 'null'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.applicantName || 'null'}</td>
              <td style="border: 1px solid #000; padding: 2px;">\${acc.accountType || 'null'}</td>
              <td style="border: 1px solid #000; padding: 2px; color: \${acc.status === 'Active' ? '#16a34a' : '#64748b'};">\${acc.status || 'null'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹\${acc.disbursedAmount?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹\${acc.currentBalance?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right; color: \${acc.overdueAmount > 0 ? '#dc2626' : 'inherit'};">₹\${acc.overdueAmount?.toLocaleString('en-IN') || '0'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: right;">₹\${acc.instalmentAmount?.toLocaleString('en-IN') || '0'}</td>
            </tr>
          \`).join('')}`;

const replaceStr = `          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
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

const tableHeaderRegex = /<tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">\s*<td style="border: 1px solid #000; padding: 2px;">Bank Name<\/td>[\s\S]*?<td style="border: 1px solid #000; padding: 2px;">EMI<\/td>\s*<\/tr>/;

content = content.replace(tableHeaderRegex, '');
content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/utils/pdReportPrinter.ts', content, 'utf8');
console.log('Successfully updated the table');
