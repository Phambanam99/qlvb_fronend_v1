"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkPlanTable } from "./work-plan-table";
import type { WorkPlanDTO } from "@/lib/api/workPlans";
import Link from "next/link";

interface WorkPlanTabsProps {
  workPlans?: WorkPlanDTO[]; // Make optional để handle undefined case
  isLoading: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
  getWorkPlansByStatus: (status: string) => WorkPlanDTO[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onStart?: (workPlan: WorkPlanDTO) => void;
  onComplete?: (workPlan: WorkPlanDTO) => void;
}

export function WorkPlanTabs({
  workPlans = [], // Add default empty array
  isLoading,
  activeTab,
  onTabChange,
  getWorkPlansByStatus,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onStart,
  onComplete,
}: WorkPlanTabsProps) {
  // Đã bỏ empty state riêng ở đây để luôn hiển thị bảng (bảng tự xử lý trạng thái rỗng + nút tạo mới)

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="chua_dien_ra">Chưa diễn ra</TabsTrigger>
        <TabsTrigger value="dang_thuc_hien">Đang thực hiện</TabsTrigger>
        <TabsTrigger value="da_thuc_hien">Đã thực hiện</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-4">
        <WorkPlanTable
          workPlans={workPlans}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onStart={onStart}
          onComplete={onComplete}
        />
      </TabsContent>
    </Tabs>
  );
}
