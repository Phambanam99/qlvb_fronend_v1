import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useEffect } from "react";

interface ScheduleFiltersProps {
  // Date filters - thay thế search
  weekFilter: string;
  onWeekFilterChange: (value: string) => void;
  monthFilter: string;
  onMonthFilterChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
  
  // Existing filters
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  visibleDepartments: any[];
  loadingDepartments: boolean;
  onApplyFilters: () => void;
  isFiltering: boolean;
  hideDateFilters?: boolean;
  autoApply?: boolean; // if true, hide button and auto apply outside
}

export function ScheduleFilters({
  weekFilter,
  onWeekFilterChange,
  monthFilter,
  onMonthFilterChange,
  yearFilter,
  onYearFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  visibleDepartments,
  loadingDepartments,
  onApplyFilters,
  isFiltering,
  hideDateFilters = false,
  autoApply = false,
}: ScheduleFiltersProps) {
  // Auto-select first department if no department is selected and departments are loaded
  useEffect(() => {
    if (!loadingDepartments && visibleDepartments.length > 0 && departmentFilter === "all") {
      onDepartmentFilterChange(visibleDepartments[0].id.toString());
    }
  }, [loadingDepartments, visibleDepartments, departmentFilter, onDepartmentFilterChange]);

  // Generate years list (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Generate months list
  const months = [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  // Generate weeks list
  const weeks = Array.from({ length: 53 }, (_, i) => ({
    value: String(i + 1),
    label: `Tuần ${i + 1}`,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {!hideDateFilters && (
        <>
          <Select value={yearFilter} onValueChange={onYearFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={monthFilter}
            onValueChange={(value: string) => {
              onMonthFilterChange(value);
              if (value !== "all" && weekFilter !== "all") {
                onWeekFilterChange("all");
              }
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[140px]"
              disabled={weekFilter !== "all"}
            >
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tháng</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={weekFilter}
            onValueChange={(value: string) => {
              onWeekFilterChange(value);
              if (value !== "all" && monthFilter !== "all") {
                onMonthFilterChange("all");
              }
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[140px]"
              disabled={monthFilter !== "all"}
            >
              <SelectValue placeholder="Tuần" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tuần</SelectItem>
              {weeks.map((week) => (
                <SelectItem key={week.value} value={week.value}>
                  {week.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
        <SelectTrigger
          className="w-full sm:w-[300px]"
          disabled={loadingDepartments || visibleDepartments.length === 0}
        >
          <SelectValue
            placeholder={loadingDepartments ? "Đang tải..." : "Chọn đơn vị"}
          />
        </SelectTrigger>
        <SelectContent>
          {!loadingDepartments &&
          visibleDepartments &&
          visibleDepartments.length > 0
            ? visibleDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.level > 0 ? "\u00A0".repeat(dept.level * 2) + "└ " : ""}
                  {dept.name}
                </SelectItem>
              ))
            : !loadingDepartments && (
                <SelectItem value="no-departments" disabled>
                  Không có đơn vị nào
                </SelectItem>
              )}
        </SelectContent>
      </Select>

      {!autoApply && (
        <Button
          onClick={onApplyFilters}
          disabled={isFiltering || loadingDepartments}
          className="w-full sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isFiltering ? "Đang lọc..." : "Lọc"}
        </Button>
      )}
    </div>
  );
}
