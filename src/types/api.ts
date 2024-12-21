export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface ProcessFileResponse {
  fileName: string
  analysis: string
  error?: boolean
}

export interface FileUploadResponse {
  url: string
  error?: string
}
