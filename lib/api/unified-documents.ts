import api from "./config"
import type { PageResponse, DocumentAttachmentDTO, DocumentCommentDTO } from "./types"

export interface UnifiedDocumentDTO {
  id: number
  number: string
  referenceNumber?: string
  referenceDate?: string
  issuingAgency?: string
  subject: string
  processingDepartmentId?: string
  processingDepartment?: string
  receivedDate?: string
  receivedTime?: string
  securityLevel?: string
  urgencyLevel?: string
  status: string
  hasAttachment: boolean
  attachments?: DocumentAttachmentDTO[]
  assignedUsers?: string[]
  deadline?: string
  requiresResponse?: boolean
  comments?: DocumentCommentDTO[]
  documentType: string
  content?: string
  includesEnclosure?: boolean
  primaryHandler?: boolean
  legalDocument?: boolean
  confidentialReturn?: boolean
}

export const unifiedDocumentsAPI = {
  /**
   * Get all documents
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of all documents
   */
  getAllDocuments: async (page = 0, size = 10): Promise<PageResponse<UnifiedDocumentDTO>> => {
    const response = await api.get("/documents/unified", {
      params: { page, size },
    })
    return response.data
  },

  /**
   * Get document by ID
   * @param id Document ID
   * @returns Document data
   */
  getDocumentById: async (id: string | number): Promise<UnifiedDocumentDTO> => {
    const response = await api.get(`/documents/unified/${id}`)
    return response.data
  },

  /**
   * Get document statistics
   * @returns Document counts by type and status
   */
  getDocumentStats: async () => {
    const response = await api.get("/documents/unified/stats")
    return response.data
  },

  /**
   * Search documents
   * @param keyword Keyword to search for
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of matching documents
   */
  searchDocuments: async (keyword: string, page = 0, size = 10) => {
    const response = await api.get("/documents/unified/search", {
      params: { keyword, page, size },
    })
    return response.data
  },

  /**
   * Find documents by date range
   * @param startDate Start date (ISO format)
   * @param endDate End date (ISO format)
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of documents within the date range
   */
  findByDateRange: async (startDate: string, endDate: string, page = 0, size = 10) => {
    const response = await api.get("/documents/unified/by-date", {
      params: {
        start: startDate,
        end: endDate,
        page,
        size,
      },
    })
    return response.data
  },

  /**
   * Upload document attachment
   * @param id Document ID
   * @param file File to upload
   * @returns Success message
   */
  uploadAttachment: async (id: string | number, file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post(`/documents/unified/${id}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  /**
   * Upload multiple document attachments
   * @param id Document ID
   * @param files Files to upload
   * @returns Success message
   */
  uploadMultipleAttachments: async (id: string | number, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await api.post(`/documents/unified/${id}/multiple-attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  /**
   * Get document comments
   * @param documentId Document ID
   * @param type Comment type filter (optional)
   * @returns List of comments
   */
  getDocumentComments: async (documentId: string | number, type?: string) => {
    const response = await api.get(`/documents/unified/${documentId}/comments`, {
      params: { type },
    })
    return response.data
  },

  /**
   * Add comment to document
   * @param documentId Document ID
   * @param commentData Comment data
   * @returns Created comment data
   */
  addDocumentComment: async (documentId: string | number, commentData: any) => {
    const response = await api.post(`/documents/unified/${documentId}/comments`, commentData)
    return response.data
  },

  /**
   * Delete document comment
   * @param commentId Comment ID
   * @returns Success message
   */
  deleteDocumentComment: async (commentId: string | number) => {
    const response = await api.delete(`/documents/unified/comments/${commentId}`)
    return response.data
  },

  /**
   * Get document workflow status
   * @param documentId Document ID
   * @returns Document workflow status
   */
  getDocumentWorkflowStatus: async (documentId: string | number) => {
    const response = await api.get(`/documents/unified/${documentId}/workflow/status`)
    return response.data
  },

  /**
   * Change document workflow status
   * @param documentId Document ID
   * @param statusData Status change details
   * @returns Updated status data
   */
  changeDocumentWorkflowStatus: async (documentId: string | number, statusData: any) => {
    const response = await api.post(`/documents/unified/${documentId}/workflow/status`, statusData)
    return response.data
  },

  /**
   * Assign document to user
   * @param documentId Document ID
   * @param assignmentData Assignment details
   * @returns Updated assignment data
   */
  assignDocumentToUser: async (documentId: string | number, assignmentData: any) => {
    const response = await api.post(`/documents/unified/${documentId}/workflow/assign`, assignmentData)
    return response.data
  },

  /**
   * Get document workflow history
   * @param documentId Document ID
   * @returns Document workflow history
   */
  getDocumentWorkflowHistory: async (documentId: string | number) => {
    const response = await api.get(`/documents/unified/${documentId}/workflow/history`)
    return response.data
  },
}
