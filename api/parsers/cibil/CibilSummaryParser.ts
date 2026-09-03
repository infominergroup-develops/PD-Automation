import { SummaryData } from '../normalization/normalizeReport.js';
import { parseNumericValue } from '../../utils/formatters.js';

export class CibilSummaryParser {
  public parse(text: string): Partial<SummaryData> {
    const summary: Partial<SummaryData> = {};

    // Total Accounts in CIBIL
    const totalAccMatch = text.match(/(?:TOTAL\s+ACCOUNTS|NUMBER\s+OF\s+ACCOUNTS|ALL\s+ACCOUNTS)\s*[:\-\t]?\s*([0-9]+)/i);
    if (totalAccMatch) summary.totalAccounts = parseInt(totalAccMatch[1], 10);

    // Active / Open Accounts
    const activeAccMatch = text.match(/(?:OPEN\s+ACCOUNTS|ACTIVE\s+ACCOUNTS|CURRENT\s+ACCOUNTS)\s*[:\-\t]?\s*([0-9]+)/i);
    if (activeAccMatch) summary.activeAccounts = parseInt(activeAccMatch[1], 10);

    // Overdue / Default Accounts
    const overdueAccMatch = text.match(/(?:OVERDUE\s+ACCOUNTS|DELINQUENT\s+ACCOUNTS|PAST\s+DUE\s+ACCOUNTS|NEGATIVE\s+ACCOUNTS)\s*[:\-\t]?\s*([0-9]+)/i);
    if (overdueAccMatch) summary.overdueAccounts = parseInt(overdueAccMatch[1], 10);

    // Total Current Balance / Outstanding
    const totBalMatch = text.match(/(?:TOTAL\s+CURRENT\s+BALANCE|TOTAL\s+BALANCE\s+OUTSTANDING|TOTAL\s+OUTSTANDING)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (totBalMatch) summary.totalCurrentBalance = parseNumericValue(totBalMatch[1]) ?? undefined;

    // Total Sanctioned / High Credit Amount
    const sancMatch = text.match(/(?:TOTAL\s+HIGH\s+CREDIT|TOTAL\s+SANCTIONED\s+AMOUNT|SANCTIONED\s+AMOUNT|HIGH\s+CREDIT\s+TOTAL)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (sancMatch) summary.totalSanctionedAmount = parseNumericValue(sancMatch[1]) ?? undefined;

    // Total Overdue Amount
    const ovdMatch = text.match(/(?:TOTAL\s+OVERDUE\s+AMOUNT|TOTAL\s+AMOUNT\s+OVERDUE|TOTAL\s+PAST\s+DUE)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (ovdMatch) summary.totalAmountOverdue = parseNumericValue(ovdMatch[1]) ?? undefined;

    return summary;
  }
}
