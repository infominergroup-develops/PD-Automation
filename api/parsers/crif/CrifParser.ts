import { CrifApplicantParser } from './CrifApplicantParser.js';
import { CrifSummaryParser } from './CrifSummaryParser.js';
import { CrifAccountParser } from './CrifAccountParser.js';
import { normalizeReport, ParsedReportResult } from '../normalization/normalizeReport.js';
import { logger } from '../../utils/logger.js';

export class CrifParser {
  private applicantParser = new CrifApplicantParser();
  private summaryParser = new CrifSummaryParser();
  private accountParser = new CrifAccountParser();

  public async parse(text: string): Promise<ParsedReportResult> {
    logger.info('Executing CRIF High Mark Report Parser pipeline');

    const applicant = this.applicantParser.parse(text);
    const summary = this.summaryParser.parse(text);
    const accounts = this.accountParser.parse(text, applicant.name);

    const normalized = normalizeReport('CRIF', applicant, summary, accounts);
    normalized.rawTextLength = text.length;

    logger.info('CRIF Report successfully parsed and normalized', {
      accountsFound: normalized.accounts.length,
      applicantNamePresent: !!normalized.applicant.name,
      score: normalized.applicant.score,
    });

    return normalized;
  }
}
