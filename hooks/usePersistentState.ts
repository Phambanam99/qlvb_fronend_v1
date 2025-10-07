"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Generic hook to persist a piece of state across navigations using sessionStorage
 * and optionally mirror it into a URL query parameter for shareable deep links.
 *
 * Features:
 * - SSR safe (no window access on first render server side)
 * - JSON serialization / deserialization
 * - Debounced URL updates to avoid router spam
 */
export interface UsePersistentStateOptions<T> {
  /** Provide a custom serializer (defaults to JSON.stringify) */
  serialize?: (value: T) => string;
  /** Provide a custom parser (defaults to JSON.parse) */
  parse?: (raw: string) => T;
  /** Store key in sessionStorage (scoped by origin) */
  storageKey?: string;
  /** Optional query param name to sync with URL */
  queryParam?: string;
  /** Disable writing to sessionStorage */
  disableStorage?: boolean;
  /** Disable syncing to URL */
  disableQueryParam?: boolean;
  /** Debounce (ms) for URL updates; default 80 */
  debounceMs?: number;
  /** Validate parsed value; if fails fallback to defaultValue */
  validate?: (value: unknown) => value is T;
}

export function usePersistentState<T>(
  defaultValue: T,
  options: UsePersistentStateOptions<T> = {}
) {
  const {
    serialize = JSON.stringify,
    parse = JSON.parse,
    storageKey = undefined,
    queryParam,
    disableStorage,
    disableQueryParam,
    debounceMs = 80,
    validate,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialisedRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  const effectiveKey = storageKey || (queryParam ? `persist.${queryParam}` : undefined);

  // Resolve initial value (client only)
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue; // SSR
    // Priority 1: query param
    if (queryParam && !disableQueryParam) {
      const qpVal = searchParams?.get(queryParam);
      if (qpVal != null) {
        try {
          const decoded = decodeURIComponent(qpVal);
          const parsed = parse(decoded);
          if (!validate || validate(parsed)) return parsed;
        } catch {
          /* ignore */
        }
      }
    }
    // Priority 2: sessionStorage
    if (effectiveKey && !disableStorage) {
      try {
        const raw = sessionStorage.getItem(effectiveKey);
        if (raw != null) {
          const parsed = parse(raw);
          if (!validate || validate(parsed)) return parsed;
        }
      } catch {
        /* ignore */
      }
    }
    return defaultValue;
  });

  // Persist to storage whenever value changes
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard
    if (!initialisedRef.current) {
      initialisedRef.current = true;
    }
    if (effectiveKey && !disableStorage) {
      try {
        sessionStorage.setItem(effectiveKey, serialize(value));
      } catch {
        /* ignore */
      }
    }
    if (queryParam && !disableQueryParam) {
      // Debounce URL updates to minimise router.replace calls
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        const current = new URLSearchParams(Array.from(searchParams?.entries() || []));
        current.set(queryParam, encodeURIComponent(serialize(value)));
        router.replace(`${pathname}?${current.toString()}`, { scroll: false });
      }, debounceMs);
    }
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value, effectiveKey, serialize, queryParam, disableStorage, disableQueryParam, debounceMs, pathname, router, searchParams]);

  return [value, setValue] as const;
}
