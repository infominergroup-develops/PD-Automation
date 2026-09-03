import { AccountData } from '../normalization/normalizeReport.js';
import { parseNumericValue, parseDateString } from '../../utils/formatters.js';

export class CibilAccountParser {
  public parse(text: string, applicantName?: string | null): Partial<AccountData>[] {
    const accounts: Partial<AccountData>[] = [];

    // CIBIL format separates accounts by "Account :", "Account #", "Account Information", or Member / Account Type
    const accountBlockRegex = /(?:ACCOUNT\s*:\s*\d+|ACCOUNT\s+INFORMATION|TRADELINE\s*#?\s*\d+|MEMBER\s+NAME\s*:|ACCOUNT\s+TYPE\s*:)/gi;
    
    const markers: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = accountBlockRegex.exec(text)) !== null) {
      markers.push(match.index);
    }

    if (markers.length > 0) {
      for (let i = 0; i < markers.length; i++) {
        const start = markers[i];
        const end = i < markers.length - 1 ? markers[i + 1] : text.length;
        const block = text.substring(start, end);
        const parsed = this.parseCibilBlock(block, applicantName, i + 1);
        if (parsed) accounts.push(parsed);
      }
    } else {
      // Fallback block splitter on loan types
      const lines = text.split(/\r?\n/);
      let inAccountSection = false;
      let buffer: string[] = [];

      for (const line of lines) {
        if (/ACCOUNT\s+SECTION|ACCOUNT\s+DETAILS|ACCOUNTS\s+SUMMARY/i.test(line)) {
          inAccountSection = true;
          continue;
        }
        if (inAccountSection) {
          if (/(?:HOUSING\s+LOAN|AUTO\s+LOAN|CREDIT\s+CARD|PERSONAL\s+LOAN|CONSUMER\s+LOAN|TWO\s+WHEELER|BUSINESS\s+LOAN|GOLD\s+LOAN|COMMERCIAL\s+VEHICLE)/i.test(line)) {
            if (buffer.length > 0) {
              const parsed = this.parseCibilBlock(buffer.join('\n'), applicantName, accounts.length + 1);
              if (parsed) accounts.push(parsed);
              buffer = [];
            }
          }
          buffer.push(line);
        }
      }
      if (buffer.length > 0) {
        const parsed = this.parseCibilBlock(buffer.join('\n'), applicantName, accounts.length + 1);
        if (parsed) accounts.push(parsed);
      }
    }

    return accounts;
  }

  private parseCibilBlock(block: string, applicantName?: string | null, index = 1): Partial<AccountData> | null {
    // Account Type
    let accountType: string | null = null;
    const typeMatch = block.match(/(?:ACCOUNT\s+TYPE|TYPE\s+OF\s+ACCOUNT|LOAN\s+TYPE)\s*[:\-\t]?\s*([A-Za-z0-9\s/]+?)(?:\r?\n|MEMBER|OWNERSHIP|DATE|HIGH|SANCTIONED|BALANCE|$)/i) ||
                      block.match(/\b(HOUSING\s+LOAN|HOME\s+LOAN|AUTO\s+LOAN|CAR\s+LOAN|PERSONAL\s+LOAN|CREDIT\s+CARD|TWO\s+WHEELER\s+LOAN|BUSINESS\s+LOAN|COMMERCIAL\s+VEHICLE|GOLD\s+LOAN|OVERDRAFT|MORTGAGE|EDUCATION\s+LOAN|CONSUMER\s+DURABLE\s+LOAN)\b/i);
    if (typeMatch) accountType = typeMatch[1].trim();

    // Member Name / Credit Grantor
    let creditGrantor: string | null = null;
    const memberMatch = block.match(/(?:MEMBER\s+NAME|CREDIT\s+GRANTOR|FINANCIAL\s+INSTITUTION|LENDER\s+NAME|BANK\s+NAME)\s*[:\-\t]?\s*([A-Za-z0-9\s.,&]+?)(?:\r?\n|ACCOUNT|OWNERSHIP|DATE|SANCTIONED|$)/i) ||
                        block.match(/\b(HDFC\s+BANK|ICICI\s+BANK|STATE\s+BANK\s+OF\s+INDIA|SBI|AXIS\s+BANK|KOTAK\s+MAHINDRA\s+BANK|BAJAJ\s+FINANCE|TATA\s+CAPITAL|IDFC\s+FIRST\s+BANK|PUNJAB\s+NATIONAL\s+BANK|PNB|BANK\s+OF\s+BARODA|INDUSIND\s+BANK|CANARA\s+BANK|UNION\s+BANK|CHOLAMANDALAM|MUTHOOT|MANAPPURAM|L&T\s+FINANCE|ADITYA\s+BIRLA|STANDARD\s+CHARTERED|CITIBANK|HSBC)\b/i);
    if (memberMatch) creditGrantor = memberMatch[1].trim();

    // Status
    let status: 'Active' | 'Closed' | null = null;
    const statusMatch = block.match(/(?:ACCOUNT\s+STATUS|STATUS|PAYMENT\s+STATUS)\s*[:\-\t]?\s*(ACTIVE|OPEN|CLOSED|SETTLED|WRITTEN\s+OFF|RESTUCTURED|SUIT\s+FILED)/i);
    if (statusMatch) {
      const s = statusMatch[1].toUpperCase();
      status = /ACTIVE|OPEN/.test(s) ? 'Active' : 'Closed';
    }

    // Ownership
    let ownership: string | null = null;
    const ownMatch = block.match(/(?:OWNERSHIP\s+INDICATOR|OWNERSHIP)\s*[:\-\t]?\s*([A-Za-z]+)/i);
    if (ownMatch) ownership = ownMatch[1].trim();

    // Disbursed / Sanctioned Date
    let disbursedDate: string | null = null;
    const dateOpenMatch = block.match(/(?:DATE\s+OPENED|DISBURSED\s+DATE|SANCTION\s+DATE|DATE\s+OF\s+SANCTION)\s*[:\-\t]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (dateOpenMatch) disbursedDate = parseDateString(dateOpenMatch[1]);

    // High Credit / Sanctioned Amount / Disbursed Amount
    let disbursedAmount: number | null = null;
    const amountMatch = block.match(/(?:HIGH\s+CREDIT\s+AMOUNT|SANCTIONED\s+AMOUNT|HIGH\s+CREDIT|DISBURSED\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (amountMatch) disbursedAmount = parseNumericValue(amountMatch[1]);

    // Current Balance
    let currentBalance: number | null = null;
    const balMatch = block.match(/(?:CURRENT\s+BALANCE|BALANCE\s+OUTSTANDING|OUTSTANDING)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (balMatch) currentBalance = parseNumericValue(balMatch[1]);

    // Amount Overdue
    let overdueAmount: number | null = null;
    const ovdMatch = block.match(/(?:AMOUNT\s+OVERDUE|OVERDUE\s+AMOUNT|PAST\s+DUE\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (ovdMatch) overdueAmount = parseNumericValue(ovdMatch[1]);

    // EMI Amount
    let instalmentAmount: number | null = null;
    const emiMatch = block.match(/(?:EMI\s+AMOUNT|MONTHLY\s+PAYMENT\s+AMOUNT|REPAYMENT\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (emiMatch) instalmentAmount = parseNumericValue(emiMatch[1]);

    // Payment Frequency
    let frequency: string | null = null;
    const freqMatch = block.match(/(?:PAYMENT\s+FREQUENCY|FREQUENCY)\s*[:\-\t]?\s*([A-Za-z]+)/i);
    if (freqMatch) frequency = freqMatch[1].trim();

    // Tenure
    let tenureMonths: number | null = null;
    const tenMatch = block.match(/(?:REPAYMENT\s+TENURE|TENURE)\s*[:\-\t]?\s*([0-9]+)/i);
    if (tenMatch) tenureMonths = parseInt(tenMatch[1], 10);

    // Interest Rate
    let interestRate: number | null = null;
    const intMatch = block.match(/(?:RATE\s+OF\s+INTEREST|INTEREST\s+RATE)\s*[:\-\t]?\s*([0-9.]+)%?/i);
    if (intMatch) interestRate = parseNumericValue(intMatch[1]);

    // Date of Last Payment
    let lastPaymentDate: string | null = null;
    const lastPayMatch = block.match(/(?:DATE\s+OF\s+LAST\s+PAYMENT|LAST\s+PAYMENT\s+DATE)\s*[:\-\t]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (lastPayMatch) lastPaymentDate = parseDateString(lastPayMatch[1]);

    // Date Reported / As On Date
    let asOnDate: string | null = null;
    const asOnMatch = block.match(/(?:DATE\s+REPORTED\s+AND\s+CERTIFIED|DATE\s+REPORTED|DATE\s+CLOSED|AS\s+ON\s+DATE)\s*[:\-\t]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (asOnMatch) asOnDate = parseDateString(asOnMatch[1]);

    if (accountType || creditGrantor || disbursedAmount !== null || currentBalance !== null) {
      return {
        id: `cibil_acc_${index}`,
        applicantName: applicantName || null,
        accountType: accountType || 'Loan Facility',
        creditGrantor: creditGrantor || 'Credit Institution',
        lenderType: 'Bank',
        status: status || (currentBalance && currentBalance > 0 ? 'Active' : 'Closed'),
        ownership: ownership || 'Individual',
        disbursedDate,
        disbursedAmount,
        currentBalance,
        overdueAmount: overdueAmount ?? 0,
        instalmentAmount,
        frequency: frequency || 'Monthly',
        tenureMonths,
        interestRate,
        lastPaymentDate,
        asOnDate,
      };
    }

    return null;
  }
}
