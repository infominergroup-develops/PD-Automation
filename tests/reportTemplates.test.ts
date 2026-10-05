import { describe, expect, it } from 'vitest';
import { describeStaffCount, isProvided, toReportContacts, type PDReportPrintData } from '../src/utils/pdReportPrinter';
import { generateAbhiyanPDReportHTML, generateAmbitPDReportHTML } from '../src/utils/templates/abhiyanTemplate';
import { generateGodrejPDReportHTML } from '../src/utils/templates/godrejTemplate';
import { generateMoneyboxxLapPDReportHTML } from '../src/utils/templates/moneyboxxLapTemplate';
import { generateMoneyboxxPDReportHTML } from '../src/utils/templates/moneyboxxTemplate';
import { generateSbfcPDReportHTML, generateTataCapitalPDReportHTML } from '../src/utils/templates/sbfcTemplate';
import { generateStandardPDReportHTML } from '../src/utils/templates/standardTemplate';
import { coverLogoBase64 } from '../src/images/logoBase64';
import { maheshLogoBase64 } from '../src/images/maheshLogoBase64';

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

describe('describeStaffCount', () => {
  it.each([
    ['2 external staff/labour engaged.', '2 external staff/labour engaged.'],
    ['4', 'The business employs 4 staff members.'],
    [3, 'The business employs 3 staff members.'],
    ['0', 'He is self-employed and operates the business by himself.'],
    ['Not provided', 'He is self-employed and operates the business by himself.'],
    [undefined, 'He is self-employed and operates the business by himself.'],
  ])('%j → %s', (input, expected) => {
    expect(describeStaffCount(input)).toBe(expected);
  });
});

describe('form fields reach the report rows that display them', () => {
  const businessDetails = {
    ...fullReport,
    businessPremiseOwnership: 'Business is being operated from rented premises.',
    factoryInfrastructure: 'The business setup comprises 02 flour mills (10 HP).',
    stockDetailsValue: 'The estimated value of observed stock (wheat) is approximately ₹40000.',
    machineryDetailsText: '02 flour mills and 01 weighing scale.',
    otherSourceIncomeDetails: 'Applicant has other income sources: Rent (₹5,000 Monthly)',
    businessLocationRemarks: 'Coordinates matched the shop front.',
  } as PDReportPrintData;

  it.each([
    ['moneyboxxLap', generateMoneyboxxLapPDReportHTML],
    ['abhiyan', generateAbhiyanPDReportHTML],
  ])('%s prints premises, assets, stock, machinery, other income and GPS remarks', (_name, generate) => {
    const text = visibleText(generate(businessDetails));
    expect(text).toContain('Business is being operated from rented premises.');
    expect(text).toContain('The business setup comprises 02 flour mills (10 HP).');
    expect(text).toContain('The estimated value of observed stock (wheat) is approximately ₹40000.');
    expect(text).toContain('02 flour mills and 01 weighing scale.');
    expect(text).toContain('Applicant has other income sources: Rent (₹5,000 Monthly)');
    expect(text).toContain('Coordinates matched the shop front.');
  });

  it('standard report shows the uploaded bureau score, never an invented one', () => {
    expect(visibleText(generateStandardPDReportHTML(fullReport))).not.toContain('748');
    expect(visibleText(generateStandardPDReportHTML({ ...fullReport, cibilScore: 712 }))).toContain(
      'CIBIL Bureau Score 712',
    );
  });
});

describe('cover page branding', () => {
  const coverOf = (html: string) => html.slice(html.indexOf('<div class="exec-page">'), html.indexOf('Cover Page'));
  const mahesh = { ...fullReport, companyHeader: { id: 'mahesh', name: 'Mahesh & Company', cin: '', designation: '', address: '' } };
  const infominer = { ...fullReport, companyHeader: { id: 'infominers', name: 'Infominer Services Pvt. Ltd.', cin: '', designation: '', address: '' } };

  it.each(Object.entries(TEMPLATES))('%s: Mahesh & Company gets its own logo and name', (_name, generate) => {
    const cover = coverOf(generate(mahesh));
    expect(cover).toContain(maheshLogoBase64);
    expect(cover).not.toContain(coverLogoBase64);
    expect(cover).toContain('Mahesh & Company');
  });

  it.each(Object.entries(TEMPLATES))('%s: Infominer keeps the Infominer logo', (_name, generate) => {
    const html = generate(infominer);
    expect(coverOf(html)).toContain(coverLogoBase64);
    expect(html).not.toContain(maheshLogoBase64);
  });
});
