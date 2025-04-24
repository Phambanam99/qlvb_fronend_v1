"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Paperclip, Save, X } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { addNotification } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function AddIncomingDocumentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const router = useRouter()

  // Dữ liệu mẫu cho danh sách cán bộ
  const users = [
    { id: "user1", name: "Nguyễn Văn A", department: "Phòng Kế hoạch", position: "Trưởng phòng" },
    { id: "user2", name: "Trần Thị B", department: "Phòng Tài chính", position: "Trưởng phòng" },
    { id: "user3", name: "Lê Văn C", department: "Phòng Hành chính", position: "Chuyên viên" },
    { id: "user4", name: "Phạm Thị D", department: "Phòng Kế hoạch", position: "Phó phòng" },
    { id: "user5", name: "Hoàng Văn E", department: "Phòng Tài chính", position: "Chuyên viên" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId))
  }

  // Cập nhật hàm handleSubmit để chuyển hướng sau khi thêm văn bản
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Thêm thông báo
    addNotification({
      title: "Thêm văn bản đến thành công",
      message: "Văn bản đến đã được thêm vào hệ thống.",
      type: "success",
    })

    // Reset form và chuyển hướng (trong thực tế)
    setIsSubmitting(false)
    router.push("/van-ban-den")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-den">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm văn bản đến</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>Nhập thông tin chi tiết của văn bản đến</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Số văn bản</Label>
                  <Input id="documentNumber" placeholder="Nhập số văn bản" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedDate">Ngày nhận</Label>
                  <Input id="receivedDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender">Đơn vị gửi</Label>
                  <Input id="sender" placeholder="Nhập tên đơn vị gửi" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <Select>
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Chọn loại văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Công văn</SelectItem>
                      <SelectItem value="decision">Quyết định</SelectItem>
                      <SelectItem value="directive">Chỉ thị</SelectItem>
                      <SelectItem value="report">Báo cáo</SelectItem>
                      <SelectItem value="plan">Kế hoạch</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Trích yếu</Label>
                <Input id="title" placeholder="Nhập trích yếu văn bản" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea id="content" placeholder="Nhập nội dung văn bản" rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachments">Tệp đính kèm</Label>
                <div className="flex items-center gap-2">
                  <Input id="attachments" type="file" multiple onChange={handleFileChange} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("attachments")?.click()}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Chọn tệp
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {files.length > 0 ? `Đã chọn ${files.length} tệp` : "Chưa có tệp nào được chọn"}
                  </span>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {files.map((file, index) => (
                      <div key={index} className="text-sm">
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Chuyển xử lý</CardTitle>
              <CardDescription>Chọn cán bộ nhận văn bản từ văn thư</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Cán bộ được chọn ({selectedUsers.length})</Label>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setSelectedUsers([])}>
                    Bỏ chọn tất cả
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border rounded-md bg-accent/50">
                  {selectedUsers.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                      Chưa có cán bộ nào được chọn
                    </div>
                  )}

                  {selectedUsers.map((userId) => {
                    const user = users.find((u) => u.id === userId)
                    if (!user) return null

                    return (
                      <Badge
                        key={userId}
                        variant="secondary"
                        className="pl-2 pr-1 py-1.5 flex items-center gap-1 bg-primary/10"
                      >
                        <span>{user.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => handleRemoveUser(userId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <Label>Danh sách cán bộ</Label>
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">Chọn cán bộ nhận văn bản</span>
                      <Select>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue placeholder="Lọc theo phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả phòng ban</SelectItem>
                          <SelectItem value="planning">Phòng Kế hoạch</SelectItem>
                          <SelectItem value="finance">Phòng Tài chính</SelectItem>
                          <SelectItem value="admin">Phòng Hành chính</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleUserSelect(user.id)}
                            />
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 bg-primary/10">
                                <AvatarFallback className="text-xs text-primary">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.position}</p>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs bg-accent">
                            {user.department}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea id="note" placeholder="Nhập ghi chú cho người nhận (nếu có)" rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/van-ban-den">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Lưu văn bản
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
