import type React from "react"
import type { Metadata } from "next/metadata"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"
import { CommandPaletteProvider } from "@/components/command-palette-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://mcs-health.vercel.app"),
  title: {
    default: "MCS - Modern Care System | AI-Powered Healthcare Assistant",
    template: "%s | MCS - Modern Care System",
  },
  description:
    "Get instant medical advice from AI specialists. Track your health journey with smart notes, reminders, and personalized care. The future of healthcare is here.",
  keywords: [
    "AI healthcare",
    "medical assistant",
    "health tracking",
    "AI doctor",
    "telemedicine",
    "health notes",
    "medical advice",
    "healthcare app",
    "AI specialist",
    "digital health",
    "virtual doctor",
    "health monitoring",
    "medical consultation",
    "healthcare technology",
    "smart health",
  ],
  authors: [{ name: "MCS Team" }],
  creator: "MCS - Modern Care System",
  publisher: "MCS - Modern Care System",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mcs-health.vercel.app",
    siteName: "MCS - Modern Care System",
    title: "MCS - Modern Care System | AI-Powered Healthcare Assistant",
    description:
      "Get instant medical advice from AI specialists. Track your health journey with smart notes, reminders, and personalized care.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MCS - Modern Care System Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCS - Modern Care System | AI-Powered Healthcare Assistant",
    description:
      "Get instant medical advice from AI specialists. Track your health journey with smart notes, reminders, and personalized care.",
    images: ["/og-image.png"],
    creator: "@MCSHealth",
    site: "@MCSHealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  category: "healthcare",
  classification: "Health & Medical",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#0070f3",
    "msapplication-TileColor": "#0070f3",
  },
    generator: 'v0.dev'
}

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "MCS - Modern Care System",
  description: "AI-powered healthcare assistant providing instant medical advice from specialists",
  url: "https://mcs-health.vercel.app",
  image: "https://mcs-health.vercel.app/og-image.png",
  publisher: {
    "@type": "Organization",
    name: "MCS - Modern Care System",
    logo: {
      "@type": "ImageObject",
      url: "https://mcs-health.vercel.app/icon-512.png",
    },
  },
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "MCS - Modern Care System",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web Browser",
    description: "AI-powered healthcare assistant for personalized medical advice and health tracking",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    featureList: [
      "AI Medical Specialists",
      "Health Note Tracking",
      "Smart Reminders",
      "Personalized Care",
      "Instant Consultations",
    ],
  },
  potentialAction: {
    "@type": "UseAction",
    target: "https://mcs-health.vercel.app/chat",
    name: "Start Medical Consultation",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <CommandPaletteProvider>
            <div className="min-h-screen bg-black text-white flex flex-col">
              <Navigation />
              <main className="flex-1 container mx-auto py-4 px-4 md:px-6">{children}</main>
              <footer className="py-4 border-t border-mcs-gray text-center text-sm text-mcs-gray-light">
                © {new Date().getFullYear()} MCS - Modern Care System. All rights reserved.
              </footer>
            </div>
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
