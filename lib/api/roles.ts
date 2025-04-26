import api from "./config"
import type { PermissionDTO } from "./types"

export interface CustomRoleDTO {
  id: number
  name: string
  description: string
  systemRole: boolean
  createdAt: string
  updatedAt: string
  createdById?: number
  createdByName?: string
  permissions: PermissionDTO[]
}

export const rolesAPI = {
  /**
   * Get all roles
   * @returns List of all roles
   */
  getAllRoles: async (): Promise<CustomRoleDTO[]> => {
    const response = await api.get("/roles")
    return response.data
  },

  /**
   * Get role by ID
   * @param id Role ID
   * @returns Role data
   */
  getRoleById: async (id: string | number): Promise<CustomRoleDTO> => {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },

  /**
   * Create new role
   * @param roleData Role data
   * @returns Created role data
   */
  createRole: async (roleData: Partial<CustomRoleDTO>) => {
    const response = await api.post("/roles", roleData)
    return response.data
  },

  /**
   * Update role
   * @param id Role ID
   * @param roleData Role data to update
   * @returns Updated role data
   */
  updateRole: async (id: string | number, roleData: Partial<CustomRoleDTO>) => {
    const response = await api.put(`/roles/${id}`, roleData)
    return response.data
  },

  /**
   * Delete role
   * @param id Role ID
   * @returns Success message
   */
  deleteRole: async (id: string | number) => {
    const response = await api.delete(`/roles/${id}`)
    return response.data
  },

  /**
   * Get system roles
   * @returns List of system roles
   */
  getSystemRoles: async (): Promise<CustomRoleDTO[]> => {
    const response = await api.get("/roles/system")
    return response.data
  },

  /**
   * Get custom roles
   * @returns List of custom roles
   */
  getCustomRoles: async (): Promise<CustomRoleDTO[]> => {
    const response = await api.get("/roles/custom")
    return response.data
  },

  /**
   * Add permission to role
   * @param roleId Role ID
   * @param permissionId Permission ID
   * @returns Updated role data
   */
  addPermissionToRole: async (roleId: string | number, permissionId: string | number) => {
    const response = await api.post(`/roles/${roleId}/permissions/${permissionId}`)
    return response.data
  },

  /**
   * Remove permission from role
   * @param roleId Role ID
   * @param permissionId Permission ID
   * @returns Updated role data
   */
  removePermissionFromRole: async (roleId: string | number, permissionId: string | number) => {
    const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`)
    return response.data
  },
}
