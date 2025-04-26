"use client"
const inter = Inter({ subsets: ["latin"] })
import Header from "@/components/header"
import Sidebar from "@/components/sidebar" 
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"

import { NotificationsProvider } from "@/lib/notifications-context"
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (  !user) {
      router.push("/dang-nhap")
    }
  }, [user, router])

 

  if (!user) {
    return null // Không hiển thị gì cả trong khi chuyển hướng
  }

  return (
    
          
              <NotificationsProvider>
              
                        <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                    {children}
                    </main>
                </div>
                </div>
                  <Toaster />
               
              </NotificationsProvider>
          
          
    
  )
}