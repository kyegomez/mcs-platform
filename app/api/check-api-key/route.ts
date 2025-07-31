import { NextResponse } from "next/server"

export async function GET() {
  // Check if the API key is configured
  const apiKey = process.env.SWARMS_API_KEY

  // Log the API key status (without revealing the key)


  return NextResponse.json({
    configured: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  })
}
