"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import Cookies from "js-cookie";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string;
  department?: string;
  departmentId?: string;
  // Thêm trường fullName để tương thích với code hiện tại
  fullName?: string;
}

// Add the hasPermission method to the AuthContextType interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (
    username: string,
    password: string,
    rememberMe: boolean
  ) => Promise<boolean | undefined>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await authAPI.getCurrentUser();
          if (userData) {
            // Đảm bảo fullName được thiết lập
            setUser({
              ...userData,
              fullName: userData.fullName || userData.name,
            });
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // Xóa token nếu không hợp lệ
        localStorage.removeItem("token");
        Cookies.remove("auth-token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Login successful");
      const userData = await authAPI.login(username, password);
      // Đảm bảo fullName được thiết lập
      const { token, user } = userData;

      // Lưu token vào localStorage và cookie
      localStorage.setItem("token", token);
      if (rememberMe) {
        // 30 ngày nếu "Ghi nhớ đăng nhập"
        Cookies.set("auth-token", token, { expires: 30, sameSite: "strict" });
      } else {
        // Session cookie nếu không "Ghi nhớ đăng nhập"
        Cookies.set("auth-token", token, { sameSite: "strict" });
      }
      setUser({
        id: String(userData.user.id),
        name: userData.user.name,
        username: userData.user.username,
        email: userData.user.email,
        roles: userData.user.roles,
        fullName: userData.user.name || userData.fullName,
      });
      setIsAuthenticated(true);
      // Trả về true để báo hiệu đăng nhập thành công
      return true;
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // await authAPI.logout()
      localStorage.removeItem("token");
      Cookies.remove("auth-token");
      setUser(null);
      router.push("/dang-nhap");
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const userData = await authAPI.getCurrentUser();
      if (userData) {
        setUser({
          ...userData,
          fullName: userData.fullName || userData.name,
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.some((r) => user.roles.includes(r));
    }
    return user.roles.includes(role);
  };

  // Thêm hàm hasPermission để tương thích với code hiện tại
  const hasPermission = (permission: string) => {
    // Giả định rằng quyền được lưu trong roles
    if (!user) return false;
    console.log("User roles:", user.roles[0]);
    return user.roles.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        error,
        hasRole,
        hasPermission,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
