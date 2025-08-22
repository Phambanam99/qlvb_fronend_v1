import api, { API_URL } from './config'
import type { PageResponse } from './types'
import type { PublicCategoryDTO, PublicDocumentDTO, PublicDocumentDetailDTO } from './public-types'

const BASE = '/public'

export const PublicPortalApi = {
  // Categories
  async getCategoryTree(): Promise<PublicCategoryDTO[]> {
    const res = await api.get(`${BASE}/categories/tree`)
    return res.data?.data ?? res.data
  },

  // Documents listing
  async listDocuments(params: { q?: string; page?: number; size?: number; year?: number; issuingAgency?: string } = {}): Promise<PageResponse<PublicDocumentDTO>> {
    const res = await api.get(`${BASE}/documents`, { params })
    return res.data?.data ?? res.data
  },

  async listByCategory(categoryId: number, params: { q?: string; page?: number; size?: number; year?: number; issuingAgency?: string } = {}): Promise<PageResponse<PublicDocumentDTO>> {
    const res = await api.get(`${BASE}/categories/${categoryId}/documents`, { params })
    return res.data?.data ?? res.data
  },

  async getDocumentDetail(id: number): Promise<PublicDocumentDetailDTO> {
    const res = await api.get(`${BASE}/documents/${id}`)
    const data = res.data?.data ?? res.data
    // Normalize attachment fields for frontend
    if (data?.attachments) {
      data.attachments = data.attachments.map((a: any) => ({
        id: a.id,
        originalFilename: a.originalFilename ?? a.filename,
        filename: a.filename ?? a.originalFilename,
        fileSize: a.fileSize ?? a.size,
        size: a.size ?? a.fileSize,
        contentType: a.contentType,
      }))
    }
    return data
  },

  async createCategory(input: { name: string; parentId?: number | null }): Promise<{ id:number; name:string; slug:string; parentId?: number|null }>{
    const res = await api.post(`${BASE}/categories`, input)
    return res.data?.data ?? res.data
  },

  // Upload public document (anonymous)
  async uploadDocument(input: {
    title: string
    files: File[]
    categoryIds?: number[]
    uploaderName?: string
    uploaderEmail?: string
  issuingAgency?: string
  documentNumber?: string
    onProgress?: (percent: number) => void
  }): Promise<PublicDocumentDetailDTO> {
    const form = new FormData()
    form.append('title', input.title)
  if (input.issuingAgency) form.append('issuingAgency', input.issuingAgency)
  if (input.documentNumber) form.append('documentNumber', input.documentNumber)
    input.categoryIds?.forEach(id => form.append('categoryIds', String(id)))
    if (input.uploaderName) form.append('uploaderName', input.uploaderName)
    if (input.uploaderEmail) form.append('uploaderEmail', input.uploaderEmail)
    input.files.forEach(f => form.append('files', f))

  const res = await api.post(`${BASE}/documents/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (input.onProgress && evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total)
          input.onProgress(percent)
        }
      },
    })
  return res.data?.data ?? res.data
  },

  // Attachment download URL helper
  //why dont using api?
  buildAttachmentDownloadUrl(documentId: number, attachmentId: number): string {
    const base = API_URL.replace(/\/?$/,'')
    return `${base}${BASE}/documents/${documentId}/attachments/${attachmentId}/download`
  },

  /**
   * Fetch attachment as Blob using axios (Authorization header will be added by api interceptor).
   * Use this when the endpoint requires auth and a plain <a href> cannot carry a token.
   */
  async fetchAttachmentBlob(documentId: number, attachmentId: number): Promise<Blob> {
    const res = await api.get(
      `${BASE}/documents/${documentId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    )
    return res.data as Blob
  },

  /**
   * Download attachment programmatically (handles token + filename from Content-Disposition).
   */
  async downloadAttachment(
    documentId: number,
    attachmentId: number,
    fileName?: string
  ): Promise<void> {
    const res = await api.get(
      `${BASE}/documents/${documentId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    )

    if (typeof window === 'undefined') return

    const blob = res.data as Blob
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    // Try to extract filename from Content-Disposition
    let suggested = fileName
    const cd = (res.headers as any)?.['content-disposition'] as string | undefined
    if (!suggested && cd) {
      const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
      const extracted = decodeURIComponent(match?.[1] || match?.[2] || '')
      if (extracted) suggested = extracted
    }
    a.download = suggested || `attachment-${attachmentId}`

    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  async getDownloadLogs(documentId: number, params: { page?: number; size?: number } = {}) {
    const res = await api.get(`${BASE}/documents/${documentId}/downloads`, { params })
    return res.data?.data ?? res.data
  },
}

export default PublicPortalApi
