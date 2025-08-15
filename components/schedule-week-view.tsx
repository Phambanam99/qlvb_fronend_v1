"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { constructFromSymbol } from "date-fns/constants";

interface ScheduleWeekViewProps {
  date?: Date;
  department?: string;
  type?: string;
  schedules?: any[]; // Make schedules optional
}

export default function ScheduleWeekView({
  date = new Date(),
  department = "all",
  type = "all",
  schedules = [], // Provide default empty array
}: ScheduleWeekViewProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Tính toán các ngày trong tuần
  useEffect(() => {
    const days = [];
    const currentDate = new Date(date);
    const day = currentDate.getDay() || 7; // Chuyển 0 (Chủ nhật) thành 7
    const diff = currentDate.getDate() - day + 1; // Điều chỉnh về ngày đầu tuần (thứ 2)

    const firstDayOfWeek = new Date(currentDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(firstDayOfWeek);
      nextDay.setDate(firstDayOfWeek.getDate() + i);
      days.push(nextDay);
    }

    setWeekDays(days);
  }, [date]);

  // Prepare events based on provided schedules
  useEffect(() => {
    // console.log("Week View Schedules:", schedules); // Debug log
    // console.log("Department filter (Week View):", department); // Debug log để kiểm tra giá trị department

    // Skip if no schedules provided
    if (!schedules || schedules.length === 0) {
      setEvents([]);
      return;
    }

    // Transform schedules into events format
    let transformedEvents: any[] = [];

    // Iterate through each schedule which contains multiple events
    schedules.forEach((schedule) => {
      // Skip if schedule has no events
      if (
        !schedule.events ||
        !Array.isArray(schedule.events) ||
        schedule.events.length === 0
      ) {
        return;
      }

      // Process each event in the schedule
      schedule.events.forEach((event) => {
        // Skip if event has no date
        if (!event.date) {
         
          return;
        }
        // console.log("Event Date:", event.date); // Debug log
        // Convert event date to Date object
        const eventDate = new Date(event.date);

        // Check if the date falls within current week view
        const isInCurrentWeek = weekDays.some((day) => {
          return (
            day.getDate() === eventDate.getDate() &&
            day.getMonth() === eventDate.getMonth() &&
            day.getFullYear() === eventDate.getFullYear()
          );
        });

        if (!isInCurrentWeek) return; // Skip if not in current week view

        // Format times from HH:MM:SS to HH:MM
        const startTime = event.startTime
          ? event.startTime.substring(0, 5)
          : "08:00";
        const endTime = event.endTime ? event.endTime.substring(0, 5) : "17:00";

        transformedEvents.push({
          id: event.id,
          scheduleId: schedule.id,
          title: event.title,
          date: event.date,
          startTime: startTime,
          endTime: endTime,
          location:
            event.location || schedule.departmentName || "Không có địa điểm",
          department: schedule.departmentName,
          departmentId: schedule.departmentId, // Thêm departmentId để lọc theo ID
          type: event.type || "internal",
          description: event.description || "",
          participants: event.participantNames || [],
          status: schedule.status,
        });
      });
    });

    // Filter events by department if needed
    if (department !== "all") {
      transformedEvents = transformedEvents.filter((event) => {
        // So sánh bằng ID thay vì tên phòng ban
        return (
          event.departmentId &&
          event.departmentId.toString() === department.toString()
        );
      });
    }

    setEvents(transformedEvents);
    // console.log("Transformed Week Events:", transformedEvents); // Debug log
  }, [schedules, date, department, type, weekDays]);

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

  const getDayEvents = (day: Date) => {
    const dayStr = day.toISOString().split("T")[0];
    return events.filter((event) => event.date === dayStr);
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {weekDays.map((day, index) => {
          const dayEvents = getDayEvents(day);
          const labelClasses = cn(
            "w-28 shrink-0 text-sm text-right pr-3",
            isToday(day) ? "font-bold text-primary" : "text-muted-foreground"
          );
          return (
            <div key={index} className="flex items-start gap-2">
              <div className={labelClasses}>
                <div>{dayNames[index]}</div>
                <div>
                  {day.getDate()}/{day.getMonth() + 1}
                </div>
              </div>
              <div className="flex-1">
                <div className={cn(
                  "border rounded-lg bg-card/50 hover:bg-card transition-colors",
                  "p-2"
                )}>
                  {dayEvents.length === 0 ? (
                    <div className="h-[52px] flex items-center text-sm text-muted-foreground">
                      Không có lịch
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 min-h-[52px]">
                        {dayEvents.map((event) => {
                          const participantNames: string[] = event.participants || [];
                          const shown = participantNames.slice(0, 2).join(", ");
                          const extra = participantNames.length - 2;
                          return (
                            <Tooltip key={event.id}>
                              <TooltipTrigger asChild>
                                <Card className="min-w-[240px] max-w-[320px] overflow-hidden shadow-sm hover:shadow transition-shadow">
                                  <CardContent className="p-2 space-y-1">
                                    <div className="text-xs font-medium text-primary">
                                      {event.startTime} - {event.endTime}
                                    </div>
                                    <div className="text-sm font-medium truncate">
                                      {event.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {event.location}
                                    </div>
                                    <div className="text-xs truncate">
                                      {participantNames.length > 0 ? (
                                        <span>
                                          {shown}
                                          {extra > 0 ? ` +${extra}` : ""}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">Không có người tham dự</span>
                                      )}
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                      {getEventTypeBadge(event.type)}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 rounded-full"
                                        asChild
                                      >
                                        <Link href={`/lich-cong-tac/su-kien/${event.id}`}>
                                          Chi tiết
                                        </Link>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm font-medium">{event.title}</div>
                                <div className="text-xs text-muted-foreground">{event.description}</div>
                                {participantNames.length > 0 && (
                                  <div className="mt-1 text-xs">
                                    Người tham dự: {participantNames.join(", ")}
                                  </div>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
