/**
 * Tests for Server Actions
 * These tests verify the server-side data fetching and mutations
 */

import {
  fetchIncomingDocuments,
  fetchInternalDocuments,
  fetchExternalDocuments,
  getDocumentById,
  markDocumentAsRead,
  updateDocument,
  createDocument,
  deleteDocument,
} from '../incoming-documents.actions'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Next.js cache and revalidation functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => ({
      value: 'mock-token-123',
    })),
  })),
}))

describe('Incoming Documents Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('fetchIncomingDocuments', () => {
    it('should fetch documents successfully', async () => {
      const mockResponse = {
        data: {
          content: [
            { id: 1, title: 'Document 1' },
            { id: 2, title: 'Document 2' },
          ],
          totalPages: 1,
          totalElements: 2,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchIncomingDocuments({
        page: 0,
        size: 10,
      })

      expect(result.success).toBe(true)
      expect(result.content).toHaveLength(2)
      expect(result.totalPages).toBe(1)
      expect(result.totalElements).toBe(2)
    })

    it('should handle fetch errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      const result = await fetchIncomingDocuments({
        page: 0,
        size: 10,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch documents')
      expect(result.content).toEqual([])
    })

    it('should include search parameter when provided', async () => {
      const mockResponse = {
        data: {
          content: [],
          totalPages: 0,
          totalElements: 0,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await fetchIncomingDocuments({
        page: 0,
        size: 10,
        search: 'test search',
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const url = fetchCall[0]
      expect(url).toContain('search=test+search')
    })

    it('should include year and month parameters', async () => {
      const mockResponse = {
        data: {
          content: [],
          totalPages: 0,
          totalElements: 0,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await fetchIncomingDocuments({
        page: 0,
        size: 10,
        year: 2024,
        month: 5,
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const url = fetchCall[0]
      expect(url).toContain('year=2024')
      expect(url).toContain('month=5')
    })
  })

  describe('fetchInternalDocuments', () => {
    it('should fetch internal documents successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ id: 1, title: 'Internal Document 1' }],
          totalPages: 1,
          totalElements: 1,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchInternalDocuments({
        page: 0,
        size: 10,
      })

      expect(result.success).toBe(true)
      expect(result.content).toHaveLength(1)
      expect(result.content[0].title).toBe('Internal Document 1')
    })

    it('should use correct API endpoint for internal documents', async () => {
      const mockResponse = {
        data: { content: [], totalPages: 0, totalElements: 0 },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await fetchInternalDocuments({ page: 0, size: 10 })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const url = fetchCall[0]
      expect(url).toContain('/documents/incoming/internal')
    })
  })

  describe('fetchExternalDocuments', () => {
    it('should fetch external documents successfully', async () => {
      const mockResponse = {
        data: {
          content: [{ id: 1, title: 'External Document 1' }],
          totalPages: 1,
          totalElements: 1,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchExternalDocuments({
        page: 0,
        size: 10,
      })

      expect(result.success).toBe(true)
      expect(result.content).toHaveLength(1)
    })

    it('should include department filter', async () => {
      const mockResponse = {
        data: { content: [], totalPages: 0, totalElements: 0 },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await fetchExternalDocuments({
        page: 0,
        size: 10,
        departmentId: 5,
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const url = fetchCall[0]
      expect(url).toContain('departmentId=5')
    })
  })

  describe('getDocumentById', () => {
    it('should fetch document by ID successfully', async () => {
      const mockDocument = {
        id: 1,
        title: 'Test Document',
        documentNumber: 'DOC-001',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocument,
      })

      const result = await getDocumentById(1)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDocument)
    })

    it('should handle document not found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await getDocumentById(999)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch document')
    })
  })

  describe('markDocumentAsRead', () => {
    it('should mark document as read successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await markDocumentAsRead(1, 'INCOMING_INTERNAL')

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/documents/1/mark-read'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token-123',
          }),
        })
      )
    })

    it('should handle mark as read failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      const result = await markDocumentAsRead(1, 'INCOMING_INTERNAL')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to mark as read')
    })
  })

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const updatedData = { title: 'Updated Title' }
      const mockResponse = { id: 1, ...updatedData }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await updateDocument(1, updatedData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should handle update failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      const result = await updateDocument(1, { title: 'New Title' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to update document')
    })
  })

  describe('createDocument', () => {
    it('should create document successfully', async () => {
      const newDocument = {
        title: 'New Document',
        documentNumber: 'DOC-NEW',
      }
      const mockResponse = { id: 99, ...newDocument }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createDocument(newDocument)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should handle creation failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      const result = await createDocument({ title: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to create document')
    })
  })

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await deleteDocument(1)

      expect(result.success).toBe(true)
    })

    it('should handle deletion failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      })

      const result = await deleteDocument(1)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to delete document')
    })
  })

  describe('Authorization', () => {
    it('should include auth token in all requests', async () => {
      const mockResponse = {
        data: { content: [], totalPages: 0, totalElements: 0 },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await fetchIncomingDocuments({ page: 0, size: 10 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token-123',
          }),
        })
      )
    })
  })
})
