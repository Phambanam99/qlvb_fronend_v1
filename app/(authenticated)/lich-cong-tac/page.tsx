"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScheduleData } from "@/hooks/use-schedule-data";
import { useScheduleFilters } from "@/hooks/use-schedule-filters";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
import { ScheduleTabs } from "@/components/schedule/schedule-tabs";
import { useState } from "react";

export default function SchedulesPage() {
  // Custom hooks for data management
  const {
    schedules,
    loading,
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
  } = useScheduleData();

  // Custom hooks for filter management
  const {
    // Date filters
    weekFilter,
    setWeekFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    
    // Existing filters
    departmentFilter,
    setDepartmentFilter,
    handleApplyFilters,
    isFiltering,
  } = useScheduleFilters({
    applyFilters,
    filterTimeoutRef,
    allSchedules,
    loadingDepartments,
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const simplifiedStatus = getSimplifiedStatus(status);

    switch (simplifiedStatus) {
      case "chua_dien_ra":
        return <Badge variant="secondary">Chưa diễn ra</Badge>;
      case "dang_thuc_hien":
        return <Badge variant="default">Đang thực hiện</Badge>;
      case "da_thuc_hien":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Đã thực hiện
          </Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getSchedulesByStatus = (status: string) => {
    return schedules.filter(
      (schedule) => getSimplifiedStatus(schedule.status) === status
    );
  };

  // View mode and computed date from filters
  const [viewMode, setViewMode] = useState<"week" | "month" | "table">("week");
  const computeDateFromFilters = () => {
    const yearNum = parseInt(yearFilter || "" + new Date().getFullYear());
    if (viewMode === "week" && weekFilter && weekFilter !== "all") {
      const weekNum = parseInt(weekFilter);
      const jan1 = new Date(yearNum, 0, 1);
      const jan1Day = jan1.getDay() || 7;
      const daysOffset = (weekNum - 1) * 7 - (jan1Day - 1);
      return new Date(yearNum, 0, 1 + daysOffset);
    }
    if (viewMode === "month" && monthFilter && monthFilter !== "all") {
      const monthNum = parseInt(monthFilter);
      return new Date(yearNum, monthNum - 1, 1);
    }
    return new Date();
  };
  const selectedDate = computeDateFromFilters();

  return (
    <div className="space-y-6">
      <ScheduleHeader
        refreshing={refreshing}
        onForceRefresh={handleForceRefresh}
      />

      {departmentsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">
            <strong>Lỗi tải đơn vị:</strong> {departmentsError}
          </p>
        </div>
      )}

      <ScheduleFilters
        // Date filters
        weekFilter={weekFilter}
        onWeekFilterChange={setWeekFilter}
        monthFilter={monthFilter}
        onMonthFilterChange={setMonthFilter}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        
        // Existing filters
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        visibleDepartments={visibleDepartments}
        loadingDepartments={loadingDepartments}
        onApplyFilters={handleApplyFilters}
        isFiltering={isFiltering}
      />

      {/* View mode toggler for Week/Month */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList>
          <TabsTrigger value="week">Tuần</TabsTrigger>
          <TabsTrigger value="month">Tháng</TabsTrigger>
          <TabsTrigger value="table">Danh sách</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScheduleTabs
        schedules={schedules}
        isLoading={loading}
        viewMode={viewMode}
        date={selectedDate}
        departmentFilter={departmentFilter}
        currentPage={currentPage}
        pageSize={pageSize}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
