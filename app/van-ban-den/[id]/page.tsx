"use client"

import { use } from "react"
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

export default function DocumentDetailPage({ params }: { params: { id: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)

  // Dữ liệu mẫu
  const document = {
    id: Number.parseInt(id),
    number: `10${id}/CV-UBND`,
    title: "Về việc triển khai kế hoạch công tác năm 2023",
    receivedDate: "15/04/2023",
    sender: "UBND Tỉnh",
    content:
      "Căn cứ Kế hoạch số 123/KH-UBND ngày 10/01/2023 của UBND tỉnh về việc triển khai nhiệm vụ phát triển kinh tế - xã hội năm 2023, UBND tỉnh yêu cầu các sở, ban, ngành, UBND các huyện, thành phố xây dựng kế hoạch triển khai thực hiện các nhiệm vụ được giao...",
    status: "processing",
    assignedTo: "Phòng Kế hoạch - Tài chính",
    managerOpinion: "Giao Phòng Kế hoạch - Tài chính chủ trì, phối hợp với các phòng liên quan tham mưu xử lý.",
    attachments: [
      { name: "Kế hoạch số 123/KH-UBND.pdf", size: "2.5MB" },
      { name: "Phụ lục kèm theo.xlsx", size: "1.2MB" },
    ],
  }

  // Giả định vai trò người dùng (trong thực tế sẽ lấy từ context hoặc API)
  // Có thể là: "clerk", "department_head", "staff", "manager"
  const userRole = "department_head"

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
    switch (userRole) {
      case "clerk":
        return (
          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
        )
      case "department_head":
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
          </>
        )
      case "staff":
        return (
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Send className="mr-2 h-4 w-4" />
            Trả lời
          </Button>
        )
      case "manager":
        return (
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link href={`/van-ban-den/${document.id}/phe-duyet/1`}>
              <Send className="mr-2 h-4 w-4" />
              Phê duyệt
            </Link>
          </Button>
        )
      default:
        return (
          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
        )
    }
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
                  <p>{document.receivedDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đơn vị gửi</p>
                  <p>{document.sender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đơn vị xử lý</p>
                  <p>{document.assignedTo}</p>
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
                <p className="text-sm">{document.managerOpinion}</p>
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
              {userRole === "staff" && <DocumentResponseForm documentId={document.id} />}
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
                <p className="mt-1">{document.assignedTo}</p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cán bộ được giao</p>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      NB
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      TC
                    </div>
                  </div>
                  <span className="text-sm">Nguyễn Văn B, Trần Hương C</span>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thời hạn xử lý</p>
                <p className="mt-1">30/04/2023</p>
              </div>
            </CardContent>
            <CardFooter className="bg-accent/30 border-t border-primary/10">
              {userRole === "department_head" && (
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href={`/van-ban-den/${document.id}/phan-cong`}>Cập nhật thông tin xử lý</Link>
                </Button>
              )}
              {userRole !== "department_head" && (
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
