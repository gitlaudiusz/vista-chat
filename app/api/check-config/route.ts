import { NextResponse } from "next/server"

export async function GET() {
  // Check if the API key is present
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY

  // Get the first few characters of the API key (if it exists) for verification
  // This is safe to expose and helps confirm the key is loaded correctly
  const apiKeyPreview = process.env.ANTHROPIC_API_KEY
    ? `${process.env.ANTHROPIC_API_KEY.substring(0, 4)}...${process.env.ANTHROPIC_API_KEY.substring(process.env.ANTHROPIC_API_KEY.length - 4)}`
    : null

  // Get all environment variable names (not values) to help debug
  const envVarNames = Object.keys(process.env).filter(
    (key) =>
      // Filter out sensitive system variables
      !key.startsWith("npm_") && !key.startsWith("NODE_") && key !== "PATH",
  )

  console.log("API key check:", hasApiKey ? "API key is present" : "API key is missing")
  if (!hasApiKey) {
    console.log("Available environment variables:", envVarNames)
  }

  return NextResponse.json({
    hasApiKey,
    apiKeyPreview,
    envVarNames,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || "not set",
  })
}
