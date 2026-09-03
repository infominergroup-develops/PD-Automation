import { SummaryData } from '../normalization/normalizeReport.js';
import { parseNumericValue } from '../../utils/formatters.js';

export class CrifSummaryParser {
  public parse(text: string): Partial<SummaryData> {
    const summary: Partial<SummaryData> = {};

    // 1. Primary Table Pattern: 6 counts followed by 6 amounts
    const tableMatch = text.match(/(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/);
    if (tableMatch) {
      summary.totalAccounts = parseInt(tableMatch[1], 10) || 0;
      summary.activeAccounts = parseInt(tableMatch[2], 10) || 0;
      summary.overdueAccounts = parseInt(tableMatch[3], 10) || 0;
      summary.securedAccounts = parseInt(tableMatch[4], 10) || 0;
      summary.unsecuredAccounts = parseInt(tableMatch[5], 10) || 0;
      summary.untaggedAccounts = parseInt(tableMatch[6], 10) || 0;
      summary.totalCurrentBalance = parseNumericValue(tableMatch[7]) ?? 0;
      summary.currentBalanceSecured = parseNumericValue(tableMatch[8]) ?? 0;
      summary.currentBalanceUnsecured = parseNumericValue(tableMatch[9]) ?? 0;
      summary.totalSanctionedAmount = parseNumericValue(tableMatch[10]) ?? 0;
      summary.totalDisbursedAmount = parseNumericValue(tableMatch[11]) ?? 0;
      summary.totalAmountOverdue = parseNumericValue(tableMatch[12]) ?? 0;
      return summary;
    }

    // 2. Fallback explicit labeled fields
    const totalAccMatch = text.match(/(?:TOTAL\s+ACCOUNTS?|TOTAL\s+CREDIT\s+FACILITIES|TOTAL\s+TRADELINES)\s*[:\-\t]?\s*([0-9]+)/i);
    if (totalAccMatch) summary.totalAccounts = parseInt(totalAccMatch[1], 10);

    const activeAccMatch = text.match(/(?:ACTIVE\s+ACCOUNTS?|CURRENT\s+ACCOUNTS?|OPEN\s+ACCOUNTS?)\s*[:\-\t]?\s*([0-9]+)/i);
    if (activeAccMatch) summary.activeAccounts = parseInt(activeAccMatch[1], 10);

    const overdueAccMatch = text.match(/(?:OVERDUE\s+ACCOUNTS?|ACCOUNTS?\s+IN\s+DEFAULT|DELINQUENT\s+ACCOUNTS?)\s*[:\-\t]?\s*([0-9]+)/i);
    if (overdueAccMatch) summary.overdueAccounts = parseInt(overdueAccMatch[1], 10);

    const securedAccMatch = text.match(/(?:SECURED\s+ACCOUNTS?|SECURED\s+FACILITIES)\s*[:\-\t]?\s*([0-9]+)/i);
    if (securedAccMatch) summary.securedAccounts = parseInt(securedAccMatch[1], 10);

    const unsecuredAccMatch = text.match(/(?:UNSECURED\s+ACCOUNTS?|UNSECURED\s+FACILITIES)\s*[:\-\t]?\s*([0-9]+)/i);
    if (unsecuredAccMatch) summary.unsecuredAccounts = parseInt(unsecuredAccMatch[1], 10);

    const untaggedAccMatch = text.match(/(?:UNTAGGED\s+ACCOUNTS?)\s*[:\-\t]?\s*([0-9]+)/i);
    if (untaggedAccMatch) summary.untaggedAccounts = parseInt(untaggedAccMatch[1], 10);

    const totBalMatch = text.match(/(?:TOTAL\s+CURRENT\s+BALANCE|TOTAL\s+BALANCE|CURRENT\s+BALANCE\s+TOTAL)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (totBalMatch) summary.totalCurrentBalance = parseNumericValue(totBalMatch[1]) ?? undefined;

    const balSecMatch = text.match(/(?:CURRENT\s+BALANCE\s+SECURED|SECURED\s+BALANCE)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (balSecMatch) summary.currentBalanceSecured = parseNumericValue(balSecMatch[1]) ?? undefined;

    const balUnsecMatch = text.match(/(?:CURRENT\s+BALANCE\s+UNSECURED|UNSECURED\s+BALANCE)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (balUnsecMatch) summary.currentBalanceUnsecured = parseNumericValue(balUnsecMatch[1]) ?? undefined;

    const sancMatch = text.match(/(?:TOTAL\s+SANCTIONED\s+AMOUNT|SANCTIONED\s+AMOUNT|HIGH\s+CREDIT\s+TOTAL)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (sancMatch) summary.totalSanctionedAmount = parseNumericValue(sancMatch[1]) ?? undefined;

    const disbMatch = text.match(/(?:TOTAL\s+DISBURSED\s+AMOUNT|DISBURSED\s+AMOUNT\s+TOTAL)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (disbMatch) summary.totalDisbursedAmount = parseNumericValue(disbMatch[1]) ?? undefined;

    const overAmtMatch = text.match(/(?:TOTAL\s+AMOUNT\s+OVERDUE|TOTAL\s+OVERDUE|OVERDUE\s+AMOUNT\s+TOTAL)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (overAmtMatch) summary.totalAmountOverdue = parseNumericValue(overAmtMatch[1]) ?? undefined;

    return summary;
  }
}
