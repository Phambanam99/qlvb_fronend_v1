import axios from "axios";
import type { ResponseDTO } from "./types";

// API base URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create axios instance with common configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// List các endpoint không cần auth
const publicEndpoints = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

// Hàm kiểm tra xem request có cần token không
function requiresAuth(url?: string): boolean {
  if (!url) return true;
  return !publicEndpoints.some((path) => url.includes(path));
}

// Helper function to check if response is in ResponseDTO format
function isResponseDTO<T>(data: any): data is ResponseDTO<T> {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.success === 'boolean' &&
    typeof data.message === 'string' &&
    'data' in data
  );
}

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Use localStorage only in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (requiresAuth(config.url)) {
        // Validate token before adding to header
        if (token && token !== "undefined" && token !== "null") {
          config.headers.Authorization = `Bearer ${token}`;
          // Debug log để verify
          console.log(
            "API Request: Added Authorization header:",
            config.headers.Authorization.substring(0, 20) + "..."
          );
        } else {
          console.warn(
            "API Request: No valid token available for:",
            config.url
          );
          delete config.headers.Authorization;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle ResponseDTO format and common errors
api.interceptors.response.use(
  (response) => {
    // Check if the response data is in ResponseDTO format
    if (isResponseDTO(response.data)) {
      const responseDTO = response.data as ResponseDTO<any>;
      
      // If the backend indicates failure, throw an error with the message
      if (!responseDTO.success) {
        const error = new Error(responseDTO.message || 'Request failed');
        (error as any).isResponseDTOError = true;
        (error as any).responseDTO = responseDTO;
        throw error;
      }
      
      // Return the actual data from the ResponseDTO
      response.data = responseDTO.data;
    }
    
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Check if error response is also in ResponseDTO format
      if (isResponseDTO(error.response.data)) {
        const responseDTO = error.response.data as ResponseDTO<any>;
        error.message = responseDTO.message || error.message;
      }

      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/dang-nhap";
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API Error: No response received", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
