"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, Search, List, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import ScheduleWeekView from "@/components/schedule-week-view"
import ScheduleMonthView from "@/components/schedule-month-view"
import ScheduleList from "@/components/schedule-list"
import { schedulesAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useSchedules } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

export default function SchedulesPage() {
  const { toast } = useToast()
  const { schedules, loading, setSchedules, setLoading } = useSchedules()
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week")

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const data = await schedulesAPI.getAllSchedules()
        setSchedules(data)
      } catch (error) {
        console.error("Error fetching schedules:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải lịch công tác. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [toast, setSchedules, setLoading])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Dự thảo</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>
      case "approved":
        return <Badge variant="default">Đã duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lịch công tác</h1>
        <Button asChild>
          <Link href="/lich-cong-tac/tao-moi">
            <Plus className="mr-2 h-4 w-4" />
            Tạo lịch mới
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "week" ? "default" : "outline"} size="sm" onClick={() => setViewMode("week")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Tuần
          </Button>
          <Button variant={viewMode === "month" ? "default" : "outline"} size="sm" onClick={() => setViewMode("month")}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Tháng
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="mr-2 h-4 w-4" />
            Danh sách
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm lịch..."
              className="w-full bg-background pl-8 sm:w-[200px] md:w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            Lọc
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="draft">Dự thảo</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {loading ? (
            <ScheduleSkeleton viewMode={viewMode} />
          ) : schedules.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {viewMode === "week" && <ScheduleWeekView schedules={schedules} />}
                {viewMode === "month" && <ScheduleMonthView schedules={schedules} />}
                {viewMode === "list" && <ScheduleList schedules={schedules} />}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Chưa có lịch công tác nào</p>
              <Button asChild>
                <Link href="/lich-cong-tac/tao-moi">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo lịch mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          {loading ? (
            <ScheduleSkeleton viewMode={viewMode} />
          ) : (
            <Card>
              <CardContent className="p-0">
                {viewMode === "week" && (
                  <ScheduleWeekView schedules={schedules.filter((schedule) => schedule.status === "draft")} />
                )}
                {viewMode === "month" && (
                  <ScheduleMonthView schedules={schedules.filter((schedule) => schedule.status === "draft")} />
                )}
                {viewMode === "list" && (
                  <ScheduleList schedules={schedules.filter((schedule) => schedule.status === "draft")} />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Các tab khác tương tự */}
      </Tabs>
    </div>
  )
}

function ScheduleSkeleton({ viewMode }: { viewMode: "week" | "month" | "list" }) {
  return (
    <Card>
      <CardContent className="p-6">
        {viewMode === "list" ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : viewMode === "week" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-32 border rounded-md p-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array(35)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-24 border rounded-md p-1">
                    <Skeleton className="h-3 w-6 mb-1" />
                    {i % 5 === 0 && (
                      <>
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
