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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  FileText,
  Globe,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { outgoingDocumentsAPI } from "@/lib/api/outgoingDocuments";
import { useToast } from "@/components/ui/use-toast";
import { useOutgoingDocuments } from "@/lib/store";
import { getStatusBadgeInfo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { getSentDocuments } from "@/lib/api/internalDocumentApi";
import { useDocumentReadStatus } from "@/hooks/use-document-read-status";
import { usePageVisibility } from "@/hooks/use-page-visibility";

// Interface for external documents (original format)
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

// Interface for internal documents (new format from API)
interface InternalDocument {
  id: number;
  documentNumber: string;
  title: string;
  summary: string;
  documentType: string;
  signingDate: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  notes?: string;
  status: "DRAFT" | "SENT" | "APPROVED";
  isInternal: boolean | null;
  senderId: number;
  senderName: string;
  senderDepartment: string;
  recipients: {
    id: number;
    departmentId: number;
    departmentName: string;
    userId?: number;
    userName?: string;
    isRead: boolean;
    readAt?: string;
    receivedAt: string;
    notes?: string;
  }[];
  attachments: {
    id: number;
    filename: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
    uploadedByName?: string;
    description?: string;
  }[];
  replyToId?: number;
  replyToTitle?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readAt?: string;
}

export default function OutgoingDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState("internal");
  const [internalDocuments, setInternalDocuments] = useState<
    InternalDocument[]
  >([]);
  const [loadingInternal, setLoadingInternal] = useState(false);

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

  // Sử dụng hooks trạng thái đọc và page visibility
  const { subscribe, getReadStatus, updateMultipleReadStatus } =
    useDocumentReadStatus();
  const isPageVisible = usePageVisibility();

  const hasFullAccess = hasRole([
    "ROLE_ADMIN",
    "ROLE_VAN_THU",
    "ROLE_CUC_TRUONG",
    "ROLE_CUC_PHO",
    "ROLE_CHINH_UY",
    "ROLE_PHO_CHINH_UY",
  ]);

  // Subscribe to read status changes
  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  // Refresh data when page becomes visible again
  useEffect(() => {
    if (isPageVisible && user && !loadingDepartments) {
      console.log("Page became visible, refreshing documents...");
      setTimeout(() => {
        fetchDocuments(currentPage, pageSize);
      }, 100);
    }
  }, [isPageVisible]);

  // Fetch internal documents
  const fetchInternalDocuments = async (
    page = currentPage,
    size = pageSize
  ) => {
    try {
      setLoadingInternal(true);
      console.log("Fetching internal documents with pagination:", {
        page,
        size,
      });

      const response = await getSentDocuments(page, size);

      if (response && response.content) {
        console.log("Internal documents response:", response);

        // Cập nhật trạng thái đọc từ global state cho văn bản đi
        const documentsWithUpdatedReadStatus = response.content.map(
          (doc: InternalDocument) => {
            const globalReadStatus = getReadStatus(doc.id);
            // Đối với văn bản đi, trạng thái đọc được tính dựa trên recipients
            if (
              globalReadStatus.isRead !== undefined &&
              globalReadStatus.isRead !== doc.isRead
            ) {
              return {
                ...doc,
                isRead: globalReadStatus.isRead,
                readAt: globalReadStatus.readAt || doc.readAt,
              };
            }
            return doc;
          }
        );

        setInternalDocuments(documentsWithUpdatedReadStatus);

        // Cập nhật global read status với data từ server
        const readStatusUpdates = response.content.map(
          (doc: InternalDocument) => ({
            id: doc.id,
            isRead: doc.isRead,
            readAt: doc.readAt,
          })
        );
        updateMultipleReadStatus(readStatusUpdates);

        // Set pagination info if available
        if (response.totalElements !== undefined) {
          setTotalItems(
            Math.max(response.totalElements, response.content.length)
          );
        } else {
          setTotalItems(response.content.length);
        }

        if (response.totalPages !== undefined) {
          setTotalPages(Math.max(response.totalPages, 1));
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching internal documents:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể tải dữ liệu văn bản nội bộ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setInternalDocuments([]);
    } finally {
      setLoadingInternal(false);
    }
  };

  // Fetch external documents (original function)
  const fetchExternalDocuments = async (
    page = currentPage,
    size = pageSize
  ) => {
    try {
      setLoading(true);
      console.log("Fetching external documents with pagination:", {
        page,
        size,
      });

      const response = await outgoingDocumentsAPI.getAllDocuments(page, size);

      if (response && response.documents) {
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

        setOutgoingDocuments(formattedDocuments);

        // External documents don't have pagination info, so set basic values
        setTotalItems(response.documents.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching external documents:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể tải dữ liệu văn bản bên ngoài. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setOutgoingDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Main fetch function that determines which documents to load
  const fetchDocuments = async (page = currentPage, size = pageSize) => {
    if (activeTab === "internal") {
      await fetchInternalDocuments(page, size);
    } else {
      await fetchExternalDocuments(page, size);
    }
  };

  useEffect(() => {
    if (!user || loadingDepartments) {
      console.log(
        "Chưa có thông tin người dùng hoặc đang tải phòng ban, chờ tải..."
      );
      return;
    }

    setCurrentPage(0);
    setTimeout(() => {
      fetchDocuments(0, pageSize);
    }, 50);
  }, [user?.id, statusFilter, activeTab, loadingDepartments]);

  useEffect(() => {
    if (user && (currentPage > 0 || pageSize !== 10)) {
      const controller = new AbortController();
      fetchDocuments(currentPage, pageSize);
      return () => controller.abort();
    }
  }, [currentPage, pageSize, user?.id]);

  // Helper functions for filtering and formatting
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

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(0);
  };

  const getStatusBadge = (status: string) => {
    const badgeInfo = getStatusBadgeInfo(status);
    return <Badge variant={badgeInfo.variant}>{badgeInfo.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      NORMAL: { variant: "outline" as const, text: "Bình thường" },
      HIGH: { variant: "secondary" as const, text: "Cao" },
      URGENT: { variant: "destructive" as const, text: "Khẩn" },
    };
    const info = variants[priority as keyof typeof variants] || variants.NORMAL;
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString || "-";
    }
  };

  const getRecipientSummary = (recipients: InternalDocument["recipients"]) => {
    if (!recipients || recipients.length === 0) return "Chưa có người nhận";

    if (recipients.length === 1) {
      return recipients[0].userName || recipients[0].departmentName;
    }

    return `${recipients[0].departmentName} và ${recipients.length - 1} khác`;
  };

  // Filter functions
  const filteredExternalDocuments = outgoingDocuments.filter((doc) => {
    const docNumber = (doc.number || "").toLowerCase();
    const docTitle = (doc.title || "").toLowerCase();
    const docRecipient = (doc.recipient || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      docNumber.includes(searchLower) ||
      docTitle.includes(searchLower) ||
      docRecipient.includes(searchLower);

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    let matchesDepartment = true;
    if (departmentFilter !== "all") {
      const departmentIds = getChildDepartmentIds(departmentFilter);
      matchesDepartment =
        doc.departmentId != null
          ? departmentIds.includes(Number(doc.departmentId))
          : false;
    } else if (!hasFullAccess && userDepartmentIds.length > 0) {
      matchesDepartment =
        doc.departmentId != null
          ? userDepartmentIds.includes(Number(doc.departmentId))
          : userDepartmentIds.length === 0;
    }

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const filteredInternalDocuments = internalDocuments.filter((doc) => {
    const docNumber = (doc.documentNumber || "").toLowerCase();
    const docTitle = (doc.title || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      docNumber.includes(searchLower) ||
      docTitle.includes(searchLower);

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isLoading = activeTab === "internal" ? loadingInternal : loading;
  const currentDocuments =
    activeTab === "internal"
      ? filteredInternalDocuments
      : filteredExternalDocuments;

  if (isLoading || loadingDepartments) {
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

          {hasFullAccess && activeTab === "external" && (
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
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="pending_approval">Chờ phê duyệt</SelectItem>
              <SelectItem value="approved">Đã phê duyệt</SelectItem>
              <SelectItem value="SENT">Đã gửi</SelectItem>
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
            <Link
              href={
                activeTab === "internal"
                  ? "/van-ban-di/them-moi/noi-bo/tao-moi"
                  : "/van-ban-di/them-moi/ben-ngoai/tao-moi"
              }
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Văn bản nội bộ
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Văn bản bên ngoài
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Danh sách văn bản đi nội bộ</CardTitle>
              <CardDescription>
                Các văn bản nội bộ đã được gửi trong tổ chức
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-accent/50">
                  <TableRow>
                    <TableHead>Số văn bản</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Ngày ký
                    </TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden lg:table-cell">Loại</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Người nhận
                    </TableHead>
                    <TableHead>Độ ưu tiên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInternalDocuments.length > 0 ? (
                    filteredInternalDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium">
                          {doc.documentNumber}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(doc.signingDate)}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {doc.title}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {doc.documentType}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getRecipientSummary(doc.recipients)}
                        </TableCell>
                        <TableCell>{getPriorityBadge(doc.priority)}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/10 hover:text-primary"
                            asChild
                          >
                            <Link href={`/van-ban-di/noi-bo/${doc.id}`}>
                              Chi tiết
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        {currentDocuments.length === 0 && !isLoading
                          ? "Chưa có văn bản nội bộ nào"
                          : "Không có văn bản nào phù hợp với điều kiện tìm kiếm"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external" className="mt-6">
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-accent/50">
                  <TableRow>
                    <TableHead>Số văn bản</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Ngày gửi
                    </TableHead>
                    <TableHead>Trích yếu</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Nơi nhận
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>
                    {hasFullAccess && (
                      <TableHead className="hidden md:table-cell">
                        Đơn vị
                      </TableHead>
                    )}
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExternalDocuments.length > 0 ? (
                    filteredExternalDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium">
                          {doc.number}
                        </TableCell>
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
                        {currentDocuments.length === 0 && !isLoading
                          ? "Chưa có văn bản bên ngoài nào"
                          : "Không có văn bản nào phù hợp với điều kiện tìm kiếm"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {currentDocuments.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Hiển thị {currentDocuments.length} / {totalItems || 0} văn bản
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
                disabled={currentPage <= 0 || isLoading}
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
                disabled={currentDocuments.length < pageSize || isLoading}
              >
                Tiếp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {currentDocuments.length === 0 && !isLoading && (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="rounded-full bg-amber-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Không có văn bản nào</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === "internal"
                ? "Chưa có văn bản nội bộ nào trong hệ thống"
                : "Chưa có văn bản bên ngoài nào trong hệ thống"}
            </p>
            <Button asChild className="mt-4">
              <Link
                href={
                  activeTab === "internal"
                    ? "/van-ban-di/them-moi/noi-bo/tao-moi"
                    : "/van-ban-di/them-moi/ben-ngoai/tao-moi"
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm mới
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
