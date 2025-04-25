"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { workPlansAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useWorkPlans } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkPlansPage() {
  const { toast } = useToast()
  const { workPlans, loading, setWorkPlans, setLoading } = useWorkPlans()

  useEffect(() => {
    const fetchWorkPlans = async () => {
      try {
        setLoading(true)
        const data = await workPlansAPI.getAllWorkPlans()
        setWorkPlans(data)
      } catch (error) {
        console.error("Error fetching work plans:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách kế hoạch. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWorkPlans()
  }, [toast, setWorkPlans, setLoading])

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
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Hoàn thành</Badge>
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Kế hoạch công tác</h1>
        <Button asChild>
          <Link href="/ke-hoach/tao-moi">
            <Plus className="mr-2 h-4 w-4" />
            Tạo kế hoạch mới
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm kiếm kế hoạch..." className="w-full bg-background pl-8" />
        </div>
        <Button variant="outline">Lọc</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="draft">Dự thảo</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {loading ? (
            <WorkPlansSkeleton />
          ) : workPlans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workPlans.map((workPlan) => (
                <Card key={workPlan.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{workPlan.title}</CardTitle>
                        <CardDescription>{workPlan.department}</CardDescription>
                      </div>
                      {getStatusBadge(workPlan.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Bắt đầu</p>
                        <p>{workPlan.startDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kết thúc</p>
                        <p>{workPlan.endDate}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/ke-hoach/${workPlan.id}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Chưa có kế hoạch nào</p>
              <Button asChild>
                <Link href="/ke-hoach/tao-moi">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo kế hoạch mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          {loading ? (
            <WorkPlansSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workPlans
                .filter((workPlan) => workPlan.status === "draft")
                .map((workPlan) => (
                  <Card key={workPlan.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="line-clamp-1">{workPlan.title}</CardTitle>
                          <CardDescription>{workPlan.department}</CardDescription>
                        </div>
                        {getStatusBadge(workPlan.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bắt đầu</p>
                          <p>{workPlan.startDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Kết thúc</p>
                          <p>{workPlan.endDate}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/ke-hoach/${workPlan.id}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        {/* Các tab khác tương tự */}
      </Tabs>
    </div>
  )
}

function WorkPlansSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
