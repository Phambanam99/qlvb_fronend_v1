import { useState, useCallback } from "react";

interface UseScheduleFiltersProps {
  applyFilters: (
    searchQuery: string,
    statusFilter: string,
    departmentFilter: string
  ) => void;
  filterTimeoutRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>;
  allSchedules: any[];
  loadingDepartments: boolean;
}

export function useScheduleFilters({
  applyFilters,
  filterTimeoutRef,
  allSchedules,
  loadingDepartments,
}: UseScheduleFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFiltering, setIsFiltering] = useState(false);

  // Manual filter application function
  const handleApplyFilters = useCallback(() => {
    setIsFiltering(true);

    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Apply filters after a short delay to show loading state
    filterTimeoutRef.current = setTimeout(() => {
      applyFilters(searchQuery, statusFilter, departmentFilter);
      setIsFiltering(false);
    }, 100);
  }, [
    searchQuery,
    statusFilter,
    departmentFilter,
    applyFilters,
    filterTimeoutRef,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    handleSearchChange,
    handleApplyFilters,
    isFiltering,
  };
}
