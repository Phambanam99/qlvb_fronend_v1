import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Use localStorage only in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password })
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
}

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get("/users")
    return response.data
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  createUser: async (userData: any) => {
    const response = await api.post("/users", userData)
    return response.data
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}

// Incoming Documents API
export const incomingDocumentsAPI = {
  getAllDocuments: async () => {
    const response = await api.get("/incoming-documents")
    return response.data
  },
  getDocumentById: async (id: string) => {
    const response = await api.get(`/incoming-documents/${id}`)
    return response.data
  },
  createDocument: async (documentData: any) => {
    const response = await api.post("/incoming-documents", documentData)
    return response.data
  },
  updateDocument: async (id: string, documentData: any) => {
    const response = await api.put(`/incoming-documents/${id}`, documentData)
    return response.data
  },
  assignDocument: async (id: string, assignmentData: any) => {
    const response = await api.post(`/incoming-documents/${id}/assign`, assignmentData)
    return response.data
  },
  deleteDocument: async (id: string) => {
    const response = await api.delete(`/incoming-documents/${id}`)
    return response.data
  },
}

// Document Responses API
export const documentResponsesAPI = {
  createResponse: async (responseData: any) => {
    const response = await api.post("/document-responses", responseData)
    return response.data
  },
  getResponseById: async (id: string) => {
    const response = await api.get(`/document-responses/${id}`)
    return response.data
  },
  updateResponse: async (id: string, responseData: any) => {
    const response = await api.put(`/document-responses/${id}`, responseData)
    return response.data
  },
  deleteResponse: async (id: string) => {
    const response = await api.delete(`/document-responses/${id}`)
    return response.data
  },
}

// Outgoing Documents API
export const outgoingDocumentsAPI = {
  getAllDocuments: async () => {
    const response = await api.get("/outgoing-documents")
    return response.data
  },
  getDocumentById: async (id: string) => {
    const response = await api.get(`/outgoing-documents/${id}`)
    return response.data
  },
  createDocument: async (documentData: any) => {
    const response = await api.post("/outgoing-documents", documentData)
    return response.data
  },
  updateDocument: async (id: string, documentData: any) => {
    const response = await api.put(`/outgoing-documents/${id}`, documentData)
    return response.data
  },
  approveDocument: async (id: string, approvalData: any) => {
    const response = await api.post(`/outgoing-documents/${id}/approve`, approvalData)
    return response.data
  },
  deleteDocument: async (id: string) => {
    const response = await api.delete(`/outgoing-documents/${id}`)
    return response.data
  },
}

// Work Plans API
export const workPlansAPI = {
  getAllWorkPlans: async () => {
    const response = await api.get("/work-plans")
    return response.data
  },
  getWorkPlanById: async (id: string) => {
    const response = await api.get(`/work-plans/${id}`)
    return response.data
  },
  createWorkPlan: async (workPlanData: any) => {
    const response = await api.post("/work-plans", workPlanData)
    return response.data
  },
  updateWorkPlan: async (id: string, workPlanData: any) => {
    const response = await api.put(`/work-plans/${id}`, workPlanData)
    return response.data
  },
  deleteWorkPlan: async (id: string) => {
    const response = await api.delete(`/work-plans/${id}`)
    return response.data
  },
}

// Schedules API
export const schedulesAPI = {
  getAllSchedules: async () => {
    const response = await api.get("/schedules")
    return response.data
  },
  getScheduleById: async (id: string) => {
    const response = await api.get(`/schedules/${id}`)
    return response.data
  },
  getScheduleEvents: async (params: any) => {
    const response = await api.get("/schedules/events", { params })
    return response.data
  },
  createSchedule: async (scheduleData: any) => {
    const response = await api.post("/schedules", scheduleData)
    return response.data
  },
  updateSchedule: async (id: string, scheduleData: any) => {
    const response = await api.put(`/schedules/${id}`, scheduleData)
    return response.data
  },
  approveSchedule: async (id: string, approvalData: any) => {
    const response = await api.post(`/schedules/${id}/approve`, approvalData)
    return response.data
  },
  deleteSchedule: async (id: string) => {
    const response = await api.delete(`/schedules/${id}`)
    return response.data
  },
}

export default api
