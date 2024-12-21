"use client"

import { Inter } from 'next/font/google'
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { MenuBar } from "@/components/ui/menubar"
import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { GoalsProvider } from '@/contexts/GoalsContext'


const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSidebar, setShowSidebar] = useState(true)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoalsProvider>
            <div className="flex flex-col h-screen">
              <MenuBar toggleSidebar={() => setShowSidebar(!showSidebar)} />
              <div className="flex flex-1 overflow-hidden">
                {showSidebar && <Sidebar />}
                <main className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-5xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </GoalsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

