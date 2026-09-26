import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PDReportPrintData } from '../utils/pdReportPrinter';
import {
  generateStandardPDReportHTML,
  generateMoneyboxxPDReportHTML,
  generateSbfcPDReportHTML,
  generateGodrejPDReportHTML,
  generateTataCapitalPDReportHTML
} from '../utils/pdReportPrinter';

/**
 * Returns the appropriate HTML template string based on client bank name
 */
export function getReportHTMLForData(data: PDReportPrintData): string {
  const bankName = (data.clientBankName || '').toLowerCase();
  if (bankName.includes('moneyboxx')) {
    return generateMoneyboxxPDReportHTML(data);
  }
  if (bankName.includes('sbfc')) {
    return generateSbfcPDReportHTML(data);
  }
  if (bankName.includes('godrej')) {
    return generateGodrejPDReportHTML(data);
  }
  if (bankName.includes('tata capital')) {
    return generateTataCapitalPDReportHTML(data);
  }
  return generateStandardPDReportHTML(data);
}

/**
 * Generates a high-quality multi-page PDF Blob from PDReportPrintData
 */
export async function generatePdfBlobFromData(
  data: PDReportPrintData,
  onProgress?: (progress: { step: string; percent: number }) => void
): Promise<{ blob: Blob; fileName: string; sizeBytes: number }> {
  onProgress?.({ step: 'Preparing report layout & embedded photos...', percent: 15 });

  const rawHtml = getReportHTMLForData(data);
  const cleanApplicant = (data.applicantName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanAppNo = (data.applicationNumber || 'INF').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `PD_Report_${cleanApplicant}_${cleanAppNo}.pdf`;

  // Create an isolated, styled sandbox container in the DOM
  const sandbox = document.createElement('div');
  sandbox.id = 'pdf-render-sandbox';
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-9999px';
  sandbox.style.top = '0';
  sandbox.style.width = '794px'; // 210mm at 96dpi (A4 standard width)
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.zIndex = '-99999';
  sandbox.style.opacity = '1';
  sandbox.innerHTML = rawHtml;
  document.body.appendChild(sandbox);

  try {
    onProgress?.({ step: 'Loading and pre-rendering high-resolution photos...', percent: 35 });

    // Wait for all images inside the sandbox to fully load
    const images = Array.from(sandbox.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // continue even if an image fails
        });
      })
    );

    // Give a brief tick for fonts/styles to settle
    await new Promise(r => setTimeout(r, 200));

    onProgress?.({ step: 'Capturing document pages with visual fidelity...', percent: 55 });

    // Check if the HTML has distinct page containers (e.g. .exec-page, .cover-page, etc.)
    let pageElements = Array.from(sandbox.querySelectorAll('.exec-page, .cover-page, .report-page, .page')) as HTMLElement[];

    // If no distinct page classes found, use direct children or the sandbox container itself
    if (pageElements.length === 0) {
      pageElements = [sandbox];
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfPageWidth = 210; // mm
    const pdfPageHeight = 297; // mm
    let isFirstPdfPage = true;

    for (let i = 0; i < pageElements.length; i++) {
      const pageElem = pageElements[i];
      const pagePct = 55 + Math.round(((i + 1) / pageElements.length) * 35);
      onProgress?.({ step: `Rendering page ${i + 1} of ${pageElements.length} (including photos)...`, percent: pagePct });

      const canvas = await html2canvas(pageElem, {
        scale: 2, // High resolution crisp text & photos
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794
      });

      const imgWidth = pdfPageWidth;
      const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;

      if (imgHeight <= pdfPageHeight + 2) {
        // Fits on a single A4 page
        if (!isFirstPdfPage) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfPageHeight), undefined, 'FAST');
        isFirstPdfPage = false;
      } else {
        // Multi-page content that needs vertical slicing
        let currentY = 0;
        const pageCanvasHeight = (canvas.width * pdfPageHeight) / pdfPageWidth;

        while (currentY < canvas.height) {
          const sliceHeight = Math.min(pageCanvasHeight, canvas.height - currentY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageCanvasHeight;

          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0, currentY, canvas.width, sliceHeight,
              0, 0, canvas.width, sliceHeight
            );

            if (!isFirstPdfPage) pdf.addPage();
            const pageData = pageCanvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(pageData, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight, undefined, 'FAST');
            isFirstPdfPage = false;
          }
          currentY += pageCanvasHeight;
        }
      }
    }

    onProgress?.({ step: 'Compiling final PDF package...', percent: 95 });
    const pdfBlob = pdf.output('blob');

    return {
      blob: pdfBlob,
      fileName,
      sizeBytes: pdfBlob.size
    };
  } finally {
    // Clean up sandbox DOM element
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}
