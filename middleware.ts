import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Danh sách các đường dẫn không cần xác thực
const publicPaths = ["/dang-nhap", "/quen-mat-khau", "/api"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Kiểm tra xem đường dẫn hiện tại có phải là đường dẫn công khai không
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path) || pathname.includes("/_next/"))

  // Lấy token từ cookie hoặc localStorage
  const token = request.cookies.get("auth-token")?.value

  // Nếu không có token và không phải đường dẫn công khai, chuyển hướng đến trang đăng nhập
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/dang-nhap", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Nếu có token và đang ở trang đăng nhập, chuyển hướng đến trang chủ
  if (token && pathname === "/dang-nhap") {
    const homeUrl = new URL("/", request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

// Chỉ áp dụng middleware cho các đường dẫn sau
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
