"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { rolesAPI, type RoleDTO } from "@/lib/api/roles";

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Họ tên phải có ít nhất 2 ký tự",
  }),
  username: z.string().min(2, {
    message: "Tên đăng nhập phải có ít nhất 2 ký tự",
  }),
  email: z.string().optional().refine((val) => {
    if (!val || val === "") return true; // Allow empty
    return z.string().email().safeParse(val).success;
  }, {
    message: "Email không hợp lệ",
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileFormProps {
  user: any;
  onSubmit: (data: ProfileFormValues) => void;
  saving: boolean;
  isProfileEdit?: boolean; // Add flag to indicate if this is for profile editing
}

export default function UserProfileForm({
  user,
  onSubmit,
  saving,
  isProfileEdit = false,
}: UserProfileFormProps) {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      position: user.roleDisplayNames?.[0] || "",
    },
  });

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const rolesData = await rolesAPI.getAllRoles();
        
        // Handle both direct array and wrapped response
        const rolesArray = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
        setRoles(rolesArray);
      } catch (error) {
        setRoles([]); // Set empty array on error
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập họ và tên" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-muted-foreground">(không bắt buộc)</span></FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại <span className="text-muted-foreground">(không bắt buộc)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Nhập số điện thoại" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chức vụ</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingRoles ? "Đang tải..." : "Chọn chức vụ"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingRoles ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tải danh sách chức vụ...
                        </div>
                      </SelectItem>
                    ) : !Array.isArray(roles) || roles.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Không có chức vụ nào
                      </SelectItem>
                    ) : (
                      roles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.displayName || role.name || ""}
                        >
                          {role.displayName || role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập tên đăng nhập" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
