"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Calendar, ClipboardList, Send, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { incomingDocumentsAPI, outgoingDocumentsAPI, workPlansAPI, schedulesAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface DashboardStats {
  incomingDocuments: {
    total: number
    pending: number
  }
  outgoingDocuments: {
    total: number
    pending: number
  }
  workPlans: {
    total: number
    active: number
  }
  schedules: {
    total: number
    today: number
  }
}

interface RecentDocument {
  id: number | string
  number: string
  title: string
}

interface ScheduleEvent {
  id: number | string
  title: string
  time: string
  location: string
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    incomingDocuments: { total: 0, pending: 0 },
    outgoingDocuments: { total: 0, pending: 0 },
    workPlans: { total: 0, active: 0 },
    schedules: { total: 0, today: 0 },
  })
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([])
  const [todayEvents, setTodayEvents] = useState<ScheduleEvent[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch incoming documents
        const incomingDocsResponse = await incomingDocumentsAPI.getAllDocuments()
        console.log("Incoming documents response:", incomingDocsResponse)
        const pendingIncomingDocs = incomingDocsResponse.documents.filter(
          (doc: any) => doc.status === "pending" || doc.status === "processing",
        )

        // Fetch outgoing documents
        const outgoingDocsResponse = await outgoingDocumentsAPI.getAllDocuments()
        const pendingOutgoingDocs = outgoingDocsResponse.documents.filter(
          (doc: any) => doc.status === "pending_approval" || doc.status === "draft",
        )

        // Fetch work plans
        const workPlansResponse = await workPlansAPI.getAllWorkPlans()
        const activeWorkPlans = workPlansResponse.workPlans.filter((plan: any) => plan.status === "in_progress")

        // Fetch schedules
        const today = new Date()
        const todayStr = today.toISOString().split("T")[0]
        const schedulesResponse = await schedulesAPI.getScheduleEvents({
          startDate: todayStr,
          endDate: todayStr,
        })

        // Update stats
        setStats({
          incomingDocuments: {
            total: incomingDocsResponse.documents.length,
            pending: pendingIncomingDocs.length,
          },
          outgoingDocuments: {
            total: outgoingDocsResponse.documents.length,
            pending: pendingOutgoingDocs.length,
          },
          workPlans: {
            total: workPlansResponse.workPlans.length,
            active: activeWorkPlans.length,
          },
          schedules: {
            total: schedulesResponse.events ? schedulesResponse.events.length : 0,
            today: schedulesResponse.events ? schedulesResponse.events.length : 0,
          },
        })

        // Set recent documents
        setRecentDocuments(
          pendingIncomingDocs.slice(0, 3).map((doc: any) => ({
            id: doc.id,
            number: doc.number,
            title: doc.title,
          })),
        )

        // Set today's events
        if (schedulesResponse.events && schedulesResponse.events.length > 0) {
          setTodayEvents(
            schedulesResponse.events.slice(0, 2).map((event: any) => ({
              id: event.id,
              title: event.title,
              time: new Date(event.startTime || event.date).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              location: event.location,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Đã xảy ra lỗi</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">Quản lý văn bản và công tác của đơn vị</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Văn bản đến</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.incomingDocuments.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.incomingDocuments.pending} văn bản chưa xử lý</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Văn bản đi</CardTitle>
            <Send className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outgoingDocuments.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.outgoingDocuments.pending} văn bản chờ duyệt</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kế hoạch</CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workPlans.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.workPlans.active} kế hoạch đang thực hiện</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch công tác</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schedules.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.schedules.today} lịch công tác hôm nay</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Văn bản cần xử lý</CardTitle>
            <CardDescription>Danh sách văn bản đến cần được xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-6">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{doc.number}</p>
                      <p className="text-sm text-muted-foreground mt-1">{doc.title}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full" asChild>
                      <Link href={`/van-ban-den/${doc.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không có văn bản nào cần xử lý</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lịch công tác hôm nay</CardTitle>
            <CardDescription>Các sự kiện trong ngày</CardDescription>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-6">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 border-b pb-4">
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium bg-accent rounded-full w-12 h-12 flex items-center justify-center">
                        {event.time}
                      </div>
                      <div className="h-full w-px bg-border mt-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không có sự kiện nào hôm nay</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
