const fs = require('fs');
const path = require('path');

const tataFile = path.join(__dirname, 'src', 'utils', 'templates', 'tataCapitalTemplate.ts');
const sbfcFile = path.join(__dirname, 'src', 'utils', 'templates', 'sbfcTemplate.ts');

let content = fs.readFileSync(tataFile, 'utf8');

// Replace function name
content = content.replace(/generateTataCapitalPDReportHTML/g, 'generateSbfcPDReportHTML');

// Replace Tata Capital Limited with SBFC Finance LTD
content = content.replace(/Tata Capital Limited/g, "${data.clientBankName || 'SBFC Finance LTD'}");

// Replace Tata Capital Office with SBFC Office
content = content.replace(/Tata Capital Office/g, "${data.clientBankName || 'SBFC Finance LTD'} Office");

fs.writeFileSync(sbfcFile, content, 'utf8');
console.log('Successfully copied format from Tata to SBFC');
