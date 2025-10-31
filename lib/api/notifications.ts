import api from "./config"
import type { PageResponse } from "./types"

export interface NotificationDTO {
  id: number
  userId: number
  title: string
  message: string
  content: string
  type: string
  read: boolean
  createdAt: string
  entityId?: number
  entityType?: string
  link?: string
  user?: {
    id: number
    name: string
    fullName: string
  }
}

// Backend notification format (what we actually receive via WebSocket)
export interface BackendNotification {
  id: number
  entityId: number
  entityType: string
  user: {
    id: number
    name: string
    fullName: string
  }
  type: string // This is NotificationType enum as string
  content: string
  createdAt: string
  read?: boolean
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
    return response.data.data
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

// ===== Notification Types for Internal Documents =====

export type InternalDocumentNotificationType =
  | 'INTERNAL_DOCUMENT_RECEIVED'
  | 'INTERNAL_DOCUMENT_READ'
  | 'INTERNAL_DOCUMENT_SENT'
  | 'INTERNAL_DOCUMENT_UPDATED'

export interface InternalDocumentNotification extends NotificationDTO {
  entityType: 'internal_document'
  type: InternalDocumentNotificationType
  entityId: number
  metadata?: {
    documentTitle?: string
    senderName?: string
    recipientName?: string
  }
}

// ===== Realtime Notifications WebSocket client =====

export interface RealTimeNotification {
  id: number
  type: string
  content: string
  entityId?: number
  entityType?: string
  createdAt: string
  read: boolean
  user?: {
    id: number
    name: string
    fullName: string
  }
  document?: {
    id: number
    title: string
  }
  metadata?: Record<string, unknown>
}

// Helper function to convert backend notification to frontend format
export function mapBackendNotification(backendNotification: BackendNotification): RealTimeNotification {
  return {
    id: backendNotification.id,
    type: backendNotification.type,
    content: backendNotification.content,
    entityId: backendNotification.entityId,
    entityType: backendNotification.entityType,
    createdAt: backendNotification.createdAt,
    read: backendNotification.read || false,
    user: backendNotification.user,
  }
}

import { Client, Frame } from '@stomp/stompjs'

type NotificationHandler = (notification: RealTimeNotification) => void
type InternalDocumentHandler = (notification: InternalDocumentNotification) => void

class NotificationsRealtimeClient {
  private stompClient: Client | null = null
  private handlers: Map<string, NotificationHandler[]> = new Map()
  private internalDocHandlers: Map<InternalDocumentNotificationType, InternalDocumentHandler[]> = new Map()
  private reconnectAttempts = 0
  private token: string | null = null
  private static instance: NotificationsRealtimeClient
  private wsPath: string
  private debugEnabled: boolean

  private constructor() {
  
    // Allow overriding WS path (default '/ws')
    this.wsPath = process.env.NEXT_PUBLIC_WS_PATH || '/ws'
    // Enable verbose STOMP debug logs with env flag
    this.debugEnabled = /^true$/i.test(process.env.NEXT_PUBLIC_WS_DEBUG || '')
  }

  public static getInstance() {
    if (!NotificationsRealtimeClient.instance) {
      NotificationsRealtimeClient.instance = new NotificationsRealtimeClient()
    }
    return NotificationsRealtimeClient.instance
  }

  public connect(token: string) {
    if (this.stompClient?.connected) {
      return
    }
    this.token = token

   // 1. Kiểm tra xem có đang ở trình duyệt không
    if (typeof window === 'undefined') {
        console.error("WebSocket connect() chỉ có thể được gọi từ trình duyệt.");
        return;
    }

    // 2. Lấy host và protocol động từ trình duyệt
    // window.location.host sẽ là "192.168.88.130" HOẶC "129.100.8.88"
    const host_ = window.location.host 
    //convert to port 8080 for backend 
    const host = host_.includes(':') ? host_.split(':')[0] + ':8080' : host_ + ':8080' 
    console.log('🏠 Detected host:', host)
    // window.location.protocol sẽ là "http:" (hoặc "https:" nếu bạn dùng SSL)
    const protocol = window.location.protocol

    // 3. Chuyển đổi http: -> ws: hoặc https: -> wss:
    const wsScheme = protocol === 'https:' ? 'wss:' : 'ws:'
    
    // 4. Lấy đường dẫn (path)
    const path = this.wsPath.startsWith('/') ? this.wsPath : `/${this.wsPath}`
    
    // 5. Tạo URL động hoàn chỉnh
    // Ví dụ: "ws://192.168.88.130/ws" hoặc "ws://129.100.8.88/ws"
    const brokerURL = `${wsScheme}//${host}${path}`
    console.log(' Constructed WebSocket URL:', brokerURL)
    // === KẾT THÚC PHẦN THAY ĐỔI ===

    if (this.debugEnabled) {
      console.log('[WS] Connecting to brokerURL:', brokerURL)
    }

    this.stompClient = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // debug: (str) => console.log('🔵 STOMP Debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Abort connect if handshake takes too long
      connectionTimeout: 10000,
    })

    // No SockJS fallback: enforcing native WebSocket only to avoid /ws/info

    this.stompClient.onConnect = (frame: Frame) => {
      console.log('✅ WebSocket connected successfully!', frame)
      this.reconnectAttempts = 0
      this.setupSubscriptions()
    }

    this.stompClient.onStompError = (frame: Frame) => {
      console.warn('WebSocket STOMP error:', frame)
      this.handleConnectionError()
    }

    this.stompClient.onWebSocketError = (error: any) => {
      console.warn('WebSocket connection error:', error)
      this.handleConnectionError()
    }

    this.stompClient.onWebSocketClose = (evt?: CloseEvent) => {
      if (evt) {
        console.warn('WebSocket closed:', {
          code: (evt as any).code,
          reason: (evt as any).reason,
          wasClean: (evt as any).wasClean,
        })
      } else {
        console.warn('WebSocket closed (no event details)')
      }
      this.handleConnectionError()
    }

    this.stompClient.onWebSocketError = (error) => {
      console.error('❌ WebSocket error:', error)
    }

    console.log('🚀 Activating STOMP client...')
    if (this.debugEnabled) {
      this.stompClient.debug = (str) => console.log('[STOMP]', str)
    }
    this.stompClient.activate()
  }

  public disconnect() {
    if (this.stompClient?.connected) {
      console.log('Disconnecting WebSocket...')
      this.stompClient.deactivate()
    }
    this.cleanup()
  }

  private setupSubscriptions() {
    if (!this.stompClient?.connected) {
      console.warn('❌ Cannot setup subscriptions - STOMP client not connected')
      return
    }

    console.log('📡 Setting up WebSocket subscriptions...')

    // Subscribe to personal notification queue
    this.stompClient.subscribe('/user/queue/notifications', (message) => {
      try {
        console.log('📨 Raw WebSocket message received!')
        console.log('📄 Message body:', message.body)
        console.log('📋 Message headers:', message.headers)

        const backendNotification: BackendNotification = JSON.parse(message.body)
        console.log('🔍 Parsed backend notification:', backendNotification)

        const notification: RealTimeNotification = mapBackendNotification(backendNotification)
        console.log('✅ Mapped frontend notification:', notification)

        this.handleMessage(notification)
      } catch (error) {
        console.error('❌ Error parsing notification:', error)
        console.error('📄 Raw message body:', message.body)
      }
    })

    console.log('✅ Successfully subscribed to /user/queue/notifications')
  }

  private handleMessage(notification: RealTimeNotification) {
    console.log('🔔 Received notification:', notification)

    // Handle general notification handlers
    const handlers = this.handlers.get(notification.type)
    if (handlers && handlers.length > 0) {
      console.log(`✅ Found ${handlers.length} handlers for type: ${notification.type}`)
      handlers.forEach(handler => handler(notification))
    } else {
      console.log(`⚠️ No handlers found for notification type: ${notification.type}`)
    }

    // Handle Internal Document specific notifications
    if (notification.entityType === 'internal_document') {
      console.log('📄 Processing as Internal Document notification')
      this.handleInternalDocumentNotification(notification as InternalDocumentNotification)
    }
  }

  private handleInternalDocumentNotification(notification: InternalDocumentNotification) {
    console.log('📋 Processing Internal Document notification:', notification.type)

    const handlers = this.internalDocHandlers.get(notification.type)
    if (handlers && handlers.length > 0) {
      console.log(`✅ Found ${handlers.length} internal doc handlers for type: ${notification.type}`)
      handlers.forEach(handler => handler(notification))
    } else {
      console.log(`⚠️ No internal doc handlers found for type: ${notification.type}`)
    }
  }

  private handleConnectionError() {
    this.cleanup()

    if (this.reconnectAttempts < 10 && this.token) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      console.log(`🔄 Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts + 1}/10)`)

      setTimeout(() => {
        this.reconnectAttempts++
        this.connect(this.token!)
      }, delay)
    } else {
      // console.warn('❌ Max reconnection attempts reached or no token available')
    }
  }

  private cleanup() {
    this.stompClient = null
  }

  // General notification handlers
  public onMessage(type: string, handler: NotificationHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, [])
    }
    this.handlers.get(type)?.push(handler)
  }

  public offMessage(type: string, handler: NotificationHandler) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      this.handlers.set(type, handlers.filter(h => h !== handler))
    }
  }

  // Internal Document specific handlers
  public onInternalDocumentNotification(
    type: InternalDocumentNotificationType,
    handler: InternalDocumentHandler
  ) {
    if (!this.internalDocHandlers.has(type)) {
      this.internalDocHandlers.set(type, [])
    }
    this.internalDocHandlers.get(type)?.push(handler)
  }

  public offInternalDocumentNotification(
    type: InternalDocumentNotificationType,
    handler: InternalDocumentHandler
  ) {
    const handlers = this.internalDocHandlers.get(type)
    if (handlers) {
      this.internalDocHandlers.set(type, handlers.filter(h => h !== handler))
    }
  }

  // Helper methods for Internal Document workflows
  public subscribeToInternalDocumentUpdates(callbacks: {
    onReceived?: (notification: InternalDocumentNotification) => void
    onRead?: (notification: InternalDocumentNotification) => void
    onSent?: (notification: InternalDocumentNotification) => void
    onUpdated?: (notification: InternalDocumentNotification) => void
  }) {
    if (callbacks.onReceived) {
      this.onInternalDocumentNotification('INTERNAL_DOCUMENT_RECEIVED', callbacks.onReceived)
    }
    if (callbacks.onRead) {
      this.onInternalDocumentNotification('INTERNAL_DOCUMENT_READ', callbacks.onRead)
    }
    if (callbacks.onSent) {
      this.onInternalDocumentNotification('INTERNAL_DOCUMENT_SENT', callbacks.onSent)
    }
    if (callbacks.onUpdated) {
      this.onInternalDocumentNotification('INTERNAL_DOCUMENT_UPDATED', callbacks.onUpdated)
    }
  }

  // For debugging/testing - simulate receiving a notification
  public simulateNotification(notification: InternalDocumentNotification) {
    const handlers = this.internalDocHandlers.get(notification.type)
    if (handlers) {
      handlers.forEach(handler => handler(notification))
    }
  }

  public get isConnected() {
    return this.stompClient?.connected || false
  }
}

export const notificationsRealtime = NotificationsRealtimeClient.getInstance();

