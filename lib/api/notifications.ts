import api from "./config"
import type { PageResponse } from "./types"

export interface NotificationDTO {
  id: number
  userId: number
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  relatedEntityId?: number
  relatedEntityType?: string
  link?: string
}

export const notificationsAPI = {
  /**
   * Get all notifications for current user
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of notifications
   */
  getAllNotifications: async (page = 0, size = 10): Promise<PageResponse<NotificationDTO>> => {
    const response = await api.get("/notifications", {
      params: { page, size },
    })
    return response.data
  },

  /**
   * Get unread notifications count
   * @returns Count of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread/count")
    return response.data.count
  },

  /**
   * Get notification by ID
   * @param id Notification ID
   * @returns Notification data
   */
  getNotificationById: async (id: string | number): Promise<NotificationDTO> => {
    const response = await api.get(`/notifications/${id}`)
    return response.data
  },

  /**
   * Mark notification as read
   * @param id Notification ID
   * @returns Updated notification data
   */
  markAsRead: async (id: string | number) => {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  },

  /**
   * Mark all notifications as read
   * @returns Success message
   */
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all")
    return response.data
  },

  /**
   * Delete notification
   * @param id Notification ID
   * @returns Success message
   */
  deleteNotification: async (id: string | number) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },

  /**
   * Delete all notifications
   * @returns Success message
   */
  deleteAllNotifications: async () => {
    const response = await api.delete("/notifications/all")
    return response.data
  },

  /**
   * Get notifications by type
   * @param type Notification type
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of notifications of the specified type
   */
  getNotificationsByType: async (type: string, page = 0, size = 10): Promise<PageResponse<NotificationDTO>> => {
    const response = await api.get(`/notifications/type/${type}`, {
      params: { page, size },
    })
    return response.data
  },
}
