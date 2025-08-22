// Types for Public Portal APIs
export interface PublicCategoryDTO {
  id: number;
  slug?: string;
  name: string;
  description?: string | null;
  parentId?: number | null;
  children?: PublicCategoryDTO[];
}

export interface PublicDocumentDTO {
  id: number;
  title: string;
  type?: string | null;
  documentNumber?: string | null;
  issuingAgency?: string | null;
  uploaderName?: string | null;
  downloadCount?: number | null;
  publishedAt?: string | null;
  isPublic?: boolean;
  categoryNames?: string[];
}

export interface PublicAttachmentDTO {
  id: number;
  // Support both backend shapes
  originalFilename?: string;
  filename?: string;
  fileSize?: number;
  size?: number;
  contentType?: string;
}

export interface PublicDocumentDetailDTO extends PublicDocumentDTO {
  summary?: string | null;
  attachments?: PublicAttachmentDTO[];
}

export interface PublicDownloadLogDTO {
  id: number;
  documentId: number;
  attachmentId: number;
  userId?: number | null;
  userName?: string | null;
  ipAddress?: string | null;
  downloadedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}
