// client/src/app/providers.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import Link from "next/link";

function Header() {
  const { data: session, status } = useSession();

  return (
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
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 600,
          }}
        >
          Collaborative Editor
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {status === "loading" ? (
          <div>Loading...</div>
        ) : session ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>Hi, {session.user?.name || session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "white",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/landing"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "white",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Header />
        <main style={{ flex: 1, padding: 18 }}>{children}</main>
        <footer
          style={{
            padding: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <small>© {new Date().getFullYear()} Collaborative Editor</small>
        </footer>
      </div>
    </SessionProvider>
  );
}
