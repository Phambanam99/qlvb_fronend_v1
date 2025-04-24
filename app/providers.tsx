"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationsProvider } from "@/lib/notifications-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
