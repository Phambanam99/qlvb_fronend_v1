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
import { Loader2, Save } from "lucide-react";
import { usersAPI } from "@/lib/api/users";

export default function ProfilePage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Thêm thông báo
    addNotification({
      title: "Hồ sơ đã được cập nhật",
      message: "Thông tin hồ sơ của bạn đã được cập nhật thành công.",
      type: "success",
    });

    setIsSubmitting(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Lấy giá trị mật khẩu từ form
      const formElement = e.target as HTMLFormElement;
      const currentPassword = formElement["current-password"].value;
      const newPassword = formElement["new-password"].value;
      const confirmPassword = formElement["confirm-password"].value;

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
      if (newPassword !== confirmPassword) {
        addNotification({
          title: "Lỗi xác nhận mật khẩu",
          message: "Mật khẩu mới và xác nhận mật khẩu không khớp nhau.",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra độ mạnh của mật khẩu
      if (newPassword.length < 8) {
        addNotification({
          title: "Mật khẩu không đủ mạnh",
          message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra mật khẩu hiện tại có đúng không bằng API
      if (user?.id) {
        const { valid } = await usersAPI.checkCurrentPassword(
          user.id,
          currentPassword
        );

        if (!valid) {
          addNotification({
            title: "Mật khẩu hiện tại không đúng",
            message: "Vui lòng nhập đúng mật khẩu hiện tại của bạn.",
            type: "error",
          });
          setIsSubmitting(false);
          return;
        }

        // Nếu mật khẩu hiện tại đúng, thực hiện đổi mật khẩu
        await usersAPI.changePassword(user.id, currentPassword, newPassword);

        // Xóa dữ liệu trong form
        formElement.reset();

        // Thông báo thành công
        addNotification({
          title: "Đổi mật khẩu thành công",
          message: "Mật khẩu của bạn đã được thay đổi thành công.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
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
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và tài khoản của bạn
        </p>
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
                {user?.avatar || "??"}
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
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
            </TabsList>
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
                      <Input id="current-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Mật khẩu mới</Label>
                      <Input id="new-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Xác nhận mật khẩu mới
                      </Label>
                      <Input id="confirm-password" type="password" required />
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
