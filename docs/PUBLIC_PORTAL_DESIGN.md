# Public Document Portal – Design (Frontend)

Goal: Add public pages to upload and download documents with hierarchical categories. Fit with Next.js 14 app router setup in this project.

## Pages & Routes

- `/public` – Landing with recent published documents and top-level categories
- `/public/categories` – Category tree view
- `/public/categories/[slug]` – List documents in a category (with optional recursive filter)
- `/public/documents/[id]` – Document details and attachments list
- `/public/upload` – Anonymous upload form

## Components

- CategoryTree: fetch `/api/public/categories/tree`, render collapsible tree
- DocumentCard: title, publishedAt, categories, download buttons
- UploadForm: fields `title`, `summary`, `categories` (multi-select), files (drag-drop), `uploaderName`, `uploaderEmail`
- FileDownloadButton: link to `/api/public/documents/{id}/attachments/{attachmentId}/download`

## Data Fetching

- Edge-safe GETs via fetch with `next` revalidate
- Upload via `multipart/form-data` POST to `/api/public/documents/upload`
- Handle busy states and error toasts using existing `use-toast`

## State & Hooks

- `useCategoriesTree` – cache category tree with SWR or simple fetch + revalidate
- `usePublicSearch` – query string management (q, page)

## API Contracts (match backend design)

- GET `/api/public/categories/tree` → CategoryDTO[]
- GET `/api/public/categories/{id}/documents?page&size&q&recursive` → paged list
- GET `/api/public/documents?page&size&q` → paged list
- GET `/api/public/documents/{id}` → PublicDocumentResponse
- GET `/api/public/documents/{id}/attachments/{attachmentId}/download` → file stream
- POST `/api/public/documents/upload` (multipart) → created PublicDocumentResponse (isPublic=false until published)

## UI/UX Notes

- Show badge if document is not yet published (if exposing upload confirmation page)
- After upload success, show thank-you page; do not expose raw file URLs
- Validate max files/size, restrict file types; display per-file progress

## Integration Points

- Use existing Tailwind setup and `components/ui` primitives
- Reuse `toast` and `use-toast`
- Consider reusing pagination patterns used in existing listing pages

## Minimal Implementation Steps

1. Add pages and simple fetchers for list/detail
2. Implement UploadForm that posts multipart
3. Render CategoryTree and link to category pages
4. Polish: search, pagination, breadcrumbs
