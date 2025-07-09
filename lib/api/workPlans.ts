import { api } from "./config";

export interface WorkPlanTaskDTO {
  id?: number;
  title: string;
  description: string;
  assigneeId?: number;
  assigneeName?: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
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
   * Submit work plan for approval
   * @param id Work plan ID
   * @returns Updated work plan data
   */
  submitWorkPlan: async (id: string | number): Promise<WorkPlanDTO> => {
    const response = await api.patch(`/work-plans/${id}/submit`);
    return response.data;
  },

  /**
   * Approve or reject work plan
   * @param id Work plan ID
   * @param data Approval data with approved flag and comments
   * @returns Updated work plan data
   */
  approveWorkPlan: async (
    id: number | string,
    data: { approved: boolean; comments?: string }
  ): Promise<WorkPlanDTO> => {
    const response = await api.patch(`/work-plans/${id}/approve`, data);
    return response.data;
  },

  /**
   * Start work plan execution (move from approved to in_progress)
   * @param id Work plan ID
   * @returns Updated work plan data
   */
  startWorkPlan: async (id: number | string): Promise<WorkPlanDTO> => {
    const response = await api.patch(`/work-plans/${id}/start`);
    return response.data;
  },

  /**
   * Complete work plan (move from in_progress to completed)
   * @param id Work plan ID
   * @returns Updated work plan data
   */
  completeWorkPlan: async (id: number | string): Promise<WorkPlanDTO> => {
    const response = await api.patch(`/work-plans/${id}/complete`);
    return response.data;
  },

  /**
   * Update task status and progress
   * @param workPlanId Work plan ID
   * @param taskId Task ID
   * @param data Status update data
   * @returns Updated task data
   */
  updateTaskStatus: async (
    workPlanId: string | number,
    taskId: string | number,
    data: { status?: string; progress?: number; comments?: string }
  ): Promise<WorkPlanTaskDTO> => {
    const response = await api.patch(
      `/work-plans/${workPlanId}/tasks/${taskId}/status`,
      data
    );
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
};
