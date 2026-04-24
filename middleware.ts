import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that don't require auth
const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

// Prefixes that are always public
const PUBLIC_PREFIXES = [
  "/api/auth",    // better-auth handlers
  "/api/quizzes", // public explore listing
  "/api/quiz/share", // public quiz access by shareId
  "/api/attempt", // guest attempt start/submit/get flow
  "/quiz/",       // public quiz player page
  "/_next",
  "/favicon",
  "/public",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets & public prefixes — skip
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session cookie (lightweight — no DB call)
  const session = getSessionCookie(request);

  // Logged-in users should not land on auth pages
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Exact public paths — skip
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - .png / .svg / .jpg etc.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
