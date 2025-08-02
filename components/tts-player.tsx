"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"

interface TTSPlayerProps {
  text: string
  autoPlay?: boolean
  voice?: "MarekNeural" | "ZofiaNeural"
}

export default function TTSPlayer({ text, autoPlay = false, voice = "MarekNeural" }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const generateSpeech = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice,
          language: /[ąćęłńóśźż]/i.test(text) ? 'pl' : 'en'
        })
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }

      // Get audio blob
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Auto-play if requested
      if (autoPlay) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
            setIsPlaying(true)
          }
        }, 100)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS failed')
      console.error('TTS error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!audioUrl) {
        await generateSpeech()
        return
      }
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
  }

  // Auto-generate speech when text changes and autoPlay is enabled
  useEffect(() => {
    if (autoPlay && text.trim()) {
      generateSpeech()
    }
  }, [text, autoPlay])

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  if (!text.trim()) return null

  return (
    <div className="flex items-center space-x-2 mt-2">
      <button
        onClick={togglePlayback}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all disabled:opacity-50"
        title={`Play with ${voice}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} />
        ) : (
          <Play size={14} />
        )}
      </button>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <span className="text-xs text-white/50">
        {voice} {error && `(${error})`}
      </span>
    </div>
  )
}