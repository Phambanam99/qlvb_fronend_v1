"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Calendar, ClipboardList, Send, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { dashboardAPI } from "@/lib/api"
import { incomingDocumentsAPI } from "@/lib/api"
import { schedulesAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useDashboard } from "@/lib/store"

export default function Home() {
  const { toast } = useToast()
  const {
    stats,
    recentDocuments,
    todayEvents,
    loading,
    error,
    setStats,
    setRecentDocuments,
    setTodayEvents,
    setLoading,
    setError,
  } = useDashboard()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard statistics
        const dashboardStats = await dashboardAPI.getDashboardStatistics()

        // Set stats from dashboard data
        setStats({
          incomingDocuments: {
            total: dashboardStats.incomingDocumentCount,
            pending: dashboardStats.pendingDocumentCount,
          },
          outgoingDocuments: {
            total: dashboardStats.outgoingDocumentCount,
            pending: 0, // This will need to be calculated from the data
          },
          workPlans: {
            total: dashboardStats.workCaseCount,
            active: 0, // This will need to be calculated from the data
          },
          schedules: {
            total: 0, // This will need to be calculated from the data
            today: 0, // This will need to be calculated from the data
          },
        })

        // Fetch recent documents
        const incomingDocs = await incomingDocumentsAPI.getAllDocuments()
        setRecentDocuments(
          incomingDocs.documents.slice(0, 3).map((doc) => ({
            id: doc.id,
            number: doc.documentNumber,
            title: doc.title,
          })),
        )

        // Fetch today's events
        const today = new Date().toISOString().split("T")[0]
        const events = await schedulesAPI.getScheduleEvents({ date: today })
        setTodayEvents(
          events.slice(0, 2).map((event) => ({
            id: event.id,
            title: event.title,
            time: event.startTime,
            location: event.location,
          })),
        )
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
  }, [toast, setStats, setRecentDocuments, setTodayEvents, setLoading, setError])

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
