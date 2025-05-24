"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  ArrowLeft,
  UserCog,
  Key,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { usersAPI } from "@/lib/api/users";
import { rolesAPI } from "@/lib/api/roles";
import { departmentsAPI } from "@/lib/api/departments";
import UserProfileForm from "@/components/user-profile-form";
import UserRoleForm from "@/components/user-role-form";
import UserPasswordForm from "@/components/user-password-form";
import UserStatusForm from "@/components/user-status-form";
import { cp } from "fs";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, rolesData, departmentsData] = await Promise.all([
          usersAPI.getUserById(userId),
          rolesAPI.getAllRoles(),
          departmentsAPI.getAllDepartments(),
        ]);

        setUser(userData);
        setRoles(rolesData);
        setDepartments(departmentsData.content);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Lỗi",
          description:
            "Không thể tải thông tin người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleUpdateProfile = async (data: any) => {
    try {
      setSaving(true);
      const updatedUser = await usersAPI.updateUser(userId, data);
      setUser(updatedUser);
      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      console.log(data);
      setSaving(true);
      const updatedUser = await usersAPI.updateUser(userId, data);
      setUser(updatedUser);
      toast({
        title: "Thành công",
        description: "Vai trò và phòng ban đã được cập nhật",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể cập nhật vai trò và phòng ban. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (data: any) => {
    try {
      setSaving(true);
      await usersAPI.resetPassword(userId, data.newPassword);
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được đặt lại",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (data: any) => {
    try {
      console.log(data);
      setSaving(true);
      const updatedUser = await usersAPI.updateUser(userId, data);
      setUser(updatedUser);
      toast({
        title: "Thành công",
        description: `Tài khoản đã được ${
          data.isActive ? "kích hoạt" : "vô hiệu hóa"
        }`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Lỗi",
        description:
          "Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-2">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-xl font-semibold">Không tìm thấy người dùng</h2>
        <p className="text-muted-foreground">
          Người dùng không tồn tại hoặc đã bị xóa
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <UserCog className="h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="role" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Vai trò & Phòng ban
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-1">
            <Key className="h-4 w-4" />
            Đặt lại mật khẩu
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Trạng thái tài khoản
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm
                user={user}
                onSubmit={handleUpdateProfile}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role">
          <Card>
            <CardHeader>
              <CardTitle>Vai trò & Phòng ban</CardTitle>
              <CardDescription>
                Quản lý vai trò và phòng ban của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleForm
                user={user}
                roles={roles}
                departments={departments}
                onSubmit={handleUpdateRole}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Đặt lại mật khẩu</CardTitle>
              <CardDescription>Đặt lại mật khẩu cho người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <UserPasswordForm
                onSubmit={handleChangePassword}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái tài khoản</CardTitle>
              <CardDescription>
                Kích hoạt hoặc vô hiệu hóa tài khoản người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserStatusForm
                user={user}
                onSubmit={handleUpdateStatus}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
