import { CibilApplicantParser } from './CibilApplicantParser.js';
import { CibilSummaryParser } from './CibilSummaryParser.js';
import { CibilAccountParser } from './CibilAccountParser.js';
import { normalizeReport, ParsedReportResult } from '../normalization/normalizeReport.js';
import { logger } from '../../utils/logger.js';

export class CibilParser {
  private applicantParser = new CibilApplicantParser();
  private summaryParser = new CibilSummaryParser();
  private accountParser = new CibilAccountParser();

  public async parse(text: string): Promise<ParsedReportResult> {
    logger.info('Executing CIBIL CIR Report Parser pipeline');

    const applicant = this.applicantParser.parse(text);
    const summary = this.summaryParser.parse(text);
    const accounts = this.accountParser.parse(text, applicant.name);

    const normalized = normalizeReport('CIBIL', applicant, summary, accounts);
    normalized.rawTextLength = text.length;

    logger.info('CIBIL Report successfully parsed and normalized', {
      accountsFound: normalized.accounts.length,
      applicantNamePresent: !!normalized.applicant.name,
      score: normalized.applicant.score,
    });

    return normalized;
  }
}
