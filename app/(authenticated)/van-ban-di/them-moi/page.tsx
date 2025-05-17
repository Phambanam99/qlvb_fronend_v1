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
import { ArrowLeft, Paperclip, Save, Send } from "lucide-react";
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
} from "@/lib/api";

export default function AddOutgoingDocumentPage() {
  
  const { user } = useAuth();

  // Form state
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(false);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  // Thêm useEffect để lấy thông tin văn bản đến nếu có replyToId
  useEffect(() => {
    const fetchIncomingDocument = async () => {
      if (!replyToId) return;

      try {
        setIsLoadingIncomingDoc(true);
        const incomingDoc = await incomingDocumentsAPI.getIncomingDocumentById(
          replyToId
        );
        setIncomingDocument(incomingDoc.data);

        // Tự động điền thông tin dựa trên văn bản đến
        if (incomingDoc) {
          // Điền trích yếu
          const titleInput = document.getElementById(
            "title"
          ) as HTMLInputElement;
          if (titleInput) {
            titleInput.value = `V/v trả lời văn bản số ${incomingDoc.data.documentNumber}`;
          }

          // Điền nơi nhận là đơn vị gửi văn bản đến
          const recipientInput = document.getElementById(
            "recipient"
          ) as HTMLInputElement;
          if (recipientInput && incomingDoc.data.issuingAuthority) {
            recipientInput.value = incomingDoc.data.issuingAuthority;
          }
        }
      } catch (error) {
        console.error("Error fetching incoming document:", error);
      } finally {
        setIsLoadingIncomingDoc(false);
      }
    };

    fetchIncomingDocument();
  }, [replyToId]);

  // Thêm useEffect để lấy danh sách người phê duyệt
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setIsLoadingApprovers(true);

        // Nếu người dùng chưa được load hoặc không có ID phòng ban
        if (!user?.departmentId) {
          setIsLoadingApprovers(false);
          return;
        }

        // Lấy thông tin phòng ban hiện tại của người dùng
        const department = await departmentsAPI.getDepartmentById(
          user.departmentId
        );

        // Lấy danh sách người dùng có vai trò trưởng phòng hoặc phó phòng trong phòng ban hiện tại
        const departmentManagers = await usersAPI.getUsersByRoleAndDepartment(
          ["ROLE_TRUONG_PHONG", "ROLE_PHO_PHONG"],
          Number(user.departmentId)
        );

        if (departmentManagers && departmentManagers.length > 0) {
          // Nếu có trưởng/phó phòng trong phòng ban hiện tại
          setApprovers(
            departmentManagers.map((manager) => ({
              id: String(manager.id),
              fullName: manager.fullName,
              position: manager.roleDisplayNames || "",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching approvers:", error);
      } finally {
        setIsLoadingApprovers(false);
      }
    };

    fetchApprovers();
  }, [user]);

  // Cập nhật hàm handleSubmit để sử dụng một file
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Tạo FormData
      const formData = new FormData(e.target as HTMLFormElement);
      const _document: OutgoingDocumentDTO = {
        documentNumber: formData.get("documentNumber") as string,
        signingDate: formData.get("sentDate")
          ? new Date(formData.get("sentDate") as string)
          : new Date(),
        receivingDepartmentText: formData.get("recipient") as string,
        documentType: formData.get("documentType") as string,
        title: formData.get("title") as string,
        summary: formData.get("content") as string,
        signerId: formData.get("approver")
          ? Number(formData.get("approver"))
          : 0,
      };

      const workflowData: DocumentWorkflowDTO = {
        status: "REGISTERED",
        statusDisplayName: "Đã đăng ký",
        comments: formData.get("note") as string,
      };
      // Tạo object dữ liệu từ FormData
      const documentData = {
        document: _document,
        workflow: workflowData,
      };
      console.log("Document Data:", documentData);
      if (replyToId) {
        // Nếu đang trả lời văn bản, sử dụng API tạo văn bản trả lời
        await workflowAPI.createResponseDocument(documentData, replyToId, file);

        addNotification({
          title: "Văn bản trả lời đã được tạo",
          message: "Văn bản trả lời đã được lưu và chờ phê duyệt.",
          type: "success",
          link: "/van-ban-di",
        });
      } else {
        // Nếu là văn bản đi thông thường
        const data = {
          document: documentData.document,
          workflow: documentData.workflow,
        };

        await workflowAPI.createFullDocument(data, file);

        addNotification({
          title: "Văn bản đi đã được tạo",
          message: "Văn bản đã được lưu và chờ phê duyệt.",
          type: "success",
          link: "/van-ban-di",
        });
      }

      // Reset form và chuyển hướng
      setIsSubmitting(false);
      router.push("/van-ban-di");
    } catch (error) {
      console.error("Error creating document:", error);
      addNotification({
        title: "Lỗi",
        message: "Không thể tạo văn bản đi. Vui lòng thử lại sau.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  // Cập nhật hàm handleSaveDraft để sử dụng một file
  const handleSaveDraft = async () => {
    setIsSubmitting(true);

    try {
      // Tạo FormData từ form
      const form = document.querySelector("form") as HTMLFormElement;
      const formData = new FormData(form);

      // Tạo đối tượng dữ liệu từ FormData
      const documentData = {
        documentNumber: formData.get("documentNumber") as string,
        sentDate: formData.get("sentDate") as string,
        recipient: formData.get("recipient") as string,
        documentType: formData.get("documentType") as string,
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        approver: formData.get("approver") as string,
        priority: formData.get("priority") as string,
        note: formData.get("note") as string,
        status: "draft",
      };

      // Tạo FormData mới để gửi API
      const apiFormData = new FormData();

      // Thêm dữ liệu văn bản
      apiFormData.append(
        "data",
        new Blob([JSON.stringify(documentData)], { type: "application/json" })
      );

      // Thêm file đính kèm (nếu có)
      if (file) {
        apiFormData.append("file", file);
      }

      // Gọi API để lưu bản nháp
      await outgoingDocumentsAPI.saveDraft(apiFormData);

      // Thêm thông báo
      addNotification({
        title: "Bản nháp đã được lưu",
        message: "Văn bản đã được lưu dưới dạng bản nháp.",
        type: "info",
        link: "/van-ban-di",
      });

      // Reset form và chuyển hướng
      setIsSubmitting(false);
      router.push("/van-ban-di");
    } catch (error) {
      console.error("Error saving draft:", error);
      addNotification({
        title: "Lỗi",
        message: "Không thể lưu bản nháp. Vui lòng thử lại sau.",
        type: "error",
      });
      setIsSubmitting(false);
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết của văn bản đi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Số văn bản</Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="Nhập số văn bản"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentDate">Ngày ban hành</Label>
                  <Input id="sentDate" name="sentDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Nơi nhận</Label>
                  <Input
                    id="recipient"
                    name="recipient"
                    placeholder="Nhập tên đơn vị nhận"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <Select name="documentType">
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Chọn loại văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Công văn</SelectItem>
                      <SelectItem value="decision">Quyết định</SelectItem>
                      <SelectItem value="directive">Chỉ thị</SelectItem>
                      <SelectItem value="report">Báo cáo</SelectItem>
                      <SelectItem value="plan">Kế hoạch</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Trích yếu</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Nhập trích yếu văn bản"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Nhập nội dung văn bản"
                  rows={10}
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

          <Card className="bg-card md:col-span-1">
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
                <Label htmlFor="approver">Người phê duyệt</Label>
                <Select name="approver">
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
                        <SelectItem key={approver.id} value={approver.id}>
                          {approver.fullName} - {approver.position}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select name="priority">
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
                />
              </div>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Lưu ý:</span> Sau khi gửi, văn
                  bản sẽ được chuyển đến người phê duyệt để xem xét trước khi
                  ban hành chính thức.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Lưu nháp
                  </>
                )}
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" /> Lưu nháp
              </Button> */}
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
