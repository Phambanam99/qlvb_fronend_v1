import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  visibleDepartments: any[];
  loadingDepartments: boolean;
  onApplyFilters: () => void;
  isFiltering: boolean;
}

export function ScheduleFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  visibleDepartments,
  loadingDepartments,
  onApplyFilters,
  isFiltering,
}: ScheduleFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Re-enabled search field */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm lịch..."
          className="w-full bg-background pl-8"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      {/* Re-enabled status filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="chua_dien_ra">Chưa diễn ra</SelectItem>
          <SelectItem value="dang_thuc_hien">Đang thực hiện</SelectItem>
          <SelectItem value="da_thuc_hien">Đã thực hiện</SelectItem>
        </SelectContent>
      </Select>

      <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
        <SelectTrigger
          className="w-full sm:w-[300px]"
          disabled={loadingDepartments}
        >
          <SelectValue
            placeholder={loadingDepartments ? "Đang tải..." : "Chọn đơn vị"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả đơn vị</SelectItem>
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

      {/* Filter button */}
      <Button
        onClick={onApplyFilters}
        disabled={isFiltering || loadingDepartments}
        className="w-full sm:w-auto"
      >
        <Filter className="h-4 w-4 mr-2" />
        {isFiltering ? "Đang lọc..." : "Lọc"}
      </Button>
    </div>
  );
}
