"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Loader2, Save, Trash } from "lucide-react"
import Link from "next/link"
import { outgoingDocumentsAPI } from "@/lib/api/outgoingDocuments"
import { departmentsAPI } from "@/lib/api/departments"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditOutgoingDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { hasRole } = useAuth()
  const documentId = params.id as string

  const [document, setDocument] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    number: "",
    title: "",
    content: "",
    recipient: "",
    recipientDepartmentId: "",
    signer: "",
    signerPosition: "",
    sentDate: new Date(),
    isUrgent: false,
    isConfidential: false,
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch document details
        const documentData = await outgoingDocumentsAPI.getOutgoingDocumentById(documentId)
        setDocument(documentData)

        // Set form data from document
        setFormData({
          number: documentData.number || "",
          title: documentData.title || "",
          content: documentData.content || "",
          recipient: documentData.recipient || "",
          recipientDepartmentId: documentData.recipientDepartmentId || "",
          signer: documentData.signer || "",
          signerPosition: documentData.signerPosition || "",
          sentDate: documentData.sentDate ? new Date(documentData.sentDate) : new Date(),
          isUrgent: documentData.isUrgent || false,
          isConfidential: documentData.isConfidential || false,
          notes: documentData.notes || "",
        })

        // Fetch existing attachments
        if (documentData.attachments) {
          setExistingAttachments(documentData.attachments)
        }

        // Fetch departments for dropdown
        const departmentsData = await departmentsAPI.getAllDepartments()
        setDepartments(departmentsData)
      } catch (error) {
        console.error("Error fetching document data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin văn bản. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [documentId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, sentDate: date }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingAttachment = (id: string) => {
    setExistingAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      // Prepare form data for API
      const updateData = {
        ...formData,
        sentDate: formData.sentDate.toISOString(),
        removedAttachmentIds: document.attachments
          ?.filter((att: any) => !existingAttachments.some((exAtt) => exAtt.id === att.id))
          .map((att: any) => att.id),
      }

      // Update document
      await outgoingDocumentsAPI.updateOutgoingDocument(documentId, updateData)

      // Upload new attachments if any
      if (attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach((file) => {
          formData.append("files", file)
        })

        await outgoingDocumentsAPI.addAttachments(documentId, formData)
      }

      toast({
        title: "Thành công",
        description: "Văn bản đã được cập nhật thành công",
      })

      // Navigate back to document details
      router.push(`/van-ban-di/${documentId}`)
    } catch (error) {
      console.error("Error updating document:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật văn bản. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await outgoingDocumentsAPI.deleteOutgoingDocument(documentId)

      toast({
        title: "Thành công",
        description: "Văn bản đã được xóa thành công",
      })

      // Navigate back to documents list
      router.push("/van-ban-di")
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa văn bản. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Check if user has permission to edit
  const canEdit = hasRole(["admin", "clerk", "manager"]) && document?.status !== "sent"

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-2">
        <h2 className="text-xl font-semibold">Không tìm thấy văn bản</h2>
        <p className="text-muted-foreground">Văn bản không tồn tại hoặc đã bị xóa</p>
        <Button variant="outline" asChild>
          <Link href="/van-ban-di">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    )
  }

  if (!canEdit) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-2">
        <h2 className="text-xl font-semibold">Không có quyền chỉnh sửa</h2>
        <p className="text-muted-foreground">Bạn không có quyền chỉnh sửa văn bản này hoặc văn bản đã được gửi</p>
        <Button variant="outline" asChild>
          <Link href={`/van-ban-di/${documentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại chi tiết văn bản
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/van-ban-di/${documentId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa văn bản đi</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa văn bản
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa văn bản</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa văn bản này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Xác nhận xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>Thông tin cơ bản của văn bản đi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">Số văn bản</Label>
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="Nhập số văn bản"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Trích yếu</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập trích yếu văn bản"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung văn bản"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sentDate">Ngày ban hành</Label>
                  <DatePicker date={formData.sentDate} setDate={handleDateChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientDepartmentId">Nơi nhận</Label>
                  <Select
                    value={formData.recipientDepartmentId}
                    onValueChange={(value) => handleSelectChange("recipientDepartmentId", value)}
                  >
                    <SelectTrigger id="recipientDepartmentId">
                      <SelectValue placeholder="Chọn nơi nhận" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Người nhận</Label>
                <Input
                  id="recipient"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  placeholder="Nhập người nhận"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin người ký</CardTitle>
                <CardDescription>Thông tin về người ký văn bản</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signer">Người ký</Label>
                  <Input
                    id="signer"
                    name="signer"
                    value={formData.signer}
                    onChange={handleInputChange}
                    placeholder="Nhập tên người ký"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signerPosition">Chức vụ</Label>
                  <Input
                    id="signerPosition"
                    name="signerPosition"
                    value={formData.signerPosition}
                    onChange={handleInputChange}
                    placeholder="Nhập chức vụ người ký"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú (nếu có)"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isUrgent"
                      checked={formData.isUrgent}
                      onCheckedChange={(checked) => handleCheckboxChange("isUrgent", checked as boolean)}
                    />
                    <Label htmlFor="isUrgent">Văn bản khẩn</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isConfidential"
                      checked={formData.isConfidential}
                      onCheckedChange={(checked) => handleCheckboxChange("isConfidential", checked as boolean)}
                    />
                    <Label htmlFor="isConfidential">Văn bản mật</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tệp đính kèm</CardTitle>
                <CardDescription>Quản lý tệp đính kèm của văn bản</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attachments">Thêm tệp đính kèm mới</Label>
                  <Input id="attachments" type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tệp mới</Label>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-8 w-8 p-0 text-muted-foreground"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tệp hiện có</Label>
                    <div className="space-y-2">
                      {existingAttachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">{attachment.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingAttachment(attachment.id)}
                            className="h-8 w-8 p-0 text-muted-foreground"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/van-ban-di/${documentId}`}>Hủy</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
