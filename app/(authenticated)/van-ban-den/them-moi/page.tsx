"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Paperclip, Save, X, Plus } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { 
  usersAPI, 
  incomingDocumentsAPI, 
  workflowAPI, 
  DocumentWorkflowDTO, 
  senderApi,
  UserDTO, 
} from "@/lib/api"
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { User } from "@/lib/auth-context"

export default function AddIncomingDocumentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<UserDTO[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [documentType, setDocumentType] = useState<string>("OFFICIAL_LETTER")
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true)
  const [newSender, setNewSender] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState("NORMAL")
  const [securityLevel, setSecurityLevel] = useState("NORMAL")
  const [closureRequest, setClosureRequest] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  // Lấy danh sách cán bộ từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await usersAPI.getAllUsers()
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

  // Lấy danh sách đơn vị gửi từ API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true)
        const senders = await senderApi.getAllSenders()
        setDepartments(senders || [])
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị gửi:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn vị gửi",
          variant: "destructive"
        })
      } finally {
        setIsLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
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

  const handleAddDepartment = async () => {
    if (!newSender.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên đơn vị gửi không được để trống",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await senderApi.createSender({ 
        name: newSender,
        description: "Đơn vị gửi mới được thêm từ trang tạo văn bản đến"
      })
      
      setDepartments(prev => [...prev, response])
      setNewSender("")
      setDialogOpen(false)
      
      toast({
        title: "Thành công",
        description: "Đã thêm đơn vị gửi mới",
      })
    } catch (error) {
      console.error("Lỗi khi thêm đơn vị gửi:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm đơn vị gửi mới",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(formRef.current!)
      
      // Chuẩn bị dữ liệu cho API
      const documentData = {
        title: formData.get('title') as string,
        documentType: documentType,
        documentNumber: formData.get('documentNumber') as string,
        referenceNumber: formData.get('referenceNumber') as string,
        issuingAuthority: formData.get('issuingAuthority') as string,
        urgencyLevel: urgencyLevel,
        securityLevel: securityLevel,
        summary: formData.get('summary') as string,
        notes: formData.get('notes') as string,
        signingDate: formData.get('signingDate') as string,
        receivedDate: formData.get('receivedDate') as string,
        processingStatus: "PENDING",
        closureRequest: closureRequest,
        sendingDepartmentName: formData.get('sendingDepartmentName') as string,
        emailSource: formData.get('emailSource') as string,
        primaryProcessorId: selectedUsers.length > 0 ? selectedUsers[0] : null,
      }
      console.log("document", documentData)
      // Thêm các file vào FormData
      const apiFormData = new FormData()
      
      // Thêm dữ liệu văn bản vào FormData
      Object.entries(documentData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          apiFormData.append(key, value.toString())
        }
      })
      const response = await incomingDocumentsAPI.createIncomingDocument(apiFormData)
      
      if (response?.data?.id) {
        // Tạo workflow cho văn bản
        const workflowData: DocumentWorkflowDTO = {
          documentId: response.data.id,
          status: 'REGISTERED',
          statusDisplayName: 'Đã đăng ký',
          comments: formData.get('notes') as string
        }
        
      await workflowAPI.registerIncomingDocument(response.data.id, workflowData)
        
        // Phân công người xử lý nếu có
        // if (selectedUsers.length > 0) {
        //   await workflowAPI.assignToSpecialist(response.data.id, {
            
        //     note: formData.get('notes') as string,
        //     deadline: formData.get('deadline') as string
        //   })
        // }
        if(files.length > 0) {
          await incomingDocumentsAPI.uploadAttachment(response.data.id, files[0])
        }
        toast({
          title: "Thành công",
          description: "Văn bản đến đã được tạo thành công",
        })
        
        router.push("/van-ban-den")
      }
    } catch (error) {
      console.error('Lỗi khi tạo văn bản:', error)
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
                  <Label htmlFor="referenceNumber">Số tham chiếu</Label>
                  <Input id="referenceNumber" name="referenceNumber" placeholder="Nhập số tham chiếu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signingDate">Ngày ký</Label>
                  <Input id="signingDate" name="signingDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedDate">Ngày nhận</Label>
                  <Input id="receivedDate" name="receivedDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority">Đơn vị gửi</Label>
                  <div className="flex gap-2">
                    <Select name="issuingAuthority" required>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn đơn vị gửi" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDepartments ? (
                          <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                        ) : departments.length === 0 ? (
                          <SelectItem value="empty" disabled>Không có đơn vị nào</SelectItem>
                        ) : (
                          departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm đơn vị gửi mới</DialogTitle>
                          <DialogDescription>
                            Nhập tên đơn vị gửi chưa có trong hệ thống
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newDepartment">Tên đơn vị gửi</Label>
                            <Input
                              id="newDepartment"
                              value={newSender}
                              onChange={(e) => setNewSender(e.target.value)}
                              placeholder="Nhập tên đơn vị gửi mới"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setDialogOpen(false)}
                          >
                            Hủy
                          </Button>
                          <Button 
                            onClick={handleAddDepartment}
                            disabled={isSubmitting || !newSender.trim()}
                          >
                            {isSubmitting ? "Đang thêm..." : "Thêm đơn vị"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType" name="documentType">
                      <SelectValue placeholder="Chọn loại văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFICIAL_LETTER">Công văn</SelectItem>
                      <SelectItem value="DECISION">Quyết định</SelectItem>
                      <SelectItem value="DIRECTIVE">Chỉ thị</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Thông báo</SelectItem>
                      <SelectItem value="REPORT">Báo cáo</SelectItem>
                      <SelectItem value="PLAN">Kế hoạch</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Độ khẩn</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                    <SelectTrigger id="urgencyLevel" name="urgencyLevel">
                      <SelectValue placeholder="Chọn độ khẩn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Bình thường</SelectItem>
                      <SelectItem value="URGENT">Khẩn</SelectItem>
                      <SelectItem value="IMMEDIATE">Hỏa tốc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityLevel">Độ mật</Label>
                  <Select value={securityLevel} onValueChange={setSecurityLevel}>
                    <SelectTrigger id="securityLevel" name="securityLevel">
                      <SelectValue placeholder="Chọn độ mật" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Bình thường</SelectItem>
                      <SelectItem value="CONFIDENTIAL">Mật</SelectItem>
                      <SelectItem value="SECRET">Tối mật</SelectItem>
                      <SelectItem value="TOP_SECRET">Tuyệt mật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Trích yếu</Label>
                <Input id="title" name="title" placeholder="Nhập trích yếu văn bản" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Tóm tắt nội dung</Label>
                <Textarea id="summary" name="summary" placeholder="Nhập tóm tắt nội dung văn bản" rows={5} />
              </div>
            
              <div className="flex items-center space-x-2">
                <Switch 
                  id="closureRequest"
                  checked={closureRequest}
                  onCheckedChange={setClosureRequest}
                />
                <Label htmlFor="closureRequest">Yêu cầu văn bản đóng lưu sau khi xử lý</Label>
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
                    const user = users.find((u) => u.id === Number(userId))
                    if (!user) return null

                    return (
                      <Badge
                        key={userId}
                        variant="secondary"
                        className="pl-2 pr-1 py-1.5 flex items-center gap-1 bg-primary/10"
                      >
                        <span>{user.username}</span>
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
                        <div key="loading" className="flex items-center justify-center p-4">
                          <p>Đang tải danh sách cán bộ...</p>
                        </div>
                      ) : users.length === 0 ? (
                        <div key="empty" className="flex items-center justify-center p-4">
                          <p>Không có cán bộ nào</p>
                        </div>
                      ) : (
                        users.map((user, index) => (
                          <div key={user.id || `user-${index}`}
                            className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-accent/50"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedUsers.includes(String(user.id))}
                                onCheckedChange={() => handleUserSelect(String(user.id))}
                              />
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 bg-primary/10">
                                  <AvatarFallback className="text-xs text-primary">
                                    {user.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.username}</p>
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
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea id="notes" name="notes" placeholder="Nhập ghi chú cho người nhận (nếu có)" rows={3} />
                </div>
                
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