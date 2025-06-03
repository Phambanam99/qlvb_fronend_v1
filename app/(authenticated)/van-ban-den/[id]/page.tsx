"use client";

import { useEffect, useState } from "react";
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
import { ArrowLeft, Download, FileText, Send, UserCheck } from "lucide-react";
import Link from "next/link";
import DocumentResponseForm from "@/components/document-response-form";
import DocumentResponseList from "@/components/document-response-list";
import DocumentProcessingHistory from "@/components/document-processing-history";
import {
  getStatusByCode,
  incomingDocumentsAPI,
} from "@/lib/api/incomingDocuments";
import { getStatusBadgeInfo } from "@/lib/utils";
import { workflowAPI } from "@/lib/api/workflow";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentDTO } from "@/lib/api";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { downloadPdfWithWatermark, isPdfFile } from "@/lib/utils/pdf-watermark";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  // Resolve params Promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const documentId = resolvedParams ? Number.parseInt(resolvedParams.id) : null;
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [_document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State để theo dõi trạng thái loading khi chuyển trang
  const [isNavigating, setIsNavigating] = useState(false);
  // fetch all departments with document id using useEffect

  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!documentId) return;

      try {
        const response = await incomingDocumentsAPI.getAllDepartments(
          documentId
        );
        setDepartments(response);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn vị",
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, [documentId, toast]);

  // State để theo dõi trạng thái loading của nhiều loại dữ liệu
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Tracking overall loading status
  useEffect(() => {
    // Chỉ đặt isLoading = false khi tất cả dữ liệu đã tải xong
    setIsLoading(
      isDocumentLoading || isWorkflowLoading || isHistoryLoading || !user
    );
  }, [isDocumentLoading, isWorkflowLoading, isHistoryLoading, user]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId || !user) {
        return; // Tránh gọi API khi không có ID hoặc user
      }

      try {
        console.log("Bắt đầu tải dữ liệu văn bản:", {
          documentId,
          timestamp: new Date().toISOString(),
          user: user?.fullName,
        });

        // Bắt đầu tải document
        setIsDocumentLoading(true);
        setIsWorkflowLoading(true);
        setIsHistoryLoading(true);

        // Fetch document details
        const response = await incomingDocumentsAPI.getIncomingDocumentById(
          documentId
        );
        console.log("1. Tải văn bản thành công:", response);
        setIsDocumentLoading(false);

        // Fetch document workflow status
        const workflowStatus = await workflowAPI.getDocumentStatus(documentId);
        console.log("2. Tải workflow status thành công:", workflowStatus);
        setIsWorkflowLoading(false);

        // Fetch document history
        const history = await workflowAPI.getDocumentHistory(documentId);
        console.log("3. Tải history thành công:", history);
        setIsHistoryLoading(false);

        // Combine data
        const documentData = {
          ...response.data,
          status: workflowStatus.status,
          assignedToId: workflowStatus.assignedToId,
          assignedToName: workflowStatus.assignedToName,
          history: history,
          assignedToIds: workflowStatus.assignedToIds,
          assignedToNames: workflowStatus.assignedToNames,

          // Add empty arrays for frontend compatibility
          attachments: [],
          relatedDocuments: [],
          responses: [],
        };
        console.log(
          "✅ Tất cả dữ liệu đã tải xong, bắt đầu render",
          documentData
        );
        setDocument(documentData);
        setError(null);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải dữ liệu văn bản:", err);
        setError(err.message || "Không thể tải thông tin văn bản");
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin văn bản",
          variant: "destructive",
        });
      } finally {
        // Đảm bảo tất cả loại dữ liệu đều được đánh dấu là đã hoàn thành,
        // tránh kẹt ở trạng thái loading vĩnh viễn
        setIsDocumentLoading(false);
        setIsWorkflowLoading(false);
        setIsHistoryLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, toast, user]);

  const getStatusBadge = (status: string, displayName?: string) => {
    const badgeInfo = getStatusBadgeInfo(status, displayName);
    return <Badge variant={badgeInfo.variant}>{badgeInfo.text}</Badge>;
  };

  const handleDownloadAttachment = async () => {
    if (!_document.attachmentFilename) {
      toast({
        title: "Lỗi",
        description: "Không có tệp đính kèm để tải",
        variant: "destructive",
      });
      return;
    }

    if (!documentId) {
      toast({
        title: "Lỗi",
        description: "Không xác định được ID văn bản",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await incomingDocumentsAPI.downloadIncomingAttachment(
        documentId
      );

      const filename =
        _document.attachmentFilename.split("/").pop() || "document.pdf";

      // Kiểm tra nếu là file PDF và có thông tin người dùng thì thêm watermark
      if (isPdfFile(filename) && user?.fullName) {
        try {
          await downloadPdfWithWatermark(blob, filename, user.fullName);

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

      // Tải xuống bình thường cho non-PDF hoặc khi watermark thất bại
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

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

  const handleResponse = async () => {
    if (!_document || !user || !documentId) return;

    try {
      // First, check if there's an existing draft related to this document that was rejected
      const existingDraftsResponse = await workflowAPI.getDocumentResponses(
        documentId.toString()
      );
      console.log("Checking for existing drafts:", existingDraftsResponse);

      // Look for a draft that was rejected (has status "draft" and was previously rejected in history)
      const existingDraft = existingDraftsResponse?.content?.find(
        (doc: any) =>
          doc.status === "registered" &&
          doc.history?.some(
            (item: any) =>
              item.description?.toLowerCase().includes("từ chối") ||
              item.comments?.toLowerCase().includes("từ chối") ||
              item.newStatus === "leader_commented"
          )
      );

      const documentStatus = _document.processingStatus;
      const isAssignedToCurrentUser = _document.assignedToIds?.includes(
        user.id
      );

      // Original flow continues for case with no existing rejected draft
      if (
        (documentStatus === "specialist_processing" ||
          documentStatus === "leader_reviewing") &&
        isAssignedToCurrentUser
      ) {
        router.push(`/van-ban-di/${_document.id}/chinh-sua`);
        return;
      }

      setIsLoading(true);
      await workflowAPI.startProcessingDocument(documentId, {
        documentId: documentId,
        status: "SPECIALIST_PROCESSING",
        statusDisplayName: "Chuyên viên đang xử lý",
        assignedToId: Number(user.id),
        comments: "Bắt đầu xử lý văn bản",
      });

      toast({
        title: "Thành công",
        description: "Đã bắt đầu xử lý văn bản",
      });

      router.push(`/van-ban-di/them-moi?replyToId=${_document.id}`);
    } catch (error) {
      console.error("Lỗi khi bắt đầu xử lý văn bản:", error);
      toast({
        title: "Lỗi",
        description: "Không thể bắt đầu xử lý văn bản. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const hasDepartmentAccess =
    hasRole("ROLE_TRUONG_PHONG") ||
    hasRole("ROLE_PHO_PHONG") ||
    hasRole("ROLE_TRUONG_BAN") ||
    hasRole("ROLE_PHO_BAN") ||
    hasRole("ROLE_CUM_TRUONG") ||
    hasRole("ROLE_PHO_CUM_TRUONG") ||
    hasRole("ROLE_CHINH_TRI_VIEN_CUM") ||
    hasRole("ROLE_PHO_TRAM_TRUONG") ||
    hasRole("ROLE_TRAM_TRUONG");
  const renderActionButtons = () => {
    if (!user || !_document) return null;

    const isPendingProcessing = ["PENDING", "registered"].includes(
      _document.processingStatus
    );

    // Kiểm tra xem phòng ban hiện tại có được gán cho văn bản này không
    const currentDeptId = Number(user?.departmentId);
    const isCurrentDepartmentAssigned =
      Array.isArray(departments) &&
      departments.some((dept) => dept.id === currentDeptId);

    // Kiểm tra văn bản có được chuyển từ đơn vị con lên không
    const isForwardedFromChildDept =
      _document.sourceDepartmentId &&
      _document.processingStatus === "parent_dept_review";

    // Kiểm tra trạng thái văn bản và thông tin phân công
    console.log("Document assignment info:", {
      document: _document,
      user: user,
      departments: departments,
      currentDeptId: currentDeptId,
      isCurrentDepartmentAssigned: isCurrentDepartmentAssigned,
      isForwardedFromChildDept: isForwardedFromChildDept,
    });

    // Sử dụng tiếp cận đơn giản hơn: tạo key riêng để theo dõi xem phòng đã phân công chưa
    const processKey = `document_${_document.id}_dept_${currentDeptId}_assigned`;

    // Kiểm tra trong localStorage xem phòng đã phân công cho văn bản này chưa
    const isDeptAssigned =
      typeof window !== "undefined"
        ? localStorage.getItem(processKey) === "true"
        : false;

    // Lưu thông tin phân công vào localStorage khi user đi đến trang phân công
    const markDeptAsAssigned = () => {
      if (typeof window !== "undefined") {
        localStorage.setItem(processKey, "true");
      }
    };

    // Phòng ban hiện tại có thể phân công nếu được giao xử lý văn bản và chưa được đánh dấu là đã phân công
    const canAssignToUsers = isCurrentDepartmentAssigned && !isDeptAssigned;

    if (
      hasRole([
        "ROLE_ADMIN",
        "ROLE_VAN_THU",
        "ROLE_CUC_TRUONG",
        "ROLE_CUC_PHO",
      ]) &&
      isPendingProcessing
    ) {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
            onClick={handleDownloadAttachment}
          >
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
            disabled={isNavigating}
            onClick={() => {
              setIsNavigating(true);
              router.push(`/van-ban-den/${_document.id}/chuyen-xu-ly`);
            }}
          >
            {isNavigating ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Đang chuyển trang...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Chuyển xử lý
              </>
            )}
          </Button>
        </>
      );
    }

    if (hasRole("clerk")) {
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
    }

    if (hasDepartmentAccess) {
      return (
        <>
          {/* Hiển thị nút Phân công nếu phòng ban được giao xử lý văn bản và đang ở trạng thái phù hợp */}
          {canAssignToUsers &&
            [
              "PENDING",
              "DEPT_ASSIGNED",
              "registered",
              "dept_assigned",
              "distributed",
            ].includes(_document.processingStatus || _document.status) && (
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                disabled={isNavigating}
                onClick={() => {
                  setIsNavigating(true);
                  // Lưu trạng thái đã phân công vào localStorage
                  markDeptAsAssigned();
                  router.push(`/van-ban-den/${_document.id}/phan-cong`);
                }}
              >
                {isNavigating ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-transparent"></span>
                    Đang chuyển trang...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Phân công
                  </>
                )}
              </Button>
            )}

          {/* Hiển thị nút Xem xét từ đơn vị con nếu văn bản được chuyển từ đơn vị con lên */}
          {isForwardedFromChildDept && _document.latestResponseId && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              disabled={isNavigating}
              onClick={() => {
                setIsNavigating(true);
                router.push(
                  `/van-ban-den/${_document.id}/xem-xet-tu-don-vi-con/${_document.latestResponseId}`
                );
              }}
            >
              {isNavigating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-700 border-t-transparent"></span>
                  Đang chuyển trang...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Xem xét từ đơn vị con
                </>
              )}
            </Button>
          )}

          {_document.responses &&
            _document.responses.length > 0 &&
            !isForwardedFromChildDept && (
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                disabled={isNavigating}
                onClick={() => {
                  setIsNavigating(true);
                  router.push(`/van-ban-den/${_document.id}/xem-xet/1`);
                }}
              >
                {isNavigating ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-transparent"></span>
                    Đang chuyển trang...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Xem xét
                  </>
                )}
              </Button>
            )}
        </>
      );
    }

    if (hasRole(["ROLE_TRO_LY", "ROLE_NHAN_VIEN"])) {
      // Kiểm tra xem người dùng hiện tại có được phân công xử lý văn bản này không
      const isAssignedToCurrentUser =
        _document.assignedToIds &&
        Array.isArray(_document.assignedToIds) &&
        _document.assignedToIds.includes(user.id);
      // kiểm tra xem người dùng đã trả lời văn bản trong lịch sử chưa

      // Log thông tin để debug
      console.log("Trợ lý/nhân viên quyền trả lời:", {
        userId: user.id,
        userName: user.fullName,
        assignedToIds: _document.assignedToIds,
        isAssignedToCurrentUser: isAssignedToCurrentUser,
      });

      // Kiểm tra trong nhiều vị trí khác có thể chứa thông tin phân công
      const isUserAssigned =
        isAssignedToCurrentUser ||
        (_document.assignedToId && _document.assignedToId == user.id) ||
        (_document.workflowStatus &&
          _document.workflowStatus.assignedToId == user.id) ||
        (_document.primaryProcessor && _document.primaryProcessor == user.id);
      const isReply =
        _document.history.some((item: any) => {
          return item.newStatus === "specialist_submitted";
        }) && isUserAssigned;
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
            onClick={handleDownloadAttachment}
          >
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>

          {/* Chỉ hiển thị nút Trả lời khi người dùng được phân công xử lý */}
          {!isReply && isUserAssigned && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={handleResponse}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Đang chuyển trang...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Trả lời
                </>
              )}
            </Button>
          )}
        </>
      );
    }

    if (hasRole("ROLE_PHE_DUYET")) {
      return (
        _document.responses &&
        _document.responses.length > 0 && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            disabled={isNavigating}
            onClick={() => {
              setIsNavigating(true);
              router.push(`/van-ban-den/${_document.id}/phe-duyet/1`);
            }}
          >
            {isNavigating ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Đang chuyển trang...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Phê duyệt
              </>
            )}
          </Button>
        )
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadAttachment}
        className="border-primary/20 hover:bg-primary/10 hover:text-primary"
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
          <Link href="/van-ban-den">Quay lại danh sách</Link>
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
            <Link href="/van-ban-den">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Chi tiết văn bản đến
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
                <CardTitle>{_document.documentNumber}</CardTitle>
                {getStatusBadge(
                  _document.status,
                  getStatusByCode(_document.status)?.displayName!
                )}
              </div>
              <CardDescription>{_document.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày nhận
                  </p>
                  <p>
                    {new Date(_document.receivedDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Đơn vị gửi
                  </p>
                  <p>{_document.issuingAuthority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Đơn vị xử lý
                  </p>

                  <div className="flex space-x-2 gap-1">
                    {departments.length > 0 &&
                      departments.map((department) => (
                        <div
                          key={department.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                            {department.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                        </div>
                      ))}
                    {departments.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Chưa có đơn vị xử lý
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Trích yếu nội dung
                </p>
                <p className="text-sm">{_document.summary}</p>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Ý kiến chỉ đạo của Thủ trưởng
                </p>
                <p className="text-sm">
                  {_document.notes || "Chưa có ý kiến chỉ đạo"}
                </p>
              </div>
              <Separator className="bg-primary/10" />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Tệp đính kèm
                </p>
                <div className="space-y-2">
                  {_document.attachmentFilename ? (
                    <div className="flex items-center justify-between rounded-md border border-primary/10 p-2 bg-accent/30">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {_document.attachmentFilename.split("/").pop() ||
                            "Tài liệu đính kèm"}
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
                  ) : _document.attachments &&
                    _document.attachments.length > 0 ? (
                    _document.attachments.map((file: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-primary/10 p-2 bg-accent/30"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {file.size}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleDownloadAttachment()}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có tệp đính kèm
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="responses">
            <TabsList className="grid w-full grid-cols-2 bg-primary/5">
              <TabsTrigger
                value="responses"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Văn bản trả lời
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Lịch sử xử lý
              </TabsTrigger>
            </TabsList>
            <TabsContent value="responses" className="space-y-4 pt-4">
              <DocumentResponseList documentId={_document.id} />
              {hasRole(["ROLE_TRO_LY", "ROLE_NHAN_VIEN"]) && (
                <DocumentResponseForm documentId={_document.id} />
              )}
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              <DocumentProcessingHistory documentId={_document.id} />
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
                <div className="mt-1">
                  {getStatusBadge(
                    _document.status,
                    getStatusByCode(_document.status)?.displayName!
                  )}
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đơn vị xử lý chính
                </p>
                <div className="flex items-center space-x-2">
                  {/* check if departments */}
                  {departments.length > 0 && (
                    <div
                      key={departments[0].id}
                      className="flex space-x-2 items-center"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {departments[0].name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <p className="mt-1">
                        {departments[0].name || "Chưa phân công"}
                      </p>
                    </div>
                  )}
                  {departments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có đơn vị xử lý chính
                    </p>
                  )}
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cán bộ được giao
                </p>
                <div className="mt-1">
                  {_document.assignedToIds && _document.assignedToNames ? (
                    _document.assignedToNames.map(
                      (name: string, indexName: number) => (
                        <div
                          key={indexName}
                          className="flex items-center space-x-2"
                        >
                          <div className="flex -space-x-2">
                            <div
                              key={indexName}
                              className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary"
                            >
                              {name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </div>
                          </div>
                          <span className="text-sm">{name}</span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có cán bộ được phân công
                    </p>
                  )}
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Thời hạn xử lý
                </p>
                <p className="mt-1">
                  {_document.closureDeadline
                    ? new Date(_document.closureDeadline).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Chưa thiết lập thời hạn"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-accent/30 border-t border-primary/10">
              {hasRole(["ROLE_TRUONG_PHONG", "ROLE_PHO_PHONG"]) &&
                // Chỉ kiểm tra phân công trong phòng của trưởng phòng hiện tại
                (() => {
                  // Sử dụng trường hợp đơn giản nhất: kiểm tra xem phòng ban hiện tại có được liệt kê trong danh sách các phòng ban được phân công xử lý văn bản này hay không
                  const currentDeptId = Number(user?.departmentId);

                  // Kiểm tra xem phòng ban hiện tại có trong danh sách các phòng ban xử lý văn bản hay không
                  const hasAssignedToCurrentDepartment =
                    Array.isArray(departments) &&
                    departments.some((dept) => dept.id === currentDeptId);

                  // Kiểm tra bổ sung: có nhân viên nào trong phòng đã được giao trực tiếp không
                  const hasAssignedToUserInCurrentDept =
                    _document.assignedToIds &&
                    Array.isArray(_document.assignedToIds) &&
                    _document.assignedToIds.length > 0 &&
                    hasAssignedToCurrentDepartment; //_document Đã có phòng được phân công

                  // Nếu chưa có ai trong phòng được phân công hoặc văn bản đang ở trạng thái chờ xử lý
                  if (
                    !hasAssignedToUserInCurrentDept &&
                    [
                      "PENDING",
                      "DEPT_ASSIGNED",
                      "registered",
                      "dept_assigned",
                      "distributed",
                    ].includes(_document.processingStatus || _document.status)
                  ) {
                    return (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isNavigating}
                        onClick={() => {
                          setIsNavigating(true);
                          router.push(`/van-ban-den/${_document.id}/phan-cong`);
                        }}
                      >
                        {isNavigating ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Đang chuyển trang...
                          </>
                        ) : (
                          "Cập nhật thông tin xử lý"
                        )}
                      </Button>
                    );
                  } else {
                    return (
                      <div className="w-full text-center text-amber-600 text-sm py-1">
                        Văn bản đã được phân công cho cán bộ của{" "}
                        {user?.departmentName} xử lý
                      </div>
                    );
                  }
                })()}
              {/* Chỉ hiển thị nút Cập nhật thông tin xử lý cho nhân viên/trợ lý được phân công xử lý */}
              {hasRole(["ROLE_TRO_LY", "ROLE_NHAN_VIEN"]) && (
                <>
                  {/* Kiểm tra người dùng có được phân công xử lý văn bản này không */}
                  {(() => {
                    // Giống như cách kiểm tra ở nút Trả lời
                    const isAssignedToCurrentUser =
                      _document.assignedToIds &&
                      Array.isArray(_document.assignedToIds) &&
                      _document.assignedToIds.includes(user?.id);

                    // Kiểm tra trong nhiều vị trí khác có thể chứa thông tin phân công
                    const isUserAssigned =
                      isAssignedToCurrentUser ||
                      (_document.assignedToId &&
                        _document.assignedToId == user?.id) ||
                      (_document.workflowStatus &&
                        _document.workflowStatus.assignedToId == user?.id) ||
                      (_document.primaryProcessor &&
                        _document.primaryProcessor == user?.id);

                    console.log("Kiểm tra quyền cập nhật thông tin xử lý:", {
                      userId: user?.id,
                      assignedToIds: _document.assignedToIds,
                      isAssignedToCurrentUser,
                      isUserAssigned,
                    });

                    // Chỉ hiển thị nút nếu người dùng được phân công xử lý
                    if (isUserAssigned) {
                      return (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={isNavigating}
                          onClick={() => {
                            setIsNavigating(true);
                            router.push(
                              `/van-ban-den/${_document.id}/cap-nhat-thong-tin`
                            );
                          }}
                        >
                          {isNavigating ? (
                            <>
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                              Đang chuyển trang...
                            </>
                          ) : (
                            "Cập nhật thông tin xử lý"
                          )}
                        </Button>
                      );
                    } else {
                      // Nếu không được phân công, không hiển thị nút
                      return null;
                    }
                  })()}
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DocumentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex">
              <Skeleton className="h-10 w-full" />
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                  <div className="mt-2 flex justify-end">
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                  <div className="mt-2 flex justify-end">
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
