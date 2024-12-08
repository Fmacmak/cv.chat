import { openai } from "@ai-sdk/openai"

export async function uploadFileToOpenAI(file: File) {
  console.log('Uploading file to OpenAI:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', 'assistants')

  console.log('Sending request to OpenAI Files API')
  
  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('File upload successful:', {
    fileId: data.id,
    status: data.status,
    createdAt: new Date(data.created_at * 1000).toISOString()
  })

  return data
}

export async function deleteOpenAIFile(fileId: string) {
  console.log('Deleting file from OpenAI:', { fileId })

  const response = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error deleting OpenAI file:', {
      fileId,
      status: response.status,
      statusText: response.statusText,
      error: errorText
    })
  }

  const success = response.ok
  console.log('File deletion result:', {
    fileId,
    success,
    status: response.status
  })

  return success
}
