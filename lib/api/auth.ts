import api from "./config"

export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  fullName: any
  token: string
  user: {
    id: number
    username: string
    name: string
    email: string
    roles: string[]
    useRoles: string[]
    status: string
  }
}

export const authAPI = {
  /**
   * Login user
   * @param username Username
   * @param password Password
   * @returns Authentication response with token and user info
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", { username, password })
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  /**
   * Register new user
   * @param userData User data
   * @returns Created user data
   */
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  /**
   * Get current user information
   * @returns Current user data
   */
  getCurrentUser: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
}
