import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { Goal } from '@/types/goal'

const STORAGE_KEY = 'cv_chat_goals'

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
      const storedGoals = localStorage.getItem(STORAGE_KEY)
      const parsedGoals = storedGoals ? JSON.parse(storedGoals) : []
      const sortedGoals = [...parsedGoals].sort((a, b) => 
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
      const currentGoals = localStorage.getItem(STORAGE_KEY)
      const parsedGoals = currentGoals ? JSON.parse(currentGoals) : []
      const updatedGoals = [...parsedGoals, goal]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals))
      await refreshGoals()
    } catch (error) {
      console.error('Error adding goal:', error)
      throw error
    }
  }

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