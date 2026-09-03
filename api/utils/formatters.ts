export function formatIndianCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  
  const str = absAmount.toString();
  let result = '';
  if (str.length > 3) {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = formattedOther + ',' + lastThree;
  } else {
    result = str;
  }
  return `${isNegative ? '-' : ''}₹${result}`;
}

export function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  
  if (typeof value === 'string') {
    // Remove ₹, commas, INR, spaces, quotes
    const cleaned = value.replace(/[₹,INR\s"']/gi, '').trim();
    if (cleaned === '' || cleaned === '-' || cleaned.toLowerCase() === 'na' || cleaned.toLowerCase() === 'null') {
      return null;
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

export function parseDateString(value: unknown): string | null {
  if (!value || typeof value !== 'string') return null;
  const clean = value.trim();
  if (!clean || clean === '-' || clean.toLowerCase() === 'na' || clean.toLowerCase() === 'null') return null;
  
  // Supported formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MMM-YYYY (e.g. 15-JAN-2023)
  const ddmmyyyy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${day}-${month}-${year}`;
  }
  
  return clean;
}

export function maskPAN(pan: string | null | undefined): string {
  if (!pan || typeof pan !== 'string' || pan.length < 5) return 'XXXXX0000X';
  const clean = pan.trim().toUpperCase();
  if (clean.length === 10) {
    return `${clean.substring(0, 2)}XXXXXX${clean.substring(8)}`;
  }
  return 'XXXXX' + clean.slice(-4);
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string' || phone.length < 4) return 'XXXXXX0000';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `XXXXXX${clean.slice(-4)}`;
  }
  return `XXXX${clean.slice(-2)}`;
}
