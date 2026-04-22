import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw Object.assign(new Error('File not found'), { statusCode: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.pdf') {
    throw Object.assign(new Error('Only PDF files are supported for text extraction'), { statusCode: 422 });
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length < 50) {
    throw Object.assign(
      new Error('Could not extract meaningful text from PDF. Make sure it is a text-based PDF, not a scanned image.'),
      { statusCode: 422 }
    );
  }

  return data.text;
}
