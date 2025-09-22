"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface PersistedListState {
  page?: number;
  pageSize?: number;
  tab?: string;
  search?: string;
  filters?: Record<string, any>;
  scrollY?: number;
  version?: number; // allow future invalidation
}

interface UseListStatePersistenceOptions<TState extends object> {
  /** Storage key unique per list context */
  storageKey: string;
  /** Current state object (will be serialized) */
  state: TState;
  /** Which property names to persist (whitelist). If omitted, persist all top-level keys */
  persistKeys?: (keyof TState)[];
  /** Auto restore scroll position (default true) */
  restoreScroll?: boolean;
  /** Whether to save on every state change (default true) */
  autoSave?: boolean;
  /** Optional explicit trigger token (e.g., data reload) to re-save */
  saveDeps?: any[];
  /** If URL already carries explicit params, skip restore (default true) */
  skipIfHasQueryParams?: boolean;
  /** Version for invalidating old structures */
  version?: number;
}

interface UseListStatePersistenceReturn<TState extends object> {
  restore: () => Partial<TState> | undefined;
  save: () => void;
  clear: () => void;
  restored: boolean;
}

/**
 * Generic reusable hook to persist list state (pagination, filters, tab, search, scroll).
 * Uses sessionStorage (tab-scoped). Can be adapted to localStorage if cross-tab needed.
 */
export function useListStatePersistence<TState extends object>(
  options: UseListStatePersistenceOptions<TState>
): UseListStatePersistenceReturn<TState> {
  const {
    storageKey,
    state,
    persistKeys,
    restoreScroll = true,
    autoSave = true,
    saveDeps = [],
    skipIfHasQueryParams = true,
    version = 1,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const restoredRef = useRef(false);

  const filteredState = useCallback(() => {
    if (!persistKeys || persistKeys.length === 0) return { ...state } as TState;
    const subset: Partial<TState> = {};
    persistKeys.forEach((k) => {
      subset[k] = state[k];
    });
    return subset;
  }, [state, persistKeys]);

  const save = useCallback(() => {
    try {
      const payload: PersistedListState = {
        ...filteredState(),
        scrollY: window.scrollY,
        version,
      } as any;
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }, [filteredState, storageKey, version]);

  const restore = useCallback((): Partial<TState> | undefined => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: PersistedListState & Partial<TState> = JSON.parse(raw);
      if (parsed.version && parsed.version !== version) return; // version mismatch skip
      return parsed as Partial<TState>;
    } catch {
      return;
    }
  }, [storageKey, version]);

  const clear = useCallback(() => {
    try { sessionStorage.removeItem(storageKey); } catch {}
  }, [storageKey]);

  // Auto save on state changes
  useEffect(() => {
    if (!autoSave) return;
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, save, ...saveDeps]);

  // Initial restore
  useEffect(() => {
    if (restoredRef.current) return;
    // Optionally skip if URL already encodes state (avoid overriding sharable links)
    if (skipIfHasQueryParams) {
      const hasQP = Array.from(searchParams.keys()).some((k) =>
        ["page", "q", "tab", "status", "dept", "year", "month"].includes(k)
      );
      if (hasQP) {
        restoredRef.current = true;
        return;
      }
    }
    const restoredAny = restore() as any;
    if (restoredAny && restoreScroll) {
      // Defer scroll restore until paint
      requestAnimationFrame(() => {
        if (typeof restoredAny.scrollY === "number") {
          window.scrollTo({ top: restoredAny.scrollY, behavior: "instant" as ScrollBehavior });
        }
      });
    }
    restoredRef.current = true;
  }, [restore, restoreScroll, searchParams, skipIfHasQueryParams]);

  return { restore, save, clear, restored: restoredRef.current };
}
