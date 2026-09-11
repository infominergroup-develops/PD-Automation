import * as ExcelJS from 'exceljs';
import { parseExcelTemplate } from './api/excelTemplateService.js';
import fs from 'fs';

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
