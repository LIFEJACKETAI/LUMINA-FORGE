import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as UiToaster } from "@/components/ui/toaster";
import { SmoothScrollProvider } from "@/components/lumina/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Space Grotesk — used for the bold display headings (the "Satoshi / Space Grotesk" vibe)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LuminaForge.ai — Describe the Vibe. We Forge the Reality.",
  description:
    "An agentic AI website generator powered by free open models via OpenRouter and Hugging Face. Describe a vibe, drop references, and watch a colony of AI agents forge a beautiful, high-performance site in seconds.",
  keywords: [
    "LuminaForge",
    "AI website generator",
    "OpenRouter",
    "Hugging Face",
    "Next.js",
    "Supabase",
    "free open models",
    "agentic AI",
  ],
  authors: [{ name: "LuminaForge" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "LuminaForge.ai — Describe the Vibe. We Forge the Reality.",
    description:
      "Agentic AI website builder powered by free open models. Forge beautiful sites with a colony of collaborative agents.",
    siteName: "LuminaForge.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuminaForge.ai",
    description: "Agentic AI website builder powered by free open models.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <UiToaster />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
