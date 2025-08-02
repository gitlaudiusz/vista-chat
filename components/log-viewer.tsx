"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DEBUG_MODE } from "@/lib/env-config"
import { LogType } from "@/lib/logging/logger"

interface LogEntry {
  timestamp: string
  level: number
  type: string
  message: string
  data?: any
  userId?: string
  sessionId?: string
}

export default function LogViewer() {
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeType, setActiveType] = useState<LogType | "all">("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Use useEffect to handle client-side only code
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/logs?type=" + activeType)

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`)
      }

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isVisible && mounted) {
      fetchLogs()

      // Set up polling for logs
      intervalId = setInterval(fetchLogs, 5000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isVisible, activeType, mounted])

  // Get level color
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "text-red-400" // ERROR
      case 1:
        return "text-yellow-400" // WARN
      case 2:
        return "text-blue-400" // INFO
      case 3:
        return "text-green-400" // DEBUG
      case 4:
        return "text-gray-400" // VERBOSE
      default:
        return "text-white"
    }
  }

  // Get level name
  const getLevelName = (level: number) => {
    const levels = ["ERROR", "WARN", "INFO", "DEBUG", "VERBOSE"]
    return levels[level] || "UNKNOWN"
  }

  // Don't render in production unless explicitly enabled
  if (!mounted || !DEBUG_MODE.enabled) {
    return null
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 bg-white/10 hover:bg-white/20 text-white/70 text-xs px-2 py-1 rounded-md z-50"
      >
        View Logs
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow-lg z-50 w-[600px] max-h-[80vh] overflow-hidden flex flex-col"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white/90 text-sm font-medium">Log Viewer</h3>
        <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white/90">
          ✕
        </button>
      </div>

      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => setActiveType("all")}
          className={`px-2 py-1 text-xs rounded ${activeType === "all" ? "bg-white/20" : "bg-white/5"}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveType(LogType.API)}
          className={`px-2 py-1 text-xs rounded ${activeType === LogType.API ? "bg-white/20" : "bg-white/5"}`}
        >
          API
        </button>
        <button
          onClick={() => setActiveType(LogType.CHAT)}
          className={`px-2 py-1 text-xs rounded ${activeType === LogType.CHAT ? "bg-white/20" : "bg-white/5"}`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveType(LogType.SYSTEM)}
          className={`px-2 py-1 text-xs rounded ${activeType === LogType.SYSTEM ? "bg-white/20" : "bg-white/5"}`}
        >
          System
        </button>
        <button
          onClick={fetchLogs}
          className="ml-auto px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="bg-red-500/20 text-red-200 p-2 rounded mb-3 text-xs">{error}</div>}

      <div className="flex-1 overflow-y-auto bg-black/30 rounded p-2 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-white/40 italic p-2">No logs available</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-2 border-b border-white/10 pb-2">
              <div className="flex items-start">
                <span className="text-white/60 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`${getLevelColor(log.level)} mr-2`}>[{getLevelName(log.level)}]</span>
                <span className="text-white/80 mr-2">[{log.type}]</span>
                <span className="text-white">{log.message}</span>
              </div>
              {log.sessionId && <div className="text-white/40 text-xs mt-1">Session: {log.sessionId}</div>}
              {log.data && (
                <pre className="mt-1 p-1 bg-black/20 rounded text-white/70 overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
