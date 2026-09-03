import { AccountData } from '../normalization/normalizeReport.js';
import { parseNumericValue, parseDateString } from '../../utils/formatters.js';

export class CrifAccountParser {
  public parse(text: string, applicantName?: string | null): Partial<AccountData>[] {
    const accounts: Partial<AccountData>[] = [];

    // 1. Primary CRIF Chunking: Split by Account Type:
    if (/Account Type:/i.test(text)) {
      const chunks = text.split(/(?=Account Type:)/i);
      chunks.forEach((chunk, index) => {
        if (!/Account Type:/i.test(chunk)) return;

        const re1 = (pattern: RegExp) => {
          const m = chunk.match(pattern);
          return m && m[1] ? m[1].trim() : '';
        };

        const accountType = re1(/Account Type:\s*(.+?)(?:Credit Grantor:|$)/i);
        const creditGrantor = re1(/Credit Grantor:\s*(.+?)(?:Account #:|$)/i);
        const lenderType = re1(/Lender Type:\s*(\w+)/i);

        let status: 'Active' | 'Closed' = 'Active';
        let ownership = 'Individual';

        const statusM = chunk.match(/(Acti\s*v\s*O?e?wnership|Active\s*Ownership|Closed\s*Ownership):\s*(\w+)/i);
        if (statusM) {
          status = /clos/i.test(statusM[1]) ? 'Closed' : 'Active';
          ownership = statusM[2] || 'Individual';
        } else {
          const sm = chunk.match(/\n(Active|Closed)\s*[\n ]/i);
          status = sm ? (sm[1].toLowerCase() === 'closed' ? 'Closed' : 'Active') : (/Closed Date:\s*[\d\-]+/i.test(chunk) ? 'Closed' : 'Active');
          const own = re1(/Ownership:\s*(\w+)/i);
          if (own) ownership = own;
        }

        const disbursedDate = re1(/Disbursed Date:\s*([\d\-]+)/i);
        const disbursedAmount = parseNumericValue(re1(/Disbd Amt\/High Credit:\s*([\d,]+)/i));
        const currentBalance = parseNumericValue(re1(/Current Balance:\s*([\d,]+)/i));
        const overdueAmount = parseNumericValue(re1(/Overdue Amt:\s*([\d,]+)/i)) ?? 0;
        const lastPaymentDate = re1(/Last Payment Date:\s*([\d\-]+)/i);

        let instalmentAmount: number | null = null;
        let frequency: string | null = null;
        const instM = chunk.match(/InstlAmt\/Freq:\s*([\d,]+)\/(\w+)/i);
        if (instM) {
          instalmentAmount = parseNumericValue(instM[1]);
          frequency = instM[2];
        }

        const tenureStr = re1(/Tenure\(month\):\s*(\d+)/i);
        const tenureMonths = tenureStr ? parseInt(tenureStr, 10) : null;
        const interestRateStr = re1(/Interest Rate:\s*([\d.]+\s*%?)/i);
        const interestRate = interestRateStr ? parseFloat(interestRateStr.replace(/%/g, '')) : null;
        const asOnDate = re1(/As on:\s*([\d\-]+)/i);

        if (accountType || creditGrantor || disbursedAmount !== null || currentBalance !== null) {
          accounts.push({
            id: `crif_acc_${index + 1}`,
            applicantName: applicantName || null,
            accountType: accountType || 'Credit Facility',
            creditGrantor: creditGrantor || 'Credit Institution',
            lenderType: lenderType || 'Bank',
            status,
            ownership,
            disbursedDate: disbursedDate || null,
            disbursedAmount,
            currentBalance,
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

      if (accounts.length > 0) {
        return accounts;
      }
    }

    // 2. Block-based splitting
    const accountBlockRegex = /(?:ACCOUNT\s*(?:DETAILS|INFORMATION|SUMMARY)?\s*#?\s*\d*|CREDIT\s+FACILITY\s*#?\s*\d*|TRADELINE\s*#?\s*\d*)/gi;
    
    // Check if block markers exist
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
        const parsed = this.parseSingleBlock(block, applicantName, i + 1);
        if (parsed) accounts.push(parsed);
      }
    } else {
      // Fallback: Line-by-line / Table-based extraction for tabular reports
      const lines = text.split(/\r?\n/);
      let inAccountSection = false;
      let buffer: string[] = [];

      for (const line of lines) {
        if (/ACCOUNT\s+DETAILS|ACCOUNTS\s+SUMMARY|TRADELINES|FACILITY\s+DETAILS/i.test(line)) {
          inAccountSection = true;
          continue;
        }

        if (inAccountSection) {
          if (/(?:PERSONAL\s+LOAN|HOUSING\s+LOAN|HOME\s+LOAN|AUTO\s+LOAN|CREDIT\s+CARD|BUSINESS\s+LOAN|GOLD\s+LOAN|TWO\s+WHEELER|OVERDRAFT|MORTGAGE|EDUCATION\s+LOAN|COMMERCIAL\s+VEHICLE)/i.test(line)) {
            if (buffer.length > 0) {
              const parsed = this.parseSingleBlock(buffer.join('\n'), applicantName, accounts.length + 1);
              if (parsed) accounts.push(parsed);
              buffer = [];
            }
          }
          buffer.push(line);
        }
      }

      if (buffer.length > 0) {
        const parsed = this.parseSingleBlock(buffer.join('\n'), applicantName, accounts.length + 1);
        if (parsed) accounts.push(parsed);
      }
    }

    // If still no accounts found, attempt generic regex pattern match
    if (accounts.length === 0) {
      const genericAccounts = this.extractGenericPattern(text, applicantName);
      if (genericAccounts.length > 0) {
        return genericAccounts;
      }
    }

    return accounts;
  }

  private parseSingleBlock(block: string, applicantName?: string | null, index = 1): Partial<AccountData> | null {
    // Determine Account Type
    let accountType: string | null = null;
    const typeMatch = block.match(/(?:ACCOUNT\s+TYPE|TYPE\s+OF\s+FACILITY|FACILITY|LOAN\s+TYPE)\s*[:\-\t]?\s*([A-Za-z0-9\s/]+?)(?:\r?\n|CREDIT|LENDER|STATUS|SANCTIONED|DISBURSED|BALANCE|$)/i) ||
                      block.match(/\b(PERSONAL\s+LOAN|HOUSING\s+LOAN|HOME\s+LOAN|AUTO\s+LOAN|CAR\s+LOAN|CREDIT\s+CARD|BUSINESS\s+LOAN|GOLD\s+LOAN|TWO\s+WHEELER\s+LOAN|OVERDRAFT|COMMERCIAL\s+VEHICLE|MORTGAGE|EDUCATION\s+LOAN|CONSUMER\s+LOAN)\b/i);
    if (typeMatch) {
      accountType = typeMatch[1].trim();
    }

    // Determine Credit Grantor
    let creditGrantor: string | null = null;
    const grantorMatch = block.match(/(?:CREDIT\s+GRANTOR|GRANTOR|BANK|MEMBER\s+NAME|LENDER\s+NAME|FINANCIER)\s*[:\-\t]?\s*([A-Za-z0-9\s.,&]+?)(?:\r?\n|ACCOUNT|STATUS|TYPE|DISBURSED|AMOUNT|$)/i) ||
                         block.match(/\b(HDFC\s+BANK|ICICI\s+BANK|STATE\s+BANK\s+OF\s+INDIA|SBI|AXIS\s+BANK|KOTAK\s+MAHINDRA\s+BANK|BAJAJ\s+FINANCE|TATA\s+CAPITAL|IDFC\s+FIRST\s+BANK|PUNJAB\s+NATIONAL\s+BANK|PNB|BANK\s+OF\s+BARODA|INDUSIND\s+BANK|CANARA\s+BANK|UNION\s+BANK|CHOLAMANDALAM|MUTHOOT|MANAPPURAM|L&T\s+FINANCE|ADITYA\s+BIRLA)\b/i);
    if (grantorMatch) {
      creditGrantor = grantorMatch[1].trim();
    }

    // Determine Lender Type
    let lenderType: string | null = null;
    const lTypeMatch = block.match(/(?:LENDER\s+TYPE|INSTITUTION\s+TYPE)\s*[:\-\t]?\s*([A-Za-z]+)/i);
    if (lTypeMatch) {
      lenderType = lTypeMatch[1].trim();
    }

    // Determine Status
    let status: 'Active' | 'Closed' | null = null;
    const statusMatch = block.match(/(?:ACCOUNT\s+STATUS|STATUS)\s*[:\-\t]?\s*(ACTIVE|OPEN|CLOSED|SETTLED|WRITTEN\s+OFF|LIVE|STANDARD)/i);
    if (statusMatch) {
      const s = statusMatch[1].toUpperCase();
      status = /ACTIVE|OPEN|LIVE|STANDARD/.test(s) ? 'Active' : 'Closed';
    }

    // Ownership
    let ownership: string | null = null;
    const ownMatch = block.match(/(?:OWNERSHIP\s*(?:TYPE)?|RELATION)\s*[:\-\t]?\s*([A-Za-z]+)/i);
    if (ownMatch) ownership = ownMatch[1].trim();

    // Disbursed Date
    let disbursedDate: string | null = null;
    const disbDateMatch = block.match(/(?:DISBURSED\s+DATE|SANCTION\s+DATE|OPENED\s+DATE|DATE\s+OPENED)\s*[:\-\t]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (disbDateMatch) disbursedDate = parseDateString(disbDateMatch[1]);

    // Disbursed Amount / Sanctioned Amount
    let disbursedAmount: number | null = null;
    const disbAmtMatch = block.match(/(?:DISBURSED\s+AMOUNT|SANCTIONED\s+AMOUNT|HIGH\s+CREDIT|ORIGINAL\s+LOAN\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (disbAmtMatch) disbursedAmount = parseNumericValue(disbAmtMatch[1]);

    // Current Balance
    let currentBalance: number | null = null;
    const balMatch = block.match(/(?:CURRENT\s+BALANCE|BALANCE|PRINCIPAL\s+OUTSTANDING|OUTSTANDING\s+BALANCE)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (balMatch) currentBalance = parseNumericValue(balMatch[1]);

    // Overdue Amount
    let overdueAmount: number | null = null;
    const ovdMatch = block.match(/(?:OVERDUE\s+AMOUNT|AMOUNT\s+OVERDUE|PAST\s+DUE|DELINQUENT\s+AMOUNT)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (ovdMatch) overdueAmount = parseNumericValue(ovdMatch[1]);

    // Instalment / EMI Amount
    let instalmentAmount: number | null = null;
    const emiMatch = block.match(/(?:INSTALMENT\s+AMOUNT|EMI\s+AMOUNT|MONTHLY\s+PAYMENT|INSTALLMENT)\s*[:\-\t]?\s*(?:INR|RS\.?|₹)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (emiMatch) instalmentAmount = parseNumericValue(emiMatch[1]);

    // Frequency
    let frequency: string | null = null;
    const freqMatch = block.match(/(?:PAYMENT\s+FREQUENCY|REPAYMENT\s+FREQUENCY|FREQUENCY)\s*[:\-\t]?\s*([A-Za-z]+)/i);
    if (freqMatch) frequency = freqMatch[1].trim();

    // Tenure (Months)
    let tenureMonths: number | null = null;
    const tenMatch = block.match(/(?:TENURE|TENOR|REPAYMENT\s+TENURE|REPAYMENT\s+PERIOD)\s*[:\-\t]?\s*([0-9]+)\s*(?:MONTHS|M)?/i);
    if (tenMatch) tenureMonths = parseInt(tenMatch[1], 10);

    // Interest Rate
    let interestRate: number | null = null;
    const intMatch = block.match(/(?:INTEREST\s+RATE|RATE\s+OF\s+INTEREST|ROI)\s*[:\-\t]?\s*([0-9.]+)%?/i);
    if (intMatch) interestRate = parseNumericValue(intMatch[1]);

    // Last Payment Date
    let lastPaymentDate: string | null = null;
    const lastPayMatch = block.match(/(?:LAST\s+PAYMENT\s+DATE|DATE\s+OF\s+LAST\s+PAYMENT|LAST\s+PAID\s+DATE)\s*[:\-\t]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (lastPayMatch) lastPaymentDate = parseDateString(lastPayMatch[1]);

    // As On Date
    let asOnDate: string | null = null;
    const asOnMatch = block.match(/(?:AS\s+ON\s+DATE|DATE\s+REPORTED|CLOSED\s+DATE)\s*[:\-\t]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (asOnMatch) asOnDate = parseDateString(asOnMatch[1]);

    // Only return if at least accountType or creditGrantor or disbursedAmount exists
    if (accountType || creditGrantor || disbursedAmount !== null || currentBalance !== null) {
      return {
        id: `crif_acc_${index}`,
        applicantName: applicantName || null,
        accountType: accountType || 'Loan Account',
        creditGrantor: creditGrantor || 'Credit Institution',
        lenderType: lenderType || 'Bank',
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

  private extractGenericPattern(text: string, applicantName?: string | null): Partial<AccountData>[] {
    const list: Partial<AccountData>[] = [];
    const loanTypes = ['PERSONAL LOAN', 'HOUSING LOAN', 'AUTO LOAN', 'CREDIT CARD', 'BUSINESS LOAN', 'GOLD LOAN', 'TWO WHEELER LOAN', 'OVERDRAFT'];
    
    for (let i = 0; i < loanTypes.length; i++) {
      const type = loanTypes[i];
      const regex = new RegExp(`${type}[\\s\\S]{1,200}?(?:INR|Rs\\.?|₹)?\\s*([0-9,]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        list.push({
          id: `crif_gen_${i + 1}`,
          applicantName: applicantName || null,
          accountType: type,
          creditGrantor: 'Financial Institution',
          lenderType: 'Bank',
          status: 'Active',
          ownership: 'Individual',
          disbursedAmount: parseNumericValue(match[1]),
          currentBalance: parseNumericValue(match[1]),
          overdueAmount: 0,
        });
      }
    }
    return list;
  }
}
