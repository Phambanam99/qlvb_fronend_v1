"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const { toast } = useToast()

  // Tải thông tin đăng nhập đã lưu nếu có
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername")
    if (savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu")
      return
    }

    try {
      setLoading(true)
      setError(null)
      await login(username, password)

      // Lưu username nếu chọn "Ghi nhớ đăng nhập"
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username)
      } else {
        localStorage.removeItem("rememberedUsername")
      }

      // Đăng nhập thành công sẽ chuyển hướng trong hàm login
    } catch (error) {
      console.error("Login error:", error)
      setError("Tên đăng nhập hoặc mật khẩu không chính xác")
      toast({
        title: "Đăng nhập thất bại",
        description: "Tên đăng nhập hoặc mật khẩu không chính xác",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin đăng nhập để truy cập hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/quen-mat-khau" className="text-xs text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="mt-2 text-center text-sm text-muted-foreground">
            <p>Tài khoản mặc định:</p>
            <p className="mt-1">
              <strong>Admin:</strong> admin / admin123
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
