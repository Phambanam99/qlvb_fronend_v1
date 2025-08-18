import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/use-toast"
import { AuthProvider } from "@/lib/auth-context"
import { Providers } from "./providers"
import { NotificationsProvider } from "@/lib/notifications-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hệ thống quản lý văn bản",
  description: "Hệ thống quản lý văn bản và điều hành",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            <ToastProvider>
              <AuthProvider>
                <NotificationsProvider>
                  {/* Decorative background */}
                  <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                  </div>

                  {/* Content container */}
                  <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    {children}
                  </main>
                  <Toaster />
                </NotificationsProvider>
              </AuthProvider>
            </ToastProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
