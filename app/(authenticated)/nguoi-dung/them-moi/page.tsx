"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
// Cập nhật import để sử dụng API từ thư mục lib/api
import { usersAPI } from "@/lib/api"

export default function AddUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { hasPermission } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()

  // Cập nhật hàm handleSubmit để sử dụng API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Tạo đối tượng dữ liệu người dùng từ form
      const userData = {
        fullName: (document.getElementById("fullName") as HTMLInputElement).value,
        email: (document.getElementById("email") as HTMLInputElement).value,
        phone: (document.getElementById("phone") as HTMLInputElement).value,
        department: (document.getElementById("department") as HTMLSelectElement).value,
        position: (document.getElementById("position") as HTMLInputElement).value,
        username: (document.getElementById("username") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value,
        role: (document.getElementById("role") as HTMLSelectElement).value,
        active: (document.getElementById("active") as HTMLInputElement).checked,
      }

      // Gọi API để tạo người dùng mới
      await usersAPI.createUser(userData)

      // Thêm thông báo
      addNotification({
        title: "Thêm người dùng thành công",
        message: "Người dùng mới đã được thêm vào hệ thống.",
        type: "success",
      })

      // Reset form và chuyển hướng
      setIsSubmitting(false)
      router.push("/nguoi-dung")
    } catch (error) {
      console.error("Error creating user:", error)
      addNotification({
        title: "Lỗi",
        message: "Không thể thêm người dùng. Vui lòng thử lại sau.",
        type: "error",
      })
      setIsSubmitting(false)
    }
  }

  // Kiểm tra quyền hạn
  if (!hasPermission("manage_users")) {
    router.push("/khong-co-quyen")
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/nguoi-dung">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Thêm người dùng mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Nhập thông tin cá nhân của người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" placeholder="Nhập họ và tên" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" placeholder="Nhập số điện thoại" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Select required>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ban_giam_doc">Ban Giám đốc</SelectItem>
                      <SelectItem value="khtc">Phòng Kế hoạch - Tài chính</SelectItem>
                      <SelectItem value="tchc">Phòng Tổ chức - Hành chính</SelectItem>
                      <SelectItem value="cntt">Phòng Công nghệ thông tin</SelectItem>
                      <SelectItem value="van_thu">Văn thư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Chức vụ</Label>
                  <Input id="position" placeholder="Nhập chức vụ" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>Thiết lập thông tin đăng nhập và quyền hạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input id="username" placeholder="Nhập tên đăng nhập" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" placeholder="Nhập mật khẩu" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="manager">Thủ trưởng</SelectItem>
                    <SelectItem value="department_head">Trưởng phòng</SelectItem>
                    <SelectItem value="staff">Chuyên viên</SelectItem>
                    <SelectItem value="clerk">Văn thư</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="active" defaultChecked />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Kích hoạt tài khoản
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-accent/30 p-6">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/nguoi-dung">Hủy</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Lưu người dùng
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
