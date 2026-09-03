import { parseNumericValue } from '../../utils/formatters.js';

export interface ApplicantData {
  name: string | null;
  dob: string | null;
  phone: string | null;
  pan: string | null;
  address: string | null;
  score: number | null;
  reportDate: string | null;
  reference: string | null;
}

export interface SummaryData {
  totalAccounts: number;
  activeAccounts: number;
  overdueAccounts: number;
  securedAccounts: number;
  unsecuredAccounts: number;
  untaggedAccounts: number;
  totalCurrentBalance: number;
  currentBalanceSecured: number;
  currentBalanceUnsecured: number;
  totalSanctionedAmount: number;
  totalDisbursedAmount: number;
  totalAmountOverdue: number;
}

export interface AccountData {
  id?: string;
  applicantName: string | null;
  accountType: string | null;
  creditGrantor: string | null;
  lenderType: string | null;
  status: 'Active' | 'Closed' | null;
  ownership: string | null;
  disbursedDate: string | null;
  disbursedAmount: number | null;
  currentBalance: number | null;
  overdueAmount: number | null;
  instalmentAmount: number | null;
  frequency: string | null;
  tenureMonths: number | null;
  interestRate: number | null;
  lastPaymentDate: string | null;
  asOnDate: string | null;
}

export interface ParsedReportResult {
  provider: 'CRIF' | 'CIBIL';
  applicant: ApplicantData;
  summary: SummaryData;
  accounts: AccountData[];
  rawTextLength?: number;
}

export function normalizeReport(
  provider: 'CRIF' | 'CIBIL',
  applicantRaw: Partial<ApplicantData>,
  summaryRaw: Partial<SummaryData>,
  accountsRaw: Partial<AccountData>[]
): ParsedReportResult {
  // Normalize accounts
  const normalizedAccounts: AccountData[] = accountsRaw.map((acc, index) => {
    const rawStatus = acc.status ? String(acc.status).trim() : '';
    let status: 'Active' | 'Closed' | null = null;
    if (/active|open|live|standard/i.test(rawStatus)) {
      status = 'Active';
    } else if (/closed|settled|written off|suit filed|closed settled/i.test(rawStatus)) {
      status = 'Closed';
    } else if (acc.currentBalance && acc.currentBalance > 0) {
      status = 'Active';
    } else if (acc.currentBalance === 0) {
      status = 'Closed';
    }

    const disbursedAmount = parseNumericValue(acc.disbursedAmount);
    const currentBalance = parseNumericValue(acc.currentBalance) ?? 0;
    const overdueAmount = parseNumericValue(acc.overdueAmount) ?? 0;
    const instalmentAmount = parseNumericValue(acc.instalmentAmount);
    const tenureMonths = parseNumericValue(acc.tenureMonths);
    const interestRate = parseNumericValue(acc.interestRate);

    // Auto classify Lender Type if not present
    let lenderType = acc.lenderType || null;
    if (!lenderType && acc.creditGrantor) {
      const g = acc.creditGrantor.toUpperCase();
      if (g.includes('BANK') || g.includes('HDFC') || g.includes('ICICI') || g.includes('SBI') || g.includes('AXIS') || g.includes('KOTAK')) {
        lenderType = 'Bank';
      } else if (g.includes('FINANCE') || g.includes('NBFC') || g.includes('CAPITAL') || g.includes('BAJAJ') || g.includes('TATA') || g.includes('L&T')) {
        lenderType = 'NBFC';
      } else if (g.includes('MFI') || g.includes('MICRO') || g.includes('GRMEEN') || g.includes('BHARAT')) {
        lenderType = 'MFI';
      } else {
        lenderType = 'Other';
      }
    }

    return {
      id: acc.id || `acc_${index + 1}`,
      applicantName: acc.applicantName || applicantRaw.name || null,
      accountType: acc.accountType || 'Other Loan',
      creditGrantor: acc.creditGrantor || 'Credit Grantor',
      lenderType: lenderType || 'Bank',
      status: status || 'Active',
      ownership: acc.ownership || 'Individual',
      disbursedDate: acc.disbursedDate || null,
      disbursedAmount,
      currentBalance,
      overdueAmount,
      instalmentAmount,
      frequency: acc.frequency || 'Monthly',
      tenureMonths,
      interestRate,
      lastPaymentDate: acc.lastPaymentDate || null,
      asOnDate: acc.asOnDate || null,
    };
  });

  // Calculate or cross-validate summary metrics
  const totalAccounts = summaryRaw.totalAccounts ?? normalizedAccounts.length;
  const activeAccounts = summaryRaw.activeAccounts ?? normalizedAccounts.filter(a => a.status === 'Active').length;
  const overdueAccounts = summaryRaw.overdueAccounts ?? normalizedAccounts.filter(a => (a.overdueAmount ?? 0) > 0).length;

  const securedTypes = ['HOME LOAN', 'HOUSING LOAN', 'AUTO LOAN', 'CAR LOAN', 'TWO WHEELER', 'COMMERCIAL VEHICLE', 'GOLD LOAN', 'PROPERTY LOAN', 'LOAN AGAINST PROPERTY', 'LAP', 'MORTGAGE'];
  const isSecured = (type: string | null) => type ? securedTypes.some(t => type.toUpperCase().includes(t)) : false;

  const securedAccounts = summaryRaw.securedAccounts ?? normalizedAccounts.filter(a => isSecured(a.accountType)).length;
  const unsecuredAccounts = summaryRaw.unsecuredAccounts ?? (totalAccounts - securedAccounts);
  const untaggedAccounts = summaryRaw.untaggedAccounts ?? 0;

  const totalCurrentBalance = summaryRaw.totalCurrentBalance ?? 
    normalizedAccounts.reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);

  const currentBalanceSecured = summaryRaw.currentBalanceSecured ?? 
    normalizedAccounts.filter(a => isSecured(a.accountType)).reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);

  const currentBalanceUnsecured = summaryRaw.currentBalanceUnsecured ?? 
    (totalCurrentBalance >= currentBalanceSecured ? totalCurrentBalance - currentBalanceSecured : 0);

  const totalSanctionedAmount = summaryRaw.totalSanctionedAmount ?? 
    normalizedAccounts.reduce((sum, a) => sum + (a.disbursedAmount ?? 0), 0);

  const totalDisbursedAmount = summaryRaw.totalDisbursedAmount ?? totalSanctionedAmount;

  const totalAmountOverdue = summaryRaw.totalAmountOverdue ?? 
    normalizedAccounts.reduce((sum, a) => sum + (a.overdueAmount ?? 0), 0);

  const score = parseNumericValue(applicantRaw.score);

  return {
    provider,
    applicant: {
      name: applicantRaw.name || null,
      dob: applicantRaw.dob || null,
      phone: applicantRaw.phone || null,
      pan: applicantRaw.pan || null,
      address: applicantRaw.address || null,
      score: score !== null && score >= 300 && score <= 900 ? score : (score === 0 || score === -1 ? score : null),
      reportDate: applicantRaw.reportDate || null,
      reference: applicantRaw.reference || null,
    },
    summary: {
      totalAccounts,
      activeAccounts,
      overdueAccounts,
      securedAccounts,
      unsecuredAccounts,
      untaggedAccounts,
      totalCurrentBalance,
      currentBalanceSecured,
      currentBalanceUnsecured,
      totalSanctionedAmount,
      totalDisbursedAmount,
      totalAmountOverdue,
    },
    accounts: normalizedAccounts,
  };
}
