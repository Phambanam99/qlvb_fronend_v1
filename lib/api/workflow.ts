import api from "./config";
import type { DocumentWorkflowDTO, DocumentHistoryDTO, ResponseDTO } from "./types";

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
  leaderStartReviewing: async (
    documentId: number | string,
    comment: string
  ): Promise<string> => {
    const response = await api.put(
      `/workflow/${documentId}/start-reviewing`,
      comment
    );
    return response.data;
  },

  registerIncomingDocument: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<string> => {
    const response = await api.put(
      `/workflow/${documentId}/register`,
      workflowData
    );
    return response.data;
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
  ): Promise<string> => {
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
    workflowData: DocumentWorkflowDTO & { departmentId?: number | string }
  ): Promise<string> => {
    // First check if the current department has any child departments
    try {
      if (workflowData.departmentId) {
        const childDepartments = await workflowAPI.getChildDepartments(
          workflowData.departmentId
        );

        // If there are child departments, we should distribute to them instead
        if (Array.isArray(childDepartments) && childDepartments.length > 0) {
          throw new Error(
            "Đơn vị này có đơn vị con. Vui lòng phân phối văn bản cho đơn vị con trước."
          );
        }
      }

      // If no child departments, proceed with the assignment
      const response = await api.post(
        `/workflow/${documentId}/assign-specialist`,
        workflowData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
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
  ): Promise<string> => {
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
  ): Promise<string> => {
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
  ): Promise<string> => {
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
  ): Promise<string> => {
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
  ): Promise<string> => {
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
   * @param distributionData Distribution data
   * @returns Distribution result
   */
  distributeDocument: async (
    documentId: number | string,
    distributionData: {
      primaryDepartmentId?: number;
      collaboratingDepartmentIds?: number[];
      comments?: string;
    }
  ): Promise<any> => {
    const response = await api.put(
      `/workflow/${documentId}/distribute`,
      distributionData
    );
    return response.data;
  },

  /**
   * Get document departments
   * @param documentId Document ID
   * @returns List of departments assigned to the document
   */
  getDocumentDepartments: async (
    documentId: number | string
  ): Promise<any[]> => {
    const response = await api.get(`/workflow/${documentId}/departments`);
    return response.data;
  },

  /**
   * Start header department reviewing
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  startHeaderDepartmentReviewing: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<string> => {
    const response = await api.put(
      `/workflow/${documentId}/header-department-review`,
      workflowData
    );
    return response.data;
  },

  /**
   * Department header provides feedback
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  commentHeaderDepartment: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<string> => {
    const response = await api.put(
      `/workflow/${documentId}/header-department-comment`,
      workflowData
    );
    return response.data;
  },

  /**
   * Department header approves document
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  approveHeaderDepartment: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<string> => {
    const response = await api.put(
      `/workflow/${documentId}/header-department-approve`,
      workflowData
    );
    return response.data;
  },

  /**
   * Provide feedback with attachment
   * @param documentId Document ID
   * @param comments Comments
   * @param file Attachment file
   * @returns Updated workflow status
   */
  provideDocumentFeedbackWithAttachment: async (
    documentId: number | string,
    comments: string,
    file: File
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("comments", comments);
    formData.append("file", file);

    const response = await api.put(
      `/workflow/${documentId}/provide-feedback-with-attachment`,
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
   * Leader feedback with attachment
   * @param documentId Document ID
   * @param comments Comments
   * @param file Attachment file (optional)
   * @returns Updated workflow status
   */
  leaderFeedbackWithAttachment: async (
    documentId: number | string,
    comments: string,
    file?: File
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("comments", comments);
    if (file) {
      formData.append("file", file);
    }

    const response = await api.put(
      `/workflow/${documentId}/leader-feedback-with-attachment`,
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
   * Department header feedback with attachment
   * @param documentId Document ID
   * @param comments Comments
   * @param file Attachment file (optional)
   * @returns Updated workflow status
   */
  headerFeedbackWithAttachment: async (
    documentId: number | string,
    comments: string,
    file?: File
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("comments", comments);
    if (file) {
      formData.append("file", file);
    }

    const response = await api.put(
      `/workflow/${documentId}/header-feedback-with-attachment`,
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
   * Reject document for format correction
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  rejectForFormatCorrection: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<any> => {
    const response = await api.put(
      `/workflow/${documentId}/format-correction`,
      workflowData
    );
    return response.data;
  },

  /**
   * Reject document for format correction with attachment
   * @param documentId Document ID
   * @param comments Comments
   * @param file Attachment file
   * @returns Updated workflow status
   */
  rejectForFormatCorrectionWithAttachment: async (
    documentId: number | string,
    comments: string,
    file: File
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("comments", comments);
    formData.append("file", file);

    const response = await api.put(
      `/workflow/${documentId}/format-correction-with-attachment`,
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
   * Resubmit after format correction
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  resubmitAfterFormatCorrection: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<any> => {
    const response = await api.put(
      `/workflow/${documentId}/resubmit-after-correction`,
      workflowData
    );
    return response.data;
  },

  /**
   * Publish outgoing document
   * @param documentId Document ID
   * @param workflowData Workflow data
   * @returns Updated workflow status
   */
  publishOutgoingDocument: async (
    documentId: number | string,
    workflowData: DocumentWorkflowDTO
  ): Promise<string> => {
    const response = await api.put(
      `/workflow/${documentId}/publish`,
      workflowData
    );
    return response.data;
  },

  /**
   * Create full incoming document with workflow
   * @param documentData Full document data
   * @param file Attachment file
   * @returns Created document info
   */
  createFullIncomingDocument: async (
    documentData: any,
    file?: File
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(documentData));
    if (file) {
      formData.append("attachments", file);
    }

    const response = await api.post("/workflow/full", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Create full incoming document with multiple attachments
   * @param documentData Full document data
   * @param files Multiple attachment files
   * @returns Created document info
   */
  createFullIncomingDocumentWithMultipleAttachments: async (
    documentData: any,
    files?: File[]
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(documentData));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.post("/workflow/full-multi-attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Create response document
   * @param incomingDocId Incoming document ID
   * @param documentData Document data
   * @param file Attachment file
   * @returns Created response document
   */
  createResponseDocument: async (
    incomingDocId: number | string,
    documentData: any,
    file?: File
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(documentData));
    if (file) {
      formData.append("attachments", file);
    }

    const response = await api.post(
      `/workflow/incoming/${incomingDocId}/reply`,
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
   * Create response document with multiple attachments
   * @param incomingDocId Incoming document ID
   * @param documentData Document data
   * @param files Multiple attachment files
   * @returns Created response document
   */
  createResponseDocumentWithMultipleAttachments: async (
    incomingDocId: number | string,
    documentData: any,
    files?: File[]
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(documentData));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.post(
      `/workflow/incoming/${incomingDocId}/reply-multi-attachments`,
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
   * Update outgoing document workflow
   * @param documentId Document ID
   * @param documentData Document data
   * @param file Attachment file
   * @returns Updated document info
   */
  updateOutgoingDocumentWorkflow: async (
    documentId: number | string,
    documentData: any,
    file?: File
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(documentData));
    if (file) {
      formData.append("attachment", file);
    }

    const response = await api.put(
      `/workflow/${documentId}/update-outgoing`,
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
   * Create standalone outgoing document
   * @param documentData Document data
   * @param files Multiple attachment files
   * @returns Created document info
   */
  createStandaloneOutgoingDocument: async (
    documentData: any,
    files?: File[]
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(documentData));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await api.post("/workflow/standalone-outgoing", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get child departments
   * @param departmentId Department ID
   * @returns List of child departments
   */
  getChildDepartments: async (departmentId: number | string): Promise<any[]> => {
    const response = await api.get(`/workflow/departments/${departmentId}/children`);
    return response.data;
  },

  /**
   * Get child departments commanders
   * @param departmentId Department ID
   * @returns List of commanders
   */
  getChildDepartmentsCommanders: async (
    departmentId: number | string
  ): Promise<any[]> => {
    const response = await api.get(
      `/workflow/departments/${departmentId}/children/commanders`
    );
    return response.data;
  },

  /**
   * Get child departments users
   * @param departmentId Department ID
   * @returns List of users
   */
  getChildDepartmentsUsers: async (
    departmentId: number | string
  ): Promise<any[]> => {
    const response = await api.get(
      `/workflow/departments/${departmentId}/children/users`
    );
    return response.data;
  },

  /**
   * Get latest document activities by user
   * @param userId User ID
   * @returns Latest document activities
   */
  getLatestDocumentActivitiesByUser: async (
    userId: number | string
  ): Promise<any[]> => {
    const response = await api.get(`/workflow/users/${userId}/latest-activities`);
    return response.data;
  },

  /**
   * Get my latest document activities
   * @returns Latest document activities for current user
   */
  getMyLatestDocumentActivities: async (): Promise<any[]> => {
    const response = await api.get("/workflow/my-latest-activities");
    return response.data;
  },

  /**
   * Download attachment from document history
   * @param historyId History ID
   * @returns File blob
   */
  downloadAttachment: async (historyId: number | string): Promise<Blob> => {
    const response = await api.get(`/workflow/history/${historyId}/attachment`, {
      responseType: "blob",
    });
    return response.data;
  },
};
