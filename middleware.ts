import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Configure protected routes
export default withAuth(
  function middleware(req: NextRequest) {
    // Optional: Add custom logic here
    // Example: Log path access
    console.log("Accessing protected route:", req.nextUrl.pathname);

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow access if the user is authenticated
        return !!token;
      },
    },
  }
);

// Define matcher for routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",      // protect all dashboard routes
    "/profile",               // single protected page
    "/api/protected/:path*",  // protect certain API routes
  ],
};
