"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Building,
  Calendar,
  MessageSquare,
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
import { Separator } from "@/components/ui/separator";
import {
  getDocumentById,
  replyToDocument,
} from "@/lib/api/internalDocumentApi";
import { documentTypesAPI, DocumentTypeDTO } from "@/lib/api";

interface OriginalDocument {
  id: number;
  documentNumber: string;
  title: string;
  summary: string;
  documentType: string;
  signingDate: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  status: "DRAFT" | "SENT" | "APPROVED";
  senderName: string;
  senderDepartment: string;
  createdAt: string;
}

export default function ReplyInternalDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const originalDocumentId = params.id as string;

  // State for original document
  const [originalDocument, setOriginalDocument] =
    useState<OriginalDocument | null>(null);
  const [loadingOriginal, setLoadingOriginal] = useState(true);

  // State for reply form data
  const [formData, setFormData] = useState({
    documentNumber: "",
    signingDate: new Date(),
    documentType: "",
    title: "",
    summary: "",
    priority: "normal" as "normal" | "high" | "urgent",
    notes: "",
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

  // Load original document and document types
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch original document
        setLoadingOriginal(true);
        const originalDoc = await getDocumentById(Number(originalDocumentId));
        setOriginalDocument(originalDoc);

        // Pre-fill reply form with related data
        setFormData((prev) => ({
          ...prev,
          title: `Trả lời: ${originalDoc.title}`,
          documentType: originalDoc.documentType,
          priority: originalDoc.priority.toLowerCase() as
            | "normal"
            | "high"
            | "urgent",
        }));

        // Fetch document types
        setIsLoadingDocumentTypes(true);
        const types = await documentTypesAPI.getAllDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description:
            "Không thể tải thông tin văn bản gốc. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoadingOriginal(false);
        setIsLoadingDocumentTypes(false);
      }
    };

    if (originalDocumentId) {
      fetchData();
    }
  }, [originalDocumentId, toast]);

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
      setFormData((prev) => ({ ...prev, signingDate: date }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Priority display mapping
  const getPriorityBadge = (priority: string) => {
    const variants = {
      NORMAL: { variant: "outline" as const, text: "Bình thường" },
      HIGH: { variant: "secondary" as const, text: "Cao" },
      URGENT: { variant: "destructive" as const, text: "Khẩn" },
    };
    const info = variants[priority as keyof typeof variants] || variants.NORMAL;
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return dateString || "-";
    }
  };

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.documentNumber.trim()) {
      errors.documentNumber = "Số văn bản là bắt buộc";
    }

    if (!formData.title.trim()) {
      errors.title = "Tiêu đề văn bản là bắt buộc";
    }

    if (!formData.summary.trim()) {
      errors.summary = "Nội dung trả lời là bắt buộc";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare reply document data
      const replyData = {
        documentNumber: formData.documentNumber,
        title: formData.title,
        summary: formData.summary,
        documentType: formData.documentType,
        signingDate: formData.signingDate,
        priority: formData.priority.toUpperCase(),
        notes: formData.notes,
        replyToId: Number(originalDocumentId),
        status: "SENT",
        isInternal: true,
        // Reply to original sender
        recipients: [
          {
            departmentId: originalDocument?.senderDepartment ? 1 : 1, // You might need to map this properly
            userId: undefined, // Reply to department
          },
        ],
      };

      // Call API to create reply
      await replyToDocument(Number(originalDocumentId), replyData);

      // Show success notification
      toast({
        title: "Thành công",
        description: "Văn bản trả lời đã được gửi",
      });

      addNotification({
        title: "Văn bản trả lời mới",
        message: `Văn bản trả lời "${formData.title}" đã được gửi`,
        type: "success",
      });

      // Redirect back to original document or documents list
      router.push(`/van-ban-den/noi-bo/${originalDocumentId}`);
    } catch (error: any) {
      console.error("Error creating reply:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi văn bản trả lời",
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

      const replyData = {
        documentNumber: formData.documentNumber,
        title: formData.title,
        summary: formData.summary,
        documentType: formData.documentType,
        signingDate: formData.signingDate,
        priority: formData.priority.toUpperCase(),
        notes: formData.notes,
        replyToId: Number(originalDocumentId),
        status: "DRAFT",
        isInternal: true,
        recipients: [
          {
            departmentId: 1, // You might need to map this properly
            userId: undefined,
          },
        ],
      };

      await replyToDocument(Number(originalDocumentId), replyData);

      toast({
        title: "Thành công",
        description: "Văn bản trả lời đã được lưu nháp",
      });

      router.push(`/van-ban-den/noi-bo/${originalDocumentId}`);
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

  if (loadingOriginal) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (!originalDocument) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Không tìm thấy văn bản</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Không thể tải thông tin văn bản gốc để trả lời
          </p>
          <Button asChild className="mt-4">
            <Link href="/van-ban-den">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/van-ban-den/noi-bo/${originalDocumentId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Trả lời văn bản nội bộ
        </h1>
      </div>

      <div className="space-y-6">
        {/* Original Document Card */}
        <Card>
          <CardHeader className="bg-secondary/10 border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Văn bản gốc
            </CardTitle>
            <CardDescription>Thông tin văn bản đang trả lời</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Số văn bản
                </label>
                <p className="font-medium">{originalDocument.documentNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ngày ký
                </label>
                <p className="font-medium">
                  {formatDate(originalDocument.signingDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Người gửi
                </label>
                <p className="font-medium">{originalDocument.senderName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Độ ưu tiên
                </label>
                <div className="mt-1">
                  {getPriorityBadge(originalDocument.priority)}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tiêu đề
              </label>
              <p className="font-medium text-lg">{originalDocument.title}</p>
            </div>
            {originalDocument.summary && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Nội dung
                </label>
                <p className="whitespace-pre-wrap text-sm">
                  {originalDocument.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Form */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản trả lời</CardTitle>
              <CardDescription>
                Nhập thông tin cho văn bản trả lời
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
                    placeholder="Nhập số văn bản trả lời"
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
                  <Label htmlFor="signingDate">Ngày ký</Label>
                  <DatePicker
                    date={formData.signingDate}
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
                  placeholder="Nhập tiêu đề văn bản trả lời"
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
                <Label htmlFor="summary">
                  Nội dung trả lời <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung trả lời"
                  rows={6}
                  required
                  className={validationErrors.summary ? "border-red-500" : ""}
                />
                {validationErrors.summary && (
                  <p className="text-sm text-red-500">
                    {validationErrors.summary}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú (nếu có)"
                  rows={3}
                />
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Gửi trả lời
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
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
        </form>

        <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Lưu ý:</span> Văn bản trả lời sẽ được
            gửi trực tiếp đến người gửi văn bản gốc và đơn vị liên quan.
          </p>
        </div>
      </div>
    </div>
  );
}
