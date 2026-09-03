import { ApplicantData } from '../normalization/normalizeReport.js';
import { parseNumericValue } from '../../utils/formatters.js';

export class CibilApplicantParser {
  public parse(text: string): Partial<ApplicantData> {
    const applicant: Partial<ApplicantData> = {};

    // CIBIL Name Extraction
    const nameMatch = 
      text.match(/(?:CONSUMER\s+NAME|NAME)\s*[:\-\t]\s*([A-Z\s.]{3,50})(?:\r?\n|DATE\s+OF\s+BIRTH|DOB|GENDER|IDENTIFICATION|CONTROL)/i) ||
      text.match(/(?:NAME\s*:\s*)([^\n\r]+)/i);
    if (nameMatch && nameMatch[1]) {
      applicant.name = nameMatch[1].replace(/^(MR|MS|MRS|DR|SH)\.?\s+/i, '').trim();
    }

    // DOB
    const dobMatch = text.match(/(?:DATE\s+OF\s+BIRTH|DOB|BIRTH\s+DATE)\s*[:\-\t]\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (dobMatch) {
      applicant.dob = dobMatch[1].trim();
    }

    // PAN
    const panMatch = text.match(/(?:PAN|INCOME\s+TAX\s+ID|INCOME\s+TAX\s+PAN)\s*[:\-\t]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i) ||
                     text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
    if (panMatch) {
      applicant.pan = panMatch[1].toUpperCase().trim();
    }

    // Phone / Mobile
    const phoneMatch = text.match(/(?:MOBILE|TELEPHONE|PHONE)\s*(?:NUMBER|NO\.?)?\s*[:\-\t]?\s*([+0-9\s-]{10,15})/i);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[1].replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        applicant.phone = cleanPhone.slice(-10);
      }
    }

    // CIBIL Score (TransUnion Score 300 - 900)
    const scoreMatch = 
      text.match(/(?:CIBIL\s+TRANSUNION\s+SCORE(?:\s+2\.0)?|CIBIL\s+SCORE|TRANSUNION\s+SCORE|SCORE)\s*[:\-\t]?\s*([0-9]{3})/i) ||
      text.match(/SCORE\s*[:\-\t]?\s*([0-9]{3})/i);
    if (scoreMatch) {
      const scoreVal = parseNumericValue(scoreMatch[1]);
      if (scoreVal && scoreVal >= 300 && scoreVal <= 900) {
        applicant.score = scoreVal;
      }
    }

    // Control Number / Reference
    const controlMatch = text.match(/(?:CONTROL\s+NUMBER|ECN|REPORT\s+CONTROL\s+NUMBER|CIBIL\s+CONTROL\s+NO\.?)\s*[:\-\t]?\s*([0-9A-Za-z\-]+)/i);
    if (controlMatch) {
      applicant.reference = controlMatch[1].trim();
    }

    // Report Date / Date Processed
    const dateMatch = text.match(/(?:DATE\s+PROCESSED|DATE\s+OF\s+ISSUE|REPORT\s+DATE|DATE)\s*[:\-\t]\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (dateMatch) {
      applicant.reportDate = dateMatch[1].trim();
    }

    // Address
    const addressMatch = text.match(/(?:ADDRESS(?:ES)?|PERMANENT\s+ADDRESS|RESIDENTIAL\s+ADDRESS)\s*[:\-\t]\s*([^\n\r]+(?:\r?\n[^\n\r]+)?)/i);
    if (addressMatch) {
      applicant.address = addressMatch[1].replace(/\s+/g, ' ').trim();
    }

    return applicant;
  }
}
