"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, Send, Edit, Trash, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
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
import { Textarea } from "@/components/ui/textarea"
import { outgoingDocumentsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function OutgoingDocumentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const documentId = Number.parseInt(id)
  const { user, hasRole } = useAuth()
  const { addNotification } = useNotifications()
  const { toast } = useToast()

  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvalComment, setApprovalComment] = useState("")
  const [rejectionComment, setRejectionComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true)
        const response = await outgoingDocumentsAPI.getOutgoingDocumentById(documentId)
        setDocument(response.data)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching document:", err)
        setError(err.message || "Không thể tải thông tin văn bản")
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin văn bản",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="border-gray-400 bg-gray-50 text-gray-700">
            Bản nháp
          </Badge>
        )
      case "pending_approval":
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">
            Chờ phê duyệt
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Đã phê duyệt
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="success" className="bg-green-50 text-green-700">
            Đã gửi
          </Badge>
        )
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      await outgoingDocumentsAPI.approveOutgoingDocument(documentId, { comment: approvalComment })

      addNotification({
        title: "Văn bản đã được phê duyệt",
        message: "Văn bản đã được phê duyệt và chuyển cho văn thư để ban hành.",
        type: "success",
      })

      // Refresh document data
      const response = await outgoingDocumentsAPI.getOutgoingDocumentById(documentId)
      setDocument(response.data)

      toast({
        title: "Thành công",
        description: "Văn bản đã được phê duyệt thành công",
      })
    } catch (err: any) {
      console.error("Error approving document:", err)
      toast({
        title: "Lỗi",
        description: err.message || "Không thể phê duyệt văn bản",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsSubmitting(true)
      await outgoingDocumentsAPI.rejectOutgoingDocument(documentId, { comment: rejectionComment })

      addNotification({
        title: "Văn bản đã bị từ chối",
        message: "Văn bản đã bị từ chối và trả lại người soạn thảo để chỉnh sửa.",
        type: "warning",
      })

      // Refresh document data
      const response = await outgoingDocumentsAPI.getOutgoingDocumentById(documentId)
      setDocument(response.data)

      toast({
        title: "Thành công",
        description: "Văn bản đã được từ chối và trả lại người soạn thảo",
      })
    } catch (err: any) {
      console.error("Error rejecting document:", err)
      toast({
        title: "Lỗi",
        description: err.message || "Không thể từ chối văn bản",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hiển thị các nút hành động dựa trên vai trò người dùng và trạng thái văn bản
  const renderActionButtons = () => {
    if (!user || !document) return null

    // Nếu là người soạn thảo và văn bản đang ở trạng thái nháp
    if (hasRole("staff") && document.status === "draft") {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
            asChild
          >
            <Link href={`/van-ban-di/${document.id}/chinh-sua`}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={async () => {
              try {
                setIsSubmitting(true)
                await outgoingDocumentsAPI.submitForApproval(document.id)

                // Refresh document data
                const response = await outgoingDocumentsAPI.getOutgoingDocumentById(documentId)
                setDocument(response.data)

                toast({
                  title: "Thành công",
                  description: "Văn bản đã được gửi phê duyệt",
                })
              } catch (err: any) {
                toast({
                  title: "Lỗi",
                  description: err.message || "Không thể gửi văn bản để phê duyệt",
                  variant: "destructive",
                })
              } finally {
                setIsSubmitting(false)
              }
            }}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Đang gửi..." : "Gửi phê duyệt"}
          </Button>
        </>
      )
    }

    // Nếu là trưởng phòng và văn bản đang chờ phê duyệt
    if (hasRole("department_head") && document.status === "pending_approval") {
      return (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                Từ chối
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Từ chối văn bản</AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng nhập lý do từ chối để người soạn thảo có thể chỉnh sửa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Phê duyệt
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Phê duyệt văn bản</AlertDialogTitle>
                <AlertDialogDescription>Bạn có thể thêm ý kiến trước khi phê duyệt văn bản này.</AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập ý kiến (không bắt buộc)..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận phê duyệt"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    }

    // Nếu là thủ trưởng và văn bản đang chờ phê duyệt cuối cùng
    if (hasRole("manager") && document.status === "pending_approval") {
      return (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                Từ chối
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Từ chối văn bản</AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng nhập lý do từ chối để người soạn thảo có thể chỉnh sửa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Phê duyệt và ban hành
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Phê duyệt và ban hành văn bản</AlertDialogTitle>
                <AlertDialogDescription>
                  Sau khi phê duyệt, văn bản sẽ được chuyển cho văn thư để ban hành chính thức.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập ý kiến (không bắt buộc)..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận phê duyệt"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    }

    // Nếu là văn thư và văn bản đã được phê duyệt
    if (hasRole("clerk") && document.status === "approved") {
      return (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90"
          onClick={async () => {
            try {
              setIsSubmitting(true)
              await outgoingDocumentsAPI.issueDocument(document.id)

              // Refresh document data
              const response = await outgoingDocumentsAPI.getOutgoingDocumentById(documentId)
              setDocument(response.data)

              toast({
                title: "Thành công",
                description: "Văn bản đã được ban hành thành công",
              })
            } catch (err: any) {
              toast({
                title: "Lỗi",
                description: err.message || "Không thể ban hành văn bản",
                variant: "destructive",
              })
            } finally {
              setIsSubmitting(false)
            }
          }}
          disabled={isSubmitting}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Đang xử lý..." : "Ban hành văn bản"}
        </Button>
      )
    }

    // Mặc định chỉ hiển thị nút tải xuống
    return (
      <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
        <Download className="mr-2 h-4 w-4" />
        Tải xuống
      </Button>
    )
  }

  if (isLoading) {
    return <DocumentDetailSkeleton />
  }

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-red-500 mb-4">{error || "Không tìm thấy văn bản"}</p>
        <Button asChild>
          <Link href="/van-ban-di">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10" asChild>
            <Link href="/van-ban-di">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Chi tiết văn bản đi</h1>
        </div>
        <div className="flex items-center space-x-2">{renderActionButtons()}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{document.number}</CardTitle>
                {getStatusBadge(document.status)}
              </div>
              <CardDescription>{document.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày ban hành</p>
                  <p>{document.sentDate ? new Date(document.sentDate).toLocaleDateString("vi-VN") : "Chưa ban hành"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nơi nhận</p>
                  <p>{document.recipient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người soạn thảo</p>
                  <p>{document.creator?.name || "Không xác định"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người phê duyệt</p>
                  <p>{document.approver?.name || "Chưa phê duyệt"}</p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Nội dung văn bản</p>
                <div className="rounded-md border p-4 bg-accent/30 whitespace-pre-line">{document.content}</div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tệp đính kèm</p>
                <div className="space-y-2">
                  {document.attachments && document.attachments.length > 0 ? (
                    document.attachments.map((file: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-primary/10 p-2 bg-accent/30"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">{file.size}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có tệp đính kèm</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history">
            <TabsList className="grid w-full grid-cols-1 bg-primary/5">
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Lịch sử xử lý
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="pt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-6">
                      {document.history && document.history.length > 0 ? (
                        document.history.map((item: any, index: number) => (
                          <div key={index} className="relative pl-8">
                            <div className="absolute left-0 top-2 h-6 w-6 rounded-full border bg-background flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{item.action}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleString("vi-VN")}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.actor}</p>
                              <p className="text-sm">{item.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có lịch sử xử lý</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin xử lý</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(document.status)}</div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người soạn thảo</p>
                <div className="mt-1">
                  <p>{document.creator?.name || "Không xác định"}</p>
                  <p className="text-sm text-muted-foreground">
                    {document.creator?.position || "Không xác định"} -{" "}
                    {document.creator?.department || "Không xác định"}
                  </p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người phê duyệt</p>
                <div className="mt-1">
                  <p>{document.approver?.name || "Chưa phê duyệt"}</p>
                  <p className="text-sm text-muted-foreground">{document.approver?.position || ""}</p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                <p className="mt-1">
                  {document.createdAt ? new Date(document.createdAt).toLocaleDateString("vi-VN") : "Không xác định"}
                </p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày gửi phê duyệt</p>
                <p className="mt-1">
                  {document.submittedAt
                    ? new Date(document.submittedAt).toLocaleDateString("vi-VN")
                    : "Chưa gửi phê duyệt"}
                </p>
              </div>
            </CardContent>
            {hasRole(["staff", "department_head"]) && document.status === "draft" && (
              <CardFooter className="bg-accent/30 border-t border-primary/10">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true)
                      await outgoingDocumentsAPI.deleteOutgoingDocument(document.id)

                      toast({
                        title: "Thành công",
                        description: "Văn bản đã được xóa thành công",
                      })

                      // Redirect to list page
                      window.location.href = "/van-ban-di"
                    } catch (err: any) {
                      toast({
                        title: "Lỗi",
                        description: err.message || "Không thể xóa văn bản",
                        variant: "destructive",
                      })
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <Trash className="mr-2 h-4 w-4" /> {isSubmitting ? "Đang xử lý..." : "Xóa văn bản"}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Văn bản liên quan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {document.relatedDocuments && document.relatedDocuments.length > 0 ? (
                  document.relatedDocuments.map((relatedDoc: any) => (
                    <div key={relatedDoc.id} className="rounded-md border border-primary/10 p-3 bg-accent/30">
                      <div className="flex justify-between">
                        <p className="font-medium text-primary">{relatedDoc.number}</p>
                        <Badge variant="success" className="bg-green-50 text-green-700">
                          {relatedDoc.status === "completed" ? "Đã xử lý" : "Đang xử lý"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{relatedDoc.title}</p>
                      <div className="mt-2 flex justify-end">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary" asChild>
                          <Link href={`/van-ban-den/${relatedDoc.id}`}>Xem</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Không có văn bản liên quan</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DocumentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex">
              <Skeleton className="h-10 w-full" />
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                  <div className="mt-2 flex justify-end">
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                  <div className="mt-2 flex justify-end">
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
