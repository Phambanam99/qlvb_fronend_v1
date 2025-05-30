"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import {
  incomingDocumentsAPI,
  outgoingDocumentsAPI,
  OutgoingDocumentDTO,
} from "@/lib/api";

interface FormData {
  documentNumber: string;
  sentDate: string;
  recipient: string;
  documentType: string;
  title: string;
  content: string;
  approver: string;
  priority: string;
  note: string;
}

export function useDocumentForm() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [incomingDocument, setIncomingDocument] = useState<any>(null);
  const [isLoadingIncomingDoc, setIsLoadingIncomingDoc] = useState(false);

  // Document scope and sender
  const [documentScope, setDocumentScope] = useState<"INTERNAL" | "EXTERNAL">(
    "EXTERNAL"
  );
  const [selectedSender, setSelectedSender] = useState<number | string | null>(
    null
  );

  // Form data
  const [formData, setFormData] = useState<FormData>({
    documentNumber: "",
    sentDate: new Date().toISOString().slice(0, 10),
    recipient: "",
    documentType: "",
    title: "",
    content: "",
    approver: "",
    priority: "normal",
    note: "",
  });

  // Get replyToId from query parameter
  useEffect(() => {
    setReplyToId(searchParams.get("replyToId"));
  }, [searchParams]);

  // Fetch incoming document if replyToId is provided
  useEffect(() => {
    const fetchIncomingDocument = async () => {
      if (!replyToId) return;

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
        addNotification({
          title: "Lỗi",
          message: "Không thể tải thông tin văn bản đến",
          type: "error",
        });
      } finally {
        setIsLoadingIncomingDoc(false);
      }
    };

    fetchIncomingDocument();
  }, [replyToId, addNotification]);

  // Handler for form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // Handler for document scope change
  const handleScopeChange = (scope: "INTERNAL" | "EXTERNAL") => {
    setDocumentScope(scope);
    if (scope === "INTERNAL") {
      // Clear recipient and approver when switching to internal
      setFormData((prev) => ({
        ...prev,
        recipient: "",
        approver: "",
      }));
    }
  };

  // Handler for sender selection
  const handleSelectSender = (senderId: number | string) => {
    setSelectedSender(senderId);
  };

  const handleClearSender = () => {
    setSelectedSender(null);
  };

  // Handler for file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Form validation
  const isFormValid = () => {
    if (!formData.documentNumber || !formData.title) {
      return false;
    }

    if (documentScope === "EXTERNAL") {
      return formData.recipient && formData.approver;
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      addNotification({
        title: "Lỗi",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const documentData: Partial<OutgoingDocumentDTO> = {
        documentNumber: formData.documentNumber,
        sentDate: formData.sentDate,
        recipient:
          documentScope === "EXTERNAL" ? formData.recipient : undefined,
        documentType: formData.documentType,
        title: formData.title,
        priority: formData.priority,
        note: formData.note,
        authorId: user?.id,
        status: "DRAFT",
        approverId:
          documentScope === "EXTERNAL" ? formData.approver : undefined,
        replyToId: replyToId ? Number(replyToId) : undefined,
        scope: documentScope,
        senderId: selectedSender ? String(selectedSender) : undefined,
      };

      console.log("Creating outgoing document:", documentData);

      // Note: This will need to be updated when the API method is available
      // const createdDocument = await outgoingDocumentsAPI.createDocument(documentData);

      // Upload file if provided
      // if (file && createdDocument.id) {
      //   const fileFormData = new FormData();
      //   fileFormData.append("file", file);
      //   await outgoingDocumentsAPI.uploadAttachment(createdDocument.id, fileFormData);
      // }

      addNotification({
        title: "Thành công",
        message: `Đã tạo ${
          documentScope === "INTERNAL" ? "văn bản nội bộ" : "văn bản đi"
        } thành công`,
        type: "success",
      });

      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error creating document:", error);
      addNotification({
        title: "Lỗi",
        message:
          error.response?.data?.message || "Có lỗi xảy ra khi tạo văn bản",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save draft handler
  const handleSaveDraft = async () => {
    if (!formData.documentNumber || !formData.title) {
      addNotification({
        title: "Lỗi",
        message: "Vui lòng điền ít nhất số văn bản và trích yếu để lưu nháp",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const documentData: Partial<OutgoingDocumentDTO> = {
        documentNumber: formData.documentNumber,
        sentDate: formData.sentDate,
        recipient:
          documentScope === "EXTERNAL" ? formData.recipient : undefined,
        documentType: formData.documentType,
        title: formData.title,
        priority: formData.priority,
        note: formData.note,
        authorId: user?.id,
        status: "DRAFT",
        replyToId: replyToId ? Number(replyToId) : undefined,
        scope: documentScope,
        senderId: selectedSender ? String(selectedSender) : undefined,
      };

      console.log("Saving draft:", documentData);

      // Note: This will need to be updated when the API method is available
      // const savedDraft = await outgoingDocumentsAPI.createDocument(documentData);

      // Upload file if provided
      // if (file && savedDraft.id) {
      //   const fileFormData = new FormData();
      //   fileFormData.append("file", file);
      //   await outgoingDocumentsAPI.uploadAttachment(savedDraft.id, fileFormData);
      // }

      addNotification({
        title: "Thành công",
        message: "Đã lưu nháp văn bản",
        type: "success",
      });

      router.push("/van-ban-di");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      addNotification({
        title: "Lỗi",
        message: error.response?.data?.message || "Có lỗi xảy ra khi lưu nháp",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    formData,
    documentScope,
    selectedSender,
    file,
    isSubmitting,
    replyToId,
    incomingDocument,
    isLoadingIncomingDoc,

    // Handlers
    handleInputChange,
    handleSelectChange,
    handleScopeChange,
    handleSelectSender,
    handleClearSender,
    handleFileChange,
    handleSubmit,
    handleSaveDraft,

    // Validation
    isFormValid: isFormValid(),
  };
}
