"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processFiles, processFilesGemini } from "@/app/actions/goals"
import { useGoals } from '@/contexts/GoalsContext'
import { toast } from "@/hooks/use-toast"


export default function Home() {
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [analysisResults, setAnalysisResults] = useState<string>("")

  const [criteriaInput, setCriteriaInput] = useState("")
  const [scoringInput, setScoringInput] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [scoringResults, setScoringResults] = useState<string>("")

  const [isProcessing, setIsProcessing] = useState(false);


  const { addGoal } = useGoals()

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const goalData = {
        id: Date.now().toString(),
        name,
        prompt,
        createdAt: new Date().toISOString()
      }

      // Create goal and update context
      // await createGoal(goalData)
      await addGoal(goalData)

      // Clear form
      // setName("")
      // setPrompt("")
      // setSaving(false)
      
      // Optional: Show success toast
      toast({
        title: "Goal created",
        description: "Your recruitment goal has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating goal:', error)
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...(e.target.files ? Array.from(e.target.files) : [])])
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const [messages, setMessages] = useState<Array<{ text: string, isUser: boolean }>>([
    {
      text: "Hello! I'm your CV analysis assistant. I can help answer questions about the analyzed CVs, their rankings, and provide insights based on the analysis results. How can I help you today?",
      isUser: false
    }
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  // const handleSendMessage = async () => {
  //   if (!currentMessage.trim()) return

  //   // Add user message to chat
  //   setMessages(prev => [...prev, { text: currentMessage, isUser: true }])

  //   // Clear input
  //   setCurrentMessage("")

  //   // Here you would typically make an API call to your LLM service
  //   // For now, we'll just add a mock response
  //   setTimeout(() => {
  //     setMessages(prev => [...prev, {
  //       text: "I'm processing your question about the CVs...",
  //       isUser: false
  //     }])
  //   }, 1000)
  // }

  const handleCriteria = async () => {
    if (!criteriaInput.trim() || !files.length) return;

    try {
      setAnalysisResults("Processing files...");
      const analysis = await processFilesGemini(files, criteriaInput);
      setAnalysisResults(analysis.map(result => 
        `File: ${result.fileName}\n${result.analysis}\n\n`
      ).join('---\n'));
    } catch (error) {
      console.error("Error processing criteria:", error);
      setAnalysisResults("Error processing files. Please try again.");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process files",
        variant: "destructive",
      });
    }
  };

  const handleScoring = async () => {
    if (!scoringInput.trim() || !files.length) return

    try {
      const results = await processFilesGemini(files, scoringInput, true)
      setScoringResults(results[0].analysis)
      setScoringInput("") // Clear input after processing
    } catch (error) {
      console.error("Error processing scoring:", error)
    }
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;

    try {
      setIsProcessing(true);
      if (!chatInput.trim()) return;

      if (!analysisResults && !scoringResults) {
        setMessages(prev => [...prev, 
          { text: chatInput, isUser: true },
          { 
            text: "Please analyze some CVs first before asking questions. I need context from the CV analysis and scoring to provide meaningful answers.", 
            isUser: false 
          }
        ]);
        setChatInput("");
        return;
      }

      // Add user message to chat
      setMessages(prev => [...prev, { text: chatInput, isUser: true }]);
      setChatInput(""); // Clear input

      // Create context from analysis and scoring results
      const context = `
Analysis Results:
${analysisResults}

Scoring Results:
${scoringResults}
      `;

      // Process chat with context using Gemini
      const response = await processFilesGemini(
        files,
        `Given this context about the CVs:
        ${context}
        
        Please answer this question: ${chatInput}`,
        false
      );

      // Add assistant response to chat
      setMessages(prev => [...prev, {
        text: response[0].analysis,
        isUser: false
      }]);
    } catch (error) {
      console.error("Error processing chat message:", error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I encountered an error processing your question. Please try again.",
        isUser: false
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CV Upload</h1>

      <div className="space-y-4 mb-8 p-6 border rounded-lg bg-card">
        {/* Goal Creation Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Something like 'Node.js Developer 2025'"
            />
          </div>
        </div>

        {/* File Upload Options */}
        <Tabs defaultValue="local" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Local Upload</TabsTrigger>
            <TabsTrigger value="drive">Google Drive</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3" />
                  <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Supports text documents (like .pdf, .docx, .pptx, .html, .csv, .json) containing up to 80,000 characters.</p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleLocalFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                />
              </label>
            </div>
            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Selected Files:</h3>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm flex items-center justify-between">
                        <span className="truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-muted rounded-full"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drive" className="space-y-4">
            <Button variant="outline" className="w-full">
              Select Files from Drive
            </Button>
            {/* {selectedDriveFiles?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Selected Drive Files:</h3>
                <ul className="list-disc pl-5">
                  {selectedDriveFiles.map((file, index) => (
                    <li key={index} className="text-sm">{file.name}</li>
                  ))}
                </ul>
              </div>
            )} */}
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSubmit}
          disabled={!name || saving || (!files.length)}//&& !selectedDriveFiles?.length
          className="w-full mt-4"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Goal..
            </>
          ) : (
            "Create Goal"
          )}
        </Button>
      </div>


      {/* Scoring Criteria */}
      <h1 className="text-3xl font-bold mb-6">Scoring Criteria</h1>
      <div className="space-y-4 mb-8 p-6 border rounded-lg bg-card">

        <div className="space-y-4">

          <div className="space-y-4">
            <div>
              {/* Input area */}
              <Label htmlFor="name">What are you looking for in the candidates?</Label>
              <div className="flex space-x-2">


                <Input
                  placeholder="(e.g., a backend engineer with 3 years of experience...)"
                  className="flex-1"
                  value={criteriaInput}
                  onChange={(e) => {
                    setCriteriaInput(e.target.value)
                    console.log("criteriaInput:", criteriaInput)
                    setPrompt(e.target.value)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleCriteria()}
                />
                <Button
                  onClick={handleCriteria}
                  disabled={!criteriaInput.trim() || !files.length}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Summary LLM response */}
      <h1 className="text-3xl font-bold mb-6 text-lime-700">CV Analysis</h1>
      <div className="space-y-4 mb-8 p-6 border rounded-lg bg-card">
        <div className="space-y-4">
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
            {analysisResults ? (
              <p className="whitespace-pre-wrap">{analysisResults}</p>
            ) : (
              <p className="text-muted-foreground text-center">
                Upload files and submit to see CV analysis results
              </p>
            )}
          </div>
        </div>
      </div>


      {/* Summary LLM response */}
      <h1 className="text-3xl font-bold mb-6">CV Scoring</h1>
      <div className="space-y-4 mb-8 p-6 border rounded-lg bg-card">
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              {/* Input area */}
              <Label htmlFor="name">How should the CVs be scored?</Label>
              <div className="flex space-x-2">


                <Input
                  placeholder="Enter your scoring criteria..."
                  className="flex-1"
                  value={scoringInput}
                  onChange={(e) => setScoringInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScoring()}
                />
                <Button
                  onClick={handleScoring}
                  disabled={!scoringInput.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Summary LLM response */}
      <h1 className="text-3xl font-bold mb-6 text-lime-700">Ranked CVs</h1>
      <div className="space-y-4 mb-8 p-6 border rounded-lg bg-card">
        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
          {scoringResults ? (
            <p className="whitespace-pre-wrap">{scoringResults}</p>
          ) : (
            <p className="text-muted-foreground text-center">
              Submit scoring criteria to see ranked results
            </p>
          )}
        </div>
        <div className="space-y-4"></div>
      </div>


      {/* Summary LLM response */}
      <h1 className="text-3xl font-bold mb-6">CV.chat Assistant</h1>
      <div className="space-y-4 mb-8 p-6 border rounded-lg bg-card">
        <div className="space-y-4">
          {/* Chat messages area */}
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="flex space-x-2">
            <Input
              placeholder="Ask a question about the CVs..."
              className="flex-1"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
            />
            <Button
              onClick={handleChatMessage}
              disabled={!chatInput.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}

