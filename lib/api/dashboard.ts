import api from "./config"
import type { ActivityLogDTO } from "./types"

export interface DashboardDTO {
  incomingDocumentCount: number
  outgoingDocumentCount: number
  workCaseCount: number
  pendingDocumentCount: number
  overdueDocumentCount: number
  documentCountsByType: Record<string, number>
  documentCountsByMonth: Record<string, number>
  processingTimeStatistics: Record<string, number>
  departmentPerformance: Record<string, any>
  topActiveUsers: UserActivityDTO[]
  recentDocuments: any[]
}

export interface UserActivityDTO {
  userId: number
  userName: string
  documentsProcessed: number
  averageProcessingTime: number
  currentAssignments: number
}

export const dashboardAPI = {
  /**
   * Get dashboard statistics
   * @returns Dashboard statistics
   */
  getDashboardStatistics: async (): Promise<DashboardDTO> => {
    const response = await api.get("/dashboard")
    return response.data
  },

  /**
   * Get recent activity logs
   * @param page Page number
   * @param size Page size
   * @returns Recent activity logs
   */
  getRecentActivities: async (page = 0, size = 20): Promise<ActivityLogDTO[]> => {
    const response = await api.get("/dashboard/recent-activities", {
      params: { page, size },
    })
    return response.data
  },

  /**
   * Get top active users
   * @param limit Number of users to return
   * @returns Top active users with statistics
   */
  getTopActiveUsers: async (limit = 10): Promise<UserActivityDTO[]> => {
    const response = await api.get("/dashboard/top-users", {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get document counts by type
   * @returns Document counts grouped by type
   */
  getDocumentCountsByType: async (): Promise<Record<string, number>> => {
    const response = await api.get("/dashboard/document-types")
    return response.data
  },

  /**
   * Get document counts by month
   * @param startDate Start date (ISO format)
   * @param endDate End date (ISO format)
   * @returns Document counts grouped by month
   */
  getDocumentCountsByMonth: async (startDate: string, endDate: string): Promise<Record<string, number>> => {
    const response = await api.get("/dashboard/document-counts-by-month", {
      params: {
        start: startDate,
        end: endDate,
      },
    })
    return response.data
  },

  /**
   * Get document processing time statistics
   * @returns Statistics about document processing times
   */
  getProcessingTimeStatistics: async (): Promise<Record<string, number>> => {
    const response = await api.get("/dashboard/processing-times")
    return response.data
  },

  /**
   * Get document volume report
   * @param startDate Start date (ISO format)
   * @param endDate End date (ISO format)
   * @returns Document volume report
   */
  getDocumentVolumeReport: async (startDate: string, endDate: string): Promise<Record<string, any>> => {
    const response = await api.get("/dashboard/reports/document-volume", {
      params: {
        start: startDate,
        end: endDate,
      },
    })
    return response.data
  },

  /**
   * Get department performance report
   * @returns Department performance metrics
   */
  getDepartmentPerformanceReport: async (): Promise<Record<string, any>> => {
    const response = await api.get("/dashboard/reports/department-performance")
    return response.data
  },
}
