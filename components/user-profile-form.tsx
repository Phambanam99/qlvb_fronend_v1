"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { userAgent } from "next/server";

// Available positions for selection
const POSITION_OPTIONS = [
  { value: "ROLE_CUC_TRUONG", label: "Cục trưởng" },
  { value: "ROLE_CUC_PHO", label: "Cục phó" },
  { value: "ROLE_CHINH_UY", label: "Chính ủy" },
  { value: "ROLE_PHO_CHINH_UY", label: "Phó Chính ủy" },
  { value: "ROLE_TRUONG_PHONG", label: "Trưởng phòng" },
  { value: "ROLE_PHO_PHONG", label: "Phó phòng" },
  { value: "ROLE_TRAM_TRUONG", label: "Trạm trưởng" },
  { value: "ROLE_PHO_TRAM_TRUONG", label: "Phó Trạm trưởng" },
  { value: "ROLE_CHINH_TRI_VIEN_TRAM", label: "Chính trị viên trạm" },
  { value: "ROLE_CUM_TRUONG", label: "Cụm trưởng" },
  { value: "ROLE_PHO_CUM_TRUONG", label: "Phó cụm trưởng" },
  { value: "ROLE_CHINH_TRI_VIEN_CUM", label: "Chính trị viên cụm" },
  { value: "ROLE_TRUONG_BAN", label: "Trưởng Ban" },
  { value: "ROLE_NHAN_VIEN", label: "Nhân viên" },
  { value: "ROLE_CAN_BO", label: "Cán bộ" },
];

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Họ tên phải có ít nhất 2 ký tự",
  }),
  username: z.string().min(2, {
    message: "Tên đăng nhập phải có ít nhất 2 ký tự",
  }),
  email: z.string().email({
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
}

export default function UserProfileForm({
  user,
  onSubmit,
  saving,
}: UserProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      position: user.roles?.[0] || "",
    },
  });

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
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Số điện thoại</FormLabel>
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
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {POSITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                  <Input placeholder="Nhập tên đăng nhập" {...field} />
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
