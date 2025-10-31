import { useEffect, useState, useRef, useCallback } from "react";
import {
  ResponseDTO,
  ScheduleDTO,
  schedulesAPI,
  ScheduleListParams,
  PaginatedScheduleResponse,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useSchedules } from "@/lib/store";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { usePageVisibility } from "@/hooks/use-page-visibility";

export function useScheduleData() {
  const { toast } = useToast();
  const { schedules, loading, setSchedules, setLoading } = useSchedules();
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Helper để lấy tuần hiện tại
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  const getCurrentYear = () => new Date().getFullYear().toString();

  // Add state for current filters to pass to API - mặc định tuần hiện tại
  const [currentFilters, setCurrentFilters] = useState<{
    weekFilter?: string;
    monthFilter?: string;
    yearFilter?: string;
    departmentFilter?: string;
    scheduleScope?: string;
  }>({
    weekFilter: getCurrentWeek().toString(),
    monthFilter: "all",
    yearFilter: getCurrentYear(),
    departmentFilter: "all",
    scheduleScope: "all",
  });

  // Refs to prevent infinite loops
  const hasFetchedRef = useRef(false);
  const isFilteringRef = useRef(false);
  const filterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiCallInProgressRef = useRef(false); // New ref to track API calls
  const apiDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const {
    visibleDepartments,
    userDepartmentIds,
    loading: loadingDepartments,
    hasFullAccess,
    error: departmentsError,
    allDepartments,
  } = useHierarchicalDepartments();

  const isPageVisible = usePageVisibility();

  // Auto-update currentFilters when departments load and departmentFilter is still "all"
  useEffect(() => {
    if (
      !loadingDepartments &&
      visibleDepartments.length > 0 &&
      currentFilters.departmentFilter === "all"
    ) {
      setCurrentFilters((prev) => ({
        ...prev,
        departmentFilter: visibleDepartments[0].id.toString(),
      }));
    }
  }, [loadingDepartments, visibleDepartments, currentFilters.departmentFilter]);

  // Debug visibleDepartments to see if they're loading
  useEffect(() => {
    if (departmentsError) {
    }
  }, [
    visibleDepartments,
    loadingDepartments,
    departmentsError,
    allDepartments,
    hasFullAccess,
  ]);

  // Helper function to get simplified status
  const getSimplifiedStatus = useCallback((status: string) => {
    if (
      ["draft", "pending", "submitted", "rejected", "chua_dien_ra"].includes(
        status
      )
    ) {
      return "chua_dien_ra";
    } else if (["approved", "dang_thuc_hien"].includes(status)) {
      return "dang_thuc_hien";
    } else if (["completed", "da_thuc_hien"].includes(status)) {
      return "da_thuc_hien";
    }
    return "chua_dien_ra";
  }, []);

  // SINGLE CENTRALIZED API CALL FUNCTION - all API calls must go through this
  const fetchSchedulesWithDebounce = useCallback(
    (
      apiCall: () => Promise<ResponseDTO<PaginatedScheduleResponse>>,
      requestInfo: { page?: number; size?: number },
      showToast = false
    ) => {
      // Clear any existing timer
      if (apiDebounceTimerRef.current) {
        clearTimeout(apiDebounceTimerRef.current);
      }

      // If an API call is already in progress, don't start another one
      if (apiCallInProgressRef.current) {
        return;
      }

      // Set a timer to make the actual API call
      apiDebounceTimerRef.current = setTimeout(() => {
        // Mark that an API call is in progress
        apiCallInProgressRef.current = true;
        setLoading(true);

        apiCall()
          .then((response) => {
            if (response.message === "Success" && response.data) {
              const paginatedData = response.data;
              const newSchedules: ScheduleDTO[] = paginatedData.content || [];

              setAllSchedules(newSchedules);
              setSchedules(newSchedules);
              setTotalElements(paginatedData.totalElements);
              setTotalPages(paginatedData.totalPages);

              // Only update page/size if they match the request
              if (requestInfo.page !== undefined) {
                setCurrentPage(requestInfo.page);
              }

              if (requestInfo.size !== undefined) {
                setPageSize(requestInfo.size);
              }

              if (showToast) {
                toast({
                  title: "Thành công",
                  description: "Đã cập nhật danh sách lịch công tác",
                });
              }
            }
          })
          .catch((error) => {
            if (showToast) {
              toast({
                title: "Lỗi",
                description:
                  "Không thể tải lịch công tác. Vui lòng thử lại sau.",
                variant: "destructive",
              });
            }
          })
          .finally(() => {
            setLoading(false);
            setRefreshing(false);
            // Reset the API call flag after a short delay
            setTimeout(() => {
              apiCallInProgressRef.current = false;
            }, 500);
          });
      }, 300); // Debounce by 300ms
    },
    [setLoading, setSchedules, toast]
  );

  // Note: Initial fetch is now handled by filters auto-applying default values

  // Helper function to build API call based on filters
  const buildApiCall = useCallback(
    (
      weekFilter: string | undefined,
      monthFilter: string | undefined,
      yearFilter: string | undefined,
      departmentId: number | undefined,
      page: number,
      size: number
    ): (() => Promise<ResponseDTO<PaginatedScheduleResponse>>) => {
      // CHỈ GET khi có departmentId
      if (!departmentId) {
        // Trả về empty result nếu không có department
        return () =>
          Promise.resolve({
            message: "Success",
            success: true,
            data: {
              content: [],
              pageable: { pageNumber: 0, pageSize: size, sort: [], offset: 0 },
              totalElements: 0,
              totalPages: 0,
              size: size,
              number: 0,
              sort: [],
              numberOfElements: 0,
            },
          });
      }

      // LUÔN LUÔN dùng endpoint có department
      if (
        weekFilter &&
        weekFilter !== "all" &&
        yearFilter &&
        yearFilter !== "all"
      ) {
        const year = parseInt(yearFilter);
        const week = parseInt(weekFilter);
        return () =>
          schedulesAPI.getSchedulesByDepartmentAndWeek(
            departmentId,
            year,
            week,
            { page, size }
          );
      } else if (
        monthFilter &&
        monthFilter !== "all" &&
        yearFilter &&
        yearFilter !== "all"
      ) {
        const year = parseInt(yearFilter);
        const month = parseInt(monthFilter);
        return () =>
          schedulesAPI.getSchedulesByDepartmentAndMonth(
            departmentId,
            year,
            month,
            { page, size }
          );
      } else if (yearFilter && yearFilter !== "all") {
        const year = parseInt(yearFilter);
        return () =>
          schedulesAPI.getSchedulesByDepartmentAndYear(departmentId, year, {
            page,
            size,
          });
      } else {
        // Fallback: dùng getAllSchedules với departmentId filter
        const params: ScheduleListParams = { page, size, departmentId };
        return () => schedulesAPI.getAllSchedules(params);
      }
    },
    []
  );

  // Significantly simplified filter logic - now called manually via button
  const applyFilters = useCallback(
    (filters: {
      weekFilter?: string;
      monthFilter?: string;
      yearFilter?: string;
      departmentFilter?: string;
      scheduleScope?: string;
    }) => {
      // Store current filters for pagination
      setCurrentFilters(filters);

      // Reset to first page
      setCurrentPage(0);

      const page = 0;
      const size = pageSize;

      // Determine department filter
      let departmentId: number | undefined;
      if (filters?.departmentFilter && filters.departmentFilter !== "all") {
        departmentId = parseInt(filters.departmentFilter);
      } else if (!hasFullAccess && userDepartmentIds.length > 0) {
        departmentId = userDepartmentIds[0];
      }

      // Build API call using helper
      const apiCall = buildApiCall(
        filters?.weekFilter,
        filters?.monthFilter,
        filters?.yearFilter,
        departmentId,
        page,
        size
      );

      fetchSchedulesWithDebounce(apiCall, { page, size });
    },
    [
      fetchSchedulesWithDebounce,
      pageSize,
      hasFullAccess,
      userDepartmentIds,
      buildApiCall,
    ]
  );

  // Simplified page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);

      const size = pageSize;

      // Determine department filter from current filters
      let departmentId: number | undefined;
      if (
        currentFilters?.departmentFilter &&
        currentFilters.departmentFilter !== "all"
      ) {
        departmentId = parseInt(currentFilters.departmentFilter);
      } else if (!hasFullAccess && userDepartmentIds.length > 0) {
        departmentId = userDepartmentIds[0];
      }

      // Build API call using helper
      const apiCall = buildApiCall(
        currentFilters?.weekFilter,
        currentFilters?.monthFilter,
        currentFilters?.yearFilter,
        departmentId,
        page,
        size
      );

      fetchSchedulesWithDebounce(apiCall, { page, size });
    },
    [
      pageSize,
      fetchSchedulesWithDebounce,
      currentFilters,
      hasFullAccess,
      userDepartmentIds,
      buildApiCall,
    ]
  );

  // Simplified page size change handler
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(0);

      const page = 0;

      // Determine department filter from current filters
      let departmentId: number | undefined;
      if (
        currentFilters?.departmentFilter &&
        currentFilters.departmentFilter !== "all"
      ) {
        departmentId = parseInt(currentFilters.departmentFilter);
      } else if (!hasFullAccess && userDepartmentIds.length > 0) {
        departmentId = userDepartmentIds[0];
      }

      // Build API call using helper
      const apiCall = buildApiCall(
        currentFilters?.weekFilter,
        currentFilters?.monthFilter,
        currentFilters?.yearFilter,
        departmentId,
        page,
        size
      );

      fetchSchedulesWithDebounce(apiCall, { page, size });
    },
    [
      fetchSchedulesWithDebounce,
      currentFilters,
      hasFullAccess,
      userDepartmentIds,
      buildApiCall,
    ]
  );

  // Simplified force refresh
  const handleForceRefresh = useCallback(() => {
    setRefreshing(true);

    const page = currentPage;
    const size = pageSize;

    // Determine department filter from current filters
    let departmentId: number | undefined;
    if (
      currentFilters?.departmentFilter &&
      currentFilters.departmentFilter !== "all"
    ) {
      departmentId = parseInt(currentFilters.departmentFilter);
    } else if (!hasFullAccess && userDepartmentIds.length > 0) {
      departmentId = userDepartmentIds[0];
    }

    // Build API call using helper
    const apiCall = buildApiCall(
      currentFilters?.weekFilter,
      currentFilters?.monthFilter,
      currentFilters?.yearFilter,
      departmentId,
      page,
      size
    );

    fetchSchedulesWithDebounce(apiCall, { page, size }, true);
  }, [
    currentPage,
    pageSize,
    fetchSchedulesWithDebounce,
    currentFilters,
    hasFullAccess,
    userDepartmentIds,
    buildApiCall,
  ]);

  return {
    schedules,
    loading: loading || loadingDepartments,
    refreshing,
    visibleDepartments,
    loadingDepartments,
    departmentsError,
    allSchedules,
    applyFilters,
    handleForceRefresh,
    getSimplifiedStatus,
    filterTimeoutRef,
    // Pagination properties
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
}
