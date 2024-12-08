'use server'

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { uploadFileToOpenAI } from "@/lib/openai"

export async function summarizeAndScore(file: File): Promise<{ summary: string; score: number; fileId: string }> {
  console.log('summarizeAndScore called with file:', file.name)

  try {
    // Upload file to OpenAI
    const uploadResponse = await uploadFileToOpenAI(file)
    console.log('File uploaded to OpenAI:', uploadResponse)

    // Use the file for analysis
    const prompt = `Analyze the uploaded file and provide:
1. A one-sentence summary
2. A relevance score between 0 and 1

Format the response as:
Summary: <summary>
Score: <score>`

    console.log('Sending prompt to OpenAI')

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: prompt,
      maxTokens: 150,
    })

    console.log('Received raw response from OpenAI:', text)

    const [summary, scoreStr] = text.split('\n')
    const score = parseFloat(scoreStr.replace('Score:', '').trim())

    console.log('Parsed response:', {
      summary: summary.replace('Summary:', '').trim(),
      score: isNaN(score) ? 0 : score,
      fileId: uploadResponse.id
    })

    return {
      summary: summary.replace('Summary:', '').trim(),
      score: isNaN(score) ? 0 : score,
      fileId: uploadResponse.id
    }
  } catch (error) {
    console.error('Error in summarizeAndScore:', error)
    return {
      summary: "An error occurred while summarizing the document.",
      score: 0,
      fileId: ''
    }
  }
}

