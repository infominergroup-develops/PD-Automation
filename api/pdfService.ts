import { logger } from './logger.js';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export class PdfService {
  /**
   * Extracts clean text content from a raw PDF buffer
   */
  public async extractText(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(pdfBuffer);
      if (!data || !data.text) {
        throw new Error('PDF parsing resulted in empty text stream');
      }
      return data.text;
    } catch (err) {
      logger.warn('pdf-parse encountered an error, attempting raw stream buffer extraction', { error: String(err) });
      // Fallback extraction from raw ASCII/UTF-8 buffer stream
      const rawText = this.extractRawStringsFromBuffer(pdfBuffer);
      if (rawText.length > 50) {
        return rawText;
      }
      throw new Error(`Failed to extract text from PDF: ${err instanceof Error ? err.message : 'Corrupted or unreadable PDF'}`);
    }
  }

  /**
   * Detects whether the PDF text is CRIF High Mark or CIBIL
   */
  public detectProvider(text: string, defaultProvider: 'CRIF' | 'CIBIL' = 'CRIF'): 'CRIF' | 'CIBIL' {
    const isCrif = /CRIF|HIGH\s*MARK|CHM\s*REF|HIGHMARK/i.test(text);
    const isCibil = /CIBIL|TRANSUNION|CIR\s*REPORT|ECN\s*:/i.test(text);

    if (isCrif && !isCibil) return 'CRIF';
    if (isCibil && !isCrif) return 'CIBIL';
    return defaultProvider;
  }

  private extractRawStringsFromBuffer(buffer: Buffer): string {
    const str = buffer.toString('latin1');
    const matches = str.match(/\(([^()]{3,})\)|\[([^\[\]]{3,})\]/g);
    if (matches && matches.length > 0) {
      return matches.map(m => m.slice(1, -1)).join(' ');
    }
    return str.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }
}

export const pdfService = new PdfService();
