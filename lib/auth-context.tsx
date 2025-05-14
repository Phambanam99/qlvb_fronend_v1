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
  dataLoading: boolean;
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
  setDataLoaded: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AuthContext: Checking authentication status...");
        const token = localStorage.getItem("token");
        if (token) {
          console.log("AuthContext: Token found, fetching current user...");
          const userData = await authAPI.getCurrentUser();
          if (userData) {
            console.log(
              "AuthContext: User data retrieved successfully:",
              userData
            );
            // Đảm bảo fullName được thiết lập
            setUser({
              ...userData,
              fullName: userData.fullName || userData.name,
            });
            setIsAuthenticated(true);
          } else {
            console.warn("AuthContext: User data is empty or invalid");
            setIsAuthenticated(false);
          }
        } else {
          console.log("AuthContext: No token found");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("AuthContext: Auth check failed:", err);
        // Xóa token nếu không hợp lệ
        localStorage.removeItem("token");
        Cookies.remove("auth-token");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        // Nếu không xác thực được, đánh dấu dữ liệu đã tải xong để tránh vòng lặp loading
        if (!isAuthenticated) {
          setDataLoading(false);
        }
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
      // Reset data loading state on login
      setDataLoading(true);
      setError(null);
      console.log("Đang thực hiện đăng nhập cho tài khoản:", username);
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

      // Thiết lập thông tin người dùng
      const userInfo = {
        id: String(userData.user.id),
        name: userData.user.name,
        username: userData.user.username,
        email: userData.user.email,
        roles: userData.user.roles,
        departmentId: userData.user.departmentId,
        fullName: userData.user.name || userData.user.fullName,
      };

      console.log("Login successful", userInfo);
      setUser(userInfo);
      setIsAuthenticated(true);

      // Tải trước một số dữ liệu cần thiết nếu có
      try {
        // Bạn có thể thêm các lời gọi API quan trọng vào đây
        // Ví dụ: tải thông tin người dùng chi tiết hơn, quyền, v.v.
      } catch (preloadError) {
        console.error("Không thể tải trước dữ liệu quan trọng:", preloadError);
      }

      // Trả về true để báo hiệu đăng nhập thành công
      return true;
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      return false;
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

  // Add method to set data as loaded
  const setDataLoaded = () => {
    setDataLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        dataLoading,
        error,
        hasRole,
        hasPermission,
        checkAuth,
        setDataLoaded,
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
