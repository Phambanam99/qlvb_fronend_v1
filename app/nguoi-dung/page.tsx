"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { usersAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number | string
  name: string
  username: string
  email: string
  department: string
  position: string
  role: string
  status: string
  avatar: string
}

export default function UsersPage() {
  const { hasPermission } = useAuth()
  const { addNotification } = useNotifications()
  const { toast } = useToast()
  const [userToDelete, setUserToDelete] = useState<number | string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Thêm state để quản lý tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await usersAPI.getAllUsers()
        
        if (response && response.users) {
          setUsers(response.users.map((user: any) => ({
            id: user.id,
            name: user.fullName,
            username: user.username,
            email: user.email,
            department: user.department,
            position: user.position,
            role: user.role,
            status: user.status,
            avatar: getInitials(user.fullName),
          })))
        } else {
          throw new Error("Không thể tải dữ liệu người dùng")
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  // Hàm lấy chữ cái đầu của tên để hiển thị avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Thêm hàm lọc người dùng
  const filteredUsers = users.filter((user) => {
    // Lọc theo tìm kiếm
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Lọc theo vai trò
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    // Lọc theo phòng ban
    const matchesDepartment =
      departmentFilter === "all" ||
      (departmentFilter === "ban_giam_doc" && user.department === "Ban Giám đốc") ||
      (departmentFilter === "khtc" && user.department === "Phòng Kế hoạch - Tài chính") ||
      (departmentFilter === "tchc" && user.department === "Phòng Tổ chức - Hành chính") ||
      (departmentFilter === "cntt" && user.department === "Phòng Công nghệ thông tin") ||
      (departmentFilter === "van_thu" && user.department === "Văn thư")

    return matchesSearch && matchesRole && matchesDepartment
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Quản trị viên</Badge>
      case "manager":
        return <Badge className="bg-red-100 text-red-800">Thủ trưởng</Badge>
      case "department_head":
        return <Badge className="bg-blue-100 text-blue-800">Trưởng phòng</Badge>
      case "staff":
        return <Badge className="bg-green-100 text-green-800">Chuyên viên</Badge>
      case "clerk":
        return <Badge className="bg-amber-100 text-amber-800">Văn thư</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="bg-green-50 text-green-700">
            Hoạt động
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="border-gray-400 bg-gray-50 text-gray-700">
            Không hoạt động
          </Badge>
        )
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const handleDeleteUser = (userId: number | string) => {
    setUserToDelete(userId)
  }

  // Cập nhật hàm xóa người dùng
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await usersAPI.deleteUser(userToDelete.toString())
        
        // Cập nhật state sau khi xóa thành công
        setUsers(users.filter(user => user.id !== userToDelete))
        
        addNotification({
          title: "Xóa người dùng thành công",
          message: "Người dùng đã được xóa khỏi hệ thống.",
          type: "success",
        })
        
        toast({
          title: "Thành công",
          description: "Người dùng đã được xóa khỏi hệ thống.",
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Lỗi",
          description: "Không thể xóa người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setUserToDelete(null)
      }
    }
  }

  // Kiểm tra quyền hạn
  if (!hasPermission("manage_users")) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-amber-100 p-3">
          <UserPlus className="h-6 w-6 text-amber-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Không có quyền truy cập</h1>
        <p className="mb-4 max-w-md text-muted-foreground">
          Bạn không có quyền truy cập vào trang quản lý người dùng. Vui lòng liên hệ với quản trị viên để được cấp
          quyền.
        </p>
        <Button asChild>
          <Link href="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    )
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
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              className="pl-10 w-full border-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center space-x-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
              <SelectItem value="manager">Thủ trưởng</SelectItem>
              <SelectItem value="department_head">Trưởng phòng</SelectItem>
              <SelectItem value="staff">Chuyên viên</SelectItem>
              <SelectItem value="clerk">Văn thư</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              <SelectItem value="ban_giam_doc">Ban Giám đốc</SelectItem>
              <SelectItem value="khtc">Phòng Kế hoạch - Tài chính</SelectItem>
              <SelectItem value="tchc">Phòng Tổ chức - Hành chính</SelectItem>
              <SelectItem value="cntt">Phòng Công nghệ thông tin</SelectItem>
              <SelectItem value="van_thu">Văn thư</SelectItem>
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
            <Link href="/nguoi-dung/them-moi" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Quản lý tài khoản người dùng trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/50">
              <TableRow>
                <TableHead>Tên người dùng</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phòng ban</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-accent/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-xs text-primary">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.department}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/nguoi-dung/${user.id}`} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không có người dùng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={userToDelete !== null} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
