'use client';

import { useState } from 'react';

export default function UploadPDF() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            console.log('📁 File selected:', e.target.files[0].name);
            setFile(e.target.files[0]);
        }
    };

    const extractText = async () => {
        if (!file) {
            console.warn('❌ No file selected');
            alert('Please select a PDF file.');
            return;
        }

        console.log('🔄 Starting text extraction process...');
        setLoading(true);
        
        try {
            const reader = new FileReader();
            
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = (event) => {
                    if (event.target?.result && typeof event.target.result === 'string') {
                        const base64 = event.target.result.split(',')[1];
                        resolve(base64);
                    } else {
                        reject(new Error('Failed to read file'));
                    }
                };
                
                reader.onerror = () => reject(reader.error);
            });

            reader.readAsDataURL(file);
            
            const base64 = await base64Promise;
            console.log('📄 File converted to base64');

            const response = await fetch('/api/pdf-extract', {
                method: 'POST',
                body: JSON.stringify({
                    files: [base64]
                })
            });

            const { results } = await response.json();
            // results will be an array of { success: boolean, text?: string, error?: string }

            console.log('✅ Text extracted successfully');
            setText(results[0].text);
            
        } catch (error) {
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
                {text && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
                        <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                            {text}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
