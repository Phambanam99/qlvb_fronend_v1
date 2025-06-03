// lib/api/internalDocumentApi.ts
import api from "./config";
import axios from "axios";

export const createInternalDocument = async (
  document: any,
  files?: File[],
  descriptions?: string[]
) => {
  const formData = new FormData();
  formData.append("document", JSON.stringify(document));
  if (files) {
    files.forEach((file, idx) => {
      formData.append("files", file);
    });
  }
  if (descriptions) {
    descriptions.forEach((desc) => {
      formData.append("descriptions", desc);
    });
  }

  const response = await api.post("/internal-documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const createInternalDocumentJson = async (document: any) => {
  const response = await api.post("/internal-documents/json", document);
  return response.data;
};

export const getDocumentById = async (id: number) => {
  const response = await api.get(`/internal-documents/${id}`);
  return response.data;
};

export const getSentDocuments = async (page = 0, size = 10) => {
  const response = await api.get("/internal-documents/sent", {
    params: { page, size },
  });
  return response.data;
};

export const getReceivedDocuments = async (page = 0, size = 10) => {
  const response = await api.get("/internal-documents/received", {
    params: { page, size },
  });
  return response.data;
};

export const getUnreadDocuments = async (page = 0, size = 10) => {
  const response = await api.get("/internal-documents/unread", {
    params: { page, size },
  });
  return response.data;
};

export const countUnreadDocuments = async () => {
  const response = await api.get("/internal-documents/unread/count");
  return response.data.unreadCount;
};

export const searchDocuments = async (keyword: string, page = 0, size = 10) => {
  const response = await api.get("/internal-documents/search", {
    params: { keyword, page, size },
  });
  return response.data;
};

export const advancedSearchDocuments = async (filters: {
  senderId?: number;
  recipientUserId?: number;
  recipientDepartmentId?: number;
  priority?: string;
  documentType?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) => {
  const response = await api.get("/internal-documents/search/advanced", {
    params: filters,
  });
  return response.data;
};

export const markDocumentAsRead = async (id: number) => {
  const response = await api.post(`/internal-documents/${id}/mark-read`);
  return response.data;
};

export const uploadAttachment = async (
  id: number,
  file: File,
  description?: string
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (description) formData.append("description", description);

  const response = await api.post(
    `/internal-documents/${id}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

export const uploadMultipleAttachments = async (
  id: number,
  files: File[],
  descriptions?: string[]
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  descriptions?.forEach((desc) => formData.append("descriptions", desc));

  const response = await api.post(
    `/internal-documents/${id}/attachments/multiple`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get("/internal-documents/statistics");
  return response.data;
};

export const getDocumentsByPriority = async (
  priority: string,
  page = 0,
  size = 10
) => {
  const response = await api.get(`/internal-documents/priority/${priority}`, {
    params: { page, size },
  });
  return response.data;
};

export const getDocumentsByDateRange = async (
  startDate: string,
  endDate: string,
  page = 0,
  size = 10
) => {
  const response = await api.get("/internal-documents/date-range", {
    params: { startDate, endDate, page, size },
  });
  return response.data;
};

export const getDocumentsByType = async (
  documentType: string,
  page = 0,
  size = 10
) => {
  const response = await api.get(`/internal-documents/type/${documentType}`, {
    params: { page, size },
  });
  return response.data;
};

export const replyToDocument = async (id: number, document: any) => {
  const response = await api.post(`/internal-documents/${id}/reply`, document);
  return response.data;
};

export const getInternalDocumentHistory = async (id: number) => {
  const response = await api.get(`/internal-documents/${id}/history`);
  return response.data;
};

export const getDocumentReplies = async (id: number) => {
  const response = await api.get(`/internal-documents/${id}/replies`);
  return response.data;
};

export const getDocumentThread = async (id: number) => {
  const response = await api.get(`/internal-documents/${id}/thread`);
  return response.data;
};

export const getDocumentStats = async (id: number) => {
  const response = await api.get(`/internal-documents/${id}/stats`);
  return response.data;
};

export const downloadAttachment = async (
  documentId: number,
  attachmentId: number
) => {
  const response = await api.get(
    `/internal-documents/${documentId}/attachments/${attachmentId}`,
    {
      responseType: "blob", // Important for file downloads
    }
  );
  return response;
};
