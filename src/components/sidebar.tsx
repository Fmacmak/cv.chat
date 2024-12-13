"use client"

import Link from 'next/link'
import { Home, Target } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import { getGoals } from '@/app/actions/goals'
import { ModeToggle } from '@/components/mode-toggle'
import { useGoals } from '@/contexts/GoalsContext'


export function Sidebar() {
  const { goals, refreshGoals } = useGoals()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadGoals = async () => {
      if (goals.length === 0) {
        setIsLoading(true)
        try {
          await refreshGoals()
        } catch (error) {
          console.error('Error loading goals:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadGoals()
  }, [refreshGoals, goals.length])

  return (
    <div className="w-64 h-full border-r bg-sidebar">
      <div className="flex flex-col h-full p-4">
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </Link>
          
          <div className="pt-4">
            <h3 className="px-2 mb-2 text-sm font-semibold">Recruitment Goals</h3>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : goals.length > 0 ? (
              goals.map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    {goal.name}
                  </Button>
                </Link>
              ))
            ) : (
              <div className="px-2 text-sm text-muted-foreground">
                No goals created yet
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}

