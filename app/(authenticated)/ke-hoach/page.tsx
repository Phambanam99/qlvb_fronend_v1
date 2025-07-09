"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workPlansAPI } from "@/lib/api/workPlans";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkPlanDTO } from "@/lib/api/workPlans";
import { useAuth } from "@/lib/auth-context";
import { useHierarchicalDepartments } from "@/hooks/use-hierarchical-departments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Play,
  CheckCircle,
  MoreVertical,
  RefreshCw,
} from "lucide-react";

export default function WorkPlansPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isForceUpdating, setIsForceUpdating] = useState(false);
  const [workPlans, setWorkPlans] = useState<WorkPlanDTO[]>([]);
  const [allWorkPlans, setAllWorkPlans] = useState<WorkPlanDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const hasFetchedWorkPlansRef = useRef(false);

  const {
    visibleDepartments,
    userDepartmentIds,
    loading: loadingDepartments,
    hasFullAccess,
  } = useHierarchicalDepartments();

  const userDepartmentIdsRef = useRef(userDepartmentIds);
  useEffect(() => {
    userDepartmentIdsRef.current = userDepartmentIds;
  }, [userDepartmentIds]);

  useEffect(() => {
    if (loadingDepartments) {
      return;
    }

    const fetchWorkPlans = async () => {
      if (hasFetchedWorkPlansRef.current && allWorkPlans.length > 0) {
        filterWorkPlans();
        return;
      }

      try {
        setIsLoading(true);

        const data_ = await workPlansAPI.getAllWorkPlans({
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchQuery || undefined,
        });
        const data = data_.data;

        setAllWorkPlans(data);
        filterWorkPlans(data);

        hasFetchedWorkPlansRef.current = true;
      } catch (error) {
        console.error("Error fetching work plans:", error);
        toast({
          title: "Lỗi",
          description:
            "Không thể tải danh sách kế hoạch. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        setWorkPlans([]);
        setAllWorkPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkPlans();
  }, [toast, loadingDepartments]);

  // Helper function to calculate overall progress from tasks
  const calculateOverallProgress = (tasks: WorkPlanTaskDTO[] | undefined) => {
    if (!tasks || tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  };

  const filterWorkPlans = (plans = allWorkPlans) => {
    let filteredPlans = [...plans];

    // Helper function to map status to simplified status based on both status and actual progress
    const getSimplifiedStatus = (workPlan: WorkPlanDTO) => {
      const progress = calculateOverallProgress(workPlan.tasks);
      
      // If progress is 100%, it should be "completed" regardless of backend status
      if (progress >= 100) {
        return "da_thuc_hien";
      }
      
      // If progress > 0, it should be "in progress" regardless of backend status (unless completed)
      if (progress > 0 && progress < 100) {
        return "dang_thuc_hien";
      }

      // Otherwise, use the backend status for classification
      const status = workPlan.status;
      if (["draft", "pending", "approved", "rejected", "chua_dien_ra"].includes(status)) {
        return "chua_dien_ra";
      } else if (["in_progress", "dang_thuc_hien"].includes(status)) {
        return "dang_thuc_hien";
      } else if (["completed", "da_thuc_hien"].includes(status)) {
        return "da_thuc_hien";
      }
      return "chua_dien_ra"; // default
    };

    // Filter by active tab first
    if (activeTab !== "all") {
      filteredPlans = filteredPlans.filter(
        (plan) => getSimplifiedStatus(plan) === activeTab
      );
    }

    if (statusFilter !== "all") {
      filteredPlans = filteredPlans.filter(
        (plan) => getSimplifiedStatus(plan) === statusFilter
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredPlans = filteredPlans.filter(
        (plan) =>
          plan.title.toLowerCase().includes(query) ||
          plan.department?.toLowerCase().includes(query)
      );
    }

    if (departmentFilter !== "all") {
      filteredPlans = filteredPlans.filter((plan) => {
        const deptOfPlan = visibleDepartments.find(
          (d) => d.name === plan.department
        );
        if (!deptOfPlan) return false;

        const selectedDept = visibleDepartments.find(
          (d) => d.id.toString() === departmentFilter
        );
        if (!selectedDept) return false;

        return (
          deptOfPlan.id.toString() === departmentFilter ||
          deptOfPlan.fullPath.includes(selectedDept.name)
        );
      });
    } else if (!hasFullAccess) {
      filteredPlans = filteredPlans.filter((plan) => {
        const deptOfPlan = visibleDepartments.find(
          (d) => d.name === plan.department
        );
        return (
          deptOfPlan && userDepartmentIdsRef.current.includes(deptOfPlan.id)
        );
      });
    }

    setWorkPlans(filteredPlans);
  };

  useEffect(() => {
    if (!loadingDepartments && allWorkPlans.length > 0) {
      filterWorkPlans();
    }
  }, [searchQuery, statusFilter, departmentFilter, loadingDepartments, activeTab]);

  const getStatusBadge = (workPlan: WorkPlanDTO) => {
    const progress = calculateOverallProgress(workPlan.tasks);
    let badgeVariant: any = "outline";
    let badgeText = "";

    // Use actual progress to determine display status
    if (progress >= 100) {
      badgeText = "Đã thực hiện";
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">{badgeText}</Badge>;
    } else if (progress > 0) {
      badgeVariant = "default";
      badgeText = "Đang thực hiện";
    } else {
      badgeVariant = "secondary";
      badgeText = "Chưa diễn ra";
    }

    return <Badge variant={badgeVariant}>{badgeText}</Badge>;
  };

  const handleStartWorkPlan = async (id: number) => {
    try {
      await workPlansAPI.startWorkPlan(id);
      toast({
        title: "Thành công",
        description: "Đã bắt đầu thực hiện kế hoạch",
      });
      // Refresh data
      hasFetchedWorkPlansRef.current = false;
      setAllWorkPlans([]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể bắt đầu kế hoạch",
        variant: "destructive",
      });
    }
  };

  const handleCompleteWorkPlan = async (id: number) => {
    try {
      await workPlansAPI.completeWorkPlan(id);
      toast({
        title: "Thành công",
        description: "Đã hoàn thành kế hoạch",
      });
      // Refresh data
      hasFetchedWorkPlansRef.current = false;
      setAllWorkPlans([]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hoàn thành kế hoạch",
        variant: "destructive",
      });
    }
  };

  const handleForceUpdateStatuses = async () => {
    try {
      setIsForceUpdating(true);
      await workPlansAPI.forceUpdateAllStatuses();
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái kế hoạch thành công.",
      });
      // Refresh data
      hasFetchedWorkPlansRef.current = false;
      setAllWorkPlans([]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái kế hoạch.",
        variant: "destructive",
      });
    } finally {
      setIsForceUpdating(false);
    }
  };

  const getActionButtons = (workPlan: WorkPlanDTO) => {
    const buttons = [];
    
    // Get simplified status based on actual progress
    const simplifiedStatus = getSimplifiedStatus(workPlan);
    
    // Xem chi tiết button luôn có
    buttons.push(
      <Button key="view" variant="ghost" size="sm" asChild>
        <Link href={`/ke-hoach/${workPlan.id}`}>
          Xem chi tiết
        </Link>
      </Button>
    );

    // Start button cho plans chưa diễn ra (và đã được duyệt)
    if (simplifiedStatus === "chua_dien_ra" && workPlan.status === "approved") {
      buttons.push(
        <Button
          key="start"
          variant="outline"
          size="sm"
          onClick={() => handleStartWorkPlan(workPlan.id)}
          className="ml-2"
        >
          <Play className="w-4 h-4 mr-1" />
          Bắt đầu
        </Button>
      );
    }

    // Complete button cho plans đang thực hiện
    if (simplifiedStatus === "dang_thuc_hien") {
      buttons.push(
        <Button
          key="complete"
          variant="outline"
          size="sm"
          onClick={() => handleCompleteWorkPlan(workPlan.id)}
          className="ml-2"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Hoàn thành
        </Button>
      );
    }

    return buttons;
  };

  const renderWorkPlanCard = (workPlan: WorkPlanDTO) => (
    <Card key={workPlan.id} className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">
              {workPlan.title}
            </CardTitle>
            <CardDescription>{workPlan.department}</CardDescription>
          </div>
          {getStatusBadge(workPlan)}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Bắt đầu</p>
            <p>
              {new Date(workPlan.startDate).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Kết thúc</p>
            <p>
              {new Date(workPlan.endDate).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          {getActionButtons(workPlan)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Kế hoạch công tác</h1>
        <div className="flex gap-2">
          {hasRole(["admin"]) && (
            <Button
              variant="outline"
              onClick={handleForceUpdateStatuses}
              disabled={isForceUpdating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isForceUpdating ? 'animate-spin' : ''}`} />
              {isForceUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
            </Button>
          )}
          <Button asChild>
            <Link href="/ke-hoach/tao-moi">
              <Plus className="mr-2 h-4 w-4" />
              Tạo kế hoạch mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm kế hoạch..."
            className="w-full bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="chua_dien_ra">Chưa diễn ra</TabsTrigger>
          <TabsTrigger value="dang_thuc_hien">Đang thực hiện</TabsTrigger>
          <TabsTrigger value="da_thuc_hien">Đã thực hiện</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {isLoading || loadingDepartments ? (
            <WorkPlansSkeleton />
          ) : workPlans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workPlans.map(renderWorkPlanCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy kế hoạch nào phù hợp
              </p>
              <Button asChild>
                <Link href="/ke-hoach/tao-moi">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo kế hoạch mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkPlansSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
