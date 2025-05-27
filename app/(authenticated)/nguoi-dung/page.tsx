"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, UserCog } from "lucide-react";
import { UserDTO, usersAPI } from "@/lib/api/users";
import { rolesAPI } from "@/lib/api/roles";
import { departmentsAPI } from "@/lib/api/departments";
import { useToast } from "@/components/ui/use-toast";
import { PageResponse, DepartmentDTO } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  DEPARTMENT_MANAGEMENT_ROLES,
  SYSTEM_ROLES,
  hasRoleInGroup,
} from "@/lib/role-utils";

export default function UsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<PageResponse<DepartmentDTO>>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user, hasRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get current user's roles and department
        const userRoles = user?.roles || [];
        const userDepartmentId = user?.departmentId;

        // Check if user is an admin or leadership (can see all users)
        const isAdmin = hasRoleInGroup(userRoles, SYSTEM_ROLES);
        const isLeadership = hasRoleInGroup(userRoles, [
          "ROLE_CUC_TRUONG",
          "ROLE_CUC_PHO",
          "ROLE_CHINH_UY",
          "ROLE_PHO_CHINH_UY",
        ]);
        const isDepartmentHead = hasRoleInGroup(userRoles, [
          "ROLE_TRUONG_PHONG",
          "ROLE_PHO_PHONG",
          "ROLE_TRUONG_BAN",
          "ROLE_PHO_BAN",
        ]);

        // If department head, pre-filter to show only their department
        if (isDepartmentHead && !isAdmin && !isLeadership && userDepartmentId) {
          setDepartmentFilter(String(userDepartmentId));
        }

        // Fetch data based on access level
        let usersData: UserDTO[];

        if (isAdmin || isLeadership) {
          // Admin and leadership see all users
          usersData = await usersAPI.getAllUsers();
        } else if (isDepartmentHead && userDepartmentId) {
          // Department heads only see users in their department
          usersData = await usersAPI.getUsersByDepartmentId(userDepartmentId);
        } else {
          // Regular users can only see themselves
          usersData = user ? [user as UserDTO] : [];
        }

        const [rolesData, departmentsData] = await Promise.all([
          rolesAPI.getAllRoles(),
          departmentsAPI.getAllDepartments(),
        ]);

        setUsers(usersData);
        setRoles(rolesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description:
            "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.roleId === Number(roleFilter);
    const matchesDepartment =
      departmentFilter === "all" ||
      user.departmentId === Number(departmentFilter);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.status === 1) ||
      (statusFilter === "inactive" && user.status !== 1);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "Không xác định";
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments?.content.find(
      (d) => d.id === Number(departmentId)
    );
    return department ? department.name : "Không xác định";
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>

        {/* Only show Add User button for admins, leadership, and department heads */}
        {hasRoleInGroup(user?.roles || [], [
          ...SYSTEM_ROLES,
          ...DEPARTMENT_MANAGEMENT_ROLES,
        ]) && (
          <Link href="/nguoi-dung/them-moi">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Lọc danh sách người dùng theo các tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vai trò</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phòng ban</label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departments?.content.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={String(department.id)}
                    >
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Đã vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Tổng số: {filteredUsers.length} người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>

                  <TableHead>Vai trò</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>

                      <TableCell>{user.roleDisplayNames[0]}</TableCell>
                      <TableCell>
                        {getDepartmentName(user.departmentId)}
                      </TableCell>
                      <TableCell>
                        {user.status === 1 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            Đang hoạt động
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700"
                          >
                            Đã vô hiệu hóa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/nguoi-dung/${user.id}`}>
                          <Button variant="ghost" size="icon">
                            <UserCog className="h-4 w-4" />
                            <span className="sr-only">Xem chi tiết</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
