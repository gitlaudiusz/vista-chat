import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint is for debugging environment variables
  // It should only be accessible in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        message: "This endpoint is not available in production mode",
        environment: process.env.NODE_ENV,
      },
      { status: 403 },
    )
  }

  // Get all environment variable names (not values) to help debug
  const envVarNames = Object.keys(process.env).filter(
    (key) =>
      // Filter out sensitive system variables
      !key.startsWith("npm_") && !key.startsWith("NODE_") && key !== "PATH",
  )

  // Check for specific environment variables
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY

  // Create a safe preview of the API key if it exists
  const apiKeyPreview = process.env.ANTHROPIC_API_KEY
    ? `${process.env.ANTHROPIC_API_KEY.substring(0, 4)}...${process.env.ANTHROPIC_API_KEY.substring(process.env.ANTHROPIC_API_KEY.length - 4)}`
    : null

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vercelEnvironment: process.env.VERCEL_ENV || "not set",
    hasAnthropicKey,
    apiKeyPreview,
    envVarNames,
    timestamp: new Date().toISOString(),
  })
}
