"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { Loader2, Save } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Thêm thông báo
    addNotification({
      title: "Hồ sơ đã được cập nhật",
      message: "Thông tin hồ sơ của bạn đã được cập nhật thành công.",
      type: "success",
    })

    setIsSubmitting(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Thêm thông báo
    addNotification({
      title: "Mật khẩu đã được thay đổi",
      message: "Mật khẩu của bạn đã được thay đổi thành công.",
      type: "success",
    })

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân và tài khoản của bạn</p>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Avatar" />
              <AvatarFallback className="text-4xl">{user?.avatar || "??"}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-medium">{user?.fullName || "Người dùng"}</h3>
              <p className="text-sm text-muted-foreground">{user?.position || "Chức vụ"}</p>
              <p className="text-sm text-muted-foreground">{user?.department || "Phòng ban"}</p>
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm">{user?.email || "email@example.com"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vai trò:</span>
                <span className="text-sm">{user?.role || "Người dùng"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tên đăng nhập:</span>
                <span className="text-sm">{user?.username || "username"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <form onSubmit={handleUpdateProfile}>
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input id="fullName" defaultValue={user?.fullName || ""} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" placeholder="Nhập số điện thoại" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Ảnh đại diện</Label>
                      <Input id="avatar" type="file" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Giới thiệu</Label>
                      <Input id="bio" placeholder="Nhập giới thiệu ngắn về bạn" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <form onSubmit={handleChangePassword}>
                  <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>Thay đổi mật khẩu đăng nhập của bạn</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                      <Input id="current-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Mật khẩu mới</Label>
                      <Input id="new-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Đổi mật khẩu
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt thông báo</CardTitle>
                  <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Thông báo hệ thống</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Thông báo văn bản đến</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo khi có văn bản đến mới</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-incoming" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Thông báo phê duyệt</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo khi văn bản cần phê duyệt</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-approval" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Thông báo lịch công tác</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo về lịch công tác</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-schedule" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Thông báo qua email</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Nhận thông báo qua email</Label>
                        <p className="text-sm text-muted-foreground">Gửi thông báo đến email của bạn</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-email" className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Lưu cài đặt</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
