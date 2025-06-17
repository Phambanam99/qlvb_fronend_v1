"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/lib/notifications-context"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Check, FileText, Info, AlertTriangle, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications()

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Thông báo</h1>
        <p className="text-muted-foreground">Quản lý các thông báo của bạn</p>
      </div>

      <Tabs defaultValue="unread">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="unread">
              Chưa đọc <span className="ml-1 text-xs">({unreadNotifications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            {unreadNotifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" className="text-red-500" onClick={clearNotifications}>
                <Trash2 className="mr-2 h-4 w-4" /> Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo chưa đọc</CardTitle>
              <CardDescription>Danh sách các thông báo bạn chưa đọc</CardDescription>
            </CardHeader>
            <CardContent>
              {unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Check className="mb-2 h-12 w-12 text-green-500/50" />
                  <p className="text-muted-foreground">Bạn đã đọc tất cả thông báo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex cursor-pointer items-start rounded-lg border p-4 transition-colors hover:bg-accent/50",
                        !notification.read && "bg-primary/5",
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="mr-4 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {format(notification.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        {notification.link && (
                          <div className="mt-2">
                            <Link
                              href={notification.link}
                              className="text-sm font-medium text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả thông báo</CardTitle>
              <CardDescription>Danh sách tất cả các thông báo của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Info className="mb-2 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex cursor-pointer items-start rounded-lg border p-4 transition-colors hover:bg-accent/50",
                        !notification.read && "bg-primary/5",
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="mr-4 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {format(notification.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        {notification.link && (
                          <div className="mt-2">
                            <Link
                              href={notification.link}
                              className="text-sm font-medium text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        )}
                      </div>
                      {!notification.read && <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
