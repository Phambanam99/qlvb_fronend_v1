import api from "./config";
import type { DocumentWorkflowDTO, DocumentHistoryDTO } from "./types";

export const workflowAPI = {
  /**
   * Get document status
   * @param documentId Document ID
   * @returns Document workflow status
   */
  getDocumentStatus: async (
    documentId: number | string
  ): Promise<DocumentWorkflowDTO> => {
    const response = await api.get(`/workflow/${documentId}/status`);
    console.log("response getDocumentStatus", response.data);
    return response.data;
  },
  /**
   * Get document workflow details
   * @param documentId Document ID
   * @returns Document workflow details
   */
  registerIncomingDocument: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/register`,
      workflowData
    );
    return response.status;
  },
  /**
   * Change document status
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  changeDocumentStatus: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/status`,
      workflowData
    );
    return response.data;
  },

  /**
   * Assign document to specialist
   * @param documentId Document ID
   * @param workflowData Workflow data with assignedToId
   * @returns Updated workflow status
   */
  assignToSpecialist: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.post(
      `/workflow/${documentId}/assign-specialist`,
      workflowData
    );
    return response.data;
  },

  /**
   * Start processing document
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  startProcessingDocument: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/start-processing`,
      workflowData
    );
    return response.data;
  },

  /**
   * Submit document to leadership
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  submitToLeadership: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/submit`,
      workflowData
    );
    return response.data;
  },

  /**
   * Forward document to leadership
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  forwardToLeadership: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/forward-to-leadership`,
      workflowData
    );
    return response.data;
  },

  /**
   * Approve document
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  approveDocument: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/approve`,
      workflowData
    );
    return response.data;
  },

  /**
   * Provide feedback on document
   * @param documentId Document ID
   * @param workflowData Workflow data with comments
   * @returns Updated workflow status
   */
  provideDocumentFeedback: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/provide-feedback`,
      workflowData
    );
    return response.data;
  },

  /**
   * Get document history
   * @param documentId Document ID
   * @returns Document history entries
   */
  getDocumentHistory: async (
    documentId: number | string
  ): Promise<DocumentHistoryDTO[]> => {
    const response = await api.get(`/workflow/${documentId}/history`);
    return response.data;
  },

  /**
   * Distribute document to departments
   * @param documentId Document ID
   * @param distributionData Distribution details
   * @returns Success message
   */
  distributeDocument: async (
    documentId: number | string,
    distributionData: any
  ) => {
    const response = await api.put(
      `/workflow/${documentId}/distribute`,
      distributionData
    );
    return response.data;
  },
  createFullDocument: async (data: any, file: File) => {
    const formData = new FormData();
    if (file) {
      formData.append("attachments", file);
    }
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    const response = await api.post("/workflow/full", formData, {
      headers: {
        "Content-Type": undefined, // Để Axios tự động xử lý với FormData
      },
    });
    return response.data;
  },

  /**
   * Tạo văn bản đi trả lời cho văn bản đến
   * @param incomingDocId ID của văn bản đến cần trả lời
   * @param documentData Dữ liệu văn bản và workflow
   * @param attachment Tệp đính kèm (nếu có)
   * @returns Kết quả tạo văn bản đi và thông tin liên quan
   */
  createResponseDocument: async (
    documentData: any,
    incomingDocId: number | string,
    attachment?: File | null
  ) => {
    const formData = new FormData();

    // Thêm dữ liệu văn bản đi và workflow
    formData.append(
      "data",
      new Blob([JSON.stringify(documentData)], { type: "application/json" })
    );

    // Thêm tệp đính kèm nếu có
    if (attachment) {
      formData.append("attachments", attachment);
    }

    const response = await api.post(
      `/incoming/${incomingDocId}/reply`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    return response.data;
  },
};
