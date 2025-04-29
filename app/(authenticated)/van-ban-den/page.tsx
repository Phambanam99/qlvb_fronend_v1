"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getStatusByCode, incomingDocumentsAPI, Status,getAllStatuses } from "@/lib/api/incomingDocuments"
import { useToast } from "@/components/ui/use-toast"
import { useIncomingDocuments } from "@/lib/store"



export default function IncomingDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()
  const { incomingDocuments, loading, setIncomingDocuments, setLoading } = useIncomingDocuments()
  const statuses = getAllStatuses(); 
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const response = await incomingDocumentsAPI.getAllDocuments()
        console.log("response", response)
        if (response && response.documents) {
          setIncomingDocuments(
            response.documents.map((doc) => ({
              id: doc.id,
              number: doc.documentNumber,
              title: doc.title,
              receivedDate: new Date(doc.receivedDate),
              sender: doc.issuingAuthority,
              status: doc.processingStatus,
              displayStatus: doc.displayStatus,
              issuedDate: doc.receivedDate,
              type: doc.documentType || "",
              priority: doc.urgencyLevel || "normal",
            })),
          )
        } else {
          throw new Error("Không thể tải dữ liệu văn bản đến")
        }
      } catch (error) {
        console.error("Error fetching incoming documents:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu văn bản đến. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [toast, setIncomingDocuments, setLoading])

  // Lọc dữ liệu
  const filteredDocuments = incomingDocuments.filter((doc) => {
    // Lọc theo tìm kiếm
   // Lọc theo tìm kiếm
const matchesSearch = searchQuery === '' || (
  (doc.number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
  (doc.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
  (doc.sender?.toLowerCase() || '').includes(searchQuery.toLowerCase())
);
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string, displayStatus: string) => {
        return <Badge variant={status}>{displayStatus}</Badge>
    
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

  if (incomingDocuments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-amber-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Không có văn bản nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">Chưa có văn bản đến nào trong hệ thống</p>
          <Button asChild className="mt-4">
            <Link href="/van-ban-den/them-moi">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Văn bản đến</h1>
        <p className="text-muted-foreground">Quản lý và xử lý các văn bản đến</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm văn bản..."
              className="pl-10 w-full border-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {statuses.map(status => (
              <SelectItem key={status.code} value={status.code}>
                {status.displayName}
              </SelectItem>
               ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/van-ban-den/them-moi" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Danh sách văn bản đến</CardTitle>
          <CardDescription>Danh sách các văn bản đến đã được tiếp nhận</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/50">
              <TableRow>
                <TableHead>Số văn bản</TableHead>
                <TableHead className="hidden md:table-cell">Ngày nhận</TableHead>
                <TableHead>Trích yếu</TableHead>
                <TableHead className="hidden md:table-cell">Đơn vị gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium">{doc.number}</TableCell>
                    <TableCell className="hidden md:table-cell">{doc.receivedDate.toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{doc.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{doc.sender}</TableCell>
                    <TableCell>{getStatusBadge(doc.status, getStatusByCode(doc.status)?.displayName!)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary" asChild>
                        <Link href={`/van-ban-den/${doc.id}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không có văn bản nào phù hợp với điều kiện tìm kiếm
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
