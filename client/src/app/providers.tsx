// client/src/app/providers.tsx
"use client";

import { ReactNode } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Providers({ children }: { children: ReactNode }) {
  // Clerk picks up NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / NEXT_PUBLIC_CLERK_FRONTEND_API automatically
  // If you want to pass publishableKey explicitly: publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  return (
    <ClerkProvider>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            gap: 12,
          }}
        >
          <div>
            <a
              href="/"
              style={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: 600,
              }}
            >
              Your App
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SignedOut>
              <SignInButton>
                <button style={{ padding: "8px 12px", borderRadius: 6 }}>
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton>
                <button style={{ padding: "8px 12px", borderRadius: 6 }}>
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>

        <main style={{ flex: 1, padding: 18 }}>{children}</main>

        <footer
          style={{
            padding: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <small>© {new Date().getFullYear()} Your App</small>
        </footer>
      </div>
    </ClerkProvider>
  );
}
