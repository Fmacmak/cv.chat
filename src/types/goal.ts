export interface Goal {
  id: string
  name: string
  prompt: string
  createdAt: string
}

export interface GoalAnalysis {
  fileName: string
  analysis: string
  error?: boolean
}

export interface GoalCreationParams {
  name: string
  prompt: string
}
