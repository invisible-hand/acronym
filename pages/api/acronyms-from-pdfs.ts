import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

// Heuristic: Find lines like "A.S.H.E. A Safe Home for Everyone", "A&O(x3) alert and oriented (x3=person, place and time)"
const acronymLineRegex = /^([A-Za-z0-9.&()\/-]+)\s+(.+)$/gm;

async function extractAcronymsFromPDF(pdfPath: string) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text;
  // Log the first 500 chars for debugging
  console.log(`--- PDF: ${pdfPath} ---\n${text.slice(0, 500)}\n--- END PDF ---`);
  const results: { acronym: string; meaning: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = acronymLineRegex.exec(text))) {
    results.push({ acronym: match[1], meaning: match[2].trim() });
  }
  return results;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pdfDir = path.resolve(process.cwd(), 'pdfs');
  if (!fs.existsSync(pdfDir)) {
    return res.status(200).json([]);
  }
  const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
  let allAcronyms: { acronym: string; meaning: string }[] = [];
  for (const file of files) {
    try {
      const acronyms = await extractAcronymsFromPDF(path.join(pdfDir, file));
      allAcronyms = allAcronyms.concat(acronyms);
    } catch (e) {
      // skip errors
    }
  }
  // Remove duplicates
  const unique = Array.from(
    new Map(allAcronyms.map(a => [a.acronym, a])).values()
  );
  res.status(200).json(unique);
}
