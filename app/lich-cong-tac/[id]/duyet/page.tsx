"use client"

import { use } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, X } from "lucide-react"
import Link from "next/link"
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

export default function ApproveSchedulePage({ params }: { params: { id: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)

  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dữ liệu mẫu
  const schedule = {
    id: Number.parseInt(id),
    title: `Lịch công tác tuần ${Number.parseInt(id) + 17} (24/04 - 30/04/2023)`,
    department: "Phòng Kế hoạch - Tài chính",
    creator: "Nguyễn Văn B",
    createdAt: "20/04/2023",
    period: "Tuần",
    status: "pending",
    description: "Lịch công tác tuần của Phòng Kế hoạch - Tài chính",
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

  const handleApprove = async () => {
    setIsSubmitting(true)
    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert("Đã phê duyệt lịch công tác thành công!")
    // Trong thực tế sẽ chuyển hướng đến trang danh sách
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert("Đã từ chối lịch công tác thành công!")
    // Trong thực tế sẽ chuyển hướng đến trang danh sách
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href="/lich-cong-tac">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Duyệt lịch công tác</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-base">
          Chờ duyệt
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">{schedule.title}</CardTitle>
              <CardDescription>
                {schedule.department} • Người tạo: {schedule.creator} • Ngày tạo: {schedule.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                <p className="mt-2">{schedule.description}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Chi tiết lịch công tác</p>
                <Tabs defaultValue="list" className="mt-2">
                  <TabsList className="bg-card border p-1 rounded-full w-auto inline-flex">
                    <TabsTrigger
                      value="list"
                      className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Danh sách
                    </TabsTrigger>
                    <TabsTrigger
                      value="calendar"
                      className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Lịch
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="list" className="space-y-4 mt-4">
                    {schedule.items.map((item) => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex flex-col items-center">
                              <div className="text-sm font-medium bg-accent rounded-full w-14 h-14 flex items-center justify-center">
                                {item.startTime}
                              </div>
                              <div className="h-full w-px bg-border mt-1"></div>
                              <div className="text-sm font-medium bg-accent rounded-full w-14 h-14 flex items-center justify-center">
                                {item.endTime}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg">{item.title}</h3>
                                {getEventTypeBadge(item.type)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.date} • {item.location}
                              </p>
                              <p className="text-sm mt-3">{item.description}</p>
                              <p className="text-sm mt-3">
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
                    <div className="p-8 text-center text-muted-foreground bg-accent/30 rounded-lg mt-4">
                      Xem lịch theo dạng lịch tuần/tháng
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Phê duyệt</CardTitle>
              <CardDescription>Phê duyệt hoặc từ chối lịch công tác</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Nhận xét</p>
                <Textarea
                  placeholder="Nhập nhận xét của bạn..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button className="w-full rounded-full" onClick={handleApprove} disabled={isSubmitting}>
                <Check className="mr-2 h-4 w-4" /> Phê duyệt
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full rounded-full">
                    <X className="mr-2 h-4 w-4" /> Từ chối
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn từ chối lịch công tác này? Vui lòng cung cấp lý do từ chối trong phần nhận
                      xét.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject} className="rounded-full">
                      Xác nhận từ chối
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin phê duyệt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người tạo</p>
                <p className="mt-1 font-medium">{schedule.creator}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
