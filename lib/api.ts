import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Use localStorage only in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async (params = {}) => {
    // params: { page, limit, search, department, role, status }
    const response = await api.get("/users", { params });
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post("/users", userData);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Incoming Documents API
export const incomingDocumentsAPI = {
  getAllDocuments: async (params = {}) => {
    // params: { page, limit, status, search, documentType, recipient, department, sort }
    const response = await api.get("/documents/incoming", { params });
    return response.data;
  },
  getDocumentById: async (id: string) => {
    const response = await api.get(`/documents/incoming/${id}`);
    return response.data;
  },
  createDocument: async (documentData: any) => {
    const response = await api.post("/documents/incoming", documentData);
    return response.data;
  },
  updateDocument: async (id: string, documentData: any) => {
    const response = await api.put(`/documents/incoming/${id}`, documentData);
    return response.data;
  },
  assignDocument: async (id: string, assignmentData: any) => {
    const response = await api.post(`/workflow/${id}/assign`, assignmentData);
    return response.data;
  },
  deleteDocument: async (id: string) => {
    const response = await api.delete(`/documents/incoming/${id}`);
    return response.data;
  },
  // Các API tìm kiếm nâng cao
  searchDocuments: async (keyword: string, pageable = {}) => {
    const response = await api.get(`/documents/incoming/search`, {
      params: { keyword, ...pageable },
    });
    return response.data;
  },
  findByUrgencyLevel: async (level: string, pageable = {}) => {
    const response = await api.get(`/documents/incoming/urgency-level`, {
      params: { level, ...pageable },
    });
    return response.data;
  },
  findByProcessingStatus: async (status: string, pageable = {}) => {
    const response = await api.get(`/documents/incoming/processing-status`, {
      params: { status, ...pageable },
    });
    return response.data;
  },
  findByDateRange: async (start: string, end: string, pageable = {}) => {
    const response = await api.get(`/documents/incoming/date-range`, {
      params: { start, end, ...pageable },
    });
    return response.data;
  },
  // API upload file
  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/documents/incoming/${id}/attachment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  uploadMultipleAttachments: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/documents/incoming/${id}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  downloadAttachment: async (id: string) => {
    const response = await api.get(`/documents/incoming/${id}/attachment`, {
      responseType: "blob",
    });
    return response.data;
  },
  // Tạo document với file đính kèm
  createDocumentWithAttachments: async (
    documentData: any,
    attachments: File[]
  ) => {
    const formData = new FormData();
    formData.append("document", JSON.stringify(documentData));

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post("/documents/incoming", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Document Responses API
export const documentResponsesAPI = {
  createResponse: async (responseData: any) => {
    const response = await api.post("/document-responses", responseData);
    return response.data;
  },
  getResponseById: async (id: string) => {
    const response = await api.get(`/document-responses/${id}`);
    return response.data;
  },
  updateResponse: async (id: string, responseData: any) => {
    const response = await api.put(`/document-responses/${id}`, responseData);
    return response.data;
  },
  deleteResponse: async (id: string) => {
    const response = await api.delete(`/document-responses/${id}`);
    return response.data;
  },
};

// Outgoing Documents API
export const outgoingDocumentsAPI = {
  getAllDocuments: async (params = {}) => {
    // params: { page, limit, status, search, documentType, recipient, department, sort }
    const response = await api.get("/documents/outgoing", { params });
    return response.data;
  },
  getDocumentById: async (id: string) => {
    const response = await api.get(`/documents/outgoing/${id}`);
    return response.data;
  },
  createDocument: async (documentData: any) => {
    const response = await api.post("/documents/outgoing", documentData);
    return response.data;
  },
  updateDocument: async (id: string, documentData: any) => {
    const response = await api.put(`/documents/outgoing/${id}`, documentData);
    return response.data;
  },
  deleteDocument: async (id: string) => {
    const response = await api.delete(`/documents/outgoing/${id}`);
    return response.data;
  },
  // API draft tài liệu đi
  createDraftDocument: async (documentData: any) => {
    const response = await api.post("/documents/outgoing/draft", documentData);
    return response.data;
  },
  // API tìm kiếm nâng cao
  searchDocuments: async (keyword: string, pageable = {}) => {
    const response = await api.get(`/documents/outgoing/search`, {
      params: { keyword, ...pageable },
    });
    return response.data;
  },
  findByDocumentType: async (type: string, pageable = {}) => {
    const response = await api.get(`/documents/outgoing/document-type`, {
      params: { type, ...pageable },
    });
    return response.data;
  },
  findByDateRange: async (start: string, end: string, pageable = {}) => {
    const response = await api.get(`/documents/outgoing/date-range`, {
      params: { start, end, ...pageable },
    });
    return response.data;
  },
  // API upload file
  uploadAttachment: async (id: string, file: File) => {
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
  downloadAttachment: async (id: string) => {
    const response = await api.get(`/documents/outgoing/${id}/attachment`, {
      responseType: "blob",
    });
    return response.data;
  },
  // Tạo document với file đính kèm
  createDocumentWithAttachments: async (
    documentData: any,
    attachments: File[]
  ) => {
    const formData = new FormData();
    formData.append("document", JSON.stringify(documentData));

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post("/documents/outgoing", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Work Plans API
export const workPlansAPI = {
  getAllWorkPlans: async (params = {}) => {
    // params: { page, limit, status, department, priority, search }
    const response = await api.get("/work-plans", { params });
    return response.data;
  },
  getWorkPlanById: async (id: string) => {
    const response = await api.get(`/work-plans/${id}`);
    return response.data;
  },
  createWorkPlan: async (workPlanData: any) => {
    const response = await api.post("/work-plans", workPlanData);
    return response.data;
  },
  updateWorkPlan: async (id: string, workPlanData: any) => {
    const response = await api.put(`/work-plans/${id}`, workPlanData);
    return response.data;
  },
  deleteWorkPlan: async (id: string) => {
    const response = await api.delete(`/work-plans/${id}`);
    return response.data;
  },
};

// Schedules API
export const schedulesAPI = {
  getAllSchedules: async (params = {}) => {
    // params: { page, limit, department, status, search }
    const response = await api.get("/schedules", { params });
    return response.data;
  },
  getScheduleById: async (id: string) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  getScheduleEvents: async (params: any) => {
    const response = await api.get("/schedules/events", { params });
    return response.data;
  },
  createSchedule: async (scheduleData: any) => {
    const response = await api.post("/schedules", scheduleData);
    return response.data;
  },
  updateSchedule: async (id: string, scheduleData: any) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },
  approveSchedule: async (id: string, approvalData: any) => {
    const response = await api.post(`/schedules/${id}/approve`, approvalData);
    return response.data;
  },
  deleteSchedule: async (id: string) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};

// Document Workflow API
export const documentWorkflowAPI = {
  // Lấy trạng thái và lịch sử xử lý
  getDocumentStatus: async (documentId: string) => {
    const response = await api.get(`/workflow/${documentId}/status`);
    return response.data;
  },
  getDocumentHistory: async (documentId: string) => {
    const response = await api.get(`/workflow/${documentId}/history`);
    return response.data;
  },

  // API cho Văn thư
  registerIncomingDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/register`,
      workflowData
    );
    return response.data;
  },
  publishOutgoingDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/publish`,
      workflowData
    );
    return response.data;
  },

  // API cho người phân phối văn bản
  distributeDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/distribute`,
      workflowData
    );
    return response.data;
  },

  // API cho Trưởng phòng
  assignToSpecialist: async (documentId: string, workflowData: any) => {
    const response = await api.post(
      `/workflow/${documentId}/assign-specialist`,
      workflowData
    );
    return response.data;
  },
  forwardToLeadership: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/forward-to-leadership`,
      workflowData
    );
    return response.data;
  },

  // API cho Chuyên viên
  startProcessingDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/start-processing`,
      workflowData
    );
    return response.data;
  },
  submitToLeadership: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/submit`,
      workflowData
    );
    return response.data;
  },

  // API cho Lãnh đạo
  startReviewingDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/start-reviewing`,
      workflowData
    );
    return response.data;
  },
  provideDocumentFeedback: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/provide-feedback`,
      workflowData
    );
    return response.data;
  },
  approveDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/approve`,
      workflowData
    );
    return response.data;
  },

  // API chung
  changeDocumentStatus: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/status`,
      workflowData
    );
    return response.data;
  },
  assignDocument: async (documentId: string, workflowData: any) => {
    const response = await api.post(
      `/workflow/${documentId}/assign`,
      workflowData
    );
    return response.data;
  },

  // API hoàn thành xử lý
  completeDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/complete`,
      workflowData
    );
    return response.data;
  },
  archiveDocument: async (documentId: string, workflowData: any) => {
    const response = await api.put(
      `/workflow/${documentId}/archive`,
      workflowData
    );
    return response.data;
  },
};

// Document Unified API (chung cho cả incoming và outgoing)
export const documentUnifiedAPI = {
  // API bình luận
  addComment: async (documentId: string, commentData: any) => {
    const response = await api.post(
      `/documents/unified/${documentId}/comments`,
      commentData
    );
    return response.data;
  },
  getComments: async (documentId: string) => {
    const response = await api.get(`/documents/unified/${documentId}/comments`);
    return response.data;
  },

  // API tags
  addTags: async (documentId: string, tags: string[]) => {
    const response = await api.post(
      `/documents/unified/${documentId}/tags`,
      tags
    );
    return response.data;
  },
  getTags: async (documentId: string) => {
    const response = await api.get(`/documents/unified/${documentId}/tags`);
    return response.data;
  },

  // API upload nhiều file dùng chung
  uploadMultipleAttachments: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/documents/unified/${id}/multiple-attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // API workflow dùng chung
  getDocumentStatus: async (documentId: string) => {
    const response = await api.get(
      `/documents/unified/${documentId}/workflow/status`
    );
    return response.data;
  },
  getDocumentHistory: async (documentId: string) => {
    const response = await api.get(
      `/documents/unified/${documentId}/workflow/history`
    );
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  // API báo cáo xử lý văn bản
  getDocumentProcessingReport: async (
    startDate: string,
    endDate: string,
    outputFormat: string = "pdf"
  ) => {
    const params = {
      startDate,
      endDate,
      outputFormat,
    };

    const response = await api.get("/reports/document-processing", {
      params,
      responseType: "blob",
    });

    return response.data;
  },

  // API báo cáo khối lượng văn bản
  getDocumentVolumeReport: async (start: string, end: string) => {
    const params = { start, end };
    const response = await api.get("/dashboard/reports/document-volume", {
      params,
    });
    return response.data;
  },
};

// OCR API
export const ocrAPI = {
  // API trích xuất thông tin từ văn bản scan
  extractFromScan: async (scanFile: File) => {
    const formData = new FormData();
    formData.append("file", scanFile);

    const response = await api.post(
      "/documents/incoming/extract-from-scan",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};

export default api;
