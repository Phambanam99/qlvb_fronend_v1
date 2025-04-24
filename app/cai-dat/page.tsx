"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { Loader2, Save } from "lucide-react"

export default function SettingsPage() {
  const { hasPermission } = useAuth()
  const { addNotification } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Thêm thông báo
    addNotification({
      title: "Cài đặt đã được lưu",
      message: "Các cài đặt chung đã được cập nhật thành công.",
      type: "success",
    })

    setIsSubmitting(false)
  }

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Thêm thông báo
    addNotification({
      title: "Cài đặt thông báo đã được lưu",
      message: "Các cài đặt thông báo đã được cập nhật thành công.",
      type: "success",
    })

    setIsSubmitting(false)
  }

  const handleSaveSecuritySettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Thêm thông báo
    addNotification({
      title: "Cài đặt bảo mật đã được lưu",
      message: "Các cài đặt bảo mật đã được cập nhật thành công.",
      type: "success",
    })

    setIsSubmitting(false)
  }

  // Kiểm tra quyền hạn
  const canManageSettings = hasPermission("manage_settings")

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">Quản lý các cài đặt của hệ thống</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <form onSubmit={handleSaveGeneralSettings}>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Quản lý các cài đặt chung của hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="system-name">Tên hệ thống</Label>
                  <Input
                    id="system-name"
                    defaultValue="Hệ thống Quản lý Văn bản và Công tác"
                    disabled={!canManageSettings}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization-name">Tên đơn vị</Label>
                  <Input id="organization-name" defaultValue="Sở Kế hoạch và Đầu tư" disabled={!canManageSettings} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email quản trị</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@example.com" disabled={!canManageSettings} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system-description">Mô tả hệ thống</Label>
                  <Textarea
                    id="system-description"
                    defaultValue="Hệ thống quản lý văn bản đến, văn bản đi, kế hoạch và lịch công tác"
                    disabled={!canManageSettings}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="document-prefix">Tiền tố số văn bản đi</Label>
                  <Input id="document-prefix" defaultValue="CV-SKHDT" disabled={!canManageSettings} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-counter">Bộ đếm văn bản đi</Label>
                  <Input id="document-counter" type="number" defaultValue="1" disabled={!canManageSettings} />
                </div>
              </CardContent>
              {canManageSettings && (
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Lưu cài đặt
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <form onSubmit={handleSaveNotificationSettings}>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>Quản lý cách thức gửi và nhận thông báo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Thông báo hệ thống</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo văn bản đến</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo khi có văn bản đến mới</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo phê duyệt</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo khi văn bản cần phê duyệt</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo lịch công tác</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo về lịch công tác</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Thông báo qua email</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Gửi thông báo qua email</Label>
                      <p className="text-sm text-muted-foreground">Gửi thông báo đến email của người dùng</p>
                    </div>
                    <Switch defaultChecked={false} disabled={!canManageSettings} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-server">Máy chủ SMTP</Label>
                    <Input id="email-server" defaultValue="smtp.example.com" disabled={!canManageSettings} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-port">Cổng SMTP</Label>
                      <Input id="email-port" defaultValue="587" disabled={!canManageSettings} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-security">Bảo mật</Label>
                      <Select disabled={!canManageSettings}>
                        <SelectTrigger id="email-security">
                          <SelectValue placeholder="Chọn loại bảo mật" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">Không</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-username">Tên đăng nhập</Label>
                    <Input id="email-username" defaultValue="notifications@example.com" disabled={!canManageSettings} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-password">Mật khẩu</Label>
                    <Input id="email-password" type="password" defaultValue="********" disabled={!canManageSettings} />
                  </div>
                </div>
              </CardContent>
              {canManageSettings && (
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Lưu cài đặt
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <form onSubmit={handleSaveSecuritySettings}>
              <CardHeader>
                <CardTitle>Cài đặt bảo mật</CardTitle>
                <CardDescription>Quản lý các cài đặt bảo mật của hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Chính sách mật khẩu</h3>
                  <div className="space-y-2">
                    <Label htmlFor="password-min-length">Độ dài tối thiểu</Label>
                    <Input id="password-min-length" type="number" defaultValue="8" disabled={!canManageSettings} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yêu cầu chữ hoa</Label>
                      <p className="text-sm text-muted-foreground">Mật khẩu phải có ít nhất một chữ hoa</p>
                    </div>
                    <Switch defaultChecked disabled={!canManageSettings} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yêu cầu chữ số</Label>
                      <p className="text-sm text-muted-foreground">Mật khẩu phải có ít nhất một chữ số</p>
                    </div>
                    <Switch defaultChecked disabled={!canManageSettings} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yêu cầu ký tự đặc biệt</Label>
                      <p className="text-sm text-muted-foreground">Mật khẩu phải có ít nhất một ký tự đặc biệt</p>
                    </div>
                    <Switch defaultChecked={false} disabled={!canManageSettings} />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Đăng nhập</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Khóa tài khoản sau nhiều lần đăng nhập thất bại</Label>
                      <p className="text-sm text-muted-foreground">Khóa tài khoản sau 5 lần đăng nhập thất bại</p>
                    </div>
                    <Switch defaultChecked disabled={!canManageSettings} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Xác thực hai yếu tố</Label>
                      <p className="text-sm text-muted-foreground">Yêu cầu xác thực hai yếu tố khi đăng nhập</p>
                    </div>
                    <Switch defaultChecked={false} disabled={!canManageSettings} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Thời gian hết phiên (phút)</Label>
                    <Input id="session-timeout" type="number" defaultValue="30" disabled={!canManageSettings} />
                  </div>
                </div>
              </CardContent>
              {canManageSettings && (
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Lưu cài đặt
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt giao diện</CardTitle>
              <CardDescription>Tùy chỉnh giao diện người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Chế độ màu</h3>
                <div className="flex items-center gap-4">
                  <Label>Chế độ hiển thị</Label>
                  <ThemeToggle />
                </div>
                <p className="text-sm text-muted-foreground">
                  Chọn chế độ sáng, tối hoặc theo hệ thống cho giao diện người dùng.
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tùy chỉnh khác</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị thông báo</Label>
                    <p className="text-sm text-muted-foreground">Hiển thị thông báo trên màn hình</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiệu ứng chuyển động</Label>
                    <p className="text-sm text-muted-foreground">Bật hiệu ứng chuyển động trong giao diện</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chế độ tiết kiệm dữ liệu</Label>
                    <p className="text-sm text-muted-foreground">Giảm tải dữ liệu và hiệu ứng</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
