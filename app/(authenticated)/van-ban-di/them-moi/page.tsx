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

export default function AddOutgoingDocumentPage() {
  const { user } = useAuth();

  // Form state
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(false);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Error creating document type:", error);
      setDocumentTypeError("Không thể tạo loại văn bản mới");
      addNotification({
        title: "Lỗi",
        message: "Không thể tạo loại văn bản mới",
        type: "error",
      });
    } finally {
      setIsCreatingDocumentType(false);
    }
  };

  // Function to handle creating a new recipient
  const handleCreateRecipient = async () => {
    if (!newRecipient.trim()) {
      setRecipientError("Tên người nhận không được để trống");
      return;
    }

    try {
      setIsCreatingRecipient(true);
      setRecipientError(null);

      // Gọi API để tạo người nhận mới (sử dụng API tạo người gửi tạm thời)
      const senderData: SenderDTO = {
        name: newRecipient.trim(),
      };

      const createdRecipient = await senderApi.createSender(senderData);

      // Thêm người nhận mới vào danh sách người nhận
      setRecipients((prevRecipients) => [
        ...prevRecipients,
        {
          id: createdRecipient.id,
          name: createdRecipient.name,
        },
      ]);

      // Đóng dialog và reset trường nhập
      setIsRecipientDialogOpen(false);
      setNewRecipient("");

      addNotification({
        title: "Thành công",
        message: "Đã thêm người nhận mới",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating recipient:", error);
      addNotification({
        title: "Lỗi",
        message: "Không thể tạo người nhận mới",
        type: "error",
      });
    } finally {
      setIsCreatingRecipient(false);
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
          ["ROLE_TRUONG_PHONG", 
            "ROLE_PHO_PHONG", 
            "ROLE_TRUONG_BAN", 
            "ROLE_PHO_BAN",
            "ROLE_CUM_TRUONG",
            "ROLE_PHO_CUM_TRUONG",
            "ROLE_TRAM_TRUONG"],
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

  // Fetch recipients (senders) on component mount
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setIsLoadingRecipients(true);
        const senders = await senderApi.getAllSenders();
        setRecipients(senders || []);
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
  }, []);

  // Cập nhật hàm handleSubmit để sử dụng state thay vì DOM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sử dụng state formData thay vì truy xuất DOM
      const _document: OutgoingDocumentDTO = {
        documentNumber: formData.documentNumber,
        signingDate: formData.sentDate
          ? new Date(formData.sentDate)
          : new Date(),
        receivingDepartmentText: formData.recipient,
        documentType: formData.documentType,
        title: formData.title,
        summary: formData.content,
        signerId: formData.approver ? Number(formData.approver) : 0,
      };

      const workflowData: DocumentWorkflowDTO = {
        status: "REGISTERED",
        statusDisplayName: "Đã đăng ký",
        comments: formData.note,
      };

      // Tạo object dữ liệu từ state
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
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
                <div className="space-y-2">
                  <Label htmlFor="recipient">Nơi nhận</Label>
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
                              value={String(recipient.id)}
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
                            <Label htmlFor="newRecipient">Tên người nhận</Label>
                            <Input
                              id="newRecipient"
                              value={newRecipient}
                              onChange={(e) => setNewRecipient(e.target.value)}
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
                <Label htmlFor="title">Trích yếu</Label>
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
                  value={formData.note}
                  onChange={handleInputChange}
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
