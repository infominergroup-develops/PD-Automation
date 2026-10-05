import { describe, expect, it } from 'vitest';
import { CibilSummaryParser } from '../api/parsers/cibil/CibilSummaryParser';
import { CrifSummaryParser } from '../api/parsers/crif/CrifSummaryParser';
import { normalizeReport } from '../api/parsers/normalization/normalizeReport';
import { ParserFactory } from '../api/parsers/ParserFactory';
import { CibilParser } from '../api/parsers/cibil/CibilParser';
import { CrifParser } from '../api/parsers/crif/CrifParser';

describe('CibilSummaryParser', () => {
  it('reads labelled account counts and amounts', () => {
    const text = `
      ACCOUNT SUMMARY
      TOTAL ACCOUNTS: 7
      OPEN ACCOUNTS: 3
      OVERDUE ACCOUNTS: 1
      TOTAL CURRENT BALANCE: Rs. 4,25,000
      TOTAL SANCTIONED AMOUNT: INR 9,00,000.00
      TOTAL OVERDUE AMOUNT: ₹12,500
    `;
    expect(new CibilSummaryParser().parse(text)).toEqual({
      totalAccounts: 7,
      activeAccounts: 3,
      overdueAccounts: 1,
      totalCurrentBalance: 425000,
      totalSanctionedAmount: 900000,
      totalAmountOverdue: 12500,
    });
  });

  it('returns nothing for text without a summary', () => {
    expect(new CibilSummaryParser().parse('no bureau data here')).toEqual({});
  });
});

describe('CrifSummaryParser', () => {
  it('reads the six-count / six-amount summary table', () => {
    const text = 'Summary 9 4 0 2 7 0 3,10,000 2,00,000 1,10,000 8,50,000 8,00,000 0';
    expect(new CrifSummaryParser().parse(text)).toEqual({
      totalAccounts: 9,
      activeAccounts: 4,
      overdueAccounts: 0,
      securedAccounts: 2,
      unsecuredAccounts: 7,
      untaggedAccounts: 0,
      totalCurrentBalance: 310000,
      currentBalanceSecured: 200000,
      currentBalanceUnsecured: 110000,
      totalSanctionedAmount: 850000,
      totalDisbursedAmount: 800000,
      totalAmountOverdue: 0,
    });
  });

  it('falls back to labelled fields', () => {
    const summary = new CrifSummaryParser().parse('TOTAL ACCOUNTS: 5\nACTIVE ACCOUNTS: 2\nTOTAL OVERDUE: 1,500');
    expect(summary).toMatchObject({ totalAccounts: 5, activeAccounts: 2, totalAmountOverdue: 1500 });
  });
});

describe('normalizeReport', () => {
  it('derives account status from the bureau wording or the balance', () => {
    const result = normalizeReport('CIBIL', { name: 'Asha Verma' }, {}, [
      { status: 'STANDARD' as never, currentBalance: 1000 },
      { status: 'Written Off' as never, currentBalance: 0 },
      { currentBalance: 5000 },
      { currentBalance: 0 },
    ]);
    expect(result.accounts.map((a) => a.status)).toEqual(['Active', 'Closed', 'Active', 'Closed']);
  });

  it('fills a complete, zeroed summary when the bureau gave none', () => {
    const { summary, provider } = normalizeReport('CRIF', {}, {}, []);
    expect(provider).toBe('CRIF');
    for (const value of Object.values(summary)) expect(typeof value).toBe('number');
  });
});

describe('ParserFactory', () => {
  it('picks the parser by provider, defaulting to CRIF', () => {
    expect(ParserFactory.getParser(' cibil ')).toBeInstanceOf(CibilParser);
    expect(ParserFactory.getParser('CRIF')).toBeInstanceOf(CrifParser);
    expect(ParserFactory.getParser('unknown')).toBeInstanceOf(CrifParser);
  });
});
