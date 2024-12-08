"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"

interface Document {
  name: string
  summary: string
  score: number
}

export default function Summary() {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const storedSummaries = localStorage.getItem('documentSummaries')
    if (storedSummaries) {
      setDocuments(JSON.parse(storedSummaries))
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Document Summaries</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc, index) => (
            <TableRow key={index}>
              <TableCell>{doc.name}</TableCell>
              <TableCell>{doc.summary}</TableCell>
              <TableCell>{doc.score.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-6">
        <Link href="/query">
          <Button>Query Documents</Button>
        </Link>
      </div>
    </div>
  )
}

