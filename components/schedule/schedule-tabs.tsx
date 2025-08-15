import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleWeekView from "@/components/schedule-week-view";
import ScheduleMonthView from "@/components/schedule-month-view";
import dynamic from "next/dynamic";

const FullCalendarView = dynamic(() => import("@/components/schedule/fullcalendar-view"), { ssr: false });
import ScheduleList from "@/components/schedule-list";
import { ScheduleSkeleton } from "./schedule-skeleton";
import { EmptyState } from "./empty-state";
import { SchedulePagination } from "./schedule-pagination";
import { ScheduleTable } from "./schedule-table";

type ViewMode = "week" | "month" | "list" | "table";

interface ScheduleTabsProps {
  schedules: any[];
  isLoading: boolean;
  viewMode: ViewMode;
  date: Date;
  departmentFilter: string;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ScheduleTabs({
  schedules,
  isLoading,
  viewMode,
  date,
  departmentFilter,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ScheduleTabsProps) {
  const renderScheduleView = (scheduleList: any[]) => {
    if (isLoading) {
      return <ScheduleSkeleton viewMode={viewMode} />;
    }

    if (scheduleList.length === 0) {
      return <EmptyState />;
    }

    // For table view, render the table directly with pagination
    if (viewMode === "table") {
      return (
        <ScheduleTable
          schedules={scheduleList}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            {viewMode === "week" && (
              <FullCalendarView mode="week" date={date} schedules={scheduleList} />
            )}
            {viewMode === "month" && (
              <FullCalendarView mode="month" date={date} schedules={scheduleList} />
            )}
            {viewMode === "list" && (
              <ScheduleList
                date={new Date()}
                department={departmentFilter}
                type="all"
                schedules={scheduleList}
              />
            )}
          </CardContent>
        </Card>

        {/* Show pagination only for list view and when there are results */}
        {viewMode === "list" && scheduleList.length > 0 && (
          <SchedulePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className="mt-4">{renderScheduleView(schedules)}</div>
  );
}
