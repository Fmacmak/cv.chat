import { NextResponse } from 'next/server';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function POST(request: Request) {
  try {
    console.log('📄 Starting batch PDF text extraction...');
    const { files } = await request.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.warn('❌ No files provided in request');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 100) {
      console.warn('❌ Too many files requested');
      return NextResponse.json({ error: 'Maximum 100 files allowed' }, { status: 400 });
    }

    const results = await Promise.all(
      files.map(async (file, index) => {
        try {
          console.log(`🔄 Processing file ${index + 1}/${files.length}...`);
          const pdfBuffer = new Uint8Array(Buffer.from(file, 'base64'));

          const loadingTask = pdfjs.getDocument({
            data: pdfBuffer,
            useWorkerFetch: false,
            isEvalSupported: false
          });
          const pdf = await loadingTask.promise;

          let extractedText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            extractedText += pageText + '\n';
          }

          return { success: true, text: extractedText };
        } catch (error) {
          console.error(`❌ Error processing file ${index + 1}:`, error);
          return { success: false, error: 'Failed to extract text' };
        }
      })
    );

    console.log('✅ Batch processing completed');
    return NextResponse.json({ results });
  } catch (error) {
    console.error('❌ Error in batch processing:', error);
    return NextResponse.json({ error: 'Failed to process files' }, { status: 500 });
  }
}
