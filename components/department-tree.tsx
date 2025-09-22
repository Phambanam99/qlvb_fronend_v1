"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Users,
  Building2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type DepartmentNode,
  DepartmentUser,
} from "@/hooks/use-department-selection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDTO } from "@/lib/api";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  departments: DepartmentNode[];
  expandedDepartments: Set<number>;
  toggleDepartment: (deptId: number) => void;
  onSelectPrimaryDepartment?: (deptId: number) => void;
  onSelectSecondaryDepartment?: (deptId: number) => void;
  primaryDepartment?: number | null;
  secondaryDepartments?: number[];
  departmentUsers?: Record<number, UserDTO[]>;
  isLoadingUsers?: Record<number, boolean>;
  onDepartmentExpand?: (deptId: number) => void;
  getLeadershipRole?: (user: UserDTO) => string | null;
  getRoleDisplayName?: (role: string) => string;
  selectionMode?: "primary" | "secondary" | "both" | "none";
  maxHeight?: string;
  className?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export function DepartmentTree({
  departments,
  expandedDepartments,
  toggleDepartment,
  onSelectPrimaryDepartment,
  onSelectSecondaryDepartment,
  primaryDepartment,
  secondaryDepartments = [],
  departmentUsers = {},
  isLoadingUsers = {},
  onDepartmentExpand,
  getLeadershipRole,
  getRoleDisplayName,
  selectionMode = "both",
  maxHeight = "400px",
  className,
  primaryButtonText,
  secondaryButtonText,
}: Props) {
  // Custom sorting: Thủ trưởng Cục → Phòng 1,6,7 → Cụm 3,4,5 → Trạm 31,37,39 → còn lại (ABC)
  const getDeptPriority = (name: string): { group: number; order: number; nameKey: string } => {
    const n = (name || "").trim();
    const ascii = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lower = ascii.toLowerCase();

    // 0: Thủ trưởng Cục (exact)
    if (/^\s*thu\s*truong\s*cuc\s*$/.test(lower)) {
      return { group: 0, order: 0, nameKey: lower };
    }

    // 1: Phòng 1,6,7 (in this order)
    const phongNum = lower.match(/^\s*phong\s*(\d+)/);
    if (phongNum) {
      const num = Number(phongNum[1]);
      const desiredOrder = [1, 6, 7, 9];
      const idx = desiredOrder.indexOf(num);
      if (idx !== -1) {
        return { group: 1, order: idx, nameKey: lower };
      }
      // Other numbered rooms will fall through to "còn lại"
    }

    // 2: Phòng Tham mưu
    if (/^\s*phong\s*tham\s*m[u]u/.test(lower) || lower.includes("phong tham muu")) {
      return { group: 2, order: 0, nameKey: lower };
    }

    // 3: Phòng Chính trị
    if (/^\s*phong\s*chinh\s*tri/.test(lower)) {
      return { group: 3, order: 0, nameKey: lower };
    }

    // 4: Cụm 3,4,5
    const cumNum = lower.match(/^\s*cum\s*(\d+)/);
    if (cumNum) {
      const num = Number(cumNum[1]);
      const desiredOrder = [3, 4, 5];
      const idx = desiredOrder.indexOf(num);
      if (idx !== -1) {
        return { group: 4, order: idx, nameKey: lower };
      }
    }

    // 5: Trạm 31,37,39
    const tramNum = lower.match(/^\s*tram\s*(\d+)/);
    if (tramNum) {
      const num = Number(tramNum[1]);
      const desiredOrder = [31, 37, 39];
      const idx = desiredOrder.indexOf(num);
      if (idx !== -1) {
        return { group: 5, order: idx, nameKey: lower };
      }
    }

    // 6: Còn lại → theo ABC
    return { group: 6, order: 0, nameKey: lower };
  };

  const sortDepartments = (items: DepartmentNode[] = []): DepartmentNode[] => {
    return [...items]
      .sort((a, b) => {
        const pa = getDeptPriority(a.name);
        const pb = getDeptPriority(b.name);
        if (pa.group !== pb.group) return pa.group - pb.group;
        if (pa.order !== pb.order) return pa.order - pb.order;
        return pa.nameKey.localeCompare(pb.nameKey, "vi");
      })
      .map((dept) => ({
        ...dept,
        children: dept.children && dept.children.length > 0 ? sortDepartments(dept.children) : dept.children,
      }));
  };

  const sortedDepartments = sortDepartments(departments);
  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium">
          Không có phòng ban nào
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Danh sách phòng ban đang trống
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="w-full overflow-y-auto"
        style={{
          maxHeight,
          height: "100%",
        }}
      >
        <div className="space-y-1 py-2 pr-4">
          {sortedDepartments.map((dept) => (
            <DepartmentNode
              key={dept.id}
              department={dept}
              level={0}
              expandedDepartments={expandedDepartments}
              toggleDepartment={toggleDepartment}
              onSelectPrimaryDepartment={onSelectPrimaryDepartment}
              onSelectSecondaryDepartment={onSelectSecondaryDepartment}
              primaryDepartment={primaryDepartment}
              secondaryDepartments={secondaryDepartments}
              departmentUsers={departmentUsers}
              isLoadingUsers={isLoadingUsers}
              onDepartmentExpand={onDepartmentExpand}
              getLeadershipRole={getLeadershipRole}
              getRoleDisplayName={getRoleDisplayName}
              selectionMode={selectionMode}
              primaryButtonText={primaryButtonText}
              secondaryButtonText={secondaryButtonText}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DepartmentNodeProps {
  department: DepartmentNode;
  level: number;
  expandedDepartments: Set<number>;
  toggleDepartment: (deptId: number) => void;
  onSelectPrimaryDepartment?: (deptId: number) => void;
  onSelectSecondaryDepartment?: (deptId: number) => void;
  primaryDepartment?: number | null;
  secondaryDepartments?: number[];
  departmentUsers?: Record<number, UserDTO[]>;
  isLoadingUsers?: Record<number, boolean>;
  onDepartmentExpand?: (deptId: number) => void;
  getLeadershipRole?: (user: UserDTO) => string | null;
  getRoleDisplayName?: (role: string) => string;
  selectionMode?: "primary" | "secondary" | "both" | "none";
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

function DepartmentNode({
  department,
  level,
  expandedDepartments,
  toggleDepartment,
  onSelectPrimaryDepartment,
  onSelectSecondaryDepartment,
  primaryDepartment,
  secondaryDepartments = [],
  departmentUsers,
  isLoadingUsers,
  onDepartmentExpand,
  getLeadershipRole,
  getRoleDisplayName,
  selectionMode = "both",
  primaryButtonText,
  secondaryButtonText,
}: DepartmentNodeProps) {
  const isExpanded = expandedDepartments.has(department.id);
  const hasChildren = department.children && department.children.length > 0;
  const isPrimary = primaryDepartment === department.id;
  const isSecondary = secondaryDepartments.includes(department.id);
  const users = departmentUsers?.[department.id] || [];
  const isLoading = isLoadingUsers?.[department.id] || false;

  useEffect(() => {
    if (isExpanded && onDepartmentExpand) {
      onDepartmentExpand(department.id);
    }
  }, [isExpanded, department.id, onDepartmentExpand]);

  const handleToggle = () => {
    toggleDepartment(department.id);
  };

  const handleSelectPrimary = () => {
    if (
      onSelectPrimaryDepartment &&
      (selectionMode === "primary" || selectionMode === "both")
    ) {
      onSelectPrimaryDepartment(department.id);
    }
  };

  const handleSelectSecondary = () => {
    if (
      onSelectSecondaryDepartment &&
      (selectionMode === "secondary" || selectionMode === "both")
    ) {
      onSelectSecondaryDepartment(department.id);
    }
  };

  return (
    <div className="department-node">
      <div
        className={cn(
          "group flex items-center py-2.5 px-3 rounded-lg border transition-all duration-200",
          isPrimary
            ? "bg-red-50 border-red-200 shadow-sm ring-1 ring-red-200"
            : isSecondary
            ? "bg-orange-50 border-orange-200 shadow-sm ring-1 ring-orange-200"
            : "border-transparent hover:bg-accent hover:border-border hover:shadow-sm"
        )}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div
          className="flex items-center cursor-pointer flex-1 min-w-0"
          onClick={handleToggle}
        >
          <div className="mr-2 w-5 h-5 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              )
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
            )}
          </div>

          <div className="flex items-center min-w-0 flex-1">
            <span
              className={cn(
                "font-medium truncate",
                isPrimary
                  ? "text-red-800"
                  : isSecondary
                  ? "text-orange-800"
                  : "text-foreground"
              )}
            >
              {department.name}
            </span>

            {/* {department.userCount && department.userCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2 text-xs px-2 py-0.5 font-normal flex-shrink-0",
                  isPrimary
                    ? "bg-red-100 text-red-700 border-red-200"
                    : isSecondary
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Users className="h-3 w-3 mr-1" />
                {department.userCount}
              </Badge>
            )} */}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {(selectionMode === "primary" || selectionMode === "both") && (
            <Button
              size="sm"
              variant={isPrimary ? "default" : "ghost"}
              className={cn(
                "h-7 px-3 text-xs font-medium transition-all duration-200",
                isPrimary
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  : "hover:bg-red-50 hover:text-red-700 opacity-0 group-hover:opacity-100"
              )}
              onClick={handleSelectPrimary}
              type="button"
            >
              {isPrimary ? (
                <>
                  <Check className="h-3 w-3 mr-1" />{" "}
                  {primaryButtonText || "Chọn"}
                </>
              ) : (
                primaryButtonText || "Chọn"
              )}
            </Button>
          )}

          {(selectionMode === "secondary" || selectionMode === "both") && (
            <Button
              size="sm"
              variant={isSecondary ? "default" : "ghost"}
              className={cn(
                "h-7 px-3 text-xs font-medium transition-all duration-200",
                isSecondary
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                  : "hover:bg-orange-50 hover:text-orange-700 opacity-0 group-hover:opacity-100",
                isPrimary && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSelectSecondary}
              disabled={isPrimary}
              type="button"
            >
              {isSecondary ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  {selectionMode === "both" ? "Phối hợp" : "Nhận thông báo"}
                </>
              ) : selectionMode === "both" ? (
                "Phối hợp"
              ) : (
                secondaryButtonText || "Nhận thông báo"
              )}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 ml-4">
          {isLoading && (
            <div className="space-y-2 px-4 py-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          )}

          {/* Department users */}
          {!isLoading && users.length > 0 && (
            <div className="space-y-1 mb-3">
              {users
                // Sort users by leadership role priority
                .sort((a, b) => {
                  const getRolePriority = (user: UserDTO): number => {
                    const rolePriorityMap: Record<string, number> = {
                      ROLE_CUC_TRUONG: 1,
                      ROLE_CHINH_UY: 2,
                      ROLE_PHO_CUC_TRUONG: 3,
                      ROLE_PHO_CHINH_UY: 3,
                      ROLE_TRUONG_PHONG: 5,
                      ROLE_CUM_TRUONG: 5,
                      ROLE_PHO_PHONG: 6,
                      ROLE_CUM_PHO: 6,
                      ROLE_TRAM_TRUONG: 7,
                      ROLE_PHO_TRAM_TRUONG: 8,
                    };

                    if (!user.roles || user.roles.length === 0) return 999;

                    // Tính tổng điểm tất cả các role
                    return user.roles.reduce((sum, role) => {
                      return sum + (rolePriorityMap[role] ?? 999);
                    }, 0);
                  };
                  return getRolePriority(a) - getRolePriority(b);
                })
                .map((user) => {
                  const leadershipRole = getLeadershipRole?.(user);
                  const roleDisplayName = leadershipRole
                    ? getRoleDisplayName?.(leadershipRole)
                    : null;

                  const compositeId = `${department.id}-${user.id}`;
                  const isPrimaryUser =
                    String(primaryDepartment) === compositeId;
                  const isSecondaryUser = secondaryDepartments?.includes(
                    compositeId as any
                  );

                  return (
                    <div
                      key={`${department.id}-${user.id}`}
                      className={cn(
                        "group flex items-center py-2 px-3 rounded-md border transition-all duration-200",
                        isPrimaryUser
                          ? "bg-red-50 border-red-200 ring-1 ring-red-200"
                          : isSecondaryUser
                          ? "bg-orange-50 border-orange-200 ring-1 ring-orange-200"
                          : "border-transparent hover:bg-accent hover:border-border"
                      )}
                      style={{ marginLeft: `${level * 12}px` }}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <UserCircle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "text-sm font-medium block truncate",
                              isPrimaryUser
                                ? "text-red-800"
                                : isSecondaryUser
                                ? "text-orange-800"
                                : "text-foreground"
                            )}
                          >
                            {user.fullName}
                          </span>
                          {roleDisplayName && (
                            <span
                              className={cn(
                                "text-xs block truncate mt-0.5",
                                isPrimaryUser
                                  ? "text-red-600"
                                  : isSecondaryUser
                                  ? "text-orange-600"
                                  : "text-muted-foreground"
                              )}
                            >
                              {roleDisplayName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {(selectionMode === "primary" ||
                          selectionMode === "both") && (
                          <Button
                            size="sm"
                            variant={isPrimaryUser ? "default" : "ghost"}
                            className={cn(
                              "h-6 px-2 text-xs transition-all duration-200",
                              isPrimaryUser
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "hover:bg-red-50 hover:text-red-700 opacity-0 group-hover:opacity-100"
                            )}
                            onClick={() =>
                              onSelectPrimaryDepartment?.(compositeId as any)
                            }
                            type="button"
                          >
                            {isPrimaryUser ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />{" "}
                                {primaryButtonText || "Chọn"}
                              </>
                            ) : (
                              primaryButtonText || "Chọn"
                            )}
                          </Button>
                        )}

                        {(selectionMode === "secondary" ||
                          selectionMode === "both") && (
                          <Button
                            size="sm"
                            variant={isSecondaryUser ? "default" : "ghost"}
                            className={cn(
                              "h-6 px-2 text-xs transition-all duration-200",
                              isSecondaryUser
                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                : "hover:bg-orange-50 hover:text-orange-700 opacity-0 group-hover:opacity-100",
                              isPrimaryUser && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() =>
                              onSelectSecondaryDepartment?.(compositeId as any)
                            }
                            disabled={isPrimaryUser}
                            type="button"
                          >
                            {isSecondaryUser ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />{" "}
                                {secondaryButtonText || "Phụ"}
                              </>
                            ) : (
                              secondaryButtonText || "Phụ"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Child departments */}
          {department.children && department.children.length > 0 && (
            <div className="space-y-1">
              {department.children.map((child) => (
                <DepartmentNode
                  key={child.id}
                  department={child}
                  level={level + 1}
                  expandedDepartments={expandedDepartments}
                  toggleDepartment={toggleDepartment}
                  onSelectPrimaryDepartment={onSelectPrimaryDepartment}
                  onSelectSecondaryDepartment={onSelectSecondaryDepartment}
                  primaryDepartment={primaryDepartment}
                  secondaryDepartments={secondaryDepartments}
                  departmentUsers={departmentUsers}
                  isLoadingUsers={isLoadingUsers}
                  onDepartmentExpand={onDepartmentExpand}
                  getLeadershipRole={getLeadershipRole}
                  getRoleDisplayName={getRoleDisplayName}
                  selectionMode={selectionMode}
                  primaryButtonText={primaryButtonText}
                  secondaryButtonText={secondaryButtonText}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
