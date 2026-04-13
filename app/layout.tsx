import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const description =
  "Rigpaz is an AI-powered code editor — write, run, and preview code right in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rigpaz | AI-powered Code Editor",
  description,
  keywords: [
    "online code editor",
    "AI code editor",
    "browser IDE",
    "WebContainer",
    "Monaco editor",
    "Rigpaz",
  ],
  authors: [{ name: "otzr.labs" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Rigpaz",
    title: "Rigpaz | AI-powered Code Editor",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Rigpaz | AI-powered Code Editor",
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
        
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
            <div className="flex flex-col min-h-screen">
              <Toaster />
              <CommandPalette />
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
        
        </body>
      </html>
    </SessionProvider>
  );
}