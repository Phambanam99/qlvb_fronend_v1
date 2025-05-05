import { create } from "zustand"
import { IncomingDocumentDTO } from "./api/incomingDocuments"
import { OutgoingDocumentDTO } from "./api/outgoingDocuments"
import { WorkPlanDTO } from "./api/workPlans"
import { ScheduleDTO } from "./api/schedules"

// Incoming Documents Store
interface IncomingDocumentsState {
  incomingDocuments: IncomingDocumentDTO[]
  loading: boolean
  setIncomingDocuments: (documents: IncomingDocumentDTO[]) => void
  setLoading: (loading: boolean) => void
}

export const useIncomingDocuments = create<IncomingDocumentsState>((set) => ({
  incomingDocuments: [],
  loading: false,
  setIncomingDocuments: (documents) => set({ incomingDocuments: documents }),
  setLoading: (loading) => set({ loading }),
}))

// Outgoing Documents Store
interface OutgoingDocumentsState {
  outgoingDocuments: any[]
  loading: boolean
  setOutgoingDocuments: (documents: any[]) => void
  setLoading: (loading: boolean) => void
}

export const useOutgoingDocuments = create<OutgoingDocumentsState>((set) => ({
  outgoingDocuments: [],
  loading: false,
  setOutgoingDocuments: (documents) => set({ outgoingDocuments: documents }),
  setLoading: (loading) => set({ loading }),
}))

// Work Plans Store
interface WorkPlansState {
  workPlans: WorkPlanDTO[]
  loading: boolean
  setWorkPlans: (workPlans: WorkPlanDTO[]) => void
  setLoading: (loading: boolean) => void
}

export const useWorkPlans = create<WorkPlansState>((set) => ({
  workPlans: [],
  loading: false,
  setWorkPlans: (workPlans) => set({ workPlans }),
  setLoading: (loading) => set({ loading }),
}))

// Schedules Store
interface SchedulesState {
  schedules: ScheduleDTO[]
  loading: boolean
  setSchedules: (schedules: ScheduleDTO[]) => void
  setLoading: (loading: boolean) => void
}

export const useSchedules = create<SchedulesState>((set) => ({
  schedules: [],
  loading: false,
  setSchedules: (schedules) => set({ schedules }),
  setLoading: (loading) => set({ loading }),
}))

// User Store
interface UserState {
  user: any | null
  isAuthenticated: boolean
  loading: boolean
  setUser: (user: any | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useUser = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

// Dashboard Store
interface DashboardState {
  stats: {
    incomingDocuments: { total: number; pending: number }
    outgoingDocuments: { total: number; pending: number }
    workPlans: { total: number; active: number }
    schedules: { total: number; today: number }
  }
  recentDocuments: any[]
  todayEvents: any[]
  loading: boolean
  error: string | null
  setStats: (stats: any) => void
  setRecentDocuments: (documents: any[]) => void
  setTodayEvents: (events: any[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDashboard = create<DashboardState>((set) => ({
  stats: {
    incomingDocuments: { total: 0, pending: 0 },
    outgoingDocuments: { total: 0, pending: 0 },
    workPlans: { total: 0, active: 0 },
    schedules: { total: 0, today: 0 },
  },
  recentDocuments: [],
  todayEvents: [],
  loading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setRecentDocuments: (documents) => set({ recentDocuments: documents }),
  setTodayEvents: (events) => set({ todayEvents: events }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
