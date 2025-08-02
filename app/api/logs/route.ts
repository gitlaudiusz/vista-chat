import { type NextRequest, NextResponse } from "next/server"
import { DEBUG_MODE } from "@/lib/env-config"
import { LogType } from "@/lib/logging/logger"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  // Only allow in development or when debug is explicitly enabled
  if (!DEBUG_MODE.enabled) {
    return NextResponse.json(
      {
        message: "Logs are only available in development mode or when debug is enabled",
      },
      { status: 403 },
    )
  }

  try {
    const searchParams = new URL(request.url).searchParams
    const type = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // Get logs directory
    const logsDir = path.join(process.cwd(), "logs")

    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({
        logs: [],
        message: "No logs directory found",
      })
    }

    // Get logs based on type
    let logs: any[] = []

    if (type === "all") {
      // Get logs from all subdirectories
      for (const logType of Object.values(LogType)) {
        const typeDir = path.join(logsDir, logType)
        if (fs.existsSync(typeDir)) {
          const typeLogs = await getLogsFromDirectory(typeDir, limit)
          logs = [...logs, ...typeLogs]
        }
      }
    } else {
      // Get logs from specific type directory
      const typeDir = path.join(logsDir, type)
      if (fs.existsSync(typeDir)) {
        logs = await getLogsFromDirectory(typeDir, limit)
      }
    }

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Paginate logs
    const startIndex = (page - 1) * limit
    const paginatedLogs = logs.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      total: logs.length,
      page,
      limit,
      type,
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        logs: [],
      },
      { status: 500 },
    )
  }
}

// Helper function to get logs from a directory
async function getLogsFromDirectory(directory: string, limit: number): Promise<any[]> {
  // Get all log files in the directory
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".log"))
    .sort((a, b) => {
      // Sort by date (newest first)
      const aDate = new Date(a.split(".")[0])
      const bDate = new Date(b.split(".")[0])
      return bDate.getTime() - aDate.getTime()
    })

  let logs: any[] = []

  // Read logs from files (newest first)
  for (const file of files) {
    if (logs.length >= limit) break

    const filePath = path.join(directory, file)
    const content = fs.readFileSync(filePath, "utf8")

    // Parse log entries
    const entries = content
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch (error) {
          return null
        }
      })
      .filter((entry) => entry !== null)

    logs = [...logs, ...entries]

    // Break if we have enough logs
    if (logs.length >= limit) {
      logs = logs.slice(0, limit)
      break
    }
  }

  return logs
}
