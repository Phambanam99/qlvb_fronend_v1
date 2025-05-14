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

// ===== Realtime Notifications WebSocket client =====

export interface RealTimeNotification {
  id: number;
  type: string;
  content: string;
  document?: {
    id: number;
    title: string;
  };
  createdAt: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

type NotificationHandler = (notification: RealTimeNotification) => void;

class NotificationsRealtimeClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, NotificationHandler[]> = new Map();
  private reconnectAttempts = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private token: string | null = null;
  private wsUrl: string;
  private static instance: NotificationsRealtimeClient;

  private constructor() {
    // Lấy URL từ biến môi trường, hoặc mặc định ws://localhost:4000/notifications/ws
    this.wsUrl =
      (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL) ||
      (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
        ? `wss://${process.env.NEXT_PUBLIC_API_URL}/notifications/ws`
        : 'ws://localhost:4000/notifications/ws');
  }

  public static getInstance() {
    if (!NotificationsRealtimeClient.instance) {
      NotificationsRealtimeClient.instance = new NotificationsRealtimeClient();
    }
    return NotificationsRealtimeClient.instance;
  }

  public connect(token: string) {
    if (this.ws) return;
    this.token = token;
    this.ws = new window.WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.sendAuth(token);
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'HEARTBEAT') return;
        this.handleMessage(message);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing notification message:', error);
      }
    };

    this.ws.onclose = (event) => {
      this.cleanup();
      if (!event.wasClean && this.reconnectAttempts < 5) {
        setTimeout(() => this.connect(token), this.getReconnectDelay());
        this.reconnectAttempts++;
      }
    };
  }

  public disconnect() {
    this.ws?.close();
    this.cleanup();
  }

  public onMessage(type: string, handler: NotificationHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)?.push(handler);
  }

  public offMessage(type: string, handler: NotificationHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      this.handlers.set(
        type,
        handlers.filter((h) => h !== handler)
      );
    }
  }

  private sendAuth(token: string) {
    this.ws?.send(
      JSON.stringify({
        type: 'AUTH',
        payload: token,
      })
    );
  }

  private handleMessage(message: any) {
    const handlers = this.handlers.get(message.type);
    handlers?.forEach((handler) => handler(message));
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.ws?.send(JSON.stringify({ type: 'HEARTBEAT' }));
    }, 30000);
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.ws = null;
  }

  private getReconnectDelay() {
    return Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
  }
}

export const notificationsRealtime = NotificationsRealtimeClient.getInstance();

