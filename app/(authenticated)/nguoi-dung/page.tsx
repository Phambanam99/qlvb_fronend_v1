"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useUsers } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersPage() {
  const { toast } = useToast()
  const { users, loading, setUsers, setLoading } = useUsers()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await usersAPI.getAllUsers()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast, setUsers, setLoading])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Quản trị viên</Badge>
      case "manager":
        return <Badge variant="secondary">Lãnh đạo</Badge>
      case "department_head":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Trưởng phòng</Badge>
      case "staff":
        return <Badge variant="outline">Nhân viên</Badge>
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
        <Button asChild>
          <Link href="/nguoi-dung/them-moi">
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng mới
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm kiếm người dùng..." className="w-full bg-background pl-8" />
        </div>
        <Button variant="outline">Lọc</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="admin">Quản trị viên</TabsTrigger>
          <TabsTrigger value="manager">Lãnh đạo</TabsTrigger>
          <TabsTrigger value="department_head">Trưởng phòng</TabsTrigger>
          <TabsTrigger value="staff">Nhân viên</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {loading ? (
            <UsersSkeleton />
          ) : users.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${getInitials(user.fullName)}`} />
                          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{user.fullName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{user.department}</p>
                        </div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/nguoi-dung/${user.id}`}>Xem chi tiết</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Chưa có người dùng nào</p>
              <Button asChild>
                <Link href="/nguoi-dung/them-moi">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm người dùng mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="admin" className="mt-4">
          {loading ? (
            <UsersSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users
                .filter((user) => user.role === "admin")
                .map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&text=${getInitials(user.fullName)}`}
                            />
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{user.fullName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{user.department}</p>
                          </div>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/nguoi-dung/${user.id}`}>Xem chi tiết</Link>
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

function UsersSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
