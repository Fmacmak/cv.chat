declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string
      REPLICATE_API_TOKEN: string
      GOOGLE_CLIENT_ID?: string
      GOOGLE_CLIENT_SECRET?: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {} 