"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { summarizeAndScore } from "./actions/summarize"
import { useRouter } from 'next/navigation'

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  // const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    try {
      const summaries = await Promise.all(
        files.map(async (file) => {
          const content = await file.text()
          const { summary, score } = await summarizeAndScore(content)
          return { name: file.name, summary, score }
        })
      )
      
      // In a real application, you'd save these summaries to a database
      // For now, we'll use localStorage as a simple storage mechanism
      localStorage.setItem('documentSummaries', JSON.stringify(summaries))
      
      // toast({
      //   title: "Upload Successful",
      //   description: `${files.length} document${files.length > 1 ? 's' : ''} uploaded and summarized successfully.`,
      // })
      router.push('/summary')
    } catch (error) {
      console.error('Error during upload:', error)
      // toast({
      //   title: "Upload Failed",
      //   description: "An error occurred while processing your documents.",
      //   variant: "destructive",
      // })
    } finally {
      setUploading(false)
      setFiles([])
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select files or ZIP archive</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileChange}
          />
        </div>
        {files.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Selected Files:</h2>
            <ul className="list-disc pl-5">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </div>
  )
}

