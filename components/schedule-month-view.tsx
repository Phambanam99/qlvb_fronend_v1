"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ScheduleMonthViewProps {
  date?: Date
  department?: string
  type?: string
}

export default function ScheduleMonthView({
  date = new Date(),
  department = "all",
  type = "all",
}: ScheduleMonthViewProps) {
  const [monthDays, setMonthDays] = useState<(Date | null)[]>([])
  const [events, setEvents] = useState<any[]>([])

  // Tính toán các ngày trong tháng
  useEffect(() => {
    const days = []
    const currentDate = new Date(date)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1)
    // Ngày cuối cùng của tháng
    const lastDay = new Date(year, month + 1, 0)

    // Lấy thứ của ngày đầu tiên (0 = Chủ nhật, 1 = Thứ 2, ...)
    const firstDayOfWeek = firstDay.getDay() || 7 // Chuyển 0 (Chủ nhật) thành 7

    // Thêm các ô trống cho các ngày trước ngày đầu tiên của tháng
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Thêm các ngày trong tháng
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    setMonthDays(days)
  }, [date])

  // Dữ liệu mẫu cho các sự kiện
  useEffect(() => {
    // Trong thực tế, sẽ fetch dữ liệu từ API dựa trên tháng, department và type
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
  }, [department, type])

  const getDayEvents = (day: Date | null) => {
    if (!day) return []
    const dayStr = day.toISOString().split("T")[0]
    return events.filter((event) => event.date === dayStr)
  }

  const isToday = (day: Date | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((name, index) => (
          <div key={index} className="text-center font-medium p-2 text-muted-foreground">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day, index) => {
          const dayEvents = getDayEvents(day)
          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] border rounded-lg p-2 transition-colors",
                !day ? "bg-muted/30" : "bg-card/50 hover:bg-card",
                isToday(day) ? "bg-primary/10 font-bold ring-1 ring-primary/20" : "",
              )}
            >
              {day && (
                <>
                  <div className="text-right text-sm font-medium">{day.getDate()}</div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <Link
                        key={event.id}
                        href={`/lich-cong-tac/su-kien/${event.id}`}
                        className="block text-xs truncate hover:underline p-1 rounded bg-accent/50 hover:bg-accent transition-colors"
                      >
                        {event.startTime} {event.title}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-primary font-medium text-center">
                        +{dayEvents.length - 3} sự kiện khác
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
