import { Goal } from './goal'

export interface GoalsContextType {
  goals: Goal[]
  refreshGoals: () => Promise<void>
  addGoal: (goal: Goal) => Promise<void>
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}
