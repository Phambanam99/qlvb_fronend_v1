"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Send,
  PlusCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useRouter } from "next/navigation";
import {
  outgoingDocumentsAPI,
  departmentsAPI,
  usersAPI,
  workflowAPI,
  incomingDocumentsAPI,
  OutgoingDocumentDTO,
  DocumentWorkflowDTO,
  documentTypesAPI,
  DocumentTypeDTO,
  senderApi,
  SenderDTO,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import hooks and components
import { useDepartmentSelection } from "@/hooks/use-department-selection";
import { useDepartmentUsers } from "@/hooks/use-department-users";
import { DocumentTypeSelector } from "./components/document-type-selector";
import { SenderSelection } from "./components/sender-selection";

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

  // Helper function to find user by ID
  const findUserById = (deptId: number, userId: number) => {
    const users = departmentUsers[deptId] || [];
    return users.find((user) => user.id === userId) || null;
  };

  // Form state
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(false);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);

  // New state for document scope and sender
  const [documentScope, setDocumentScope] = useState<"INTERNAL" | "EXTERNAL">(
    "EXTERNAL"
  );
  const [selectedSender, setSelectedSender] = useState<number | string | null>(
    null
  );

  // Form data state
  const [formData, setFormData] = useState({
    documentNumber: "",
    sentDate: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    recipient: "",
    documentType: "",
    title: "",
    content: "",
    approver: "",
    priority: "normal",
    note: "",
  });

  // Handler for form field changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for select fields
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for document scope change
  const handleScopeChange = (scope: "INTERNAL" | "EXTERNAL") => {
    setDocumentScope(scope);
    if (scope === "INTERNAL") {
      // Clear recipient and approver when switching to internal
      setFormData((prev) => ({
        ...prev,
        recipient: "",
        approver: "",
      }));
    }
  };

  // Handler for sender selection
  const handleSelectSender = (senderId: number | string) => {
    setSelectedSender(senderId);
  };

  const handleClearSender = () => {
    setSelectedSender(null);
  };

  // State for document types
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDTO[]>([]);
  const [isLoadingDocumentTypes, setIsLoadingDocumentTypes] = useState(false);
  const [newDocumentType, setNewDocumentType] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingDocumentType, setIsCreatingDocumentType] = useState(false);
  const [documentTypeError, setDocumentTypeError] = useState<string | null>(
    null
  );

  // State for recipients (using senders as recipients)
  const [recipients, setRecipients] = useState<any[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  const [isCreatingRecipient, setIsCreatingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const { addNotification } = useNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy replyToId từ query parameter
  useEffect(() => {
    setReplyToId(searchParams.get("replyToId"));
  }, [searchParams]);

  // State cho thông tin văn bản đến (nếu là trả lời)
  const [incomingDocument, setIncomingDocument] = useState<any>(null);
  const [isLoadingIncomingDoc, setIsLoadingIncomingDoc] = useState(false);

  // Fetch document types on component mount
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setIsLoadingDocumentTypes(true);
        const types = await documentTypesAPI.getAllDocumentTypes();
        console.log("Fetched Document Types:", types);
        setDocumentTypes(types);
      } catch (error) {
        console.error("Error fetching document types:", error);
        addNotification({
          title: "Lỗi",
          message: "Không thể tải danh sách loại văn bản",
          type: "error",
        });
      } finally {
        setIsLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Function to handle creating a new document type
  const handleCreateDocumentType = async () => {
    if (!newDocumentType.trim()) {
      addNotification({
        title: "Cảnh báo",
        message: "Tên loại văn bản không được để trống",
        type: "warning",
      });
      return;
    }

    // Check if document type already exists
    const documentTypeExists = documentTypes.some(
      (type) => type.name.toLowerCase() === newDocumentType.trim().toLowerCase()
    );

    if (documentTypeExists) {
      setDocumentTypeError("Loại văn bản này đã tồn tại trong hệ thống");
      return;
    }

    try {
      setIsCreatingDocumentType(true);
      setDocumentTypeError(null);

      const documentTypeData: Partial<DocumentTypeDTO> = {
        name: newDocumentType,
        isActive: true,
      };

      console.log("Creating Document Type:", documentTypeData);
      const createdType = await documentTypesAPI.createDocumentType(
        documentTypeData
      );
      console.log("Created Document Type:", createdType);
      // Add the new document type to the list
      setDocumentTypes((prevTypes) => [...prevTypes, createdType]);

      // Reset and close dialog
      setNewDocumentType("");
      setIsDialogOpen(false);

      addNotification({
        title: "Thành công",
        message: "Đã thêm loại văn bản mới",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error creating document type:", error);
      let errorMessage = "Có lỗi xảy ra khi thêm loại văn bản";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setDocumentTypeError(errorMessage);
    } finally {
      setIsCreatingDocumentType(false);
    }
  };

  // Function to handle creating a new recipient
  const handleCreateRecipient = async () => {
    if (!newRecipient.trim()) {
      addNotification({
        title: "Cảnh báo",
        message: "Tên người nhận không được để trống",
        type: "warning",
      });
      return;
    }

    // Check if recipient already exists
    const recipientExists = recipients.some(
      (recipient) =>
        recipient.name.toLowerCase() === newRecipient.trim().toLowerCase()
    );

    if (recipientExists) {
      setRecipientError("Người nhận này đã tồn tại trong hệ thống");
      return;
    }

    try {
      setIsCreatingRecipient(true);
      setRecipientError(null);

      const senderData: Partial<SenderDTO> = {
        name: newRecipient,
        isActive: true,
      };

      console.log("Creating Recipient:", senderData);
      const createdRecipient = await senderApi.createSender(senderData);
      console.log("Created Recipient:", createdRecipient);

      // Add the new recipient to the list
      setRecipients((prevRecipients) => [...prevRecipients, createdRecipient]);

      // Set the new recipient as selected
      setFormData((prev) => ({
        ...prev,
        recipient: createdRecipient.name,
      }));

      // Reset and close dialog
      setNewRecipient("");
      setIsRecipientDialogOpen(false);

      addNotification({
        title: "Thành công",
        message: "Đã thêm người nhận mới",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error creating recipient:", error);
      let errorMessage = "Có lỗi xảy ra khi thêm người nhận";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setRecipientError(errorMessage);
    } finally {
      setIsCreatingRecipient(false);
    }
  };

  // Fetch incoming document if replyToId is provided
  useEffect(() => {
    const fetchIncomingDocument = async () => {
      if (!replyToId) return;

      try {
        setIsLoadingIncomingDoc(true);
        const doc = await incomingDocumentsAPI.getDocumentById(
          Number(replyToId)
        );
        setIncomingDocument(doc);

        // Pre-fill some form fields
        setFormData((prev) => ({
          ...prev,
          title: `Trả lời: ${doc.title}`,
          recipient: doc.issuingAuthority || "",
        }));
      } catch (error) {
        console.error("Error fetching incoming document:", error);
        addNotification({
          title: "Lỗi",
          message: "Không thể tải thông tin văn bản đến",
          type: "error",
        });
      } finally {
        setIsLoadingIncomingDoc(false);
      }
    };

    fetchIncomingDocument();
  }, [replyToId]);

  // Fetch approvers for external documents
  useEffect(() => {
    if (documentScope === "EXTERNAL") {
      const fetchApprovers = async () => {
        try {
          setIsLoadingApprovers(true);
          const response = await departmentsAPI.getAllDepartments();

          // Flatten all users from all departments
          let allUsers: any[] = [];
          const processUsers = (users: any[]) => {
            const leadershipUsers = users.filter((user) => {
              const roles = user.roles || [];
              return roles.some((role: any) =>
                Object.keys(leadershipRoleOrder).includes(role.name)
              );
            });

            return leadershipUsers.map((user) => ({
              ...user,
              highestRole: roles
                .filter((role: any) =>
                  Object.keys(leadershipRoleOrder).includes(role.name)
                )
                .sort(
                  (a: any, b: any) =>
                    leadershipRoleOrder[a.name] - leadershipRoleOrder[b.name]
                )[0],
            }));
          };

          const processDepartments = (departments: any[]) => {
            if (!Array.isArray(departments)) {
              // console.error("Expected departments to be an array, but got:", departments);
              return;
            }
            departments.forEach((dept) => {
              if (dept.users) {
                allUsers = [...allUsers, ...processUsers(dept.users)];
              }
              if (dept.children) {
                processDepartments(dept.children);
              }
            });
          };

          processDepartments(response);

          setApprovers(allUsers);
        } catch (error) {
          console.error("Error fetching approvers:", error);
          addNotification({
            title: "Lỗi",
            message: "Không thể tải danh sách người phê duyệt",
            type: "error",
          });
        } finally {
          setIsLoadingApprovers(false);
        }
      };

      fetchApprovers();
    }
  }, [documentScope]);

  // Fetch recipients for external documents
  useEffect(() => {
    if (documentScope === "EXTERNAL") {
      const fetchRecipients = async () => {
        try {
          setIsLoadingRecipients(true);
          const senders = await senderApi.getAllSenders();
          setRecipients(senders);
        } catch (error) {
          console.error("Error fetching recipients:", error);
          addNotification({
            title: "Lỗi",
            message: "Không thể tải danh sách nơi nhận",
            type: "error",
          });
        } finally {
          setIsLoadingRecipients(false);
        }
      };

      fetchRecipients();
    }
  }, [documentScope]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.documentNumber || !formData.title) {
      addNotification({
        title: "Lỗi",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const documentData: Partial<OutgoingDocumentDTO> = {
        documentNumber: formData.documentNumber,
        sentDate: formData.sentDate,
        recipient:
          documentScope === "EXTERNAL" ? formData.recipient : undefined,
        documentType: formData.documentType,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        note: formData.note,
        authorId: user?.id,
        status: "DRAFT",
        approverId:
          documentScope === "EXTERNAL" ? formData.approver : undefined,
        replyToId: replyToId ? Number(replyToId) : undefined,
        scope: documentScope,
        senderId: selectedSender ? String(selectedSender) : undefined,
      };

      console.log("Creating outgoing document:", documentData);

      const createdDocument = await outgoingDocumentsAPI.createDocument(
        documentData
      );

      // Upload file if provided
      if (file && createdDocument.id) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        await outgoingDocumentsAPI.uploadAttachment(
          createdDocument.id,
          fileFormData
        );
      }

      addNotification({
        title: "Thành công",
        message: `Đã tạo ${
          documentScope === "INTERNAL" ? "văn bản nội bộ" : "văn bản đi"
        } thành công`,
        type: "success",
      });

      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error creating document:", error);
      addNotification({
        title: "Lỗi",
        message:
          error.response?.data?.message || "Có lỗi xảy ra khi tạo văn bản",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.documentNumber || !formData.title) {
      addNotification({
        title: "Lỗi",
        message: "Vui lòng điền ít nhất số văn bản và trích yếu để lưu nháp",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const documentData: Partial<OutgoingDocumentDTO> = {
        documentNumber: formData.documentNumber,
        sentDate: formData.sentDate,
        recipient:
          documentScope === "EXTERNAL" ? formData.recipient : undefined,
        documentType: formData.documentType,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        note: formData.note,
        authorId: user?.id,
        status: "DRAFT",
        replyToId: replyToId ? Number(replyToId) : undefined,
        scope: documentScope,
        senderId: selectedSender ? String(selectedSender) : undefined,
      };

      console.log("Saving draft:", documentData);

      const savedDraft = await outgoingDocumentsAPI.createDocument(
        documentData
      );

      // Upload file if provided
      if (file && savedDraft.id) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        await outgoingDocumentsAPI.uploadAttachment(
          savedDraft.id,
          fileFormData
        );
      }

      addNotification({
        title: "Thành công",
        message: "Đã lưu nháp văn bản",
        type: "success",
      });

      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      addNotification({
        title: "Lỗi",
        message: error.response?.data?.message || "Có lỗi xảy ra khi lưu nháp",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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

      {replyToId && incomingDocument && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">
              Đang trả lời văn bản:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <span className="font-medium">Số:</span>{" "}
                {incomingDocument.documentNumber}
              </p>
              <p>
                <span className="font-medium">Trích yếu:</span>{" "}
                {incomingDocument.title}
              </p>
              <p>
                <span className="font-medium">Đơn vị gửi:</span>{" "}
                {incomingDocument.issuingAuthority}
              </p>
            </div>
          </CardContent>
        </Card>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">
                    Số văn bản <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="Nhập số văn bản"
                    required
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentDate">Ngày ban hành</Label>
                  <Input
                    id="sentDate"
                    name="sentDate"
                    type="date"
                    required
                    value={formData.sentDate}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Only show recipient for external documents */}
                {documentScope === "EXTERNAL" && (
                  <div className="space-y-2">
                    <Label htmlFor="recipient">
                      Nơi nhận <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        name="recipient"
                        value={formData.recipient}
                        onValueChange={(value) =>
                          handleSelectChange("recipient", value)
                        }
                      >
                        <SelectTrigger id="recipient" className="flex-1">
                          <SelectValue placeholder="Chọn nơi nhận" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingRecipients ? (
                            <SelectItem value="loading" disabled>
                              Đang tải danh sách nơi nhận...
                            </SelectItem>
                          ) : recipients.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              Chưa có người nhận nào
                            </SelectItem>
                          ) : (
                            recipients.map((recipient) => (
                              <SelectItem
                                key={recipient.id}
                                value={String(recipient.name)}
                              >
                                {recipient.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Dialog
                        open={isRecipientDialogOpen}
                        onOpenChange={setIsRecipientDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Thêm người nhận mới</DialogTitle>
                            <DialogDescription>
                              Nhập tên người nhận chưa có trong hệ thống
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="newRecipient">
                                Tên người nhận
                              </Label>
                              <Input
                                id="newRecipient"
                                value={newRecipient}
                                onChange={(e) =>
                                  setNewRecipient(e.target.value)
                                }
                                placeholder="Nhập tên người nhận mới"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsRecipientDialogOpen(false);
                              }}
                            >
                              Hủy
                            </Button>
                            <Button
                              onClick={handleCreateRecipient}
                              disabled={
                                isCreatingRecipient || !newRecipient.trim()
                              }
                            >
                              {isCreatingRecipient
                                ? "Đang thêm..."
                                : "Thêm người nhận"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <div className="flex gap-2">
                    <Select
                      name="documentType"
                      value={formData.documentType}
                      onValueChange={(value) =>
                        handleSelectChange("documentType", value)
                      }
                    >
                      <SelectTrigger id="documentType" className="flex-1">
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
                            <SelectItem key={type.id} value={String(type.name)}>
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm loại văn bản mới</DialogTitle>
                          <DialogDescription>
                            Nhập tên loại văn bản chưa có trong hệ thống
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newDocumentType">
                              Tên loại văn bản
                            </Label>
                            <Input
                              id="newDocumentType"
                              value={newDocumentType}
                              onChange={(e) => {
                                setNewDocumentType(e.target.value);
                                setDocumentTypeError(null);
                              }}
                              placeholder="Nhập tên loại văn bản mới"
                              className={
                                documentTypeError ? "border-red-500" : ""
                              }
                            />
                            {documentTypeError && (
                              <p className="text-sm font-medium text-red-500 mt-1">
                                {documentTypeError}
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={handleCreateDocumentType}
                            disabled={
                              isCreatingDocumentType || !newDocumentType.trim()
                            }
                          >
                            {isCreatingDocumentType
                              ? "Đang thêm..."
                              : "Thêm loại văn bản"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Trích yếu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Nhập trích yếu văn bản"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Nhập nội dung văn bản"
                  rows={10}
                  value={formData.content}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Tệp đính kèm</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="attachments"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("attachments")?.click()
                    }
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Chọn tệp
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : "Chưa có tệp nào được chọn"}
                  </span>
                </div>
                {file && (
                  <div className="mt-2">
                    <div className="text-sm">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sender and Approval Information */}
          <div className="space-y-6">
            {/* Sender Selection Card */}
            {documentScope === "INTERNAL" && (<Card className="bg-card">
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
                  />
                )}
              </CardContent>
            </Card>)}

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
                  <div className="space-y-2">
                    <Label>Người soạn thảo</Label>
                    <div className="rounded-md border p-3 bg-accent/30">
                      <p className="font-medium">
                        {user?.name || "Người dùng hiện tại"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.position || "Chức vụ"} -{" "}
                        {user?.department || "Phòng ban"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approver">
                      Người phê duyệt <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name="approver"
                      value={formData.approver}
                      onValueChange={(value) =>
                        handleSelectChange("approver", value)
                      }
                    >
                      <SelectTrigger id="approver">
                        <SelectValue placeholder="Chọn người phê duyệt" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingApprovers ? (
                          <SelectItem value="loading" disabled>
                            Đang tải danh sách...
                          </SelectItem>
                        ) : approvers.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Không tìm thấy người phê duyệt
                          </SelectItem>
                        ) : (
                          approvers.map((approver) => (
                            <SelectItem
                              key={approver.id}
                              value={String(approver.id)}
                            >
                              {approver.fullName} - {approver.position}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Độ ưu tiên</Label>
                    <Select
                      name="priority"
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
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      name="note"
                      placeholder="Nhập ghi chú cho người phê duyệt (nếu có)"
                      rows={4}
                      value={formData.note}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Lưu ý:</span> Sau khi gửi,
                      văn bản sẽ được chuyển đến người phê duyệt để xem xét
                      trước khi ban hành chính thức.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Internal Document Note */}
            {documentScope === "INTERNAL" && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800">
                        Văn bản nội bộ
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Văn bản này sẽ được gửi trực tiếp trong nội bộ đơn vị mà
                        không cần qua quy trình phê duyệt. Thích hợp cho các
                        thông báo, hướng dẫn nội bộ.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/van-ban-di">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Hủy
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Lưu nháp
            </Button>
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (documentScope === "EXTERNAL" &&
                (!formData.recipient || !formData.approver))
            }
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {documentScope === "INTERNAL" ? "Gửi văn bản" : "Gửi phê duyệt"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
