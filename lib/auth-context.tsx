"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "./api"
import Cookies from "js-cookie"

export type UserRole = "admin" | "manager" | "department_head" | "staff" | "clerk"

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: UserRole
  department: string
  position: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: string | null) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
}

// Define role permissions
const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "manage_users",
    "manage_settings",
    "view_all_documents",
    "manage_all_documents",
    "approve_documents",
    "assign_documents",
    "create_documents",
    "delete_documents",
    "view_reports",
    "manage_departments",
  ],
  manager: ["view_all_documents", "approve_documents", "view_reports", "assign_documents", "create_documents"],
  department_head: [
    "view_department_documents",
    "assign_department_documents",
    "review_department_documents",
    "create_documents",
    "view_department_reports",
  ],
  staff: ["view_assigned_documents", "process_assigned_documents", "create_documents"],
  clerk: ["register_documents", "view_all_documents", "archive_documents", "create_documents"],
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only run in browser environment
        if (typeof window === "undefined") {
          setLoading(false)
          return
        }

        const token = localStorage.getItem("token") || Cookies.get("auth-token")
        if (token) {
          try {
            const userData = await authAPI.getCurrentUser()
            setUser(userData.user)
          } catch (error) {
            console.error("Error fetching user data:", error)
            localStorage.removeItem("token")
            Cookies.remove("auth-token")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login(username, password)

      if (response.token && response.user) {
        localStorage.setItem("token", response.token)
        // Lưu token vào cookie để middleware có thể đọc
        Cookies.set("auth-token", response.token, { expires: 7 })
        setUser(response.user)
        router.push("/")
        return
      }

      throw new Error("Invalid login response")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    Cookies.remove("auth-token")
    setUser(null)
    router.push("/dang-nhap")
  }

  const hasPermission = (permission: string | null) => {
    if (!user || !permission) return false
    return rolePermissions[user.role as UserRole]?.includes(permission) || false
  }

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole)
    }
    return user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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
