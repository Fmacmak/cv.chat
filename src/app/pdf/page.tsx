'use client';

import { useState } from 'react';

export default function UploadPDF() {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<{text: string}[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            console.log('📁 Files selected:', Array.from(e.target.files).map(f => f.name));
            setFiles(Array.from(e.target.files));
        }
    };

    const extractText = async () => {
        if (!files.length) {
            console.warn('❌ No files selected');
            alert('Please select PDF files.');
            return;
        }

        console.log('🔄 Starting text extraction process...');
        setLoading(true);
        
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch('/api/test', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { results } = await response.json();
            setResults(results);
            
        } catch (error) {
            console.log(error)
            console.error('❌ Error during extraction:', error);
            alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="space-y-4">
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
                                    File {index + 1} {files[index]?.name && `(${files[index].name})`}:
                                </h3>
                                <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                                    {result.text}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
