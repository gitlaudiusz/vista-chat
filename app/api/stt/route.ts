import { NextRequest } from "next/server"
import { API_CONFIG } from "@/lib/env-config"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert to form data for WhisperX API
    const whisperFormData = new FormData()
    whisperFormData.append('audio', audioFile)
    whisperFormData.append('language', 'auto') // Auto-detect language
    whisperFormData.append('task', 'transcribe')

    // Call our WhisperX STT API
    const response = await fetch(API_CONFIG.sttEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LIBRAXIS_API_KEY || "sk-libraxis-default"}`
      },
      body: whisperFormData
    })

    if (!response.ok) {
      throw new Error(`WhisperX API error: ${response.status}`)
    }

    const data = await response.json()
    
    return Response.json({ 
      text: data.text || data.transcription || "",
      language: data.language || "unknown"
    })
  } catch (error) {
    console.error("STT error:", error)
    return Response.json({ 
      error: "Transcription failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}