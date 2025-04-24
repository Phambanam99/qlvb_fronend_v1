"use client"

import { use } from "react"
import { useState } from "react"
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

export default function OutgoingDocumentDetailPage({ params }: { params: { id: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)
  const { user, hasRole } = useAuth()
  const { addNotification } = useNotifications()
  const [approvalComment, setApprovalComment] = useState("")
  const [rejectionComment, setRejectionComment] = useState("")

  // Dữ liệu mẫu
  const document = {
    id: Number.parseInt(id),
    number: `0${id}/CV-KHTC`,
    title: "Về việc báo cáo tình hình thực hiện kế hoạch công tác năm 2023",
    sentDate: "20/04/2023",
    recipient: "UBND Tỉnh",
    content:
      "Kính gửi: Ủy ban nhân dân tỉnh\n\nThực hiện Kế hoạch số 123/KH-UBND ngày 10/01/2023 của UBND tỉnh về việc triển khai nhiệm vụ phát triển kinh tế - xã hội năm 2023, [Tên đơn vị] báo cáo tình hình thực hiện kế hoạch công tác năm 2023 như sau:\n\n1. Kết quả đạt được\n- Đã hoàn thành 80% khối lượng công việc theo kế hoạch\n- Đã triển khai 5/6 dự án đầu tư công\n- Đã giải ngân 75% vốn đầu tư công được giao\n\n2. Khó khăn, vướng mắc\n- Một số dự án chậm tiến độ do vướng mắc trong công tác giải phóng mặt bằng\n- Một số thủ tục hành chính còn phức tạp, kéo dài\n\n3. Kiến nghị, đề xuất\n- Đề nghị UBND tỉnh chỉ đạo các sở, ngành liên quan phối hợp giải quyết các vướng mắc\n- Đề nghị UBND tỉnh xem xét điều chỉnh kế hoạch đối với một số nhiệm vụ chưa thể hoàn thành trong năm 2023\n\nTrân trọng báo cáo./.",
    status: "pending_approval",
    creator: {
      name: "Nguyễn Văn B",
      position: "Chuyên viên",
      department: "Phòng Kế hoạch - Tài chính",
    },
    approver: {
      name: "Trần Văn E",
      position: "Thủ trưởng",
    },
    attachments: [
      { name: "Báo cáo chi tiết.docx", size: "2.5MB" },
      { name: "Phụ lục số liệu.xlsx", size: "1.8MB" },
    ],
    history: [
      {
        action: "Tạo văn bản",
        actor: "Nguyễn Văn B (Chuyên viên)",
        timestamp: "19/04/2023 14:30",
        description: "Văn bản được tạo và lưu dưới dạng bản nháp.",
      },
      {
        action: "Gửi phê duyệt",
        actor: "Nguyễn Văn B (Chuyên viên)",
        timestamp: "20/04/2023 09:15",
        description: "Văn bản được gửi đến Trưởng phòng để xem xét.",
      },
      {
        action: "Trưởng phòng phê duyệt",
        actor: "Phạm Văn F (Trưởng phòng)",
        timestamp: "20/04/2023 11:30",
        description: "Trưởng phòng đã phê duyệt và chuyển đến Thủ trưởng.",
      },
    ],
  }

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

  const handleApprove = () => {
    addNotification({
      title: "Văn bản đã được phê duyệt",
      message: "Văn bản đã được phê duyệt và chuyển cho văn thư để ban hành.",
      type: "success",
    })
  }

  const handleReject = () => {
    addNotification({
      title: "Văn bản đã bị từ chối",
      message: "Văn bản đã bị từ chối và trả lại người soạn thảo để chỉnh sửa.",
      type: "warning",
    })
  }

  // Hiển thị các nút hành động dựa trên vai trò người dùng và trạng thái văn bản
  const renderActionButtons = () => {
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
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Send className="mr-2 h-4 w-4" />
            Gửi phê duyệt
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
                <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                  Xác nhận từ chối
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
                <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  Xác nhận phê duyệt
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
                <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                  Xác nhận từ chối
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
                <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  Xác nhận phê duyệt
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
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Send className="mr-2 h-4 w-4" />
          Ban hành văn bản
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
                  <p>{document.sentDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nơi nhận</p>
                  <p>{document.recipient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người soạn thảo</p>
                  <p>{document.creator.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người phê duyệt</p>
                  <p>{document.approver.name}</p>
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
                  {document.attachments.map((file, index) => (
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                      {document.history.map((item, index) => (
                        <div key={index} className="relative pl-8">
                          <div className="absolute left-0 top-2 h-6 w-6 rounded-full border bg-background flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{item.action}</p>
                              <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.actor}</p>
                            <p className="text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
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
                  <p>{document.creator.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {document.creator.position} - {document.creator.department}
                  </p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người phê duyệt</p>
                <div className="mt-1">
                  <p>{document.approver.name}</p>
                  <p className="text-sm text-muted-foreground">{document.approver.position}</p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                <p className="mt-1">{document.history[0]?.timestamp.split(" ")[0] || "N/A"}</p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày gửi phê duyệt</p>
                <p className="mt-1">{document.history[1]?.timestamp.split(" ")[0] || "N/A"}</p>
              </div>
            </CardContent>
            {hasRole(["staff", "department_head"]) && document.status === "draft" && (
              <CardFooter className="bg-accent/30 border-t border-primary/10">
                <Button variant="destructive" className="w-full">
                  <Trash className="mr-2 h-4 w-4" /> Xóa văn bản
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
                <div className="rounded-md border border-primary/10 p-3 bg-accent/30">
                  <div className="flex justify-between">
                    <p className="font-medium text-primary">100/CV-UBND</p>
                    <Badge variant="success" className="bg-green-50 text-green-700">
                      Đã xử lý
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Về việc hướng dẫn xây dựng kế hoạch công tác năm 2023</p>
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary" asChild>
                      <Link href="/van-ban-den/100">Xem</Link>
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border border-primary/10 p-3 bg-accent/30">
                  <div className="flex justify-between">
                    <p className="font-medium text-primary">99/CV-UBND</p>
                    <Badge variant="success" className="bg-green-50 text-green-700">
                      Đã xử lý
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Về việc báo cáo tình hình thực hiện nhiệm vụ năm 2022</p>
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary" asChild>
                      <Link href="/van-ban-den/99">Xem</Link>
                    </Button>
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
