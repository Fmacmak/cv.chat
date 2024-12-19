import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Default configuration for Gemini requests
const defaultConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 0.9,
  maxOutputTokens: 1024,
};

// Helper function to create a chat message
const createChatMessage = (systemPrompt: string, userPrompt: string) => {
  return [
    { role: 'system', parts: [{ text: systemPrompt }] },
    { role: 'user', parts: [{ text: userPrompt }] }
  ];
};

// Helper function to calculate max tokens (Gemini specific)
const calculateMaxTokens = (content: string): number => {
  const estimatedTokens = Math.ceil(content.length / 4);
  const MIN_TOKENS = 512;
  const MAX_TOKENS = 30720; // Gemini's maximum context length
  
  const tokenBuffer = 1024;
  return Math.min(Math.max(estimatedTokens + tokenBuffer, MIN_TOKENS), MAX_TOKENS);
};

// Function to analyze CVs against job requirements
export async function analyzeCVContent(cvText: string, jobRequirements: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const systemPrompt = "You are an expert HR assistant that analyzes CVs against job requirements";
  const userPrompt = `Please analyze this CV:\n${cvText}\n\nAgainst these job requirements:\n${jobRequirements}`;
  
  const chat = model.startChat({
    ...defaultConfig,
    systemInstruction: systemPrompt
  });

  const result = await chat.sendMessage(userPrompt);
  return result.response.text();
}

// Function to generate interview questions based on CV content
export async function generateInterviewQuestions(cvText: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const systemPrompt = "You are an expert interviewer who creates relevant technical questions";
  const userPrompt = `Based on this CV, generate 5 relevant technical interview questions:\n${cvText}`;
  
  const chat = model.startChat({
    ...defaultConfig,
    systemInstruction: systemPrompt
  });

  const result = await chat.sendMessage(userPrompt);
  return result.response.text();
}

// Generic function for custom prompts
export async function customPrompt(
  prompt: string,
  systemPrompt: string = "You are a helpful assistant",
  config: Partial<typeof defaultConfig> = {}
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const maxTokens = calculateMaxTokens(prompt);
  
  const chat = model.startChat({
    ...defaultConfig,
    systemInstruction: systemPrompt
  });

  const result = await chat.sendMessage(prompt);
  return result.response.text();
}