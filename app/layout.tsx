import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "VISTA - Weterynaryjna Inteligencja",
  description:
    "VISTA - profesjonalny asystent weterynaryjny oparty na modelu sVETLIQ-11B-v3-evolutionary. Diagnostyka, leczenie, chirurgia i farmakologia weterynaryjna.",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EWnFDPqsI004QyxnLmhytEM6hIG1h7.png",
        width: 1200,
        height: 1200,
        alt: "VISTA - Veterinary AI Assistant",
      },
    ],
  },
    generator: 'sVETLIQ-11B-v3-evolutionary'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'