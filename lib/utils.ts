import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lấy thông tin variant và text cho Badge tương ứng với trạng thái văn bản
 * @param status Mã trạng thái văn bản
 * @param displayName Tên hiển thị của trạng thái (tùy chọn)
 * @returns Object chứa variant và text tương ứng cho Badge
 */
export function getStatusBadgeInfo(status: string, displayName?: string): { variant: "destructive" | "default" | "success" | "secondary" | "outline", text: string } {
  // Biến đổi từ snake_case sang camelCase nếu cần
  const normalizedStatus = status.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  
  // Bảng ánh xạ từ trạng thái đến variant và hiển thị
  const statusMap: Record<string, { variant: "destructive" | "default" | "success" | "secondary" | "outline", display: string }> = {
    // Văn bản đến
    draft: { variant: "outline", display: "Dự thảo" },
    registered: { variant: "outline", display: "Đã đăng ký" },
    distributed: { variant: "secondary", display: "Đã phân phối" },
    deptAssigned: { variant: "secondary", display: "Phòng đã phân công" },
    pendingApproval: { variant: "outline", display: "Chờ phê duyệt" },
    specialistProcessing: { variant: "secondary", display: "Chuyên viên đang xử lý" },
    specialistSubmitted: { variant: "secondary", display: "Chuyên viên đã trình" },
    leaderReviewing: { variant: "secondary", display: "Lãnh đạo đang xem xét" },
    leaderApproved: { variant: "success", display: "Lãnh đạo đã phê duyệt" },
    leaderCommented: { variant: "secondary", display: "Lãnh đạo đã cho ý kiến" },
    published: { variant: "success", display: "Đã ban hành" },
    completed: { variant: "success", display: "Hoàn thành" },
    rejected: { variant: "destructive", display: "Từ chối" },
    archived: { variant: "outline", display: "Lưu trữ" },
    
    // Văn bản đi
    sent: { variant: "success", display: "Đã gửi" },
    approved: { variant: "success", display: "Đã phê duyệt" },
    
    // Văn bản phản hồi
    pendingLeaderReview: { variant: "outline", display: "Chờ ý kiến chỉ huy" },
  };
  
  // Lấy thông tin từ bảng ánh xạ, hoặc dùng giá trị mặc định
  const statusInfo = statusMap[normalizedStatus] || { variant: "outline", display: "Không xác định" };
  
  // Sử dụng displayName nếu được cung cấp, ngược lại dùng display từ bảng ánh xạ
  return {
    variant: statusInfo.variant,
    text: displayName || statusInfo.display
  };
}
