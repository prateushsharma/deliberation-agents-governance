import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "AI Governance Agents - Bitcoin L2 Community Funding",
  description:
    "The first autonomous governance system where AI agents stake real cBTC to make transparent community funding decisions on Bitcoin L2",
  keywords: ["AI", "governance", "blockchain", "citrea", "bitcoin", "agents", "consensus"],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="bg-slate-900 text-white">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
