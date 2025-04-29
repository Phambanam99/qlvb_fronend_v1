import api from "./config";

export interface ScheduleEventDTO {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  description?: string;
  participants: string[];
  scheduleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleDTO {
  id: number;
  title: string;
  description?: string;
  department: string;
  period: string;
  status: string;
  createdBy: string;
  approver?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  items?: ScheduleEventDTO[];
}

export interface ScheduleEventParams {
  date?: string;
  excludeId?: string;
  departmentId?: string;
}

export const schedulesAPI = {
  /**
   * Get all schedules
   * @returns List of all schedules
   */
  getAllSchedules: async (): Promise<ScheduleDTO[]> => {
    // const response = await api.get("/schedules")
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Get schedule by ID
   * @param id Schedule ID
   * @returns Schedule data
   */
  getScheduleById: async (id: string | number): Promise<ScheduleDTO> => {
    // const response = await api.get(`/schedules/${id}`)
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Get schedule events
   * @param params Query parameters
   * @returns List of schedule events
   */
  getScheduleEvents: async (
    params: ScheduleEventParams
  ): Promise<ScheduleEventDTO[]> => {
    // const response = await api.get("/schedules/events", { params })
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Get event by ID
   * @param id Event ID
   * @returns Event data
   */
  getEventById: async (id: string | number): Promise<ScheduleEventDTO> => {
    // const response = await api.get(`/schedules/events/${id}`)
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Create new schedule
   * @param scheduleData Schedule data
   * @returns Created schedule data
   */
  createSchedule: async (scheduleData: any): Promise<ScheduleDTO> => {
    // const response = await api.post("/schedules", scheduleData)
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Update schedule
   * @param id Schedule ID
   * @param scheduleData Schedule data to update
   * @returns Updated schedule data
   */
  updateSchedule: async (
    id: string | number,
    scheduleData: any
  ): Promise<ScheduleDTO> => {
    // const response = await api.put(`/schedules/${id}`, scheduleData)
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Delete schedule
   * @param id Schedule ID
   * @returns Success message
   */
  deleteSchedule: async (id: string | number): Promise<{ message: string }> => {
    // const response = await api.delete(`/schedules/${id}`)
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Approve schedule
   * @param id Schedule ID
   * @param data Approval data
   * @returns Updated schedule data
   */
  approveSchedule: async (
    id: string | number,
    data: { comments?: string }
  ): Promise<ScheduleDTO> => {
    // const response = await api.post(`/schedules/${id}/approve`, data)
    // return response.data
    return new Promise((resolve) => {});
  },

  /**
   * Reject schedule
   * @param id Schedule ID
   * @param data Rejection data
   * @returns Updated schedule data
   */
  rejectSchedule: async (
    id: string | number,
    data: { comments?: string }
  ): Promise<ScheduleDTO> => {
    // const response = await api.post(`/schedules/${id}/reject`, data)
    // return response.data
    return new Promise((resolve) => {});
  },

  // Thêm phương thức mới để tương thích với code hiện tại
  getRelatedSchedules: async (id: string | number): Promise<ScheduleDTO[]> => {
    // const response = await api.get(`/schedules/${id}/related`);
    // return response.data;
    return new Promise((resolve) => {});
  },
};
