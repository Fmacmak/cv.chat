import { createGoal, getGoals } from '@/app/actions/goals'
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

interface Goal {
  id: string
  name: string
  prompt: string
  createdAt: string
}

interface GoalsContextType {
  goals: Goal[]
  addGoal: (goal: Goal) => Promise<void>
  refreshGoals: () => Promise<void>
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])

  const refreshGoals = useCallback(async () => {
    try {
      const data = await getGoals()
      const sortedGoals = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setGoals(sortedGoals)
    } catch (error) {
      console.error('Error refreshing goals:', error)
      setGoals([])
    }
  }, [])

  const addGoal = async (goal: Goal) => {
    try {
      await createGoal(goal)
      await refreshGoals() // Refresh the full list instead of manual update
    } catch (error) {
      console.error('Error adding goal:', error)
      throw error // Propagate error to component
    }
  }

  // Add useEffect to load goals on mount
  useEffect(() => {
    refreshGoals()
  }, [refreshGoals])

  return (
    <GoalsContext.Provider value={{ goals, addGoal, refreshGoals }}>
      {children}
    </GoalsContext.Provider>
  )
}

export const useGoals = () => {
  const context = useContext(GoalsContext)
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider')
  }
  return context
}