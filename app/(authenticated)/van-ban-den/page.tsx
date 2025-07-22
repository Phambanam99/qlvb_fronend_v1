"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, Globe } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { useIncomingDocumentsData } from "./hooks/use-incoming-documents-data";
import { useBackendReadStatus } from "./hooks/useBackendReadStatus";

// Custom hooks
import { useDocumentFilters } from "./hooks/useDocumentFilters";
import { useDocumentHandlers } from "./hooks/useDocumentHandlers";

// Components
import { DocumentSearchFilters } from "./components/DocumentSearchFilters";
import { InternalDocumentsTable } from "./components/InternalDocumentsTable";
import { ExternalDocumentsTable } from "./components/ExternalDocumentsTable";
import { DocumentPagination } from "./components/DocumentPagination";

// Utils
import {
  formatDate,
  getDocumentCountByStatus,
  extractAvailableAuthorities,
} from "./utils/documentUtils";
import { testBackendReadStatus } from "./utils/testBackendReadStatus";

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

  // Local state
  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    "internal"
  );
  const [availableAuthorities, setAvailableAuthorities] = useState<string[]>(
    []
  );
  const [isAddLoading, setIsAddLoading] = useState(false);

  // Custom hooks
  const {
    filters,
    setSearchQuery,
    setStatusFilter,
    setDepartmentFilter,
    setProcessingStatusTab,
    setStartDate,
    setEndDate,
    setIssuingAuthorityFilter,
    resetFilters,
  } = useDocumentFilters();

  const documentHandlers = useDocumentHandlers({
    onInternalDocumentRead: async (docId: number) => {
      // Will implement when internal documents need read status
    },
    onExternalDocumentRead: async (docId: number) => {
      // Will be set after allDocuments is available
    },
    onExternalReadStatusToggle: async (docId: number) => {
      // Will be set after allDocuments is available
    },
    getExternalReadStatus: (docId: number) => {
      // Will be set after allDocuments is available
      return false;
    },
  });

  // Data hook
  const {
    currentDocuments,
    allDocuments,
    isLoading,
    error,
    pagination,
    updateFilters,
    updatePagination,
    refresh,
  } = useIncomingDocumentsData({
    activeTab,
    initialFilters: filters,
    initialPagination: {
      currentPage: 0,
      pageSize: 10,
    },
  });

  const { visibleDepartments, loading: loadingDepartments } =
    useHierarchicalDepartments();

  // Backend read status for external documents
  const externalReadStatus = useBackendReadStatus({
    documents: allDocuments || [],
    documentType: "INCOMING_EXTERNAL",
    enabled: activeTab === "external" && Boolean(allDocuments?.length),
  });

  console.log(
    "Page render - activeTab:",
    activeTab,
    "allDocuments length:",
    allDocuments?.length,
    "external read status enabled:",
    activeTab === "external" && Boolean(allDocuments?.length)
  );

  // Add test function to global scope for debugging
  useEffect(() => {
    (window as any).testBackendReadStatus = testBackendReadStatus;
  }, []);

  // Create handlers with backend read status
  const documentHandlersWithBackend = useDocumentHandlers({
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

  // Permission checks
  const hasFullAccess = FULL_ACCESS_ROLES.some((role) => hasRole(role));
  const hasVanThuRole = hasRole("ROLE_VAN_THU");

  // Handle URL parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "internal" || tabParam === "external") {
      setActiveTab(tabParam as "internal" | "external");
    }
  }, [searchParams]);

  // Update filters when local state changes
  useEffect(() => {
    updateFilters(filters);
  }, [filters, activeTab, updateFilters]);

  // Extract available authorities
  useEffect(() => {
    if (allDocuments && activeTab === "external") {
      const authorities = extractAvailableAuthorities(allDocuments);
      setAvailableAuthorities(authorities);
    }
  }, [allDocuments, activeTab]);

  // Handler functions
  const handleAddDocument = () => {
    setIsAddLoading(true);
    router.push("/van-ban-den/them-moi");
  };

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value as "internal" | "external");
  };

  const handlePageSizeChange = (pageSize: number) => {
    updatePagination({ pageSize, currentPage: 0 });
  };

  const handlePreviousPage = () => {
    updatePagination({
      currentPage: Math.max(0, pagination.currentPage - 1),
    });
  };

  const handleNextPage = () => {
    updatePagination({ currentPage: pagination.currentPage + 1 });
  };

  // Loading state
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
      {/* Search and Filters */}
      <DocumentSearchFilters
        searchQuery={filters.searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={filters.statusFilter}
        departmentFilter={filters.departmentFilter}
        startDate={filters.startDate}
        endDate={filters.endDate}
        issuingAuthorityFilter={filters.issuingAuthorityFilter}
        onStatusFilterChange={setStatusFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onIssuingAuthorityChange={setIssuingAuthorityFilter}
        visibleDepartments={visibleDepartments}
        availableAuthorities={availableAuthorities}
        activeTab={activeTab}
        hasFullAccess={hasFullAccess}
        hasVanThuRole={hasVanThuRole}
        isAddLoading={isAddLoading}
        onRefresh={refresh}
        onResetFilters={resetFilters}
        onAddDocument={handleAddDocument}
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
          <InternalDocumentsTable
            documents={currentDocuments}
            onDocumentClick={documentHandlers.handleInternalDocumentClick}
            formatDate={formatDate}
          />
        </TabsContent>

        {/* External Documents Tab */}
        <TabsContent value="external" className="mt-6">
          <ExternalDocumentsTable
            documents={currentDocuments}
            allDocuments={allDocuments}
            processingStatusTab={filters.processingStatusTab}
            onProcessingStatusTabChange={setProcessingStatusTab}
            onDocumentClick={
              documentHandlersWithBackend.handleExternalDocumentClick
            }
            onReadStatusToggle={
              documentHandlersWithBackend.handleExternalReadStatusToggle
            }
            getReadStatus={documentHandlersWithBackend.getExternalReadStatus}
            getDocumentCountByStatus={(statusKey) =>
              getDocumentCountByStatus(allDocuments || [], statusKey, activeTab)
            }
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <DocumentPagination
        currentDocumentsLength={currentDocuments?.length || 0}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        isLoading={isLoading}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
