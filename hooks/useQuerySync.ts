"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Generic mapping for query params across document list pages.
 * We intentionally keep param names short to keep URL concise.
 *
 * q: search query (active search term actually applied)
 * tab: internal | external
 * page: 1-based page index in URL (we convert internally to 0-based)
 * size: page size
 * status: status filter (all | ...)
 * dept: department filter
 * auth: issuing authority filter (incoming)
 * start / end: date range (YYYY-MM-DD)
 * proc: processingStatusTab (pending|completed|not_processed|all)
 * year / month: for internal outgoing/incoming filters
 */

export interface BaseQueryState {
  q?: string;
  tab?: string;
  page?: number; // 0-based in state
  size?: number;
  status?: string;
  dept?: string;
  auth?: string;
  start?: string;
  end?: string;
  proc?: string;
  year?: number;
  month?: number; // 1-12
}

export interface UseQuerySyncOptions<T extends object> {
  /** Extract the portion of component state we want to reflect in URL */
  select: () => BaseQueryState & Partial<T>;
  /** Apply parsed URL params to local state (only on first mount) */
  apply: (parsed: BaseQueryState) => void;
  /** Defaults to compare & prune when building query */
  defaults?: Partial<BaseQueryState>;
  /** Debounce ms for search query param (q) */
  debounceMs?: number;
  /** When true disables sync (for transitional phases) */
  disabled?: boolean;
}

function parseNumber(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function parseQueryParams(sp: URLSearchParams): BaseQueryState {
  return {
    q: sp.get("q") || undefined,
    tab: sp.get("tab") || undefined,
    page: (parseNumber(sp.get("page")) ?? 1) - 1, // URL is 1-based; internal 0-based
    size: parseNumber(sp.get("size")),
    status: sp.get("status") || undefined,
    dept: sp.get("dept") || undefined,
    auth: sp.get("auth") || undefined,
    start: sp.get("start") || undefined,
    end: sp.get("end") || undefined,
    proc: sp.get("proc") || undefined,
    year: parseNumber(sp.get("year")),
    month: parseNumber(sp.get("month")),
  };
}

function buildQueryString(state: BaseQueryState, defaults: Partial<BaseQueryState>): string {
  const sp = new URLSearchParams();
  const push = (key: keyof BaseQueryState, value: any) => {
    if (value === undefined || value === null || value === "") return;
    // Omit if equals default
    // Special case: page default is 0 internal -> 1 external representation
    const def = defaults[key];
    if (key === "page") {
      const v1 = (value as number) + 1;
      const defV = typeof def === "number" ? (def as number) + 1 : undefined;
      if (defV !== undefined && v1 === defV) return;
      sp.set("page", String(v1));
      return;
    }
    if (def !== undefined && def === value) return;
    sp.set(key, String(value));
  };
  (Object.keys(state) as (keyof BaseQueryState)[]).forEach((k) => push(k, state[k]));
  return sp.toString();
}

export function useQuerySync<T extends object = {}>(options: UseQuerySyncOptions<T>) {
  const { select, apply, defaults = {}, debounceMs = 400, disabled } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const appliedRef = useRef(false);
  const lastQueryRef = useRef<string>("");
  const debounceTimer = useRef<any>(null);

  // Apply initial params once
  useEffect(() => {
    if (disabled) return;
    if (appliedRef.current) return;
    const parsed = parseQueryParams(searchParams);
    apply(parsed);
    appliedRef.current = true;
    // Normalize URL once after apply
    const selected = select();
    const qs = buildQueryString(selected, defaults as BaseQueryState);
    lastQueryRef.current = qs;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // Watch for local state changes and push to URL
  const sync = useCallback(() => {
    if (disabled) return;
    const selected = select();
    const qs = buildQueryString(selected, defaults as BaseQueryState);
    if (qs === lastQueryRef.current) return; // no change
    lastQueryRef.current = qs;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [select, defaults, disabled, router, pathname]);

  useEffect(() => {
    if (disabled) return;
    if (!appliedRef.current) return; // Wait until initial apply
    // Debounce only if search query present/changed; else immediate
    const current = select();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // If only q changed we debounce; else immediate
    debounceTimer.current = setTimeout(sync, current.q ? debounceMs : 50);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [select, sync, disabled, debounceMs]);

  return { ready: appliedRef.current };
}

export type { BaseQueryState as QuerySyncState };
