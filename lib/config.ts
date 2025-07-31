// API configuration
export const SWARMS_API_CONFIG = {
  BASE_URL: "https://swarms-api-285321057562.us-east1.run.app",
  API_KEY: process.env.SWARMS_API_KEY || "",
}

// Check if API key is available
export function isApiKeyConfigured(): boolean {
  const isConfigured = Boolean(process.env.SWARMS_API_KEY)

  return isConfigured
}

// Get API headers with authentication
export function getApiHeaders(): HeadersInit {
  const apiKey = process.env.SWARMS_API_KEY || ""
  if (!apiKey) {
    console.warn("Warning: SWARMS_API_KEY is not configured")
  }

  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  }
}
