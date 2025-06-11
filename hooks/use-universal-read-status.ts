"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  DocumentType, 
  documentReadStatusAPI,
  BatchReadStatusResponse 
} from "@/lib/api/documentReadStatus";

interface ReadStatusState {
  [key: string]: boolean; // documentId_documentType -> isRead
}

type UnreadCounts = {
  [key in DocumentType]?: number;
}

// Global state for read status across all document types
let globalReadStatus: ReadStatusState = {};
let globalUnreadCounts: UnreadCounts = {};
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

const getKey = (documentId: number, documentType: DocumentType): string => {
  return `${documentId}_${documentType}`;
};

export const useUniversalReadStatus = () => {
  const [, forceUpdate] = useState({});

  const subscribe = useCallback(() => {
    const callback = () => forceUpdate({});
    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  }, []);

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  /**
   * Mark a document as read
   */
  const markAsRead = useCallback(async (documentId: number, documentType: DocumentType) => {
    try {
      await documentReadStatusAPI.markAsRead(documentId, documentType);
      
      const key = getKey(documentId, documentType);
      globalReadStatus[key] = true;
      
      // Update unread count
      if (globalUnreadCounts[documentType] !== undefined && globalUnreadCounts[documentType]! > 0) {
        globalUnreadCounts[documentType] = globalUnreadCounts[documentType]! - 1;
      }
      
      notifySubscribers();
      
      // Trigger storage event for cross-tab synchronization
      if (typeof window !== "undefined") {
        localStorage.setItem("universalReadStatusUpdate", JSON.stringify({
          documentId,
          documentType,
          isRead: true,
          timestamp: Date.now()
        }));
        setTimeout(() => {
          localStorage.removeItem("universalReadStatusUpdate");
        }, 100);
      }
    } catch (error) {
      console.error("Error marking document as read:", error);
      throw error;
    }
  }, []);

  /**
   * Mark a document as unread
   */
  const markAsUnread = useCallback(async (documentId: number, documentType: DocumentType) => {
    try {
      await documentReadStatusAPI.markAsUnread(documentId, documentType);
      
      const key = getKey(documentId, documentType);
      globalReadStatus[key] = false;
      
      // Update unread count
      if (globalUnreadCounts[documentType] !== undefined) {
        globalUnreadCounts[documentType] = globalUnreadCounts[documentType]! + 1;
      }
      
      notifySubscribers();
      
      // Trigger storage event for cross-tab synchronization
      if (typeof window !== "undefined") {
        localStorage.setItem("universalReadStatusUpdate", JSON.stringify({
          documentId,
          documentType,
          isRead: false,
          timestamp: Date.now()
        }));
        setTimeout(() => {
          localStorage.removeItem("universalReadStatusUpdate");
        }, 100);
      }
    } catch (error) {
      console.error("Error marking document as unread:", error);
      throw error;
    }
  }, []);

  /**
   * Get read status for a document
   */
  const getReadStatus = useCallback((documentId: number, documentType: DocumentType): boolean => {
    const key = getKey(documentId, documentType);
    return globalReadStatus[key] ?? false;
  }, []);

  /**
   * Load read status for multiple documents
   */
  const loadBatchReadStatus = useCallback(async (documentIds: number[], documentType: DocumentType) => {
    try {
      const response = await documentReadStatusAPI.getBatchReadStatus(documentIds, documentType);
      
      // Update global state
      Object.entries(response).forEach(([docId, isRead]) => {
        const key = getKey(parseInt(docId), documentType);
        globalReadStatus[key] = isRead;
      });
      
      notifySubscribers();
    } catch (error) {
      console.error("Error loading batch read status:", error);
      throw error;
    }
  }, []);

  /**
   * Load unread count for a document type
   */
  const loadUnreadCount = useCallback(async (documentType: DocumentType) => {
    try {
      const response = await documentReadStatusAPI.countUnreadDocuments(documentType);
      globalUnreadCounts[documentType] = response.unreadCount;
      notifySubscribers();
    } catch (error) {
      console.error("Error loading unread count:", error);
      throw error;
    }
  }, []);

  /**
   * Get unread count for a document type
   */
  const getUnreadCount = useCallback((documentType: DocumentType): number => {
    return globalUnreadCounts[documentType] ?? 0;
  }, []);

  /**
   * Toggle read status
   */
  const toggleReadStatus = useCallback(async (documentId: number, documentType: DocumentType) => {
    const currentStatus = getReadStatus(documentId, documentType);
    if (currentStatus) {
      await markAsUnread(documentId, documentType);
    } else {
      await markAsRead(documentId, documentType);
    }
  }, [getReadStatus, markAsRead, markAsUnread]);

  /**
   * Clear all read status (useful for logout)
   */
  const clearAllReadStatus = useCallback(() => {
    globalReadStatus = {};
    globalUnreadCounts = {};
    notifySubscribers();
  }, []);

  return {
    markAsRead,
    markAsUnread,
    getReadStatus,
    loadBatchReadStatus,
    loadUnreadCount,
    getUnreadCount,
    toggleReadStatus,
    clearAllReadStatus,
  };
};
