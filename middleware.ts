import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAdminSession } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Only protect cricket admin routes
  if (request.nextUrl.pathname.startsWith("/cricket")) {
    // Allow access to login page
    if (request.nextUrl.pathname === "/cricket/login") {
      return NextResponse.next()
    }

    const sessionToken = request.cookies.get("admin-session")?.value
    const isValidSession = await verifyAdminSession(sessionToken || null)

    if (!isValidSession) {
      return NextResponse.redirect(new URL("/cricket/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/cricket/:path*"],
}
