import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Configure protected routes
export default withAuth(
  async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    
    // Initialize Supabase middleware client
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session if expired
    await supabase.auth.getSession();

    // Optional: Add custom logic here
    console.log("Accessing protected route:", req.nextUrl.pathname);

    if (req.nextUrl.pathname.startsWith("/api/notifications")) {
      // Set cache control headers for notifications API
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
    }

    return res;
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
    "/admin/:path*",          // protect admin routes
    "/product-hunt/submit",   // protect product submission
    '/api/notifications/:path*', // protect notifications API
  ],
};