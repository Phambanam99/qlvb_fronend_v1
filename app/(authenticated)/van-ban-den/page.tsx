"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  getStatusByCode,
  incomingDocumentsAPI,
  Status,
  getAllStatuses,
} from "@/lib/api/incomingDocuments";
import { getStatusBadgeInfo } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useIncomingDocuments } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { IncomingDocumentDTO } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";

// Role có quyền xem toàn bộ văn bản
const FULL_ACCESS_ROLES = [
  "ROLE_ADMIN",
  "ROLE_VAN_THU",
  "ROLE_CUC_TRUONG",
  "ROLE_CUC_PHO",
  "ROLE_CHINH_UY",
  "ROLE_PHO_CHINH_UY",
];

export default function IncomingDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { incomingDocuments, loading, setIncomingDocuments, setLoading } =
    useIncomingDocuments();
  const statuses = getAllStatuses();
  const { user, hasRole } = useAuth();
  const [documentSource, setDocumentSource] = useState<string>("all"); // all, department, assigned
  const [departmentFilter, setDepartmentFilter] = useState("all"); // Thêm state cho bộ lọc phòng ban
  const [isAddLoading, setIsAddLoading] = useState(false);
  const router = useRouter();

  // Sử dụng hook phòng ban phân cấp
  const {
    visibleDepartments,
    loading: loadingDepartments,
    hasFullAccess: hasFullDepartmentAccess,
  } = useHierarchicalDepartments();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Kiểm tra người dùng có quyền xem tất cả không
  const hasFullAccess = FULL_ACCESS_ROLES.some((role) => hasRole(role));
  // Nếu không có quyền xem tất cả thì kiểm tra xem văn bản của đơn vị
  // hoặc văn bản được giao cá nhân
  const hasDepartmentAccess =
    hasRole("ROLE_TRUONG_PHONG") ||
    hasRole("ROLE_PHO_PHONG") ||
    hasRole("ROLE_TRUONG_BAN") ||
    hasRole("ROLE_PHO_BAN");

  // Cập nhật documentSource mặc định dựa trên vai trò người dùng khi thông tin user thay đổi
  useEffect(() => {
    if (user) {
      // Nếu là trưởng phòng/phó phòng, đặt mặc định là văn bản của phòng ban
      if (hasDepartmentAccess) {
        console.log(
          "Setting default document source to 'department' based on user role"
        );
        setDocumentSource("department");
      }
      // Nếu là nhân viên/trợ lý, đặt mặc định là văn bản được giao
      else if (hasRole("ROLE_NHAN_VIEN") || hasRole("ROLE_TRO_LY")) {
        console.log(
          "Setting default document source to 'assigned' based on user role"
        );
        setDocumentSource("assigned");
      }
      // Người dùng có quyền xem tất cả, giữ mặc định là 'all'
      else if (hasFullAccess) {
        console.log(
          "Setting default document source to 'all' based on admin role"
        );
        setDocumentSource("all");
      }
    }
  }, [user, hasRole, hasFullAccess, hasDepartmentAccess]);

  // Thêm source filter cho các role có quyền cao
  const documentSources = [
    { value: "all", label: "Tất cả văn bản" },
    { value: "department", label: "Văn bản phòng/đơn vị" },
    { value: "assigned", label: "Văn bản được giao" },
  ];

  // Xử lý khi click vào thêm mới văn bản đến
  const handleAddDocument = () => {
    setIsAddLoading(true);
    router.push("/van-ban-den/them-moi");
  };

  // Xử lý khi thay đổi bộ lọc trạng thái
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(0); // Reset về trang đầu khi thay đổi bộ lọc
  };

  // Xử lý khi thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset về trang đầu khi thay đổi từ khóa tìm kiếm
  };

  // Xử lý khi thay đổi bộ lọc phòng ban
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(0); // Reset về trang đầu khi thay đổi bộ lọc phòng ban
  };

  // Kiểm tra xem người dùng có quyền xem văn bản đến không
  const canViewDocuments =
    hasFullAccess || // Admin, văn thư, cục trưởng, cục phó
    hasDepartmentAccess || // Trưởng phòng, phó phòng, trưởng ban, phó ban
    hasRole("ROLE_NHAN_VIEN") || // Nhân viên (chỉ xem văn bản được phân công)
    hasRole("ROLE_TRO_LY"); // Trợ lý (chỉ xem văn bản được phân công)

  // Hàm tải danh sách văn bản đến - định nghĩa ngoài useEffect để có thể gọi ở nhiều nơi
  const fetchDocuments = async (page = currentPage, size = pageSize) => {
    try {
      if (!canViewDocuments) {
        console.log("User does not have permission to view documents");
        setIncomingDocuments([]);
        return;
      }

      // Đặt loading trước khi gọi API
      setLoading(true);
      let response;

      console.log("Current user data:", {
        user,
        hasFullAccess,
        hasDepartmentAccess,
        documentSource,
        departmentFilter,
      });

      // Xác định cách tải văn bản dựa trên các điều kiện
      if (hasFullAccess && documentSource === "all") {
        console.log("Fetching all documents as admin with pagination:", {
          page,
          size,
        });
        response = await incomingDocumentsAPI.getAllDocuments(page, size);
      } else if (hasDepartmentAccess && documentSource === "department") {
        if (!user?.departmentId) {
          console.warn("Department ID is undefined, cannot load documents");
          setIncomingDocuments([]);
          setLoading(false);
          return;
        } else {
          console.log(
            "Fetching department documents for ID:",
            user.departmentId,
            "with pagination:",
            { page, size }
          );
          response = await incomingDocumentsAPI.getDepartmentDocuments(
            user.departmentId,
            page,
            size
          );
        }
      } else if (
        documentSource === "assigned" ||
        hasRole("ROLE_NHAN_VIEN") ||
        hasRole("ROLE_TRO_LY")
      ) {
        if (!user?.departmentId) {
          console.warn("Department ID is undefined, cannot load documents");
          setIncomingDocuments([]);
          setLoading(false);
          return;
        }
        response = await incomingDocumentsAPI.getDepartmentDocuments(
          user.departmentId,
          page,
          size
        );
      } else if (hasFullAccess) {
        console.log(
          "Fallback: Fetching all documents for admin with pagination:",
          { page, size }
        );
        response = await incomingDocumentsAPI.getAllDocuments(page, size);
      } else {
        console.log("User does not have specific permission to view documents");
        setIncomingDocuments([]);
        setLoading(false);
        return;
      }

      if (response && response.content) {
        console.log("Raw API response:", response);

        // Chuyển đổi documents rõ ràng và gán vào state
        const documents = response.content.map((doc: IncomingDocumentDTO) => ({
          ...doc,
        }));

        console.log("Processed documents for UI:", documents);
        setIncomingDocuments(documents);

        // Cập nhật thông tin phân trang
        if (response.totalElements !== undefined) {
          setTotalItems(response.totalElements);
        } else if (response.numberOfElements !== undefined) {
          setTotalItems(response.numberOfElements);
        } else {
          setTotalItems(response.content.length + page * size);
        }

        if (response.totalPages !== undefined) {
          setTotalPages(response.totalPages);
        } else {
          const estimatedTotalPages =
            response.content.length < size ? page + 1 : page + 2;
          setTotalPages(estimatedTotalPages);
        }
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Không thể tải dữ liệu văn bản đến");
      }
    } catch (error) {
      console.error("Error fetching incoming documents:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu văn bản đến. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      // Đảm bảo giao diện được cập nhật ngay cả khi có lỗi
      setIncomingDocuments([]);
    } finally {
      // Đảm bảo luôn tắt loading
      setLoading(false);
    }
  };

  // Tăng cường việc tải dữ liệu
  useEffect(() => {
    // Không thực hiện gọi API nếu chưa có thông tin người dùng hoặc đang tải danh sách phòng ban
    if (!user || loadingDepartments) {
      console.log(
        "Văn bản đến: Chưa có thông tin người dùng hoặc đang tải phòng ban, chờ tải..."
      );
      return;
    }

    console.log("Văn bản đến: User đã tải xong, có thể tải dữ liệu văn bản", {
      userId: user.id,
      departmentId: user.departmentId,
      roles: user.roles,
      canViewDocuments,
    });

    // Đặt trang về 0 khi tải lần đầu hoặc khi thay đổi bộ lọc
    setCurrentPage(0);

    // Gọi hàm tải văn bản với phân trang page=0
    console.log("Văn bản đến: Đang tải dữ liệu văn bản lần đầu...");

    // Tăng thời gian timeout để chờ state cập nhật
    setTimeout(() => {
      fetchDocuments(0, pageSize);
    }, 50);
  }, [user?.id, statusFilter, documentSource, loadingDepartments]);

  // Xử lý thay đổi trang riêng biệt
  useEffect(() => {
    // Chỉ gọi khi thay đổi trang hoặc pageSize và không phải là lần đầu tải
    if (user && (currentPage > 0 || pageSize !== 10)) {
      console.log("Văn bản đến: Đang tải dữ liệu theo trang...", {
        currentPage,
        pageSize,
      });
      const controller = new AbortController();
      fetchDocuments(currentPage, pageSize);
      return () => controller.abort();
    }
  }, [currentPage, pageSize, user?.id]);

  // Lấy danh sách các phòng ban con của phòng ban được chọn
  const getChildDepartmentIds = (departmentId: string) => {
    if (departmentId === "all") return [];

    const selectedDept = visibleDepartments.find(
      (d) => d.id.toString() === departmentId
    );
    if (!selectedDept) return [];

    const childIds: number[] = [];

    // Hàm đệ quy để lấy tất cả ID phòng ban con
    const collectChildIds = (dept: (typeof visibleDepartments)[0]) => {
      if (dept.children && dept.children.length > 0) {
        dept.children.forEach((child) => {
          childIds.push(child.id);
          collectChildIds(child);
        });
      }
    };

    collectChildIds(selectedDept);
    return [Number(departmentId), ...childIds];
  };

  // Lọc dữ liệu
  const filteredDocuments = incomingDocuments.filter((doc) => {
    // Lọc theo tìm kiếm - thêm kiểm tra an toàn để tránh lỗi với null/undefined
    const docNumber = (doc.documentNumber || "").toLowerCase();
    const docTitle = (doc.title || "").toLowerCase();
    const docAuthority = (doc.issuingAuthority || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      docNumber.includes(searchLower) ||
      docTitle.includes(searchLower) ||
      docAuthority.includes(searchLower);

    // Lọc theo trạng thái
    const matchesStatus =
      statusFilter === "all" || doc.processingStatus === statusFilter;

    // Lọc theo phòng ban và phòng ban con
    let matchesDepartment = true;
    if (departmentFilter !== "all") {
      const departmentIds = getChildDepartmentIds(departmentFilter);
      const primaryDeptId = doc.primaryProcessDepartmentId
        ? Number(doc.primaryProcessDepartmentId)
        : null;
      const secondaryDeptIds = doc.secondaryProcessDepartmentIds
        ? doc.secondaryProcessDepartmentIds.map((id) => Number(id))
        : [];

      // Kiểm tra xem phòng ban xử lý chính hoặc phối hợp có thuộc phòng ban được chọn không
      matchesDepartment =
        (primaryDeptId != null && departmentIds.includes(primaryDeptId)) ||
        secondaryDeptIds.some((id) => departmentIds.includes(id));
    }

    // Thêm debug log để theo dõi văn bản bị lọc
    const result = matchesSearch && matchesStatus && matchesDepartment;
    if (!result) {
      console.debug(
        `Văn bản đến bị lọc: ID=${doc.id}, Số=${doc.documentNumber}, Tiêu đề=${doc.title}`,
        {
          matchesSearch,
          matchesStatus,
          matchesDepartment,
          primaryDeptId: doc.primaryProcessDepartmentId,
          secondaryDeptIds: doc.secondaryProcessDepartmentIds,
        }
      );
    }

    return result;
  });

  const getStatusBadge = (status: string, displayStatus: string) => {
    const badgeInfo = getStatusBadgeInfo(status, displayStatus);
    return <Badge variant={badgeInfo.variant}>{badgeInfo.text}</Badge>;
  };

  const getAssignmentBadge = (primaryId: string) => {
    if (user?.departmentId == primaryId) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300"
        >
          Xử lý chính
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-300"
      >
        Phối hợp
      </Badge>
    );
  };

  if (loading || loadingDepartments) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (incomingDocuments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-amber-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Không có văn bản nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFullAccess
              ? "Chưa có văn bản đến nào trong hệ thống"
              : "Không có văn bản nào được giao cho bạn"}
          </p>
          {hasRole("ROLE_VAN_THU") && (
            <Button
              onClick={handleAddDocument}
              disabled={isAddLoading}
              className="mt-4"
            >
              {isAddLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Văn bản đến</h1>
        <p className="text-muted-foreground">
          {hasFullAccess
            ? "Quản lý và xử lý các văn bản đến"
            : "Danh sách văn bản được giao cho bạn"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm văn bản..."
              className="pl-10 w-full border-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Source filter cho role có quyền cao */}
          {hasFullAccess && (
            <Select value={documentSource} onValueChange={setDocumentSource}>
              <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
                <SelectValue placeholder="Nguồn văn bản" />
              </SelectTrigger>
              <SelectContent>
                {documentSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Bộ lọc phòng ban phân cấp */}
          {hasFullAccess && (
            <Select
              value={departmentFilter}
              onValueChange={handleDepartmentFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[220px] border-primary/20">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {visibleDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.level > 0
                      ? "\u00A0".repeat(dept.level * 2) + "└ "
                      : ""}
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex w-full sm:w-auto items-center space-x-3">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {statuses.map((status) => (
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

          {/* Chỉ văn thư mới có quyền thêm mới */}
          {hasRole("ROLE_VAN_THU") && (
            <Button
              onClick={handleAddDocument}
              disabled={isAddLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isAddLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Danh sách văn bản đến</CardTitle>
          <CardDescription>
            {hasFullAccess && documentSource === "all"
              ? "Danh sách tất cả các văn bản đến đã được tiếp nhận"
              : hasFullAccess && documentSource === "department"
              ? "Danh sách các văn bản đến được giao cho đơn vị của bạn"
              : "Danh sách các văn bản đến được giao cho bạn"}
            {departmentFilter !== "all" &&
              " - Lọc theo phòng ban: " +
                visibleDepartments.find(
                  (d) => d.id.toString() === departmentFilter
                )?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/50">
              <TableRow>
                <TableHead>Số văn bản</TableHead>
                <TableHead className="hidden md:table-cell">
                  Ngày nhận
                </TableHead>
                <TableHead>Trích yếu</TableHead>
                <TableHead className="hidden md:table-cell">
                  Đơn vị gửi
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                {/* Hiển thị vai trò khi xem văn bản đơn vị hoặc được giao */}
                {(documentSource !== "all" || !hasFullAccess) && (
                  <TableHead>Vai trò</TableHead>
                )}
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium">
                      {doc.documentNumber}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.receivedDate
                        ? typeof doc.receivedDate === "object" &&
                          doc.receivedDate instanceof Date
                          ? doc.receivedDate.toLocaleDateString("vi-VN")
                          : String(doc.receivedDate)
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {doc.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.issuingAuthority}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        doc.processingStatus,
                        getStatusByCode(doc.processingStatus)?.displayName!
                      )}
                    </TableCell>
                    {/* Hiển thị vai trò (xử lý chính/phối hợp) khi cần */}
                    {(documentSource !== "all" || !hasFullAccess) && (
                      <TableCell>
                        {getAssignmentBadge(
                          String(doc.primaryProcessDepartmentId)
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary"
                        asChild
                      >
                        <Link href={`/van-ban-den/${doc.id}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={documentSource !== "all" || !hasFullAccess ? 7 : 6}
                    className="h-24 text-center"
                  >
                    Không có văn bản nào phù hợp với điều kiện tìm kiếm
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {/* Pagination Controls - Chỉ hiển thị khi có văn bản đã lọc */}
        {filteredDocuments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredDocuments.length} / {totalItems || 0} văn bản
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Số văn bản mỗi trang</p>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(0); // Reset về trang đầu khi thay đổi pageSize
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Trang {currentPage + 1} / {Math.max(totalPages, 1)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(0, currentPage - 1);
                    setCurrentPage(newPage);
                    fetchDocuments(newPage, pageSize);
                  }}
                  disabled={currentPage <= 0 || loading}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchDocuments(newPage, pageSize);
                  }}
                  disabled={incomingDocuments.length < pageSize || loading}
                >
                  Tiếp
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
