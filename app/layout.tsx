import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { runValidation } from "@/lib/supabase-validator"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Jewelry Manufacturing ERP",
  description: "ERP system for jewelry manufacturing factory",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will run the validation when the app starts in development mode
  if (process.env.NODE_ENV === "development") {
    // Run validation but don't block rendering
    runValidation().catch((err) => {
      console.error("Validation error:", err)
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
