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
    console.log("Week View Schedules:", schedules); // Debug log

    // Skip if no schedules provided
    if (!schedules || schedules.length === 0) {
      setEvents([]);
      return;
    }

    // Use specific application date (May 17, 2025)
    const appDate = new Date(2025, 4, 17); // Month is 0-indexed (4 = May)
    const appDateStr = appDate.toISOString().split("T")[0];

    console.log("Application date:", appDateStr);

    // Find the day in the current week view that matches May 17
    const targetDay = weekDays.find(
      (day) =>
        day.getDate() === 17 &&
        day.getMonth() === 4 &&
        day.getFullYear() === 2025
    );

    // If we found the target day in the current week view, use its date string
    // Otherwise fall back to the app date
    const targetDateStr = targetDay
      ? targetDay.toISOString().split("T")[0]
      : appDateStr;

    console.log("Target display date:", targetDateStr);

    // Transform schedules into events format - place on the specific date
    let transformedEvents: any[] = [];

    schedules.forEach((schedule) => {
      transformedEvents.push({
        id: `${schedule.id}`,
        title: schedule.title,
        date: targetDateStr,
        startTime: "08:00",
        endTime: "17:00",
        location: schedule.department || "Không có địa điểm",
        department: schedule.department,
        type: "internal",
        description: schedule.description || "",
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

    setEvents(transformedEvents);
    console.log("Transformed Week Events:", transformedEvents); // Debug log
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
      <div className="space-y-6">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center p-2 rounded-md",
                isToday(day) ? "bg-primary/10 font-bold" : ""
              )}
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
            const dayEvents = getDayEvents(day);
            return (
              <div
                key={index}
                className="min-h-[200px] border rounded-lg p-2 bg-card/50 hover:bg-card transition-colors"
              >
                {dayEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Không có lịch
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                          <Card className="overflow-hidden shadow-sm hover:shadow transition-shadow">
                            <CardContent className="p-2">
                              <div className="text-xs font-medium text-primary">
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="text-sm font-medium truncate">
                                {event.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {event.location}
                              </div>
                              <div className="mt-1 flex justify-between items-center">
                                {getEventTypeBadge(event.type)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 rounded-full"
                                  asChild
                                >
                                  <Link
                                    href={`/lich-cong-tac/su-kien/${event.id}`}
                                  >
                                    Chi tiết
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm font-medium">
                            {event.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.description}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
