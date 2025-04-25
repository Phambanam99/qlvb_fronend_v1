"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, Send, UserCheck } from "lucide-react"
import Link from "next/link"
import DocumentResponseForm from "@/components/document-response-form"
import DocumentResponseList from "@/components/document-response-list"
import DocumentProcessingHistory from "@/components/document-processing-history"
import { incomingDocumentsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const documentId = Number.parseInt(id)
  const { user, hasRole } = useAuth()
  const { toast } = useToast()

  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true)
        const response = await incomingDocumentsAPI.getIncomingDocumentById(documentId)
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
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">
            Chờ xử lý
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Đang xử lý
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="success" className="bg-green-50 text-green-700">
            Đã xử lý
          </Badge>
        )
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  // Hiển thị các nút hành động dựa trên vai trò người dùng
  const renderActionButtons = () => {
    if (!user || !document) return null

    if (hasRole("clerk")) {
      return (
        <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
          <Download className="mr-2 h-4 w-4" />
          Tải xuống
        </Button>
      )
    }

    if (hasRole("department_head")) {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
            asChild
          >
            <Link href={`/van-ban-den/${document.id}/phan-cong`}>
              <UserCheck className="mr-2 h-4 w-4" />
              Phân công
            </Link>
          </Button>
          {document.responses && document.responses.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-primary/20 hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href={`/van-ban-den/${document.id}/xem-xet/1`}>
                <Send className="mr-2 h-4 w-4" />
                Xem xét
              </Link>
            </Button>
          )}
        </>
      )
    }

    if (hasRole("staff")) {
      return (
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Send className="mr-2 h-4 w-4" />
          Trả lời
        </Button>
      )
    }

    if (hasRole("manager")) {
      return (
        document.responses &&
        document.responses.length > 0 && (
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link href={`/van-ban-den/${document.id}/phe-duyet/1`}>
              <Send className="mr-2 h-4 w-4" />
              Phê duyệt
            </Link>
          </Button>
        )
      )
    }

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
          <Link href="/van-ban-den">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10" asChild>
            <Link href="/van-ban-den">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Chi tiết văn bản đến</h1>
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
                  <p className="text-sm font-medium text-muted-foreground">Ngày nhận</p>
                  <p>{new Date(document.receivedDate).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đơn vị gửi</p>
                  <p>{document.sender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đơn vị xử lý</p>
                  <p>{document.assignedTo || "Chưa phân công"}</p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Trích yếu nội dung</p>
                <p className="text-sm">{document.content}</p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Ý kiến chỉ đạo của Thủ trưởng</p>
                <p className="text-sm">{document.managerOpinion || "Chưa có ý kiến chỉ đạo"}</p>
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

          <Tabs defaultValue="responses">
            <TabsList className="grid w-full grid-cols-2 bg-primary/5">
              <TabsTrigger
                value="responses"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Văn bản trả lời
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Lịch sử xử lý
              </TabsTrigger>
            </TabsList>
            <TabsContent value="responses" className="space-y-4 pt-4">
              <DocumentResponseList documentId={document.id} />
              {hasRole("staff") && <DocumentResponseForm documentId={document.id} />}
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              <DocumentProcessingHistory documentId={document.id} />
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
                <p className="text-sm font-medium text-muted-foreground">Đơn vị xử lý chính</p>
                <p className="mt-1">{document.assignedTo || "Chưa phân công"}</p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cán bộ được giao</p>
                <div className="mt-1">
                  {document.assignedUsers && document.assignedUsers.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {document.assignedUsers.slice(0, 3).map((user: any, index: number) => (
                          <div
                            key={index}
                            className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary"
                          >
                            {user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm">{document.assignedUsers.map((user: any) => user.name).join(", ")}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Chưa có cán bộ được phân công</p>
                  )}
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thời hạn xử lý</p>
                <p className="mt-1">
                  {document.deadline
                    ? new Date(document.deadline).toLocaleDateString("vi-VN")
                    : "Chưa thiết lập thời hạn"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-accent/30 border-t border-primary/10">
              {hasRole("department_head") && (
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href={`/van-ban-den/${document.id}/phan-cong`}>Cập nhật thông tin xử lý</Link>
                </Button>
              )}
              {!hasRole("department_head") && (
                <Button className="w-full bg-primary hover:bg-primary/90">Cập nhật thông tin xử lý</Button>
              )}
            </CardFooter>
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
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
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
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
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
