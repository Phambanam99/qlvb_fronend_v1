"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Send } from "lucide-react";
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
import { workflowAPI, incomingDocumentsAPI, usersAPI } from "@/lib/api";
import { ReplyDocumentInfo } from "../../components/reply-document-info";

export default function ReplyExternalDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const replyToId = searchParams.get("replyToId");

  // State for form data
  const [formData, setFormData] = useState({
    documentNumber: "",
    sentDate: new Date(),
    recipient: "",
    documentType: "",
    title: "",
    content: "",
    approver: "",
    priority: "normal",
    note: "",
  });

  // State for file attachment and incoming document
  const [file, setFile] = useState<File | null>(null);
  const [incomingDocument, setIncomingDocument] = useState<any>(null);

  // State for loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(false);
  const [isLoadingIncomingDoc, setIsLoadingIncomingDoc] = useState(true);
  const [approvers, setApprovers] = useState<any[]>([]);

  // Fetch incoming document if replyToId is provided
  useEffect(() => {
    const fetchIncomingDocument = async () => {
      if (!replyToId) {
        // Redirect back if no replyToId
        router.push("/van-ban-di/them-moi");
        return;
      }

      try {
        setIsLoadingIncomingDoc(true);
        const doc = await incomingDocumentsAPI.getIncomingDocumentById(
          replyToId
        );
        setIncomingDocument(doc.data);

        // Pre-fill some form fields
        setFormData((prev) => ({
          ...prev,
          title: `Trả lời: ${doc.data.title}`,
          recipient: doc.data.issuingAuthority || "",
        }));
      } catch (error) {
        console.error("Error fetching incoming document:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin văn bản đến",
          variant: "destructive",
        });
        router.push("/van-ban-di/them-moi");
      } finally {
        setIsLoadingIncomingDoc(false);
      }
    };

    fetchIncomingDocument();
  }, [replyToId, router, toast]);

  // Fetch approvers when component mounts
  useEffect(() => {
    const fetchApprovers = async () => {
      if (!user || !user.id) {
        console.error("No user ID available");
        return;
      }

      try {
        setIsLoadingApprovers(true);

        // Get users who can approve for the current user
        const leaderUsers = await usersAPI.getUserForApproval(user.id);

        // Get senior leaders across all departments
        const seniorLeadersResponse =
          await usersAPI.getUsersByRoleAndDepartment(
            ["ROLE_SENIOR_LEADER"],
            0 // 0 to get from all departments
          );

        // Combine both lists
        const allApprovers = [...leaderUsers, ...seniorLeadersResponse];

        // Remove duplicates if any (by ID)
        const uniqueApprovers = allApprovers.filter(
          (approver, index, self) =>
            index === self.findIndex((a) => a.id === approver.id)
        );

        setApprovers(uniqueApprovers);
      } catch (error) {
        console.error("Error fetching approvers:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách người phê duyệt",
          variant: "destructive",
        });
      } finally {
        setIsLoadingApprovers(false);
      }
    };

    fetchApprovers();
  }, [user, toast]);

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

    if (!replyToId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy văn bản cần trả lời",
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
        priority: formData.priority,
        notes: formData.note,
        status: "PENDING_APPROVAL", // Set status for submission (not draft)
      };

      // Call API to create response document
      await workflowAPI.createResponseDocument(
        documentData,
        replyToId,
        file || undefined
      );

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản trả lời đã được tạo và gửi phê duyệt",
      });

      addNotification({
        title: "Văn bản trả lời mới",
        message: `Văn bản trả lời "${formData.title}" đã được tạo và gửi phê duyệt`,
        type: "success",
      });

      // Redirect to outgoing documents list
      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error creating response document:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi tạo văn bản trả lời",
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

    if (!replyToId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy văn bản cần trả lời",
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
        priority: formData.priority,
        notes: formData.note,
        status: "DRAFT", // Set status as draft
      };

      // Call API to create response document as draft
      await workflowAPI.createResponseDocument(
        documentData,
        replyToId,
        file || undefined
      );

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản trả lời đã được lưu nháp",
      });

      // Redirect to outgoing documents list
      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi lưu nháp văn bản trả lời",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingIncomingDoc) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-di/them-moi">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Trả lời văn bản đến - Gửi bên ngoài
        </h1>
      </div>

      {/* Reply Document Info */}
      {incomingDocument && (
        <div className="mb-8">
          <ReplyDocumentInfo incomingDocument={incomingDocument} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Document Information Card */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản trả lời</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết của văn bản trả lời
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
                <Label htmlFor="recipient">
                  Nơi nhận <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  placeholder="Nhập nơi nhận văn bản"
                  required
                />
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
            </CardContent>
          </Card>

          {/* Approval Information Card */}
          <Card>
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
                    {user?.fullName || "Người dùng hiện tại"}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú cho người phê duyệt (nếu có)"
                  rows={4}
                />
              </div>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Lưu ý:</span> Sau khi gửi, văn
                  bản sẽ được chuyển đến người phê duyệt để xem xét trước khi
                  ban hành chính thức.
                </p>
              </div>

              <div className="flex flex-col space-y-2 pt-4">
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
        </div>
      </form>
    </div>
  );
}
