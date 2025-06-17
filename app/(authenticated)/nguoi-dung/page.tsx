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
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Plus,
  Search,
  UserCog,
} from "lucide-react";
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
  // User data states
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<PageResponse<DepartmentDTO>>();
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { toast } = useToast();
  const { user, hasRole } = useAuth();

  // Function to fetch users with pagination
  const fetchUsers = async (page: number, size: number, filters: any = {}) => {
    setLoading(true);

    try {
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
        "ROLE_CUM_TRUONG",
        "ROLE_PHO_CUM_TRUONG",
        "ROLE_CHINH_TRI_VIEN_CUM",
        "ROLE_PHO_TRAM_TRUONG",
        "ROLE_TRAM_TRUONG",
      ]);

      // Prepare filter parameters
      const params: any = {
        page,
        size,
        ...filters,
      };

      // Apply role filter if selected
      if (roleFilter !== "all") {
        params.roleId = roleFilter;
      }

      // Apply status filter if selected
      if (statusFilter !== "all") {
        params.status = statusFilter === "active" ? 1 : 0;
      }

      // Apply search term if provided
      if (searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }

      let usersData;

      if (isAdmin || isLeadership) {
        // Admin and leadership see all users with pagination
        // Apply department filter if selected
        if (departmentFilter !== "all") {
          params.departmentId = departmentFilter;
        }
        const usersData_ = await usersAPI.getPaginatedUsers(params);
        usersData = usersData_.data;
      } else if (isDepartmentHead && userDepartmentId) {
        // Department heads see users in their department and child departments
        let departmentIds = [Number(userDepartmentId)];

        try {
          // Get child departments
          const childDepartments_ = await departmentsAPI.getChildDepartments(
            userDepartmentId
          );
          const childDepartments = childDepartments_.data;
          if (Array.isArray(childDepartments) && childDepartments.length > 0) {
            const childDeptIds = childDepartments.map((dept) => dept.id);
            departmentIds.push(...childDeptIds);
          }
        } catch (error) {
          console.warn("Could not fetch child departments:", error);
          // Continue with just the current department
        }

        // If department filter is selected and it's within allowed departments, use it
        if (
          departmentFilter !== "all" &&
          departmentIds.includes(Number(departmentFilter))
        ) {
          params.departmentId = departmentFilter;
          const usersData_ = await usersAPI.getPaginatedUsers(params);
          usersData = usersData_.data;
        } else {
          // Otherwise, filter by all allowed departments
          // For API calls, we'll need to call multiple times or use a department list filter
          // For now, let's get all users and filter client-side
          const allUsersInDepartments = [];

          for (const deptId of departmentIds) {
            try {
              const deptParams = { ...params, departmentId: deptId };
              const deptUsers_ = await usersAPI.getPaginatedUsers(deptParams);
              const deptUsers = deptUsers_.data;
              allUsersInDepartments.push(...deptUsers.content);
            } catch (error) {
              console.warn(
                `Error fetching users for department ${deptId}:`,
                error
              );
            }
          }

          // Remove duplicates based on user ID
          const uniqueUsers = allUsersInDepartments.filter(
            (user, index, array) =>
              array.findIndex((u) => u.id === user.id) === index
          );

          // Apply pagination manually
          const startIndex = page * size;
          const endIndex = startIndex + size;
          const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);

          usersData = {
            content: paginatedUsers,
            totalElements: uniqueUsers.length,
            totalPages: Math.ceil(uniqueUsers.length / size),
            size,
            number: page,
          };
        }
      } else {
        // Regular users can only see themselves - no need for pagination here
        usersData = {
          content: user ? [user as UserDTO] : [],
          totalElements: user ? 1 : 0,
          totalPages: 1,
          size,
          number: 0,
        };
      }

      setUsers(usersData.content);
      setTotalUsers(usersData.totalElements);
      setTotalPages(usersData.totalPages);
    } catch (error) {
      console.error("Error fetching paginated users:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data: roles and departments
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [rolesData_, departmentsData_] = await Promise.all([
          rolesAPI.getAllRoles(),
          departmentsAPI.getAllDepartments(),
        ]);
        const rolesData = rolesData_.data;
        const departmentsData = departmentsData_.data;
        setRoles(rolesData);

        // Filter departments based on user permissions
        const userRoles = user?.roles || [];
        const userDepartmentId = user?.departmentId;

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
          "ROLE_CUM_TRUONG",
          "ROLE_PHO_CUM_TRUONG",
          "ROLE_CHINH_TRI_VIEN_CUM",
          "ROLE_PHO_TRAM_TRUONG",
          "ROLE_TRAM_TRUONG",
        ]);

        if (isAdmin || isLeadership) {
          // Admins and leadership see all departments
          setDepartments(departmentsData);
        } else if (isDepartmentHead && userDepartmentId) {
          // Department heads see their department and child departments
          let allowedDepartments = [];

          // Add current department
          const currentDept = departmentsData.content.find(
            (d) => d.id === Number(userDepartmentId)
          );
          if (currentDept) {
            allowedDepartments.push(currentDept);
          }

          try {
            // Add child departments
            const childDepartments_ = await departmentsAPI.getChildDepartments(
              userDepartmentId
            );
            const childDepartments = childDepartments_.data;
            if (
              Array.isArray(childDepartments) &&
              childDepartments.length > 0
            ) {
              allowedDepartments.push(...childDepartments);
            }
          } catch (error) {
            console.warn("Could not fetch child departments:", error);
          }

          // Update departments state with filtered list
          setDepartments({
            ...departmentsData,
            content: allowedDepartments,
            totalElements: allowedDepartments.length,
          });

          // Don't pre-select department filter for department heads anymore
          // Let them choose from their allowed departments
        } else {
          // Regular users see no department filter options (they can only see themselves)
          setDepartments({
            ...departmentsData,
            content: [],
            totalElements: 0,
          });
        }

        // Initial fetch of users
        fetchUsers(currentPage, itemsPerPage);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Refetch users when filters or pagination changes
  useEffect(() => {
    const filters = {
      roleId: roleFilter !== "all" ? roleFilter : undefined,
      departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
      status:
        statusFilter !== "all"
          ? statusFilter === "active"
            ? 1
            : 0
          : undefined,
      keyword: searchTerm.trim() || undefined,
    };

    // Use debounce for search term to prevent too many API calls
    const timer = setTimeout(() => {
      fetchUsers(currentPage, itemsPerPage, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    currentPage,
    itemsPerPage,
    roleFilter,
    departmentFilter,
    statusFilter,
    searchTerm,
  ]);

  // Apply filters and reset to first page
  const applyFilters = () => {
    // Reset to first page when filters change
    setCurrentPage(0);
  };

  // Page change handler
  const handlePageChange = (page: number) => {
    // Ensure page is within valid range
    const validPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(validPage);
  };

  // Per page items change handler
  const handlePerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(0); // Reset to first page when changing items per page
  };

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

  if (loading && currentPage === 0) {
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Reset to first page when search changes
                    setCurrentPage(0);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vai trò</label>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  applyFilters();
                }}
              >
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
                onValueChange={(value) => {
                  setDepartmentFilter(value);
                  applyFilters();
                }}
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
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  applyFilters();
                }}
              >
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
            Hiển thị {users.length} / {totalUsers} người dùng
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        Đang tải dữ liệu...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>
                        {user.roleDisplayNames?.[0] || "Không xác định"}
                      </TableCell>
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
        <CardFooter className="flex items-center justify-between px-6 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Hiển thị</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue>{itemsPerPage}</SelectValue>
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              mục trên mỗi trang
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              Trang {currentPage + 1} / {Math.max(1, totalPages)}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0 || loading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === totalPages - 1 || totalPages === 0 || loading
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={
                  currentPage === totalPages - 1 || totalPages === 0 || loading
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
