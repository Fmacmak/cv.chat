'use client';

import { Suspense, useState } from 'react';
import ViewerPDF from './pdf/page';

type ExtractMethod = 'test' | 'pdf-extract' | 'pdf-suck' | 'pdf-grep';

interface ExtractionResult {
  text: string;
  fileName?: string;
  success?: boolean;
  error?: string;
}

export default function UploadPDF() {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<ExtractionResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedMethod, setSelectedMethod] = useState<ExtractMethod>('pdf-extract');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            console.log('📁 Files selected:', fileList.map(f => ({
                name: f.name,
                size: `${(f.size / 1024).toFixed(2)}KB`,
                type: f.type
            })));
            setFiles(fileList);
        }
    };

    const extractText = async () => {
        if (!files.length) {
            console.warn('❌ No files selected');
            alert('Please select PDF files.');
            return;
        }

        console.log(`🔄 Starting text extraction process using ${selectedMethod}...`);
        console.log(`📊 Processing ${files.length} file(s)`);
        setLoading(true);
        
        try {
            let response;
            const formData = new FormData();
            
            switch (selectedMethod) {
                case 'pdf-extract':
                    console.log('🔍 Using pdf-extract method');
                    const base64Files = await Promise.all(
                        files.map(async (file) => {
                            console.log(`📄 Converting ${file.name} to base64...`);
                            const buffer = await file.arrayBuffer();
                            return Buffer.from(buffer).toString('base64');
                        })
                    );
                    
                    console.log(`✅ Successfully converted ${base64Files.length} files to base64`);
                    console.log('🔄 base64Files:', base64Files);
                    
                    response = await fetch('/api/pdf-extract', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ files: base64Files }),
                    });
                    break;

                case 'pdf-suck':
                    console.log('🔍 Using pdf-suck method');
                    console.log(files)
                    files.forEach((file, index) => {
                        console.log(`📎 Appending file to FormData: ${file.name}`);
                        formData.append('file', file);
                    });
                    response = await fetch('/api/pdf-suck', {
                        method: 'POST',
                        body: formData,
                    });
                    break;

                case 'pdf-grep':
                    console.log('🔍 Using pdf-grep method');
                    const buffers = await Promise.all(
                        files.map(async (file) => {
                            const arrayBuffer = await file.arrayBuffer();
                            return {
                                buffer: {
                                    // Convert ArrayBuffer to Base64 string for transmission
                                    data: Buffer.from(arrayBuffer).toString('base64'),
                                    type: file.type,
                                    name: file.name
                                }
                            };
                        })
                    );
                    
                    response = await fetch('/api/pdf-grep', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ files: buffers }),
                    });
                    break;

                default:
                    console.log('🔍 Using test method');
                    files.forEach((file) => {
                        console.log(`📎 Appending file to FormData: ${file.name}`);
                        formData.append('files', file);
                    });
                    response = await fetch('/api/test', {
                        method: 'POST',
                        body: formData,
                    });
            }

            console.log(`📡 Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Extraction completed successfully:', data);
            setResults(data.results);
            
        } catch (error) {
            console.error('❌ Error during extraction:', error);
            console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
            alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            console.log('🏁 Extraction process finished');
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                    {(['pdf-extract', 'pdf-suck', 'pdf-grep', 'test'] as ExtractMethod[]).map((method) => (
                        <button
                            key={method}
                            onClick={() => setSelectedMethod(method)}
                            className={`px-4 py-2 rounded-md ${
                                selectedMethod === method
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>

                <input 
                    type="file" 
                    multiple={true}
                    accept="application/pdf" 
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90"
                />
                <button 
                    onClick={extractText} 
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md
                        hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Extracting...' : 'Extract Text'}
                </button>
                
                {results.length > 0 && (
                    <div className="mt-4 space-y-4">
                        {results.map((result, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2">
                                    File {index + 1} {files[index]?.name && `(${files[index].name})`}
                                    {result.success === false && (
                                        <span className="text-red-500 ml-2">(Failed)</span>
                                    )}
                                </h3>
                                {result.error ? (
                                    <div className="text-red-500">{result.error}</div>
                                ) : (
                                    <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                                        {result?.text || 'dummy'}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* <Suspense fallback={<div>Loading...</div>}>
                <ViewerPDF fileUrl={files[0]?.name} />
            </Suspense> */}
        </div>
    );
}
