import api from "./config";
import type { DocumentAttachmentDTO, ResponseDTO } from "./types";

export interface OutgoingDocumentDTO {
  id?: number;
  title: string;
  documentType: string;
  documentNumber: string;
  referenceNumber?: string;
  signerId?: number;
  signerName?: string;
  signingDate?: Date;
  draftingDepartment?: number;
  relatedDocuments?: string;
  storageLocation?: number;
  documentVolume?: string;
  emailAddress?: string;
  receivingDepartmentText?: string;
  created?: string;
  changed?: string;
  attachmentFilename?: string;
  summary?: string;

  // Frontend compatibility fields
  number?: string;
  recipient?: string;
  status?: string;
  sentDate?: string;
  creator?: any;
  approver?: any;
  submittedAt?: string;
  draftingDepartmentId?: string;
  attachments?: DocumentAttachmentDTO[];
  history?: any[];
}

export const outgoingDocumentsAPI = {
  /**
   * Get all outgoing documents
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of outgoing documents
   */
  getAllDocuments: async (
    page = 0,
    size = 10
  ): Promise<{ documents: OutgoingDocumentDTO[] }> => {
    try {
      const response = await api.get("/documents/outgoing", {
        params: { page, size },
      });

      // Map backend response to frontend expected format
      const documents = response.data.content.map(
        (doc: OutgoingDocumentDTO) => ({
          ...doc,
          number: doc.documentNumber?.toString(),
          recipient: doc.receivingDepartmentText || "N/A",
          sentDate: doc.signingDate,
          attachments: [],
          history: [],
        })
      );

      return { documents };
    } catch (error) {
      console.error("Error fetching outgoing documents:", error);
      throw error;
    }
  },

  /**
   * Get outgoing document by ID
   * @param id Document ID
   * @returns Document data
   */
  getOutgoingDocumentById: async (
    id: string | number
  ): Promise<{ data: OutgoingDocumentDTO }> => {
    try {
      const response = await api.get(`/documents/outgoing/${id}`);

      // Map backend response to frontend expected format
      const document = {
        ...response.data,
        number: response.data.documentNumber?.toString(),
        recipient: response.data.receivingDepartmentText || "N/A",
        sentDate: response.data.signingDate,
        attachments: [],
        history: [],
      };
      console.log(document);
      return { data: document };
    } catch (error) {
      console.error("Error fetching outgoing document:", error);
      throw error;
    }
  },

  /**
   * Create new outgoing document
   * @param documentData Document data
   * @returns Created document data
   */
  createOutgoingDocument: async (documentData: OutgoingDocumentDTO): Promise<OutgoingDocumentDTO> => {
    const response = await api.post("/documents/outgoing", documentData);
    return response.data;
  },

  /**
   * Update outgoing document
   * @param id Document ID
   * @param documentData Document data to update
   * @returns Updated document data
   */
  updateOutgoingDocument: async (
    id: string | number, 
    documentData: Partial<OutgoingDocumentDTO>
  ): Promise<OutgoingDocumentDTO> => {
    const response = await api.put(`/documents/outgoing/${id}`, documentData);
    return response.data;
  },

  /**
   * Delete outgoing document
   * @param id Document ID
   * @returns Success message
   */
  deleteOutgoingDocument: async (id: string | number): Promise<string> => {
    const response = await api.delete(`/documents/outgoing/${id}`);
    return response.data;
  },

  /**
   * Upload document attachment
   * @param id Document ID
   * @param file File to upload
   * @returns Updated document data
   */
  uploadAttachment: async (
    id: string | number, 
    file: File
  ): Promise<DocumentAttachmentDTO> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/documents/outgoing/${id}/attachment`,
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
   * Upload multiple document attachments
   * @param id Document ID
   * @param files Files to upload
   * @returns Success message
   */
  uploadMultipleAttachments: async (
    id: string | number, 
    files: File[]
  ): Promise<DocumentAttachmentDTO[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/documents/outgoing/${id}/attachments`,
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
   * Submit document for approval
   * @param id Document ID
   * @returns Updated document data
   */
  submitForApproval: async (id: string | number): Promise<string> => {
    const response = await api.put(`/workflow/${id}/submit`, {
      documentId: id,
      status: "pending_approval",
    });
    return response.data;
  },

  /**
   * Approve outgoing document
   * @param id Document ID
   * @param data Approval data
   * @returns Updated document data
   */
  approveOutgoingDocument: async (
    id: string | number,
    data: { comment?: string }
  ): Promise<string> => {
    const response = await api.put(`/workflow/${id}/approve`, {
      documentId: id,
      status: "approved",
      comments: data.comment,
    });
    return response.data;
  },

  /**
   * Reject outgoing document
   * @param id Document ID
   * @param data Rejection data
   * @returns Updated document data
   */
  rejectOutgoingDocument: async (
    id: string | number,
    data: { comment: string }
  ): Promise<string> => {
    const response = await api.put(`/workflow/${id}/provide-feedback`, {
      documentId: id,
      status: "rejected",
      comments: data.comment,
    });
    return response.data;
  },

  /**
   * Search outgoing documents
   * @param searchParams Search parameters
   * @returns Search results
   */
  searchOutgoingDocuments: async (searchParams: {
    query?: string;
    documentType?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: OutgoingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/outgoing/search", {
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
    const response = await api.get(`/documents/outgoing/${documentId}/attachments`);
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
      `/documents/outgoing/${documentId}/attachments/${attachmentId}`
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
      `/documents/outgoing/${documentId}/attachments/${attachmentId}/download`,
      { responseType: "blob" }
    );
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
  ): Promise<{ content: OutgoingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/outgoing/by-status", {
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
   * Get my created documents
   * @param page Page number
   * @param size Page size
   * @returns My created documents
   */
  getMyCreatedDocuments: async (
    page = 0,
    size = 10
  ): Promise<{ content: OutgoingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/outgoing/my-created", {
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
   * Get documents pending my approval
   * @param page Page number
   * @param size Page size
   * @returns Documents pending approval
   */
  getDocumentsPendingMyApproval: async (
    page = 0,
    size = 10
  ): Promise<{ content: OutgoingDocumentDTO[]; page: any }> => {
    const response = await api.get("/documents/outgoing/pending-my-approval", {
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
   * Get related documents
   * @param relatedDocumentIds Related document IDs as comma-separated string
   * @returns Related documents
   */
  getRelatedDocuments: async (
    relatedDocumentIds: string
  ): Promise<OutgoingDocumentDTO[]> => {
    const response = await api.get("/documents/outgoing/related", {
      params: { relatedDocuments: relatedDocumentIds },
    });
    return response.data;
  },

  /**
   * Get document statistics
   * @returns Document statistics
   */
  getDocumentStatistics: async (): Promise<any> => {
    const response = await api.get("/documents/outgoing/statistics");
    return response.data;
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
    const response = await api.put("/documents/outgoing/bulk-status", {
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
    const response = await api.post("/documents/outgoing/export", filters, {
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

    const response = await api.post("/documents/outgoing/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
