"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Send, UserCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  usersAPI,
  workflowAPI,
  DocumentWorkflowDTO,
  DocumentProcessingStatus,
  UserDTO,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface DepartmentHeadAssignmentProps {
  documentId: number;
  departmentId: number;
  closureDeadline?: string | Date; // Thêm closureDeadline từ văn bản đến
}

export default function DepartmentHeadAssignment({
  documentId,
  departmentId,
  closureDeadline,
}: DepartmentHeadAssignmentProps) {
  // Sử dụng số duy nhất cho người được chọn
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  // Sử dụng thời hạn từ văn bản đến nếu có
  const [deadline, setDeadline] = useState<Date | undefined>(
    closureDeadline ? new Date(closureDeadline) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // State cho danh sách cán bộ trong phòng
  const [departmentStaff, setDepartmentStaff] = useState<UserDTO[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const { toast } = useToast();

  // Tải danh sách cán bộ phòng ngay khi component được mount
  useEffect(() => {
    const fetchDepartmentStaff = async () => {
      if (!departmentId) {
        console.error("Missing departmentId");
        setIsLoadingStaff(false);
        return;
      }

      try {
        setIsLoadingStaff(true);
        console.log("Fetching staff for department:", departmentId);
        const staffData = await usersAPI.getUsersByDepartmentId(departmentId);
        console.log("Staff data received:", staffData);
        setDepartmentStaff(staffData);
      } catch (error) {
        console.error("Error fetching department staff:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách cán bộ trong phòng",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchDepartmentStaff();
  }, [departmentId, toast]);

  // Xử lý khi chọn người xử lý
  const handleStaffSelect = (staffId: number) => {
    setSelectedStaff(staffId);
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Đảm bảo selectedStaff có giá trị
    if (selectedStaff === null) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn cán bộ để phân công xử lý",
        variant: "destructive",
      });
      return;
    }

    if (!deadline) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn thời hạn xử lý",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Tạo đối tượng phân công xử lý
      const documentAssign: DocumentWorkflowDTO = {
        status: DocumentProcessingStatus.DEPT_ASSIGNED.code,
        statusDisplayName: DocumentProcessingStatus.DEPT_ASSIGNED.displayName,
        comments,
        closureDeadline: deadline,
        assignedToId: selectedStaff,
        documentId: documentId,
      };

      // Gửi dữ liệu phân công xử lý văn bản đến API
      await workflowAPI.assignToSpecialist(documentId, documentAssign);

      toast({
        title: "Thành công",
        description: "Đã phân công xử lý văn bản thành công",
      });

      // Chuyển về trang chi tiết
      router.push(`/van-ban-den/${documentId}`);
    } catch (error) {
      console.error("Lỗi khi phân công xử lý:", error);
      toast({
        title: "Lỗi",
        description: "Không thể phân công xử lý. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Phân công xử lý văn bản
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Phần chọn cán bộ xử lý */}
          <div className="space-y-2">
            <Label>Chọn cán bộ xử lý</Label>
            <div className="border rounded-md">
              <div className="bg-primary/5 px-4 py-2 border-b">
                <span className="text-sm font-medium">
                  Danh sách cán bộ trong phòng
                </span>
              </div>

              {isLoadingStaff ? (
                <div className="py-8 text-center text-muted-foreground">
                  Đang tải danh sách cán bộ...
                </div>
              ) : departmentStaff.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Không có cán bộ nào trong phòng
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <RadioGroup
                    value={selectedStaff?.toString() || ""}
                    onValueChange={(value) => handleStaffSelect(Number(value))}
                    className="space-y-0"
                  >
                    {departmentStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center px-4 py-3 border-b last:border-b-0 hover:bg-accent/50"
                      >
                        <RadioGroupItem
                          id={`staff-${staff.id}`}
                          value={staff.id.toString()}
                          className="mr-3"
                        />
                        <label
                          htmlFor={`staff-${staff.id}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Avatar className="h-8 w-8 bg-primary/10">
                            <AvatarFallback className="text-xs text-primary">
                              {staff.fullName?.substring(0, 2) || "NV"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {staff.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {staff.position || "Nhân viên"}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>

          {/* Hiển thị người được chọn */}
          <div className="space-y-2">
            <Label>Cán bộ được phân công</Label>
            <div className="flex flex-wrap gap-2 min-h-[50px] p-3 border rounded-md bg-accent/20">
              {selectedStaff === null ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                  Chưa có cán bộ nào được chọn
                </div>
              ) : (
                (() => {
                  const staff = departmentStaff.find(
                    (s) => s.id === selectedStaff
                  );
                  if (!staff) return null;

                  return (
                    <Badge
                      key={selectedStaff}
                      variant="secondary"
                      className="pl-2 pr-2 py-1.5 bg-primary/10"
                    >
                      <span>{staff.fullName}</span>
                    </Badge>
                  );
                })()
              )}
            </div>
          </div>

          {/* Thiết lập thời hạn xử lý */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Thời hạn xử lý</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="deadline"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "dd/MM/yyyy") : "Chọn thời hạn"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Nhập ý kiến chỉ đạo */}
          <div className="space-y-2">
            <Label htmlFor="comments">Ý kiến chỉ đạo</Label>
            <Textarea
              id="comments"
              placeholder="Nhập ý kiến chỉ đạo và yêu cầu đối với cán bộ xử lý..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/van-ban-den/${documentId}`)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || selectedStaff === null || !deadline}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Phân công
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
