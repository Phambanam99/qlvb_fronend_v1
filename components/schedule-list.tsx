"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin } from "lucide-react"

interface ScheduleListProps {
  date?: Date
  department?: string
  type?: string
}

export default function ScheduleList({ date = new Date(), department = "all", type = "all" }: ScheduleListProps) {
  const [events, setEvents] = useState<any[]>([])

  // Dữ liệu mẫu cho các sự kiện
  useEffect(() => {
    // Trong thực tế, sẽ fetch dữ liệu từ API dựa trên date, department và type
    const dayStr = date.toISOString().split("T")[0]

    const sampleEvents = [
      {
        id: 1,
        title: "Họp giao ban đầu tuần",
        date: "2023-04-24",
        startTime: "08:00",
        endTime: "09:30",
        location: "Phòng họp tầng 2",
        department: "khtc",
        type: "internal",
        participants: ["Thủ trưởng", "Trưởng các phòng"],
        description: "Họp giao ban đầu tuần để đánh giá kết quả công việc tuần trước và triển khai nhiệm vụ tuần này.",
      },
      {
        id: 2,
        title: "Làm việc với Sở KH&ĐT",
        date: "2023-04-24",
        startTime: "14:00",
        endTime: "16:30",
        location: "Trụ sở Sở KH&ĐT",
        department: "khtc",
        type: "external",
        participants: ["Thủ trưởng", "Trưởng phòng KH-TC"],
        description: "Làm việc với Sở KH&ĐT về việc triển khai các dự án đầu tư công năm 2023.",
      },
      {
        id: 3,
        title: "Hội nghị trực tuyến",
        date: "2023-04-25",
        startTime: "09:00",
        endTime: "11:30",
        location: "Phòng họp trực tuyến",
        department: "tchc",
        type: "online",
        participants: ["Thủ trưởng", "Trưởng các phòng"],
        description: "Hội nghị trực tuyến về công tác cải cách hành chính năm 2023.",
      },
    ]

    // Lọc sự kiện theo ngày, department và type
    let filteredEvents = sampleEvents.filter((event) => event.date === dayStr)

    if (department !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.department === department)
    }

    if (type !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.type === type)
    }

    // Sắp xếp theo thời gian bắt đầu
    filteredEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })

    setEvents(filteredEvents)
  }, [date, department, type])

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
      <h3 className="font-medium text-lg">Lịch công tác ngày {date.toLocaleDateString("vi-VN")}</h3>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-accent/30 rounded-lg">
          <p className="text-muted-foreground">Không có sự kiện nào trong ngày này</p>
          <Button className="mt-4 rounded-full" asChild>
            <Link href="/lich-cong-tac/tao-moi">Thêm sự kiện</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-all card-hover">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium bg-accent rounded-full w-14 h-14 flex items-center justify-center">
                      {event.startTime}
                    </div>
                    <div className="h-full w-px bg-border mt-1"></div>
                    <div className="text-sm font-medium bg-accent rounded-full w-14 h-14 flex items-center justify-center">
                      {event.endTime}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">{event.title}</h3>
                      {getEventTypeBadge(event.type)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 inline" /> {event.location}
                    </p>
                    <p className="text-sm mt-3">{event.description}</p>
                    <p className="text-sm mt-3">
                      <span className="text-muted-foreground">Thành phần: </span>
                      {event.participants.join(", ")}
                    </p>
                    <div className="flex justify-end mt-3">
                      <Button variant="ghost" size="sm" className="rounded-full hover:bg-accent" asChild>
                        <Link href={`/lich-cong-tac/su-kien/${event.id}`}>Chi tiết</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
