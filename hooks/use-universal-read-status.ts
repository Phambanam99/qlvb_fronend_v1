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
let loadingDocuments = new Set<string>(); // Track loading documents to prevent duplicates
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
      throw error;
    }
  }, []);

  /**
   * Get read status for a document
   */
  const getReadStatus = useCallback((documentId: number, documentType: DocumentType): boolean | undefined => {
    const key = getKey(documentId, documentType);
    return key in globalReadStatus ? globalReadStatus[key] : undefined;
  }, []);

  /**
   * Check if read status has been loaded for a document
   */
  const hasReadStatus = useCallback((documentId: number, documentType: DocumentType): boolean => {
    const key = getKey(documentId, documentType);
    return key in globalReadStatus;
  }, []);

  /**
   * Load read status for multiple documents using individual API calls
   */
  const loadBatchReadStatus = useCallback(async (
    documentIds: number[],
    documentType: DocumentType,
    options?: { concurrency?: number; notifyIntervalMs?: number }
  ) => {
    try {
      if (!Array.isArray(documentIds) || documentIds.length === 0) return;
      if (!documentType) return;

      const loadingKey = `${documentIds.sort().join(',')}_${documentType}`;
      if (loadingDocuments.has(loadingKey)) return; // prevent duplicate concurrent loads

      const documentsToLoad = documentIds.filter(
        (id) => !(getKey(id, documentType) in globalReadStatus)
      );
      if (documentsToLoad.length === 0) return;

      loadingDocuments.add(loadingKey);

      // --- Preferred path: use backend batch endpoint (single network call) ---
      try {
        const batchResult: BatchReadStatusResponse = await documentReadStatusAPI.getBatchReadStatus(
          documentsToLoad,
          documentType
        );
        let changed = false;
        Object.entries(batchResult || {}).forEach(([idStr, isRead]) => {
          const idNum = Number(idStr);
          if (Number.isNaN(idNum)) return;
          const key = getKey(idNum, documentType);
          if (globalReadStatus[key] !== isRead) {
            globalReadStatus[key] = !!isRead;
            changed = true;
          }
        });
        if (changed) notifySubscribers();
        loadingDocuments.delete(loadingKey);
        return; // success path finished
      } catch (batchError) {
        // Fallback to legacy per-document loading if batch fails (older backend)
        console.warn("⚠️ Batch read status failed, falling back to individual calls:", batchError);
      }

      // --- Fallback path: previous concurrency-based implementation ---
      const concurrency = options?.concurrency ?? 6;
      const notifyIntervalMs = options?.notifyIntervalMs ?? 40;
      let pendingNotify: number | null = null;
      const scheduleNotify = () => {
        if (pendingNotify != null) return;
        pendingNotify = window.setTimeout(() => {
          pendingNotify = null;
          notifySubscribers();
        }, notifyIntervalMs);
      };

      let index = 0;
      const worker = async () => {
        while (index < documentsToLoad.length) {
          const current = documentsToLoad[index++];
          try {
            const resp = await documentReadStatusAPI.isDocumentRead(
              current,
              documentType
            );
            const isRead = resp.data?.isRead || false;
            const key = getKey(current, documentType);
            if (globalReadStatus[key] !== isRead) {
              globalReadStatus[key] = isRead;
              scheduleNotify();
            }
          } catch (e) {
            const key = getKey(current, documentType);
            if (!(key in globalReadStatus)) {
              globalReadStatus[key] = false; // default
              scheduleNotify();
            }
          }
        }
      };

      const workers: Promise<void>[] = [];
      for (let i = 0; i < Math.min(concurrency, documentsToLoad.length); i++) {
        workers.push(worker());
      }
      await Promise.all(workers);

      if (pendingNotify != null) {
        clearTimeout(pendingNotify);
        pendingNotify = null;
      }
      notifySubscribers();
      loadingDocuments.delete(loadingKey);
    } catch (error) {
      loadingDocuments.delete(`${documentIds.sort().join(',')}_${documentType}`);
      console.error("❌ loadBatchReadStatus error:", error);
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
    loadingDocuments.clear(); // Clear loading state too
    notifySubscribers();
  }, []);

  /**
   * Seed read statuses from an existing documents array to avoid redundant API calls.
   * Each item should minimally have: { id: number, isRead?: boolean }
   */
  const seedReadStatuses = useCallback(
    (
      documents: Array<{ id: number; isRead?: boolean; readAt?: string }>,
      documentType: DocumentType
    ) => {
      if (!Array.isArray(documents) || !documentType) return;
      let changed = false;
      for (const doc of documents) {
        if (!doc || typeof doc.id !== 'number') continue;
        if (doc.isRead === undefined) continue; // nothing to seed
        const key = getKey(doc.id, documentType);
        if (!(key in globalReadStatus)) {
          globalReadStatus[key] = !!doc.isRead;
          changed = true;
        }
      }
      if (changed) notifySubscribers();
    }, []);

  return {
    markAsRead,
    markAsUnread,
    getReadStatus,
    hasReadStatus,
    loadBatchReadStatus,
    loadUnreadCount,
    getUnreadCount,
    toggleReadStatus,
    clearAllReadStatus,
    seedReadStatuses,
  };
};
