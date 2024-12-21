import { NextRequest, NextResponse } from 'next/server';
//import pdfParse from 'pdf-parse';

export async function PUT(req: NextRequest) {
  try {
    const { files } = await req.json();
    
    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      files.map(async (base64File: string) => {
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(base64File, 'base64');
          
          // Parse PDF
          //const data = await pdfParse(buffer);
          
          return {
            success: true, 
            text: "data.text",
          };
        } catch (error) {
          console.error('Error processing PDF:', error);
          return {
            success: false,
            text: '',
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