"use client"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"

export default function ScheduleDetailPage({ params }: { params: { id: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)

  // Dữ liệu mẫu
  const schedule = {
    id: Number.parseInt(id),
    title: `Lịch công tác tuần ${Number.parseInt(id) + 17} (24/04 - 30/04/2023)`,
    department: "Phòng Kế hoạch - Tài chính",
    creator: "Nguyễn Văn B",
    createdAt: "20/04/2023",
    period: "Tuần",
    status: id === "1" ? "pending" : "approved",
    description: "Lịch công tác tuần của Phòng Kế hoạch - Tài chính",
    approver: id === "1" ? "" : "Trần Văn E (Thủ trưởng)",
    approvedAt: id === "1" ? "" : "22/04/2023",
    comments: id === "1" ? "" : "Lịch công tác đã được phê duyệt. Lưu ý chuẩn bị tốt cho cuộc họp với Sở KH&ĐT.",
    items: [
      {
        id: 1,
        title: "Họp giao ban đầu tuần",
        date: "24/04/2023",
        startTime: "08:00",
        endTime: "09:30",
        location: "Phòng họp tầng 2",
        type: "internal",
        participants: ["Trưởng phòng", "Phó phòng", "Các chuyên viên"],
        description: "Họp giao ban đầu tuần để đánh giá kết quả công việc tuần trước và triển khai nhiệm vụ tuần này.",
      },
      {
        id: 2,
        title: "Làm việc với Sở KH&ĐT",
        date: "24/04/2023",
        startTime: "14:00",
        endTime: "16:30",
        location: "Trụ sở Sở KH&ĐT",
        type: "external",
        participants: ["Trưởng phòng", "Chuyên viên Nguyễn Văn X"],
        description: "Làm việc với Sở KH&ĐT về việc triển khai các dự án đầu tư công năm 2023.",
      },
      {
        id: 3,
        title: "Kiểm tra tiến độ dự án",
        date: "26/04/2023",
        startTime: "08:30",
        endTime: "11:30",
        location: "Hiện trường dự án",
        type: "field",
        participants: ["Phó phòng", "Chuyên viên Trần Thị Y", "Chuyên viên Lê Văn Z"],
        description: "Kiểm tra tiến độ thực hiện dự án XYZ tại hiện trường.",
      },
    ],
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Chờ duyệt</Badge>
      case "approved":
        return <Badge variant="success">Đã duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "internal":
        return <Badge variant="outline">Nội bộ</Badge>
      case "external":
        return <Badge variant="secondary">Bên ngoài</Badge>
      case "online":
        return <Badge variant="default">Trực tuyến</Badge>
      case "field":
        return <Badge variant="destructive">Hiện trường</Badge>
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  // Giả định vai trò người dùng là người tạo lịch
  const userRole = "creator" // Có thể là: "creator", "department_head", "deputy", "manager", "staff"
  const canEdit = ["creator"].includes(userRole) && schedule.status === "pending"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href="/lich-cong-tac">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Chi tiết lịch công tác</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <Printer className="mr-2 h-4 w-4" />
            In lịch
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{schedule.title}</CardTitle>
                {getStatusBadge(schedule.status)}
              </div>
              <CardDescription>
                {schedule.department} • Người tạo: {schedule.creator} • Ngày tạo: {schedule.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                <p className="mt-1">{schedule.description}</p>
              </div>
              {schedule.comments && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nhận xét của người duyệt</p>
                    <div className="mt-1 rounded-md bg-muted p-3">
                      <p className="text-sm">{schedule.comments}</p>
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Chi tiết lịch công tác</p>
                <Tabs defaultValue="list" className="mt-2">
                  <TabsList>
                    <TabsTrigger value="list">Danh sách</TabsTrigger>
                    <TabsTrigger value="calendar">Lịch</TabsTrigger>
                  </TabsList>
                  <TabsContent value="list" className="space-y-4 mt-4">
                    {schedule.items.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex flex-col items-center">
                              <div className="text-sm font-medium">{item.startTime}</div>
                              <div className="h-full w-px bg-border mt-1"></div>
                              <div className="text-sm font-medium">{item.endTime}</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{item.title}</h3>
                                {getEventTypeBadge(item.type)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.date} • {item.location}
                              </p>
                              <p className="text-sm mt-2">{item.description}</p>
                              <p className="text-sm mt-2">
                                <span className="text-muted-foreground">Thành phần: </span>
                                {item.participants.join(", ")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="calendar">
                    <div className="p-4 text-center text-muted-foreground">Xem lịch theo dạng lịch tuần/tháng</div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin lịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(schedule.status)}</div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người tạo</p>
                <p className="mt-1">{schedule.creator}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                <p className="mt-1">{schedule.createdAt}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phòng ban</p>
                <p className="mt-1">{schedule.department}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loại lịch</p>
                <p className="mt-1">{schedule.period}</p>
              </div>
              {schedule.approver && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Người duyệt</p>
                    <p className="mt-1">{schedule.approver}</p>
                  </div>
                </>
              )}
              {schedule.approvedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngày duyệt</p>
                    <p className="mt-1">{schedule.approvedAt}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch liên quan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-3">
                  <div className="flex justify-between">
                    <p className="font-medium">Lịch công tác tuần 16</p>
                    <Badge variant="success">Đã duyệt</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">10/04 - 16/04/2023</p>
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/lich-cong-tac/2">Xem</Link>
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex justify-between">
                    <p className="font-medium">Lịch công tác tháng 4</p>
                    <Badge variant="success">Đã duyệt</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">01/04 - 30/04/2023</p>
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/lich-cong-tac/4">Xem</Link>
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
