/**
 * Production Deployment Script
 *
 * This script prepares the application for production deployment
 * by running a series of checks and optimizations.
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

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

// Check for required environment variables
console.log(`${colors.blue}Checking for required environment variables...${colors.reset}`)

const requiredEnvVars = ["ANTHROPIC_API_KEY", "VERCEL"]
const missingEnvVars = []

requiredEnvVars.forEach((envVar) => {
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

// Run lint to check for errors
console.log(`\n${colors.blue}Running lint to check for errors...${colors.reset}`)

try {
  execSync("npm run lint", { stdio: "inherit" })
  console.log(`${colors.green}Lint completed successfully.${colors.reset}`)
} catch (error) {
  console.error(`${colors.red}Lint failed: ${error.message}${colors.reset}`)
  process.exit(1)
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

// Run cleanup logs script
console.log(`\n${colors.blue}Running log cleanup...${colors.reset}`)

try {
  execSync("npm run cleanup-logs", { stdio: "inherit" })
  console.log(`${colors.green}Log cleanup completed successfully.${colors.reset}`)
} catch (error) {
  console.error(`${colors.yellow}Log cleanup warning: ${error.message}${colors.reset}`)
  // Don't exit on log cleanup failure
}

// Final summary
console.log(`\n${colors.cyan}
╔════════════════════════════════════════════════════╗
║                                                    ║
║              Deployment Preparation                ║
║                                                    ║
╚════════════════════════════════════════════════════╝
${colors.reset}`)

if (missingEnvVars.length > 0) {
  console.log(`${colors.yellow}Warnings were found during preparation.${colors.reset}`)
  console.log(`${colors.yellow}Please address these issues before deploying to production.${colors.reset}`)
} else {
  console.log(`${colors.green}All checks passed! The application is ready for production deployment.${colors.reset}`)
  console.log(`${colors.green}You can now deploy to production with confidence.${colors.reset}`)
  console.log(`${colors.green}Run the following command to deploy:${colors.reset}`)
  console.log(`${colors.cyan}  npm run production${colors.reset}`)
}

console.log(`\n${colors.magenta}Thank you for using Libraverse!${colors.reset}`)
