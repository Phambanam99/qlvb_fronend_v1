"use client";

import { useState, useEffect, useRef } from "react";
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
  Building,
  User,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useToast } from "@/components/ui/use-toast";
import { UrgencyLevel, URGENCY_LEVELS } from "@/lib/types/urgency";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  workflowAPI,
  usersAPI,
  departmentsAPI,
  documentTypesAPI,
  DocumentTypeDTO,
} from "@/lib/api";
import { DepartmentTree } from "@/components/department-tree";
import { useDepartmentSelection } from "@/hooks/use-department-selection";
import { useDepartmentUsers } from "@/hooks/use-department-users";
import { createInternalDocument } from "@/lib/api/internalDocumentApi";
import { RichTextEditor } from "@/components/ui";
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
  ROLE_CHINH_TRI_VIEN_TRAM: 9,
  ROLE_CUM_TRUONG: 10,
  ROLE_PHO_CUM_TRUONG: 11,
  ROLE_CHINH_TRI_VIEN_CUM: 12,
  ROLE_TRUONG_BAN: 13,
};

// Get role display name helper
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case "ROLE_CUC_TRUONG":
      return "Cục trưởng";
    case "ROLE_CUC_PHO":
      return "Cục phó";
    case "ROLE_CHINH_UY":
      return "Chính ủy";
    case "ROLE_PHO_CHINH_UY":
      return "Phó Chính ủy";
    case "ROLE_TRUONG_PHONG":
      return "Trưởng phòng";
    case "ROLE_PHO_PHONG":
      return "Phó phòng";
    case "ROLE_TRAM_TRUONG":
      return "Trạm trưởng";
    case "ROLE_PHO_TRAM_TRUONG":
      return "Phó Trạm trưởng";
    case "ROLE_CHINH_TRI_VIEN_TRAM":
      return "Chính trị viên trạm";
    case "ROLE_CUM_TRUONG":
      return "Cụm trưởng";
    case "ROLE_PHO_CUM_TRUONG":
      return "Phó cụm trưởng";
    case "ROLE_CHINH_TRI_VIEN_CUM":
      return "Chính trị viên cụm";
    case "ROLE_TRUONG_BAN":
      return "Trưởng Ban";
    default:
      return role.replace("ROLE_", "").replace(/_/g, " ").toLowerCase();
  }
};

export default function CreateInternalOutgoingDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Use custom hooks for department selection
  const {
    departments,
    expandedDepartments,
    isLoading: isLoadingDepartmentList,
    primaryDepartment,
    secondaryDepartments,
    toggleDepartment,
    selectPrimaryDepartment,
    selectSecondaryDepartment,
    clearSelection,
    findDepartmentById,
  } = useDepartmentSelection();

  const {
    departmentUsers,
    isLoadingUsers,
    fetchDepartmentUsers,
    getLeadershipRole,
  } = useDepartmentUsers(leadershipRoleOrder);

  // State for form data
  const [formData, setFormData] = useState({
    documentNumber: "",
    sentDate: new Date(),
    documentType: "",
    title: "",
    content: "",
    urgencyLevel: URGENCY_LEVELS.KHAN,
    note: "",
  });

  // State for file attachment
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // State for document types
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDTO[]>([]);
  const [isLoadingDocumentTypes, setIsLoadingDocumentTypes] = useState(false);

  // Load document types on component mount
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setIsLoadingDocumentTypes(true);
        const types = await documentTypesAPI.getAllDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error("Error fetching document types:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách loại văn bản",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, [toast]);

  // Input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name: string) => (html: string) => {
    setFormData((prev) => ({ ...prev, [name]: html }));
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

  const findUserById = (deptId: number, userId: number) => {
    const deptUsers = departmentUsers[deptId] || [];
    return deptUsers.find((user) => user.id === userId);
  };

  const handleSelectPrimaryDepartment = (deptId: number | string) => {
    const numericId = typeof deptId === "string" ? parseInt(deptId) : deptId;
    selectPrimaryDepartment(numericId);
    fetchDepartmentUsers(numericId);
  };

  const handleSelectSecondaryDepartment = (deptId: number | string) => {
    const numericId = typeof deptId === "string" ? parseInt(deptId) : deptId;
    selectSecondaryDepartment(numericId);
    fetchDepartmentUsers(numericId);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.documentNumber.trim()) {
      errors.documentNumber = "Số văn bản là bắt buộc";
    }

    if (!formData.title.trim()) {
      errors.title = "Tiêu đề là bắt buộc";
    }

    if (secondaryDepartments.length === 0) {
      errors.recipients = "Vui lòng chọn ít nhất một người nhận";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const documentData = {
        documentNumber: formData.documentNumber,
        title: formData.title,
        content: formData.content,
        documentType: formData.documentType,
        urgencyLevel: formData.urgencyLevel,
        note: formData.note,
        sentDate: formData.sentDate.toISOString(),
        recipientDepartments: secondaryDepartments.map((deptId) => {
          const dept = findDepartmentById(deptId);
          return {
            departmentId: deptId,
            departmentName: dept?.name || "",
          };
        }),
      };

      const response = await createInternalDocument(
        documentData,
        file ? [file] : undefined
      );

      addNotification({
        title: "Văn bản đã được tạo",
        message: `Văn bản "${formData.title}" đã được tạo và gửi thành công.`,
        type: "success",
      });

      toast({
        title: "Thành công",
        description: "Văn bản đã được tạo và gửi thành công",
      });

      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);

      const documentData = {
        documentNumber: formData.documentNumber,
        title: formData.title,
        content: formData.content,
        documentType: formData.documentType,
        urgencyLevel: formData.urgencyLevel,
        note: formData.note,
        sentDate: formData.sentDate.toISOString(),
        recipientDepartments: secondaryDepartments.map((deptId) => {
          const dept = findDepartmentById(deptId);
          return {
            departmentId: deptId,
            departmentName: dept?.name || "",
          };
        }),
        isDraft: true,
      };

      const response = await createInternalDocument(
        documentData,
        file ? [file] : undefined
      );

      addNotification({
        title: "Nháp đã được lưu",
        message: `Nháp văn bản "${formData.title}" đã được lưu thành công.`,
        type: "info",
      });

      toast({
        title: "Thành công",
        description: "Nháp văn bản đã được lưu thành công",
      });

      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu nháp văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAllUsers = (user: any) => null;

  return (
    <div className="container py-6 max-w-6xl">
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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Document Information */}
        <Card>
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>
              Nhập thông tin cơ bản của văn bản nội bộ
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
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
                  className={
                    validationErrors.documentNumber ? "border-red-500" : ""
                  }
                />
                {validationErrors.documentNumber && (
                  <p className="text-sm text-red-500">
                    {validationErrors.documentNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sentDate">Ngày ban hành</Label>
                <DatePicker
                  date={formData.sentDate}
                  setDate={handleDateChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Loại văn bản</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) =>
                    handleSelectChange("documentType", value)
                  }
                >
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Chọn loại văn bản" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDocumentTypes ? (
                      <SelectItem value="loading" disabled>
                        Đang tải danh sách loại văn bản...
                      </SelectItem>
                    ) : documentTypes.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Chưa có loại văn bản nào
                      </SelectItem>
                    ) : (
                      documentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
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
                  className={validationErrors.title ? "border-red-500" : ""}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) =>
                    handleSelectChange("urgencyLevel", value)
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={URGENCY_LEVELS.KHAN}>Khẩn</SelectItem>
                    <SelectItem value={URGENCY_LEVELS.THUONG_KHAN}>
                      Thượng khẩn
                    </SelectItem>
                    <SelectItem value={URGENCY_LEVELS.HOA_TOC}>
                      Hỏa tốc
                    </SelectItem>
                    <SelectItem value={URGENCY_LEVELS.HOA_TOC_HEN_GIO}>
                      Hỏa tốc hẹn giờ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="file">Tệp đính kèm</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content and Recipients */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Content Card */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nội dung văn bản
              </CardTitle>
              <CardDescription>
                Soạn nội dung chi tiết của văn bản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung văn bản</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={handleRichTextChange("content")}
                  placeholder="Nhập nội dung văn bản"
                  minHeight="300px"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <RichTextEditor
                  content={formData.note}
                  onChange={handleRichTextChange("note")}
                  placeholder="Nhập ghi chú (nếu có)"
                  minHeight="150px"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recipients Card */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Người nhận
              </CardTitle>
              <CardDescription>
                Chọn phòng ban hoặc cá nhân nhận văn bản
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingDepartmentList ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Đang tải danh sách phòng ban...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Danh sách phòng ban và người dùng{" "}
                      {validationErrors.recipients && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-primary/5 px-4 py-2 border-b flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Chọn người nhận văn bản
                        </span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        <DepartmentTree
                          departments={departments}
                          expandedDepartments={new Set(expandedDepartments)}
                          toggleDepartment={toggleDepartment}
                          onSelectSecondaryDepartment={
                            handleSelectSecondaryDepartment
                          }
                          secondaryDepartments={secondaryDepartments as any}
                          departmentUsers={departmentUsers}
                          isLoadingUsers={isLoadingUsers}
                          onDepartmentExpand={fetchDepartmentUsers}
                          getLeadershipRole={showAllUsers}
                          getRoleDisplayName={getRoleDisplayName}
                          selectionMode="secondary"
                          maxHeight="400px"
                          secondaryButtonText="Chọn"
                        />
                      </div>
                    </div>
                    {validationErrors.recipients && (
                      <p className="text-sm text-red-500">
                        {validationErrors.recipients}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm border border-blue-500 bg-white"></div>
                      <span>Người nhận</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <span>Đơn vị lớn</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>Đơn vị nhỏ</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Note Card */}
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Lưu ý:</span> Văn bản nội bộ sẽ được
            gửi đến tất cả phòng ban và cá nhân được chọn. Văn bản được gửi đến
            phòng ban sẽ được chuyển đến trưởng phòng của phòng ban đó.
          </p>
        </div>
      </form>
    </div>
  );
}
