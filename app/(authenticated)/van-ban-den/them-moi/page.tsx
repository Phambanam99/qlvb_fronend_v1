"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { usersAPI, incomingDocumentsAPI } from "@/lib/api"

export default function AddIncomingDocumentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [existingAttachments, setExistingAttachments] = useState<any[]>([])
  const [documentType, setDocumentType] = useState<string>("official")
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  // Lấy danh sách cán bộ từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await usersAPI.getAllUsers()
        console.log("Danh sách cán bộ:", response)
        setUsers(response || [])
      } catch (error) {
        console.error("Lỗi khi lấy danh sách cán bộ:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách cán bộ",
          variant: "destructive"
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
      console.log("Tệp đã chọn:", newFiles)
    }
  }

  // Xóa file đã chọn
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  // Xóa file đính kèm hiện có
  const handleRemoveExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index))
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

  // Cập nhật hàm handleSubmit để gửi dữ liệu đúng định dạng API yêu cầu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(formRef.current!)
      
      // Chuyển đổi tên trường từ UI sang tên trường API
      const number = formData.get('documentNumber')
      formData.delete('documentNumber')
      formData.append('number', number as string)
      
     // Đảm bảo định dạng ngày tháng đúng
    const receivedDateInput = formData.get('receivedDate') as string;
    if (receivedDateInput) {
      // Chuyển đổi chuỗi ngày thành đối tượng Date
      const receivedDate = new Date(receivedDateInput);
      
      // Kiểm tra tính hợp lệ của ngày trước khi định dạng
      if (!isNaN(receivedDate.getTime())) {
        formData.set('receivedDate', receivedDate.toISOString());
      } else {
        // Xóa giá trị không hợp lệ thay vì gửi nó đến server
        formData.delete('receivedDate');
        toast({
          title: "Cảnh báo",
          description: "Ngày nhận không hợp lệ, đã bỏ qua trường này",
          variant: "warning"
        });
      }
    }
      
      // Đảm bảo documentType được đặt từ state
      formData.set('documentType', documentType)
      
      // Thêm trường status nếu chưa có
      if (!formData.has('status')) {
        formData.append('status', 'pending')
      }
      
      // Xóa các file cũ và thêm các file mới đã chọn
      formData.delete('attachments')
      files.forEach(file => {
        formData.append('attachments', file)
      })
      
      // Thêm các tệp đính kèm hiện có
      if (existingAttachments.length > 0) {
        formData.append('attachmentsJson', JSON.stringify(existingAttachments))
      }

        // Xử lý tương tự cho deadline
      const deadlineInput = formData.get('deadline') as string;
      if (deadlineInput) {
        const deadline = new Date(deadlineInput);
        if (!isNaN(deadline.getTime())) {
          formData.set('deadline', deadline.toISOString());
        } else {
          formData.delete('deadline');
          toast({
            title: "Cảnh báo",
            description: "Thời hạn không hợp lệ, đã bỏ qua trường này",
            variant: "warning"
          });
        }
      }
       console.log("Dữ liệu gửi đi:", Object.fromEntries(formData.entries()))
      // Gọi API để tạo văn bản
      const response = await incomingDocumentsAPI.createDocument(formData)
      console.log("Dữ liệu phản hồi:", response)
      if (!response.ok) {
        const errorData = await response.document()
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo văn bản')
      }
      
      const data = response;
      
      // Hiển thị thông báo thành công
      toast({
        title: "Thành công",
        description: "Văn bản đến đã được tạo thành công",
      })
      
      // Nếu có userIds và văn bản được tạo thành công, tiến hành phân công
      if (selectedUsers.length > 0 && data.document?.id) {
        try {
          const noteElement = formRef.current?.querySelector('#note') as HTMLTextAreaElement
          const note = noteElement?.value || ''
          
          const assignResponse = await incomingDocumentsAPI.assignDocument(data.document.id, {
            userIds: selectedUsers.map(id => parseInt(id)),
            note: note,
            deadline: deadlineInput ? new Date(deadlineInput).toISOString() : undefined
          })
          
          if (!assignResponse.ok) {
            throw new Error('Có lỗi khi phân công văn bản')
          }
          
          toast({
            title: "Thành công",
            description: "Văn bản đã được phân công cho cán bộ",
          })
        } catch (assignError) {
          console.error('Lỗi khi phân công văn bản:', assignError)
          toast({
            title: "Chú ý",
            description: "Văn bản đã được tạo nhưng có lỗi khi phân công",
            variant: "warning"
          })
        }
      }
      
      // Chuyển hướng về trang danh sách văn bản đến
      router.push("/van-ban-den")
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo văn bản",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
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

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
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
                  <Input id="documentNumber" name="documentNumber" placeholder="Nhập số văn bản" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedDate">Ngày nhận</Label>
                  <Input id="receivedDate" name="receivedDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender">Đơn vị gửi</Label>
                  <Input id="sender" name="sender" placeholder="Nhập tên đơn vị gửi" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType" name="documentType">
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
                <Input id="title" name="title" placeholder="Nhập trích yếu văn bản" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea id="content" name="content" placeholder="Nhập nội dung văn bản" rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedDepartment">Phòng ban xử lý</Label>
                <Input id="assignedDepartment" name="assignedDepartment" placeholder="Nhập phòng ban xử lý" />
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
                      <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                        <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
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
                        <span>{user.fullName}</span>
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
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <p>Đang tải danh sách cán bộ...</p>
                        </div>
                      ) : users.length === 0 ? (
                        <div className="flex items-center justify-center p-4">
                          <p>Không có cán bộ nào</p>
                        </div>
                      ) : (
                        users.map((user) => (
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
                                    {user.fullName
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.fullName}</p>
                                  <p className="text-xs text-muted-foreground">{user.position}</p>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs bg-accent">
                              {user.department}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea id="note" name="note" placeholder="Nhập ghi chú cho người nhận (nếu có)" rows={3} />
                </div>
                
                {/* Thêm trường deadline nếu cần */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">Thời hạn xử lý</Label>
                  <Input id="deadline" name="deadline" type="date" placeholder="Chọn thời hạn xử lý" />
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