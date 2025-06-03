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
  Send,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import {
  getDocumentById,
  downloadAttachment,
  markDocumentAsRead,
  getInternalDocumentHistory,
  getDocumentStats,
  getDocumentReplies,
} from "@/lib/api/internalDocumentApi";

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

interface DocumentHistory {
  id: number;
  action: string;
  details: string;
  performedBy: {
    id: number;
    name: string;
    fullName: string;
  };
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DocumentStats {
  replyCount: number;
  historyCount: number;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  lastActivity: string;
}

export default function InternalDocumentReceivedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [documentDetail, setDocumentDetail] =
    useState<InternalDocumentDetail | null>(null);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistory[]>([]);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(
    null
  );
  const [documentReplies, setDocumentReplies] = useState<
    InternalDocumentDetail[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const documentId = params.id as string;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await getDocumentById(Number(documentId));
        console.log("Debug document:", response);
        console.log("Debug attachments:", response?.attachments);

        // Đảm bảo attachments luôn là mảng
        if (response) {
          const documentWithAttachments = {
            ...response,
            attachments: response.attachments || [],
          };
          setDocumentDetail(documentWithAttachments);
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
  }, [documentId, toast]);

  useEffect(() => {
    const fetchHistoryAndStats = async () => {
      if (!documentId || !documentDetail) return;

      try {
        // Fetch history
        setLoadingHistory(true);
        const historyResponse = await getInternalDocumentHistory(
          Number(documentId)
        );
        console.log("Debug history:", historyResponse);
        setDocumentHistory(historyResponse || []);

        // Fetch stats
        setLoadingStats(true);
        const statsResponse = await getDocumentStats(Number(documentId));
        setDocumentStats(statsResponse);

        // Fetch replies
        const repliesResponse = await getDocumentReplies(Number(documentId));
        setDocumentReplies(repliesResponse || []);
      } catch (error) {
        console.error("Error fetching document history/stats:", error);
        // Fallback to empty data if API not available
        setDocumentHistory([]);
        setDocumentStats(null);
        setDocumentReplies([]);
      } finally {
        setLoadingHistory(false);
        setLoadingStats(false);
      }
    };

    fetchHistoryAndStats();
  }, [documentId, documentDetail]);

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
    const info = variants[status as keyof typeof variants] || variants.SENT;
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
    filename: string
  ) => {
    try {
      const response = await downloadAttachment(
        Number(documentId),
        attachmentId
      );

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
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

  const handleMarkAsRead = async () => {
    if (!documentDetail) return;

    try {
      setMarkingAsRead(true);
      await markDocumentAsRead(documentDetail.id);
      setDocumentDetail({
        ...documentDetail,
        isRead: true,
        readAt: new Date().toISOString(),
      });
      toast({
        title: "Thành công",
        description: "Đã đánh dấu văn bản là đã đọc",
      });
    } catch (error) {
      console.error("Error marking as read:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu văn bản đã đọc. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setMarkingAsRead(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATED":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "READ":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "REPLIED":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "SENT":
        return <Send className="h-4 w-4 text-green-500" />;
      case "UPDATED":
        return <Edit className="h-4 w-4 text-orange-500" />;
      case "ATTACHMENT_ADDED":
        return <Paperclip className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionDisplayName = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATED":
        return "Tạo văn bản";
      case "READ":
        return "Đọc văn bản";
      case "REPLIED":
        return "Trả lời văn bản";
      case "SENT":
        return "Gửi văn bản";
      case "UPDATED":
        return "Cập nhật văn bản";
      case "ATTACHMENT_ADDED":
        return "Thêm file đính kèm";
      case "ATTACHMENT_REMOVED":
        return "Xóa file đính kèm";
      case "FORWARDED":
        return "Chuyển tiếp văn bản";
      default:
        return action;
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

  if (!documentDetail) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Không tìm thấy văn bản</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Văn bản nội bộ không tồn tại hoặc đã bị xóa
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
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-den">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Chi tiết văn bản nội bộ nhận được
          </h1>
          <p className="text-muted-foreground">
            Thông tin chi tiết của văn bản {documentDetail.documentNumber}
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
                  <p className="font-medium">{documentDetail.documentNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Loại văn bản
                  </label>
                  <p className="font-medium">{documentDetail.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày ký
                  </label>
                  <p className="font-medium">
                    {formatDate(documentDetail.signingDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Độ ưu tiên
                  </label>
                  <div className="mt-1">
                    {getPriorityBadge(documentDetail.priority)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tiêu đề
                </label>
                <p className="font-medium text-lg">{documentDetail.title}</p>
              </div>

              {documentDetail.summary && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tóm tắt nội dung
                  </label>
                  <p className="whitespace-pre-wrap" 
                  dangerouslySetInnerHTML={{ __html: documentDetail.summary }} >
                   
                  </p>
                </div>
              )}

              {documentDetail.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ghi chú
                  </label>
                  <p className="whitespace-pre-wrap">{documentDetail.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients Table */}
          {documentDetail.recipients &&
            documentDetail.recipients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Danh sách người nhận ({documentDetail.recipients.length})
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
                        <TableHead>Thời gian đọc</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentDetail.recipients.map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell className="font-medium">
                            {recipient.departmentName}
                          </TableCell>
                          <TableCell>
                            {recipient.userName || "Toàn đơn vị"}
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
                          </TableCell>
                          <TableCell>
                            {recipient.readAt
                              ? formatDate(recipient.readAt)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

          {/* Interaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lịch sử tương tác
                {documentStats && (
                  <Badge variant="outline" className="ml-2">
                    {documentStats.historyCount} hoạt động
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Theo dõi các hoạt động và tương tác với văn bản
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Đang tải lịch sử...
                  </span>
                </div>
              ) : documentHistory.length > 0 ? (
                <div className="space-y-4">
                  {documentHistory.map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className="flex items-start space-x-3 border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {getActionDisplayName(entry.action)}
                          </p>
                          <time className="text-sm text-gray-500">
                            {formatDate(entry.performedAt)}
                          </time>
                        </div>
                        <p className="text-sm text-gray-500">
                          Bởi:{" "}
                          {entry.performedBy?.fullName ||
                            entry.performedBy?.name ||
                            "Hệ thống"}
                        </p>
                        {entry.details && (
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có lịch sử tương tác nào</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Replies */}
          {documentReplies && documentReplies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Văn bản trả lời ({documentReplies.length})
                </CardTitle>
                <CardDescription>
                  Danh sách các văn bản trả lời cho văn bản này
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm">
                              {reply.documentNumber}
                            </h4>
                            {getPriorityBadge(reply.priority)}
                            {getStatusBadge(reply.status)}
                          </div>
                          <h5 className="font-semibold text-base mb-2">
                            {reply.title}
                          </h5>
                          {reply.summary && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: reply.summary }}
                            >
                              
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              <User className="h-3 w-3 inline mr-1" />
                              {reply.senderName}
                            </span>
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/van-ban-den/noi-bo/${reply.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                File đính kèm ({documentDetail.attachments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentDetail.attachments &&
              documentDetail.attachments.length > 0 ? (
                <div className="space-y-3">
                  {documentDetail.attachments.map((attachment) => (
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
                            attachment.filename
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Văn bản này không có file đính kèm
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  Trạng thái đọc
                </label>
                <div className="mt-1">
                  <Badge
                    variant={documentDetail.isRead ? "default" : "outline"}
                  >
                    {documentDetail.isRead ? "Đã đọc" : "Chưa đọc"}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Trạng thái văn bản
                </label>
                <div className="mt-1">
                  {getStatusBadge(documentDetail.status)}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Người gửi</p>
                    <p className="text-sm text-muted-foreground">
                      {documentDetail.senderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Đơn vị gửi</p>
                    <p className="text-sm text-muted-foreground">
                      {documentDetail.senderDepartment}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Thời gian nhận</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(documentDetail.createdAt)}
                    </p>
                  </div>
                </div>

                {(documentDetail.readAt || documentStats?.readAt) && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Thời gian đọc</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          documentDetail.readAt || documentStats?.readAt || ""
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {documentStats && documentStats.replyCount > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Số phản hồi</p>
                      <p className="text-sm text-muted-foreground">
                        {documentStats.replyCount} phản hồi
                      </p>
                    </div>
                  </div>
                )}

                {documentStats && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hoạt động cuối</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(documentStats.lastActivity)}
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
              {!documentDetail.isRead && (
                <Button
                  className="w-full"
                  onClick={handleMarkAsRead}
                  disabled={markingAsRead}
                >
                  {markingAsRead ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Đánh dấu đã đọc
                    </>
                  )}
                </Button>
              )}

              {documentDetail.replyToId && (
                <Button className="w-full" variant="outline" asChild>
                  <Link
                    href={`/van-ban-den/noi-bo/${documentDetail.replyToId}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Xem văn bản gốc
                  </Link>
                </Button>
              )}

              <Button className="w-full" variant="outline" asChild>
                <Link href={`/van-ban-den/noi-bo/${documentDetail.id}/reply`}>
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
