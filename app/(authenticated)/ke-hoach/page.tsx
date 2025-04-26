"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { workPlansAPI } from "@/lib/api/workPlans"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { WorkPlanDTO } from "@/lib/api/workPlans"

export default function WorkPlansPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [workPlans, setWorkPlans] = useState<WorkPlanDTO[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }

    fetchDepartments()
  }, [])

  useEffect(() => {
    const fetchWorkPlans = async () => {
      try {
        setIsLoading(true)
        const data = await workPlansAPI.getAllWorkPlans({
          status: statusFilter !== "all" ? statusFilter : undefined,
          department: departmentFilter !== "all" ? departmentFilter : undefined,
          search: searchQuery || undefined,
        })
        setWorkPlans(data)
      } catch (error) {
        console.error("Error fetching work plans:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách kế hoạch. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search query
    const handler = setTimeout(() => {
      fetchWorkPlans()
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [toast, searchQuery, statusFilter, departmentFilter])

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
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Đang thực hiện
          </Badge>
        )
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  const filteredWorkPlans = workPlans.filter((plan) => {
    // Đã được lọc từ API, nhưng có thể thêm lọc client-side nếu cần
    return true
  })

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm kế hoạch..."
            className="w-full bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Dự thảo</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng ban</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {isLoading ? (
            <WorkPlansSkeleton />
          ) : filteredWorkPlans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkPlans.map((workPlan) => (
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
                        <p>{new Date(workPlan.startDate).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kết thúc</p>
                        <p>{new Date(workPlan.endDate).toLocaleDateString("vi-VN")}</p>
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
              <p className="text-muted-foreground mb-4">Không tìm thấy kế hoạch nào phù hợp</p>
              <Button asChild>
                <Link href="/ke-hoach/tao-moi">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo kế hoạch mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        {/* Các tab khác tương tự, nhưng lọc theo trạng thái */}
        <TabsContent value="draft" className="mt-4">
          {isLoading ? (
            <WorkPlansSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkPlans
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
                          <p>{new Date(workPlan.startDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Kết thúc</p>
                          <p>{new Date(workPlan.endDate).toLocaleDateString("vi-VN")}</p>
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
