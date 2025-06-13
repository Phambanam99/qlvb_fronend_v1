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
  Building,
  User,
  Users,
  Calendar,
  FileText,
  X,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  workflowAPI,
  usersAPI,
  departmentsAPI,
  documentTypesAPI,
  DocumentTypeDTO,
} from "@/lib/api";
import { UserDTO } from "@/lib/api/users";
import { DepartmentTree } from "@/components/department-tree";
import { useDepartmentSelection } from "@/hooks/use-department-selection";
import { useDepartmentUsers } from "@/hooks/use-department-users";
import { createInternalDocument, CreateInternalDocumentDTO } from "@/lib/api/internalDocumentApi";
import { RichTextEditor } from "@/components/ui";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileUploadProgress } from "@/components/ui/file-upload-progress";
import { usersAPI as userAPI } from "@/lib/api/users";

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

// Leadership roles for filtering document signers
const LEADERSHIP_ROLES = [
  "ROLE_CUC_TRUONG",
  "ROLE_CUC_PHO", 
  "ROLE_CHINH_UY",
  "ROLE_PHO_CHINH_UY",
  "ROLE_TRUONG_PHONG",
  "ROLE_PHO_PHONG",
  "ROLE_TRUONG_BAN",
  "ROLE_PHO_BAN",
  "ROLE_CUM_TRUONG",
  "ROLE_PHO_CUM_TRUONG",
  "ROLE_TRAM_TRUONG"
];

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

  // State for document signers (leadership users in current department)
  const [leadershipUsers, setLeadershipUsers] = useState<UserDTO[]>([]);
  const [isLoadingLeadershipUsers, setIsLoadingLeadershipUsers] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    documentNumber: "",
    signingDate: new Date(),
    documentType: "",
    title: "",
    summary: "",
    urgencyLevel: URGENCY_LEVELS.KHAN,
    notes: "",
    signer: "",
    draftingDepartmentId: undefined as number | undefined,
    securityLevel: 'NORMAL' as 'NORMAL' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET',
    documentSignerId: undefined as number | undefined,
    isSecureTransmission: false,
    processingDeadline: undefined as Date | undefined,
    issuingAgency: "",
    distributionType: 'REGULAR' as 'REGULAR' | 'CONFIDENTIAL' | 'COPY_BOOK' | 'PARTY' | 'STEERING_COMMITTEE',
    numberOfCopies: undefined as number | undefined,
    numberOfPages: undefined as number | undefined,
    noPaperCopy: false,
  });

  // Use file upload hook
  const fileUpload = useFileUpload({
    maxSize: 200, // 50MB max per file
    maxFiles: 10,
  });

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
        const types_ = await documentTypesAPI.getAllDocumentTypes();
        const types = types_.data;
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

  // Auto-set drafting department and load leadership users when user is available
  useEffect(() => {
    if (user && user.departmentId) {
      // Auto-set drafting department from current user
      setFormData(prev => ({
        ...prev,
        draftingDepartmentId: user.departmentId
      }));

      // Load leadership users for document signer dropdown
      const fetchLeadershipUsers = async () => {
        try {
          setIsLoadingLeadershipUsers(true);
          const leaders_ = await usersAPI.getUsersByRoleAndDepartment(
            LEADERSHIP_ROLES,
            user.departmentId!
          );
          const leaders = leaders_.data;
          setLeadershipUsers(leaders);
        } catch (error) {
          console.error("Error fetching leadership users:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách lãnh đạo đơn vị",
            variant: "destructive",
          });
        } finally {
          setIsLoadingLeadershipUsers(false);
        }
      };

      fetchLeadershipUsers();
    }
  }, [user, toast]);

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
      setFormData((prev) => ({ ...prev, signingDate: date }));
    }
  };

  const handleProcessingDeadlineChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, processingDeadline: date }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseInt(value);
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      fileUpload.addFiles(newFiles);
      // Reset input to allow selecting the same file again
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    fileUpload.removeFile(index);
  };

  const findUserById = (deptId: number, userId: number) => {
    const deptUsers = departmentUsers[deptId] || [];
    return deptUsers.find((user) => user.id === userId);
  };

  // Helper function to parse recipient info
  const getRecipientInfo = (recipientId: number | string) => {
    if (typeof recipientId === "string" && recipientId.includes("-")) {
      const [deptId, userId] = recipientId.split("-").map(Number);
      const dept = findDepartmentById(deptId);
      const user = findUserById(deptId, userId);
      return {
        type: "user" as const,
        department: dept,
        user: user,
        displayName: user ? `${dept?.name} - ${user.fullName}` : `${dept?.name} - User not found`
      };
    } else {
      const dept = findDepartmentById(Number(recipientId));
      return {
        type: "department" as const,
        department: dept,
        user: null,
        displayName: dept?.name || "Department not found"
      };
    }
  };

  const handleSelectPrimaryDepartment = (deptId: number | string) => {
    const numericId = typeof deptId === "string" ? parseInt(deptId) : deptId;
    selectPrimaryDepartment(numericId);
    fetchDepartmentUsers(numericId);
  };

  const handleSelectSecondaryDepartment = (deptId: number | string) => {
    // Handle both department IDs and composite user IDs (departmentId-userId)
    if (typeof deptId === "string" && deptId.includes("-")) {
      // This is a composite ID (departmentId-userId)
      const [departmentId] = deptId.split("-").map(Number);
      selectSecondaryDepartment(deptId as any); // Keep the composite ID
      fetchDepartmentUsers(departmentId);
    } else {
      // This is a regular department ID
      const numericId = typeof deptId === "string" ? parseInt(deptId) : deptId;
      selectSecondaryDepartment(numericId);
      fetchDepartmentUsers(numericId);
    }
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
      fileUpload.setUploading(true);
      fileUpload.resetUpload();

      const documentData: CreateInternalDocumentDTO =  {
        documentNumber: formData.documentNumber,
        title: formData.title,
        summary: formData.summary,
        documentType: formData.documentType,
        urgencyLevel: formData.urgencyLevel,
        notes: formData.notes,
        signingDate: formData.signingDate.toISOString(),
        signer: formData.signer,
        draftingDepartmentId: formData.draftingDepartmentId,
        securityLevel: formData.securityLevel,
        documentSignerId: formData.documentSignerId,
        isSecureTransmission: formData.isSecureTransmission,
        processingDeadline: formData.processingDeadline?.toISOString(),
        issuingAgency: formData.issuingAgency,
        distributionType: formData.distributionType,
        numberOfCopies: formData.numberOfCopies,
        numberOfPages: formData.numberOfPages,
        noPaperCopy: formData.noPaperCopy,
        recipients: secondaryDepartments.map((recipient: any) => {
          if (typeof recipient === "string" && recipient.includes("-")) {
            // This is a composite ID (departmentId-userId)
            const [departmentId, userId] = recipient.split("-").map(Number);
            return { departmentId, userId };
          } else {
            // This is a regular department ID
            return { departmentId: Number(recipient) };
          }
        }),
      };

      // Create cancel token for upload
      const cancelTokenSource = fileUpload.createCancelToken();

      const response_ = await createInternalDocument(
        documentData,
        fileUpload.files.length > 0 ? fileUpload.files : undefined,
        undefined, // descriptions
        (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          fileUpload.setUploadProgress(percentCompleted);
        },
        cancelTokenSource.token
      );
      const response = response_.data;

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

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        fileUpload.setError(
          "Tải lên bị timeout. Vui lòng thử lại với file nhỏ hơn."
        );
      } else if (error.message.includes("cancelled")) {
        fileUpload.setError("Tải lên đã bị hủy.");
      } else {
        fileUpload.setError(error.message || "Không thể tải lên file");
      }

      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      fileUpload.setUploading(false);
    }
  };

  // const handleSaveDraft = async () => {
  //   try {
  //     setIsSubmitting(true);

  //     const documentData: CreateInternalDocumentDTO = {
  //       documentNumber: formData.documentNumber,
  //       title: formData.title,
  //       summary: formData.summary,
  //       documentType: formData.documentType,
  //       urgencyLevel: formData.urgencyLevel,
  //       notes: formData.notes,
  //       signingDate: formData.signingDate.toISOString(),
  //       recipients: secondaryDepartments.map((deptId) => ({
  //         departmentId: deptId,
  //       })),
       
  //     };

  //     const response = await createInternalDocument(
  //       documentData,
  //       fileUpload.files.length > 0 ? fileUpload.files : undefined
  //     );

  //     addNotification({
  //       title: "Nháp đã được lưu",
  //       message: `Nháp văn bản "${formData.title}" đã được lưu thành công.`,
  //       type: "info",
  //     });

  //     toast({
  //       title: "Thành công",
  //       description: "Nháp văn bản đã được lưu thành công",
  //     });

  //     router.push("/van-ban-di");
  //   } catch (error: any) {
  //     console.error("Error saving draft:", error);
  //     toast({
  //       title: "Lỗi",
  //       description: error.message || "Không thể lưu nháp văn bản",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const showAllUsers = (user: any) => null;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-[1536px] mx-auto py-6 max-w-5xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/van-ban-di/them-moi">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Tạo văn bản đi mới - Nội bộ
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="submit"
              form="document-form"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Gửi văn bản
            </Button>
          </div>
        </div>

        <form ref={formRef} id="document-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Document Information */}
          <Card>
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
                  <Label htmlFor="sentDate">Ngày ký</Label>
                  <DatePicker
                    date={formData.signingDate}
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

              <div className="grid gap-6 md:grid-cols-3 mt-6">
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
                  <Label htmlFor="priority">Độ Khẩn</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="signer">Người ký</Label>
                  <Input
                    id="signer"
                    name="signer"
                    value={formData.signer}
                    onChange={handleInputChange}
                    placeholder="Nhập người ký"
                  />
                </div>
              </div>

              {/* Additional Information - Merged */}
              <div className="grid gap-6 md:grid-cols-3 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="draftingDepartmentId">Đơn vị soạn thảo</Label>
                  <Select
                    value={formData.draftingDepartmentId?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        draftingDepartmentId: value ? parseInt(value) : undefined 
                      }))
                    }
                    disabled={true} // Auto-set from current user, cannot be changed
                  >
                    <SelectTrigger id="draftingDepartmentId" className="bg-gray-50">
                      <SelectValue placeholder={
                        user?.departmentName || "Đơn vị soạn thảo"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {user?.departmentId && (
                        <SelectItem key={user.departmentId} value={user.departmentId.toString()}>
                          {user.departmentName || "Đơn vị hiện tại"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Tự động lấy từ đơn vị của bạn
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityLevel">Độ mật</Label>
                  <Select
                    value={formData.securityLevel}
                    onValueChange={(value) =>
                      handleSelectChange("securityLevel", value)
                    }
                  >
                    <SelectTrigger id="securityLevel">
                      <SelectValue placeholder="Chọn độ mật" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Thường</SelectItem>
                      <SelectItem value="CONFIDENTIAL">Mật</SelectItem>
                      <SelectItem value="SECRET">Tối mật</SelectItem>
                      <SelectItem value="TOP_SECRET">Tuyệt mật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentSignerId">Người ký duyệt</Label>
                  <Select
                    value={formData.documentSignerId?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        documentSignerId: value ? parseInt(value) : undefined 
                      }))
                    }
                    disabled={isLoadingLeadershipUsers}
                  >
                    <SelectTrigger id="documentSignerId">
                      <SelectValue placeholder={
                        isLoadingLeadershipUsers 
                          ? "Đang tải danh sách lãnh đạo..." 
                          : "Chọn người ký duyệt"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {leadershipUsers.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id!.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{leader.fullName}</span>
                            <span className="text-sm text-gray-500">
                              {leader.roleDisplayNames?.join(", ") || "Lãnh đạo"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {leadershipUsers.length === 0 && !isLoadingLeadershipUsers && (
                        <SelectItem value="" disabled>
                          Không có lãnh đạo trong đơn vị
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Chỉ hiển thị lãnh đạo đơn vị của bạn
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="processingDeadline">Hạn xử lý</Label>
                  <DatePicker
                    date={formData.processingDeadline}
                    setDate={handleProcessingDeadlineChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuingAgency">Cơ quan ban hành</Label>
                  <Input
                    id="issuingAgency"
                    name="issuingAgency"
                    value={formData.issuingAgency}
                    onChange={handleInputChange}
                    placeholder="Nhập cơ quan ban hành"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distributionType">Khối phân phối</Label>
                  <Select
                    value={formData.distributionType}
                    onValueChange={(value) =>
                      handleSelectChange("distributionType", value)
                    }
                  >
                    <SelectTrigger id="distributionType">
                      <SelectValue placeholder="Chọn khối phân phối" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">Đi thường</SelectItem>
                      <SelectItem value="CONFIDENTIAL">Đi mật</SelectItem>
                      <SelectItem value="COPY_BOOK">Sổ sao</SelectItem>
                      <SelectItem value="PARTY">Đi đảng</SelectItem>
                      <SelectItem value="STEERING_COMMITTEE">Đi ban chỉ đạo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="numberOfCopies">Số bản sao</Label>
                  <Input
                    id="numberOfCopies"
                    name="numberOfCopies"
                    type="number"
                    value={formData.numberOfCopies || ""}
                    onChange={handleNumberInputChange}
                    placeholder="Nhập số bản sao"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfPages">Số trang</Label>
                  <Input
                    id="numberOfPages"
                    name="numberOfPages"
                    type="number"
                    value={formData.numberOfPages || ""}
                    onChange={handleNumberInputChange}
                    placeholder="Nhập số trang"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSecureTransmission"
                      checked={formData.isSecureTransmission}
                      onCheckedChange={handleCheckboxChange("isSecureTransmission")}
                    />
                    <Label htmlFor="isSecureTransmission">Chuyển bằng điện mật</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noPaperCopy"
                      checked={formData.noPaperCopy}
                      onCheckedChange={handleCheckboxChange("noPaperCopy")}
                    />
                    <Label htmlFor="noPaperCopy">Không gửi bản giấy</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Content and Recipients */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Content Card - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardContent className="pt-6 h-full">
                  <div className="space-y-2 h-full flex flex-col">
                    <Label htmlFor="content">Nội dung văn bản</Label>
                    <div className="flex-1">
                      <RichTextEditor
                        content={formData.summary}
                        onChange={handleRichTextChange("content")}
                        placeholder="Nhập nội dung văn bản"
                        minHeight="500px"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recipients Card - Takes 1 column */}
            <Card className="h-full">
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
                        Danh sách phòng ban{" "}
                        {validationErrors.recipients && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-primary/5 px-3 py-2 border-b">
                          <span className="text-sm font-medium">
                            Chọn người nhận
                          </span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
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
                            maxHeight="300px"
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

                    {/* Selected Recipients Display */}
                    {secondaryDepartments.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-blue-600">
                          Đã chọn ({secondaryDepartments.length})
                        </Label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {secondaryDepartments.map((recipientId: any) => {
                            const recipientInfo = getRecipientInfo(recipientId);
                            return (
                              <div
                                key={recipientId}
                                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {recipientInfo.type === "user" ? (
                                    <Users className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <Building className="h-3 w-3 text-blue-600" />
                                  )}
                                  <span className="text-blue-800">{recipientInfo.displayName}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                  onClick={() => handleSelectSecondaryDepartment(recipientId)}
                                  type="button"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-sm border border-blue-500 bg-white"></div>
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


                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <RichTextEditor
                  content={formData.notes}
                  onChange={handleRichTextChange("note")}
                  placeholder="Nhập ghi chú (nếu có)"
                  minHeight="150px"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Attachments Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="file">Tệp đính kèm</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  multiple
                />

                {/* File Upload Progress */}
                <FileUploadProgress
                  files={fileUpload.files}
                  uploadProgress={fileUpload.uploadProgress}
                  isUploading={fileUpload.isUploading}
                  error={fileUpload.error}
                  onRemoveFile={handleRemoveFile}
                  onCancelUpload={fileUpload.cancelUpload}
                  formatFileSize={fileUpload.formatFileSize}
                  getTotalSize={fileUpload.getTotalSize}
                  className="mt-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Note */}
          <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Lưu ý:</span> Văn bản nội bộ sẽ được
              gửi đến tất cả phòng ban và cá nhân được chọn. Văn bản được gửi
              đến phòng ban sẽ được chuyển đến trưởng phòng của phòng ban đó.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
