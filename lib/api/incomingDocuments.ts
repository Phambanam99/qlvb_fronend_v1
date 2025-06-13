import api from "./config";
import type { DocumentAttachmentDTO, ResponseDTO } from "./types";
import { UserDTO } from "./users";

// src/constants/document-status.ts

export const DocumentProcessingStatus = {
  // Initial statuses
  DRAFT: { code: "draft", displayName: "Dự thảo" },
  REGISTERED: { code: "registered", displayName: "Đã đăng ký" },

  // 2. Văn thư phân phối statuses
  DISTRIBUTED: { code: "distributed", displayName: "Đã phân phối" },

  // 3. Trưởng phòng statuses
  DEPT_ASSIGNED: { code: "dept_assigned", displayName: "Phòng đã phân công" },
  PENDING_APPROVAL: { code: "pending_approval", displayName: "Chờ phê duyệt" },

  // 4. TL/NV statuses
  SPECIALIST_PROCESSING: {
    code: "specialist_processing",
    displayName: "TL/NV đang xử lý",
  },
  SPECIALIST_SUBMITTED: {
    code: "specialist_submitted",
    displayName: "TL/NV đã trình",
  },

  // 5. Thử trưởng statuses
  LEADER_REVIEWING: {
    code: "leader_reviewing",
    displayName: "Thủ trưởng đang xem xét",
  },
  LEADER_APPROVED: {
    code: "leader_approved",
    displayName: "Thủ trưởng đã phê duyệt",
  },
  LEADER_COMMENTED: {
    code: "leader_commented",
    displayName: "Thủ trưởng đã cho ý kiến",
  },

  // Final statuses
  PUBLISHED: { code: "published", displayName: "Đã ban hành" },
  COMPLETED: { code: "completed", displayName: "Hoàn thành" },
  REJECTED: { code: "rejected", displayName: "Từ chối" },
  ARCHIVED: { code: "archived", displayName: "Lưu trữ" },
  HEADER_DEPARTMENT_REVIEWING: {
    code: "department_reviewing",
    displayName: "Chỉ  huy đang xem xét",
  },
  HEADER_DEPARTMENT_APPROVED: {
    code: "department_approved",
    displayName: "Chỉ huy đã phê duyệt",
  },

  HEADER_DEPARTMENT_COMMENTED: {
    code: "department_commented",
    displayName: "Chỉ huy đã cho ý kiến",
  },
} as const;

// ------------------
// 🔥 Type Definitions
// ------------------
export type StatusCode =
  (typeof DocumentProcessingStatus)[keyof typeof DocumentProcessingStatus]["code"];
export type StatusDisplayName =
  (typeof DocumentProcessingStatus)[keyof typeof DocumentProcessingStatus]["displayName"];

export interface Status {
  code: StatusCode;
  displayName: StatusDisplayName;
}

// ------------------
// 🔥 Helper functions
// ------------------

export const getStatusByCode = (code: string): Status | undefined => {
  return Object.values(DocumentProcessingStatus).find(
    (status) => status.code === code
  );
};

export const getStatusByDisplayName = (
  displayName: string
): Status | undefined => {
  return Object.values(DocumentProcessingStatus).find(
    (status) => status.displayName === displayName
  );
};

export const getAllStatuses = (): Status[] =>
  Object.values(DocumentProcessingStatus);

// Document Classification API Response
export interface DocumentClassificationResponse {
  statusDescription: string;
  documentId: number;
  userName: string;
  userId: number;
  status: string;
}

export interface IncomingDocumentDTO {
  id?: number;
  title: string;
  documentType: string;
  documentNumber: string;
  referenceNumber?: string;
  issuingAuthority: string;
  urgencyLevel: string;
  securityLevel: string;
  summary: string;
  notes?: string;
  displayStatus?: string;
  signingDate: string;
  receivedDate: Date;
  closureDeadline?: Date;
  processingStatus: string;
  closureRequest: boolean;
  sendingDepartmentName: string;
  emailSource?: string;
  primaryProcessorId?: number;
  created?: string;
  changed?: string;
  trackingStatus?: string;
  trackingStatusDisplayName?: string;
  attachmentFilename?: string; // Legacy single file
  storageLocation?: string;
  primaryProcessDepartmentId?: number;
  userPrimaryProcessor?: UserDTO,
  attachments?: DocumentAttachmentDTO[]; // New multiple files
}

export const incomingDocumentsAPI = {
  /**
   * Get all incoming documents
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of incoming documents
   */
  getAllDocuments: async (
    page = 0,
    size = 10
  ): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    try {
      const response = await api.get("/documents/incoming", {
        params: { page, size },
      });
      console.log("backend ", response);

      // Map backend response to frontend expected format
      const documents = response.data.content.map(
        (doc: IncomingDocumentDTO) => ({
          ...doc,
          // Add empty arrays for frontend compatibility
          attachments: [],
          relatedDocuments: [],
          responses: [],
        })
      );

      return {
        content: documents,
        page: {
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
        },
      };
    } catch (error) {
      console.error("Error fetching incoming documents:", error);
      throw error;
    }
  },

  /**
   * Get incoming document by ID
   * @param id Document ID
   * @returns Document data
   */
  getIncomingDocumentById: async (
    id: string | number
  ): Promise<{ data: IncomingDocumentDTO }> => {
    try {
      const response = await api.get(`/documents/incoming/${id}`);
      console.log("response cc", response.data);
      // Map backend response to frontend expected format
      const document = {
        ...response.data,
        number: response.data.documentNumber,
        sender: response.data.sendingDepartmentName,
        content: response.data.summary,
        status: response.data.processingStatus,
        // Add empty arrays for frontend compatibility
        attachments: [],
        relatedDocuments: [],
        responses: [],
      };

      return { data: document };
    } catch (error) {
      console.error("Error fetching incoming document by ID:", error);
      throw error;
    }
  },

  /**
   * Create incoming document
   * @param documentData Document data
   * @returns Created document
   */
  createIncomingDocument: async (
    documentData: IncomingDocumentDTO
  ): Promise<IncomingDocumentDTO> => {
    const response = await api.post("/documents/incoming", documentData);
    return response.data;
  },

  /**
   * Update incoming document
   * @param id Document ID
   * @param documentData Updated document data
   * @returns Updated document
   */
  updateIncomingDocument: async (
    id: number | string,
    documentData: Partial<IncomingDocumentDTO>
  ): Promise<IncomingDocumentDTO> => {
    const response = await api.put(`/documents/incoming/${id}`, documentData);
    return response.data;
  },

  /**
   * Delete incoming document
   * @param id Document ID
   * @returns Success message
   */
  deleteIncomingDocument: async (id: number | string): Promise<string> => {
    const response = await api.delete(`/documents/incoming/${id}`);
    return response.data;
  },

  /**
   * Search incoming documents
   * @param searchParams Search parameters
   * @returns Search results
   */
  searchIncomingDocuments: async (searchParams: {
    query?: string;
    documentType?: string;
    urgencyLevel?: string;
    processingStatus?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/incoming/search", {
      params: searchParams,
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get document attachments
   * @param documentId Document ID
   * @returns List of attachments
   */
  getDocumentAttachments: async (
    documentId: number | string
  ): Promise<DocumentAttachmentDTO[]> => {
    const response = await api.get(`/documents/incoming/${documentId}/attachments`);
    return response.data;
  },

  /**
   * Add attachment to document
   * @param documentId Document ID
   * @param file File to attach
   * @returns Attachment info
   */
  addAttachment: async (
    documentId: number | string,
    file: File
  ): Promise<DocumentAttachmentDTO> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/documents/incoming/${documentId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Add multiple attachments to document
   * @param documentId Document ID
   * @param files Files to attach
   * @returns Attachment info list
   */
  addMultipleAttachments: async (
    documentId: number | string,
    files: File[]
  ): Promise<DocumentAttachmentDTO[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/documents/incoming/${documentId}/attachments/multiple`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete attachment
   * @param documentId Document ID
   * @param attachmentId Attachment ID
   * @returns Success message
   */
  deleteAttachment: async (
    documentId: number | string,
    attachmentId: number | string
  ): Promise<string> => {
    const response = await api.delete(
      `/documents/incoming/${documentId}/attachments/${attachmentId}`
    );
    return response.data;
  },

  /**
   * Download attachment
   * @param documentId Document ID
   * @param attachmentId Attachment ID
   * @returns File blob
   */
  downloadAttachment: async (
    documentId: number | string,
    attachmentId: number | string
  ): Promise<Blob> => {
    const response = await api.get(
      `/documents/incoming/${documentId}/attachments/${attachmentId}/download`,
      { responseType: "blob" }
    );
    return response.data;
  },

  /**
   * Get document statistics
   * @returns Document statistics
   */
  getDocumentStatistics: async (): Promise<any> => {
    const response = await api.get("/documents/incoming/statistics");
    return response.data;
  },

  /**
   * Get documents by status
   * @param status Document status
   * @param page Page number
   * @param size Page size
   * @returns Documents with specified status
   */
  getDocumentsByStatus: async (
    status: string,
    page = 0,
    size = 10
  ): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/incoming/by-status", {
      params: { status, page, size },
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get urgent documents
   * @param page Page number
   * @param size Page size
   * @returns Urgent documents
   */
  getUrgentDocuments: async (
    page = 0,
    size = 10
  ): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/incoming/urgent", {
      params: { page, size },
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get overdue documents
   * @param page Page number
   * @param size Page size
   * @returns Overdue documents
   */
  getOverdueDocuments: async (
    page = 0,
    size = 10
  ): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/incoming/overdue", {
      params: { page, size },
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get my assigned documents
   * @param page Page number
   * @param size Page size
   * @returns My assigned documents
   */
  getMyAssignedDocuments: async (
    page = 0,
    size = 10
  ): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/incoming/my-assigned", {
      params: { page, size },
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get department's documents
   * @param departmentId Department ID
   * @param page Page number
   * @param size Page size
   * @returns Department's documents
   */
  getDepartmentDocuments: async (
    departmentId: number | string,
    page = 0,
    size = 10
  ): Promise<{ content: IncomingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/incoming/by-department", {
      params: { departmentId, page, size },
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Bulk update document status
   * @param documentIds List of document IDs
   * @param status New status
   * @returns Success message
   */
  bulkUpdateStatus: async (
    documentIds: number[],
    status: string
  ): Promise<string> => {
    const response = await api.put("/documents/incoming/bulk-status", {
      documentIds,
      status,
    });
    return response.data;
  },

  /**
   * Export documents to Excel
   * @param filters Export filters
   * @returns File blob
   */
  exportToExcel: async (filters?: any): Promise<Blob> => {
    const response = await api.post("/documents/incoming/export", filters, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Import documents from Excel
   * @param file Excel file
   * @returns Import result
   */
  importFromExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/documents/incoming/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
