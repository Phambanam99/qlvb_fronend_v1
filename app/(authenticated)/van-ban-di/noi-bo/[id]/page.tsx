"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Download,
  Users,
  Calendar,
  User,
  Building,
  Clock,
  MessageSquare,
  Paperclip,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  getDocumentById,
  downloadAttachment,
} from "@/lib/api/internalDocumentApi";
import { useDocumentReadStatus } from "@/hooks/use-document-read-status";
import { downloadPdfWithWatermark, isPdfFile } from "@/lib/utils/pdf-watermark";

interface InternalDocumentDetail {
  id: number;
  documentNumber: string;
  title: string;
  summary: string;
  documentType: string;
  signingDate: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  notes?: string;
  status: "DRAFT" | "SENT" | "APPROVED";
  isInternal: boolean | null;
  senderId: number;
  senderName: string;
  senderDepartment: string;
  recipients: {
    id: number;
    departmentId: number;
    departmentName: string;
    userId?: number;
    userName?: string;
    isRead: boolean;
    readAt?: string;
    receivedAt: string;
    notes?: string;
  }[];
  attachments: {
    id: number;
    filename: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
    uploadedByName?: string;
    description?: string;
  }[];
  replyToId?: number;
  replyToTitle?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readAt?: string;
}

export default function InternalDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { markAsRead: globalMarkAsRead } = useDocumentReadStatus();
  const [_document, setDocument] = useState<InternalDocumentDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const documentId = params.id as string;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await getDocumentById(Number(documentId));
        setDocument(response);

        if (response && response.isRead) {
          globalMarkAsRead(Number(documentId));
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin văn bản. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId, toast, globalMarkAsRead]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return dateString || "-";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: "outline" as const, text: "Bản nháp" },
      SENT: { variant: "default" as const, text: "Đã gửi" },
      APPROVED: { variant: "secondary" as const, text: "Đã phê duyệt" },
    };
    const info = variants[status as keyof typeof variants] || variants.DRAFT;
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      NORMAL: { variant: "outline" as const, text: "Bình thường" },
      HIGH: { variant: "secondary" as const, text: "Cao" },
      URGENT: { variant: "destructive" as const, text: "Khẩn" },
    };
    const info = variants[priority as keyof typeof variants] || variants.NORMAL;
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const handleDownloadAttachment = async (
    attachmentId: number,
    filename: string,
    contentType?: string
  ) => {
    try {
      const response = await downloadAttachment(
        Number(documentId),
        attachmentId
      );

      const pdfBlob = response.data;

      if (isPdfFile(filename, contentType) && user?.fullName) {
        try {
          await downloadPdfWithWatermark(pdfBlob, filename, user.fullName);

          toast({
            title: "Thành công",
            description: `Đã tải xuống file PDF với watermark: ${filename}`,
          });
          return;
        } catch (watermarkError) {
          console.error(
            "Error adding watermark, falling back to normal download:",
            watermarkError
          );
          toast({
            title: "Cảnh báo",
            description: "Không thể thêm watermark, tải xuống file gốc",
            variant: "destructive",
          });
        }
      }

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: `Đã tải xuống file ${filename}`,
      });
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống file. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (!_document) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Không tìm thấy văn bản</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Văn bản nội bộ không tồn tại hoặc đã bị xóa
          </p>
          <Button asChild className="mt-4">
            <Link href="/van-ban-di">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-di">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Chi tiết văn bản nội bộ
          </h1>
          <p className="text-muted-foreground">
            Thông tin chi tiết của văn bản {_document.documentNumber}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin văn bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Số văn bản
                  </label>
                  <p className="font-medium">{_document.documentNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Loại văn bản
                  </label>
                  <p className="font-medium">{_document.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày ký
                  </label>
                  <p className="font-medium">
                    {formatDate(_document.signingDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Độ ưu tiên
                  </label>
                  <div className="mt-1">
                    {getPriorityBadge(_document.priority)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tiêu đề
                </label>
                <p className="font-medium text-lg">{_document.title}</p>
              </div>

              {_document.summary && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tóm tắt nội dung
                  </label>
                  <p
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: _document.summary }}
                  ></p>
                </div>
              )}

              {_document.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ghi chú
                  </label>
                  <p className="whitespace-pre-wrap">{_document.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Danh sách người nhận ({_document.recipients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Người nhận</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian nhận</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {_document.recipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">
                        {recipient.departmentName}
                      </TableCell>
                      <TableCell>
                        {recipient.userName || "Toàn bộ đơn vị"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={recipient.isRead ? "default" : "outline"}
                        >
                          {recipient.isRead ? "Đã đọc" : "Chưa đọc"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(recipient.receivedAt)}
                        {recipient.readAt && (
                          <div className="text-sm text-muted-foreground">
                            Đọc: {formatDate(recipient.readAt)}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Attachments */}
          {_document.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  File đính kèm ({_document.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {_document.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{attachment.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(attachment.fileSize)} •{" "}
                            {attachment.contentType}
                          </p>
                          {attachment.description && (
                            <p className="text-sm text-muted-foreground">
                              {attachment.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadAttachment(
                            attachment.id,
                            attachment.filename,
                            attachment.contentType
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trạng thái & Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Trạng thái hiện tại
                </label>
                <div className="mt-1">{getStatusBadge(_document.status)}</div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Người gửi</p>
                    <p className="text-sm text-muted-foreground">
                      {_document.senderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Đơn vị gửi</p>
                    <p className="text-sm text-muted-foreground">
                      {_document.senderDepartment}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Thời gian tạo</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(_document.createdAt)}
                    </p>
                  </div>
                </div>

                {_document.updatedAt !== _document.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Cập nhật cuối</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(_document.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {_document.replyCount > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Số phản hồi</p>
                      <p className="text-sm text-muted-foreground">
                        {_document.replyCount} phản hồi
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Đánh dấu đã đọc
              </Button>

              {_document.replyToId && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/van-ban-di/noi-bo/${_document.replyToId}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Xem văn bản gốc
                  </Link>
                </Button>
              )}

              <Button className="w-full" variant="outline" asChild>
                <Link href={`/van-ban-di/noi-bo/${_document.id}/reply`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Trả lời văn bản
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
