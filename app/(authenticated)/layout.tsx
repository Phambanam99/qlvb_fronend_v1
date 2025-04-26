"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import {Header} from "@/components/header"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import  {NotificationsProvider}  from "@/lib/notifications-context"
import { MainSidebar } from "@/components/main-sidebar"
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/dang-nhap")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <NotificationsProvider>
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
    </NotificationsProvider>

  )
}
