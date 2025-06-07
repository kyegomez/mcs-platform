import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MCS - Modern Care System",
  description: "Advanced healthcare platform with AI-powered medical agents",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen bg-black text-white flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto py-4 px-4 md:px-6">{children}</main>
            <footer className="py-4 border-t border-mcs-gray text-center text-sm text-mcs-gray-light">
              © {new Date().getFullYear()} MCS - Modern Care System. All rights reserved.
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
