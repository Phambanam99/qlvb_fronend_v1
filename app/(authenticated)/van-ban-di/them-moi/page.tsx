"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Paperclip, Save, Send } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { useRouter } from "next/navigation"
import { outgoingDocumentsAPI } from "@/lib/api"

export default function AddOutgoingDocumentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  // Cập nhật hàm handleSubmit để sử dụng API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Tạo đối tượng dữ liệu văn bản từ form
      const documentData = {
        documentNumber: (document.getElementById("documentNumber") as HTMLInputElement).value,
        sentDate: (document.getElementById("sentDate") as HTMLInputElement).value,
        recipient: (document.getElementById("recipient") as HTMLInputElement).value,
        documentType: (document.getElementById("documentType") as HTMLSelectElement).value,
        title: (document.getElementById("title") as HTMLInputElement).value,
        content: (document.getElementById("content") as HTMLTextAreaElement).value,
        approver: (document.getElementById("approver") as HTMLSelectElement).value,
        priority: (document.getElementById("priority") as HTMLSelectElement).value,
        note: (document.getElementById("note") as HTMLTextAreaElement).value,
        files: files,
        status: "pending_approval",
      }

      // Gọi API để tạo văn bản đi mới
      await outgoingDocumentsAPI.createOutgoingDocument(documentData)

      // Thêm thông báo
      addNotification({
        title: "Văn bản đi đã được tạo",
        message: "Văn bản đã được lưu và chờ phê duyệt.",
        type: "success",
        link: "/van-ban-di",
      })

      // Reset form và chuyển hướng
      setIsSubmitting(false)
      router.push("/van-ban-di")
    } catch (error) {
      console.error("Error creating document:", error)
      addNotification({
        title: "Lỗi",
        message: "Không thể tạo văn bản đi. Vui lòng thử lại sau.",
        type: "error",
      })
      setIsSubmitting(false)
    }
  }

  // Cập nhật hàm handleSaveDraft để sử dụng API
  const handleSaveDraft = async () => {
    setIsSubmitting(true)

    try {
      // Tạo đối tượng dữ liệu văn bản từ form
      const documentData = {
        documentNumber: (document.getElementById("documentNumber") as HTMLInputElement).value,
        sentDate: (document.getElementById("sentDate") as HTMLInputElement).value,
        recipient: (document.getElementById("recipient") as HTMLInputElement).value,
        documentType: (document.getElementById("documentType") as HTMLSelectElement).value,
        title: (document.getElementById("title") as HTMLInputElement).value,
        content: (document.getElementById("content") as HTMLTextAreaElement).value,
        approver: (document.getElementById("approver") as HTMLSelectElement).value,
        priority: (document.getElementById("priority") as HTMLSelectElement).value,
        note: (document.getElementById("note") as HTMLTextAreaElement).value,
        files: files,
        status: "draft",
      }

      // Gọi API để lưu bản nháp
      await outgoingDocumentsAPI.saveDraft(documentData)

      // Thêm thông báo
      addNotification({
        title: "Bản nháp đã được lưu",
        message: "Văn bản đã được lưu dưới dạng bản nháp.",
        type: "info",
        link: "/van-ban-di",
      })

      // Reset form và chuyển hướng
      setIsSubmitting(false)
      router.push("/van-ban-di")
    } catch (error) {
      console.error("Error saving draft:", error)
      addNotification({
        title: "Lỗi",
        message: "Không thể lưu bản nháp. Vui lòng thử lại sau.",
        type: "error",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-di">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Tạo văn bản đi</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>Nhập thông tin chi tiết của văn bản đi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Số văn bản</Label>
                  <Input id="documentNumber" placeholder="Nhập số văn bản" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentDate">Ngày ban hành</Label>
                  <Input id="sentDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Nơi nhận</Label>
                  <Input id="recipient" placeholder="Nhập tên đơn vị nhận" required />
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
                <Textarea id="content" placeholder="Nhập nội dung văn bản" rows={10} />
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
              <CardTitle>Thông tin phê duyệt</CardTitle>
              <CardDescription>Thông tin về người soạn thảo và phê duyệt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Người soạn thảo</Label>
                <div className="rounded-md border p-3 bg-accent/30">
                  <p className="font-medium">{user?.fullName || "Người dùng hiện tại"}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.position || "Chức vụ"} - {user?.department || "Phòng ban"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approver">Người phê duyệt</Label>
                <Select>
                  <SelectTrigger id="approver">
                    <SelectValue placeholder="Chọn người phê duyệt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager1">Trần Văn E - Thủ trưởng</SelectItem>
                    <SelectItem value="manager2">Nguyễn Thị G - Phó Thủ trưởng</SelectItem>
                    <SelectItem value="department_head">Phạm Văn F - Trưởng phòng KH-TC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Nhập ghi chú cho người phê duyệt (nếu có)" rows={4} />
              </div>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Lưu ý:</span> Sau khi gửi, văn bản sẽ được chuyển đến người phê duyệt để
                  xem xét trước khi ban hành chính thức.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Gửi phê duyệt
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" /> Lưu nháp
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
