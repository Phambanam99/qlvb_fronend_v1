import type React from "react"
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('/anhnen.png')] bg-cover bg-center">
      <div className="max-w-md w-full space-y-8">{children}</div>
    </div>
  )
}
