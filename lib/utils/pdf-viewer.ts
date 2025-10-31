/**
 * PDF Viewer Utilities
 * Functions to handle PDF preview and viewing across the application
 */

import { downloadAttachment } from "@/lib/api/internalDocumentApi";
import { addUserWatermarkToPdf, isPdfFile } from "./pdf-watermark";

export interface PDFViewerOptions {
  title?: string;
  width?: string;
  height?: string;
  allowDownload?: boolean;
  allowPrint?: boolean;
  useOptimizedViewer?: boolean; // Use react-pdf optimized viewer (better for weak devices)
}


/**
 * Check if a file is a PDF based on file type or extension
 */
export const isPDFFile = (fileType: string, fileName?: string): boolean => {
  // Check MIME type
  if (fileType.toLowerCase().includes("pdf")) {
    return true;
  }

  // Check file extension as fallback
  if (fileName) {
    const extension = fileName.toLowerCase().split(".").pop();
    return extension === "pdf";
  }

  return false;
};

/**
 * Create a blob URL for PDF viewing
 * @throws Error if browser doesn't support Blob URLs
 */
export const createPDFBlobUrl = (blob: Blob): string => {
  // Check for URL API support (including vendor prefixes for older browsers)
  const URL = window.URL || (window as any).webkitURL || (window as any).mozURL;

  if (!URL || !URL.createObjectURL) {
    throw new Error('Browser does not support Blob URLs');
  }

  try {
    return URL.createObjectURL(blob);
  } catch (error) {
    throw new Error('Failed to create Blob URL: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

/**
 * Cleanup blob URL to free memory
 */
export const cleanupBlobUrl = (url: string): void => {
  if (!url) return;

  try {
    // Check for URL API support (including vendor prefixes for older browsers)
    const URL = window.URL || (window as any).webkitURL || (window as any).mozURL;

    if (URL && URL.revokeObjectURL) {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    // Silently fail - not critical if cleanup fails
    console.warn('Failed to revoke Blob URL:', error);
  }
};

/**
 * Get file type icon based on file type
 */
export const getFileTypeIcon = (fileType: string) => {
  const type = fileType.toLowerCase();

  if (type.includes("pdf")) return "FileText";
  if (type.includes("video") || type.includes("mp4") || type.includes("avi"))
    return "Video";
  if (
    type.includes("image") ||
    type.includes("png") ||
    type.includes("jpg") ||
    type.includes("jpeg")
  )
    return "Image";
  if (type.includes("word") || type.includes("doc")) return "FileText";
  if (type.includes("excel") || type.includes("xls")) return "FileSpreadsheet";
  if (type.includes("powerpoint") || type.includes("ppt"))
    return "Presentation";

  return "File";
};

/**
 * Format file size from bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Download file with proper filename
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Open PDF in new window/tab with fallback for older browsers
 */
export const openPDFInNewWindow = (
  blob: Blob,
  title?: string
): Window | null => {
  try {
    const url = createPDFBlobUrl(blob);
    const newWindow = window.open(url, "_blank");

    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      cleanupBlobUrl(url);

      // Fallback: trigger download instead
      console.warn('Popup blocked or failed, falling back to download');
      downloadFile(blob, title || 'document.pdf');
      return null;
    }

    // Set title if supported
    if (newWindow && title) {
      try {
        newWindow.document.title = title;
      } catch (e) {
        // Ignore if setting title fails (cross-origin issues)
      }
    }

    // Cleanup URL after some delay (window should have loaded by then)
    setTimeout(() => {
      cleanupBlobUrl(url);
    }, 5000);

    return newWindow;
  } catch (error) {
    console.error('Failed to open PDF in new window:', error);

    // Fallback: trigger download
    try {
      downloadFile(blob, title || 'document.pdf');
    } catch (downloadError) {
      console.error('Download fallback also failed:', downloadError);
    }

    return null;
  }
};

/**
 * Check if browser supports PDF viewing
 */
export const supportsPDFViewing = (): boolean => {
  try {
    // Check if browser supports Blob URLs
    if (!window.URL || !window.URL.createObjectURL) {
      return false;
    }

    // Check if browser supports Blob
    if (typeof Blob === 'undefined') {
      return false;
    }

    // Try to create a test blob URL
    const testBlob = new Blob(['test'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(testBlob);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Simple URLSearchParams polyfill for older browsers
 */
const buildQueryString = (params: Record<string, string>): string => {
  const parts: string[] = [];
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return parts.join('&');
};

/**
 * Get PDF viewer URL with options
 */
export const getPDFViewerUrl = (
  blobUrl: string,
  options: PDFViewerOptions = {}
): string => {
  const params: Record<string, string> = {};

  if (!options.allowDownload) {
    params["toolbar"] = "0";
  }

  if (!options.allowPrint) {
    params["navpanes"] = "0";
  }

  const queryString = buildQueryString(params);
  return queryString ? blobUrl + '#' + queryString : blobUrl;
};
