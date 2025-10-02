import type React from "react"
import "../globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/use-toast"

const inter = Inter({ subsets: ["latin"] })

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ToastProvider>
            {/* Decorative background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            </div>

            {/* Content container */}
            <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 pt-4">
              {children}
            </main>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}