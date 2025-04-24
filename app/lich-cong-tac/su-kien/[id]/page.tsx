"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default function EventDetailPage({ params }: { params: { id: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)

  // Dữ liệu mẫu
  const event = {
    id: Number.parseInt(id),
    title: id === "1" ? "Họp giao ban đầu tuần" : id === "2" ? "Làm việc với Sở KH&ĐT" : "Kiểm tra tiến độ dự án",
    date: "24/04/2023",
    startTime: "08:00",
    endTime: "09:30",
    location: id === "1" ? "Phòng họp tầng 2" : id === "2" ? "Trụ sở Sở KH&ĐT" : "Hiện trường dự án",
    type: id === "1" ? "internal" : id === "2" ? "external" : "field",
    department: "Phòng Kế hoạch - Tài chính",
    schedule: "Lịch công tác tuần 18 (24/04 - 30/04/2023)",
    scheduleId: 1,
    participants: ["Trưởng phòng", "Phó phòng", "Các chuyên viên"],
    description:
      id === "1"
        ? "Họp giao ban đầu tuần để đánh giá kết quả công việc tuần trước và triển khai nhiệm vụ tuần này."
        : id === "2"
          ? "Làm việc với Sở KH&ĐT về việc triển khai các dự án đầu tư công năm 2023."
          : "Kiểm tra tiến độ thực hiện dự án XYZ tại hiện trường.",
    documents: [
      { name: "Báo cáo tuần trước.docx", size: "1.2MB" },
      { name: "Kế hoạch tuần này.xlsx", size: "0.8MB" },
    ],
    notes: "Chuẩn bị đầy đủ tài liệu và báo cáo trước khi tham dự cuộc họp.",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/lich-cong-tac">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chi tiết sự kiện</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{event.title}</CardTitle>
                {getEventTypeBadge(event.type)}
              </div>
              <CardDescription>
                Thuộc lịch:{" "}
                <Link href={`/lich-cong-tac/${event.scheduleId}`} className="hover:underline">
                  {event.schedule}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày</p>
                    <p>{event.date}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Thời gian</p>
                    <p>
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Địa điểm</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phòng ban</p>
                    <p>{event.department}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                <p className="mt-1">{event.description}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thành phần tham dự</p>
                <p className="mt-1">{event.participants.join(", ")}</p>
              </div>
              {event.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
                    <p className="mt-1">{event.notes}</p>
                  </div>
                </>
              )}
              {event.documents.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tài liệu đính kèm</p>
                    <div className="space-y-2">
                      {event.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Các sự kiện khác trong ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.id !== 1 && (
                  <div className="rounded-md border p-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Họp giao ban đầu tuần</p>
                      <Badge variant="outline">Nội bộ</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">08:00 - 09:30 • Phòng họp tầng 2</p>
                    <div className="mt-2 flex justify-end">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/lich-cong-tac/su-kien/1">Xem</Link>
                      </Button>
                    </div>
                  </div>
                )}
                {event.id !== 2 && (
                  <div className="rounded-md border p-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Làm việc với Sở KH&ĐT</p>
                      <Badge variant="secondary">Bên ngoài</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">14:00 - 16:30 • Trụ sở Sở KH&ĐT</p>
                    <div className="mt-2 flex justify-end">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/lich-cong-tac/su-kien/2">Xem</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thay đổi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm">Tạo sự kiện</p>
                    <p className="text-xs text-muted-foreground">Nguyễn Văn B • 20/04/2023 10:30</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm">Cập nhật thông tin</p>
                    <p className="text-xs text-muted-foreground">Nguyễn Văn B • 21/04/2023 09:15</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm">Thêm tài liệu đính kèm</p>
                    <p className="text-xs text-muted-foreground">Nguyễn Văn B • 22/04/2023 14:45</p>
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
