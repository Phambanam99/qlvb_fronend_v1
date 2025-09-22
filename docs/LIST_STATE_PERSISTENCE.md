# List State Persistence Guide

This project uses a reusable hook `useListStatePersistence` to persist list UI state (filters, pagination, tabs, search, scroll position) across navigation so users can return to a list without losing context.

## Hook Location
`hooks/use-list-state-persistence.ts`

## Basic Usage
```tsx
useListStatePersistence({
  storageKey: "unique-list-key", // required unique key per list
  state: { currentPage, pageSize, filterA, searchTerm }, // object of values to track
  persistKeys: ["currentPage", "pageSize", "filterA", "searchTerm"], // keys from state to persist
  saveDeps: [currentPage, pageSize, filterA, searchTerm], // deps that trigger an auto save
  skipIfHasQueryParams: true, // optional: don't restore if URL already defines state
  version: 1, // bump if schema changes to avoid incompatible restore
});
```

## What It Does
- Saves selected keys of `state` into `sessionStorage` on dependency changes.
- Restores state on first mount (unless `skipIfHasQueryParams` and URL has search params).
- Restores scroll position if `scrollY` was persisted (handled internally).
- Provides forward compatibility via `version` field.

## Design Principles
- Non-invasive: Doesn't set state directly—your component or hooks should read initial values from restored data if needed (currently we rely on ref + effect inside the hook to patch values for primitive states managed in the same render file).
- Explicit: Only keys in `persistKeys` are saved.
- Safe: Versioning prevents runtime issues from stale schemas.

## When to Use
Use for any list page where the user navigates to a detail page and comes back (documents, users, departments, plans) and expects prior filter/page context.

## Keys Used in Current Implementation
| List Page | storageKey | Keys |
|-----------|------------|------|
| Incoming Documents | `incoming-docs-state` | activeTab, currentPage, pageSize, statusFilter, departmentFilter, internalSearchQuery, internalActiveSearchQuery, externalSearchQuery, externalActiveSearchQuery, yearFilter, monthFilter, activeYearFilter, activeMonthFilter |
| Outgoing Documents | `outgoing-docs-state` | activeTab, currentPage, pageSize, statusFilter, departmentFilter, searchQuery, activeSearchQuery |
| Work Plans | `work-plans-state` | weekFilter, monthFilter, yearFilter, statusFilter, departmentFilter, activeTab, currentPage, pageSize |
| Users | `users-list-state` | searchTerm, roleFilter, departmentFilter, statusFilter, appliedSearchTerm, appliedRoleFilter, appliedDepartmentFilter, appliedStatusFilter, currentPage, itemsPerPage |
| Departments | `departments-list-state` | searchTerm, typeFilter |

## Extending
If you need to persist additional derived values:
1. Add them to the `state` object.
2. Add their keys to both `persistKeys` and `saveDeps`.
3. Increment `version` if structure changes materially (e.g. rename, type change).

## Future Enhancements (Optional)
- `localStorage` + TTL for cross-tab persistence.
- Auto-sync via `storage` event listener (pattern already used in read-status logic; could be reused).
- Server-side hydration fallback (skip restore when rendering server components).
- Integration with React Query for cached data + UI state pairing.

## Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| State not restored | URL had query params & `skipIfHasQueryParams` is true | Remove param or set option false |
| Old values restored after code change | Version not bumped | Increment `version` |
| Some fields missing | Not listed in `persistKeys` | Add key to list |

---
Maintainers: Keep storage keys unique and short; avoid PII in stored data. Session storage clears per tab session which fits the UX goal (no persistence after full browser close).
