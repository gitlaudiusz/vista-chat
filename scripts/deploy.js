/**
 * Production Deployment Script
 *
 * This script prepares the application for production deployment
 * by running a series of checks and optimizations.
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Configuration
const config = {
  // Directories to check for console.log statements
  checkDirs: ["app", "components", "lib"],
  // Files to exclude from checks
  excludeFiles: [
    "env-config.ts",
    "test-utils.ts",
    "api-debug.tsx",
    "system-prompt-tester.tsx",
    "pre-production-tester.tsx",
  ],
  // Environment variables that must be set
  requiredEnvVars: ["ANTHROPIC_API_KEY"],
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
║    Libraverse Production Deployment Preparation    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
${colors.reset}`)

// Check for console.log statements
console.log(`${colors.blue}Checking for console.log statements...${colors.reset}`)

let consoleLogCount = 0
const checkForConsoleLogs = (dir) => {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      checkForConsoleLogs(filePath)
    } else if (
      stats.isFile() &&
      (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".js")) &&
      !config.excludeFiles.some((excludeFile) => filePath.includes(excludeFile))
    ) {
      const content = fs.readFileSync(filePath, "utf8")
      const matches = content.match(/console\.log\(/g)

      if (matches) {
        console.log(`${colors.yellow}Found ${matches.length} console.log statements in ${filePath}${colors.reset}`)
        consoleLogCount += matches.length
      }
    }
  }
}

try {
  config.checkDirs.forEach((dir) => {
    checkForConsoleLogs(dir)
  })

  if (consoleLogCount > 0) {
    console.log(`${colors.yellow}Warning: Found ${consoleLogCount} console.log statements in total.${colors.reset}`)
    console.log(`${colors.yellow}Consider removing them or replacing with safeLog() for production.${colors.reset}`)
  } else {
    console.log(`${colors.green}No unexpected console.log statements found.${colors.reset}`)
  }
} catch (error) {
  console.error(`${colors.red}Error checking for console.log statements: ${error.message}${colors.reset}`)
}

// Check for required environment variables
console.log(`\n${colors.blue}Checking for required environment variables...${colors.reset}`)

const missingEnvVars = []
config.requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar)
  }
})

if (missingEnvVars.length > 0) {
  console.log(`${colors.red}Missing required environment variables: ${missingEnvVars.join(", ")}${colors.reset}`)
  console.log(`${colors.red}Please set these environment variables before deploying.${colors.reset}`)
} else {
  console.log(`${colors.green}All required environment variables are set.${colors.reset}`)
}

// Run build to check for errors
console.log(`\n${colors.blue}Running build to check for errors...${colors.reset}`)

try {
  execSync("npm run build", { stdio: "inherit" })
  console.log(`${colors.green}Build completed successfully.${colors.reset}`)
} catch (error) {
  console.error(`${colors.red}Build failed: ${error.message}${colors.reset}`)
  process.exit(1)
}

// Final summary
console.log(`\n${colors.cyan}
╔════════════════════════════════════════════════════╗
║                                                    ║
║              Deployment Preparation                ║
║                                                    ║
╚════════════════════════════════════════════════════╝
${colors.reset}`)

if (consoleLogCount > 0 || missingEnvVars.length > 0) {
  console.log(`${colors.yellow}Warnings were found during preparation.${colors.reset}`)
  console.log(`${colors.yellow}Please address these issues before deploying to production.${colors.reset}`)
} else {
  console.log(`${colors.green}All checks passed! The application is ready for production deployment.${colors.reset}`)
  console.log(`${colors.green}You can now deploy to production with confidence.${colors.reset}`)
}

console.log(`\n${colors.magenta}Thank you for using Libraverse!${colors.reset}`)
