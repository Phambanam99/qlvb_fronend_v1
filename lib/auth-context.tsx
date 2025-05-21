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
import { isTokenExpired } from "@/lib/utils";
import { UserDTO as User } from "./api";

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

  const validateToken = () => {
    const token = localStorage.getItem("token");

    if (isTokenExpired(token)) {
      console.log(
        "AuthContext: Token hết hạn hoặc không hợp lệ, tự động đăng xuất"
      );
      localStorage.removeItem("token");
      Cookies.remove("auth-token");
      setUser(null);
      setIsAuthenticated(false);

      if (window.location.pathname !== "/dang-nhap") {
        router.push("/dang-nhap?session_expired=true");
      }
      return false;
    }
    return true;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AuthContext: Checking authentication status...");
        const token = localStorage.getItem("token");

        if (token && !isTokenExpired(token)) {
          console.log(
            "AuthContext: Token found and valid, fetching current user..."
          );
          const userData = await authAPI.getCurrentUser();
          if (userData) {
            console.log(
              "AuthContext: User data retrieved successfully:",
              userData
            );
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
          if (token) {
            console.log("AuthContext: Token found but expired");
          } else {
            console.log("AuthContext: No token found");
          }
          localStorage.removeItem("token");
          Cookies.remove("auth-token");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("AuthContext: Auth check failed:", err);
        localStorage.removeItem("token");
        Cookies.remove("auth-token");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        if (!isAuthenticated) {
          setDataLoading(false);
        }
      }
    };

    checkAuth();

    const tokenCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        validateToken();
      }
    }, 60000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean
  ) => {
    try {
      setLoading(true);
      setDataLoading(true);
      setError(null);
      console.log("Đang thực hiện đăng nhập cho tài khoản:", username);
      const userData = await authAPI.login(username, password);
      const { token, user } = userData;

      localStorage.setItem("token", token);
      if (rememberMe) {
        Cookies.set("auth-token", token, { expires: 30, sameSite: "strict" });
      } else {
        Cookies.set("auth-token", token, { sameSite: "strict" });
      }

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

      try {
      } catch (preloadError) {
        console.error("Không thể tải trước dữ liệu quan trọng:", preloadError);
      }

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
      if (!validateToken()) {
        setUser(null);
        return;
      }

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

  const hasPermission = (permission: string) => {
    if (!user) return false;
    console.log("User roles:", user.roles[0]);
    return user.roles.includes(permission);
  };

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
