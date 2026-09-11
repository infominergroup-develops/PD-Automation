import * as ExceljsModule from 'exceljs';
const ExcelJS = (ExceljsModule as any).default || ExceljsModule;

export async function parseExcelTemplate(buffer: Buffer): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  
  const tags = new Set<string>();
  const tagRegex = /\{\{([^}]+)\}\}/g;

  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.type === ExcelJS.ValueType.String && cell.value) {
          const text = cell.value.toString();
          let match;
          while ((match = tagRegex.exec(text)) !== null) {
            tags.add(match[1].trim());
          }
        } else if (cell.type === ExcelJS.ValueType.RichText && cell.value && (cell.value as any).richText) {
          const richTextArr = (cell.value as any).richText;
          const text = richTextArr.map((rt: any) => rt.text).join('');
          let match;
          while ((match = tagRegex.exec(text)) !== null) {
            tags.add(match[1].trim());
          }
        }
      });
    });
  });

  return Array.from(tags);
}

export async function generateExcelReport(buffer: Buffer, data: Record<string, any>): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  
  const tagRegex = /\{\{([^}]+)\}\}/g;

  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.type === ExcelJS.ValueType.String && cell.value) {
          let text = cell.value.toString();
          if (text.includes('{{')) {
            text = text.replace(tagRegex, (match, p1) => {
              const key = p1.trim();
              return data[key] !== undefined ? String(data[key]) : match;
            });
            cell.value = text;
          }
        } else if (cell.type === ExcelJS.ValueType.RichText && cell.value && (cell.value as any).richText) {
          const richTextArr = (cell.value as any).richText;
          let text = richTextArr.map((rt: any) => rt.text).join('');
          if (text.includes('{{')) {
             text = text.replace(tagRegex, (match, p1) => {
                const key = p1.trim();
                return data[key] !== undefined ? String(data[key]) : match;
             });
             cell.value = text;
          }
        }
      });
    });
  });

  const outputBuffer = await workbook.xlsx.writeBuffer();
  return outputBuffer as any as Buffer;
}
