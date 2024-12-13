import Replicate from "replicate";

// Base configuration for Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Default model configuration
const defaultConfig = {
  top_k: 0,
  top_p: 0.9,
  max_tokens: 1024,
  min_tokens: 0,
  temperature: 0.7,
  length_penalty: 1,
  presence_penalty: 1.0,
  log_performance_metrics: false,
  stop_sequences: "<|end_of_text|>,<|eot_id|>",
};

// Helper function to create a formatted prompt with system and user messages
const createPromptTemplate = (systemPrompt: string, userPrompt: string) => {
  return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
};

// Add this helper function near the top of the file
const calculateMaxTokens = (content: string): number => {
  // More precise estimation: 1 token ≈ 4 characters
  const estimatedTokens = Math.ceil(content.length / 4);
  // Adjust limits based on content length
  const MIN_TOKENS = 512;  // Increased minimum
  const MAX_TOKENS = 8192; // Increased maximum for longer documents
  
  // Add buffer for system prompts and response
  const tokenBuffer = 1024;
  return Math.min(Math.max(estimatedTokens + tokenBuffer, MIN_TOKENS), MAX_TOKENS);
};

// Function to analyze CVs against job requirements
export async function analyzeCVContent(cvText: string, jobRequirements: string) {
  const systemPrompt = "You are an expert HR assistant that analyzes CVs against job requirements";
  const userPrompt = `Please analyze this CV:\n${cvText}\n\nAgainst these job requirements:\n${jobRequirements}`;
  
  const input = {
    ...defaultConfig,
    prompt: createPromptTemplate(systemPrompt, userPrompt),
  };

  let response = '';
  for await (const event of replicate.stream("meta/meta-llama-3-70b-instruct", { input })) {
    response += event.toString();
  }
  return response;
}

// Function to generate interview questions based on CV content
export async function generateInterviewQuestions(cvText: string) {
  const systemPrompt = "You are an expert interviewer who creates relevant technical questions";
  const userPrompt = `Based on this CV, generate 5 relevant technical interview questions:\n${cvText}`;
  
  const input = {
    ...defaultConfig,
    temperature: 0.8, // Slightly higher for more creative questions
    prompt: createPromptTemplate(systemPrompt, userPrompt),
  };

  let response = '';
  for await (const event of replicate.stream("meta/meta-llama-3-70b-instruct", { input })) {
    response += event.toString();
  }
  return response;
}

// Function to summarize CV content
export async function summarizeCV(cvText: string) {
  const systemPrompt = "You are a CV summarization expert";
  const userPrompt = `Please provide a concise summary of the following CV:\n${cvText}`;
  
  const input = {
    ...defaultConfig,
    max_tokens: 256, // Shorter for summaries
    prompt: createPromptTemplate(systemPrompt, userPrompt),
  };

  let response = '';
  for await (const event of replicate.stream("meta/meta-llama-3-70b-instruct", { input })) {
    response += event.toString();
  }
  return response;
}

// Generic function for custom prompts with configurable options
export async function customPrompt(
  prompt: string,
  systemPrompt: string = "You are a helpful assistant",
  config: Partial<typeof defaultConfig> = {}
) {
  const maxTokens = calculateMaxTokens(prompt);
  
  const input = {
    ...defaultConfig,
    max_tokens: maxTokens,  // Dynamic max_tokens based on content length
    ...config,  // Allow override if specifically provided in config
    prompt: createPromptTemplate(systemPrompt, prompt),
  };

  let response = '';
  for await (const event of replicate.stream("meta/meta-llama-3-70b-instruct", { input })) {
    response += event.toString();
  }
  return response;
}