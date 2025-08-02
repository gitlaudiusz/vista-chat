/**
 * Log Cleanup Script
 *
 * This script cleans up old log files to prevent disk space issues.
 * It can be run manually or scheduled as a cron job.
 */

const fs = require("fs")
const path = require("path")

// Configuration
const config = {
  // Base logs directory
  logsDir: path.join(process.cwd(), "logs"),

  // Maximum age of log files in days
  maxAgeDays: 30,

  // Maximum number of log files to keep per type
  maxFilesPerType: 100,

  // Log types to clean up
  logTypes: ["api", "chat", "system"],
}

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

// Print a header
console.log(`${colors.cyan}
╔════════════════════════════════════════════════════╗
║                                                    ║
║              Libraverse Log Cleanup                ║
║                                                    ║
╚════════════════════════════════════════════════════╝
${colors.reset}`)

// Check if logs directory exists
if (!fs.existsSync(config.logsDir)) {
  console.log(`${colors.yellow}Logs directory not found: ${config.logsDir}${colors.reset}`)
  console.log(`${colors.yellow}Creating logs directory...${colors.reset}`)

  try {
    fs.mkdirSync(config.logsDir, { recursive: true })
    console.log(`${colors.green}Logs directory created successfully.${colors.reset}`)
  } catch (error) {
    console.error(`${colors.red}Error creating logs directory: ${error.message}${colors.reset}`)
    process.exit(1)
  }
}

// Calculate cutoff date
const now = new Date()
const cutoffDate = new Date(now.getTime() - config.maxAgeDays * 24 * 60 * 60 * 1000)
console.log(`${colors.blue}Cleaning up log files older than: ${cutoffDate.toISOString()}${colors.reset}`)

// Clean up logs for each type
let totalRemoved = 0
let totalKept = 0

for (const logType of config.logTypes) {
  const typeDir = path.join(config.logsDir, logType)

  // Check if type directory exists
  if (!fs.existsSync(typeDir)) {
    console.log(`${colors.yellow}Log type directory not found: ${typeDir}${colors.reset}`)
    console.log(`${colors.yellow}Creating directory...${colors.reset}`)

    try {
      fs.mkdirSync(typeDir, { recursive: true })
      console.log(`${colors.green}Directory created successfully.${colors.reset}`)
    } catch (error) {
      console.error(`${colors.red}Error creating directory: ${error.message}${colors.reset}`)
      continue
    }
  }

  // Get all log files
  let files
  try {
    files = fs
      .readdirSync(typeDir)
      .filter((file) => file.endsWith(".log"))
      .map((file) => ({
        name: file,
        path: path.join(typeDir, file),
        stats: fs.statSync(path.join(typeDir, file)),
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime()) // Sort by modification time (newest first)
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${typeDir}: ${error.message}${colors.reset}`)
    continue
  }

  console.log(`${colors.blue}Processing ${logType} logs: ${files.length} files found${colors.reset}`)

  // Keep track of files to remove
  const filesToRemove = []

  // Check each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Check if file is older than cutoff date
    if (file.stats.mtime.getTime() < cutoffDate.getTime()) {
      filesToRemove.push(file)
    }

    // Check if we have too many files
    if (i >= config.maxFilesPerType) {
      filesToRemove.push(file)
    }
  }

  // Remove files
  for (const file of filesToRemove) {
    try {
      fs.unlinkSync(file.path)
      console.log(`${colors.yellow}Removed: ${file.name}${colors.reset}`)
      totalRemoved++
    } catch (error) {
      console.error(`${colors.red}Error removing file ${file.name}: ${error.message}${colors.reset}`)
    }
  }

  // Count kept files
  totalKept += files.length - filesToRemove.length
}

// Print summary
console.log(`${colors.cyan}
╔════════════════════════════════════════════════════╗
║                                                    ║
║                  Cleanup Summary                   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
${colors.reset}`)

console.log(`${colors.green}Total files kept: ${totalKept}${colors.reset}`)
console.log(`${colors.yellow}Total files removed: ${totalRemoved}${colors.reset}`)
console.log(`${colors.cyan}Cleanup completed successfully!${colors.reset}`)
