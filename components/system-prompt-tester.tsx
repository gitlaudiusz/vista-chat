"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DEBUG_MODE } from "@/lib/env-config"

export default function SystemPromptTester() {
  // Don't render in production unless explicitly enabled
  if (!DEBUG_MODE.showSystemTester) {
    return null
  }

  const [isVisible, setIsVisible] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Test 1: Basic response
      const basicResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What is Libraxis AI?" }),
      })

      if (!basicResponse.ok) {
        throw new Error(`API error: ${basicResponse.status}`)
      }

      const basicData = await basicResponse.json()

      // Check if the response contains key phrases that should be in the system prompt
      const basicResponseText = basicData.message.toLowerCase()
      const hasLibraxisReference = basicResponseText.includes("libraxis")
      const hasOrbitalReference =
        basicResponseText.includes("orbit") ||
        basicResponseText.includes("cosmic") ||
        basicResponseText.includes("celestial")

      if (!hasLibraxisReference || !hasOrbitalReference) {
        setTestResult({
          success: false,
          message: "System prompt may not be properly integrated. Response is missing key references.",
        })
        return
      }

      setTestResult({
        success: true,
        message: "System prompt appears to be working correctly!",
      })
    } catch (error) {
      console.error("Test error:", error)
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred during testing",
      })
    } finally {
      setIsLoading(false)
    }
  }

  let tester = null

  if (isVisible) {
    tester = (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-lg z-50 w-80"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white/90 text-sm font-medium">System Prompt Tester</h3>
          <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white/90">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={runTest}
            disabled={isLoading}
            className="w-full bg-white/15 hover:bg-white/25 text-white py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Run System Prompt Test"}
          </button>

          {testResult && (
            <div
              className={`p-3 rounded-md text-sm ${
                testResult.success ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white/70 text-xs px-2 py-1 rounded-md z-50"
        >
          Test System
        </button>
      )}
      {tester}
    </>
  )
}
