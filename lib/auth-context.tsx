"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "./api"
import Cookies from "js-cookie"

interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: string
  department: string
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const userData = await authAPI.getCurrentUser()
          setUser(userData.user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        // Xóa token nếu không hợp lệ
        localStorage.removeItem("token")
        Cookies.remove("auth-token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string, rememberMe = false) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(username, password)
      const { token, user } = response

      // Lưu token vào localStorage và cookie
      localStorage.setItem("token", token)

      // Đặt cookie với thời hạn phù hợp
      if (rememberMe) {
        // 30 ngày nếu "Ghi nhớ đăng nhập"
        Cookies.set("auth-token", token, { expires: 30, sameSite: "strict" })
      } else {
        // Session cookie nếu không "Ghi nhớ đăng nhập"
        Cookies.set("auth-token", token, { sameSite: "strict" })
      }

      setUser(user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    Cookies.remove("auth-token")
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = "/dang-nhap"
  }

  const hasPermission = (permission: string) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (role: string | string[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
