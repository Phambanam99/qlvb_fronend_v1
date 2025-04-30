"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { ArrowLeft, Paperclip, Save, X, Plus, Building } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  usersAPI,
  incomingDocumentsAPI,
  workflowAPI,
  DocumentWorkflowDTO,
  senderApi,
  departmentsAPI,
  UserDTO,
} from "@/lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function AddIncomingDocumentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [isLoadingDepartmentList, setIsLoadingDepartmentList] = useState(true);
  const [documentType, setDocumentType] = useState<string>("OFFICIAL_LETTER");
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [newSender, setNewSender] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState("NORMAL");
  const [securityLevel, setSecurityLevel] = useState("NORMAL");
  const [closureRequest, setClosureRequest] = useState(false);
  const [primaryDepartment, setPrimaryDepartment] = useState<string | null>(
    null
  );
  const [secondaryDepartments, setSecondaryDepartments] = useState<string[]>(
    []
  );

  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [senderError, setSenderError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartmentList = async () => {
      try {
        setIsLoadingDepartmentList(true);
        const response = await departmentsAPI.getAllDepartments();
        console.log("senders", response);
        setDepartmentList(response.content || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng ban:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách phòng ban",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDepartmentList(false);
      }
    };

    fetchDepartmentList();
  }, [toast]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const senders = await senderApi.getAllSenders();
       
        setDepartments(senders || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị gửi:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn vị gửi",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSelectPrimaryDepartment = (deptId: string) => {
    setPrimaryDepartment((prevId) => (prevId === deptId ? null : deptId));

    if (secondaryDepartments.includes(deptId)) {
      setSecondaryDepartments((prev) => prev.filter((id) => id !== deptId));
    }
  };

  const handleSelectSecondaryDepartment = (deptId: string) => {
    if (deptId === primaryDepartment) return;

    setSecondaryDepartments((prev) => {
      if (prev.includes(deptId)) {
        return prev.filter((id) => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
  };

  const handleRemovePrimaryDepartment = () => {
    setPrimaryDepartment(null);
  };

  const handleRemoveSecondaryDepartment = (deptId: string) => {
    setSecondaryDepartments((prev) => prev.filter((id) => id !== deptId));
  };

  const handleAddSender = async () => {
    if (!newSender.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên đơn vị gửi không được để trống",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await senderApi.createSender({
        name: newSender,
        description: "Đơn vị gửi mới được thêm từ trang tạo văn bản đến",
      });

      setDepartments((prev) => [...prev, response]);
      setNewSender("");
      setDialogOpen(false);

      toast({
        title: "Thành công",
        description: "Đã thêm đơn vị gửi mới",
      });
    } catch (error) {
      console.error("Lỗi khi thêm đơn vị gửi:", error);
      setSenderError("Đã tồn tại đơn vị gửi này trong hệ thống");
      toast({
        title: "Lỗi",
        description: "Không thể thêm đơn vị gửi mới",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current!);

      const documentData = {
        title: formData.get("title") as string,
        documentType: documentType,
        documentNumber: formData.get("documentNumber") as string,
        referenceNumber: formData.get("referenceNumber") as string,
        issuingAuthority: formData.get("issuingAuthority") as string,
        urgencyLevel: urgencyLevel,
        securityLevel: securityLevel,
        summary: formData.get("summary") as string,
        notes: formData.get("notes") as string,
        signingDate: formData.get("signingDate") as string,
        receivedDate: formData.get("receivedDate") as string,
        processingStatus: "PENDING",
        closureRequest: closureRequest,
        sendingDepartmentName: formData.get("sendingDepartmentName") as string,
        emailSource: formData.get("emailSource") as string,
      };

      const apiFormData = new FormData();

      Object.entries(documentData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          apiFormData.append(key, value.toString());
        }
      });

      const response = await incomingDocumentsAPI.createIncomingDocument(
        apiFormData
      );

      if (response?.data?.id) {
        const workflowData: DocumentWorkflowDTO = {
          documentId: response.data.id,
          status: "REGISTERED",
          statusDisplayName: "Đã đăng ký",
          comments: formData.get("notes") as string,
        };

        await workflowAPI.registerIncomingDocument(
          response.data.id,
          workflowData
        );

        if (primaryDepartment || secondaryDepartments.length > 0) {
        const data =   await workflowAPI.distributeDocument(response.data.id, {
            primaryDepartmentId: primaryDepartment,
            collaboratingDepartmentIds: secondaryDepartments,
            comments: formData.get("notes") as string,
            deadline: formData.get("deadline") as string,
          });

        
        }
        

        if (files.length > 0) {
          await incomingDocumentsAPI.uploadAttachment(
            response.data.id,
            files[0]
          );
        }

        toast({
          title: "Thành công",
          description: "Văn bản đến đã được tạo thành công",
        });

        router.push("/van-ban-den");
      }
    } catch (error) {
      console.error("Lỗi khi tạo văn bản:", error);
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo văn bản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/van-ban-den">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm văn bản đến</h1>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Thông tin văn bản</CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết của văn bản đến
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
                  <Label htmlFor="referenceNumber">Số tham chiếu</Label>
                  <Input
                    id="referenceNumber"
                    name="referenceNumber"
                    placeholder="Nhập số tham chiếu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signingDate">Ngày ký</Label>
                  <Input
                    id="signingDate"
                    name="signingDate"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedDate">Ngày nhận</Label>
                  <Input
                    id="receivedDate"
                    name="receivedDate"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority">Đơn vị gửi</Label>
                  <div className="flex gap-2">
                    <Select name="issuingAuthority" required>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn đơn vị gửi" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDepartments ? (
                          <SelectItem value="loading" disabled>
                            Đang tải...
                          </SelectItem>
                        ) : departments.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Không có đơn vị nào
                          </SelectItem>
                        ) : (
                          departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                          <DialogTitle>Thêm đơn vị gửi mới</DialogTitle>
                          <DialogDescription>
                            Nhập tên đơn vị gửi chưa có trong hệ thống
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newDepartment">
                              Tên đơn vị gửi
                            </Label>
                            <Input
                              id="newDepartment"
                              value={newSender}
                              onChange={(e) => {
                                setNewSender(e.target.value);
                                setSenderError(null);
                              }}
                              placeholder="Nhập tên đơn vị gửi mới"
                              className={senderError ? "border-red-500" : ""}
                            />
                            {senderError && (
                              <p className="text-sm font-medium text-red-500 mt-1">
                                {senderError}
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDialogOpen(false);

                              setSenderError(null);
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={handleAddSender}
                            disabled={isSubmitting || !newSender.trim()}
                          >
                            {isSubmitting ? "Đang thêm..." : "Thêm đơn vị"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType" name="documentType">
                      <SelectValue placeholder="Chọn loại văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFICIAL_LETTER">Công văn</SelectItem>
                      <SelectItem value="DECISION">Quyết định</SelectItem>
                      <SelectItem value="DIRECTIVE">Chỉ thị</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Thông báo</SelectItem>
                      <SelectItem value="REPORT">Báo cáo</SelectItem>
                      <SelectItem value="PLAN">Kế hoạch</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Độ khẩn</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                    <SelectTrigger id="urgencyLevel" name="urgencyLevel">
                      <SelectValue placeholder="Chọn độ khẩn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Bình thường</SelectItem>
                      <SelectItem value="URGENT">Khẩn</SelectItem>
                      <SelectItem value="IMMEDIATE">Hỏa tốc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityLevel">Độ mật</Label>
                  <Select
                    value={securityLevel}
                    onValueChange={setSecurityLevel}
                  >
                    <SelectTrigger id="securityLevel" name="securityLevel">
                      <SelectValue placeholder="Chọn độ mật" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Bình thường</SelectItem>
                      <SelectItem value="CONFIDENTIAL">Mật</SelectItem>
                      <SelectItem value="SECRET">Tối mật</SelectItem>
                      <SelectItem value="TOP_SECRET">Tuyệt mật</SelectItem>
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
                <Label htmlFor="summary">Tóm tắt nội dung</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  placeholder="Nhập tóm tắt nội dung văn bản"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="closureRequest"
                  checked={closureRequest}
                  onCheckedChange={setClosureRequest}
                />
                <Label htmlFor="closureRequest">
                  Yêu cầu văn bản đóng lưu sau khi xử lý
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachments">Tệp đính kèm</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
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
                    {files.length > 0
                      ? `Đã chọn ${files.length} tệp`
                      : "Chưa có tệp nào được chọn"}
                  </span>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                      >
                        <span>
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card md:col-span-1">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Chuyển xử lý</CardTitle>
              <CardDescription>Chọn phòng ban xử lý văn bản</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-red-500 font-medium">
                      Phòng ban xử lý chính
                    </Label>
                    {primaryDepartment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-red-500"
                        onClick={handleRemovePrimaryDepartment}
                      >
                        Bỏ chọn
                      </Button>
                    )}
                  </div>
                  {/* Hiển thị phòng ban chính */}
                  <div className="min-h-[60px] p-2 border rounded-md bg-accent/50 mt-2">
                    {!primaryDepartment ? (
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                        Chưa chọn phòng ban xử lý chính
                      </div>
                    ) : (
                      (() => {
                        const dept = departmentList.find(
                          (d) => String(d.id) === primaryDepartment
                        );
                        if (!dept)
                          return (
                            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                              Không tìm thấy thông tin phòng ban
                            </div>
                          );

                        return (
                          <Badge
                            key={dept.id}
                            variant="outline"
                            className="pl-2 pr-1 py-1.5 flex items-center gap-1 border-red-500 bg-red-50 text-red-700"
                          >
                            <span>{dept.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full text-red-700 hover:bg-red-100"
                              onClick={handleRemovePrimaryDepartment}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })()
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-600 font-medium">
                      Phòng ban phối hợp ({secondaryDepartments.length})
                    </Label>
                    {secondaryDepartments.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-blue-600"
                        onClick={() => setSecondaryDepartments([])}
                      >
                        Bỏ chọn tất cả
                      </Button>
                    )}
                  </div>

                  {/* Hiển thị phòng ban phối hợp */}
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border rounded-md bg-accent/50 mt-2">
                    {secondaryDepartments.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                        Chưa chọn phòng ban phối hợp
                      </div>
                    ) : (
                      secondaryDepartments.map((deptId) => {
                        const dept = departmentList.find(
                          (d) => String(d.id) === deptId
                        );
                        if (!dept) return null;

                        return (
                          <Badge
                            key={deptId}
                            variant="outline"
                            className="pl-2 pr-1 py-1.5 flex items-center gap-1 border-blue-500 bg-blue-50 text-blue-700"
                          >
                            <span>{dept.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full text-blue-700 hover:bg-blue-100"
                              onClick={() =>
                                handleRemoveSecondaryDepartment(deptId)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Danh sách phòng ban</Label>
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Chọn phòng ban xử lý văn bản
                      </span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {isLoadingDepartmentList ? (
                        <div
                          key="loading"
                          className="flex items-center justify-center p-4"
                        >
                          <p>Đang tải danh sách phòng ban...</p>
                        </div>
                      ) : departmentList.length === 0 ? (
                        <div
                          key="empty"
                          className="flex items-center justify-center p-4"
                        >
                          <p>Không có phòng ban nào</p>
                        </div>
                      ) : (
                        departmentList.map((dept) => {
                          const deptId = String(dept.id);
                          const isPrimary = primaryDepartment === deptId;
                          const isSecondary =
                            secondaryDepartments.includes(deptId);

                          return (
                            <div
                              key={dept.id || `dept-${dept.name}`}
                              className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 ${
                                isPrimary
                                  ? "bg-red-50"
                                  : isSecondary
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <Checkbox
                                    id={`primary-${dept.id}`}
                                    checked={isPrimary}
                                    onCheckedChange={() =>
                                      handleSelectPrimaryDepartment(deptId)
                                    }
                                    className="border-red-500 text-red-500 focus-visible:ring-red-300"
                                  />
                                  <Checkbox
                                    id={`secondary-${dept.id}`}
                                    checked={isSecondary}
                                    onCheckedChange={() =>
                                      handleSelectSecondaryDepartment(deptId)
                                    }
                                    className="border-blue-500 text-blue-500 focus-visible:ring-blue-300"
                                    disabled={isPrimary}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Building className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {dept.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {dept.group || "Phòng ban"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-accent"
                                >
                                  {dept.userCount || 0} thành viên
                                </Badge>
                                <div className="flex gap-1">
                                  {isPrimary && (
                                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-sm">
                                      Chính
                                    </span>
                                  )}
                                  {isSecondary && (
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-sm">
                                      Phối hợp
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm border border-red-500 bg-white"></div>
                      <span>Xử lý chính</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm border border-blue-500 bg-white"></div>
                      <span>Phối hợp</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Nhập ghi chú cho phòng ban xử lý (nếu có)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Thời hạn xử lý</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    placeholder="Chọn thời hạn xử lý"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/van-ban-den">Hủy</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Lưu văn bản
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
