"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuerySync } from "@/hooks/useQuerySync";
import { useListStatePersistence } from "@/hooks/use-list-state-persistence";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { useBackendReadStatus } from "./hooks/useBackendReadStatus";
// Add universal read status for internal documents
import { useUniversalReadStatus } from "@/hooks/use-universal-read-status";

// Import new components and hooks
import { SearchFilters } from "./components/SearchFilters";
import { InternalDocumentsTable } from "./components/InternalDocumentsTable";
import { ExternalDocumentsTable } from "./components/ExternalDocumentsTable";
import { DocumentPagination } from "./components/DocumentPagination";

// Import new custom hooks
import { useInternalIncomingDocuments } from "./hooks/use-internal-incoming-documents";
import { useExternalIncomingDocuments } from "./hooks/use-external-incoming-documents";
import { PrintInternalDocumentsButton } from "@/components/print/print-internal-documents-button";

// Custom hooks (keep existing)
import { useDocumentHandlers } from "./hooks/useDocumentHandlers";

// Utils
import {
  formatDate,
  getDocumentCountByStatus,
  extractAvailableAuthorities,
} from "./utils/documentUtils";

// Constants
const FULL_ACCESS_ROLES = [
  "ROLE_ADMIN",
  "ROLE_VAN_THU",
  "ROLE_CUC_TRUONG",
  "ROLE_CUC_PHO",
  "ROLE_CHINH_UY",
  "ROLE_PHO_CHINH_UY",
];

export default function IncomingDocumentsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hasRole } = useAuth();

  // --- URL SYNCHRONIZED STATE ---
  // Mapping: q, tab, page, size, status, dept, auth, start, end, year, month
  // Tab-specific search states - similar to văn bản đi
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [externalSearchQuery, setExternalSearchQuery] = useState("");
  const [internalActiveSearchQuery, setInternalActiveSearchQuery] = useState("");
  const [externalActiveSearchQuery, setExternalActiveSearchQuery] = useState("");

  // Year/month filter states for internal documents
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined);
  const [activeYearFilter, setActiveYearFilter] = useState<number>(new Date().getFullYear());
  const [activeMonthFilter, setActiveMonthFilter] = useState<number | undefined>(undefined);

  // Filter states (keeping existing structure for now)
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [issuingAuthorityFilter, setIssuingAuthorityFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0); // 0-based internal
  const [pageSize, setPageSize] = useState(10);

  // Local state
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [availableAuthorities, setAvailableAuthorities] = useState<string[]>([]);
  const [isAddLoading, setIsAddLoading] = useState(false);

  // Hooks
  const { visibleDepartments, loading: loadingDepartments } = useHierarchicalDepartments();
  
  // Universal read status for internal documents
  const universalReadStatus = useUniversalReadStatus();

  // Custom hooks cho documents - sử dụng search riêng cho từng tab
  const internalDocsHook = useInternalIncomingDocuments({
    activeSearchQuery: internalActiveSearchQuery,
    currentPage,
    pageSize,
    yearFilter: activeYearFilter,
    monthFilter: activeMonthFilter,
  });

  const externalDocsHook = useExternalIncomingDocuments({
    activeSearchQuery: externalActiveSearchQuery,
    currentPage,
    pageSize,
  });

  // Permission checks
  const hasFullAccess = FULL_ACCESS_ROLES.some((role) => hasRole(role));
  const hasVanThuRole = hasRole("ROLE_VAN_THU");

  // Backend read status for external documents
  const externalReadStatus = useBackendReadStatus({
    documents: externalDocsHook.documents || [],
    documentType: "INCOMING_EXTERNAL",
    enabled: activeTab === "external" && Boolean(externalDocsHook.documents?.length),
  });

  // Create document handlers with backend read status
  const documentHandlers = useDocumentHandlers({
    onInternalDocumentRead: async (docId: number) => {
      // Will implement when internal documents need read status
    },
    onExternalDocumentRead: async (docId: number) => {
      await externalReadStatus.markAsRead(docId);
    },
    onExternalReadStatusToggle: async (docId: number) => {
      await externalReadStatus.toggleReadStatus(docId);
    },
    getExternalReadStatus: (docId: number) => {
      return externalReadStatus.getReadStatus(docId);
    },
  });

  // Initial apply from URL (once)
  const applyInitialFromURL = useCallback((parsed: any) => {
    if (parsed.tab === "internal" || parsed.tab === "external") {
      setActiveTab(parsed.tab);
    }
    if (typeof parsed.page === "number" && parsed.page >= 0) setCurrentPage(parsed.page);
    if (typeof parsed.size === "number" && [5,10,20,50].includes(parsed.size)) setPageSize(parsed.size);
    if (parsed.status) setStatusFilter(parsed.status);
    if (parsed.dept) setDepartmentFilter(parsed.dept);
    if (parsed.auth) setIssuingAuthorityFilter(parsed.auth);
    if (parsed.start) setDateFromFilter(parsed.start);
    if (parsed.end) setDateToFilter(parsed.end);
    if (parsed.year) {
      setYearFilter(parsed.year);
      setActiveYearFilter(parsed.year);
    }
    if (parsed.month) {
      setMonthFilter(parsed.month);
      setActiveMonthFilter(parsed.month);
    }
    if (parsed.q) {
      if (parsed.tab === "external") {
        setExternalSearchQuery(parsed.q);
        setExternalActiveSearchQuery(parsed.q);
      } else {
        setInternalSearchQuery(parsed.q);
        setInternalActiveSearchQuery(parsed.q);
      }
    }
  }, []);

  const { ready: queryReady } = useQuerySync({
    select: () => ({
      q: (activeTab === "internal" ? internalSearchQuery : externalSearchQuery) || (activeTab === "internal" ? internalActiveSearchQuery : externalActiveSearchQuery) || undefined,
      tab: activeTab !== "internal" ? activeTab : undefined,
      page: currentPage || 0,
      size: pageSize !== 10 ? pageSize : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      dept: departmentFilter !== "all" ? departmentFilter : undefined,
      auth: issuingAuthorityFilter !== "all" ? issuingAuthorityFilter : undefined,
      start: dateFromFilter || undefined,
      end: dateToFilter || undefined,
      year: activeTab === "internal" && activeYearFilter !== new Date().getFullYear() ? activeYearFilter : undefined,
      month: activeTab === "internal" && activeMonthFilter ? activeMonthFilter : undefined,
    }),
    apply: applyInitialFromURL,
    defaults: { page: 0, size: 10, status: "all", dept: "all", auth: "all" },
  });

  // Add a refresh nonce to force refetch when user clicks refresh
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Unified persistence for incoming documents list
  useListStatePersistence({
    storageKey: "incoming-docs-state",
    state: {
      activeTab,
      currentPage,
      pageSize,
      statusFilter,
      departmentFilter,
      internalSearchQuery,
      internalActiveSearchQuery,
      externalSearchQuery,
      externalActiveSearchQuery,
      yearFilter,
      monthFilter,
      activeYearFilter,
      activeMonthFilter,
    },
    persistKeys: [
      "activeTab",
      "currentPage",
      "pageSize",
      "statusFilter",
      "departmentFilter",
      "internalSearchQuery",
      "internalActiveSearchQuery",
      "externalSearchQuery",
      "externalActiveSearchQuery",
      "yearFilter",
      "monthFilter",
      "activeYearFilter",
      "activeMonthFilter",
    ],
    saveDeps: [
      activeTab,
      currentPage,
      pageSize,
      statusFilter,
      departmentFilter,
      internalSearchQuery,
      internalActiveSearchQuery,
      externalSearchQuery,
      externalActiveSearchQuery,
      yearFilter,
      monthFilter,
      activeYearFilter,
      activeMonthFilter,
    ],
    skipIfHasQueryParams: true,
    version: 1,
  });
  // Effects để load data khi cần thiết (ONE unified effect for all deps)
  useEffect(() => {
    if (!user || loadingDepartments || !queryReady) return;

    const timeoutId = setTimeout(() => {
      if (activeTab === "internal") {
        internalDocsHook.fetchInternalDocuments(currentPage, pageSize);
      } else {
        externalDocsHook.fetchExternalDocuments(currentPage, pageSize);
      }
    }, 80); // keep small debounce mainly for search typing

    return () => clearTimeout(timeoutId);
  }, [
    user?.id,
    activeTab,
    loadingDepartments,
    queryReady,
    // filters & search
    statusFilter,
    departmentFilter,
    dateFromFilter,
    dateToFilter,
    internalActiveSearchQuery,
    externalActiveSearchQuery,
    activeYearFilter,
    activeMonthFilter,
    // pagination
    currentPage,
    pageSize,
    // manual refresh trigger
    refreshNonce,
  ]);
  // NOTE: do not add fetchInternalDocuments / fetchExternalDocuments themselves to deps

  // Extract available authorities
  useEffect(() => {
    if (activeTab === "external") {
      const authorities = extractAvailableAuthorities(externalDocsHook.documents || []);
      setAvailableAuthorities(authorities);
    }
  }, [externalDocsHook.documents, activeTab]);

  // Load read status for internal documents
  useEffect(() => {
    // Seed read status directly from list (documents already include isRead)
    if (activeTab === "internal" && internalDocsHook.documents?.length > 0) {
      universalReadStatus.seedReadStatuses(
        internalDocsHook.documents.map((d: any) => ({ id: d.id, isRead: d.isRead })),
        "INCOMING_INTERNAL"
      );
    }
  }, [internalDocsHook.documents, activeTab, universalReadStatus]);

  // Listen for read status updates from detail page or other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "documentReadStatusUpdate" && e.newValue) {
        try {
          const update = JSON.parse(e.newValue);
          if (update.documentType === "INCOMING_INTERNAL" && activeTab === "internal") {
            // Refresh read status for internal documents
            if (internalDocsHook.documents?.length > 0) {
              universalReadStatus.seedReadStatuses(
                internalDocsHook.documents.map((d: any) => ({ id: d.id, isRead: d.isRead })),
                "INCOMING_INTERNAL"
              );
            }
          }
        } catch (error) {
          // console.error("Error parsing storage update:", error);
        }
      }
    };

    const handleCustomUpdate = () => {
      // Handle custom document read status update event
      if (activeTab === "internal" && internalDocsHook.documents?.length > 0) {
        universalReadStatus.seedReadStatuses(
          internalDocsHook.documents.map((d: any) => ({ id: d.id, isRead: d.isRead })),
          "INCOMING_INTERNAL"
        );
      }
    };

    // Listen for storage events (cross-tab communication)
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for custom events (same-tab communication)
    window.addEventListener("documentReadStatusUpdate", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("documentReadStatusUpdate", handleCustomUpdate);
    };
  }, [internalDocsHook.documents, activeTab, universalReadStatus]);

  const handleSearch = () => {
    if (activeTab === "internal") {
      setInternalActiveSearchQuery(internalSearchQuery);
    } else {
      setExternalActiveSearchQuery(externalSearchQuery);
    }
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    if (activeTab === "internal") {
      setInternalSearchQuery("");
      setInternalActiveSearchQuery("");
    } else {
      setExternalSearchQuery("");
      setExternalActiveSearchQuery("");
    }
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Tab change handler - clear search khi đổi tab
  const handleTabChange = (value: string) => {
    setActiveTab(value as "internal" | "external");
    setCurrentPage(0);
    // Reset search khi đổi tab để tránh confusion
    if (value === "internal") {
      setExternalSearchQuery("");
      setExternalActiveSearchQuery("");
    } else {
      setInternalSearchQuery("");
      setInternalActiveSearchQuery("");
    }
  };

  // Filter handlers
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(0);
  };

  const handleDateFromChange = (value: string) => {
    setDateFromFilter(value);
    setCurrentPage(0);
  };

  const handleDateToChange = (value: string) => {
    setDateToFilter(value);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleIssuingAuthorityChange = (value: string) => {
    setIssuingAuthorityFilter(value);
    setCurrentPage(0);
  };

  // Year/month filter handlers for internal documents
  const handleYearFilterChange = (year: number) => {
    setYearFilter(year);
  };

  const handleMonthFilterChange = (month: number | undefined) => {
    setMonthFilter(month);
  };

  const handleApplyFilters = () => {
    if (activeTab === "internal") {
      setActiveYearFilter(yearFilter);
      setActiveMonthFilter(monthFilter);
    }
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    const currentYear = new Date().getFullYear();
    setDateFromFilter("");
    setDateToFilter("");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setIssuingAuthorityFilter("all");
    // Reset year/month filters for internal documents
    setYearFilter(currentYear);
    setMonthFilter(undefined);
    setActiveYearFilter(currentYear);
    setActiveMonthFilter(undefined);
    // Clear search theo tab hiện tại
    if (activeTab === "internal") {
      setInternalSearchQuery("");
      setInternalActiveSearchQuery("");
    } else {
      setExternalSearchQuery("");
      setExternalActiveSearchQuery("");
    }
    setCurrentPage(0);
  };

  const handleRefresh = () => {
    // bump nonce to trigger effect
    setRefreshNonce((n) => n + 1);
  };

  const handleAddDocument = () => {
    setIsAddLoading(true);
    router.push("/van-ban-den/them-moi");
  };

  // Document click handlers
  const handleInternalDocumentClick = async (doc: any) => {
    try {
      // Mark as read when navigating
      const currentReadStatus = universalReadStatus.getReadStatus(
        doc.id,
        "INCOMING_INTERNAL"
      );

      if (!currentReadStatus) {
        try {
          await universalReadStatus.markAsRead(doc.id, "INCOMING_INTERNAL");
          
          // Trigger storage event to notify other tabs/components
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
          // console.error("Error marking as read:", markError);
        }
      }

      // Navigate to internal document detail
      window.location.href = `/van-ban-den/noi-bo/${doc.id}`;
    } catch (error) {
      // console.error("Navigation error:", error);
      window.location.href = `/van-ban-den/noi-bo/${doc.id}`;
    }
  };

  // Internal document read status toggle
  const handleInternalReadStatusToggle = async (docId: number) => {
    try {
      await universalReadStatus.toggleReadStatus(docId, "INCOMING_INTERNAL");
      
      // Trigger storage event to notify other tabs/components
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
    } catch (error) {
      console.error("Error toggling internal read status:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đọc. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

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

      window.location.href = `/van-ban-den/${doc.id}`;
    } catch (error) {
      window.location.href = `/van-ban-den/${doc.id}`;
    }
  };

  // Pagination handlers (no direct fetch calls anymore)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => p + 1);
  };

  // Get current state
  const isLoading = activeTab === "internal" ? 
    internalDocsHook.loading : 
    externalDocsHook.loading;

  const currentDocuments = activeTab === "internal" ? 
    internalDocsHook.documents : 
    externalDocsHook.documents;

  // Determine if department filter should be shown for external docs (leaders or units with children)
  const isLeaderRole = hasRole("ROLE_CUC_TRUONG") || hasRole("ROLE_CUC_PHO") || hasRole("ROLE_CHINH_UY") || hasRole("ROLE_PHO_CHINH_UY");
  const hasChildUnits = (visibleDepartments || []).some((d: any) => d.parentId === user?.departmentId);
  const showExternalDepartmentFilter = isLeaderRole || hasChildUnits;

  // Apply client-side department filtering for external documents if needed
  const filteredExternalDocuments = activeTab === "external" && departmentFilter !== "all" && showExternalDepartmentFilter
    ? (externalDocsHook.documents || []).filter((doc: any) => {
        const deptId = doc?.primaryProcessDepartmentId || doc?.sendingDepartmentId || doc?.departmentId;
        return deptId?.toString() === departmentFilter;
      })
    : externalDocsHook.documents;

  const displayedDocuments = activeTab === "external" ? filteredExternalDocuments : internalDocsHook.documents;

  const totalItems = activeTab === "internal" ? 
    internalDocsHook.totalItems : 
    (activeTab === "external" && departmentFilter !== "all" && showExternalDepartmentFilter
      ? filteredExternalDocuments.length
      : externalDocsHook.totalItems);

  const totalPages = activeTab === "internal" ? 
    internalDocsHook.totalPages : 
    externalDocsHook.totalPages; // External currently single page; client filter keeps same

  // NOTE: Previously returned early with a full-page loader. Requirement: only table shows loading.
  // Keep page layout mounted so filters & tabs are visible immediately.

  return (
    <div className="space-y-8">
      {/* Search Filters */}
      <SearchFilters
  searchQuery={activeTab === "internal" ? internalSearchQuery : externalSearchQuery}
        setSearchQuery={activeTab === "internal" ? setInternalSearchQuery : setExternalSearchQuery}
        activeSearchQuery={activeTab === "internal" ? internalActiveSearchQuery : externalActiveSearchQuery}
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
        <TabsContent value="internal" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Danh sách văn bản nội bộ đến</h3>
            </div>
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
          {isLoading || loadingDepartments ? (
            <div className="flex h-40 items-center justify-center border rounded-md">
              <div className="flex flex-col items-center text-center py-4">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Đang tải danh sách...</p>
              </div>
            </div>
          ) : (
            <InternalDocumentsTable
              documents={currentDocuments}
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
        <TabsContent value="external" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Danh sách văn bản bên ngoài đến</h3>
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
          {isLoading || loadingDepartments ? (
            <div className="flex h-40 items-center justify-center border rounded-md">
              <div className="flex flex-col items-center text-center py-4">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Đang tải danh sách...</p>
              </div>
            </div>
          ) : (
            <ExternalDocumentsTable
              documents={displayedDocuments}
              allDocuments={currentDocuments}
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
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
