"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  List,
  Calendar as CalendarIcon,
  CalendarDays,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { schedulesAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import ScheduleWeekView from "@/components/schedule-week-view";
import ScheduleMonthView from "@/components/schedule-month-view";
import ScheduleList from "@/components/schedule-list";
import { useSchedules } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import { usePageVisibility } from "@/hooks/use-page-visibility";

export default function SchedulesPage() {
  const { toast } = useToast();
  const { schedules, loading, setSchedules, setLoading } = useSchedules();
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const { hasRole } = useAuth();

  const {
    visibleDepartments,
    userDepartmentIds,
    loading: loadingDepartments,
    hasFullAccess,
  } = useHierarchicalDepartments();

  // Use page visibility for auto-refresh
  const isPageVisible = usePageVisibility();

  const hasFetchedSchedulesRef = useRef(false);
  const departmentIdsRef = useRef(userDepartmentIds);

  useEffect(() => {
    departmentIdsRef.current = userDepartmentIds;
  }, [userDepartmentIds]);

  // Force refresh function
  const forceRefreshSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      // console.log("Force refreshing schedules...");

      const data_ = await schedulesAPI.getAllSchedules();
      const data = data_.data;
      // console.log("Fetched schedules:", data);

      setAllSchedules(data.content || []);
      filterSchedules(data.content || []);

      toast({
        title: "Thành công",
        description: "Đã cập nhật danh sách lịch công tác",
      });
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch công tác. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, setSchedules, setLoading]);

  // Initial fetch
  useEffect(() => {
    if (loadingDepartments) {
      return;
    }

    // Skip initial fetch if we already have data
    if (hasFetchedSchedulesRef.current && allSchedules.length > 0) {
      return;
    }

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const data_ = await schedulesAPI.getAllSchedules();
        const data = data_.data;
        // console.log("Fetched schedules:", data);

        setAllSchedules(data.content || []);
        filterSchedules(data.content || []);

        hasFetchedSchedulesRef.current = true;
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải lịch công tác. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [toast, setSchedules, setLoading, loadingDepartments]);

  // Auto-refresh when page becomes visible (user returns from create page)
  useEffect(() => {
    if (isPageVisible && hasFetchedSchedulesRef.current) {
      // console.log("Page became visible, refreshing schedules...");
      // Small delay to ensure any pending operations are complete
      setTimeout(() => {
        forceRefreshSchedules();
      }, 100);
    }
  }, [isPageVisible, forceRefreshSchedules]);

  // Listen for storage events to refresh when schedules are created/updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "scheduleDataUpdate") {
        // console.log("Schedule data update detected, refreshing...");
        setTimeout(() => {
          forceRefreshSchedules();
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [forceRefreshSchedules]);

  const filterSchedules = (schedulesList = allSchedules) => {
    let filteredSchedules = [...schedulesList];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredSchedules = filteredSchedules.filter(
        (schedule) =>
          schedule.title?.toLowerCase().includes(query) ||
          schedule.description?.toLowerCase().includes(query) ||
          schedule.departmentName?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filteredSchedules = filteredSchedules.filter(
        (schedule) => schedule.status === statusFilter
      );
    }

    if (departmentFilter !== "all") {
      filteredSchedules = filteredSchedules.filter((schedule) => {
        const deptOfSchedule = visibleDepartments.find(
          (d) =>
            d.name === schedule.departmentName ||
            d.id === Number(schedule.departmentId)
        );
        if (!deptOfSchedule) return false;

        const selectedDept = visibleDepartments.find(
          (d) => d.id.toString() === departmentFilter
        );
        if (!selectedDept) return false;

        return (
          deptOfSchedule.id.toString() === departmentFilter ||
          deptOfSchedule.fullPath.includes(selectedDept.name)
        );
      });
    } else if (!hasFullAccess) {
      filteredSchedules = filteredSchedules.filter((schedule) => {
        const deptOfSchedule = visibleDepartments.find(
          (d) =>
            d.name === schedule.departmentName ||
            d.id === Number(schedule.departmentId)
        );
        return (
          deptOfSchedule && departmentIdsRef.current.includes(deptOfSchedule.id)
        );
      });
    }

    setSchedules(filteredSchedules);
  };

  useEffect(() => {
    if (!loadingDepartments && allSchedules.length > 0) {
      filterSchedules();
    }
  }, [searchQuery, statusFilter, departmentFilter, loadingDepartments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Dự thảo</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "approved":
        return <Badge variant="default">Đã duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="outline">Khác</Badge>;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lịch công tác</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={forceRefreshSchedules}
            disabled={refreshing}
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </Button>
          <Button asChild>
            <Link href="/lich-cong-tac/tao-moi">
              <Plus className="mr-2 h-4 w-4" />
              Tạo lịch mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm lịch..."
            className="w-full bg-background pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Dự thảo</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger
            className="w-full sm:w-[220px]"
            disabled={loadingDepartments}
          >
            <SelectValue placeholder="Đơn vị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đơn vị</SelectItem>
            {visibleDepartments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.level > 0 ? "\u00A0".repeat(dept.level * 2) + "└ " : ""}
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("week")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Tuần
        </Button>
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("month")}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Tháng
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
        >
          <List className="mr-2 h-4 w-4" />
          Danh sách
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="draft">Dự thảo</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {loading || loadingDepartments ? (
            <ScheduleSkeleton viewMode={viewMode} />
          ) : schedules.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {viewMode === "week" && (
                  <ScheduleWeekView
                    date={new Date()}
                    department={departmentFilter}
                    type="all"
                    schedules={schedules}
                  />
                )}
                {viewMode === "month" && (
                  <ScheduleMonthView
                    date={new Date()}
                    department={departmentFilter}
                    type="all"
                    schedules={schedules}
                  />
                )}
                {viewMode === "list" && (
                  <ScheduleList
                    date={new Date()}
                    department={departmentFilter}
                    type="all"
                    schedules={schedules}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy lịch công tác nào phù hợp
              </p>
              <Button asChild>
                <Link href="/lich-cong-tac/tao-moi">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo lịch mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          {loading || loadingDepartments ? (
            <ScheduleSkeleton viewMode={viewMode} />
          ) : (
            <Card>
              <CardContent className="p-0">
                {viewMode === "week" && (
                  <ScheduleWeekView
                    date={new Date()}
                    department={departmentFilter}
                    type="all"
                    schedules={schedules.filter((s) => s.status === "draft")}
                  />
                )}
                {viewMode === "month" && (
                  <ScheduleMonthView
                    date={new Date()}
                    department={departmentFilter}
                    type="all"
                    schedules={schedules.filter((s) => s.status === "draft")}
                  />
                )}
                {viewMode === "list" && (
                  <ScheduleList
                    date={new Date()}
                    department={departmentFilter}
                    type="all"
                    schedules={schedules.filter((s) => s.status === "draft")}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Các tab khác tương tự */}
      </Tabs>
    </div>
  );
}

function ScheduleSkeleton({
  viewMode,
}: {
  viewMode: "week" | "month" | "list";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        {viewMode === "list" ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : viewMode === "week" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-32 border rounded-md p-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array(35)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-24 border rounded-md p-1">
                    <Skeleton className="h-3 w-6 mb-1" />
                    {i % 5 === 0 && (
                      <>
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
