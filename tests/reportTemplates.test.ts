import { describe, expect, it } from 'vitest';
import { isProvided, toReportContacts, type PDReportPrintData } from '../src/utils/pdReportPrinter';
import { generateAbhiyanPDReportHTML, generateAmbitPDReportHTML } from '../src/utils/templates/abhiyanTemplate';
import { generateGodrejPDReportHTML } from '../src/utils/templates/godrejTemplate';
import { generateMoneyboxxLapPDReportHTML } from '../src/utils/templates/moneyboxxLapTemplate';
import { generateMoneyboxxPDReportHTML } from '../src/utils/templates/moneyboxxTemplate';
import { generateSbfcPDReportHTML, generateTataCapitalPDReportHTML } from '../src/utils/templates/sbfcTemplate';
import { generateStandardPDReportHTML } from '../src/utils/templates/standardTemplate';

const TEMPLATES: Record<string, (data: PDReportPrintData) => string> = {
  standard: generateStandardPDReportHTML,
  abhiyan: generateAbhiyanPDReportHTML,
  ambit: generateAmbitPDReportHTML,
  godrej: generateGodrejPDReportHTML,
  moneyboxx: generateMoneyboxxPDReportHTML,
  moneyboxxLap: generateMoneyboxxLapPDReportHTML,
  sbfc: generateSbfcPDReportHTML,
  tata: generateTataCapitalPDReportHTML,
};

const minimalReport = { applicantName: 'Asha Verma' } as PDReportPrintData;

const fullReport = {
  companyHeader: { name: 'Infominers', cin: 'U00000UP2020PTC000000', designation: 'Risk Advisors', address: 'Agra' },
  clientBankName: 'Test Bank',
  applicationNumber: 'APP-2026-001',
  statusOfCase: 'Positive',
  visitDate: '01-10-2026',
  reportDate: '02-10-2026',
  applicantName: 'Asha Verma',
  applicantPhone: '9876543210',
  firmName: 'Verma General Store',
  coApplicants: [],
  executiveName: 'Ravi Kumar',
  reportedBy: 'Harry',
  staffCount: '2 external staff/labour engaged. Business operations are managed by Applicant, Son.',
  prominentCustomers: [{ name: 'Sharma Traders', phone: '9999999999', remark: 'Regular buyer, pays on time' }],
  prominentSuppliers: [{ name: 'Gupta Wholesale', phone: '8888888888', remark: 'Supplies monthly on credit' }],
} as unknown as PDReportPrintData;

/** Rendered HTML reduced to its visible text, so assertions don't depend on markup. */
const visibleText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

describe.each(Object.entries(TEMPLATES))('%s report template', (_name, generate) => {
  it('renders with only the required fields', () => {
    expect(() => generate(minimalReport)).not.toThrow();
  });

  it('never prints placeholder artefacts from missing data', () => {
    for (const data of [minimalReport, fullReport]) {
      const text = visibleText(generate(data));
      expect(text).not.toMatch(/\bundefined\b|\bNaN\b|\[object Object\]/);
    }
  });

  it('includes the applicant and the prominent customer', () => {
    const text = visibleText(generate(fullReport));
    expect(text).toContain('Asha Verma');
    expect(text).toContain('Sharma Traders');
  });
});

// Godrej's buyer/supplier table has no remark column, so it is left out here
describe.each(Object.entries(TEMPLATES).filter(([name]) => name !== 'godrej'))(
  '%s report template',
  (_name, generate) => {
    it('prints the prominent customer remark', () => {
      expect(visibleText(generate(fullReport))).toContain('Regular buyer, pays on time');
    });
  },
);

describe('Tata Capital / SBFC report', () => {
  it.each([
    ['tata', generateTataCapitalPDReportHTML],
    ['sbfc', generateSbfcPDReportHTML],
  ])('%s prints case status, Reported By and Executive Name separately', (_name, generate) => {
    const text = visibleText(generate({ ...fullReport, statusOfCase: 'Refer to Credit' }));
    expect(text).toContain('Case Status Refer to Credit');
    expect(text).toContain('Reported By Harry');
    expect(text).toContain('Executive Name Ravi Kumar');
  });
});

describe('Moneyboxx LAP report', () => {
  it('prints the staff summary sentence from the form', () => {
    expect(visibleText(generateMoneyboxxLapPDReportHTML(fullReport))).toContain(
      'Number of staffs 2 external staff/labour engaged. Business operations are managed by Applicant, Son.',
    );
  });

  it('describes a bare staff number as a sentence', () => {
    const text = visibleText(generateMoneyboxxLapPDReportHTML({ ...fullReport, staffCount: '4' }));
    expect(text).toContain('The business employs 4 staff members.');
  });
});

describe('toReportContacts', () => {
  it('carries the form feedback into the report remark and drops blank rows', () => {
    expect(
      toReportContacts([
        { name: 'Sharma Traders', phone: '9999999999', feedback: 'Pays on time' },
        { name: 'Old Record', remark: 'Saved before the rename' },
        { name: '  ', phone: '1', feedback: 'blank name' },
      ]),
    ).toEqual([
      { name: 'Sharma Traders', phone: '9999999999', remark: 'Pays on time' },
      { name: 'Old Record', phone: '', remark: 'Saved before the rename' },
    ]);
  });
});

describe('isProvided', () => {
  it.each([
    ['Shop meter in applicant name', true],
    ['Not provided', false],
    ['  ', false],
    [undefined, false],
    [null, false],
  ])('%j → %s', (value, expected) => {
    expect(isProvided(value)).toBe(expected);
  });
});
