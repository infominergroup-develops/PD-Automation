export type CreditProvider = 'CRIF' | 'CIBIL';

export type ReportStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ApplicantInfo {
  name: string | null;
  dob: string | null;
  phone: string | null;
  pan: string | null;
  address: string | null;
  score: number | null;
  reportDate: string | null;
  reference: string | null;
}

export interface CreditSummary {
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

/** Combined result of the bureau reports uploaded on the PD form, as shown on screen and in reports. */
export interface ParsedCreditReport {
  reportProvider: string;
  reportDate: string | null | undefined;
  creditScore: number | null | undefined;
  totalAccounts: number;
  activeAccounts: number;
  totalCurrentBalance: number;
  totalOverdueAmount: number;
  flags: string[];
  accounts: CreditAccount[];
}

export interface CreditAccount {
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

export interface ReportItem {
  id: string;
  ownerId: string;
  provider: CreditProvider;
  fileName: string;
  storagePath: string;
  status: ReportStatus;
  errorMessage?: string | null;
  uploadedAt: string;
  processedAt: string | null;
  applicant: ApplicantInfo;
  summary: CreditSummary;
  accountCount?: number;
  accounts?: CreditAccount[];
}
