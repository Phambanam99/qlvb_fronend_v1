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
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
    (params: ScheduleListParams, showToast = false) => {
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


        schedulesAPI
          .getAllSchedules(params)
          .then((response) => {
            if (response.message === "Success" && response.data) {
              const paginatedData = response.data;
              const newSchedules: ScheduleDTO[] = paginatedData.content || [];

              setAllSchedules(newSchedules);
              setSchedules(newSchedules);
              setTotalElements(paginatedData.totalElements);
              setTotalPages(paginatedData.totalPages);

              // Only update page/size if they match the request
              if (params.page !== undefined) {
                setCurrentPage(params.page);
              }

              if (params.size !== undefined) {
                setPageSize(params.size);
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

  // Initial fetch - only runs once
  useEffect(() => {
    if (!loadingDepartments && !hasFetchedRef.current) {
      hasFetchedRef.current = true; // Set this first to prevent multiple initial fetches

      fetchSchedulesWithDebounce({
        page: 0,
        size: 20,
      });
    }
  }, [loadingDepartments, fetchSchedulesWithDebounce]);

  // Significantly simplified filter logic - now called manually via button
  const applyFilters = useCallback(
    (searchQuery: string, statusFilter: string, departmentFilter: string) => {
     

      // If department filter is selected, use general endpoint with departmentId parameter
      if (departmentFilter !== "all") {
        const deptId = Number(departmentFilter);
        if (!isNaN(deptId) && deptId > 0) {
         

          // Use general endpoint with department filter - more reliable
          const filterParams: ScheduleListParams = {
            page: 0,
            size: 20,
            departmentId: deptId,
          };

          if (searchQuery) {
            filterParams.search = searchQuery;
          }

          if (statusFilter !== "all") {
            filterParams.status = statusFilter;
          }

        
          fetchSchedulesWithDebounce(filterParams);
          return; // Exit early
        }
      }

      // Use general endpoint for other filters or when no department is selected
      const filterParams: ScheduleListParams = { page: 0, size: 20 };

      if (searchQuery) {
        filterParams.search = searchQuery;
      }

      if (statusFilter !== "all") {
        filterParams.status = statusFilter;
      }

      fetchSchedulesWithDebounce(filterParams);
    },
    [
      fetchSchedulesWithDebounce,
      visibleDepartments,
      setLoading,
      setSchedules,
      getSimplifiedStatus,
    ]
  );

  // Simplified page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      fetchSchedulesWithDebounce({ page, size: pageSize });
    },
    [pageSize, fetchSchedulesWithDebounce]
  );

  // Simplified page size change handler
  const handlePageSizeChange = useCallback(
    (size: number) => {
      fetchSchedulesWithDebounce({ page: 0, size });
    },
    [fetchSchedulesWithDebounce]
  );

  // Simplified force refresh
  const handleForceRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedulesWithDebounce({ page: currentPage, size: pageSize }, true);
  }, [currentPage, pageSize, fetchSchedulesWithDebounce]);

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
