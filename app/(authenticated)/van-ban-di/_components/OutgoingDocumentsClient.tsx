"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { revalidateOutgoingDocuments } from "@/lib/actions/outgoing-documents.actions";

// Import existing components from van-ban-di
import { SearchFilters } from "../components/search-filters";
import { InternalDocumentsTable } from "../components/internal-documents-table";
import { ExternalDocumentsTable } from "../components/external-documents-table";
import { PaginationControls } from "../components/pagination-controls";

// Import hooks
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { useUniversalReadStatus } from "@/hooks/use-universal-read-status";

/**
 * Client Component for Outgoing Documents
 * Handles user interactions while receiving server-fetched initial data
 *
 * Architecture Benefits:
 * - Server Component fetches initial data (zero JS for initial fetching)
 * - Client Component handles interactions (tabs, filters, pagination)
 * - Uses Next.js router for URL state management
 * - Automatic revalidation and caching via Server Actions
 */

interface OutgoingDocumentsClientProps {
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

export function OutgoingDocumentsClient({
  initialData,
  initialPage,
  initialSize,
  initialSearch,
  initialTab,
  initialYear,
  initialMonth,
  initialDepartmentId,
}: OutgoingDocumentsClientProps) {
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

  // Year/month filters
  const [yearFilter, setYearFilter] = useState<number>(initialYear || new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<number | undefined>(initialMonth);

  // Other filters
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartmentId?.toString() || "all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Hooks
  const {
    visibleDepartments,
    loading: loadingDepartments,
  } = useHierarchicalDepartments();

  const universalReadStatus = useUniversalReadStatus();

  // Check permissions
  const hasFullAccess = hasRole([
    "ROLE_ADMIN",
    "ROLE_VAN_THU",
    "ROLE_CUC_TRUONG",
    "ROLE_CUC_PHO",
    "ROLE_CHINH_UY",
    "ROLE_PHO_CHINH_UY",
  ]);

  const isLeaderRole = hasRole(["ROLE_CUC_TRUONG","ROLE_CUC_PHO","ROLE_CHINH_UY","ROLE_PHO_CHINH_UY"]);
  const hasChildUnits = (visibleDepartments || []).some((d: any) => d.parentId === user?.departmentId);
  const showExternalDepartmentFilter = isLeaderRole || hasChildUnits;

  // Load read status for documents
  useEffect(() => {
    if (initialData.success && initialData.content.length > 0) {
      const documentType = activeTab === "internal" ? "OUTGOING_INTERNAL" : "OUTGOING_EXTERNAL";
      universalReadStatus.seedReadStatuses(
        initialData.content.map((d: any) => ({ id: d.id, isRead: d.isRead })),
        documentType
      );
    }
  }, [initialData.content, activeTab, universalReadStatus]);

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
      page: "0", // Reset to first page
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
   * Handle clear filters
   */
  const handleClearFilters = () => {
    const currentYear = new Date().getFullYear();
    setYearFilter(currentYear);
    setMonthFilter(undefined);
    setDepartmentFilter("all");
    setStatusFilter("all");
    setSearchQuery("");

    updateURL({
      search: undefined,
      year: undefined,
      month: undefined,
      departmentId: undefined,
      status: undefined,
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
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await revalidateOutgoingDocuments();
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
   * Handle internal document click
   */
  const handleInternalDocumentClick = async (doc: any) => {
    try {
      const currentReadStatus = universalReadStatus.getReadStatus(
        doc.id,
        "OUTGOING_INTERNAL"
      );

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

  /**
   * Handle external document click
   */
  const handleExternalDocumentClick = async (doc: any) => {
    try {
      const currentReadStatus = universalReadStatus.getReadStatus(
        Number(doc.id),
        "OUTGOING_EXTERNAL"
      );

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

  // Show error state
  if (!initialData.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Văn bản đi</h2>
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
    ? documents.filter((doc: any) => doc.departmentId?.toString() === departmentFilter)
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
      />

      {/* Document Tabs */}
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

        {/* Internal Documents Tab */}
        <TabsContent value="internal" className="mt-0">
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
              isLoading={false}
              universalReadStatus={universalReadStatus}
              onDocumentClick={handleInternalDocumentClick}
              onDeleted={handleRefresh}
            />
          )}
        </TabsContent>

        {/* External Documents Tab */}
        <TabsContent value="external" className="mt-0">
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
              isLoading={false}
              hasFullAccess={hasFullAccess}
              universalReadStatus={universalReadStatus}
              onDocumentClick={handleExternalDocumentClick}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <PaginationControls
        currentPage={initialPage}
        totalPages={totalPages}
        pageSize={initialSize}
        totalItems={totalItems}
        documentsLength={displayedDocuments.length}
        isLoading={isPending}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
