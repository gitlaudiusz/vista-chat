import { NextResponse } from "next/server"
import { runTestSuite } from "@/lib/test-utils"
import { DEBUG_MODE, isProduction } from "@/lib/env-config"

export async function GET() {
  // Only allow in non-production or when debug is explicitly enabled
  if (isProduction && !DEBUG_MODE.enabled) {
    return NextResponse.json(
      {
        message: "Pre-production tests are not available in production mode",
        environment: process.env.NODE_ENV,
      },
      { status: 403 },
    )
  }

  try {
    // Run the test suite
    const testResults = await runTestSuite()

    return NextResponse.json({
      success: testResults.success,
      name: testResults.name,
      duration: testResults.duration,
      tests: testResults.tests,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to run pre-production tests: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
