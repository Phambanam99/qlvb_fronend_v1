import api from "./config";
import type { ResponseDTO } from "./types";

export interface UserDTO {
  id: number;
  name: string;
  fullName: string;
  mail: string;
  phone?: string;
  position?: string;
  departmentId?: number;
  departmentName?: string;
  isActive: boolean;
  created?: string;
  changed?: string;
  roles?: RoleDTO[];
  permissions?: string[];
  isCommanderOfUnit?: boolean;
  avatar?: string;
}

export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
  permissions?: PermissionDTO[];
}

export interface PermissionDTO {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface CreateUserDTO {
  name: string;
  fullName: string;
  mail: string;
  phone?: string;
  position?: string;
  departmentId?: number;
  password: string;
  roleIds?: number[];
  isCommanderOfUnit?: boolean;
}

export interface UpdateUserDTO {
  fullName?: string;
  mail?: string;
  phone?: string;
  position?: string;
  departmentId?: number;
  roleIds?: number[];
  isActive?: boolean;
  isCommanderOfUnit?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const usersAPI = {
  /**
   * Get all users
   * @param page Page number
   * @param size Page size
   * @returns Paginated list of users
   */
  getAllUsers: async (
    page = 0,
    size = 10
  ): Promise<{ content: UserDTO[]; page: any }> => {
    const response = await api.get("/users", {
      params: { page, size },
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
   * Get user by ID
   * @param id User ID
   * @returns User data
   */
  getUserById: async (id: number | string): Promise<UserDTO> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns Current user data
   */
  getCurrentUser: async (): Promise<UserDTO> => {
    const response = await api.get("/users/me");
    return response.data;
  },

  /**
   * Create new user
   * @param userData User data to create
   * @returns Created user data
   */
  createUser: async (userData: CreateUserDTO): Promise<UserDTO> => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  /**
   * Update user
   * @param id User ID
   * @param userData User data to update
   * @returns Updated user data
   */
  updateUser: async (
    id: number | string,
    userData: UpdateUserDTO
  ): Promise<UserDTO> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user
   * @param id User ID
   * @returns Success message
   */
  deleteUser: async (id: number | string): Promise<string> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Search users
   * @param searchParams Search parameters
   * @returns Search results
   */
  searchUsers: async (searchParams: {
    query?: string;
    departmentId?: number;
    isActive?: boolean;
    role?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: UserDTO[]; page: any }> => {
    const response = await api.get("/users/search", {
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
   * Get users by department
   * @param departmentId Department ID
   * @returns List of users in the department
   */
  getUsersByDepartment: async (departmentId: number | string): Promise<UserDTO[]> => {
    const response = await api.get(`/users/department/${departmentId}`);
    return response.data;
  },

  /**
   * Get users by role
   * @param roleName Role name
   * @returns List of users with the role
   */
  getUsersByRole: async (roleName: string): Promise<UserDTO[]> => {
    const response = await api.get(`/users/role/${roleName}`);
    return response.data;
  },

  /**
   * Get department commanders
   * @param departmentId Department ID (optional)
   * @returns List of department commanders
   */
  getDepartmentCommanders: async (departmentId?: number | string): Promise<UserDTO[]> => {
    const params = departmentId ? { departmentId } : {};
    const response = await api.get("/users/commanders", { params });
    return response.data;
  },

  /**
   * Change user password
   * @param id User ID
   * @param passwordData Password change data
   * @returns Success message
   */
  changePassword: async (
    id: number | string,
    passwordData: ChangePasswordDTO
  ): Promise<string> => {
    const response = await api.put(`/users/${id}/password`, passwordData);
    return response.data;
  },

  /**
   * Reset user password
   * @param id User ID
   * @param newPassword New password
   * @returns Success message
   */
  resetPassword: async (
    id: number | string,
    newPassword: string
  ): Promise<string> => {
    const response = await api.put(`/users/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  /**
   * Update user profile
   * @param userData Profile data to update
   * @returns Updated user data
   */
  updateProfile: async (userData: Partial<UpdateUserDTO>): Promise<UserDTO> => {
    const response = await api.put("/users/me", userData);
    return response.data;
  },

  /**
   * Upload user avatar
   * @param file Avatar file
   * @returns Success message
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get user avatar
   * @param userId User ID
   * @returns Avatar blob
   */
  getUserAvatar: async (userId: number | string): Promise<Blob> => {
    const response = await api.get(`/users/${userId}/avatar`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Activate user
   * @param id User ID
   * @returns Success message
   */
  activateUser: async (id: number | string): Promise<string> => {
    const response = await api.put(`/users/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate user
   * @param id User ID
   * @returns Success message
   */
  deactivateUser: async (id: number | string): Promise<string> => {
    const response = await api.put(`/users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Assign roles to user
   * @param id User ID
   * @param roleIds Role IDs to assign
   * @returns Success message
   */
  assignRoles: async (
    id: number | string,
    roleIds: number[]
  ): Promise<string> => {
    const response = await api.put(`/users/${id}/roles`, { roleIds });
    return response.data;
  },

  /**
   * Remove roles from user
   * @param id User ID
   * @param roleIds Role IDs to remove
   * @returns Success message
   */
  removeRoles: async (
    id: number | string,
    roleIds: number[]
  ): Promise<string> => {
    const response = await api.delete(`/users/${id}/roles`, {
      data: { roleIds },
    });
    return response.data;
  },

  /**
   * Get user permissions
   * @param id User ID
   * @returns List of user permissions
   */
  getUserPermissions: async (id: number | string): Promise<string[]> => {
    const response = await api.get(`/users/${id}/permissions`);
    return response.data;
  },

  /**
   * Get user statistics
   * @returns User statistics
   */
  getUserStatistics: async (): Promise<any> => {
    const response = await api.get("/users/statistics");
    return response.data;
  },

  /**
   * Bulk update users
   * @param updates List of user updates
   * @returns Success message
   */
  bulkUpdateUsers: async (
    updates: Array<{ id: number; data: UpdateUserDTO }>
  ): Promise<string> => {
    const response = await api.put("/users/bulk-update", { updates });
    return response.data;
  },

  /**
   * Export users to Excel
   * @param filters Export filters
   * @returns File blob
   */
  exportToExcel: async (filters?: any): Promise<Blob> => {
    const response = await api.post("/users/export", filters, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Import users from Excel
   * @param file Excel file
   * @returns Import result
   */
  importFromExcel: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
