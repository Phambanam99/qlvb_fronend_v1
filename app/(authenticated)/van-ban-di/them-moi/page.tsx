"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Import hooks and components
import { useDepartmentSelection } from "@/hooks/use-department-selection";
import { useDepartmentUsers } from "@/hooks/use-department-users";
import { useDocumentForm } from "./hooks/use-document-form";

// Import new components
import { DocumentTypeSelector } from "./components/document-type-selector";
import { DocumentInfoForm } from "./components/document-info-form";
import { SenderSelection } from "./components/sender-selection";
import { ApprovalSection } from "./components/approval-section";
import { InternalDocumentNote } from "./components/internal-document-note";
import { ActionButtons } from "./components/action-buttons";
import { ReplyDocumentInfo } from "./components/reply-document-info";

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

export default function AddOutgoingDocumentPage() {
  const { user } = useAuth();

  // Use custom hooks
  const {
    departments,
    expandedDepartments,
    isLoading: isLoadingDepartmentList,
    toggleDepartment,
    findDepartmentById,
  } = useDepartmentSelection();

  const {
    departmentUsers,
    isLoadingUsers,
    fetchDepartmentUsers,
    getLeadershipRole,
  } = useDepartmentUsers(leadershipRoleOrder);

  // Use document form hook
  const {
    formData,
    documentScope,
    selectedSender,
    selectedRecipients,
    file,
    isSubmitting,
    replyToId,
    incomingDocument,
    isLoadingIncomingDoc,
    handleInputChange,
    handleSelectChange,
    handleScopeChange,
    handleSelectSender,
    handleClearSender,
    handleSelectRecipient,
    handleRemoveRecipient,
    handleClearAllRecipients,
    handleFileChange,
    handleSubmit,
    handleSaveDraft,
    formIsValid,
  } = useDocumentForm();

  // Helper function to find user by ID
  const findUserById = (deptId: number, userId: number) => {
    const users = departmentUsers[deptId] || [];
    return users.find((user) => user.id === userId) || null;
  };

  // Wrapper function to pass departments to handleSelectRecipient
  const handleSelectRecipientWithDepartments = (
    recipientId: number | string
  ) => {
    handleSelectRecipient(
      recipientId,
      departments,
      departmentUsers,
      getLeadershipRole
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-di">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {replyToId ? "Trả lời văn bản đến" : "Tạo văn bản đi"}
        </h1>
      </div>

      {/* Reply Document Info */}
      {replyToId && incomingDocument && (
        <ReplyDocumentInfo incomingDocument={incomingDocument} />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Document Information Card */}
          <Card className="bg-card">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết của văn bản đi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Document Type Selector */}
              <DocumentTypeSelector
                documentScope={documentScope}
                onScopeChange={handleScopeChange}
              />

              {/* Document Info Form */}
              <DocumentInfoForm
                formData={formData}
                documentScope={documentScope}
                file={file}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onFileChange={handleFileChange}
              />
            </CardContent>
          </Card>

          {/* Sender and Approval Information */}
          <div className="space-y-6">
            {/* Sender Selection Card - Only for internal documents */}
            {documentScope === "INTERNAL" && (
              <Card className="bg-card">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle>Thông tin người nhận</CardTitle>
                  <CardDescription>
                    Chọn phòng ban hoặc cán bộ nhận văn bản
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingDepartmentList ? (
                    <div className="flex items-center justify-center p-4">
                      <p>Đang tải danh sách phòng ban...</p>
                    </div>
                  ) : (
                    <SenderSelection
                      departments={departments}
                      expandedDepartments={expandedDepartments}
                      toggleDepartment={toggleDepartment}
                      selectedSender={selectedSender}
                      onSelectSender={handleSelectSender}
                      departmentUsers={departmentUsers}
                      isLoadingUsers={isLoadingUsers}
                      onDepartmentExpand={fetchDepartmentUsers}
                      getLeadershipRole={getLeadershipRole}
                      getRoleDisplayName={getRoleDisplayName}
                      findDepartmentById={findDepartmentById}
                      findUserById={findUserById}
                      onClearSender={handleClearSender}
                      selectedRecipients={selectedRecipients}
                      onSelectRecipient={handleSelectRecipientWithDepartments}
                      onRemoveRecipient={handleRemoveRecipient}
                      onClearAllRecipients={handleClearAllRecipients}
                      isMultiSelect={true}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Approval Information Card - Only for external documents */}
            {documentScope === "EXTERNAL" && (
              <Card className="bg-card">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle>Thông tin phê duyệt</CardTitle>
                  <CardDescription>
                    Thông tin về người soạn thảo và phê duyệt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <ApprovalSection
                    user={user}
                    formData={{
                      approver: formData.approver,
                      priority: formData.priority,
                      note: formData.note,
                    }}
                    onSelectChange={handleSelectChange}
                    onInputChange={handleInputChange}
                    leadershipRoleOrder={leadershipRoleOrder}
                  />
                </CardContent>
              </Card>
            )}

            {/* Internal Document Note */}
            {documentScope === "INTERNAL" && <InternalDocumentNote />}
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          documentScope={documentScope}
          isSubmitting={isSubmitting}
          isFormValid={formIsValid}
          onSaveDraft={handleSaveDraft}
        />
      </form>
    </div>
  );
}
