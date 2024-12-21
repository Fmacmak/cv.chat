'use server'

import fs from 'fs/promises'
import path from 'path'
import { customPrompt } from '@/lib/gemini'
// import { customPrompt } from '@/lib/gemini'


const goalsFilePath = path.join(process.cwd(), 'data', 'goals.json')

interface Goal {
  id: string
  name: string
  prompt: string
  createdAt: string
}


export async function processFiles(files: File[], prompt: string, isScoring: boolean = false) {
  console.log(`Starting to process ${files.length} files`)
  
  try {
    // Convert files to text content
    console.log('Converting files to text content...')
    const fileContents = await Promise.all(
      files.map(async (file) => {
        console.log(`Processing file: ${file.name}`)
        const text = await file.text();
        return {
          name: file.name,
          content: text, 
          prompt: prompt
        };
      })
    );
    console.log('Files converted successfully:', fileContents.map(f => f.name))

    // Process each file's content using Replicate
    console.log('Starting Replicate analysis...')
    const processedResults = await Promise.all(
      fileContents.map(async (file) => {
        console.log(`Analyzing file: ${file.name}`)
        const systemPrompt = "You are an expert document analyzer. Extract and summarize key information from this document.";
        const userPrompt = isScoring 
          ? `Score and rank these CVs:\n\n${file.content} based on the scoring criteria: ${file.prompt}. Provide a numerical score out of 100 and brief justification for each CV. Sort them in descending order by score.`
          : `Analyze this CV:\n\n${file.content} based on the criteria specified in ${file.prompt}. Provide a summary of each CV, highlighting the relevant aspects mentioned in the criteria. Format the output as a numbered list, with the candidate's name as a subheading.`

        try {
          console.log(`Sending request to Replicate for ${file.name}`)
          console.log("userPrompt:", userPrompt)
        //   console.log("systemPrompt:", systemPrompt)
          const analysis = await customPrompt(userPrompt, systemPrompt, {
            // max_tokens: 1024,
            temperature: 0.3
          });
          console.log(`Successfully received analysis for ${file.name}`)
          console.log("analysis:", analysis)

          return {
            fileName: file.name,
            analysis
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            fileName: file.name,
            analysis: "Error processing this file",
            error: true
          };
        }
      })
    );

    console.log('All files processed successfully')
    return processedResults;
  } catch (error) {
    console.error('Error in processFiles:', error);
    throw new Error('Failed to process files');
  }
}

export async function processFilesGemini(files: File[], prompt: string, isScoring: boolean = false) {
  console.log(`Starting to process ${files.length} files`);
  
  try {
    // Validate file sizes and types first
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'text/plain'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      throw new Error('No valid files to process. Please upload PDF or text files under 10MB.');
    }

    // Convert files to base64 and prepare for pdf-grep
    const buffers = await Promise.all(
      validFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          buffer: {
            data: Buffer.from(arrayBuffer).toString('base64'),
            type: file.type,
            name: file.name
          }
        };
      })
    );

    // Extract text using pdf-grep
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pdf-grep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: buffers })
    });

    if (!pdfResponse.ok) {
      throw new Error(`PDF extraction failed: ${pdfResponse.statusText}`);
    }

    const { results } = await pdfResponse.json();

    // Process with Gemini
    const processedResults = await Promise.all(
      results.map(async (result: any, index: number) => {
        if (!result.success) {
          return {
            fileName: validFiles[index].name,
            analysis: "Error processing this file",
            error: true
          };
        }

        const userPrompt = isScoring 
          ? `Analyze and score this CV (provide a score out of 100):\n\n${result.text}\n\nScoring criteria: ${prompt}`
          : `Analyze this CV and provide a detailed assessment:\n\n${result.text}\n\nAnalysis criteria: ${prompt}`;

        try {
          const analysis = await customPrompt(
            userPrompt,
            "You are an expert CV analyzer. Provide detailed, structured analysis.",
            { temperature: 0.3 }
          );

          return {
            fileName: validFiles[index].name,
            analysis
          };
        } catch (error) {
          console.error(`Error analyzing ${validFiles[index].name}:`, error);
          return {
            fileName: validFiles[index].name,
            analysis: "Failed to analyze this CV. Please try again.",
            error: true
          };
        }
      })
    );

    return processedResults;
  } catch (error) {
    console.error('Error in processFilesGemini:', error);
    throw error;
  }
}

export async function createGoal(goal: Goal) {
  console.log('Creating new goal:', { id: goal.id, name: goal.name })
  
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    console.log('Ensuring data directory exists:', dataDir)
    await fs.mkdir(dataDir, { recursive: true })
    
    // Read existing goals
    let goals: Goal[] = []
    try {
      console.log('Reading existing goals from:', goalsFilePath)
      const data = await fs.readFile(goalsFilePath, 'utf8')
      goals = JSON.parse(data)
      console.log(`Found ${goals.length} existing goals`)
    } catch (error) {
      console.log("error reading goals:", error)
      console.log('No existing goals file found, starting fresh')
    }
    
    // Add new goal
    goals.push(goal)
    
    // Write back to file
    console.log('Saving updated goals to file')
    await fs.writeFile(goalsFilePath, JSON.stringify(goals, null, 2))
    console.log('Goal saved successfully')
    
    return goal
  } catch (error) {
    console.error('Error in createGoal:', error)
    throw new Error('Failed to save goal')
  }
}

export async function getGoals(): Promise<Goal[]> {
  console.log('Fetching goals from:', goalsFilePath)
  try {
    const data = await fs.readFile(goalsFilePath, 'utf8')
    const goals = JSON.parse(data)
    console.log(`Retrieved ${goals.length} goals`)
    return goals
  } catch (error) {
    console.log('No goals found or error reading goals file:', error)
    return []
  }
}
