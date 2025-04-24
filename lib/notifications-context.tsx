"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: Date
  read: boolean
  link?: string
  documentId?: number
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Tải thông báo từ localStorage khi khởi động
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications)
        // Chuyển đổi chuỗi ngày thành đối tượng Date
        const formattedNotifications = parsedNotifications.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt),
        }))
        setNotifications(formattedNotifications)
      } catch (error) {
        console.error("Failed to parse notifications from localStorage", error)
        localStorage.removeItem("notifications")
      }
    }
  }, [])

  // Lưu thông báo vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
