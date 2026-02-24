import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/global/header";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntentSwap",
  description: "Intent-based token swap platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={jetbrainsMono.variable} lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="relative grid h-svh grid-rows-[auto_1fr]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_circle_at_20%_-10%,theme(colors.violet.500/.18),transparent_60%)] dark:bg-[radial-gradient(800px_circle_at_20%_-10%,theme(colors.violet.500/.12),transparent_60%)]"
            />
            <Header />
            <main className="container mx-auto max-w-6xl p-4">{children}</main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
