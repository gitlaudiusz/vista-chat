"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DEBUG_MODE } from "@/lib/env-config"
import type { TestSuite } from "@/lib/test-utils"

export default function PreProductionTester() {
  // Don't render in production unless explicitly enabled
  if (!DEBUG_MODE.enabled) {
    return null
  }

  const [isVisible, setIsVisible] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestSuite | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    setError(null)

    try {
      const response = await fetch("/api/pre-production-test")

      if (!response.ok) {
        throw new Error(`Test API returned status ${response.status}`)
      }

      const data = await response.json()
      setTestResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 text-white/70 text-xs px-2 py-1 rounded-md z-50"
      >
        Pre-Production Test
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-lg z-50 w-96 max-h-[90vh] overflow-auto"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white/90 text-sm font-medium">Pre-Production Test Suite</h3>
        <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white/90">
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full bg-white/15 hover:bg-white/25 text-white py-2 rounded-md disabled:opacity-50"
        >
          {isRunning ? "Running Tests..." : "Run Pre-Production Tests"}
        </button>

        {error && <div className="p-3 rounded-md text-sm bg-red-500/20 text-red-200">{error}</div>}

        {testResults && (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-md text-sm ${
                testResults.success ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"
              }`}
            >
              <div className="font-medium">Test Suite: {testResults.name}</div>
              <div>Status: {testResults.success ? "PASSED" : "FAILED"}</div>
              <div>Duration: {testResults.duration}ms</div>
            </div>

            <div className="space-y-2">
              {testResults.tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md text-xs ${
                    test.success ? "bg-green-500/10 text-green-200" : "bg-red-500/10 text-red-200"
                  }`}
                >
                  <div className="font-medium">
                    {test.name}: {test.success ? "✓" : "✗"}
                  </div>
                  <div>{test.message}</div>
                  {test.details && (
                    <div className="mt-1 text-xs opacity-80">
                      {Object.entries(test.details).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
