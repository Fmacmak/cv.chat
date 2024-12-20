import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// @ts-ignore-error
import('pdfjs-dist/legacy/build/pdf.worker.min.mjs');
// import { ReadRawTextByBuffer, ReadFileResponse } from '../../../data/readFile/type';
import { NextResponse } from 'next/server';

type TokenType = {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
};

const readPdfFile = async ({ buffer }: any): Promise<any> => {
  console.log('📚 Starting PDF file processing...');
  
  const readPDFPage = async (doc: any, pageNo: number) => {
    console.log(`📄 Processing page ${pageNo}...`);
    try {
      const page = await doc.getPage(pageNo);
      console.log(`⚙️ Getting text content for page ${pageNo}`);
      const tokenizedText = await page.getTextContent();

      const viewport = page.getViewport({ scale: 1 });
      const pageHeight = viewport.height;
      const headerThreshold = pageHeight * 0.95;
      const footerThreshold = pageHeight * 0.05;
      
      console.log(`📏 Page dimensions - Height: ${pageHeight}, Header threshold: ${headerThreshold}, Footer threshold: ${footerThreshold}`);

      const pageTexts: TokenType[] = tokenizedText.items.filter((token: TokenType) => {
        return (
          !token.transform ||
          (token.transform[5] < headerThreshold && token.transform[5] > footerThreshold)
        );
      });
      console.log(`📝 Found ${pageTexts.length} text tokens after filtering`);

      // concat empty string 'hasEOL'
      let emptyStringsRemoved = 0;
      for (let i = 0; i < pageTexts.length; i++) {
        const item = pageTexts[i];
        if (item.str === '' && pageTexts[i - 1]) {
          pageTexts[i - 1].hasEOL = item.hasEOL;
          pageTexts.splice(i, 1);
          i--;
          emptyStringsRemoved++;
        }
      }
      console.log(`🧹 Removed ${emptyStringsRemoved} empty strings`);

      page.cleanup();
      
      const processedText = pageTexts
        .map((token) => {
          const paragraphEnd = token.hasEOL && /([。？！.?!\n\r]|(\r\n))$/.test(token.str);
          return paragraphEnd ? `${token.str}\n` : token.str;
        })
        .join('');
      
      console.log(`✅ Successfully processed page ${pageNo}`);
      return processedText;
    } catch (error) {
      console.error(`❌ Error processing page ${pageNo}:`, error);
      return '';
    }
  };

  try {
    console.log('🔄 Creating PDF loading task...', buffer);
    const loadingTask = pdfjs.getDocument(buffer.buffer);
    console.log('⏳ Waiting for PDF document to load...');
    const doc = await loadingTask.promise;
    console.log(`📊 PDF loaded successfully. Total pages: ${doc.numPages}`);

    let result = '';
    const pageArr = Array.from({ length: doc.numPages }, (_, i) => i + 1);
    
    for await (const pageNo of pageArr) {
      result += await readPDFPage(doc, pageNo);
    }

    console.log('🧹 Cleaning up resources...');
    loadingTask.destroy();
    
    console.log('✨ PDF processing completed successfully');
    return {
      rawText: result
    };
  } catch (error) {
    console.error('❌ Fatal error processing PDF:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.files?.[0]?.buffer?.data) {
      return NextResponse.json(
        { error: 'Invalid buffer data received' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      body.files.map(async (file: any) => {
        try {
          // Convert base64 back to buffer
          const buffer = Buffer.from(file.buffer.data, 'base64');
          const result = await readPdfFile({ buffer });
          return {
            text: result.rawText,
            success: true
          };
        } catch (error) {
          console.error('❌ Error processing file:', error);
          return {
            text: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}