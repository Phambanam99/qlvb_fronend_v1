"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Globe } from "lucide-react";
import { useQuerySync } from "@/hooks/useQuerySync";
import { useSearchParams, useRouter } from "next/navigation";
import { useListStatePersistence } from "@/hooks/use-list-state-persistence";

// Import hooks và context
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { useDocumentReadStatus } from "@/hooks/use-document-read-status";
import { usePageVisibility } from "@/hooks/use-page-visibility";
import { useUniversalReadStatus } from "@/hooks/use-universal-read-status";

// Import components
import { SearchFilters } from "./components/search-filters";
import { InternalDocumentsTable } from "./components/internal-documents-table";
import { ExternalDocumentsTable } from "./components/external-documents-table";
import { PaginationControls } from "./components/pagination-controls";

// Import hooks cho documents
import { useInternalDocuments } from "./hooks/use-internal-documents";
import { useExternalDocuments } from "./hooks/use-external-documents";
import { PrintInternalDocumentsButton } from "@/components/print/print-internal-documents-button";

// Import types
import { InternalDocument } from "@/lib/api/internalDocumentApi";

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

export default function OutgoingDocumentsPage() {
  // --- URL SYNCHRONIZED STATE ---
  // Query params mapping (see useQuerySync):
  // q, tab, page (1-based in URL), size, status, dept, year, month
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search và filter states - riêng biệt cho từng tab (activeSearchQuery = already applied)
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [externalSearchQuery, setExternalSearchQuery] = useState("");
  const [internalActiveSearchQuery, setInternalActiveSearchQuery] = useState("");
  const [externalActiveSearchQuery, setExternalActiveSearchQuery] = useState("");
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  // Filter states - separate current and active values
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined);
  const [activeYearFilter, setActiveYearFilter] = useState<number>(new Date().getFullYear());
  const [activeMonthFilter, setActiveMonthFilter] = useState<number | undefined>(undefined);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0); // 0-based internal
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("internal");

  // Hooks
  const { user, hasRole } = useAuth();
  const {
    visibleDepartments,
    loading: loadingDepartments,
    userDepartmentIds,
  } = useHierarchicalDepartments();

  const { subscribe, getReadStatus, updateMultipleReadStatus } =
    useDocumentReadStatus();
  const universalReadStatus = useUniversalReadStatus();
  const isPageVisible = usePageVisibility();

  // Custom hooks cho documents - sử dụng search riêng cho từng tab
  const internalDocsHook = useInternalDocuments({
    activeSearchQuery: internalActiveSearchQuery,
    currentPage,
    pageSize,
    getReadStatus,
    updateMultipleReadStatus,
    year: activeYearFilter,
    month: activeMonthFilter,
  });

  const externalDocsHook = useExternalDocuments({
    activeSearchQuery: externalActiveSearchQuery,
    currentPage,
    pageSize,
  });

  const hasFullAccess = hasRole([
    "ROLE_ADMIN",
    "ROLE_VAN_THU",
    "ROLE_CUC_TRUONG",
    "ROLE_CUC_PHO",
    "ROLE_CHINH_UY",
    "ROLE_PHO_CHINH_UY",
  ]);

  // ---------------- URL INITIAL APPLY (only once) ----------------
  const applyInitialFromURL = useCallback((parsed: any) => {
    if (parsed.tab === "internal" || parsed.tab === "external") {
      setActiveTab(parsed.tab);
    }
    if (typeof parsed.page === "number" && parsed.page >= 0) {
      setCurrentPage(parsed.page);
    }
    if (typeof parsed.size === "number" && [5,10,20,50].includes(parsed.size)) {
      setPageSize(parsed.size);
    }
    if (parsed.status) setStatusFilter(parsed.status);
    if (parsed.dept) setDepartmentFilter(parsed.dept);
    if (parsed.year) {
      setYearFilter(parsed.year);
      setActiveYearFilter(parsed.year);
    }
    if (parsed.month) {
      setMonthFilter(parsed.month);
      setActiveMonthFilter(parsed.month);
    }
    if (parsed.q) {
      // Apply to correct tab
      if (parsed.tab === "external") {
        setExternalSearchQuery(parsed.q);
        setExternalActiveSearchQuery(parsed.q);
      } else {
        setInternalSearchQuery(parsed.q);
        setInternalActiveSearchQuery(parsed.q);
      }
    }
  }, []);

  // Unified persistence hook
  useListStatePersistence({
    storageKey: "outgoing-docs-state",
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

  const { ready: queryReady } = useQuerySync({
    select: () => ({
      // Prefer live input (immediate feedback) then fallback to applied search
      q: (activeTab === "internal" ? internalSearchQuery : externalSearchQuery) || (activeTab === "internal" ? internalActiveSearchQuery : externalActiveSearchQuery) || undefined,
      tab: activeTab !== "internal" ? activeTab : undefined,
      page: currentPage || 0,
      size: pageSize !== 10 ? pageSize : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      dept: departmentFilter !== "all" ? departmentFilter : undefined,
      year: activeTab === "internal" && activeYearFilter !== new Date().getFullYear() ? activeYearFilter : undefined,
      month: activeTab === "internal" && activeMonthFilter ? activeMonthFilter : undefined,
    }),
    apply: applyInitialFromURL,
    defaults: { page: 0, size: 10, status: "all" },
  });

  // Add a refresh nonce similar to incoming documents page
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Effects (will respond to state + URL) – unified fetching approach
  useEffect(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  }, []);

  // Unified effect: handles filters, pagination, visibility, manual refresh
  useEffect(() => {
    if (!user || loadingDepartments || !queryReady || !isPageVisible) return;
    const t = setTimeout(() => {
      if (activeTab === "internal") {
        internalDocsHook.fetchInternalDocuments(currentPage, pageSize);
      } else {
        externalDocsHook.fetchExternalDocuments(currentPage, pageSize);
      }
    }, 60); // small debounce for rapid input changes
    return () => clearTimeout(t);
  }, [
    user?.id,
    activeTab,
    loadingDepartments,
    queryReady,
    isPageVisible,
    // filters / search
    statusFilter,
    departmentFilter,
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

  // Load read status
  // useEffect(() => {
  //   if (externalDocsHook.documents.length > 0) {
  //     const documentIds = externalDocsHook.documents
  //       .map((doc: any) => Number(doc.id))
  //       .filter((id: any) => !isNaN(id));
  //     if (documentIds.length > 0) {
  //       universalReadStatus.loadBatchReadStatus(
  //         documentIds,
  //         "OUTGOING_EXTERNAL"
  //       );
  //     }
  //   }
  // }, [externalDocsHook.documents.length]);

  useEffect(() => {
    // Seed read status directly from existing list (documents already include isRead)
    if (internalDocsHook.documents.length > 0) {
      universalReadStatus.seedReadStatuses(
        internalDocsHook.documents.map((d: any) => ({ id: d.id, isRead: d.isRead })),
        "OUTGOING_INTERNAL"
      );
    }
  }, [internalDocsHook.documents, universalReadStatus]);

  // Helper functions
  const getChildDepartmentIds = (departmentId: string) => {
    if (departmentId === "all") return [];
    const selectedDept = visibleDepartments.find(
      (d: any) => d.id.toString() === departmentId
    );
    if (!selectedDept) return [];

    const childIds: number[] = [];
    const collectChildIds = (dept: any) => {
      if (dept.children && dept.children.length > 0) {
        dept.children.forEach((child: any) => {
          childIds.push(child.id);
          collectChildIds(child);
        });
      }
    };

    collectChildIds(selectedDept);
    return [Number(departmentId), ...childIds];
  };

  // Search handlers - riêng biệt cho từng tab
  const handleSearch = () => {
    if (activeTab === "internal") {
      setInternalActiveSearchQuery(internalSearchQuery);
      // Apply filters at the same time when search
      setActiveYearFilter(yearFilter);
      setActiveMonthFilter(monthFilter);
    } else {
      setExternalActiveSearchQuery(externalSearchQuery);
    }
    setCurrentPage(0);
  };

  const handleApplyFilters = () => {
    // Apply year/month filters for internal tab
    if (activeTab === "internal") {
      setActiveYearFilter(yearFilter);
      setActiveMonthFilter(monthFilter);
      setCurrentPage(0);
    }
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
    setActiveTab(value);
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

  const handleYearFilterChange = (value: number) => {
    setYearFilter(value);
    // Không gọi API ngay, chỉ cập nhật state
  };

  const handleMonthFilterChange = (value: number | undefined) => {
    setMonthFilter(value);
    // Không gọi API ngay, chỉ cập nhật state
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setYearFilter(new Date().getFullYear());
    setMonthFilter(undefined);
    setActiveYearFilter(new Date().getFullYear());
    setActiveMonthFilter(undefined);
    setStatusFilter("all");
    setDepartmentFilter("all");
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

  // Cross-tab read status synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "universalReadStatusUpdate" && e.newValue) {
        try {
          const update = JSON.parse(e.newValue);
          if (update.documentType === "OUTGOING_INTERNAL" || update.documentType === "OUTGOING_EXTERNAL") {
            // Instead of refetching list just seed updated doc (optimistic)
            universalReadStatus.seedReadStatuses([
              { id: update.documentId, isRead: update.isRead }
            ], update.documentType);
          }
        } catch (error) {
          // Ignore invalid JSON
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      const update = e.detail;
      if (update.documentType === "OUTGOING_INTERNAL" || update.documentType === "OUTGOING_EXTERNAL") {
        universalReadStatus.seedReadStatuses([
          { id: update.documentId, isRead: update.isRead }
        ], update.documentType);
      }
    };

    // Listen for storage events (cross-tab)
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for custom events (same tab) 
    window.addEventListener("documentReadStatusChanged", handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("documentReadStatusChanged", handleCustomEvent as EventListener);
    };
  }, [activeTab, currentPage]);

  // Document click handlers
  const handleInternalDocumentClick = async (doc: InternalDocument) => {
    try {
      const currentReadStatus = universalReadStatus.getReadStatus(
        doc.id,
        "OUTGOING_INTERNAL"
      );

      // Persist current list state before navigating
      // Persistence handled by hook (autoSave)

      if (!currentReadStatus) {
        try {
          await universalReadStatus.markAsRead(doc.id, "OUTGOING_INTERNAL");
          
          // Trigger cross-tab sync
          if (typeof window !== "undefined") {
            const eventData = {
              documentId: doc.id,
              documentType: "OUTGOING_INTERNAL",
              isRead: true,
              timestamp: Date.now(),
              source: 'list-page-click'
            };
            
            localStorage.setItem("universalReadStatusUpdate", JSON.stringify(eventData));
            setTimeout(() => {
              localStorage.removeItem("universalReadStatusUpdate");
            }, 100);
            
            // Also dispatch custom event for immediate sync
            window.dispatchEvent(new CustomEvent("documentReadStatusChanged", {
              detail: eventData
            }));
          }
        } catch (markError) {
          // Continue even if marking fails
        }
      }

      router.push(`/van-ban-di/noi-bo/${doc.id}`);
    } catch (error) {
      router.push(`/van-ban-di/noi-bo/${doc.id}`);
    }
  };

  const handleExternalDocumentClick = async (doc: OutgoingDocument) => {
    try {
      const currentReadStatus = universalReadStatus.getReadStatus(
        Number(doc.id),
        "OUTGOING_EXTERNAL"
      );

      // Persist state
      // Persistence handled by hook

      if (!currentReadStatus) {
        try {
          await universalReadStatus.markAsRead(
            Number(doc.id),
            "OUTGOING_EXTERNAL"
          );
          
          // Trigger cross-tab sync
          if (typeof window !== "undefined") {
            const eventData = {
              documentId: Number(doc.id),
              documentType: "OUTGOING_EXTERNAL",
              isRead: true,
              timestamp: Date.now(),
              source: 'list-page-click'
            };
            
            localStorage.setItem("universalReadStatusUpdate", JSON.stringify(eventData));
            setTimeout(() => {
              localStorage.removeItem("universalReadStatusUpdate");
            }, 100);
            
            // Also dispatch custom event for immediate sync
            window.dispatchEvent(new CustomEvent("documentReadStatusChanged", {
              detail: eventData
            }));
          }
        } catch (markError) {
          // Continue even if marking fails
        }
      }

      router.push(`/van-ban-di/${doc.id}`);
    } catch (error) {
      router.push(`/van-ban-di/${doc.id}`);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    setRefreshNonce((n) => n + 1);
  };

  // Pagination handlers (no direct fetch calls; unified effect will run)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Get current state
  const isLoading = activeTab === "internal" ? 
    internalDocsHook.loading : 
    externalDocsHook.loading;

  const currentDocuments = activeTab === "internal" ? 
    internalDocsHook.documents : 
    externalDocsHook.documents;

  // Determine department filter visibility for external outgoing documents
  const isLeaderRole = hasRole(["ROLE_CUC_TRUONG","ROLE_CUC_PHO","ROLE_CHINH_UY","ROLE_PHO_CHINH_UY"]);
  const hasChildUnits = (visibleDepartments || []).some((d: any) => d.parentId === user?.departmentId);
  const showExternalDepartmentFilter = isLeaderRole || hasChildUnits;

  const filteredExternalDocuments = activeTab === "external" && departmentFilter !== "all" && showExternalDepartmentFilter
    ? externalDocsHook.documents.filter((doc: any) => doc.departmentId?.toString() === departmentFilter)
    : externalDocsHook.documents;

  const displayedDocuments = activeTab === "external" ? filteredExternalDocuments : internalDocsHook.documents;

  const totalItems = activeTab === "internal" ? 
    internalDocsHook.totalItems : 
    (activeTab === "external" && departmentFilter !== "all" && showExternalDepartmentFilter
      ? filteredExternalDocuments.length
      : externalDocsHook.totalItems);

  const totalPages = activeTab === "internal" ? 
    internalDocsHook.totalPages : 
    externalDocsHook.totalPages;

  // NOTE: Removed full-page blocking loader. Show loading only inside table panels.

  return (
    <div className="space-y-2">
      <SearchFilters
        searchQuery={activeTab === "internal" ? internalSearchQuery : externalSearchQuery}
        setSearchQuery={activeTab === "internal" ? setInternalSearchQuery : setExternalSearchQuery}
        activeSearchQuery={activeTab === "internal" ? internalActiveSearchQuery : externalActiveSearchQuery}
        departmentFilter={departmentFilter}
        yearFilter={yearFilter}
        monthFilter={monthFilter}
        statusFilter={statusFilter}
        activeTab={activeTab}
        hasFullAccess={hasFullAccess}
        visibleDepartments={visibleDepartments}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onSearchKeyPress={handleSearchKeyPress}
        onDepartmentFilterChange={handleDepartmentFilterChange}
        onYearFilterChange={handleYearFilterChange}
        onMonthFilterChange={handleMonthFilterChange}
        onApplyFilters={handleApplyFilters}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
        onTabChange={handleTabChange}
        // pass through show condition implicitly; component already checks hasFullAccess & activeTab
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

        <TabsContent value="internal" className="mt-0">
          <div className="flex items-center justify-between mb-4">
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
              documents={internalDocsHook.documents}
              isLoading={false}
              universalReadStatus={universalReadStatus}
              onDocumentClick={handleInternalDocumentClick}
              onDeleted={() => {
                // If last item on page deleted and not first page, go back a page
                if (internalDocsHook.documents.length === 1 && currentPage > 0) {
                  setCurrentPage((p) => Math.max(p - 1, 0));
                } else {
                  internalDocsHook.fetchInternalDocuments(currentPage, pageSize);
                }
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="external" className="mt-0">
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
              isLoading={false}
              hasFullAccess={hasFullAccess}
              universalReadStatus={universalReadStatus}
              onDocumentClick={handleExternalDocumentClick}
            />
          )}
        </TabsContent>
      </Tabs>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        documentsLength={displayedDocuments.length}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
