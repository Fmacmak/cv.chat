//test hello world api
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      files.map(async (file: FormDataEntryValue) => {
        if (!(file instanceof File)) {
          return {
            text: '',
            success: false,
            error: 'Invalid file format'
          };
        }

        try {
          const buffer = await file.arrayBuffer();
          const data = await pdfParse(Buffer.from(buffer));
          
          return {
            text: data.text,
            success: true
          };
        } catch (error) {
          console.error('Error processing PDF:', error);
          return {
            text: '',
            success: false,
            error: 'Failed to process PDF'
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in PDF extraction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process PDFs'
      },
      { status: 500 }
    );
  }
}