"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Paperclip,
  Save,
  X,
  Plus,
  Building,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Import hooks and components
import { DepartmentTree } from "@/components/department-tree";
import { useDepartmentSelection } from "@/hooks/use-department-selection";
import { useDocumentForm } from "@/hooks/use-document-form";
import { useDepartmentUsers } from "@/hooks/use-department-users";
import { useDocumentTypeManagement } from "@/hooks/use-document-type-management";
import { useSenderManagement } from "@/hooks/use-sender-management";
import { RichTextEditor } from "@/components/ui";
// Import new components
import { DocumentPurposeSelector } from "./components/document-purpose-selector";
import { ProcessingSection } from "./components/processing-section";
import { NotificationSection } from "./components/notification-section";
import { DocumentInfoForm } from "./components/document-info-form";

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

export default function AddIncomingDocumentPage() {
  const { toast } = useToast();

  // Use custom hooks
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
    documentNumber,
    setDocumentNumber,
    documentCode,
    setDocumentCode,
    documentTitle,
    setDocumentTitle,
    documentSummary,
    setDocumentSummary,
    documentDate,
    setDocumentDate,
    receivedDate,
    setReceivedDate,
    documentNotes,
    setDocumentNotes,
    selectedDocumentType,
    setSelectedDocumentType,
    files,
    setFiles,
    documentTypes,
    urgencyLevel,
    setUrgencyLevel,
    securityLevel,
    setSecurityLevel,
    closureRequest,
    setClosureRequest,
    closureDeadline,
    setClosureDeadline,
    sendingDepartmentName,
    setSendingDepartmentName,
    emailSource,
    setEmailSource,
    isLoadingDocumentTypes,
    isSubmitting,
    handleSubmit: submitDocument,
  } = useDocumentForm();

  const {
    departmentUsers,
    isLoadingUsers,
    fetchDepartmentUsers,
    getLeadershipRole,
  } = useDepartmentUsers(leadershipRoleOrder);

  const {
    newDocumentType,
    setNewDocumentType,
    isDocumentTypeDialogOpen,
    setIsDocumentTypeDialogOpen,
    isCreatingDocumentType,
    documentTypeError,
    setDocumentTypeError,
    createDocumentType,
  } = useDocumentTypeManagement();

  const {
    departments: senderDepartments,
    isLoadingDepartments,
    newSender,
    setNewSender,
    dialogOpen,
    setDialogOpen,
    isCreatingSender,
    senderError,
    setSenderError,
    createSender,
  } = useSenderManagement();

  // Local state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [documentPurpose, setDocumentPurpose] = useState<
    "PROCESS" | "NOTIFICATION"
  >("PROCESS");
  const [notificationScope, setNotificationScope] = useState<
    "ALL_UNITS" | "SPECIFIC_UNITS"
  >("ALL_UNITS");

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!documentNumber.trim()) {
      errors.documentNumber = "Số văn bản là bắt buộc";
    }

    if (!documentTitle.trim()) {
      errors.documentTitle = "Trích yếu là bắt buộc";
    }

    if (!sendingDepartmentName.trim()) {
      errors.sendingDepartmentName = "Đơn vị gửi là bắt buộc";
    }

    // // Chỉ validate phòng ban xử lý chính khi văn bản cần xử lý
    // if (documentPurpose === "PROCESS" && !primaryDepartment) {
    //   errors.primaryDepartment = "Phòng ban xử lý chính là bắt buộc";
    // }

    // Validate notification scope
    if (
      documentPurpose === "NOTIFICATION" &&
      notificationScope === "SPECIFIC_UNITS" &&
      secondaryDepartments.length === 0
    ) {
      errors.notificationDepartments =
        "Vui lòng chọn ít nhất một phòng ban nhận thông báo";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle primary department selection
  const handleSelectPrimaryDepartment = (deptId: number | string) => {
    // Convert string IDs back to number if needed
    const id =
      typeof deptId === "string" && deptId.includes("-")
        ? deptId
        : Number(deptId);
    selectPrimaryDepartment(id as number);
  };

  // Handle secondary department selection
  const handleSelectSecondaryDepartment = (deptId: number | string) => {
    const id =
      typeof deptId === "string" && deptId.includes("-")
        ? deptId
        : Number(deptId);
    selectSecondaryDepartment(id as number);
  };

  // Handle removing selections
  const handleRemovePrimaryDepartment = () => {
    selectPrimaryDepartment(null as any);
  };

  const handleRemoveSecondaryDepartment = (deptId: number | string) => {
    // Convert back to number if it was a composite string ID
    if (typeof deptId === "string" && deptId.includes("-")) {
      // For composite IDs like "departmentId-userId", we need to handle differently
      // Just remove from the array directly through the hook
      const currentIds = secondaryDepartments.filter(
        (id: any) => id !== deptId
      );
      // Since we can't set secondary departments directly, we need to clear and re-add
      clearSelection();
      if (primaryDepartment) {
        selectPrimaryDepartment(primaryDepartment);
      }
      currentIds.forEach((id: any) => selectSecondaryDepartment(id));
    } else {
      // For regular department IDs, use the hook method
      selectSecondaryDepartment(Number(deptId));
    }
  };

  // Handle document type creation
  const handleAddDocumentType = async () => {
    const updatedTypes = await createDocumentType(documentTypes);
    if (updatedTypes) {
      // The document types are managed by the useDocumentForm hook
      // We don't need to set them manually as the hook will refresh them
      // Just close the dialog
      setIsDocumentTypeDialogOpen(false);
    }
  };

  // Handle notification scope change
  const handleNotificationScopeChange = (
    scope: "ALL_UNITS" | "SPECIFIC_UNITS"
  ) => {
    setNotificationScope(scope);
    if (scope === "ALL_UNITS") {
      clearSelection();
    }
  };

  // Helper function to find user by ID
  const findUserById = (deptId: number, userId: number) => {
    const users = departmentUsers[deptId] || [];
    return users.find((user) => user.id === userId) || null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // No need to read from FormData since all data is managed by useState
    // All form fields are already managed by useState through custom hooks

    // Prepare processing data based on document purpose
    const processingData = {
      purpose: documentPurpose,
      primaryDepartment:
        documentPurpose === "PROCESS" ? primaryDepartment : null,
      secondaryDepartments:
        documentPurpose === "NOTIFICATION" && notificationScope === "ALL_UNITS"
          ? [] // Empty array for ALL_UNITS - backend will handle this
          : (secondaryDepartments as number[]),
      notificationScope:
        documentPurpose === "NOTIFICATION" ? notificationScope : null,
    };

    // Submit using the hook
    await submitDocument(
      processingData.primaryDepartment,
      processingData.secondaryDepartments,
      documentPurpose,
      processingData.notificationScope || undefined
    );
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary inline-flex items-center"
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                href="/van-ban-den"
                className="text-gray-700 hover:text-primary"
              >
                Văn bản đến
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Thêm mới</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
     

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Document Information Card */}
          <Card className="bg-card">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg">Thông tin văn bản</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết của văn bản đến
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DocumentInfoForm
                documentNumber={documentNumber}
                setDocumentNumber={setDocumentNumber}
                documentCode={documentCode}
                setDocumentCode={setDocumentCode}
                documentTitle={documentTitle}
                setDocumentTitle={setDocumentTitle}
                documentSummary={documentSummary}
                setDocumentSummary={setDocumentSummary}
                documentDate={documentDate}
                setDocumentDate={setDocumentDate}
                receivedDate={receivedDate}
                setReceivedDate={setReceivedDate}
                sendingDepartmentName={sendingDepartmentName}
                setSendingDepartmentName={setSendingDepartmentName}
                selectedDocumentType={selectedDocumentType}
                setSelectedDocumentType={setSelectedDocumentType}
                urgencyLevel={urgencyLevel}
                setUrgencyLevel={setUrgencyLevel}
                securityLevel={securityLevel}
                setSecurityLevel={setSecurityLevel}
                files={files}
                handleFileChange={handleFileChange}
                handleRemoveFile={handleRemoveFile}
                documentTypes={documentTypes}
                isLoadingDocumentTypes={isLoadingDocumentTypes}
                newDocumentType={newDocumentType}
                setNewDocumentType={setNewDocumentType}
                isDocumentTypeDialogOpen={isDocumentTypeDialogOpen}
                setIsDocumentTypeDialogOpen={setIsDocumentTypeDialogOpen}
                isCreatingDocumentType={isCreatingDocumentType}
                documentTypeError={documentTypeError}
                setDocumentTypeError={setDocumentTypeError}
                handleAddDocumentType={handleAddDocumentType}
                senderDepartments={senderDepartments}
                isLoadingDepartments={isLoadingDepartments}
                newSender={newSender}
                setNewSender={setNewSender}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                isCreatingSender={isCreatingSender}
                senderError={senderError}
                setSenderError={setSenderError}
                createSender={createSender}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
              />
            </CardContent>
          </Card>

          {/* Processing Assignment Card */}
          <Card className="bg-card">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Phân loại văn bản</CardTitle>
              <CardDescription>Chọn mục đích của văn bản</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Document Purpose Selection */}
              <DocumentPurposeSelector
                documentPurpose={documentPurpose}
                onPurposeChange={setDocumentPurpose}
              />

              {/* Processing Section - Only show when PROCESS is selected */}
              {documentPurpose === "PROCESS" && (
                <ProcessingSection
                  primaryDepartment={primaryDepartment}
                  secondaryDepartments={secondaryDepartments as number[]}
                  validationErrors={validationErrors}
                  findDepartmentById={findDepartmentById}
                  onRemovePrimaryDepartment={handleRemovePrimaryDepartment}
                  onRemoveSecondaryDepartment={handleRemoveSecondaryDepartment}
                  onClearSelection={clearSelection}
                />
              )}

              {/* Notification Section - Only show when NOTIFICATION is selected */}
              {documentPurpose === "NOTIFICATION" && (
                <NotificationSection
                  notificationScope={notificationScope}
                  secondaryDepartments={
                    secondaryDepartments as (number | string)[]
                  }
                  findDepartmentById={findDepartmentById}
                  findUserById={findUserById}
                  getLeadershipRole={getLeadershipRole}
                  getRoleDisplayName={getRoleDisplayName}
                  onScopeChange={handleNotificationScopeChange}
                  onRemoveSecondaryDepartment={handleRemoveSecondaryDepartment}
                  onClearSelection={clearSelection}
                />
              )}

              {/* Department Tree - Show for both cases but with different context */}
              {(documentPurpose === "PROCESS" ||
                (documentPurpose === "NOTIFICATION" &&
                  notificationScope === "SPECIFIC_UNITS")) && (
                <div className="space-y-2">
                  <Label>
                    {documentPurpose === "PROCESS"
                      ? "Danh sách phòng ban xử lý"
                      : "Danh sách phòng ban nhận thông báo"}
                  </Label>
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {documentPurpose === "PROCESS"
                          ? "Chọn phòng ban xử lý văn bản"
                          : "Chọn phòng ban nhận thông báo"}
                      </span>
                    </div>

                    {isLoadingDepartmentList ? (
                      <div className="flex items-center justify-center p-4">
                        <p>Đang tải danh sách phòng ban...</p>
                      </div>
                    ) : (
                      <DepartmentTree
                        departments={departments}
                        expandedDepartments={expandedDepartments}
                        toggleDepartment={toggleDepartment}
                        onSelectPrimaryDepartment={
                          documentPurpose === "PROCESS"
                            ? handleSelectPrimaryDepartment
                            : undefined
                        }
                        onSelectSecondaryDepartment={
                          handleSelectSecondaryDepartment
                        }
                        primaryDepartment={
                          documentPurpose === "PROCESS"
                            ? primaryDepartment
                            : null
                        }
                        secondaryDepartments={secondaryDepartments as any}
                        departmentUsers={departmentUsers}
                        isLoadingUsers={isLoadingUsers}
                        onDepartmentExpand={fetchDepartmentUsers}
                        getLeadershipRole={getLeadershipRole}
                        getRoleDisplayName={getRoleDisplayName}
                        selectionMode={
                          documentPurpose === "PROCESS" ? "both" : "secondary"
                        }
                        maxHeight="400px"
                        primaryButtonText="Chính"
                        secondaryButtonText="Phụ"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs mt-1">
                    {documentPurpose === "PROCESS" && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm border border-red-500 bg-white"></div>
                        <span>Xử lý chính</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm border border-blue-500 bg-white"></div>
                      <span>
                        {documentPurpose === "PROCESS"
                          ? "Phối hợp"
                          : "Nhận thông báo"}
                      </span>
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

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {documentPurpose === "PROCESS"
                    ? "Ghi chú"
                    : "Nội dung thông báo"}
                </Label>
                <RichTextEditor
                  content={documentNotes}
                  onChange={(content) => setDocumentNotes(content)}
                  placeholder={
                    documentPurpose === "PROCESS"
                      ? "Nhập ghi chú cho phòng ban xử lý (nếu có)"
                      : "Nhập nội dung thông báo (nếu có)"
                  }
                  className={validationErrors.summary ? "border-red-500" : ""}
                  minHeight="150px"
                />
              </div>

              {documentPurpose === "PROCESS" && (
                <div className="space-y-2">
                  <Label htmlFor="deadline">Thời hạn xử lý</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={closureDeadline}
                    onChange={(e) => setClosureDeadline(e.target.value)}
                    placeholder="Chọn thời hạn xử lý"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/van-ban-den">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Hủy
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                // Save as draft functionality
                toast({
                  title: "Thông báo",
                  description: "Chức năng lưu nháp sẽ được cập nhật sớm",
                });
              }}
            >
              Lưu nháp
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                if (
                  confirm(
                    "Bạn có chắc muốn đặt lại form? Tất cả dữ liệu sẽ bị mất."
                  )
                ) {
                  window.location.reload();
                }
              }}
            >
              Đặt lại
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (documentPurpose === "NOTIFICATION" &&
                  notificationScope === "SPECIFIC_UNITS" &&
                  secondaryDepartments.length === 0)
              }
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu văn bản
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
