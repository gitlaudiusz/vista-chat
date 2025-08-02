"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, Mic, MicOff } from "lucide-react"

interface SearchBarProps {
  onFocus: () => void
  onBlur: () => void
  onSubmit: (query: string) => void
  focused: boolean
}

export default function SearchBar({ onFocus, onBlur, onSubmit, focused }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [pulseAnimation, setPulseAnimation] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(0)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Get viewport width on mount and resize
  useEffect(() => {
    setMounted(true)
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth)
    }

    // Initial call
    updateViewportWidth()

    // Add event listener
    window.addEventListener("resize", updateViewportWidth)

    // Cleanup
    return () => window.removeEventListener("resize", updateViewportWidth)
  }, [])

  // Stop pulse animation when focused
  useEffect(() => {
    if (!mounted) return

    if (focused) {
      setPulseAnimation(false)
      // Focus the input when the search bar is focused
      inputRef.current?.focus()
    } else {
      // Resume pulse animation after a delay when not focused
      const timer = setTimeout(() => {
        setPulseAnimation(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [focused, mounted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSubmit(query)
      setQuery("")
    }
  }

  // Calculate responsive width based on viewport
  const getResponsiveWidth = () => {
    if (!mounted) return "90%"

    if (viewportWidth < 640) {
      return focused ? "100%" : "90%"
    } else if (viewportWidth < 1024) {
      return focused ? "100%" : "80%"
    } else {
      return focused ? "100%" : "70%"
    }
  }

  const handleVoiceInput = async () => {
    if (!mounted) return
    
    if (isRecording && mediaRecorder) {
      // Stop recording
      mediaRecorder.stop()
      setIsRecording(false)
      return
    }

    try {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        setIsTranscribing(true)
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        
        // Send to our WhisperX STT API
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')
        
        try {
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData
          })
          
          if (response.ok) {
            const { text } = await response.json()
            if (text?.trim()) {
              setQuery(text)
              // Auto-submit the transcribed text
              onSubmit(text)
            } else {
              // Show placeholder if no speech detected
              setQuery("(No speech detected)")
              setTimeout(() => setQuery(""), 2000)
            }
          } else {
            const error = await response.json()
            console.error('STT API error:', error)
            setQuery("(Transcription failed)")
            setTimeout(() => setQuery(""), 2000)
          }
        } catch (error) {
          console.error('STT error:', error)
          setQuery("(Connection error)")
          setTimeout(() => setQuery(""), 2000)
        } finally {
          setIsTranscribing(false)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Microphone access error:', error)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        onFocus()
      }
      
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && query.trim()) {
        e.preventDefault()
        handleSubmit(e as any)
      }

      // Ctrl/Cmd + Shift + V for voice input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        handleVoiceInput()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mounted, query, onFocus])

  return (
    <div
      ref={searchBarRef}
      className={`relative w-full overflow-hidden rounded-full ${
        focused ? "shadow-[0_0_25px_rgba(255,255,255,0.3)]" : "shadow-[0_0_15px_rgba(255,255,255,0.15)]"
      } mx-auto`}
      style={{
        width: getResponsiveWidth(),
        transition: "width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
        willChange: "width, box-shadow",
        transform: "translateZ(0)",
      }}
    >
      <div
        className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full overflow-hidden"
        style={{
          boxShadow: focused
            ? "0 0 30px rgba(255, 255, 255, 0.2), 0 0 40px rgba(120, 150, 255, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)"
            : "0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 8px rgba(255, 255, 255, 0.05)",
          transition: "box-shadow 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
          willChange: "box-shadow",
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-center">
          <div
            className="flex items-center justify-center h-12 w-12 text-white/80"
            style={{
              opacity: pulseAnimation ? 0.7 : 0.7,
              transition: "opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
              willChange: "opacity",
            }}
          >
            <Search size={18} className={pulseAnimation ? "animate-cosmic-pulse" : ""} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Zapytaj Vistę o cokolwiek..."
            aria-label="Zapytaj Vistę - asystenta weterynaryjnego"
            aria-describedby="search-help"
            className="flex-1 bg-transparent text-white placeholder-white/50 outline-none px-2 py-3"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isTranscribing}
            aria-label={
              isTranscribing 
                ? "Transcribing audio with WhisperX" 
                : isRecording 
                  ? "Stop voice recording" 
                  : "Start voice input with WhisperX STT"
            }
            className={`flex items-center justify-center h-12 w-12 transition-colors ${
              isTranscribing
                ? "text-blue-400 cursor-wait"
                : isRecording 
                  ? "text-red-400 animate-pulse" 
                  : "text-white/80 hover:text-white focus:ring-2 focus:ring-white/50 rounded-full"
            }`}
            title={
              isTranscribing 
                ? "Transcribing with WhisperX..." 
                : isRecording 
                  ? "Stop recording (click or speak)" 
                  : "Voice input (⌘⇧V) - WhisperX STT"
            }
          >
            {isTranscribing ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : isRecording ? (
              <MicOff size={18} className="animate-pulse" />
            ) : (
              <Mic size={18} />
            )}
          </button>
        </form>
      </div>

      {/* Ambient glow effect */}
      <div
        className="absolute inset-0 -z-10 rounded-full opacity-40 blur-xl"
        style={{
          background: focused
            ? "radial-gradient(circle, rgba(120, 150, 255, 0.4) 0%, rgba(0, 0, 0, 0) 70%)"
            : "radial-gradient(circle, rgba(120, 150, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)",
          transition: "background 0.5s ease",
        }}
      />
    </div>
  )
}
