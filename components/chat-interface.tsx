"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Maximize2, Minimize2, Copy, Check } from "lucide-react"
import MarkdownRenderer from "./markdown-renderer"
import TTSPlayer from "./tts-player"
import type { ChatContext } from "@/types/chat"

interface ChatInterfaceProps {
  messages: { role: "user" | "assistant"; content: string }[]
  chatState: "initial" | "active" | "inactive"
  onSendMessage: (message: string) => void
  onFocus: () => void
  isLoading: boolean
  streamingContent: string | null
  sessionId?: string | null
  context?: ChatContext
}

// Dodaj tę funkcję przed deklaracją komponentu
function isPolishMessage(message: string): boolean {
  return (
    /[ąćęłńóśźż]/i.test(message) ||
    /\b(czy|jak|co|gdzie|kiedy|dlaczego|proszę|dziękuję|możesz|jestem|mamy|chcę|polsku|polski|witaj|cześć|dzień dobry)\b/i.test(
      message,
    )
  )
}

export default function ChatInterface({
  messages,
  chatState,
  onSendMessage,
  onFocus,
  isLoading,
  streamingContent,
  sessionId,
  context,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [viewportHeight, setViewportHeight] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [cssVars, setCssVars] = useState({
    chatOpacity: 0.9,
    chatBlur: "8px",
    chatGlow: "15px",
    chatBgOpacity: 0.35,
  })

  // Dodaj ten stan w komponencie
  const [isPolish, setIsPolish] = useState(false)

  // Mark component as mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get viewport height on mount and resize
  useEffect(() => {
    if (!mounted) return

    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight)
    }

    // Initial call
    updateViewportHeight()

    // Add event listener
    window.addEventListener("resize", updateViewportHeight)

    // Cleanup
    return () => window.removeEventListener("resize", updateViewportHeight)
  }, [mounted])

  // Auto-scroll to bottom of messages - use a more stable approach
  useEffect(() => {
    if (!mounted) return

    if (messagesEndRef.current) {
      // Use setTimeout to ensure the scroll happens after rendering
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [messages, mounted])

  // Focus input when chat becomes active
  useEffect(() => {
    if (!mounted) return

    if (chatState === "active" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatState, mounted])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (!mounted) return

    if (copiedIndex !== null) {
      const timer = setTimeout(() => {
        setCopiedIndex(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedIndex, mounted])

  // Update CSS variables based on chat state
  useEffect(() => {
    if (!mounted) return

    // Set CSS variables based on state
    switch (chatState) {
      case "active":
        setCssVars({
          chatOpacity: 1,
          chatBlur: "12px",
          chatGlow: "20px",
          chatBgOpacity: 0.4,
        })
        break
      case "inactive":
        setCssVars({
          chatOpacity: 0.75,
          chatBlur: "4px",
          chatGlow: "10px",
          chatBgOpacity: 0.3,
        })
        break
      case "initial":
      default:
        setCssVars({
          chatOpacity: 0.9,
          chatBlur: "8px",
          chatGlow: "15px",
          chatBgOpacity: 0.35,
        })
        break
    }
  }, [chatState, mounted])

  // Dodaj tę logikę w handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      // Detect Polish language
      const detectedPolish = isPolishMessage(input)
      setIsPolish(detectedPolish)

      // Client-side logging of user input
      if (mounted && sessionId) {
        console.log(
          `[Chat] User input (${sessionId || "no-session"}): ${input.substring(0, 50)}${input.length > 50 ? "..." : ""} - Language: ${detectedPolish ? "Polish" : "English"}`,
        )
      }

      onSendMessage(input)
      setInput("")
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    if (!mounted) return

    navigator.clipboard.writeText(text)
    setCopiedIndex(index)

    // Client-side logging of copy action
    if (sessionId) {
      console.log(`[Chat] Message copied (${sessionId || "no-session"}): message #${index}`)
    }
  }

  // Calculate responsive height based on viewport and expanded state
  const getMessagesHeight = () => {
    if (expanded) {
      return "h-[70vh]"
    }

    if (viewportHeight < 600) {
      return "h-[250px]"
    } else if (viewportHeight < 800) {
      return "h-[350px]"
    } else {
      return "h-[400px]"
    }
  }

  // Calculate responsive width based on expanded state
  const getContainerWidth = () => {
    return expanded ? "max-w-4xl" : "max-w-2xl"
  }

  // Get conversation stage display name
  const getStageName = () => {
    if (!context) return "Cosmic Conversation"

    switch (context.conversation_stage) {
      case "greeting":
        return "Initial Contact"
      case "exploration":
        return "Cosmic Exploration"
      case "technical_discussion":
        return "Technical Alignment"
      case "conclusion":
        return "Orbital Farewell"
      default:
        return "Cosmic Conversation"
    }
  }

  return (
    <div
      ref={chatContainerRef}
      onClick={onFocus}
      onFocus={onFocus}
      className={`border border-white/15 rounded-2xl overflow-hidden transition-all duration-300 ${getContainerWidth()}`}
      style={{
        opacity: cssVars.chatOpacity,
        backdropFilter: `blur(${cssVars.chatBlur})`,
        backgroundColor: `rgba(0, 0, 0, ${cssVars.chatBgOpacity})`,
        boxShadow: `0 0 ${cssVars.chatGlow} rgba(120, 150, 255, 0.15)`,
        transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
        willChange: "opacity, box-shadow, backdrop-filter",
        transform: "translateZ(0)",
      }}
    >
      {/* Header with expand/collapse button */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
        <div>
          <h3 className="text-sm font-medium text-white/80">
            {getStageName()}
            {sessionId && mounted && (
              <span className="text-xs text-white/40 ml-2">ID: {sessionId.substring(0, 8)}</span>
            )}
          </h3>
          {context && context.last_topic && <p className="text-xs text-white/50">Topic: {context.last_topic}</p>}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/60 hover:text-white/90 transition-colors p-1 rounded-full hover:bg-white/10"
          aria-label={expanded ? "Collapse chat" : "Expand chat"}
        >
          {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Messages area with responsive height */}
      <div
        className={`${getMessagesHeight()} overflow-y-auto p-6 space-y-4`}
        style={{
          opacity: 1, // Zawsze pełna nieprzezroczystość zamiast: chatState === "inactive" ? 0.6 : 1
          transition: "opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          willChange: "opacity, height",
        }}
      >
        {/* Static rendering of messages without animations */}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}>
            <div
              className={`relative max-w-[90%] px-4 py-3 rounded-2xl ${
                message.role === "user" ? "bg-white/15 text-white" : "bg-white/10 text-white/95"
              }`}
            >
              {message.role === "assistant" && mounted && (
                <>
                  <button
                    onClick={() => copyToClipboard(message.content, index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                    aria-label="Copy message"
                  >
                    {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TTSPlayer 
                      text={message.content} 
                      voice={isPolishMessage(message.content) ? "ZofiaNeural" : "MarekNeural"}
                      autoPlay={false}
                    />
                  </div>
                </>
              )}

              {message.role === "user" ? (
                <p className="text-sm leading-relaxed">{message.content}</p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator - simplified */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white/10 text-white/95">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-6 flex items-center">
                  <div className="w-2 h-2 bg-blue-400/80 rounded-full mr-1 pulse-dot"></div>
                  <div className="w-2 h-2 bg-indigo-300/90 rounded-full mr-1 pulse-dot delay-1"></div>
                  <div className="w-2 h-2 bg-purple-300/70 rounded-full pulse-dot delay-2"></div>
                </div>
                <span className="text-xs text-white/70">Aligning cosmic knowledge...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`border-t border-white/15 p-4 opacity-100 transition-opacity duration-300`}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Zaktualizuj placeholder w zależności od wykrytego języka */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={onFocus}
            placeholder={isPolish ? "Kontynuuj rozmowę..." : "Continue the conversation..."}
            disabled={isLoading}
            className="flex-1 bg-black/30 text-white placeholder-white/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
          />
          <button
            type="submit"
            onFocus={onFocus}
            disabled={isLoading || !input.trim()}
            className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:hover:bg-white/15"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
