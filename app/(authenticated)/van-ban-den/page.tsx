"use client";

import { use, useEffect, useState, useCallback } from "react";
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
  Building2,
  Globe,
} from "lucide-react";
import Link from "next/link";
import {
  UrgencyLevel,
  URGENCY_LEVELS,
  migrateFromOldUrgency,
} from "@/lib/types/urgency";
import { UrgencyBadge } from "@/components/urgency-badge";
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
import {
  getReceivedDocumentsExcludingSent,
  markDocumentAsRead,
  getInternalDocumentHistory,
  getDocumentStats,
  getDocumentReplies,
} from "@/lib/api/internalDocumentApi";
import { useDocumentReadStatus } from "@/hooks/use-document-read-status";
import { usePageVisibility } from "@/hooks/use-page-visibility";
import { DocumentStatusBadge } from "@/components/document-status-badge";
import { useUniversalReadStatus } from "@/hooks/use-universal-read-status";
import { incomingExternalReadStatus } from "@/lib/api/documentReadStatus";
import { InternalDocument, InternalDocumentDetail, DocumentHistory,
  DocumentStats,
} from "@/lib/api/internalDocumentApi";
import { documentReadStatusAPI } from "@/lib/api/documentReadStatus";
// Role có quyền xem toàn bộ văn bản
const FULL_ACCESS_ROLES = [
  "ROLE_ADMIN",
  "ROLE_VAN_THU",
  "ROLE_CUC_TRUONG",
  "ROLE_CUC_PHO",
  "ROLE_CHINH_UY",
  "ROLE_PHO_CHINH_UY",
];

// Define the simplified status groups with comprehensive status mapping
const SIMPLIFIED_STATUS_GROUPS = {
  pending: {
    code: "pending",
    displayName: "Đang xử lý",
    statuses: [
      // Original status codes
      "distributed",
      "dept_assigned",
      "specialist_processing",
      "specialist_submitted",
      "leader_reviewing",
      "department_reviewing",
      // Additional common status codes
      "pending",
      "processing",
      "in_progress",
      "under_review",
      "reviewing",
      "assigned",
      // Uppercase variants
      "PENDING",
      "PROCESSING",
      "IN_PROGRESS",
      "UNDER_REVIEW",
      "DISTRIBUTED",
      "DEPT_ASSIGNED",
      "SPECIALIST_PROCESSING",
    ],
  },
  completed: {
    code: "completed",
    displayName: "Đã xử lý",
    statuses: [
      // Original status codes
      "leader_approved",
      "leader_commented",
      "department_approved",
      "department_commented",
      "published",
      "completed",
      "archived",
      // Additional common status codes
      "approved",
      "finished",
      "done",
      "resolved",
      "closed",
      // Uppercase variants
      "COMPLETED",
      "APPROVED",
      "FINISHED",
      "DONE",
      "RESOLVED",
      "CLOSED",
      "LEADER_APPROVED",
      "DEPARTMENT_APPROVED",
      "PUBLISHED",
      "ARCHIVED",
    ],
  },
  not_processed: {
    code: "not_processed",
    displayName: "Chưa xử lý",
    statuses: [
      // Original status codes
      "draft",
      "registered",
      "pending_approval",
      // Additional common status codes
      "new",
      "created",
      "received",
      "unprocessed",
      "waiting",
      // Uppercase variants
      "DRAFT",
      "REGISTERED",
      "PENDING_APPROVAL",
      "NEW",
      "CREATED",
      "RECEIVED",
      "UNPROCESSED",
      "WAITING",
    ],
  },
};

// Simplified status tabs - compatible with SIMPLIFIED_STATUS_GROUPS
const SIMPLE_STATUS_TABS = {
  not_processed: {
    code: "not_processed",
    displayName: "Chưa xử lý",
    description: "Văn bản chưa được xử lý",
  },
  pending: {
    code: "pending",
    displayName: "Đang xử lý",
    description: "Văn bản đang được xử lý",
  },
  completed: {
    code: "completed",
    displayName: "Đã hoàn thành",
    description: "Văn bản đã hoàn thành xử lý",
  },
};

// REMOVED: Complex role-based status logic has been replaced by API classification endpoint

// Helper function to get simplified status group based on detailed status
const getSimplifiedStatusGroup = (
  detailedStatus: string | null | undefined
) => {
  // Handle null/undefined status
  if (!detailedStatus) {
    console.warn("⚠️ Status is null/undefined, defaulting to 'not_processed'");
    return { code: "not_processed", displayName: "Chưa xử lý" };
  }

  // Normalize status to handle case-insensitive matching
  const normalizedStatus = detailedStatus.trim().toLowerCase();

  for (const [key, group] of Object.entries(SIMPLIFIED_STATUS_GROUPS)) {
    // Check both original status and lowercased version
    if (
      group.statuses.includes(detailedStatus) ||
      group.statuses.includes(normalizedStatus) ||
      group.statuses.some((s) => s.toLowerCase() === normalizedStatus)
    ) {
      return { code: group.code, displayName: group.displayName };
    }
  }

  // Log unknown status for debugging
  console.warn(
    `⚠️ Unknown status: "${detailedStatus}", defaulting to 'pending'`
  );
  return { code: "pending", displayName: "Đang xử lý" };
};



export default function IncomingDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("internal");
  const [processingStatusTab, setProcessingStatusTab] =
    useState("not_processed"); // Tab con cho trạng thái xử lý
  const [internalDocuments, setInternalDocuments] = useState<
    InternalDocument[]
  >([]);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const { toast } = useToast();
  const { incomingDocuments, loading, setIncomingDocuments, setLoading } =
    useIncomingDocuments();
  const statuses = getAllStatuses();
  const { user, hasRole } = useAuth();
  const [documentSource, setDocumentSource] = useState<string>("all"); // all, department, assigned
  const [departmentFilter, setDepartmentFilter] = useState("all"); // Thêm state cho bộ lọc phòng ban
  const [isAddLoading, setIsAddLoading] = useState(false);

  // Date range filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Issuing authority filter
  const [issuingAuthorityFilter, setIssuingAuthorityFilter] = useState("all");
  const [availableAuthorities, setAvailableAuthorities] = useState<string[]>(
    []
  );

  const router = useRouter();

  // Sử dụng hook phòng ban phân cấp
  const {
    visibleDepartments,
    loading: loadingDepartments,
    hasFullAccess: hasFullDepartmentAccess,
  } = useHierarchicalDepartments();

  // Sử dụng hook quản lý trạng thái đọc cho văn bản nội bộ
  const { subscribe, getReadStatus, updateMultipleReadStatus } =
    useDocumentReadStatus();

  // Sử dụng hook quản lý trạng thái đọc cho tất cả loại văn bản
  const universalReadStatus = useUniversalReadStatus();

  // Sử dụng hook page visibility để refresh khi trang được focus lại
  const isPageVisible = usePageVisibility();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Use simplified status tabs instead of complex role-based logic
  const userProcessingStatus = SIMPLE_STATUS_TABS;

  // Kiểm tra người dùng có quyền xem tất cả không
  const hasFullAccess = FULL_ACCESS_ROLES.some((role) => hasRole(role));
  // Nếu không có quyền xem tất cả thì kiểm tra xem văn bản của đơn vị
  // hoặc văn bản được giao cá nhân
  const hasDepartmentAccess =
    hasRole("ROLE_TRUONG_PHONG") ||
    hasRole("ROLE_PHO_PHONG") ||
    hasRole("ROLE_TRUONG_BAN") ||
    hasRole("ROLE_PHO_BAN") ||
    hasRole("ROLE_CUM_TRUONG") ||
    hasRole("ROLE_PHO_CUM_TRUONG") ||
    hasRole("ROLE_CHINH_TRI_VIEN_CUM") ||
    hasRole("ROLE_PHO_TRAM_TRUONG") ||
    hasRole("ROLE_TRAM_TRUONG");

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

  // Xử lý khi thay đổi ngày bắt đầu
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setCurrentPage(0);
  };

  // Xử lý khi thay đổi ngày kết thúc
  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setCurrentPage(0);
  };

  // Xử lý khi thay đổi đơn vị gửi
  const handleIssuingAuthorityChange = (value: string) => {
    setIssuingAuthorityFilter(value);
    setCurrentPage(0);
  };

  // Reset tất cả filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setStartDate("");
    setEndDate("");
    setIssuingAuthorityFilter("all");
    setCurrentPage(0);
  };

  // Kiểm tra xem người dùng có quyền xem văn bản đến không
  const canViewDocuments =
    hasFullAccess || // Admin, văn thư, cục trưởng, cục phó
    hasDepartmentAccess || // Trưởng phòng, phó phòng, trưởng ban, phó ban
    hasRole("ROLE_NHAN_VIEN") || // Nhân viên (chỉ xem văn bản được phân công)
    hasRole("ROLE_TRO_LY"); // Trợ lý (chỉ xem văn bản được phân công)

  // Fetch internal documents (received)
  const fetchInternalDocuments = async (
    page = currentPage,
    size = pageSize
  ) => {
    try {
      setLoadingInternal(true);
      console.log("Fetching internal received documents with pagination:", {
        page,
        size,
      });

      const response = await getReceivedDocumentsExcludingSent(page, size);

      if (response && response.content) {
        console.log("Internal received documents response:", response);

        // Sử dụng trực tiếp data từ backend thay vì tính toán lại
        // Backend đã trả về isRead: true/false dựa trên user hiện tại
        setInternalDocuments(response.content);

        // Cập nhật global read status với data từ server
        const readStatusUpdates = response.content.map(
          (doc: InternalDocument) => ({
            id: doc.id,
            isRead: doc.isRead, // Sử dụng trực tiếp từ backend
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
      console.error("Error fetching internal received documents:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể tải dữ liệu văn bản nội bộ nhận được. Vui lòng thử lại sau.",
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
        userId: user?.id,
        userDepartmentId: user?.departmentId,
      });

      const response = await incomingDocumentsAPI.getAllDocuments(page, size);

      console.log("API Response:", response);

      if (response && response.content) {
        setIncomingDocuments(response.content);

        // External documents don't have detailed pagination info in the current API
        setTotalItems(response.page.totalElements);
        setTotalPages(response.page.totalPages);
      } else {
        console.warn("Unexpected response structure:", response);
        setIncomingDocuments([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching external documents:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu văn bản. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setIncomingDocuments([]);
      setTotalItems(0);
      setTotalPages(0);
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

  // Update useEffect to handle tab changes
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
  }, [
    user?.id,
    statusFilter,
    activeTab,
    documentSource,
    departmentFilter,
    loadingDepartments,
  ]);

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

  // Helper functions for formatting
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Chưa xác định";

      const date = new Date(dateString);

      // Check if date is valid and not the epoch (1970-01-01)
      if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
        return "Chưa xác định";
      }

      return date.toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
  };

  const getUrgencyBadge = (urgencyLevel: UrgencyLevel | string) => {
    // For migration compatibility, handle old priority values
    let level: UrgencyLevel;
    if (
      typeof urgencyLevel === "string" &&
      ["NORMAL", "HIGH", "URGENT"].includes(urgencyLevel)
    ) {
      level = migrateFromOldUrgency(urgencyLevel);
    } else {
      level = urgencyLevel as UrgencyLevel;
    }

    return <UrgencyBadge level={level} size="sm" />;
  };

  const getInternalStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: "outline" as const, text: "Bản nháp" },
      SENT: { variant: "default" as const, text: "Đã gửi" },
      APPROVED: { variant: "secondary" as const, text: "Đã phê duyệt" },
    };
    const info = variants[status as keyof typeof variants] || variants.SENT;
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  // Filter functions with simplified API-based logic
  const filteredExternalDocuments = incomingDocuments.filter((doc) => {
    const docNumber = (doc.documentNumber || "").toLowerCase();
    const docTitle = (doc.title || "").toLowerCase();
    const docAuthority = (doc.issuingAuthority || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      docNumber.includes(searchLower) ||
      docTitle.includes(searchLower) ||
      docAuthority.includes(searchLower);

    // For now, keep simple filtering until we implement batch API classification
    // TODO: Replace with API classification when ready
    let matchesProcessingStatus = true;
    if (processingStatusTab !== "all") {
      // Temporary simple mapping based on common status patterns
      const status = doc.trackingStatus?.toUpperCase() || "";
      let docTabCode = "pending"; // default
      console.log("hihi" + status);
      if (status === "NOT_PROCESSED") {
        docTabCode = "not_processed";
      } else if (status === "PROCESSED") {
        docTabCode = "completed";
      } else {
        docTabCode = "pending"; // processing, reviewing, etc.
      }
      console.log("docTabCode" + docTabCode);

      matchesProcessingStatus = docTabCode === processingStatusTab;

      console.log("matches ", matchesProcessingStatus);
    }

    // Lọc theo phòng ban - chỉ sử dụng primaryProcessDepartmentId
    let matchesDepartment = true;
    if (departmentFilter !== "all") {
      const departmentIds = getChildDepartmentIds(departmentFilter);
      const primaryDeptId = doc.primaryProcessDepartmentId
        ? Number(doc.primaryProcessDepartmentId)
        : null;

      // Kiểm tra xem phòng ban xử lý chính có thuộc phòng ban được chọn không
      matchesDepartment =
        primaryDeptId != null && departmentIds.includes(primaryDeptId);
    }

    // Lọc theo ngày nhận
    let matchesDateRange = true;
    if (startDate || endDate) {
      const docDate = doc.receivedDate;
      if (docDate) {
        const docDateStr =
          typeof docDate === "string"
            ? docDate
            : docDate.toISOString().split("T")[0];

        if (startDate && docDateStr < startDate) {
          matchesDateRange = false;
        }
        if (endDate && docDateStr > endDate) {
          matchesDateRange = false;
        }
      } else {
        // Nếu không có ngày nhận và có filter ngày thì loại bỏ
        matchesDateRange = false;
      }
    }

    // Lọc theo đơn vị gửi
    let matchesIssuingAuthority = true;
    if (issuingAuthorityFilter !== "all") {
      matchesIssuingAuthority = doc.issuingAuthority === issuingAuthorityFilter;
    }
    //casdcascd
    return (
      matchesSearch &&
      matchesProcessingStatus &&
      matchesDepartment &&
      matchesDateRange &&
      matchesIssuingAuthority
    );
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

    // Lọc theo ngày ký cho văn bản nội bộ
    let matchesDateRange = true;
    if (startDate || endDate) {
      const docDate = doc.signingDate;
      if (docDate) {
        const docDateStr =
          typeof docDate === "string" ? docDate.split("T")[0] : docDate;

        if (startDate && docDateStr < startDate) {
          matchesDateRange = false;
        }
        if (endDate && docDateStr > endDate) {
          matchesDateRange = false;
        }
      } else {
        // Nếu không có ngày ký và có filter ngày thì loại bỏ
        matchesDateRange = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const isLoading = activeTab === "internal" ? loadingInternal : loading;
  const currentDocuments =
    activeTab === "internal"
      ? filteredInternalDocuments
      : filteredExternalDocuments;

  // Count documents for each processing status tab - simplified logic
  const getDocumentCountByStatus = (statusKey: string) => {
    if (statusKey === "all") {
      return incomingDocuments.length;
    }

    return incomingDocuments.filter((doc) => {
      // Use same logic as filtering
      const status = doc.trackingStatus?.toUpperCase() || "";
      let docTabCode = "pending"; // default

      if (status === "PROCESSED") {
        docTabCode = "completed";
      } else if (status === "NOT_PROCESSED") {
        docTabCode = "not_processed";
      } else {
        docTabCode = "pending"; // processing, reviewing, etc.
      }

      return docTabCode === statusKey;
    }).length;
  };

  const getAssignmentBadge = (primaryId: string) => {
    if (user?.departmentId && Number(primaryId) === user.departmentId) {
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

  // Helper function để tạo thông báo empty state thống nhất
  const getEmptyStateMessage = (
    isInternal: boolean,
    isFiltered: boolean = false
  ) => {
    if (isFiltered) {
      return "Không có văn bản nào phù hợp với điều kiện tìm kiếm";
    }

    if (isInternal) {
      return "Chưa có văn bản nội bộ nào";
    }

    // External documents - tùy theo quyền truy cập
    if (hasFullAccess) {
      return "Chưa có văn bản đến nào trong hệ thống";
    }

    return "Không có văn bản nào được giao cho bạn";
  };

  // Add a force refresh function
  const forceRefreshDocuments = useCallback(async () => {
    console.log("Force refreshing documents...");
    await fetchDocuments(currentPage, pageSize);
    toast({
      title: "Đã cập nhật",
      description: "Danh sách văn bản đã được làm mới",
    });
  }, [currentPage, pageSize, fetchDocuments, toast]);

  // Subscribe to read status changes - only once
  useEffect(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  }, []); // Empty dependency array to avoid re-subscription

  // Extract unique issuing authorities when documents change
  useEffect(() => {
    const authorities = Array.from(
      new Set(
        incomingDocuments
          .map((doc) => doc.issuingAuthority)
          .filter((authority) => authority && authority.trim() !== "")
      )
    ).sort();
    setAvailableAuthorities(authorities);
  }, [incomingDocuments]);

  // Refresh data when page becomes visible again (user comes back from detail page)
  useEffect(() => {
    if (isPageVisible && user && !loadingDepartments) {
      console.log("Page became visible, refreshing documents...");
      // Small delay to ensure any pending state updates are complete
      setTimeout(() => {
        fetchDocuments(currentPage, pageSize);
      }, 100);
    }
  }, [isPageVisible, user, loadingDepartments, currentPage, pageSize]);

  // Refresh data when processing status tab changes
  useEffect(() => {
    if (user && !loadingDepartments && activeTab === "external") {
      console.log("Processing status tab changed, refreshing documents...");
      fetchDocuments(currentPage, pageSize);
    }
  }, [
    processingStatusTab,
    user,
    loadingDepartments,
    activeTab,
    currentPage,
    pageSize,
  ]);

  // Add router focus event handling for better detection of return from detail pages
  useEffect(() => {
    const handleRouterFocus = () => {
      if (user && !loadingDepartments) {
        console.log("Router focus detected, refreshing documents...");
        setTimeout(() => {
          fetchDocuments(currentPage, pageSize);
        }, 100);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "documentReadStatusUpdate" && user && !loadingDepartments) {
        console.log("Storage change detected, refreshing documents...");
        setTimeout(() => {
          fetchDocuments(currentPage, pageSize);
        }, 100);
      }
    };

    // Listen for focus events
    window.addEventListener("focus", handleRouterFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("focus", handleRouterFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, loadingDepartments, currentPage, pageSize]);

  // Load read status for external documents when they change
  useEffect(() => {
    if (incomingDocuments.length > 0) {
      const documentIds = incomingDocuments
        .map((doc: IncomingDocumentDTO) => doc.id!)
        .filter((id: number) => id);
      if (documentIds.length > 0) {
        universalReadStatus.loadBatchReadStatus(
          documentIds,
          "INCOMING_EXTERNAL"
        );
      }
    }
  }, [incomingDocuments.length]); // Only depend on length, not the array itself

  // Handle click on internal document to mark as read and navigate
  const handleInternalDocumentClick = async (doc: InternalDocument) => {
    try {
      // Sử dụng trực tiếp trạng thái đọc từ backend
      // Backend đã trả về isRead: true/false cho từng document dựa trên người dùng hiện tại
      const currentReadStatus = doc.isRead;

      // Mark as read if not already read
      if (!currentReadStatus) {
        try {
          await markDocumentAsRead(doc.id);
          await documentReadStatusAPI.markAsRead(doc.id, "INCOMING_INTERNAL");
          // Update document in the local state to reflect the change
          setInternalDocuments((prevDocs) =>
            prevDocs.map((d) =>
              d.id === doc.id
                ? { ...d, isRead: true, readAt: new Date().toISOString() }
                : d
            )
          );

          // Update global state if using the hook
          updateMultipleReadStatus([
            { id: doc.id, isRead: true, readAt: new Date().toISOString() },
          ]);

          console.log("Document marked as read successfully:", doc.id);
        } catch (markError) {
          console.error("Error marking document as read:", markError);
          toast({
            title: "Cảnh báo",
            description: "Không thể cập nhật trạng thái đọc văn bản",
            variant: "destructive",
          });
        }
      }

      // Navigate to document detail page
      router.push(`/van-ban-den/noi-bo/${doc.id}`);
    } catch (error) {
      console.error("Error handling document click:", error);
      // Still navigate even if marking as read fails
      router.push(`/van-ban-den/noi-bo/${doc.id}`);
    }
  };

  // Handle click on external document to mark as read and navigate
  const handleExternalDocumentClick = async (doc: IncomingDocumentDTO) => {
    try {
      // Check current read status using universal read status hook
      const currentReadStatus = universalReadStatus.getReadStatus(
        doc.id!,
        "INCOMING_EXTERNAL"
      );

      // Mark as read if not already read
      if (!currentReadStatus) {
        try {
          await universalReadStatus.markAsRead(doc.id!, "INCOMING_EXTERNAL");
          console.log("External document marked as read successfully:", doc.id);
        } catch (markError) {
          console.error("Error marking external document as read:", markError);
          toast({
            title: "Cảnh báo",
            description: "Không thể cập nhật trạng thái đọc văn bản",
            variant: "destructive",
          });
        }
      }

      // Navigate to document detail page
      router.push(`/van-ban-den/${doc.id}`);
    } catch (error) {
      console.error("Error handling external document click:", error);
      // Still navigate even if marking as read fails
      router.push(`/van-ban-den/${doc.id}`);
    }
  };

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

          {/* Bộ lọc phòng ban phân cấp - chỉ hiển thị cho external tab */}
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
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {activeTab === "internal" ? (
                <>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                  <SelectItem value="SENT">Đã gửi</SelectItem>
                  <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                </>
              ) : (
                Object.entries(SIMPLIFIED_STATUS_GROUPS).map(([key, group]) => (
                  <SelectItem key={key} value={key}>
                    {group.displayName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Date range filters */}
          <Input
            type="date"
            placeholder="Từ ngày"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full sm:w-[150px] border-primary/20"
            title={activeTab === "external" ? "Từ ngày nhận" : "Từ ngày ký"}
          />
          <Input
            type="date"
            placeholder="Đến ngày"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full sm:w-[150px] border-primary/20"
            title={activeTab === "external" ? "Đến ngày nhận" : "Đến ngày ký"}
          />

          {/* Issuing authority filter - only for external tab */}
          {activeTab === "external" && availableAuthorities.length > 0 && (
            <Select
              value={issuingAuthorityFilter}
              onValueChange={handleIssuingAuthorityChange}
            >
              <SelectTrigger className="w-full sm:w-[200px] border-primary/20">
                <SelectValue placeholder="Đơn vị gửi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                {availableAuthorities.map((authority) => (
                  <SelectItem key={authority} value={authority}>
                    {authority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
            onClick={forceRefreshDocuments}
            title="Làm mới danh sách"
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Reset filters button */}
          {(searchQuery ||
            statusFilter !== "all" ||
            departmentFilter !== "all" ||
            startDate ||
            endDate ||
            issuingAuthorityFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary"
              title="Xóa tất cả bộ lọc"
            >
              Xóa lọc
            </Button>
          )}

          {/* Chỉ văn thư mới có quyền thêm mới - chỉ cho external documents */}
          {hasRole("ROLE_VAN_THU") && activeTab === "external" && (
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
          {/* Chỉ hiển thị table khi có dữ liệu để tránh trùng lặp với empty state */}
          {(activeTab === "internal" ? internalDocuments : incomingDocuments)
            .length > 0 && (
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-accent/50">
                    <TableRow>
                      <TableHead>Số văn bản</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Ngày ký
                      </TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Loại
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Người gửi
                      </TableHead>
                      <TableHead>Độ khẩn</TableHead>
                      <TableHead>Trạng thái đọc</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInternalDocuments.length > 0 ? (
                      filteredInternalDocuments.map((doc) => {
                        // Sử dụng trực tiếp trạng thái đọc từ backend
                        // Backend đã trả về isRead: true/false cho từng document dựa trên người dùng hiện tại
                        const currentReadStatus = doc.isRead;

                        return (
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
                              {doc.senderName}
                            </TableCell>
                            <TableCell>
                              {getUrgencyBadge(doc.priority)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  currentReadStatus ? "default" : "outline"
                                }
                              >
                                {currentReadStatus ? "Đã đọc" : "Chưa đọc"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleInternalDocumentClick(doc)}
                              >
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {getEmptyStateMessage(true, true)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="external" className="mt-6">
          {/* Chỉ hiển thị table khi có dữ liệu để tránh trùng lặp với empty state */}
          {(activeTab === "external" ? incomingDocuments : internalDocuments)
            .length > 0 && (
            <Card className="border-primary/10 shadow-sm">
              {/* Compact Processing Status Tabs */}
              <div className="px-4 py-2 border-b bg-gray-50/50">
                <div className="flex gap-2">
                  {Object.entries(userProcessingStatus).map(([key, status]) => {
                    const count = getDocumentCountByStatus(key);
                    const isActive = processingStatusTab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setProcessingStatusTab(key)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {status.displayName} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
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
                      <TableHead>Trạng thái đọc</TableHead>
                      {/* Hiển thị vai trò khi xem văn bản đơn vị hoặc được giao */}
                      {(documentSource !== "all" || !hasFullAccess) && (
                        <TableHead>Vai trò</TableHead>
                      )}
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExternalDocuments.length > 0 ? (
                      filteredExternalDocuments.map((doc) => {
                        const isRead = universalReadStatus.getReadStatus(
                          doc.id!,
                          "INCOMING_EXTERNAL"
                        );
                        return (
                          <TableRow
                            key={doc.id}
                            className={`hover:bg-accent/30 cursor-pointer ${
                              !isRead
                                ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                            onClick={() => handleExternalDocumentClick(doc)}
                          >
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
                              <div className="flex items-center gap-2">
                                {!isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                                <span
                                  className={!isRead ? "font-semibold" : ""}
                                >
                                  {doc.title}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {doc.issuingAuthority}
                            </TableCell>
                            <TableCell>
                              <DocumentStatusBadge
                                documentId={doc.id!}
                                fallbackStatus={doc.processingStatus}
                                fallbackDisplayStatus={
                                  getStatusByCode(doc.processingStatus)
                                    ?.displayName
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`${
                                  isRead
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-blue-600 hover:text-blue-700"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  universalReadStatus.toggleReadStatus(
                                    doc.id!,
                                    "INCOMING_EXTERNAL"
                                  );
                                }}
                              >
                                {isRead ? "Đã đọc" : "Chưa đọc"}
                              </Button>
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExternalDocumentClick(doc);
                                }}
                              >
                                Chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            documentSource !== "all" || !hasFullAccess ? 8 : 7
                          }
                          className="h-24 text-center"
                        >
                          {getEmptyStateMessage(false, true)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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
            {hasRole("ROLE_VAN_THU") && activeTab === "external" && (
              <Button
                onClick={handleAddDocument}
                disabled={isAddLoading}
                className="mt-4"
              >
                {isAddLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                    tải...
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
      )}
    </div>
  );
}
