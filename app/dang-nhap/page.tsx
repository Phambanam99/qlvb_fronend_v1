"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, InfoIcon, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui/error-message";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showAdminNotice, setShowAdminNotice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hiển thị thông báo liên hệ Admin lần đầu truy cập trang đăng nhập
  useEffect(() => {
    try {
      const flag = typeof window !== 'undefined' ? localStorage.getItem('qlvb:firstLoginNoticeShown') : '1';
      if (!flag) {
        setShowAdminNotice(true);
        // Tự ẩn sau 10s
        const timer = setTimeout(() => {
          setShowAdminNotice(false);
          localStorage.setItem('qlvb:firstLoginNoticeShown', '1');
        }, 10000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { login } = useAuth();
  const { toast } = useToast();

  // Kiểm tra xem người dùng có đến từ phiên hết hạn không
  useEffect(() => {
    const hasExpired = searchParams.get("session_expired") === "true";
    if (hasExpired) {
      setSessionExpired(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Đăng nhập và đợi cho đến khi hoàn tất
      const loginResult = await login(username, password, rememberMe);
      
      // console.log("loginResult", loginResult);

      if (loginResult === true) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });

        // Đợi một chút để đảm bảo token được lưu trữ đúng cách
        // và các state trong AuthContext được cập nhật
        setTimeout(() => {
          // console.log("🚀 Đang chuyển hướng sau khi đăng nhập thành công...");
          router.push(callbackUrl);
        }, 100);
      } else {
        // Xử lý trường hợp loginResult không phải true (có thể undefined hoặc false)
        setError(
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
        );
      }
    } catch (error: any) {
      // console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
     

        <Card className="border-primary/10 shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin đăng nhập của bạn để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showAdminNotice && (
              <Alert className="mb-4 animate-in fade-in slide-in-from-top-1">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Sau khi đăng nhập lần đầu, vui lòng liên hệ <span className="font-medium">Admin (Đ/c Hiếu/PTM – Trợ lý KHQS; Đ/c Nam – Phòng 7)</span> để được cập nhật / chuẩn hóa chức vụ và phòng ban.
                </AlertDescription>
              </Alert>
            )}
            {sessionExpired && (
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.
                </AlertDescription>
              </Alert>
            )}
            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang đăng
                    nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-muted-foreground">
              <div className="flex flex-col space-y-4">
                <div className="pt-2">
                  Chưa có tài khoản?{" "}
                  <Link href="/dang-ky" className="text-primary font-medium">
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
