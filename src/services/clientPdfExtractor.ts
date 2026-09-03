import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { CreditProvider, ReportItem, CreditAccount, ApplicantInfo, CreditSummary } from '../types/creditTypes';
import { parseNumericValue } from '../utils/creditFormatters';

// Configure worker using local Vite asset URL
try {
  if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
} catch (e) {
  console.warn('Worker initialization note:', e);
}

function re1(pattern: RegExp, text: string, group = 1): string {
  const m = text.match(pattern);
  return m && m[group] ? m[group].trim() : '';
}

export async function extractTextFromPdfFile(file: File): Promise<string> {
  const getDocAndExtract = async (lib: any, workerSrc?: string): Promise<string> => {
    if (workerSrc && lib.GlobalWorkerOptions) {
      lib.GlobalWorkerOptions.workerSrc = workerSrc;
    }
    // Always create a fresh clone of the bytes to prevent detached ArrayBuffer transfer errors
    const freshBuffer = await file.arrayBuffer();
    const dataCopy = new Uint8Array(freshBuffer.slice(0));

    const loadingTask = lib.getDocument({
      data: dataCopy,
      useWorkerFetch: true,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => (item && 'str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  // Strategy 1: CDN window.pdfjsLib if present
  if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
    try {
      const text = await getDocAndExtract(
        (window as any).pdfjsLib,
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      );
      if (text && text.trim().length > 30) {
        return text;
      }
    } catch (cdnErr) {
      console.warn('CDN PDF extraction attempt failed, trying bundled worker...', cdnErr);
    }
  }

  // Strategy 2: Bundled Vite pdfjs-dist
  try {
    const text = await getDocAndExtract(pdfjsLib, pdfWorker);
    if (text && text.trim().length > 30) {
      return text;
    }
  } catch (bundledErr) {
    console.warn('Bundled worker failed, trying server-side text extraction...', bundledErr);
  }

  // Strategy 3: Fast server-side text extraction API fallback
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/reports/extract-text', {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.text) {
        return result.text;
      }
    }
  } catch (serverErr) {
    console.warn('Server text extraction fallback failed:', serverErr);
  }

  // Strategy 4: Raw buffer string pattern scan
  try {
    const rawBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('latin1');
    const rawStr = decoder.decode(rawBuffer);
    const matches = rawStr.match(/\(([^()]{3,})\)|\[([^\[\]]{3,})\]/g);
    if (matches && matches.length > 10) {
      return matches.map((m) => m.slice(1, -1)).join(' ');
    }
  } catch (rawErr) {
    console.warn('Raw string scan failed:', rawErr);
  }

  throw new Error('Unable to extract readable text from PDF. Please check if the file is encrypted or password-protected.');
}

/**
 * Extracts Applicant Details from CRIF text
 */
export function parseCrifApplicant(text: string): ApplicantInfo {
  const name =
    re1(/For\s+([\w\s.]{3,60}?)(?:CHM Ref|Prepared|Order ID|Report)/i, text) ||
    re1(/(?:Name|Applicant Name|Borrower Name)\s*[:\-\t]\s*([\w\s.]{3,50})(?:DOB|Father|PAN|Age|Phone|$)/i, text) ||
    re1(/Name\s*:\s*([A-Za-z\s.]+?)(?:\r?\n|DOB)/i, text);

  const dob =
    re1(/DOB\/Age:\s*([\d\-]+)/i, text) ||
    re1(/(?:DOB|Date of Birth)\s*[:\-\t]\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, text);

  const phone =
    re1(/Phone Numbers?:\s*([\d\s+]+)/i, text) ||
    re1(/(?:Mobile|Phone|Contact)\s*(?:No\.?|Number)?\s*[:\-\t]?\s*([+\d\s-]{10,15})/i, text);

  const pan =
    re1(/([A-Z]{5}[0-9]{4}[A-Z])\s*\[PAN\]/i, text) ||
    re1(/(?:PAN|Income Tax PAN)\s*[:\-\t]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i, text) ||
    re1(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/, text);

  const address =
    re1(/Current Address:\s*(.+?)(?:\n|Other Address|Phone|Email|Identification|$)/i, text) ||
    re1(/(?:Address|Residential Address)\s*[:\-\t]\s*(.+?)(?:\n|Phone|Email|$)/i, text);

  const scoreStr =
    re1(/PERFORM CONSUMER[\d\.\s]+[\d]{3}-[\d]{3}\s+(\d{3})/i, text) ||
    re1(/(?:CRIF(?:\s+HIGH\s+MARK)?\s+SCORE|HIGH\s+MARK\s+SCORE|SCORE\s*\(CRIF\))\s*[:\-\t]?\s*(\d{3})/i, text) ||
    re1(/SCORE\s*[:\-\t]?\s*(\d{3})/i, text);

  const score = scoreStr ? parseInt(scoreStr, 10) : null;

  const reportDate =
    re1(/Date of Request:\s*([\d\-]+ [\d:]+)/i, text) ||
    re1(/(?:Report Date|Date of Report|Date Issued)\s*[:\-\t]\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, text);

  const reference =
    re1(/CHM Ref #?:\s*(\S+)/i, text) ||
    re1(/(?:CHM\s*REF|Order ID|Report ID|Reference No)\s*[:\-\t]?\s*([A-Za-z0-9\-_]+)/i, text);

  return {
    name: name ? name.replace(/^(MR|MS|MRS|DR|SH)\.?\s+/i, '').trim() : null,
    dob: dob || null,
    phone: phone ? phone.replace(/[^0-9]/g, '').slice(-10) : null,
    pan: pan ? pan.toUpperCase().trim() : null,
    address: address ? address.replace(/\s+/g, ' ').trim() : null,
    score: score && score >= 300 && score <= 900 ? score : null,
    reportDate: reportDate || null,
    reference: reference || null,
  };
}

/**
 * Extracts Account Summary from CRIF text
 */
export function parseCrifSummary(text: string): CreditSummary {
  // Try table pattern: 6 account counts followed by 6 balance amounts
  const m = text.match(/(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/);
  if (m) {
    return {
      totalAccounts: parseInt(m[1], 10) || 0,
      activeAccounts: parseInt(m[2], 10) || 0,
      overdueAccounts: parseInt(m[3], 10) || 0,
      securedAccounts: parseInt(m[4], 10) || 0,
      unsecuredAccounts: parseInt(m[5], 10) || 0,
      untaggedAccounts: parseInt(m[6], 10) || 0,
      totalCurrentBalance: parseNumericValue(m[7]) || 0,
      currentBalanceSecured: parseNumericValue(m[8]) || 0,
      currentBalanceUnsecured: parseNumericValue(m[9]) || 0,
      totalSanctionedAmount: parseNumericValue(m[10]) || 0,
      totalDisbursedAmount: parseNumericValue(m[11]) || 0,
      totalAmountOverdue: parseNumericValue(m[12]) || 0,
    };
  }

  // Fallback explicit regex
  const totalAcc = re1(/Total\s+Accounts?\s*[:\-\t]?\s*(\d+)/i, text);
  const activeAcc = re1(/Active\s+Accounts?\s*[:\-\t]?\s*(\d+)/i, text);
  const overdueAcc = re1(/Overdue\s+Accounts?\s*[:\-\t]?\s*(\d+)/i, text);
  const totBal = re1(/Total\s+Current\s+Balance\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, text);
  const overdueAmt = re1(/Total\s+Amount\s+Overdue\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, text);

  return {
    totalAccounts: parseInt(totalAcc, 10) || 0,
    activeAccounts: parseInt(activeAcc, 10) || 0,
    overdueAccounts: parseInt(overdueAcc, 10) || 0,
    securedAccounts: 0,
    unsecuredAccounts: 0,
    untaggedAccounts: 0,
    totalCurrentBalance: parseNumericValue(totBal) || 0,
    currentBalanceSecured: 0,
    currentBalanceUnsecured: 0,
    totalSanctionedAmount: 0,
    totalDisbursedAmount: 0,
    totalAmountOverdue: parseNumericValue(overdueAmt) || 0,
  };
}

/**
 * Extracts Individual Accounts from CRIF text
 */
export function parseCrifAccounts(text: string, applicantName?: string | null): CreditAccount[] {
  const accounts: CreditAccount[] = [];
  const chunks = text.split(/(?=Account Type:)/i);

  chunks.forEach((chunk, index) => {
    if (!/Account Type:/i.test(chunk)) return;

    const accountType = re1(/Account Type:\s*(.+?)(?:Credit Grantor:|$)/i, chunk);
    const creditGrantor = re1(/Credit Grantor:\s*(.+?)(?:Account #:|$)/i, chunk);
    const lenderType = re1(/Lender Type:\s*(\w+)/i, chunk);

    let status: 'Active' | 'Closed' = 'Active';
    let ownership = 'Individual';

    const statusM = chunk.match(/(Acti\s*v\s*O?e?wnership|Active\s*Ownership|Closed\s*Ownership):\s*(\w+)/i);
    if (statusM) {
      status = /clos/i.test(statusM[1]) ? 'Closed' : 'Active';
      ownership = statusM[2] || 'Individual';
    } else {
      const sm = chunk.match(/\n(Active|Closed)\s*[\n ]/i);
      status = sm ? (sm[1].toLowerCase() === 'closed' ? 'Closed' : 'Active') : (/Closed Date:\s*[\d\-]+/i.test(chunk) ? 'Closed' : 'Active');
      const own = re1(/Ownership:\s*(\w+)/i, chunk);
      if (own) ownership = own;
    }

    const disbursedDate = re1(/Disbursed Date:\s*([\d\-]+)/i, chunk);
    const disbursedAmount = parseNumericValue(re1(/Disbd Amt\/High Credit:\s*([\d,]+)/i, chunk));
    const currentBalance = parseNumericValue(re1(/Current Balance:\s*([\d,]+)/i, chunk));
    const overdueAmount = parseNumericValue(re1(/Overdue Amt:\s*([\d,]+)/i, chunk)) || 0;
    const lastPaymentDate = re1(/Last Payment Date:\s*([\d\-]+)/i, chunk);

    let instalmentAmount: number | null = null;
    let frequency: string | null = null;
    const instM = chunk.match(/InstlAmt\/Freq:\s*([\d,]+)\/(\w+)/i);
    if (instM) {
      instalmentAmount = parseNumericValue(instM[1]);
      frequency = instM[2];
    }

    const tenureStr = re1(/Tenure\(month\):\s*(\d+)/i, chunk);
    const tenureMonths = tenureStr ? parseInt(tenureStr, 10) : null;
    const interestRateStr = re1(/Interest Rate:\s*([\d.]+\s*%?)/i, chunk);
    const interestRate = interestRateStr ? parseFloat(interestRateStr.replace(/%/g, '')) : null;
    const asOnDate = re1(/As on:\s*([\d\-]+)/i, chunk);

    if (accountType || creditGrantor || disbursedAmount !== null || currentBalance !== null) {
      accounts.push({
        id: `crif_acc_${Date.now()}_${index}`,
        applicantName: applicantName || null,
        accountType: accountType || 'Credit Account',
        creditGrantor: creditGrantor || 'Credit Institution',
        lenderType: lenderType || 'Bank',
        status,
        ownership,
        disbursedDate: disbursedDate || null,
        disbursedAmount: disbursedAmount !== null ? disbursedAmount : null,
        currentBalance: currentBalance !== null ? currentBalance : null,
        overdueAmount,
        instalmentAmount,
        frequency: frequency || 'Monthly',
        tenureMonths,
        interestRate,
        lastPaymentDate: lastPaymentDate || null,
        asOnDate: asOnDate || null,
      });
    }
  });

  return accounts;
}

/**
 * CIBIL Parsers
 */
export function parseCibilApplicant(text: string): ApplicantInfo {
  const name =
    re1(/(?:CONSUMER\s+NAME|NAME)\s*[:\-\t]\s*([A-Za-z\s.]{3,50})(?:\r?\n|DATE\s+OF\s+BIRTH|DOB|GENDER|IDENTIFICATION|CONTROL)/i, text) ||
    re1(/(?:NAME\s*:\s*)([^\n\r]+)/i, text) ||
    re1(/For\s+([\w\s.]{3,50}?)(?:Prepared|Control|CIR)/i, text);

  const dob =
    re1(/(?:DATE\s+OF\s+BIRTH|DOB|BIRTH\s+DATE)\s*[:\-\t]\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, text);

  const pan =
    re1(/(?:PAN|INCOME\s+TAX\s+ID|INCOME\s+TAX\s+PAN)\s*[:\-\t]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i, text) ||
    re1(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/, text);

  const phone =
    re1(/(?:MOBILE|TELEPHONE|PHONE)\s*(?:NUMBER|NO\.?)?\s*[:\-\t]?\s*([+\d\s-]{10,15})/i, text);

  const scoreStr =
    re1(/(?:CIBIL\s+TRANSUNION\s+SCORE(?:\s+2\.0)?|CIBIL\s+SCORE|TRANSUNION\s+SCORE|SCORE)\s*[:\-\t]?\s*(\d{3})/i, text) ||
    re1(/SCORE\s*[:\-\t]?\s*(\d{3})/i, text);

  const score = scoreStr ? parseInt(scoreStr, 10) : null;

  const controlNo =
    re1(/(?:CONTROL\s+NUMBER|ECN|REPORT\s+CONTROL\s+NUMBER|CIBIL\s+CONTROL\s+NO\.?)\s*[:\-\t]?\s*([0-9A-Za-z\-]+)/i, text);

  const dateProcessed =
    re1(/(?:DATE\s+PROCESSED|DATE\s+OF\s+ISSUE|REPORT\s+DATE|DATE)\s*[:\-\t]\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, text);

  const address =
    re1(/(?:ADDRESS(?:ES)?|PERMANENT\s+ADDRESS|RESIDENTIAL\s+ADDRESS)\s*[:\-\t]\s*([^\n\r]+)/i, text);

  return {
    name: name ? name.replace(/^(MR|MS|MRS|DR|SH)\.?\s+/i, '').trim() : null,
    dob: dob || null,
    phone: phone ? phone.replace(/[^0-9]/g, '').slice(-10) : null,
    pan: pan ? pan.toUpperCase().trim() : null,
    address: address ? address.replace(/\s+/g, ' ').trim() : null,
    score: score && score >= 300 && score <= 900 ? score : null,
    reportDate: dateProcessed || null,
    reference: controlNo || null,
  };
}

export function parseCibilSummary(text: string): CreditSummary {
  const totalAcc = re1(/(?:TOTAL\s+ACCOUNTS?|ACCOUNTS?)\s*[:\-\t]?\s*(\d+)/i, text);
  const activeAcc = re1(/(?:ACTIVE\s+ACCOUNTS?|OPEN\s+ACCOUNTS?)\s*[:\-\t]?\s*(\d+)/i, text);
  const overdueAcc = re1(/(?:OVERDUE\s+ACCOUNTS?)\s*[:\-\t]?\s*(\d+)/i, text);
  const totBal = re1(/(?:TOTAL\s+CURRENT\s+BALANCE|CURRENT\s+BALANCE|TOTAL\s+BALANCE)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, text);
  const overdueAmt = re1(/(?:TOTAL\s+AMOUNT\s+OVERDUE|OVERDUE\s+AMOUNT|AMOUNT\s+OVERDUE)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, text);
  const sanctionedAmt = re1(/(?:TOTAL\s+SANCTIONED\s+AMOUNT|HIGH\s+CREDIT\s+AMOUNT|SANCTIONED\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, text);

  return {
    totalAccounts: parseInt(totalAcc, 10) || 0,
    activeAccounts: parseInt(activeAcc, 10) || 0,
    overdueAccounts: parseInt(overdueAcc, 10) || 0,
    securedAccounts: 0,
    unsecuredAccounts: 0,
    untaggedAccounts: 0,
    totalCurrentBalance: parseNumericValue(totBal) || 0,
    currentBalanceSecured: 0,
    currentBalanceUnsecured: 0,
    totalSanctionedAmount: parseNumericValue(sanctionedAmt) || 0,
    totalDisbursedAmount: parseNumericValue(sanctionedAmt) || 0,
    totalAmountOverdue: parseNumericValue(overdueAmt) || 0,
  };
}

export function parseCibilAccounts(text: string, applicantName?: string | null): CreditAccount[] {
  const accounts: CreditAccount[] = [];
  const chunks = text.split(/(?=ACCOUNT\s+TYPE\s*:|ACCOUNT\s+DETAILS|MEMBER\s+NAME\s*:|ACCOUNT\s+#)/i);

  chunks.forEach((chunk, index) => {
    if (chunk.length < 30) return;

    const accountType =
      re1(/(?:ACCOUNT\s+TYPE|TYPE\s+OF\s+FACILITY)\s*[:\-\t]?\s*([A-Za-z0-9\s/]+?)(?:\r?\n|MEMBER|OWNERSHIP|STATUS|DATE|$)/i, chunk) ||
      re1(/\b(PERSONAL\s+LOAN|HOUSING\s+LOAN|HOME\s+LOAN|AUTO\s+LOAN|CREDIT\s+CARD|BUSINESS\s+LOAN|GOLD\s+LOAN|TWO\s+WHEELER\s+LOAN|OVERDRAFT|COMMERCIAL\s+VEHICLE|MORTGAGE|EDUCATION\s+LOAN|CONSUMER\s+LOAN)\b/i, chunk);

    const creditGrantor =
      re1(/(?:MEMBER\s+NAME|CREDIT\s+GRANTOR|GRANTOR|BANK)\s*[:\-\t]?\s*([A-Za-z0-9\s.,&]+?)(?:\r?\n|ACCOUNT|OWNERSHIP|STATUS|$)/i, chunk);

    const statusMatch = re1(/(?:ACCOUNT\s+STATUS|STATUS)\s*[:\-\t]?\s*(ACTIVE|OPEN|CLOSED|SETTLED|WRITTEN\s+OFF|LIVE|STANDARD)/i, chunk);
    const status: 'Active' | 'Closed' = /ACTIVE|OPEN|LIVE|STANDARD/i.test(statusMatch) ? 'Active' : /CLOSED|SETTLED|WRITTEN/i.test(statusMatch) ? 'Closed' : 'Active';

    const ownership = re1(/(?:OWNERSHIP\s*INDICATOR|OWNERSHIP)\s*[:\-\t]?\s*([A-Za-z]+)/i, chunk) || 'Individual';
    const disbursedDate = re1(/(?:DATE\s+OPENED|DATE\s+DISBURSED|SANCTION\s+DATE)\s*[:\-\t]?\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, chunk);
    const disbursedAmount = parseNumericValue(re1(/(?:HIGH\s+CREDIT\s+AMOUNT|SANCTIONED\s+AMOUNT|DISBURSED\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, chunk));
    const currentBalance = parseNumericValue(re1(/(?:CURRENT\s+BALANCE|BALANCE)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, chunk));
    const overdueAmount = parseNumericValue(re1(/(?:AMOUNT\s+OVERDUE|OVERDUE\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, chunk)) || 0;
    const instalmentAmount = parseNumericValue(re1(/(?:EMI\s+AMOUNT|MONTHLY\s+PAYMENT|PAYMENT\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i, chunk));
    const lastPaymentDate = re1(/(?:DATE\s+OF\s+LAST\s+PAYMENT|LAST\s+PAYMENT\s+DATE)\s*[:\-\t]?\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, chunk);
    const asOnDate = re1(/(?:DATE\s+REPORTED|DATE\s+CLOSED|AS\s+ON\s+DATE)\s*[:\-\t]?\s*([\d]{2}[-/][\d]{2}[-/][\d]{4}|[\d]{2}-[A-Za-z]{3}-[\d]{4}|[\d\-]+)/i, chunk);

    if (accountType || creditGrantor || disbursedAmount !== null || currentBalance !== null) {
      accounts.push({
        id: `cibil_acc_${Date.now()}_${index}`,
        applicantName: applicantName || null,
        accountType: accountType || 'Credit Facility',
        creditGrantor: creditGrantor || 'Member Bank',
        lenderType: 'Bank',
        status,
        ownership,
        disbursedDate: disbursedDate || null,
        disbursedAmount: disbursedAmount !== null ? disbursedAmount : null,
        currentBalance: currentBalance !== null ? currentBalance : null,
        overdueAmount,
        instalmentAmount,
        frequency: 'Monthly',
        tenureMonths: null,
        interestRate: null,
        lastPaymentDate: lastPaymentDate || null,
        asOnDate: asOnDate || null,
      });
    }
  });

  return accounts;
}

/**
 * Main Client Extraction Pipeline for a File
 */
export async function parsePdfReportFile(
  file: File,
  preferredProvider: CreditProvider = 'CRIF'
): Promise<ReportItem> {
  const text = await extractTextFromPdfFile(file);
  if (!text || text.trim().length === 0) {
    throw new Error('PDF has no extractable text content or is password protected.');
  }

  // Auto-detect provider if needed
  let effectiveProvider: CreditProvider = preferredProvider;
  const isCrif = /CRIF|HIGH\s*MARK|CHM\s*REF|PERFORM\s*CONSUMER/i.test(text);
  const isCibil = /CIBIL|TRANSUNION|CIR\s*REPORT|CONTROL\s*NUMBER/i.test(text);
  if (isCrif && !isCibil) effectiveProvider = 'CRIF';
  if (isCibil && !isCrif) effectiveProvider = 'CIBIL';

  let applicant: ApplicantInfo;
  let summary: CreditSummary;
  let accounts: CreditAccount[];

  if (effectiveProvider === 'CRIF') {
    applicant = parseCrifApplicant(text);
    summary = parseCrifSummary(text);
    accounts = parseCrifAccounts(text, applicant.name);
  } else {
    applicant = parseCibilApplicant(text);
    summary = parseCibilSummary(text);
    accounts = parseCibilAccounts(text, applicant.name);
  }

  // Cross-reconciliation of summary with accounts
  if (accounts.length > 0) {
    if (summary.totalAccounts === 0) {
      summary.totalAccounts = accounts.length;
    }
    const liveActive = accounts.filter((a) => a.status === 'Active').length;
    if (summary.activeAccounts === 0 && liveActive > 0) {
      summary.activeAccounts = liveActive;
    }
    const overdueCount = accounts.filter((a) => a.overdueAmount > 0).length;
    if (summary.overdueAccounts === 0 && overdueCount > 0) {
      summary.overdueAccounts = overdueCount;
    }
    const computedBal = accounts.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);
    if (summary.totalCurrentBalance === 0 && computedBal > 0) {
      summary.totalCurrentBalance = computedBal;
    }
    const computedOverdue = accounts.reduce((acc, curr) => acc + (curr.overdueAmount || 0), 0);
    if (summary.totalAmountOverdue === 0 && computedOverdue > 0) {
      summary.totalAmountOverdue = computedOverdue;
    }
    const computedSanctioned = accounts.reduce((acc, curr) => acc + (curr.disbursedAmount || 0), 0);
    if (summary.totalSanctionedAmount === 0 && computedSanctioned > 0) {
      summary.totalSanctionedAmount = computedSanctioned;
      summary.totalDisbursedAmount = computedSanctioned;
    }
  }

  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    id: reportId,
    ownerId: 'current_user',
    provider: effectiveProvider,
    fileName: file.name,
    storagePath: `reports/${effectiveProvider}/${new Date().toISOString().slice(0, 7)}/${reportId}_${file.name}`,
    status: 'completed',
    uploadedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    applicant,
    summary,
    accountCount: accounts.length,
    accounts,
  };
}
