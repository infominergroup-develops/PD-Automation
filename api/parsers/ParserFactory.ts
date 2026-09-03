import { CrifParser } from './crif/CrifParser.js';
import { CibilParser } from './cibil/CibilParser.js';
import { ParsedReportResult } from './normalization/normalizeReport.js';

export interface ReportParser {
  parse(text: string): Promise<ParsedReportResult>;
}

export class ParserFactory {
  private static crifParser = new CrifParser();
  private static cibilParser = new CibilParser();

  public static getParser(provider: 'CRIF' | 'CIBIL' | string): ReportParser {
    const cleanProvider = String(provider).toUpperCase().trim();
    if (cleanProvider === 'CIBIL') {
      return this.cibilParser;
    }
    // Default to CRIF parser
    return this.crifParser;
  }
}
