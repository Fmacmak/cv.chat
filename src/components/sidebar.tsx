"use client"

import Link from 'next/link'
import { Home, Upload, Search, Book } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="w-64 h-full border-r bg-sidebar">
      <div className="flex flex-col p-4 space-y-4">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Home - Upload Documents
          </Button>
        </Link>
        <Link href="/summary">
          <Button variant="ghost" className="w-full justify-start">
            <Book className="mr-2 h-4 w-4" />
            Summaries
          </Button>
        </Link>
        <Link href="/query">
          <Button variant="ghost" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Query Documents
          </Button>
        </Link>
      </div>
    </div>
  )
}

