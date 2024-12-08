"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { queryDocuments } from "../actions/query"

interface Document {
  name: string
  summary: string
  score: number
}

export default function Query() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const storedSummaries = localStorage.getItem('documentSummaries')
    if (storedSummaries) {
      setDocuments(JSON.parse(storedSummaries))
    }
  }, [])

  const handleQuery = async () => {
    setLoading(true)
    try {
      const documentContents = documents.map(doc => `${doc.name}:\n${doc.summary}`)
      const result = await queryDocuments(query, documentContents)
      setResult(result)
    } catch (error) {
      console.error('Error during query:', error)
      setResult("An error occurred while processing your query. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Query Documents</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="query">Enter your query</Label>
          <Input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are the key skills mentioned in the resume?"
          />
        </div>
        <Button onClick={handleQuery} disabled={query.trim() === "" || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Querying...
            </>
          ) : (
            "Submit Query"
          )}
        </Button>
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Query Result:</h2>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

