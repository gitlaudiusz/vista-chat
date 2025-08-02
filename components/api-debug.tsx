"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DEBUG_MODE, safeLog } from "@/lib/env-config"

export default function ApiDebug() {
  // Don't render in production unless explicitly enabled
  if (!DEBUG_MODE.showApiDiagnostics) {
    return null
  }

  const [isVisible, setIsVisible] = useState(false)
  const [apiStatus, setApiStatus] = useState<{
    status: "unknown" | "ok" | "error"
    message: string
  }>({ status: "unknown", message: "Checking API status..." })
  const [envStatus, setEnvStatus] = useState<{
    status: "unknown" | "ok" | "error"
    message: string
  }>({ status: "unknown", message: "Checking environment variables..." })
  const [testDetails, setTestDetails] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  // Add a log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
    safeLog("debug", message)
  }

  // Test the API connection
  const testApiConnection = async () => {
    setApiStatus({ status: "unknown", message: "Testing API connection..." })
    setTestDetails(null)
    addLog("Starting API connection test...")

    try {
      // Use a simple test message
      const testMessage = "Hello, this is a test message."
      addLog(`Sending test message: "${testMessage}"`)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage, stream: false }), // Use non-streaming mode
      })

      addLog(`API response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      // Parse the JSON response
      const data = await response.json()
      addLog(`Received response data: ${JSON.stringify(data).substring(0, 100)}...`)

      if (!data || !data.message) {
        throw new Error("No message in response data")
      }

      setTestDetails(`Received message: "${data.message.substring(0, 50)}..."`)

      setApiStatus({
        status: "ok",
        message: "API connection successful! The cosmic library is responding.",
      })
    } catch (error) {
      console.error("API test error:", error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)

      setApiStatus({
        status: "error",
        message: `API connection failed: ${error instanceof Error ? error.message : String(error)}`,
      })

      // Add more debugging info
      if (error instanceof Error) {
        setTestDetails(`Error details: ${error.stack || "No stack trace available"}`)
      }
    }
  }

  // Check API key presence
  const checkApiKey = async () => {
    setEnvStatus({ status: "unknown", message: "Checking API key configuration..." })
    setTestDetails(null)
    addLog("Checking API key configuration...")

    try {
      const res = await fetch("/api/check-config")
      addLog(`Config check response status: ${res.status}`)

      if (!res.ok) {
        throw new Error(`Config check returned status ${res.status}`)
      }

      const data = await res.json()
      addLog(`Config check data: ${JSON.stringify(data)}`)

      if (data.hasApiKey) {
        setEnvStatus({
          status: "ok",
          message: "API key is configured.",
        })
      } else {
        setEnvStatus({
          status: "error",
          message: "API key is missing. Please add the ANTHROPIC_API_KEY to your environment variables.",
        })
      }
    } catch (err) {
      console.error("Config check error:", err)
      addLog(`Config check error: ${err instanceof Error ? err.message : String(err)}`)

      setEnvStatus({
        status: "error",
        message: `Failed to check API key: ${err instanceof Error ? err.message : String(err)}`,
      })
    }
  }

  // Check environment variables on mount
  useEffect(() => {
    checkApiKey()
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-white/10 hover:bg-white/20 text-white/70 text-xs px-2 py-1 rounded-md z-50"
      >
        Debug API
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-lg z-50 ${isExpanded ? "w-96 h-96" : "w-80"}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white/90 text-sm font-medium">API Diagnostics</h3>
        <div className="flex space-x-2">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-white/60 hover:text-white/90 px-1">
            {isExpanded ? "↓" : "↑"}
          </button>
          <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white/90">
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Environment Variables Status */}
        <div
          className={`p-3 rounded-md text-sm ${
            envStatus.status === "ok"
              ? "bg-green-500/20 text-green-200"
              : envStatus.status === "error"
                ? "bg-red-500/20 text-red-200"
                : "bg-blue-500/20 text-blue-200"
          }`}
        >
          <div className="font-medium mb-1">Environment Variables:</div>
          {envStatus.message}
        </div>

        {/* API Status */}
        <div
          className={`p-3 rounded-md text-sm ${
            apiStatus.status === "ok"
              ? "bg-green-500/20 text-green-200"
              : apiStatus.status === "error"
                ? "bg-red-500/20 text-red-200"
                : "bg-blue-500/20 text-blue-200"
          }`}
        >
          <div className="font-medium mb-1">API Status:</div>
          {apiStatus.message}
        </div>

        {testDetails && (
          <div className="p-3 rounded-md text-xs bg-gray-500/20 text-gray-300 max-h-32 overflow-y-auto">
            {testDetails}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={testApiConnection}
            className="flex-1 bg-white/15 hover:bg-white/25 text-white py-2 rounded-md text-sm"
          >
            Test API
          </button>
          <button
            onClick={checkApiKey}
            className="flex-1 bg-white/15 hover:bg-white/25 text-white py-2 rounded-md text-sm"
          >
            Check Config
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4">
            <h4 className="text-white/80 text-xs font-medium mb-2">Debug Logs</h4>
            <div className="bg-black/30 rounded-md p-2 h-40 overflow-y-auto text-xs text-white/70 font-mono">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-white/40 italic">No logs yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
