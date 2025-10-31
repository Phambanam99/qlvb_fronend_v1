"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { usersAPI } from "@/lib/api/users";
import UserProfileForm from "@/components/user-profile-form";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  // Inline errors for password change form
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  // visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  // Helper: show browser notification (only on demand to avoid spamming permission dialog)
  const showBrowserNotification = (title: string, body: string) => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return; // Browser not support
    const spawn = () => {
      try {
        new Notification(title, { body });
      } catch {}
    };
    if (Notification.permission === 'granted') {
      spawn();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') spawn();
      }).catch(()=>{});
    }
  };

  const handleUpdateProfile = async (profileData: any) => {
    const updateProfile = {
      email: profileData.email,
      fullName: profileData.fullName,
      phone: profileData.phone,
      roles: [profileData.position],
      username: profileData.username,
    };
    
    if (!user?.id) {
      addNotification({
        title: "Lỗi",
        message: "Không thể xác định thông tin người dùng.",
        type: "error",
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await usersAPI.updateProfile(user.id, updateProfile);
      
      // Refresh the user data in auth context
      await refreshUser();
      
      addNotification({
        title: "Hồ sơ đã được cập nhật",
        message: "Thông tin hồ sơ của bạn đã được cập nhật thành công.",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Lỗi cập nhật hồ sơ",
        message: "Đã xảy ra lỗi khi cập nhật hồ sơ. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // reset inline errors
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    try {
      // Lấy giá trị mật khẩu từ form
      const formElement = e.target as HTMLFormElement;
      const currentPassword = formElement["current-password"].value;
      const newPassword = formElement["new-password"].value;
      const confirmPassword = formElement["confirm-password"].value;

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Mật khẩu xác nhận không khớp");
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra độ mạnh của mật khẩu
      if (newPassword.length < 8) {
        setNewPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra mật khẩu hiện tại có đúng không bằng API
      if (user?.id) {
        const data_ = await usersAPI.checkCurrentPassword(
          user.id,
          currentPassword
        );
        const valid = data_.valid;
        if (!valid) {
          setCurrentPasswordError("Mật khẩu hiện tại không đúng");
          setIsSubmitting(false);
          return;
        }

        // Nếu mật khẩu hiện tại đúng, thực hiện đổi mật khẩu
        await usersAPI.changePassword(user.id, currentPassword, newPassword);

        // Xóa dữ liệu trong form
        formElement.reset();

        // Thông báo thành công
        // Toast (nếu hoạt động)
        toast({
          title: "Đổi mật khẩu thành công",
          description: "Mật khẩu của bạn đã được thay đổi thành công.",
          variant: "success",
        });
        // Fallback thêm thông báo hệ thống
        addNotification({
          title: "Đổi mật khẩu thành công",
          message: "Mật khẩu của bạn đã được thay đổi thành công.",
          type: "success",
        });
        // Browser notification
        showBrowserNotification("Đổi mật khẩu thành công", "Mật khẩu của bạn đã được thay đổi.");
      }
    } catch (error) {
      addNotification({
        title: "Lỗi hệ thống",
        message: "Đã xảy ra lỗi khi thay đổi mật khẩu. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Hồ sơ cá nhân</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src="/placeholder.svg?height=128&width=128"
                alt="Avatar"
              />
              <AvatarFallback className="text-4xl">
                {user?.fullName?.charAt(0) || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-medium">
                {user?.fullName || "Người dùng"}
              </h3>
             
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phòng ban:</span>
                <span className="text-sm">
                  {user?.departmentName || "email@example.com"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vai trò:</span>
                <span className="text-sm">{user?.roleDisplayNames || "Người dùng"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tên đăng nhập:
                </span>
                <span className="text-sm">{user?.username || "username"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Cập nhật thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Thay đổi thông tin cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserProfileForm 
                    user={user}
                    roles={[]}
                    departments={[]}
                    onSubmit={handleUpdateProfile}
                    saving={isUpdatingProfile}
                    isProfileEdit={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <form onSubmit={handleChangePassword}>
                  <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>
                      Thay đổi mật khẩu đăng nhập của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Mật khẩu hiện tại
                      </Label>
                      <div className="relative">
                        <Input 
                          id="current-password" 
                          type={showCurrentPassword ? "text" : "password"} 
                          required 
                          className={currentPasswordError ? "pr-10 border-red-500 focus-visible:ring-red-500" : "pr-10"}
                          onChange={() => currentPasswordError && setCurrentPasswordError(null)}
                        />
                        <button
                          type="button"
                          aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {currentPasswordError && (
                        <p className="text-xs text-red-600">{currentPasswordError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Mật khẩu mới</Label>
                      <div className="relative">
                        <Input 
                          id="new-password" 
                          type={showNewPassword ? "text" : "password"} 
                          required 
                          className={newPasswordError ? "pr-10 border-red-500 focus-visible:ring-red-500" : "pr-10"}
                          onChange={() => newPasswordError && setNewPasswordError(null)}
                        />
                        <button
                          type="button"
                          aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newPasswordError && (
                        <p className="text-xs text-red-600">{newPasswordError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Xác nhận mật khẩu mới
                      </Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password" 
                          type={showConfirmPassword ? "text" : "password"} 
                          required 
                          className={confirmPasswordError ? "pr-10 border-red-500 focus-visible:ring-red-500" : "pr-10"}
                          onChange={() => confirmPasswordError && setConfirmPasswordError(null)}
                        />
                        <button
                          type="button"
                          aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <p className="text-xs text-red-600">{confirmPasswordError}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                          lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Đổi mật khẩu
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
