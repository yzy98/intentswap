import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/global/header";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-alt",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syneDisplay = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
    <html
      className={`${jetbrainsMono.variable} ${syneDisplay.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh antialiased`}
      >
        <Providers>
          <div className="relative grid min-h-svh grid-rows-[auto_1fr] overflow-x-clip">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(720px_circle_at_0%_-10%,oklch(0.73_0.16_53/.24),transparent_60%),radial-gradient(980px_circle_at_100%_110%,oklch(0.56_0.14_233/.22),transparent_62%),linear-gradient(180deg,oklch(0.995_0.004_90),oklch(0.977_0.01_88))] dark:bg-[radial-gradient(740px_circle_at_0%_-10%,oklch(0.58_0.15_48/.23),transparent_58%),radial-gradient(980px_circle_at_100%_110%,oklch(0.51_0.14_236/.22),transparent_60%),linear-gradient(180deg,oklch(0.205_0.012_250),oklch(0.16_0.01_250))]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(transparent_95%,currentColor_96%),linear-gradient(90deg,transparent_95%,currentColor_96%)] [background-size:24px_24px]"
            />
            <Header />
            <main className="container mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
              {children}
            </main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
