"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MenuBarProps {
  toggleSidebar: () => void
}

export function MenuBar({ toggleSidebar }: MenuBarProps) {
  return (
    <div className="flex items-center h-14 border-b px-4 bg-background">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <PanelLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-semibold ml-4">CV.chat</h1>
      <h2 className="text-sm text-muted-foreground ml-4">by Feranmi</h2>
    </div>
  )
}
