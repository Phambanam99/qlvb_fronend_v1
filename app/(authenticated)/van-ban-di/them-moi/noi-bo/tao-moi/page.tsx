"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  Save,
  Send,
  X,
  ChevronRight,
  ChevronDown,
  Building,
  Users,
  User,
  Check,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { workflowAPI, usersAPI, departmentsAPI } from "@/lib/api";

export default function CreateInternalOutgoingDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  // State for form data
  const [formData, setFormData] = useState({
    documentNumber: "",
    sentDate: new Date(),
    documentType: "",
    title: "",
    content: "",
    priority: "normal",
    note: "",
  });

  // State for file attachment
  const [file, setFile] = useState<File | null>(null);

  // State for departments and recipients
  const [departments, setDepartments] = useState<any[]>([]);
  const [expandedDepartments, setExpandedDepartments] = useState<
    Record<number, boolean>
  >({});
  const [departmentUsers, setDepartmentUsers] = useState<Record<number, any[]>>(
    {}
  );
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // State for loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<Record<number, boolean>>(
    {}
  );

  // Add state for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    departments: any[];
    users: { departmentId: number; user: any }[];
  }>({ departments: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Add state for department hierarchy levels
  const [departmentLevels, setDepartmentLevels] = useState<
    Record<number, number>
  >({});

  // Leadership role configuration
  const leadershipRoleOrder: Record<string, number> = {
    ROLE_CUC_TRUONG: 1,
    ROLE_CUC_PHO: 2,
    ROLE_CHINH_UY: 3,
    ROLE_PHO_CHINH_UY: 4,
    ROLE_TRUONG_PHONG: 5,
    ROLE_PHO_PHONG: 6,
    ROLE_TRAM_TRUONG: 7,
    ROLE_PHO_TRAM_TRUONG: 8,
    ROLE_CUM_TRUONG: 9,
    ROLE_CUM_PHO: 10,
  };

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await departmentsAPI.getAllDepartments();
        const departments = response.content || [];
        setDepartments(departments);

        // Calculate department levels
        const levels: Record<number, number> = {};
        calculateDepartmentLevels(departments, 0, levels);
        setDepartmentLevels(levels);

        // Pre-fetch users for all departments to display immediately
        if (departments.length > 0) {
          const deptIds = getAllDepartmentIds(departments);
          await Promise.all(deptIds.map((id) => fetchDepartmentUsers(id)));
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách phòng ban",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [toast]);

  // Calculate department levels for hierarchy visualization
  const calculateDepartmentLevels = (
    departments: any[],
    level: number,
    result: Record<number, number>
  ) => {
    for (const dept of departments) {
      result[dept.id] = level;
      if (dept.children && dept.children.length > 0) {
        calculateDepartmentLevels(dept.children, level + 1, result);
      }
    }
  };

  // Get all department IDs from nested structure
  const getAllDepartmentIds = (departments: any[]): number[] => {
    let ids: number[] = [];

    for (const dept of departments) {
      ids.push(dept.id);
      if (dept.children && dept.children.length > 0) {
        ids = [...ids, ...getAllDepartmentIds(dept.children)];
      }
    }

    return ids;
  };

  // Toggle department expansion (only for UI, users are already loaded)
  const toggleDepartment = (departmentId: number) => {
    setExpandedDepartments((prev) => ({
      ...prev,
      [departmentId]: !prev[departmentId],
    }));
  };

  // Fetch users for a department
  const fetchDepartmentUsers = async (departmentId: number) => {
    try {
      setIsLoadingUsers((prev) => ({ ...prev, [departmentId]: true }));
      const users = await usersAPI.getUsersByDepartmentId(departmentId);
      setDepartmentUsers((prev) => ({ ...prev, [departmentId]: users }));
    } catch (error) {
      console.error(
        `Error fetching users for department ${departmentId}:`,
        error
      );
    } finally {
      setIsLoadingUsers((prev) => ({ ...prev, [departmentId]: false }));
    }
  };

  // Check if a user has a leadership role
  const getLeadershipRole = (user: any) => {
    if (!user.roles || user.roles.length === 0) return null;

    // Find leadership roles and sort by priority
    const leadershipRoles = user.roles
      .filter((role: any) => role.name in leadershipRoleOrder)
      .sort(
        (a: any, b: any) =>
          leadershipRoleOrder[a.name] - leadershipRoleOrder[b.name]
      );

    return leadershipRoles.length > 0 ? leadershipRoles[0] : null;
  };

  // Handle recipient selection with cascade selection
  const handleRecipientSelection = (recipientId: string) => {
    // Check if this is a department (not a user)
    const { departmentId, userId } = parseRecipientId(recipientId);

    if (!userId) {
      // This is a department selection - cascade selection to all children
      const department = findDepartmentById(departmentId);
      if (department) {
        if (selectedRecipients.includes(recipientId)) {
          // If department is already selected, unselect it and all its children
          setSelectedRecipients((prev) => {
            const newSelected = [...prev];
            // Remove this department
            const index = newSelected.indexOf(recipientId);
            if (index !== -1) {
              newSelected.splice(index, 1);
            }

            // Remove all child departments and their users
            const childDeptIds = getAllChildDepartmentsIds(department);
            childDeptIds.forEach((deptId) => {
              const deptIdStr = deptId.toString();
              const deptIndex = newSelected.indexOf(deptIdStr);
              if (deptIndex !== -1) {
                newSelected.splice(deptIndex, 1);
              }

              // Remove all users of this department
              const usersToRemove = newSelected.filter((id) =>
                id.startsWith(`${deptId}-`)
              );
              usersToRemove.forEach((userId) => {
                const userIndex = newSelected.indexOf(userId);
                if (userIndex !== -1) {
                  newSelected.splice(userIndex, 1);
                }
              });
            });

            // Remove all users of this department
            const usersToRemove = newSelected.filter((id) =>
              id.startsWith(`${departmentId}-`)
            );
            usersToRemove.forEach((userId) => {
              const userIndex = newSelected.indexOf(userId);
              if (userIndex !== -1) {
                newSelected.splice(userIndex, 1);
              }
            });

            return newSelected;
          });
        } else {
          // If department is not selected, select it and all its children
          setSelectedRecipients((prev) => {
            const newSelected = [...prev];

            // Add this department if not already included
            if (!newSelected.includes(recipientId)) {
              newSelected.push(recipientId);
            }

            // Add all child departments
            const childDeptIds = getAllChildDepartmentsIds(department);
            childDeptIds.forEach((deptId) => {
              const deptIdStr = deptId.toString();
              if (!newSelected.includes(deptIdStr)) {
                newSelected.push(deptIdStr);
              }

              // Add all users of this department
              const deptUsers = departmentUsers[deptId] || [];
              deptUsers.forEach((user) => {
                const userId = `${deptId}-${user.id}`;
                if (!newSelected.includes(userId)) {
                  newSelected.push(userId);
                }
              });
            });

            // Add all users of this department
            const deptUsers = departmentUsers[departmentId] || [];
            deptUsers.forEach((user) => {
              const userId = `${departmentId}-${user.id}`;
              if (!newSelected.includes(userId)) {
                newSelected.push(userId);
              }
            });

            return newSelected;
          });

          // Expand the department to show the selection
          setExpandedDepartments((prev) => ({
            ...prev,
            [departmentId]: true,
          }));
        }
      }
    } else {
      // This is a user selection - just toggle this specific user
      setSelectedRecipients((prev) => {
        if (prev.includes(recipientId)) {
          return prev.filter((id) => id !== recipientId);
        } else {
          return [...prev, recipientId];
        }
      });
    }
  };

  // Get all child department IDs recursively
  const getAllChildDepartmentsIds = (department: any): number[] => {
    let ids: number[] = [];

    if (department.children && department.children.length > 0) {
      department.children.forEach((child: any) => {
        ids.push(child.id);
        ids = [...ids, ...getAllChildDepartmentsIds(child)];
      });
    }

    return ids;
  };

  // Remove a recipient
  const removeRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) => prev.filter((id) => id !== recipientId));
  };

  // Find department by ID
  const findDepartmentById = (id: number): any => {
    let result = null;

    const searchInDepartments = (departments: any[]) => {
      for (const dept of departments) {
        if (dept.id === id) {
          result = dept;
          return;
        }
        if (dept.children) {
          searchInDepartments(dept.children);
        }
      }
    };

    searchInDepartments(departments);
    return result;
  };

  // Parse recipient ID (format: "dept-user" or just "dept")
  const parseRecipientId = (id: string) => {
    const parts = id.split("-");
    if (parts.length === 2) {
      return { departmentId: parseInt(parts[0]), userId: parseInt(parts[1]) };
    }
    return { departmentId: parseInt(id), userId: null };
  };

  // Get recipient display name
  const getRecipientDisplayName = (recipientId: string) => {
    const { departmentId, userId } = parseRecipientId(recipientId);

    if (userId) {
      const users = departmentUsers[departmentId] || [];
      const user = users.find((u) => u.id === userId);
      const department = findDepartmentById(departmentId);
      if (user && department) {
        return `${user.fullName} - ${department.name}`;
      }
    } else {
      const department = findDepartmentById(departmentId);
      if (department) {
        return department.name;
      }
    }

    return recipientId;
  };

  // Input change handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, sentDate: date }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Form submission handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.documentNumber ||
      !formData.title ||
      selectedRecipients.length === 0
    ) {
      toast({
        title: "Thiếu thông tin",
        description:
          "Vui lòng điền đầy đủ thông tin bắt buộc và chọn ít nhất một người nhận",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare document data
      const documentData: any = {
        documentNumber: formData.documentNumber,
        title: formData.title,
        summary: formData.content,
        documentType: formData.documentType,
        signingDate: formData.sentDate,
        priority: formData.priority,
        notes: formData.note,
        recipients: selectedRecipients.map((id) => {
          const { departmentId, userId } = parseRecipientId(id);
          return { departmentId, userId: userId || undefined };
        }),
        status: "PENDING_APPROVAL", // Set status for submission (not draft)
        isInternal: true,
      };

      // Call API to create internal outgoing document
      await workflowAPI.createInternalOutgoingDocument(
        documentData,
        file || null
      );

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản nội bộ đã được tạo và gửi",
      });

      addNotification({
        title: "Văn bản nội bộ mới",
        message: `Văn bản "${formData.title}" đã được tạo và gửi`,
        type: "success",
      });

      // Redirect to outgoing documents list
      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Có lỗi xảy ra khi tạo văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Validate minimal required fields
    if (!formData.documentNumber || !formData.title) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền ít nhất số văn bản và tiêu đề",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare document data
      const documentData: any = {
        documentNumber: formData.documentNumber,
        title: formData.title,
        summary: formData.content,
        documentType: formData.documentType,
        signingDate: formData.sentDate,
        priority: formData.priority,
        notes: formData.note,
        recipients: selectedRecipients.map((id) => {
          const { departmentId, userId } = parseRecipientId(id);
          return { departmentId, userId: userId || undefined };
        }),
        status: "DRAFT", // Set status as draft
        isInternal: true,
      };

      // Call API to create internal outgoing document as draft
      await workflowAPI.createInternalOutgoingDocument(
        documentData,
        file || null
      );

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản nội bộ đã được lưu nháp",
      });

      // Redirect to outgoing documents list
      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Có lỗi xảy ra khi lưu nháp",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get hierarchical color based on department level
  const getDepartmentColor = (level: number) => {
    const colors = [
      "from-blue-500 to-blue-600", // Top level
      "from-indigo-500 to-indigo-600", // Second level
      "from-purple-500 to-purple-600", // Third level
      "from-violet-500 to-violet-600", // Fourth level
      "from-fuchsia-500 to-fuchsia-600", // Fifth level
    ];

    return colors[Math.min(level, colors.length - 1)];
  };

  // Get icon for department based on level
  const getDepartmentIcon = (level: number) => {
    if (level === 0) return <Building className="h-4 w-4 mr-1.5 text-white" />;
    if (level === 1) return <Building className="h-4 w-4 mr-1.5 text-white" />;
    return <Building className="h-4 w-4 mr-1.5 text-white" />;
  };

  // Check if department is fully selected (all children and users)
  const isDepartmentFullySelected = (department: any): boolean => {
    // Check if this department is selected
    if (!selectedRecipients.includes(department.id.toString())) return false;

    // Check if all users in this department are selected
    const users = departmentUsers[department.id] || [];
    const allUsersSelected =
      users.length === 0 ||
      users.every((user) =>
        selectedRecipients.includes(`${department.id}-${user.id}`)
      );
    if (!allUsersSelected) return false;

    // Check if all child departments are fully selected
    if (department.children && department.children.length > 0) {
      return department.children.every((child: any) =>
        isDepartmentFullySelected(child)
      );
    }

    return true;
  };

  // Check if department is partially selected
  const isDepartmentPartiallySelected = (department: any): boolean => {
    // If fully selected, it's not partially selected
    if (isDepartmentFullySelected(department)) return false;

    // Check if this department itself is selected
    if (selectedRecipients.includes(department.id.toString())) return true;

    // Check if any users in this department are selected
    const users = departmentUsers[department.id] || [];
    const anyUserSelected = users.some((user) =>
      selectedRecipients.includes(`${department.id}-${user.id}`)
    );
    if (anyUserSelected) return true;

    // Check if any child department is partially or fully selected
    if (department.children && department.children.length > 0) {
      return department.children.some(
        (child: any) =>
          isDepartmentPartiallySelected(child) ||
          isDepartmentFullySelected(child)
      );
    }

    return false;
  };

  // Render department tree
  const renderDepartmentTree = (department: any, level = 0) => {
    const isExpanded = expandedDepartments[department.id] || false;
    const hasChildren = department.children && department.children.length > 0;
    const users = departmentUsers[department.id] || [];
    const deptLevel = departmentLevels[department.id] || 0;

    // Determine selection state
    const isFullySelected = isDepartmentFullySelected(department);
    const isPartiallySelected =
      !isFullySelected && isDepartmentPartiallySelected(department);

    // Selection icon
    let SelectionIcon = isFullySelected ? (
      <Check className="h-4 w-4 text-white" />
    ) : isPartiallySelected ? (
      <div className="h-3 w-3 rounded-sm bg-white/60" />
    ) : (
      <Circle className="h-4 w-4 text-white/40" />
    );

    const gradientColor = getDepartmentColor(deptLevel);
    const departmentIcon = getDepartmentIcon(deptLevel);

    return (
      <div key={department.id} className="department-tree">
        <div
          className={`flex items-center mb-1 rounded-md overflow-hidden transition-all
            ${
              isFullySelected
                ? "ring-2 ring-offset-1 ring-white/40"
                : isPartiallySelected
                ? "ring-1 ring-offset-1 ring-white/20"
                : ""
            }`}
        >
          {/* Department header with gradient */}
          <div
            className={`flex items-center w-full py-2 px-3 bg-gradient-to-r ${gradientColor} 
              cursor-pointer hover:brightness-110 transition-all group`}
            onClick={() => handleRecipientSelection(department.id.toString())}
            style={{ paddingLeft: `${deptLevel * 8 + 12}px` }}
          >
            {/* Expand/collapse button */}
            {hasChildren && (
              <button
                type="button"
                className="mr-2 h-5 w-5 flex items-center justify-center rounded-full 
                  bg-white/20 hover:bg-white/40 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDepartment(department.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-white" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-white" />
                )}
              </button>
            )}

            {/* Department icon and name */}
            <div className="flex items-center flex-grow">
              <div className="flex items-center">
                {departmentIcon}
                <span className="text-white font-medium">
                  {department.name}
                </span>
              </div>

              {/* Child and user counts */}
              <div className="flex ml-3 gap-3">
                {hasChildren && (
                  <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                    {department.children.length} đơn vị
                  </span>
                )}
                {users.length > 0 && (
                  <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                    {users.length} người
                  </span>
                )}
              </div>
            </div>

            {/* Selection indicator */}
            <div className="flex-shrink-0 ml-2">{SelectionIcon}</div>
          </div>
        </div>

        {/* Users and child departments */}
        <div className={`pl-6 ${isExpanded ? "block" : "hidden"}`}>
          {/* Users */}
          {users.length > 0 && (
            <div className="mb-2 mt-1">
              <div className="flex items-center text-xs text-muted-foreground mb-1 pl-2">
                <Users className="h-3 w-3 mr-1.5" />
                <span>Cá nhân trong đơn vị</span>
              </div>
              <div className="space-y-1">
                {users.map((user) => {
                  const userId = `${department.id}-${user.id}`;
                  const isUserSelected = selectedRecipients.includes(userId);
                  const leadershipRole = getLeadershipRole(user);

                  return (
                    <div
                      key={userId}
                      className={`flex items-center py-1.5 px-3 rounded-md cursor-pointer
                        ${
                          isUserSelected
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/20"
                        }`}
                      style={{ marginLeft: `${deptLevel * 4}px` }}
                      onClick={() => handleRecipientSelection(userId)}
                    >
                      <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="flex-grow text-sm">
                        {user.fullName}
                        {leadershipRole && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (
                            {leadershipRole.displayName ||
                              leadershipRole.name.replace("ROLE_", "")}
                            )
                          </span>
                        )}
                      </span>
                      {isUserSelected && (
                        <Check className="h-3.5 w-3.5 text-accent-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Child departments */}
          {hasChildren &&
            department.children.map((child: any) =>
              renderDepartmentTree(child)
            )}
        </div>
      </div>
    );
  };

  // Search for recipients
  const searchRecipients = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults({ departments: [], users: [] });
      return;
    }

    setIsSearching(true);

    const normalizedQuery = query.toLowerCase().trim();

    // Search in departments
    const matchedDepartments = findMatchingDepartments(
      departments,
      normalizedQuery
    );

    // Search in users
    const matchedUsers: { departmentId: number; user: any }[] = [];
    Object.entries(departmentUsers).forEach(([deptId, users]) => {
      const departmentId = Number(deptId);
      users.forEach((user) => {
        if (user.fullName.toLowerCase().includes(normalizedQuery)) {
          matchedUsers.push({ departmentId, user });
        }
      });
    });

    setSearchResults({
      departments: matchedDepartments,
      users: matchedUsers,
    });
  };

  // Find departments matching search query
  const findMatchingDepartments = (
    departmentList: any[],
    query: string
  ): any[] => {
    const matches: any[] = [];

    departmentList.forEach((dept) => {
      if (dept.name.toLowerCase().includes(query)) {
        matches.push(dept);
      }

      if (dept.children && dept.children.length > 0) {
        const childMatches = findMatchingDepartments(dept.children, query);
        matches.push(...childMatches);
      }
    });

    return matches;
  };

  // Expand all departments
  const expandAllDepartments = () => {
    const allDeptIds = getAllDepartmentIds(departments);
    const expanded: Record<number, boolean> = {};

    allDeptIds.forEach((id) => {
      expanded[id] = true;
    });

    setExpandedDepartments(expanded);
  };

  // Collapse all departments
  const collapseAllDepartments = () => {
    setExpandedDepartments({});
  };

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-di/them-moi">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Tạo văn bản đi mới - Nội bộ
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Document Information Card */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết của văn bản nội bộ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">
                    Số văn bản <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    placeholder="Nhập số văn bản"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentDate">Ngày ban hành</Label>
                  <DatePicker
                    date={formData.sentDate}
                    setDate={handleDateChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề văn bản"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung văn bản"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Loại văn bản</Label>
                <Input
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  placeholder="Nhập loại văn bản"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleSelectChange("priority", value)
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Tệp đính kèm</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú (nếu có)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recipients Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle>Người nhận</CardTitle>
                <CardDescription>
                  Chọn phòng ban hoặc cá nhân nhận văn bản
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingDepartments ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Đang tải danh sách phòng ban...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search and expand/collapse controls */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tìm kiếm phòng ban hoặc cá nhân..."
                          value={searchQuery}
                          onChange={(e) => searchRecipients(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={expandAllDepartments}
                        >
                          Mở tất cả
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={collapseAllDepartments}
                        >
                          Thu gọn
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md">
                      <ScrollArea className="h-60 w-full">
                        <div className="p-2">
                          {isSearching && searchQuery ? (
                            <div className="space-y-2">
                              {searchResults.departments.length === 0 &&
                              searchResults.users.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-2">
                                  Không tìm thấy kết quả phù hợp
                                </p>
                              ) : (
                                <>
                                  {searchResults.departments.length > 0 && (
                                    <div className="mb-4">
                                      <h4 className="text-sm font-medium mb-2">
                                        Phòng ban
                                      </h4>
                                      {searchResults.departments.map((dept) => (
                                        <div
                                          key={`search-dept-${dept.id}`}
                                          className={`flex items-center py-1 px-2 hover:bg-accent rounded-md ${
                                            selectedRecipients.includes(
                                              dept.id.toString()
                                            )
                                              ? "bg-accent"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleRecipientSelection(
                                              dept.id.toString()
                                            )
                                          }
                                        >
                                          <span className="flex-grow cursor-pointer">
                                            {dept.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {searchResults.users.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">
                                        Cá nhân
                                      </h4>
                                      {searchResults.users.map(
                                        ({ departmentId, user }) => {
                                          const userId = `${departmentId}-${user.id}`;
                                          const department =
                                            findDepartmentById(departmentId);
                                          const departmentName = department
                                            ? department.name
                                            : "";

                                          return (
                                            <div
                                              key={`search-user-${userId}`}
                                              className={`flex items-center py-1 px-2 hover:bg-accent rounded-md ${
                                                selectedRecipients.includes(
                                                  userId
                                                )
                                                  ? "bg-accent"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleRecipientSelection(userId)
                                              }
                                            >
                                              <span className="flex-grow cursor-pointer text-sm">
                                                {user.fullName}
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                  ({departmentName})
                                                </span>
                                              </span>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            // Original department tree
                            departments.map((department) =>
                              renderDepartmentTree(department)
                            )
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Selected recipients */}
                    <div>
                      <Label>
                        Đã chọn <span className="text-red-500">*</span>
                      </Label>
                      <div className="border rounded-md p-2 min-h-[100px] mt-1">
                        {selectedRecipients.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Chưa có người nhận nào được chọn
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedRecipients.map((id) => (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {getRecipientDisplayName(id)}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => removeRecipient(id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-2">
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Gửi văn bản
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Lưu nháp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Lưu ý:</span> Văn bản nội bộ sẽ
                được gửi đến tất cả phòng ban và cá nhân được chọn. Văn bản được
                gửi đến phòng ban sẽ được chuyển đến trưởng phòng của phòng ban
                đó.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
