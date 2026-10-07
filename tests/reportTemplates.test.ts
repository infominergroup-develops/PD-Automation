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

describe('Tata / SBFC net profit (A − B)', () => {
  const sales = [{ particulars: 'Government civil contract work', monthly: 590000, yearly: 7080000 }];
  const expenses = [
    { particulars: 'Construction materials & labour', monthly: 430700, yearly: 5168400 },
    { particulars: 'Electricity', monthly: 4500, yearly: 54000 },
    { particulars: 'Salaries', monthly: 70000, yearly: 840000 },
    { particulars: 'Travel', monthly: 3500, yearly: 42000 },
  ];
  // The Financials tab derives its own figure (COGS margin + operating expenses); it must not leak into this row
  const data = { ...fullReport, itemizedSales: sales, itemizedExpenses: expenses, netProfitMonthly: 150000, netProfitYearly: 1800000 } as PDReportPrintData;

  it.each([['tata', generateTataCapitalPDReportHTML], ['sbfc', generateSbfcPDReportHTML]])(
    '%s prints sales minus the listed expenses for both month and year',
    (_name, generate) => {
      const html = generate(data);
      const row = html.slice(html.indexOf('Net Profit Per month (A - B - C)'), html.indexOf('Net Profit Per month (A - B - C)') + 600);
      // No purchases in this data, so net profit = sales − operating expenses
      expect(row).toContain('₹81,300');
      expect(row).toContain('₹9,75,600');
      expect(row).not.toContain('₹18,00,000');
    },
  );
});

describe('Tata / SBFC income sheet: gross profit from purchases', () => {
  const data = {
    ...fullReport,
    itemizedSales: [{ particulars: 'Turnover', monthly: 500000, yearly: 6000000 }],
    itemizedExpenses: [{ particulars: 'Salary, rent & utilities', monthly: 100000, yearly: 1200000 }],
    totalPurchasesMonthly: 200000,
    totalPurchasesYearly: 2400000,
  } as PDReportPrintData;

  it.each([['tata', generateTataCapitalPDReportHTML], ['sbfc', generateSbfcPDReportHTML]])(
    '%s shows purchases, gross profit with margin, and net profit with net margin',
    (_name, generate) => {
      const html = generate(data);
      const gp = html.slice(html.indexOf('Gross Profit (A - B)'), html.indexOf('Gross Profit (A - B)') + 600);
      expect(gp).toContain('₹3,00,000'); // 500,000 − 200,000
      expect(gp).toContain('₹36,00,000'); // 6,000,000 − 2,400,000
      expect(gp).toContain('Gross Margin: 60%');
      const purch = html.slice(html.indexOf('Purchases / Cost of Goods Sold (B)'), html.indexOf('Purchases / Cost of Goods Sold (B)') + 600);
      expect(purch).toContain('₹2,00,000');
      const np = html.slice(html.indexOf('Net Profit Per month (A - B - C)'), html.indexOf('Net Profit Per month (A - B - C)') + 600);
      expect(np).toContain('₹2,00,000'); // 300,000 gross − 100,000 expenses
      expect(np).toContain('Net Margin: 40%');
    },
  );
});

describe('Abhiyan met person during visit', () => {
  it('shows the persons-met value from the form verbatim, not applicant & co-applicant', () => {
    const data = {
      ...fullReport,
      applicantName: 'Asha Verma',
      coApplicantName: 'Ramesh Verma',
      coApplicantRelation: 'Husband',
      metPersonName: 'Sunita Devi (Mother) & Asha Verma (Self)',
    } as PDReportPrintData;
    const html = generateAbhiyanPDReportHTML(data);
    expect(html).toContain('Sunita Devi (Mother) & Asha Verma (Self)');
    // The old hardcoded "Applicant & CoApplicant ( Relation )" form must be gone
    expect(html).not.toContain('Asha Verma & Ramesh Verma ( Husband )');
  });
});

describe('Abhiyan net disposal income', () => {
  it('derives net profit and net disposal from printed rows, not the Financials tab figure', () => {
    const data = {
      ...fullReport,
      itemizedSales: [{ particulars: 'Turnover', monthly: 590000, yearly: 7080000 }],
      itemizedExpenses: [
        { particulars: 'Materials & labour', monthly: 430700, yearly: 5168400 },
        { particulars: 'Electricity', monthly: 4500, yearly: 54000 },
        { particulars: 'Salaries', monthly: 70000, yearly: 840000 },
        { particulars: 'Travel', monthly: 3500, yearly: 42000 },
      ],
      existingEmiMonthly: 10000,
      existingEmiYearly: 120000,
      monthlyHouseholdExpensesAmount: 20000,
      // A co-applicant business must NOT inflate the applicant's own net disposal row
      hasCoApplicantBusiness: true,
      coApplicantName: 'Ramesh',
      coApplicantItemizedSales: [{ particulars: 'Shop', monthly: 100000, yearly: 1200000 }],
      coApplicantItemizedExpenses: [{ particulars: 'Costs', monthly: 40000, yearly: 480000 }],
      // The Financials tab's separately derived figure must not leak in
      netProfitYearly: 1800000,
    } as PDReportPrintData;
    const html = generateAbhiyanPDReportHTML(data);
    const npRow = html.slice(html.indexOf('Net Profit Per month(A- B)'), html.indexOf('Net Profit Per month(A- B)') + 400);
    expect(npRow).toContain('81,300');
    expect(npRow).toContain('9,75,600');
    expect(npRow).not.toContain('18,00,000');
    // The Less: Existing EMI row must show both monthly and yearly, so the subtraction reads completely
    const emiRow = html.slice(html.indexOf('Less: Existing EMI'), html.indexOf('Less: Existing EMI') + 400);
    expect(emiRow).toContain('10,000');
    expect(emiRow).toContain('1,20,000');
    const ndRow = html.slice(html.indexOf('Net Disposal Income'), html.indexOf('Net Disposal Income') + 400);
    // Applicant-only: 81,300 − 10,000 EMI − 20,000 household (co-applicant's 60,000 must not be added)
    expect(ndRow).toContain('51,300');
    expect(ndRow).toContain('6,15,600'); // 9,75,600 − 1,20,000 − 2,40,000
    expect(ndRow).not.toContain('1,11,300'); // would be the inflated figure if co-applicant were included
  });
});
