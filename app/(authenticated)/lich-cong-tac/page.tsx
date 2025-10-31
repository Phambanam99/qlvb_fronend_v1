"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScheduleData } from "@/hooks/use-schedule-data";
import { useScheduleFilters } from "@/hooks/use-schedule-filters";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
import { ScheduleTabs } from "@/components/schedule/schedule-tabs";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getISOWeek, getISOWeekYear } from "date-fns";

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



  // View mode and computed date from filters
  const [viewMode, setViewMode] = useState<"week" | "month" | "table">("week");
  const [scheduleScope, setScheduleScope] = useState<'all' | 'personal'>('all');
  
  // Track calendar display date independently to avoid race conditions with filter state
  const [calendarDisplayDate, setCalendarDisplayDate] = useState<Date>(() => {
    // Initialize to current week's Monday
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(now.setDate(diff));
  });

  // Track previous scope/department to avoid re-fetching on navigation filter changes
  const prevScopeRef = useRef(scheduleScope);
  const prevDepartmentRef = useRef(departmentFilter);

  // Chỉ refetch khi thay đổi scope (all/personal). Điều hướng tuần/tháng xử lý riêng.
  useEffect(() => {
    if (prevScopeRef.current !== scheduleScope) {
      prevScopeRef.current = scheduleScope;
      applyFilters({
        weekFilter,
        monthFilter,
        yearFilter,
        departmentFilter,
        scheduleScope,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleScope]);

  // Auto apply khi đổi đơn vị (departmentFilter)
  useEffect(() => {
    if (!departmentFilter) return;
    if (prevDepartmentRef.current !== departmentFilter) {
      prevDepartmentRef.current = departmentFilter;
      applyFilters({
        weekFilter,
        monthFilter,
        yearFilter,
        departmentFilter,
        scheduleScope,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentFilter]);

  // Handle calendar navigation: compute corresponding week/month + year, update filters then fetch
  // Track last applied visible range to suppress duplicate or oscillating fetches
  const lastRangeRef = useRef<{start:number;end:number;mode:'week'|'month'} | null>(null);

  const handleDateRangeChange = useCallback((start: Date, end: Date, mode: 'week' | 'month') => {
    const startMs = start.getTime();
    const endMs = end.getTime();
    if (lastRangeRef.current &&
        lastRangeRef.current.start === startMs &&
        lastRangeRef.current.end === endMs &&
        lastRangeRef.current.mode === mode) {
      return; // identical range already handled
    }
    const startDate = new Date(start);
    if (mode === 'week') {
      // Use date-fns ISO week helpers for consistency with backend expectations
      const weekNo = getISOWeek(startDate);
      const isoYear = getISOWeekYear(startDate).toString();
      
      // Guard: if nothing actually changes, skip to avoid loops
      if (
        weekFilter === String(weekNo) &&
        yearFilter === isoYear &&
        monthFilter === 'all'
      ) {
        lastRangeRef.current = {start:startMs,end:endMs,mode};
        return;
      }
      
      setCalendarDisplayDate(startDate); // Update display date immediately
      setYearFilter(isoYear);
      setWeekFilter(String(weekNo));
      setMonthFilter('all');
      applyFilters({
        weekFilter: String(weekNo),
        monthFilter: 'all',
        yearFilter: isoYear,
        departmentFilter,
        scheduleScope,
      });
      lastRangeRef.current = {start:startMs,end:endMs,mode};
    } else if (mode === 'month') {
      // FullCalendar month view's visible range start (activeStart) thường là cuối/tháng trước.
      // Lấy midpoint của khoảng (start..end) để chắc chắn nằm trong tháng thực sự.
      const midTime = start.getTime() + (end.getTime() - start.getTime()) / 2;
      const midDate = new Date(midTime);
      const realMonth = (midDate.getMonth() + 1).toString();
      const realYear = midDate.getFullYear().toString();
      
      if (
        monthFilter === realMonth &&
        yearFilter === realYear &&
        weekFilter === 'all'
      ) {
        lastRangeRef.current = {start:startMs,end:endMs,mode};
        return; // Không thay đổi gì → tránh vòng lặp & double shift cảm giác
      }
      
      setCalendarDisplayDate(midDate); // Update display date immediately
      setYearFilter(realYear);
      setMonthFilter(realMonth);
      setWeekFilter('all');
      applyFilters({
        weekFilter: 'all',
        monthFilter: realMonth,
        yearFilter: realYear,
        departmentFilter,
        scheduleScope,
      });
      lastRangeRef.current = {start:startMs,end:endMs,mode};
    }
  }, [applyFilters, departmentFilter, scheduleScope, setWeekFilter, setMonthFilter, setYearFilter, weekFilter, monthFilter, yearFilter]);

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
        weekFilter={weekFilter}
        onWeekFilterChange={setWeekFilter}
        monthFilter={monthFilter}
        onMonthFilterChange={setMonthFilter}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        visibleDepartments={visibleDepartments}
        loadingDepartments={loadingDepartments}
        onApplyFilters={handleApplyFilters}
        isFiltering={isFiltering}
        hideDateFilters
        autoApply
      />

      {/* View mode toggler for Week/Month */}
      <div className="flex items-center gap-4 flex-wrap">
        <Tabs value={scheduleScope} onValueChange={(v) => setScheduleScope(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="personal">Cá nhân</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="week">Tuần</TabsTrigger>
            <TabsTrigger value="month">Tháng</TabsTrigger>
            <TabsTrigger value="table">Danh sách</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScheduleTabs
        schedules={schedules}
        isLoading={loading}
        viewMode={viewMode}
        date={calendarDisplayDate}
        departmentFilter={departmentFilter}
        currentPage={currentPage}
        pageSize={pageSize}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
}
