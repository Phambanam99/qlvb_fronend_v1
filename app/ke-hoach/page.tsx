"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Loader2, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { workPlansAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface WorkPlan {
  id: number | string
  title: string
  department: string
  startDate: string
  endDate: string
  status: string
}

export default function WorkPlansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchWorkPlans = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await workPlansAPI.getAllWorkPlans()
        
        if (response && response.workPlans) {
          setWorkPlans(response.workPlans.map((plan: any) => ({
            id: plan.id,
            title: plan.title,
            department: plan.department,
            startDate: new Date(plan.startDate).toLocaleDateString("vi-VN"),
            endDate: new Date(plan.endDate).toLocaleDateString("vi-VN"),
            status: plan.status,
          })))
        } else {
          throw new Error("Không thể tải dữ liệu kế hoạch")
        }
      } catch (error) {
        console.error("Error fetching work plans:", error)
        setError("Không thể tải dữ liệu kế hoạch. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu kế hoạch. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWorkPlans()
  }, [toast])

  // Lọc dữ liệu
  const filteredWorkPlans = workPlans.filter((plan) => {
    // Lọc theo tìm kiếm
    const matchesSearch =
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.department.toLowerCase().includes(searchQuery.toLowerCase())

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planned":
        return <Badge variant="outline">Kế hoạch</Badge>
      case "in_progress":
        return <Badge variant="secondary">Đang thực hiện</Badge>
      case "completed":
        return <Badge variant="success">Hoàn thành</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kế hoạch công tác</h1>
        <p className="text-muted-foreground">Quản lý các kế hoạch công tác của đơn vị</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <Input 
            placeholder="Tìm kiếm kế hoạch..." 
            className="w-full sm:w-[300px]" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="planned">Kế hoạch</SelectItem>
              <SelectItem value="in_progress">Đang thực hiện</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/ke-hoach/them-moi">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách kế hoạch công tác</CardTitle>
          <CardDescription>Danh sách các kế hoạch công tác của đơn vị</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên kế hoạch</TableHead>
                <TableHead className="hidden md:table-cell">Phòng ban</TableHead>
                <TableHead className="hidden md:table-cell">Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkPlans.length > 0 ? (
                filteredWorkPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{plan.department}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {plan.startDate} - {plan.endDate}
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/ke-hoach/${plan.id}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Không có kế hoạch nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
