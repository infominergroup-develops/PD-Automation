import { describe, expect, it } from 'vitest';
import { getReportHTMLForData, type PDReportPrintData } from '../src/utils/pdReportPrinter';
import { generateIndusIndPDReportHTML } from '../src/utils/templates/indusindTemplate';
import { INDUSIND_DEFAULTS } from '../src/components/pd/indusind/useIndusIndDetails';
import { formProfileFor } from '../src/components/pd/formProfiles';

const text = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const report = {
  clientBankName: 'IndusInd Bank Limited',
  applicationNumber: 'APS123',
  statusOfCase: 'Recommended',
  reportDate: '2023-05-20',
  visitDate: '2023-05-19',
  applicantName: 'Mr. Rahul Goel',
  firmName: 'M/S Goel Packaging',
  totalSalesMonthly: 260000,
  totalSalesYearly: 3120000,
  workingDays: 26,
  familyMembers: [
    { name: 'Rahul', age: 34, relationship: 'Self', occupation: 'Business', isDependent: false },
    { name: 'Kamla', age: 58, relationship: 'Mother', occupation: 'Housewife', isDependent: true },
  ],
  indusInd: { ...INDUSIND_DEFAULTS, branchName: 'Lucknow', signBoard: 'Yes', grossMarginPct: '8', netMarginPct: '5' },
} as unknown as PDReportPrintData;

describe('IndusInd Bank report', () => {
  const t = text(generateIndusIndPDReportHTML(report));

  it('is chosen for the IndusInd client only', () => {
    expect(getReportHTMLForData(report)).toContain('IndusInd Bank Limited');
    expect(getReportHTMLForData({ ...report, clientBankName: 'Ambit Finvest' })).not.toContain('Credit Manager,');
  });

  it('prints the header block and dates as dd/mm/yyyy', () => {
    expect(t).toContain('Infominer Services Pvt Ltd');
    expect(t).toContain('Date of Issue 20/05/2023');
    expect(t).toContain('APS No APS123');
    expect(t).toContain('Status of PD Recommended');
    expect(t).toContain('Date of meeting 19/05/2023');
    expect(t).toContain('Branch Name Lucknow');
  });

  it('derives turnover, daily cash flow, sign board and margins', () => {
    expect(t).toContain('Approximately Annual gross turnover of the business is Rs. 31,20,000/-.');
    expect(t).toContain('Average daily Cash Inflow is Rs. 10,000/-'); // 2,60,000 ÷ 26
    expect(t).toContain('There is sign board available at the visited address with name of M/S Goel Packaging');
    expect(t).toMatch(/Gross Margin % 8%.*Net Margin % 5%/);
  });

  it('summarises the family and lists placeholder loan types when there are no loans', () => {
    expect(t).toContain('Total Family Member Is - 2');
    expect(t).toContain('(Applicant, Mother)');
    expect(t).toContain('Earning Member Is - 1');
    for (const type of ['BL', 'AL', 'PL', 'HL']) expect(t).toContain(` ${type} `);
  });

  it('switches the letterhead for Mahesh & Company and escapes typed text', () => {
    const html = generateIndusIndPDReportHTML({
      ...report,
      companyHeader: { id: 'mahesh', name: 'Mahesh & Company', address: 'Agra', cin: '', designation: '' },
      firmName: '<b>X</b>',
    } as PDReportPrintData);
    expect(html).toContain('Mahesh &amp; Company');
    expect(html).not.toContain('<b>X</b>');
  });

  it('has its own form profile with the IndusInd panel', () => {
    const show = formProfileFor('indusind').sections;
    expect(show.indusindPanel && show.partnersAndSharing && show.businessProofDetails).toBe(true);
    expect(formProfileFor('ambit').sections.indusindPanel).toBe(false);
  });
});
