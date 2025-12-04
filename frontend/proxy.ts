import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get both tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value; // <-- Get the refresh token

  // --- Logic for Protected Routes ---
  if (!isPublicRoute) {
    // Case 1: Access Token is present. All good.
    if (accessToken) {
      return NextResponse.next();
    }

    // Case 2: Access Token is MISSING, but Refresh Token is present.
    // Allow the request to proceed. The API client will catch the 401
    // on the first data fetch and automatically refresh the token.
    if (!accessToken && refreshToken) {
      // The browser will load the page, and the API client will handle the refresh.
      return NextResponse.next();
    }

    // Case 3: NO tokens at all. Must sign in.
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL("/signin", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Logic for Public Routes (already authenticated) ---
  // If trying to access login/register while already authenticated
  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Default: proceed
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
