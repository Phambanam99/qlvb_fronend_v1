"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  FileText,
  Send,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Reply,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  OutgoingDocumentDTO,
  outgoingDocumentsAPI,
  workflowAPI,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function OutgoingDocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const documentId = Number.parseInt(id);
  const { user, hasRole } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const router = useRouter();

  const [_document, setDocument] = useState<OutgoingDocumentDTO>();
  const [relatedDocuments, setRelatedDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        // Fetch document details
        const response = await outgoingDocumentsAPI.getOutgoingDocumentById(
          documentId
        );
        setDocument(response.data);

        // Nếu có văn bản liên quan (văn bản đến được trả lời)
        if (response.data.relatedDocuments) {
          try {
            const relatedIds = response.data.relatedDocuments
              .split(",")
              .map((id) => parseInt(id.trim()));
            const relatedDocsPromises = relatedIds.map((id) =>
              fetch(`/api/incoming-documents/${id}`).then((res) => res.json())
            );
            const relatedDocsData = await Promise.all(relatedDocsPromises);
            setRelatedDocuments(relatedDocsData);
          } catch (error) {
            console.error("Error fetching related documents:", error);
          }
        }

        // Fetch document workflow history
        const history = await workflowAPI.getDocumentHistory(documentId);

        // Cập nhật document với history
        setDocument((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            history: history,
          };
        });

        setError(null);
      } catch (err: any) {
        console.error("Error fetching document:", err);
        setError(err.message || "Không thể tải thông tin văn bản");
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin văn bản",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="border-gray-400 bg-gray-50 text-gray-700"
          >
            Bản nháp
          </Badge>
        );
      case "pending_approval":
        return (
          <Badge
            variant="outline"
            className="border-amber-500 bg-amber-50 text-amber-700"
          >
            Chờ phê duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Đã phê duyệt
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="success" className="bg-green-50 text-green-700">
            Đã gửi
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const handleDownloadAttachment = async () => {
    if (
      !_document ||
      !_document.attachments ||
      _document.attachments.length === 0
    ) {
      toast({
        title: "Thông báo",
        description: "Không có tệp đính kèm để tải xuống",
        variant: "default",
      });
      return;
    }

    try {
      const blob = await outgoingDocumentsAPI.downloadAttachmentDocument(documentId);
      console.log("Blob:", blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = _document.attachments[0].name || "document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Thành công",
        description: "Đang tải tệp xuống",
      });
    } catch (error) {
      console.error("Lỗi khi tải tệp đính kèm:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tệp đính kèm. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await outgoingDocumentsAPI.approveOutgoingDocument(documentId, {
        comment: approvalComment,
      });

      addNotification({
        title: "Văn bản đã được phê duyệt",
        message: "Văn bản đã được phê duyệt và chuyển cho văn thư để ban hành.",
        type: "success",
      });

      // Refresh document data
      const response = await outgoingDocumentsAPI.getOutgoingDocumentById(
        documentId
      );
      setDocument(response.data);

      toast({
        title: "Thành công",
        description: "Văn bản đã được phê duyệt thành công",
      });
    } catch (err: any) {
      console.error("Error approving document:", err);
      toast({
        title: "Lỗi",
        description: err.message || "Không thể phê duyệt văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionComment) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng nhập lý do từ chối",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await outgoingDocumentsAPI.rejectOutgoingDocument(documentId, {
        comment: rejectionComment,
      });

      addNotification({
        title: "Văn bản đã bị từ chối",
        message:
          "Văn bản đã bị từ chối và trả lại người soạn thảo để chỉnh sửa.",
        type: "warning",
      });

      // Refresh document data
      const response = await outgoingDocumentsAPI.getOutgoingDocumentById(
        documentId
      );
      setDocument(response.data);

      toast({
        title: "Thành công",
        description: "Văn bản đã được từ chối và trả lại người soạn thảo",
      });
    } catch (err: any) {
      console.error("Error rejecting document:", err);
      toast({
        title: "Lỗi",
        description: err.message || "Không thể từ chối văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị các nút hành động dựa trên vai trò người dùng và trạng thái văn bản
  const renderActionButtons = () => {
    if (!user || !_document) return null;

    // Nếu là người soạn thảo và văn bản đang ở trạng thái nháp
    if (hasRole(["ROLE_DRAF", "ROLE_TRO_LY"]) && _document.status === "draft") {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
            asChild
          >
            <Link href={`/van-ban-di/${_document.id}/chinh-sua`}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={async () => {
              try {
                setIsSubmitting(true);
                await outgoingDocumentsAPI.submitForApproval(_document.id);

                // Refresh document data
                const response =
                  await outgoingDocumentsAPI.getOutgoingDocumentById(
                    documentId
                  );
                setDocument(response.data);

                toast({
                  title: "Thành công",
                  description: "Văn bản đã được gửi phê duyệt",
                });
              } catch (err: any) {
                toast({
                  title: "Lỗi",
                  description:
                    err.message || "Không thể gửi văn bản để phê duyệt",
                  variant: "destructive",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Đang gửi..." : "Gửi phê duyệt"}
          </Button>
        </>
      );
    }

    // Nếu là trưởng phòng và văn bản đang chờ phê duyệt
    if (
      hasRole(["ROLE_TRUONG_PHONG", "ROLE_PHO_PHONG"]) &&
      _document.status === "pending_approval"
    ) {
      return (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Từ chối
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Từ chối văn bản</AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng nhập lý do từ chối để người soạn thảo có thể chỉnh
                  sửa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Phê duyệt
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Phê duyệt văn bản</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có thể thêm ý kiến trước khi phê duyệt văn bản này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập ý kiến (không bắt buộc)..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận phê duyệt"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }

    // Nếu là thủ trưởng và văn bản đang chờ phê duyệt
    if (
      hasRole(["ROLE_CUC_TRUONG", "ROLE_CUC_PHO"]) &&
      _document.status === "pending_approval"
    ) {
      return (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Từ chối
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Từ chối văn bản</AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng nhập lý do từ chối để người soạn thảo có thể chỉnh
                  sửa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Phê duyệt và ban hành
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Phê duyệt và ban hành văn bản
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Sau khi phê duyệt, văn bản sẽ được chuyển cho văn thư để ban
                  hành chính thức.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nhập ý kiến (không bắt buộc)..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận phê duyệt"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }

    // Nếu là văn thư và văn bản đã được phê duyệt
    if (hasRole("ROLE_VAN_THU") && _document.status === "approved") {
      return (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90"
          onClick={async () => {
            try {
              setIsSubmitting(true);
              await outgoingDocumentsAPI.issueDocument(_document.id);

              // Refresh document data
              const response =
                await outgoingDocumentsAPI.getOutgoingDocumentById(documentId);
              setDocument(response.data);

              toast({
                title: "Thành công",
                description: "Văn bản đã được ban hành thành công",
              });
            } catch (err: any) {
              toast({
                title: "Lỗi",
                description: err.message || "Không thể ban hành văn bản",
                variant: "destructive",
              });
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Đang xử lý..." : "Ban hành văn bản"}
        </Button>
      );
    }

    // Mặc định hiển thị nút tải xuống
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-primary/20 hover:bg-primary/10 hover:text-primary"
        onClick={handleDownloadAttachment}
      >
        <Download className="mr-2 h-4 w-4" />
        Tải xuống
      </Button>
    );
  };

  if (isLoading) {
    return <DocumentDetailSkeleton />;
  }

  if (error || !_document) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-red-500 mb-4">{error || "Không tìm thấy văn bản"}</p>
        <Button asChild>
          <Link href="/van-ban-di">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="border-primary/20 hover:bg-primary/10"
            asChild
          >
            <Link href="/van-ban-di">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Chi tiết văn bản đi
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {renderActionButtons()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {_document.documentNumber || _document.number}
                </CardTitle>
                {getStatusBadge(_document.status)}
              </div>
              <CardDescription>{_document.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày ban hành
                  </p>
                  <p>
                    {_document.sentDate || _document.signingDate
                      ? new Date(
                          _document.sentDate || _document.signingDate
                        ).toLocaleDateString("vi-VN")
                      : "Chưa ban hành"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nơi nhận
                  </p>
                  <p>
                    {_document.recipient || _document.receivingDepartmentText}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Người soạn thảo
                  </p>
                  <p>
                    {_document.creator?.name ||
                      _document.creatorName ||
                      "Không xác định"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Người ký
                  </p>
                  <p>
                    {_document.approver?.name ||
                      _document.signerName ||
                      "Chưa phê duyệt"}
                  </p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Nội dung văn bản
                </p>
                <div className="rounded-md border p-4 bg-accent/30 whitespace-pre-line">
                  {_document.content || _document.summary}
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Tệp đính kèm
                </p>
                <div className="space-y-2">
                  {_document.attachments && _document.attachments.length > 0 ? (
                    _document.attachments.map((file: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-primary/10 p-2 bg-accent/30"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">
                            {file.name || file.filename}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {file.size
                              ? `${Math.round(file.size / 1024)} KB`
                              : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={handleDownloadAttachment}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : _document.attachmentPath || _document.attachmentFilename ? (
                    <div className="flex items-center justify-between rounded-md border border-primary/10 p-2 bg-accent/30">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {_document.attachmentFilename?.split("/").pop() ||
                            _document.attachmentPath?.split("/").pop() ||
                            "Tệp đính kèm"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={handleDownloadAttachment}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có tệp đính kèm
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history">
            <TabsList className="grid w-full grid-cols-1 bg-primary/5">
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Lịch sử xử lý
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="pt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-6">
                      {_document.history && _document.history.length > 0 ? (
                        _document.history.map((item: any, index: number) => (
                          <div key={index} className="relative pl-8">
                            <div className="absolute left-0 top-2 h-6 w-6 rounded-full border bg-background flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{item.action}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleString(
                                    "vi-VN"
                                  )}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.actor || item.userFullName}
                              </p>
                              <p className="text-sm">
                                {item.description || item.comments}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Chưa có lịch sử xử lý
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin xử lý</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trạng thái
                </p>
                <div className="mt-1">{getStatusBadge(_document.status)}</div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Người soạn thảo
                </p>
                <div className="mt-1">
                  <p>
                    {_document.creator?.name ||
                      _document.creatorName ||
                      "Không xác định"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {_document.creator?.position ||
                      _document.creatorPosition ||
                      "Không xác định"}{" "}
                    -{" "}
                    {_document.creator?.department ||
                      _document.creatorDepartment ||
                      "Không xác định"}
                  </p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Người phê duyệt
                </p>
                <div className="mt-1">
                  <p>
                    {_document.approver?.name ||
                      _document.signerName ||
                      "Chưa phê duyệt"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {_document.approver?.position ||
                      _document.signerPosition ||
                      ""}
                  </p>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="mt-1">
                  {_document.createdAt
                    ? new Date(_document.createdAt).toLocaleDateString("vi-VN")
                    : "Không xác định"}
                </p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày gửi phê duyệt
                </p>
                <p className="mt-1">
                  {_document.submittedAt
                    ? new Date(_document.submittedAt).toLocaleDateString("vi-VN")
                    : "Chưa gửi phê duyệt"}
                </p>
              </div>
            </CardContent>
            {hasRole(["ROLE_TRO_LY", "ROLE_NHAN_VIEN"]) &&
              _document.status === "draft" && (
                <CardFooter className="bg-accent/30 border-t border-primary/10">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        await outgoingDocumentsAPI.deleteOutgoingDocument(
                          _document.id
                        );

                        toast({
                          title: "Thành công",
                          description: "Văn bản đã được xóa thành công",
                        });

                        // Redirect to list page
                        router.push("/van-ban-di");
                      } catch (err: any) {
                        toast({
                          title: "Lỗi",
                          description: err.message || "Không thể xóa văn bản",
                          variant: "destructive",
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <Trash className="mr-2 h-4 w-4" />{" "}
                    {isSubmitting ? "Đang xử lý..." : "Xóa văn bản"}
                  </Button>
                </CardFooter>
              )}
          </Card>

          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Văn bản liên quan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {relatedDocuments && relatedDocuments.length > 0 ? (
                  relatedDocuments.map((relatedDoc: any) => (
                    <div
                      key={relatedDoc.id}
                      className="rounded-md border border-primary/10 p-3 bg-accent/30"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium text-primary">
                          {relatedDoc.documentNumber}
                        </p>
                        <Badge
                          variant="outline"
                          className="border-blue-400 bg-blue-50 text-blue-700"
                        >
                          Văn bản đến
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {relatedDoc.title}
                      </p>
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                          asChild
                        >
                          <Link href={`/van-ban-den/${relatedDoc.id}`}>
                            Xem
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Không có văn bản liên quan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DocumentDetailSkeleton() {
  // Skeleton component code remains unchanged
}
