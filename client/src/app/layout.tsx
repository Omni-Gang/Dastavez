import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dastavez",
  description: "Your document management solution",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            {/* Top Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-black text-white">
              <h1 className="text-3xl font-bold">Dastavez</h1> {/* Increased title size */}

              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
                    Start Free
                  </button>
                </SignUpButton>

                <ThemeToggleButton />
              </div>
            </header>

            {/* Main Page Content */}
            <main className="mt-0">{children}</main> {/* Remove extra top margin */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
