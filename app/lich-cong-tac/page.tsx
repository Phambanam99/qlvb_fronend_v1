"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import Link from "next/link"
import ScheduleWeekView from "@/components/schedule-week-view"
import ScheduleMonthView from "@/components/schedule-month-view"
import ScheduleList from "@/components/schedule-list"

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [department, setDepartment] = useState<string>("all")
  const [scheduleType, setScheduleType] = useState<string>("all")

  // Dữ liệu mẫu cho phòng ban
  const departments = [
    { id: "all", name: "Tất cả phòng ban" },
    { id: "khtc", name: "Phòng Kế hoạch - Tài chính" },
    { id: "tchc", name: "Phòng Tổ chức - Hành chính" },
    { id: "cntt", name: "Phòng Công nghệ thông tin" },
  ]

  // Dữ liệu mẫu cho loại lịch
  const scheduleTypes = [
    { id: "all", name: "Tất cả" },
    { id: "internal", name: "Nội bộ" },
    { id: "external", name: "Bên ngoài" },
    { id: "online", name: "Trực tuyến" },
    { id: "field", name: "Hiện trường" },
  ]

  // Dữ liệu mẫu cho lịch cần duyệt
  const pendingSchedules = [
    {
      id: 1,
      title: "Lịch công tác tuần 18 (24/04 - 30/04/2023)",
      department: "Phòng Kế hoạch - Tài chính",
      creator: "Nguyễn Văn B",
      createdAt: "20/04/2023",
      period: "Tuần",
      status: "pending",
    },
    {
      id: 2,
      title: "Lịch công tác tuần 19 (01/05 - 07/05/2023)",
      department: "Phòng Tổ chức - Hành chính",
      creator: "Trần Thị C",
      createdAt: "27/04/2023",
      period: "Tuần",
      status: "pending",
    },
  ]

  // Dữ liệu mẫu cho lịch đã duyệt gần đây
  const recentSchedules = [
    {
      id: 3,
      title: "Lịch công tác tuần 17 (17/04 - 23/04/2023)",
      department: "Phòng Kế hoạch - Tài chính",
      creator: "Nguyễn Văn B",
      createdAt: "13/04/2023",
      period: "Tuần",
      status: "approved",
    },
    {
      id: 4,
      title: "Lịch công tác tháng 4/2023",
      department: "Ban Giám đốc",
      creator: "Lê Thị D",
      createdAt: "28/03/2023",
      period: "Tháng",
      status: "approved",
    },
  ]

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

  // Giả định vai trò người dùng là cán bộ phụ trách phòng (có quyền duyệt lịch)
  const userRole = "department_head" // Có thể là: "staff", "department_head", "deputy", "manager"
  const canApproveSchedules = ["department_head", "manager"].includes(userRole)

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Lịch công tác</h1>
        <p className="text-muted-foreground">Quản lý lịch công tác của đơn vị</p>
      </div>

      <Tabs defaultValue="view" className="space-y-8">
        <TabsList className="bg-card border p-1 rounded-full w-auto inline-flex">
          <TabsTrigger
            value="view"
            className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Xem lịch
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Quản lý lịch
          </TabsTrigger>
          {canApproveSchedules && (
            <TabsTrigger
              value="approve"
              className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Duyệt lịch
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  const newDate = new Date(date!)
                  newDate.setDate(newDate.getDate() - (view === "day" ? 1 : view === "week" ? 7 : 30))
                  setDate(newDate)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  const newDate = new Date(date!)
                  newDate.setDate(newDate.getDate() + (view === "day" ? 1 : view === "week" ? 7 : 30))
                  setDate(newDate)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setDate(new Date())}>
                Hôm nay
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={view} onValueChange={(value) => setView(value as "day" | "week" | "month")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chế độ xem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                </SelectContent>
              </Select>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Loại lịch" />
                </SelectTrigger>
                <SelectContent>
                  {scheduleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="rounded-full">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Lịch</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date("2023-01-01")}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-5">
              <CardHeader>
                <CardTitle>
                  {view === "day"
                    ? `Lịch ngày ${date?.toLocaleDateString("vi-VN")}`
                    : view === "week"
                      ? "Lịch tuần"
                      : "Lịch tháng"}
                </CardTitle>
                <CardDescription>
                  {department !== "all"
                    ? `Lịch công tác của ${departments.find((d) => d.id === department)?.name}`
                    : "Lịch công tác của tất cả phòng ban"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {view === "day" && <ScheduleList date={date} department={department} type={scheduleType} />}
                {view === "week" && <ScheduleWeekView date={date} department={department} type={scheduleType} />}
                {view === "month" && <ScheduleMonthView date={date} department={department} type={scheduleType} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quản lý lịch công tác</h2>
            <Button asChild>
              <Link href="/lich-cong-tac/tao-moi">
                <Plus className="mr-2 h-4 w-4" /> Tạo lịch mới
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lịch công tác đã tạo</CardTitle>
                <CardDescription>Danh sách lịch công tác bạn đã tạo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...pendingSchedules, ...recentSchedules].map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <div className="font-medium">{schedule.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.department} • {schedule.period} • Tạo ngày {schedule.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(schedule.status)}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/lich-cong-tac/${schedule.id}`}>Chi tiết</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mẫu lịch công tác</CardTitle>
                <CardDescription>Các mẫu lịch công tác có sẵn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="font-medium">Mẫu lịch công tác tuần</div>
                    <div className="text-sm text-muted-foreground">Mẫu lịch công tác tuần cho phòng ban</div>
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/lich-cong-tac/tao-moi?template=week">Sử dụng mẫu</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="font-medium">Mẫu lịch công tác tháng</div>
                    <div className="text-sm text-muted-foreground">Mẫu lịch công tác tháng cho phòng ban</div>
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/lich-cong-tac/tao-moi?template=month">Sử dụng mẫu</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="font-medium">Mẫu lịch họp giao ban</div>
                    <div className="text-sm text-muted-foreground">Mẫu lịch họp giao ban định kỳ</div>
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/lich-cong-tac/tao-moi?template=meeting">Sử dụng mẫu</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canApproveSchedules && (
          <TabsContent value="approve" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Duyệt lịch công tác</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lịch công tác chờ duyệt</CardTitle>
                <CardDescription>Danh sách lịch công tác cần được phê duyệt</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSchedules.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Không có lịch công tác nào chờ duyệt</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSchedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                          <div className="font-medium">{schedule.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.department} • Người tạo: {schedule.creator} • Ngày tạo: {schedule.createdAt}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/lich-cong-tac/${schedule.id}/duyet`}>Xem xét</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lịch công tác đã duyệt gần đây</CardTitle>
                <CardDescription>Danh sách lịch công tác đã được phê duyệt gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <div className="font-medium">{schedule.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.department} • Người tạo: {schedule.creator} • Ngày tạo: {schedule.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(schedule.status)}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/lich-cong-tac/${schedule.id}`}>Chi tiết</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
