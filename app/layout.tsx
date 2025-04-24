import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hệ thống quản lý văn bản",
  description: "Hệ thống quản lý văn bản và điều hành",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Kiểm tra xem đường dẫn hiện tại có phải là trang đăng nhập không
  const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/dang-nhap"

  // Nếu là trang đăng nhập, chỉ hiển thị nội dung trang đăng nhập
  if (isLoginPage) {
    return (
      <html lang="vi" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body className={inter.className}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    )
  }

  // Nếu không phải trang đăng nhập, hiển thị layout đầy đủ
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
