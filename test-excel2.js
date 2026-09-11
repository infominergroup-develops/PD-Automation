import { parseExcelTemplate } from './api/excelTemplateService.js';
import * as ExceljsModule from 'exceljs';
const ExcelJS = (ExceljsModule.default || ExceljsModule);

async function run() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  sheet.addRow(['Name', '{{ApplicantName}}']);
  sheet.addRow(['Income', '{{MonthlyIncome}}']);
  const buffer = await workbook.xlsx.writeBuffer();
  
  const tags = await parseExcelTemplate(buffer);
  console.log('Tags found:', tags);
}
run().catch(console.error);
