"use client";

import { useEffect, useState } from "react";
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
import { outgoingDocumentsAPI } from "@/lib/api/outgoingDocuments";
import { useToast } from "@/components/ui/use-toast";
import { useOutgoingDocuments } from "@/lib/store";
import { getStatusBadgeInfo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";

interface OutgoingDocument {
  id: number | string;
  number: string;
  title: string;
  sentDate: string;
  recipient: string;
  status: string;
  departmentId?: number;
  departmentName?: string;
}

export default function OutgoingDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();
  const { outgoingDocuments, loading, setOutgoingDocuments, setLoading } =
    useOutgoingDocuments();
  const { user, isAuthenticated, hasRole } = useAuth();

  const {
    visibleDepartments,
    loading: loadingDepartments,
    hasFullAccess: hasFullDepartmentAccess,
    userDepartmentIds,
  } = useHierarchicalDepartments();

  const hasFullAccess = hasRole([
    "ROLE_ADMIN",
    "ROLE_VAN_THU",
    "ROLE_CUC_TRUONG",
    "ROLE_CUC_PHO",
    "ROLE_CHINH_UY",
    "ROLE_PHO_CHINH_UY",
  ]);

  const fetchDocuments = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      console.log("Fetching outgoing documents with pagination:", {
        page,
        size,
      });

      const response = await outgoingDocumentsAPI.getAllDocuments(page, size);

      if (response && response.documents) {
        console.log("Raw API response:", response);

        const formattedDocuments = response.documents.map((doc) => ({
          id: doc.id,
          number: doc.number || "Chưa có số",
          title: doc.title || "Không có tiêu đề",
          sentDate: doc.sentDate || "Chưa ban hành",
          recipient: doc.recipient || "Chưa xác định",
          status: doc.status || "draft",
          departmentId: doc.draftingDepartmentId ?? null,
          departmentName: doc.draftingDepartment || "Chưa xác định",
        }));

        console.log("Processed documents for UI:", formattedDocuments);

        setOutgoingDocuments(formattedDocuments);

        // Đảm bảo totalItems không là 0
        if (response.totalElements !== undefined) {
          setTotalItems(
            Math.max(response.totalElements, response.documents.length)
          );
        } else if (response.numberOfElements !== undefined) {
          setTotalItems(
            Math.max(response.numberOfElements, response.documents.length)
          );
        } else {
          setTotalItems(
            Math.max(
              response.documents.length + page * size,
              response.documents.length
            )
          );
        }

        if (response.totalPages !== undefined) {
          setTotalPages(Math.max(response.totalPages, 1));
        } else {
          const estimatedTotalPages =
            response.documents.length < size ? Math.max(page + 1, 1) : page + 2;
          setTotalPages(estimatedTotalPages);
        }

        console.log(
          "Fetched documents:",
          response.documents.length,
          "Total items:",
          response.documents.length > 0
            ? response.totalElements || response.documents.length
            : 0
        );
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Không thể tải dữ liệu văn bản đi");
      }
    } catch (error) {
      console.error("Error fetching outgoing documents:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu văn bản đi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setOutgoingDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || loadingDepartments) {
      console.log(
        "Văn bản đi: Chưa có thông tin người dùng hoặc đang tải phòng ban, chờ tải..."
      );
      return;
    }

    console.log("Văn bản đi: User đã tải xong, có thể tải dữ liệu", {
      userId: user.id,
      isAuthenticated,
      roles: user?.roles,
    });

    setCurrentPage(0);

    setTimeout(() => {
      console.log("Văn bản đi: Đang tải dữ liệu lần đầu...");
      fetchDocuments(0, pageSize);
    }, 50);
  }, [user?.id, statusFilter, loadingDepartments]);

  useEffect(() => {
    if (user && (currentPage > 0 || pageSize !== 10)) {
      console.log("Văn bản đi: Đang tải dữ liệu theo trang...", {
        currentPage,
        pageSize,
      });
      const controller = new AbortController();
      fetchDocuments(currentPage, pageSize);
      return () => controller.abort();
    }
  }, [currentPage, pageSize, user?.id]);

  const getChildDepartmentIds = (departmentId: string) => {
    if (departmentId === "all") return [];

    const selectedDept = visibleDepartments.find(
      (d) => d.id.toString() === departmentId
    );
    if (!selectedDept) return [];

    const childIds: number[] = [];

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

  const filteredDocuments = outgoingDocuments.filter((doc) => {
    // Kiểm tra an toàn để tránh lỗi toLowerCase() trên null/undefined
    const docNumber = (doc.number || "").toLowerCase();
    const docTitle = (doc.title || "").toLowerCase();
    const docRecipient = (doc.recipient || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    // Lọc theo tìm kiếm
    const matchesSearch =
      searchQuery === "" ||
      docNumber.includes(searchLower) ||
      docTitle.includes(searchLower) ||
      docRecipient.includes(searchLower);

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    // Lọc theo phòng ban và phòng ban con
    let matchesDepartment = true;
    if (departmentFilter !== "all") {
      const departmentIds = getChildDepartmentIds(departmentFilter);
      matchesDepartment =
        doc.departmentId != null
          ? departmentIds.includes(Number(doc.departmentId))
          : false;
    } else if (!hasFullAccess && userDepartmentIds.length > 0) {
      // Chỉ áp dụng lọc theo phòng ban người dùng nếu không có quyền xem tất cả
      // và người dùng có phòng ban
      matchesDepartment =
        doc.departmentId != null
          ? userDepartmentIds.includes(Number(doc.departmentId))
          : userDepartmentIds.length === 0; // Hiển thị văn bản không có phòng ban nếu người dùng không có phòng ban
    }

    // Thêm debug log để xem lọc dữ liệu
    const result = matchesSearch && matchesStatus && matchesDepartment;
    if (!result) {
      console.debug(
        `Văn bản bị lọc: ID=${doc.id}, Số=${doc.number}, Tiêu đề=${doc.title}`,
        {
          matchesSearch,
          matchesStatus,
          matchesDepartment,
          departmentId: doc.departmentId,
          userDeptIds: userDepartmentIds,
        }
      );
    }

    return result;
  });

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(0);
  };

  const getStatusBadge = (status: string) => {
    const badgeInfo = getStatusBadgeInfo(status);
    return <Badge variant={badgeInfo.variant}>{badgeInfo.text}</Badge>;
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

  if (outgoingDocuments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-amber-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Không có văn bản nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Chưa có văn bản đi nào trong hệ thống
          </p>
          <Button asChild className="mt-4">
            <Link href="/van-ban-di/them-moi">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Văn bản đi</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi các văn bản đi
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="pending_approval">Chờ phê duyệt</SelectItem>
              <SelectItem value="approved">Đã phê duyệt</SelectItem>
              <SelectItem value="sent">Đã gửi</SelectItem>
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
            <Link href="/van-ban-di/them-moi" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Danh sách văn bản đi</CardTitle>
          <CardDescription>
            Danh sách các văn bản đi đã được tạo
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
                <TableHead className="hidden md:table-cell">Ngày gửi</TableHead>
                <TableHead>Trích yếu</TableHead>
                <TableHead className="hidden md:table-cell">Nơi nhận</TableHead>
                <TableHead>Trạng thái</TableHead>
                {hasFullAccess && (
                  <TableHead className="hidden md:table-cell">Đơn vị</TableHead>
                )}
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium">{doc.number}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.sentDate}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {doc.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.recipient}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    {hasFullAccess && (
                      <TableCell className="hidden md:table-cell">
                        {doc.departmentName}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary"
                        asChild
                      >
                        <Link href={`/van-ban-di/${doc.id}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={hasFullAccess ? 7 : 6}
                    className="h-24 text-center"
                  >
                    Không có văn bản nào phù hợp với điều kiện tìm kiếm
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {/* Phân trang - Chỉ hiển thị khi có văn bản đã lọc */}
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
                    setCurrentPage(0);
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
                  disabled={outgoingDocuments.length < pageSize || loading}
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
