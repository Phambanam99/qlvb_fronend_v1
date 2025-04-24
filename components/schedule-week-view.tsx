"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ScheduleWeekViewProps {
  date?: Date
  department?: string
  type?: string
}

export default function ScheduleWeekView({
  date = new Date(),
  department = "all",
  type = "all",
}: ScheduleWeekViewProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [events, setEvents] = useState<any[]>([])

  // Tính toán các ngày trong tuần
  useEffect(() => {
    const days = []
    const currentDate = new Date(date)
    const day = currentDate.getDay() || 7 // Chuyển 0 (Chủ nhật) thành 7
    const diff = currentDate.getDate() - day + 1 // Điều chỉnh về ngày đầu tuần (thứ 2)

    const firstDayOfWeek = new Date(currentDate.setDate(diff))

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(firstDayOfWeek)
      nextDay.setDate(firstDayOfWeek.getDate() + i)
      days.push(nextDay)
    }

    setWeekDays(days)
  }, [date])

  // Dữ liệu mẫu cho các sự kiện
  useEffect(() => {
    // Trong thực tế, sẽ fetch dữ liệu từ API dựa trên weekDays, department và type
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
      },
      {
        id: 4,
        title: "Kiểm tra tiến độ dự án",
        date: "2023-04-26",
        startTime: "08:30",
        endTime: "11:30",
        location: "Hiện trường dự án",
        department: "khtc",
        type: "field",
      },
      {
        id: 5,
        title: "Họp Ban Chỉ đạo",
        date: "2023-04-27",
        startTime: "14:00",
        endTime: "16:00",
        location: "Phòng họp tầng 3",
        department: "tchc",
        type: "internal",
      },
      {
        id: 6,
        title: "Đào tạo nghiệp vụ",
        date: "2023-04-28",
        startTime: "09:00",
        endTime: "11:00",
        location: "Phòng họp tầng 2",
        department: "cntt",
        type: "internal",
      },
    ]

    // Lọc sự kiện theo department và type
    let filteredEvents = [...sampleEvents]

    if (department !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.department === department)
    }

    if (type !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.type === type)
    }

    setEvents(filteredEvents)
  }, [department, type, weekDays])

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

  const getDayEvents = (day: Date) => {
    const dayStr = day.toISOString().split("T")[0]
    return events.filter((event) => event.date === dayStr)
  }

  const isToday = (day: Date) => {
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={cn("flex flex-col items-center p-2 rounded-md", isToday(day) ? "bg-primary/10 font-bold" : "")}
          >
            <div className="text-sm font-medium">{dayNames[index]}</div>
            <div className="text-sm">
              {day.getDate()}/{day.getMonth() + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayEvents = getDayEvents(day)
          return (
            <div key={index} className="min-h-[200px] border rounded-lg p-2 bg-card/50 hover:bg-card transition-colors">
              {dayEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Không có lịch
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden shadow-sm hover:shadow transition-shadow">
                      <CardContent className="p-2">
                        <div className="text-xs font-medium text-primary">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="text-sm font-medium truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{event.location}</div>
                        <div className="mt-1 flex justify-between items-center">
                          {getEventTypeBadge(event.type)}
                          <Button variant="ghost" size="sm" className="h-6 px-2 rounded-full" asChild>
                            <Link href={`/lich-cong-tac/su-kien/${event.id}`}>Chi tiết</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
