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
  FileText,
  User,
  Users,
  Paperclip,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useToast } from "@/components/ui/use-toast";
import { UrgencyLevel, URGENCY_LEVELS } from "@/lib/types/urgency";
import { UrgencySelect } from "@/components/urgency-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  workflowAPI,
  usersAPI,
  senderApi,
  SenderDTO,
  documentTypesAPI,
  DocumentTypeDTO,
} from "@/lib/api";

export default function CreateExternalOutgoingDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  // State for form data
  const [formData, setFormData] = useState({
    documentNumber: "",
    sentDate: new Date(),
    recipient: "",
    documentType: "",
    title: "",
    content: "",
    approver: "",
    urgencyLevel: URGENCY_LEVELS.KHAN,
    note: "",
  });

  // State for file attachments (multiple files)
  const [files, setFiles] = useState<File[]>([]);

  // State for loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(false);
  const [approvers, setApprovers] = useState<any[]>([]);

  // State for recipients/senders
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipients, setRecipients] = useState<SenderDTO[]>([]);

  // State for document types
  const [isLoadingDocumentTypes, setIsLoadingDocumentTypes] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDTO[]>([]);

  // Fetch approvers and recipients when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        console.error("No user ID available");
        return;
      }

      try {
        // Fetch approvers
        setIsLoadingApprovers(true);
        const leaderUsers = await usersAPI.getUserForApproval(user.id);
        const seniorLeadersResponse =
          await usersAPI.getUsersByRoleAndDepartment(
            ["ROLE_SENIOR_LEADER"],
            0 // 0 to get from all departments
          );
        const allApprovers = [...leaderUsers, ...seniorLeadersResponse];
        const uniqueApprovers = allApprovers.filter(
          (approver, index, self) =>
            index === self.findIndex((a) => a.id === approver.id)
        );
        setApprovers(uniqueApprovers);

        // Fetch recipients/senders
        setIsLoadingRecipients(true);
        const sendersData = await senderApi.getAllSenders();
        setRecipients(sendersData || []);

        // Fetch document types
        setIsLoadingDocumentTypes(true);
        const documentTypesData =
          await documentTypesAPI.getActiveDocumentTypes();
        setDocumentTypes(documentTypesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu",
          variant: "destructive",
        });
      } finally {
        setIsLoadingApprovers(false);
        setIsLoadingRecipients(false);
        setIsLoadingDocumentTypes(false);
      }
    };

    fetchData();
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
      setFormData((prev) => ({ ...prev, sentDate: date }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.documentNumber ||
      !formData.title ||
      !formData.recipient ||
      !formData.approver
    ) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
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
        receivingDepartmentText: formData.recipient,
        signingDate: formData.sentDate,
        approverId: formData.approver,
        priority: formData.urgencyLevel,
        notes: formData.note,
        status: "PENDING_APPROVAL", // Set status for submission (not draft)
      };

      // Call API to create outgoing document
      await workflowAPI.createOugoingAlone(
        documentData,
        files.length > 0 ? files[0] : null
      );

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản đã được tạo và gửi phê duyệt",
      });

      addNotification({
        title: "Văn bản mới",
        message: `Văn bản "${formData.title}" đã được tạo và gửi phê duyệt`,
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
        receivingDepartmentText: formData.recipient,
        signingDate: formData.sentDate,
        approverId: formData.approver,
        priority: formData.urgencyLevel,
        notes: formData.note,
        status: "DRAFT", // Set status as draft
      };

      // Call API to create outgoing document as draft
      await workflowAPI.createOugoingAlone(
        documentData,
        files.length > 0 ? files[0] : null
      );

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản đã được lưu nháp",
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

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-6 max-w-5xl px-4">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/van-ban-di/them-moi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Tạo văn bản đi mới - Gửi bên ngoài
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Document Information */}
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
                  />
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
                          Đang tải danh sách...
                        </SelectItem>
                      ) : documentTypes.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Chưa có loại văn bản nào
                        </SelectItem>
                      ) : (
                        documentTypes.map((docType) => (
                          <SelectItem key={docType.id} value={docType.name}>
                            {docType.name}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">
                    Nơi nhận <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.recipient}
                    onValueChange={(value) =>
                      handleSelectChange("recipient", value)
                    }
                  >
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="Chọn nơi nhận văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRecipients ? (
                        <SelectItem value="loading" disabled>
                          Đang tải danh sách...
                        </SelectItem>
                      ) : recipients.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Chưa có nơi nhận nào
                        </SelectItem>
                      ) : (
                        recipients.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.name}>
                            {recipient.name}
                            {recipient.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                - {recipient.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="file">Tệp đính kèm</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Chọn tệp
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {files.length > 0
                      ? `Đã chọn ${files.length} tệp`
                      : "Chưa có tệp nào được chọn"}
                  </span>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content and Approval */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Content Card - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung văn bản</Label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={handleRichTextChange("content")}
                      placeholder="Nhập nội dung văn bản"
                      minHeight="400px"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Approval Card - Takes 1 column */}
            <Card className="h-fit">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin phê duyệt
                </CardTitle>
                <CardDescription>Người soạn thảo và phê duyệt</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Người soạn thảo</Label>
                    <div className="rounded-md border p-3 bg-accent/30">
                      <p className="font-medium text-sm">
                        {user?.fullName || "Người dùng hiện tại"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.position || "Chức vụ"} -{" "}
                        {user?.departmentName || "Phòng ban"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approver">
                      Người phê duyệt <span className="text-red-500">*</span>
                    </Label>
                    <Select
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
                              {approver.fullName} - {approver.roleDisplayNames}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <UrgencySelect
                    value={formData.urgencyLevel}
                    onValueChange={(value) =>
                      handleSelectChange("urgencyLevel", value)
                    }
                    label="Độ khẩn"
                    required
                  />

                  <div className="space-y-2 pt-4">
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
                      Gửi phê duyệt
                    </Button>
                    {/* 
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
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ghi chú
              </CardTitle>
              <CardDescription>
                Thêm ghi chú cho người phê duyệt (nếu có)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <RichTextEditor
                  content={formData.note}
                  onChange={handleRichTextChange("note")}
                  placeholder="Nhập ghi chú cho người phê duyệt (nếu có)"
                  minHeight="120px"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Note */}
          <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Lưu ý:</span> Sau khi gửi, văn bản
              sẽ được chuyển đến người phê duyệt để xem xét trước khi ban hành
              chính thức.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
