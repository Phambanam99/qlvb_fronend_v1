import api from "./config";
import type { ResponseDTO } from "./types";

export interface DepartmentDTO {
  id: number;
  name: string;
  description?: string;
  code?: string;
  parentDepartmentId?: number;
  parentDepartmentName?: string;
  managerUserId?: number;
  managerUserName?: string;
  isActive: boolean;
  created?: string;
  changed?: string;
  childDepartments?: DepartmentDTO[];
  userCount?: number;
  level?: number;
  path?: string;
}

export interface CreateDepartmentDTO {
  name: string;
  description?: string;
  code?: string;
  parentDepartmentId?: number;
  managerUserId?: number;
}

export interface UpdateDepartmentDTO {
  name?: string;
  description?: string;
  code?: string;
  parentDepartmentId?: number;
  managerUserId?: number;
  isActive?: boolean;
}

export const departmentsAPI = {
  /**
   * Get all departments
   * @param includeInactive Include inactive departments
   * @returns List of departments
   */
  getAllDepartments: async (includeInactive = false): Promise<DepartmentDTO[]> => {
    const response = await api.get("/departments", {
      params: { includeInactive },
    });
    return response.data;
  },

  /**
   * Get paginated departments
   * @param page Page number
   * @param size Page size
   * @param includeInactive Include inactive departments
   * @returns Paginated list of departments
   */
  getPaginatedDepartments: async (
    page = 0,
    size = 10,
    includeInactive = false
  ): Promise<{ content: DepartmentDTO[]; page: any }> => {
    const response = await api.get("/departments/paginated", {
      params: { page, size, includeInactive },
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get department by ID
   * @param id Department ID
   * @returns Department data
   */
  getDepartmentById: async (id: number | string): Promise<DepartmentDTO> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create new department
   * @param departmentData Department data to create
   * @returns Created department data
   */
  createDepartment: async (departmentData: CreateDepartmentDTO): Promise<DepartmentDTO> => {
    const response = await api.post("/departments", departmentData);
    return response.data;
  },

  /**
   * Update department
   * @param id Department ID
   * @param departmentData Department data to update
   * @returns Updated department data
   */
  updateDepartment: async (
    id: number | string,
    departmentData: UpdateDepartmentDTO
  ): Promise<DepartmentDTO> => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  /**
   * Delete department
   * @param id Department ID
   * @returns Success message
   */
  deleteDepartment: async (id: number | string): Promise<string> => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  /**
   * Get department hierarchy
   * @returns Hierarchical structure of departments
   */
  getDepartmentHierarchy: async (): Promise<DepartmentDTO[]> => {
    const response = await api.get("/departments/hierarchy");
    return response.data;
  },

  /**
   * Get child departments
   * @param parentId Parent department ID
   * @returns List of child departments
   */
  getChildDepartments: async (parentId: number | string): Promise<DepartmentDTO[]> => {
    const response = await api.get(`/departments/${parentId}/children`);
    return response.data;
  },

  /**
   * Get parent department
   * @param id Department ID
   * @returns Parent department data
   */
  getParentDepartment: async (id: number | string): Promise<DepartmentDTO | null> => {
    try {
      const response = await api.get(`/departments/${id}/parent`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No parent department
      }
      throw error;
    }
  },

  /**
   * Search departments
   * @param searchParams Search parameters
   * @returns Search results
   */
  searchDepartments: async (searchParams: {
    query?: string;
    parentDepartmentId?: number;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Promise<{ content: DepartmentDTO[]; page: any }> => {
    const response = await api.get("/departments/search", {
      params: searchParams,
    });

    return {
      content: response.data.content,
      page: {
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      },
    };
  },

  /**
   * Get departments by level
   * @param level Department level in hierarchy
   * @returns List of departments at the specified level
   */
  getDepartmentsByLevel: async (level: number): Promise<DepartmentDTO[]> => {
    const response = await api.get(`/departments/level/${level}`);
    return response.data;
  },

  /**
   * Get root departments (departments without parent)
   * @returns List of root departments
   */
  getRootDepartments: async (): Promise<DepartmentDTO[]> => {
    const response = await api.get("/departments/root");
    return response.data;
  },

  /**
   * Move department to new parent
   * @param id Department ID
   * @param newParentId New parent department ID (null for root level)
   * @returns Updated department data
   */
  moveDepartment: async (
    id: number | string,
    newParentId: number | null
  ): Promise<DepartmentDTO> => {
    const response = await api.put(`/departments/${id}/move`, {
      newParentId,
    });
    return response.data;
  },

  /**
   * Activate department
   * @param id Department ID
   * @returns Success message
   */
  activateDepartment: async (id: number | string): Promise<string> => {
    const response = await api.put(`/departments/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate department
   * @param id Department ID
   * @returns Success message
   */
  deactivateDepartment: async (id: number | string): Promise<string> => {
    const response = await api.put(`/departments/${id}/deactivate`);
    return response.data;
  },

  /**
   * Assign manager to department
   * @param id Department ID
   * @param managerId Manager user ID
   * @returns Updated department data
   */
  assignManager: async (
    id: number | string,
    managerId: number
  ): Promise<DepartmentDTO> => {
    const response = await api.put(`/departments/${id}/manager`, {
      managerId,
    });
    return response.data;
  },

  /**
   * Remove manager from department
   * @param id Department ID
   * @returns Updated department data
   */
  removeManager: async (id: number | string): Promise<DepartmentDTO> => {
    const response = await api.put(`/departments/${id}/manager`, {
      managerId: null,
    });
    return response.data;
  },

  /**
   * Get department statistics
   * @param id Department ID
   * @returns Department statistics
   */
  getDepartmentStatistics: async (id: number | string): Promise<any> => {
    const response = await api.get(`/departments/${id}/statistics`);
    return response.data;
  },

  /**
   * Get all department statistics
   * @returns Overall department statistics
   */
  getAllDepartmentStatistics: async (): Promise<any> => {
    const response = await api.get("/departments/statistics");
    return response.data;
  },

  /**
   * Export departments to Excel
   * @param filters Export filters
   * @returns File blob
   */
  exportToExcel: async (filters?: any): Promise<Blob> => {
    const response = await api.post("/departments/export", filters, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Import departments from Excel
   * @param file Excel file
   * @returns Import result
   */
  importFromExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/departments/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Bulk update departments
   * @param updates List of department updates
   * @returns Success message
   */
  bulkUpdateDepartments: async (
    updates: Array<{ id: number; data: UpdateDepartmentDTO }>
  ): Promise<string> => {
    const response = await api.put("/departments/bulk-update", { updates });
    return response.data;
  },

  /**
   * Get department path (breadcrumb)
   * @param id Department ID
   * @returns List of departments from root to current
   */
  getDepartmentPath: async (id: number | string): Promise<DepartmentDTO[]> => {
    const response = await api.get(`/departments/${id}/path`);
    return response.data;
  },
};
