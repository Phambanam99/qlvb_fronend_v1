import api from "./config";

export interface WorkPlanTaskDTO {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assigneeId?: number;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  workPlanId: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkPlanDTO {
  id: number;
  title: string;
  description: string;
  department: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tasks: WorkPlanTaskDTO[];
  // Thêm trường documents để tương thích với code hiện tại
  documents?: { name: string; url?: string }[];
}

export const workPlansAPI = {
  /**
   * Get all work plans
   * @returns List of all work plans
   */
  getAllWorkPlans: async (params?: any): Promise<WorkPlanDTO[]> => {
    const response = await api.get("/work-plans", { params });
    return response.data;
  },

  /**
   * Get work plan by ID
   * @param id Work plan ID
   * @returns Work plan data
   */
  getWorkPlanById: async (id: string | number): Promise<WorkPlanDTO> => {
    const response = await api.get(`/work-plans/${id}`);
    return response.data;
  },

  /**
   * Create new work plan
   * @param workPlanData Work plan data
   * @returns Created work plan data
   */
  createWorkPlan: async (
    workPlanData: Partial<WorkPlanDTO>
  ): Promise<WorkPlanDTO> => {
    const response = await api.post("/work-plans", workPlanData);
    return response.data;
  },

  /**
   * Update work plan
   * @param id Work plan ID
   * @param workPlanData Work plan data to update
   * @returns Updated work plan data
   */
  updateWorkPlan: async (
    id: string | number,
    workPlanData: Partial<WorkPlanDTO>
  ): Promise<WorkPlanDTO> => {
    const response = await api.put(`/work-plans/${id}`, workPlanData);
    return response.data;
  },

  /**
   * Delete work plan
   * @param id Work plan ID
   * @returns Success message
   */
  deleteWorkPlan: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`/work-plans/${id}`);
    return response.data;
  },

  // Thêm các phương thức mới để tương thích với code hiện tại
  approveWorkPlan: async (
    id: number | string,
    data: { comments?: string }
  ): Promise<WorkPlanDTO> => {
    const response = await api.post(`/work-plans/${id}/approve`, data);
    return response.data;
  },

  rejectWorkPlan: async (
    id: number | string,
    data: { comments?: string }
  ): Promise<WorkPlanDTO> => {
    const response = await api.post(`/work-plans/${id}/reject`, data);
    return response.data;
  },

  /**
   * Update task progress
   * @param workPlanId Work plan ID
   * @param taskId Task ID
   * @param data Task progress data
   * @returns Updated task data
   */
  updateTaskProgress: async (
    workPlanId: number | string,
    taskId: number | string,
    data: {
      progress: number;
      status: string;
      comment?: string;
    }
  ): Promise<WorkPlanTaskDTO> => {
    const response = await api.put(
      `/work-plans/${workPlanId}/tasks/${taskId}/status`,
      data
    );
    return response.data;
  },
};
