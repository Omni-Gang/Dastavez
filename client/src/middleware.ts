// client/src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // optional config here
});

// Default matcher from Clerk quickstart — runs middleware for app routes & API
export const config = {
  matcher: [
    // run on everything except _next static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // always run for api routes
    "/(api|trpc)(.*)",
  ],
};
