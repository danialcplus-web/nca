import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/proxy"

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Redirect to login if user is not authenticated and trying to access protected routes
  if (!user && (pathname.startsWith("/chat") || pathname.startsWith("/protected"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Redirect to chat if user is authenticated and trying to access auth pages
  if (user && (pathname.startsWith("/auth/") && !pathname.includes("sign-up-success"))) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
