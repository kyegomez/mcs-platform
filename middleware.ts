import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the request is for our API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Clone the request headers
    const requestHeaders = new Headers(request.headers)

    // Add the SWARMS_API_KEY from environment variables if it's not already set
    if (!requestHeaders.has("x-api-key") && process.env.SWARMS_API_KEY) {
      requestHeaders.set("x-api-key", process.env.SWARMS_API_KEY)
    }

    // Return the response with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
