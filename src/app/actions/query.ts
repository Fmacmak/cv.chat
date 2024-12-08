'use server'

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function queryDocuments(query: string, documents: string[]): Promise<string> {
  console.log('queryDocuments called with:', {
    query,
    documentCount: documents.length,
    documentsPreview: documents.map(doc => doc.substring(0, 100) + '...')
  })

  try {
    const context = documents.join('\n\n')
    const prompt = `Given the following documents:

${context}

Answer the following question:
${query}

If the answer cannot be found in the provided documents, please respond with "I'm sorry, I couldn't find an answer to that question in the provided documents."

Answer:`

    console.log('Sending prompt to OpenAI:', {
      promptLength: prompt.length,
      maxTokens: 200
    })

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: prompt,
      maxTokens: 200,
    })

    console.log('Received response from OpenAI:', {
      responseLength: text.length,
      response: text.substring(0, 100) + '...'
    })

    return text.trim()
  } catch (error) {
    console.error('Error in queryDocuments:', error)
    return "An error occurred while processing your query. Please try again later."
  }
}

