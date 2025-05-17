"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface ScheduleListProps {
  date?: Date;
  department?: string;
  type?: string;
  schedules?: any[]; // Make schedules optional
}

export default function ScheduleList({
  date = new Date(),
  department = "all",
  type = "all",
  schedules = [], // Provide default empty array
}: ScheduleListProps) {
  const [events, setEvents] = useState<any[]>([]);

  // Prepare events based on provided schedules
  useEffect(() => {
    console.log("List View Schedules:", schedules); // Debug log

    // Skip if no schedules provided
    if (!schedules || schedules.length === 0) {
      setEvents([]);
      return;
    }

    const dayStr = date.toISOString().split("T")[0];

    // Transform schedules into events format without depending on schedule.items
    let transformedEvents: any[] = [];

    schedules.forEach((schedule) => {
      // We'll show this schedule for today's date
      transformedEvents.push({
        id: schedule.id,
        title: schedule.title,
        date: dayStr,
        startTime: "08:00",
        endTime: "17:00",
        location: schedule.department || "Không có địa điểm",
        department: schedule.department,
        type: "internal",
        description: schedule.description || "Không có mô tả",
        participants: ["Không có thông tin"],
        scheduleId: schedule.id,
        status: schedule.status,
      });
    });

    // Filter events by department if needed
    if (department !== "all") {
      transformedEvents = transformedEvents.filter(
        (event) =>
          event.department &&
          event.department.toLowerCase() === department.toLowerCase()
      );
    }

    // Sắp xếp theo thời gian bắt đầu
    transformedEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    setEvents(transformedEvents);
    console.log("Transformed List Events:", transformedEvents); // Debug log
  }, [schedules, date, department, type]);

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "internal":
        return <Badge variant="outline">Nội bộ</Badge>;
      case "external":
        return <Badge variant="secondary">Bên ngoài</Badge>;
      case "online":
        return <Badge variant="default">Trực tuyến</Badge>;
      case "field":
        return <Badge variant="destructive">Hiện trường</Badge>;
      default:
        return <Badge variant="outline">Khác</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">
        Lịch công tác ngày {date.toLocaleDateString("vi-VN")}
      </h3>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-accent/30 rounded-lg">
          <p className="text-muted-foreground">
            Không có sự kiện nào trong ngày này
          </p>
          <Button className="mt-4 rounded-full" asChild>
            <Link href="/lich-cong-tac/tao-moi">Thêm sự kiện</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-md transition-all card-hover"
            >
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
                      <MapPin className="h-3.5 w-3.5 mr-1 inline" />{" "}
                      {event.location}
                    </p>
                    <p className="text-sm mt-3">{event.description}</p>
                    <p className="text-sm mt-3">
                      <span className="text-muted-foreground">
                        Thành phần:{" "}
                      </span>
                      {event.participants.join(", ")}
                    </p>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-accent"
                        asChild
                      >
                        <Link href={`/lich-cong-tac/su-kien/${event.id}`}>
                          Chi tiết
                        </Link>
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
  );
}
