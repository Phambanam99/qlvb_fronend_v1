import { create } from "zustand"
import { persist } from "zustand/middleware"

// Định nghĩa các interface cho dữ liệu
interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: string
  department: string
  permissions?: string[]
}

interface Document {
  id: number
  title: string
  number: string
  issuedDate: string
  receivedDate: string
  sender: string
  type: string
  priority: string
  status: string
}

interface WorkPlan {
  id: number
  title: string
  startDate: string
  endDate: string
  department: string
  status: string
}

interface Schedule {
  id: number
  title: string
  date: string
  department: string
  status: string
}

// Định nghĩa state cho store
interface AppState {
  // Dữ liệu
  incomingDocuments: Document[]
  outgoingDocuments: Document[]
  workPlans: WorkPlan[]
  schedules: Schedule[]
  users: User[]

  // Trạng thái loading
  loadingIncomingDocuments: boolean
  loadingOutgoingDocuments: boolean
  loadingWorkPlans: boolean
  loadingSchedules: boolean
  loadingUsers: boolean

  // Actions
  setIncomingDocuments: (documents: Document[]) => void
  setOutgoingDocuments: (documents: Document[]) => void
  setWorkPlans: (workPlans: WorkPlan[]) => void
  setSchedules: (schedules: Schedule[]) => void
  setUsers: (users: User[]) => void

  setLoadingIncomingDocuments: (loading: boolean) => void
  setLoadingOutgoingDocuments: (loading: boolean) => void
  setLoadingWorkPlans: (loading: boolean) => void
  setLoadingSchedules: (loading: boolean) => void
  setLoadingUsers: (loading: boolean) => void

  // Cache management
  clearCache: () => void
}

// Tạo store với zustand
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Khởi tạo state
      incomingDocuments: [],
      outgoingDocuments: [],
      workPlans: [],
      schedules: [],
      users: [],

      loadingIncomingDocuments: false,
      loadingOutgoingDocuments: false,
      loadingWorkPlans: false,
      loadingSchedules: false,
      loadingUsers: false,

      // Actions để cập nhật state
      setIncomingDocuments: (documents) => set({ incomingDocuments: documents }),
      setOutgoingDocuments: (documents) => set({ outgoingDocuments: documents }),
      setWorkPlans: (workPlans) => set({ workPlans }),
      setSchedules: (schedules) => set({ schedules }),
      setUsers: (users) => set({ users }),

      setLoadingIncomingDocuments: (loading) => set({ loadingIncomingDocuments: loading }),
      setLoadingOutgoingDocuments: (loading) => set({ loadingOutgoingDocuments: loading }),
      setLoadingWorkPlans: (loading) => set({ loadingWorkPlans: loading }),
      setLoadingSchedules: (loading) => set({ loadingSchedules: loading }),
      setLoadingUsers: (loading) => set({ loadingUsers: loading }),

      // Xóa cache
      clearCache: () =>
        set({
          incomingDocuments: [],
          outgoingDocuments: [],
          workPlans: [],
          schedules: [],
          users: [],
        }),
    }),
    {
      name: "document-management-store",
      partialize: (state) => ({
        // Chỉ lưu trữ dữ liệu, không lưu trạng thái loading
        incomingDocuments: state.incomingDocuments,
        outgoingDocuments: state.outgoingDocuments,
        workPlans: state.workPlans,
        schedules: state.schedules,
        users: state.users,
      }),
    },
  ),
)

// Hooks để sử dụng trong components
export const useIncomingDocuments = () => {
  const { incomingDocuments, loadingIncomingDocuments, setIncomingDocuments, setLoadingIncomingDocuments } =
    useAppStore()

  return {
    incomingDocuments,
    loading: loadingIncomingDocuments,
    setIncomingDocuments,
    setLoading: setLoadingIncomingDocuments,
  }
}

export const useOutgoingDocuments = () => {
  const { outgoingDocuments, loadingOutgoingDocuments, setOutgoingDocuments, setLoadingOutgoingDocuments } =
    useAppStore()

  return {
    outgoingDocuments,
    loading: loadingOutgoingDocuments,
    setOutgoingDocuments,
    setLoading: setLoadingOutgoingDocuments,
  }
}

export const useWorkPlans = () => {
  const { workPlans, loadingWorkPlans, setWorkPlans, setLoadingWorkPlans } = useAppStore()

  return {
    workPlans,
    loading: loadingWorkPlans,
    setWorkPlans,
    setLoading: setLoadingWorkPlans,
  }
}

export const useSchedules = () => {
  const { schedules, loadingSchedules, setSchedules, setLoadingSchedules } = useAppStore()

  return {
    schedules,
    loading: loadingSchedules,
    setSchedules,
    setLoading: setLoadingSchedules,
  }
}

export const useUsers = () => {
  const { users, loadingUsers, setUsers, setLoadingUsers } = useAppStore()

  return {
    users,
    loading: loadingUsers,
    setUsers,
    setLoading: setLoadingUsers,
  }
}
