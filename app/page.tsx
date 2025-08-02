"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Starfield from "@/components/starfield"
import SearchBar from "@/components/search-bar"
import ChatInterface from "@/components/chat-interface"
import Footer from "@/components/footer"
import HelpOverlay from "@/components/help-overlay"
import { handleApiError } from "@/lib/api-helpers"
import { PERFORMANCE_CONFIG, safeLog } from "@/lib/env-config"
import type { ChatContext } from "@/types/chat"

// Dynamically import components that might cause hydration issues
const LibraConstellation = dynamic(() => import("@/components/libra-constellation"), { ssr: false })
const ParticleCursor = dynamic(() => import("@/components/particle-cursor"), { ssr: false })
const ProductShowcase = dynamic(() => import("@/components/product-showcase"), { ssr: false })

// Detect Polish language
function isPolishMessage(message: string): boolean {
  return (
    /[ąćęłńóśźż]/i.test(message) ||
    /\b(czy|jak|co|gdzie|kiedy|dlaczego|proszę|dziękuję|możesz|jestem|mamy|chcę|polsku|polski|witaj|cześć|dzień dobry)\b/i.test(
      message,
    )
  )
}

export default function Home() {
  // Refs for tracking state changes
  const stateChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // State
  const [searchFocused, setSearchFocused] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [chatState, setChatState] = useState<"initial" | "active" | "inactive">("active")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [lastActivity, setLastActivity] = useState(0) // Initialize with 0 instead of Date.now()
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrorCount, setApiErrorCount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [chatContext, setChatContext] = useState<ChatContext>({ conversation_stage: "greeting" })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Set initial lastActivity after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setLastActivity(Date.now())
  }, [])

  // Track user activity with debounce
  useEffect(() => {
    if (!mounted) return

    const handleActivity = () => {
      setLastActivity(Date.now())
      if (chatActive && chatState === "inactive") {
        setChatState("active")
      }
    }

    // Listen for user activity events
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
    }
  }, [chatActive, chatState, mounted])

  // Always maintain active state when chat is active
  useEffect(() => {
    if (!mounted || !chatActive) return

    if (chatActive && chatState !== "active") {
      setChatState("active")
    }

    return () => {
      if (stateChangeTimeoutRef.current) {
        clearTimeout(stateChangeTimeoutRef.current)
      }
    }
  }, [chatActive, chatState, mounted])

  // Prefetch key resources for performance optimization
  useEffect(() => {
    if (!mounted) return

    if (PERFORMANCE_CONFIG.prefetchResources) {
      // Prefetch API routes
      const prefetchRoutes = ["/api/chat", "/api/check-config"]
      prefetchRoutes.forEach((route) => {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = route
        document.head.appendChild(link)
      })

      safeLog("info", "Prefetched key resources for performance optimization")
    }
  }, [mounted])

  // Fallback response generator for when API fails repeatedly
  const generateFallbackResponse = useCallback((query: string) => {
    const fallbackResponses = [
      "System weterynaryjny Vista doświadcza chwilowych problemów z połączeniem. Pracuję nad przywróceniem pełnej funkcjonalności.",
      "Przepraszam za utrudnienia. Nasze serwery weterynaryjne są tymczasowo przeciążone. Spróbuj ponownie za chwilę.",
      "Vista pracuje w trybie awaryjnym. Mogę odpowiedzieć na podstawowe pytania weterynaryjne.",
      "Połączenie z bazą wiedzy weterynaryjnej jest niestabilne. Działam na lokalnych zasobach.",
    ]

    // Simple response based on query keywords
    if (query.toLowerCase().includes("cześć") || query.toLowerCase().includes("witaj")) {
      return "Witaj! Jestem Vista - Twój asystent weterynaryjny. Działam w trybie awaryjnym, ale postaram się pomóc."
    }

    if (query.toLowerCase().includes("pomoc") || query.toLowerCase().includes("co potrafisz")) {
      return "Jestem Vista - specjalizuję się w diagnostyce weterynaryjnej, planowaniu leczenia, farmakologii i chirurgii. Jak mogę pomóc?"
    }

    // Return a random fallback response if no keywords match
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  }, [])

  // Handle search submission without streaming
  const handleSearchSubmit = async (query: string) => {
    if (!mounted) return

    setLastActivity(Date.now())
    setIsLoading(true)
    setErrorMessage(null)

    // Detect Polish language
    const isPolish = isPolishMessage(query)

    // Log language detection
    safeLog("info", `User query language: ${isPolish ? "Polish" : "English"}`)

    // Activate chat with a smoother transition
    if (!chatActive) {
      setChatActive(true)
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setChatState("active")
      }, 100)

      // Add user message
      setMessages([{ role: "user", content: query }])
    } else {
      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: query }])
    }

    try {
      // Log the query for debugging in non-production environments
      safeLog("info", `User query: ${query}`)

      // Make request without streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          stream: false,
          sessionId: sessionId,
          messageHistory: messages,
          language: isPolish ? "pl" : "en", // Add language hint
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      // Parse the JSON response
      const data = await response.json()

      // Store session ID if provided
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }

      // Update chat context if provided
      if (data.context) {
        setChatContext(data.context)
      }

      // Add the complete message
      if (data && data.message) {
        // Small delay to make the response feel more natural
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
          // Reset error count on success
          setApiErrorCount(0)
          setIsLoading(false)
        }, 500)
      } else {
        // If we somehow got an empty response, use fallback
        setTimeout(() => {
          const fallbackResponse = generateFallbackResponse(query)
          setMessages((prev) => [...prev, { role: "assistant", content: fallbackResponse }])
          setIsLoading(false)
        }, 500)
      }
    } catch (error) {
      safeLog("error", "Error fetching AI response:", error)

      // Increment error count
      setApiErrorCount((prev) => prev + 1)

      // Set error message for debugging
      setErrorMessage(error instanceof Error ? error.message : String(error))

      // Use our error handling utility or fallback
      let errorMessage
      if (apiErrorCount > 2) {
        // After multiple failures, use the fallback generator
        errorMessage = generateFallbackResponse(query)
      } else {
        errorMessage = handleApiError(error)
      }

      // Small delay to make the response feel more natural
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errorMessage,
          },
        ])
        setIsLoading(false)
      }, 500)
    }
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      {/* Starfield Background */}
      {mounted && <Starfield />}

      {/* Libra Constellation - disabled for VISTA */}
      {/* {mounted && <LibraConstellation />} */}

      {/* Particle Cursor Effect - disabled for VISTA */}
      {/* {mounted && PERFORMANCE_CONFIG.adaptiveAnimations && <ParticleCursor />} */}

      {/* Product Showcase - disabled for VISTA */}
      {/* {mounted && !chatActive && <ProductShowcase />} */}

      {/* Company Name - Fixed at top */}
      <motion.div
        className="absolute top-10 left-0 right-0 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <h1 className="font-light tracking-[0.5em] text-2xl uppercase">VISTA</h1>
        <p className="mt-2 text-xs tracking-wider opacity-70">Weterynaryjna Inteligencja • sVETLIQ-11B-v3-evolutionary • Early Preview</p>
      </motion.div>

      {/* Error Message - disabled for cleaner UI */}

      {/* Central Content - Always centered in viewport */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className={`w-full px-4 flex items-center justify-center min-h-[50vh] ${chatActive ? "max-w-full" : "max-w-2xl"}`}
          style={{ transition: "max-width 0.5s ease" }}
        >
          {/* Search and Chat Container - Fixed height and position */}
          <div className="relative w-full">
            {/* Search Bar */}
            <div
              className="w-full absolute left-0 right-0"
              style={{
                opacity: chatActive ? 0 : 1,
                transform: `translateY(${chatActive ? "-20px" : "0"})`,
                pointerEvents: chatActive ? "none" : "auto",
                top: "50%",
                marginTop: "-25px", // Half of the search bar height
                transition:
                  "opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
                willChange: "opacity, transform",
                backfaceVisibility: "hidden",
              }}
            >
              <SearchBar
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onSubmit={handleSearchSubmit}
                focused={searchFocused}
              />
            </div>

            {/* Chat Interface */}
            <div
              className="w-full flex justify-center"
              style={{
                opacity: chatActive ? 1 : 0,
                transform: `translateY(${chatActive ? "0" : "20px"})`,
                pointerEvents: chatActive ? "auto" : "none",
                transition: chatActive
                  ? "opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1) 0.1s, transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1) 0.1s"
                  : "opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
                willChange: "opacity, transform",
                backfaceVisibility: "hidden",
              }}
            >
              <ChatInterface
                messages={messages}
                chatState={chatState}
                isLoading={isLoading}
                streamingContent={null}
                onSendMessage={(message) => {
                  handleSearchSubmit(message)
                }}
                onFocus={() => {
                  setLastActivity(Date.now())
                  setChatState("active")
                }}
                sessionId={sessionId}
                context={chatContext}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Help Overlay - disabled for VISTA */}
      {/* {mounted && <HelpOverlay />} */}
    </main>
  )
}
