import { ApplicantData } from '../normalization/normalizeReport.js';
import { parseNumericValue } from '../../utils/formatters.js';

export class CrifApplicantParser {
  public parse(text: string): Partial<ApplicantData> {
    const applicant: Partial<ApplicantData> = {};

    // Name Extraction
    const nameMatch =
      text.match(/For\s+([\w\s.]{3,60}?)(?:CHM Ref|Prepared|Order ID|Report)/i) ||
      text.match(/(?:Name|Applicant Name|Borrower Name)\s*[:\-\t]\s*([\w\s.]{3,50})(?:DOB|Father|PAN|Age|Phone|$)/i) ||
      text.match(/Name\s*:\s*([A-Za-z\s.]+?)(?:\r?\n|DOB)/i) ||
      text.match(/(?:REPORT\s+FOR\s*:\s*|BORROWER\s+NAME\s*:\s*|CONSUMER\s+NAME\s*:\s*|NAME\s*:\s*)([A-Z\s.]{3,50})(?:\r?\n|DOB|DATE|PAN|GENDER|ADDRESS|PHONE)/i);
    
    if (nameMatch && nameMatch[1]) {
      applicant.name = nameMatch[1].replace(/^(MR|MS|MRS|DR|SH)\.?\s+/i, '').trim();
    }

    // DOB Extraction
    const dobMatch =
      text.match(/DOB\/Age:\s*([\d\-]+)/i) ||
      text.match(/(?:DOB|Date of Birth)\s*[:\-\t]\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4}|[\d\-]+)/i);
    if (dobMatch) {
      applicant.dob = dobMatch[1].trim();
    }

    // PAN Extraction
    const panMatch =
      text.match(/([A-Z]{5}[0-9]{4}[A-Z])\s*\[PAN\]/i) ||
      text.match(/(?:PAN|INCOME\s+TAX\s+PAN)\s*[:\-\t]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i) ||
      text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
    if (panMatch) {
      applicant.pan = panMatch[1].toUpperCase().trim();
    }

    // Phone / Mobile Extraction
    const phoneMatch =
      text.match(/Phone Numbers?:\s*([\d\s+]+)/i) ||
      text.match(/(?:MOBILE|PHONE|CONTACT|TEL)\s*(?:NO\.?|NUMBER)?\s*[:\-\t]?\s*([+0-9\s-]{10,15})/i);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[1].replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        applicant.phone = cleanPhone.slice(-10);
      }
    }

    // CRIF High Mark Score Extraction
    const scoreMatch =
      text.match(/PERFORM CONSUMER[\d\.\s]+[\d]{3}-[\d]{3}\s+(\d{3})/i) ||
      text.match(/(?:CRIF(?:\s+HIGH\s+MARK)?\s+SCORE|SCORE\s*\(CRIF\)|HIGH\s*MARK\s*SCORE|SCORE)\s*[:\-\t]?\s*([0-9]{3})/i) ||
      text.match(/SCORE\s*[:\-\t]?\s*([0-9]{3})/i);
    if (scoreMatch) {
      const scoreVal = parseNumericValue(scoreMatch[1]);
      if (scoreVal && scoreVal >= 300 && scoreVal <= 900) {
        applicant.score = scoreVal;
      }
    }

    // Report Date
    const reportDateMatch =
      text.match(/Date of Request:\s*([\d\-]+ [\d:]+)/i) ||
      text.match(/(?:REPORT\s+DATE|DATE\s+OF\s+REPORT|ORDER\s+DATE|DATE\s+ISSUED)\s*[:\-\t]\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4}|[0-9]{2}-[A-Za-z]{3}-[0-9]{4})/i);
    if (reportDateMatch) {
      applicant.reportDate = reportDateMatch[1].trim();
    }

    // CHM Reference
    const refMatch =
      text.match(/CHM Ref #?:\s*(\S+)/i) ||
      text.match(/(?:CHM\s*(?:REF|REFERENCE)?|REPORT\s+ID|ORDER\s+NO|REFERENCE\s+NO)\s*[:\-\t]\s*([A-Za-z0-9\-_]{6,30})/i);
    if (refMatch) {
      applicant.reference = refMatch[1].trim();
    }

    // Address
    const addressMatch =
      text.match(/Current Address:\s*(.+?)(?:\n|Other Address|Phone|Email|Identification|$)/i) ||
      text.match(/(?:ADDRESS|CURRENT\s+ADDRESS|RESIDENTIAL\s+ADDRESS)\s*[:\-\t]\s*([^\n\r]+(?:(?:\r?\n)(?![A-Z0-9\s]+:)[^\n\r]+)?)/i);
    if (addressMatch) {
      applicant.address = addressMatch[1].replace(/\s+/g, ' ').trim();
    }

    return applicant;
  }
}
