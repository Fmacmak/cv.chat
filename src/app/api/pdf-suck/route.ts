import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-ignore-error
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

// Set up the worker
// GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('file');
  
  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: 'No files found' },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.all(
      files.map(async (file: any) => {
        if (!(file instanceof File)) {
          return {
            success: false,
            error: 'Invalid file format',
            text: '',
          };
        }

        try {
          const fileName = uuidv4();
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Load PDF document with proper typing
          // const loadingTask = pdfjsLib.getDocument({
          //   data: uint8Array,
          //   useWorkerFetch: false,
          //   isEvalSupported: false,
          //   useSystemFonts: true
          // });
          
          // const pdf = //await loadingTask.promise;
          
          // // Extract text from all pages
          // let fullText = '';
          // for (let i = 1; i <= pdf.numPages; i++) {
          //   const page = await pdf.getPage(i);
          //   const textContent = await page.getTextContent();
          //   const pageText = textContent.items
          //     .map((item: any) => item.str)
          //     .join(' ');
          //   fullText += pageText + '\n';
          // }
          console.log({
            success: true,
            text: "fullText my name is resume",
            fileName: fileName
          })
          
          return {
            success: true,
            text: "fullText my name is resume",
            fileName: fileName
          };

        } catch (error:any) {
          console.error('Error processing PDF:', error);
          return {
            success: false,
            error: `Failed to process PDF: ${error.message}`,
            text: '',
          };
        }
      })
    );

    return NextResponse.json({ results });

  } catch (error:any) {
    console.error('Error processing PDFs:', error);
    return NextResponse.json(
      { error: `Failed to process PDFs: ${error.message}` },
      { status: 500 }
    );
  }
}