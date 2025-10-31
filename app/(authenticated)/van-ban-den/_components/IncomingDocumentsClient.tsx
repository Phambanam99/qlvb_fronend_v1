"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { revalidateDocuments } from "@/lib/actions/incoming-documents.actions";

// Import existing components from van-ban-den
import { SearchFilters } from "../components/SearchFilters";
import dynamic from "next/dynamic";

const TableSkeleton = () => (
  <div className="flex h-40 items-center justify-center border rounded-md text-xs text-muted-foreground">
    Đang tải bảng...
  </div>
);

const InternalDocumentsTable = dynamic(
  () => import("../components/InternalDocumentsTable").then(m => m.InternalDocumentsTable),
  { ssr: false, loading: () => <TableSkeleton /> }
);

const ExternalDocumentsTable = dynamic(
  () => import("../components/ExternalDocumentsTable").then(m => m.ExternalDocumentsTable),
  { ssr: false, loading: () => <TableSkeleton /> }
);

import { DocumentPagination } from "../components/DocumentPagination";

// Import hooks
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { useBackendReadStatus } from "../hooks/useBackendReadStatus";
import { useUniversalReadStatus } from "@/hooks/use-universal-read-status";

// Utils
import {
  formatDate,
  getDocumentCountByStatus,
  extractAvailableAuthorities,
} from "../utils/documentUtils";

/**
 * Client Component for Incoming Documents
 * Handles user interactions while receiving server-fetched initial data
 *
 * Architecture Benefits:
 * - Server Component fetches initial data (zero JS for initial fetching)
 * - Client Component handles interactions (tabs, filters, pagination)
 * - Uses Next.js router for URL state management
 * - Automatic revalidation and caching via Server Actions
 */

interface IncomingDocumentsClientProps {
  initialData: {
    success: boolean;
    content: any[];
    totalPages: number;
    totalElements: number;
    error?: string;
  };
  initialPage: number;
  initialSize: number;
  initialSearch: string;
  initialTab: "internal" | "external";
  initialYear?: number;
  initialMonth?: number;
  initialDepartmentId?: number;
}

// Constants
const FULL_ACCESS_ROLES = [
  "ROLE_ADMIN",
  "ROLE_VAN_THU",
  "ROLE_CUC_TRUONG",
  "ROLE_CUC_PHO",
  "ROLE_CHINH_UY",
  "ROLE_PHO_CHINH_UY",
];

export function IncomingDocumentsClient({
  initialData,
  initialPage,
  initialSize,
  initialSearch,
  initialTab,
  initialYear,
  initialMonth,
  initialDepartmentId,
}: IncomingDocumentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, hasRole } = useAuth();

  // Use transition for smooth navigation updates
  const [isPending, startTransition] = useTransition();

  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<"internal" | "external">(initialTab);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);

  // Year/month filters
  const [yearFilter, setYearFilter] = useState<number>(initialYear || new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<number | undefined>(initialMonth);

  // Other filters
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartmentId?.toString() || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [issuingAuthorityFilter, setIssuingAuthorityFilter] = useState("all");
  const [availableAuthorities, setAvailableAuthorities] = useState<string[]>([]);

  // Hooks
  const {
    visibleDepartments,
    loading: loadingDepartments,
  } = useHierarchicalDepartments();

  const universalReadStatus = useUniversalReadStatus();

  // Backend read status for external documents
  const externalReadStatus = useBackendReadStatus({
    documents: activeTab === "external" ? initialData.content : [],
    documentType: "INCOMING_EXTERNAL",
    enabled: activeTab === "external" && Boolean(initialData.content?.length),
  });

  // Check permissions
  const hasFullAccess = FULL_ACCESS_ROLES.some((role) => hasRole(role));
  const hasVanThuRole = hasRole("ROLE_VAN_THU");

  const isLeaderRole = hasRole("ROLE_CUC_TRUONG") || hasRole("ROLE_CUC_PHO") || hasRole("ROLE_CHINH_UY") || hasRole("ROLE_PHO_CHINH_UY");
  const hasChildUnits = (visibleDepartments || []).some((d: any) => d.parentId === user?.departmentId);
  const showExternalDepartmentFilter = isLeaderRole || hasChildUnits;

  // Load read status for documents
  useEffect(() => {
    if (initialData.success && initialData.content.length > 0) {
      if (activeTab === "internal") {
        universalReadStatus.seedReadStatuses(
          initialData.content.map((d: any) => ({ id: d.id, isRead: d.isRead })),
          "INCOMING_INTERNAL"
        );
      }
    }
  }, [initialData.content, activeTab, universalReadStatus]);

  // Extract available authorities for external documents
  useEffect(() => {
    if (activeTab === "external") {
      const authorities = extractAvailableAuthorities(initialData.content || []);
      setAvailableAuthorities(authorities);
    }
  }, [initialData.content, activeTab]);

  // Listen for read status updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "documentReadStatusUpdate" && e.newValue) {
        try {
          const update = JSON.parse(e.newValue);
          if (update.documentType === "INCOMING_INTERNAL" && activeTab === "internal") {
            // Refresh page to get updated read status
            router.refresh();
          }
        } catch (error) {
          // Ignore
        }
      }
    };

    const handleCustomUpdate = () => {
      if (activeTab === "internal") {
        router.refresh();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("documentReadStatusUpdate", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("documentReadStatusUpdate", handleCustomUpdate);
    };
  }, [activeTab, router]);

  /**
   * Update URL parameters and trigger server-side re-fetch
   */
  const updateURL = (params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";

    // Use startTransition to avoid blocking UI
    startTransition(() => {
      router.push(`${pathname}${query}`);
    });
  };

  /**
   * Handle search submission
   */
  const handleSearch = () => {
    updateURL({
      search: searchQuery || undefined,
      page: "0",
      year: activeTab === "internal" ? yearFilter.toString() : undefined,
      month: activeTab === "internal" && monthFilter ? monthFilter.toString() : undefined,
    });
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchQuery("");
    updateURL({
      search: undefined,
      page: "0",
    });
  };

  /**
   * Handle search key press
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: string) => {
    const newTab = tab as "internal" | "external";
    setActiveTab(newTab);
    setSearchQuery("");
    updateURL({
      tab: newTab !== "internal" ? newTab : undefined,
      search: undefined,
      page: "0",
      year: undefined,
      month: undefined,
      departmentId: undefined,
    });
  };

  /**
   * Handle year filter change
   */
  const handleYearFilterChange = (year: number) => {
    setYearFilter(year);
  };

  /**
   * Handle month filter change
   */
  const handleMonthFilterChange = (month: number | undefined) => {
    setMonthFilter(month);
  };

  /**
   * Handle apply filters
   */
  const handleApplyFilters = () => {
    if (activeTab === "internal") {
      updateURL({
        year: yearFilter.toString(),
        month: monthFilter ? monthFilter.toString() : undefined,
        page: "0",
      });
    }
  };

  /**
   * Handle department filter change
   */
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    updateURL({
      departmentId: value !== "all" ? value : undefined,
      page: "0",
    });
  };

  /**
   * Handle date from change
   */
  const handleDateFromChange = (value: string) => {
    setDateFromFilter(value);
    updateURL({
      start: value || undefined,
      page: "0",
    });
  };

  /**
   * Handle date to change
   */
  const handleDateToChange = (value: string) => {
    setDateToFilter(value);
    updateURL({
      end: value || undefined,
      page: "0",
    });
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    updateURL({
      status: value !== "all" ? value : undefined,
      page: "0",
    });
  };

  /**
   * Handle issuing authority change
   */
  const handleIssuingAuthorityChange = (value: string) => {
    setIssuingAuthorityFilter(value);
    updateURL({
      auth: value !== "all" ? value : undefined,
      page: "0",
    });
  };

  /**
   * Handle clear filters
   */
  const handleClearFilters = () => {
    const currentYear = new Date().getFullYear();
    setYearFilter(currentYear);
    setMonthFilter(undefined);
    setDepartmentFilter("all");
    setStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setIssuingAuthorityFilter("all");
    setSearchQuery("");

    updateURL({
      search: undefined,
      year: undefined,
      month: undefined,
      departmentId: undefined,
      status: undefined,
      auth: undefined,
      start: undefined,
      end: undefined,
      page: "0",
    });
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() });
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (size: number) => {
    updateURL({
      size: size.toString(),
      page: "0",
    });
  };

  /**
   * Handle previous page
   */
  const handlePreviousPage = () => {
    if (initialPage > 0) {
      handlePageChange(initialPage - 1);
    }
  };

  /**
   * Handle next page
   */
  const handleNextPage = () => {
    if (initialPage < initialData.totalPages - 1) {
      handlePageChange(initialPage + 1);
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await revalidateDocuments();
      router.refresh();

      toast({
        title: "Đã làm mới",
        description: "Danh sách văn bản đã được cập nhật.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể làm mới danh sách. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Handle add document
   */
  const handleAddDocument = () => {
    setIsAddLoading(true);
    router.push("/van-ban-den/them-moi");
  };

  /**
   * Handle internal document click
   */
  const handleInternalDocumentClick = async (doc: any) => {
    try {
      const currentReadStatus = universalReadStatus.getReadStatus(
        doc.id,
        "INCOMING_INTERNAL"
      );

      if (!currentReadStatus) {
        try {
          await universalReadStatus.markAsRead(doc.id, "INCOMING_INTERNAL");

          // Trigger storage event
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "documentReadStatusUpdate",
              JSON.stringify({
                documentId: doc.id,
                documentType: "INCOMING_INTERNAL",
                timestamp: Date.now()
              })
            );
            setTimeout(() => {
              localStorage.removeItem("documentReadStatusUpdate");
            }, 100);
          }
        } catch (markError) {
          // Continue even if marking fails
        }
      }

      router.push(`/van-ban-den/noi-bo/${doc.id}`);
    } catch (error) {
      router.push(`/van-ban-den/noi-bo/${doc.id}`);
    }
  };

  /**
   * Handle internal read status toggle
   */
  const handleInternalReadStatusToggle = async (docId: number) => {
    try {
      await universalReadStatus.toggleReadStatus(docId, "INCOMING_INTERNAL");

      // Trigger storage event
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "documentReadStatusUpdate",
          JSON.stringify({
            documentId: docId,
            documentType: "INCOMING_INTERNAL",
            timestamp: Date.now()
          })
        );
        setTimeout(() => {
          localStorage.removeItem("documentReadStatusUpdate");
        }, 100);
      }

      // Refresh to get updated data
      router.refresh();
    } catch (error) {
      console.error("Error toggling internal read status:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đọc. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle external document click
   */
  const handleExternalDocumentClick = async (doc: any) => {
    try {
      const currentReadStatus = externalReadStatus.getReadStatus(Number(doc.id));

      if (!currentReadStatus) {
        try {
          await externalReadStatus.markAsRead(Number(doc.id));
        } catch (markError) {
          // Continue even if marking fails
        }
      }

      router.push(`/van-ban-den/${doc.id}`);
    } catch (error) {
      router.push(`/van-ban-den/${doc.id}`);
    }
  };

  // Show error state
  if (!initialData.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Văn bản đến</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="border rounded-md p-8 text-center">
          <p className="text-destructive mb-4">
            {initialData.error || "Không thể tải danh sách văn bản"}
          </p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const { content: documents, totalPages, totalElements } = initialData;

  // Apply client-side filtering if needed
  const filteredDocuments = activeTab === "external" && departmentFilter !== "all" && showExternalDepartmentFilter
    ? documents.filter((doc: any) => {
        const deptId = doc?.primaryProcessDepartmentId || doc?.sendingDepartmentId || doc?.departmentId;
        return deptId?.toString() === departmentFilter;
      })
    : documents;

  const displayedDocuments = filteredDocuments;
  const totalItems = activeTab === "external" && departmentFilter !== "all" && showExternalDepartmentFilter
    ? filteredDocuments.length
    : totalElements;

  return (
    <div className="space-y-2">
      {/* Search Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSearchQuery={searchQuery}
        yearFilter={activeTab === "internal" ? yearFilter : undefined}
        monthFilter={activeTab === "internal" ? monthFilter : undefined}
        departmentFilter={departmentFilter}
        dateFromFilter={dateFromFilter}
        dateToFilter={dateToFilter}
        statusFilter={statusFilter}
        issuingAuthorityFilter={issuingAuthorityFilter}
        activeTab={activeTab}
        hasFullAccess={hasFullAccess}
        visibleDepartments={visibleDepartments}
        availableAuthorities={availableAuthorities}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onSearchKeyPress={handleSearchKeyPress}
        onYearFilterChange={activeTab === "internal" ? handleYearFilterChange : undefined}
        onMonthFilterChange={activeTab === "internal" ? handleMonthFilterChange : undefined}
        onApplyFilters={activeTab === "internal" ? handleApplyFilters : undefined}
        onDepartmentFilterChange={handleDepartmentFilterChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onStatusFilterChange={handleStatusFilterChange}
        onIssuingAuthorityChange={handleIssuingAuthorityChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        showDepartmentFilter={showExternalDepartmentFilter}
      />

      {/* Document Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
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

        {/* Internal Documents Tab */}
        <TabsContent value="internal" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            {hasVanThuRole && (
              <Button
                size="sm"
                onClick={handleAddDocument}
                disabled={isAddLoading}
              >
                {isAddLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm mới
              </Button>
            )}
          </div>
          {isPending || loadingDepartments ? (
            <div className="flex h-40 items-center justify-center border rounded-md">
              <div className="flex flex-col items-center text-center py-4">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Đang tải danh sách...</p>
              </div>
            </div>
          ) : (
            <InternalDocumentsTable
              documents={displayedDocuments}
              onDocumentClick={handleInternalDocumentClick}
              formatDate={formatDate}
              universalReadStatus={universalReadStatus}
              onReadStatusToggle={handleInternalReadStatusToggle}
              getReadStatus={(docId: number) =>
                universalReadStatus.getReadStatus(docId, "INCOMING_INTERNAL") || false
              }
            />
          )}
        </TabsContent>

        {/* External Documents Tab */}
        <TabsContent value="external" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            {hasVanThuRole && (
              <Button
                size="sm"
                onClick={handleAddDocument}
                disabled={isAddLoading}
              >
                {isAddLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm mới
              </Button>
            )}
          </div>
          {isPending || loadingDepartments ? (
            <div className="flex h-40 items-center justify-center border rounded-md">
              <div className="flex flex-col items-center text-center py-4">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Đang tải danh sách...</p>
              </div>
            </div>
          ) : (
            <ExternalDocumentsTable
              documents={displayedDocuments}
              allDocuments={documents}
              processingStatusTab="all"
              onProcessingStatusTabChange={() => {}}
              onDocumentClick={handleExternalDocumentClick}
              onReadStatusToggle={async (docId: number) => {
                await externalReadStatus.toggleReadStatus(docId);
              }}
              getReadStatus={(docId: number) => {
                return externalReadStatus.getReadStatus(docId);
              }}
              getDocumentCountByStatus={(statusKey) =>
                getDocumentCountByStatus(displayedDocuments || [], statusKey, activeTab)
              }
              formatDate={formatDate}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <DocumentPagination
        currentDocumentsLength={displayedDocuments?.length || 0}
        totalItems={totalItems}
        currentPage={initialPage}
        pageSize={initialSize}
        totalPages={totalPages}
        isLoading={isPending}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
