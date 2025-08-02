import { NextRequest } from "next/server"
import { API_CONFIG } from "@/lib/env-config"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "MarekNeural", language = "auto" } = await request.json()
    
    if (!text || !text.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    // Detect language if auto
    const detectedLang = language === "auto" 
      ? /[ąćęłńóśźż]/i.test(text) ? "pl" : "en"
      : language

    // Call our TTS API
    const response = await fetch(API_CONFIG.ttsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LIBRAXIS_API_KEY || "sk-libraxis-default"}`
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: voice,
        language: detectedLang,
        format: "mp3",
        speed: 1.0
      })
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`)
    }

    // Stream the audio back
    const audioBuffer = await response.arrayBuffer()
    
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error("TTS error:", error)
    return Response.json({ 
      error: "TTS synthesis failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}