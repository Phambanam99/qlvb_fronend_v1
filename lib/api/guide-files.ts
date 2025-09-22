import api from "./config";
import type { PageResponse } from "./types";

export interface GuideFileDTO {
  id: number;
  name: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
  createdByName?: string;
}

export interface CreateGuideFileDTO {
  name: string;
  description: string;
  category: string;
  isActive?: boolean;
}

export interface UpdateGuideFileDTO {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export const guideFilesAPI = {
  /**
   * Get all guide files
   * @returns List of all guide files
   */
  getAllGuideFiles: async (): Promise<GuideFileDTO[]> => {
    try {
      const response = await api.get("/guide-files");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active guide files (for public view)
   * @returns List of active guide files
   */
  getActiveGuideFiles: async (): Promise<GuideFileDTO[]> => {
    try {
      const response = await api.get("/guide-files/active");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get guide files with pagination
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of guide files
   */
  getGuideFilesPaginated: async (
    page = 0,
    size = 10
  ): Promise<PageResponse<GuideFileDTO>> => {
    try {
      const response = await api.get("/guide-files/paginated", {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get guide file by ID
   * @param id Guide file ID
   * @returns Guide file data
   */
  getGuideFileById: async (id: string | number): Promise<GuideFileDTO> => {
    try {
      const response = await api.get(`/guide-files/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload new guide file
   * @param fileData Guide file metadata
   * @param file File to upload
   * @returns Created guide file data
   */
  uploadGuideFile: async (
    fileData: CreateGuideFileDTO,
    file: File
  ): Promise<GuideFileDTO> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", fileData.name);
      formData.append("description", fileData.description);
      formData.append("category", fileData.category);
      formData.append("isActive", String(fileData.isActive ?? true));

      const response = await api.post("/guide-files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update guide file metadata
   * @param id Guide file ID
   * @param fileData Guide file data to update
   * @returns Updated guide file data
   */
  updateGuideFile: async (
    id: string | number,
    fileData: UpdateGuideFileDTO
  ): Promise<GuideFileDTO> => {
    try {
      const response = await api.put(`/guide-files/${id}`, fileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Replace guide file
   * @param id Guide file ID
   * @param file New file to upload
   * @returns Updated guide file data
   */
  replaceGuideFile: async (
    id: string | number,
    file: File
  ): Promise<GuideFileDTO> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.put(`/guide-files/${id}/file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete guide file
   * @param id Guide file ID
   * @returns Success message
   */
  deleteGuideFile: async (
    id: string | number
  ): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/guide-files/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download guide file
   * @param id Guide file ID
   * @returns File blob
   */
  downloadGuideFile: async (id: string | number): Promise<Blob> => {
    try {
      // We first try to get raw blob. However backend wraps Resource inside ResponseDTO
      // which causes axios to treat it as JSON (application/json) when not actually streaming file bytes.
      // So we attempt two strategies:
      // 1. Request as blob. If the blob is JSON (small size / type application/json), parse it.
      // 2. If JSON contains base64 under data.contentAsByteArray OR data (string), decode to binary.
      const response = await api.get(`/guide-files/${id}/download`, {
        responseType: "blob",
        // prevent caching issues
        headers: { Accept: "*/*" },
      });

      let blob: Blob = response.data;

      // If server actually returned JSON (content-type may still be application/json) the blob needs parsing
      const contentType = (response as any).headers?.["content-type"] || blob.type;
      const isLikelyJSON = contentType?.includes("application/json");

      if (isLikelyJSON) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          // Expect structure { message, data: { contentAsByteArray: base64, fileName?, fileType? } }
          const data = json.data || json;
          const base64 = data.contentAsByteArray || data.base64 || data.bytes || null;
          if (base64) {
            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const detectedType = data.fileType || "application/pdf";
            blob = new Blob([byteArray], { type: detectedType });
          } else if (data.uri || data.url || data.file) {
            // Fallback: attempt direct fetch of file:// is not allowed in browser; need backend to stream.
            // We throw explicit error to signal backend adjustment required.
            throw new Error("Phản hồi JSON không chứa dữ liệu base64 file. Cần backend trả về bytes hoặc base64.");
          } else {
            throw new Error("Không tìm thấy dữ liệu file trong phản hồi JSON");
          }
        } catch (e) {
          // If JSON parse fails, we keep original blob
          if (e instanceof Error) {
            console.warn("Không thể parse JSON blob tải xuống, trả về blob gốc:", e.message);
          }
        }
      }

      return blob;
    } catch (error) {
      throw error;
    }
  },
};
