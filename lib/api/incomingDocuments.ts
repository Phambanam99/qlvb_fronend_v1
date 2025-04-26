import api from "./config"
import type { DocumentAttachmentDTO } from "./types"

export interface IncomingDocumentDTO {
  id: number
  title: string
  documentType: string
  documentNumber: string
  referenceNumber?: string
  issuingAuthority: string
  urgencyLevel: string
  securityLevel: string
  summary: string
  notes?: string
  signingDate: string
  receivedDate: string
  processingStatus: string
  closureRequest: boolean
  sendingDepartmentName: string
  emailSource?: string
  primaryProcessorId?: number
  created: string
  changed: string
  attachmentFilename?: string
  storageLocation?: string

  // Frontend compatibility fields
  number?: string
  sender?: string
  content?: string
  status?: string
  assignedTo?: string
  assignedUsers?: any[]
  deadline?: string
  managerOpinion?: string
  attachments?: DocumentAttachmentDTO[]
  relatedDocuments?: any[]
  responses?: any[]
}

export const incomingDocumentsAPI = {
  /**
   * Get all incoming documents
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of incoming documents
   */
  getAllDocuments: async (page = 0, size = 10): Promise<{ documents: IncomingDocumentDTO[] }> => {
    try {
      const response = await api.get("/documents/incoming", {
        params: { page, size },
      })

      // Map backend response to frontend expected format
      const documents = response.data.content.map((doc: IncomingDocumentDTO) => ({
        ...doc,
        number: doc.documentNumber,
        sender: doc.sendingDepartmentName,
        content: doc.summary,
        status: doc.processingStatus,
        // Add empty arrays for frontend compatibility
        attachments: [],
        relatedDocuments: [],
        responses: [],
      }))

      return { documents }
    } catch (error) {
      console.error("Error fetching incoming documents:", error)
      throw error
    }
  },

  /**
   * Get incoming document by ID
   * @param id Document ID
   * @returns Document data
   */
  getIncomingDocumentById: async (id: string | number): Promise<{ data: IncomingDocumentDTO }> => {
    try {
      const response = await api.get(`/documents/incoming/${id}`)

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
      }

      return { data: document }
    } catch (error) {
      console.error("Error fetching incoming document:", error)
      throw error
    }
  },

  /**
   * Create new incoming document
   * @param documentData Document data
   * @returns Created document data
   */
  createIncomingDocument: async (documentData: any) => {
    const response = await api.post("/documents/incoming", documentData)
    return response.data
  },

  /**
   * Update incoming document
   * @param id Document ID
   * @param documentData Document data to update
   * @returns Updated document data
   */
  updateIncomingDocument: async (id: string | number, documentData: any) => {
    const response = await api.put(`/documents/incoming/${id}`, documentData)
    return response.data
  },

  /**
   * Delete incoming document
   * @param id Document ID
   * @returns Success message
   */
  deleteIncomingDocument: async (id: string | number) => {
    const response = await api.delete(`/documents/incoming/${id}`)
    return response.data
  },

  /**
   * Upload document attachment
   * @param id Document ID
   * @param file File to upload
   * @returns Updated document data
   */
  uploadAttachment: async (id: string | number, file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post(`/documents/incoming/${id}/attachment`, formData, {
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

    const response = await api.post(`/documents/incoming/${id}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  /**
   * Search incoming documents
   * @param keyword Keyword to search for
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of matching documents
   */
  searchDocuments: async (keyword: string, page = 0, size = 10) => {
    const response = await api.get("/documents/incoming/search", {
      params: { keyword, page, size },
    })
    return response.data
  },
}
