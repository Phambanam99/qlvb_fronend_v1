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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Send } from "lucide-react";
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
  incomingDocumentsAPI,
  workflowAPI,
  DocumentWorkflowDTO,
  DocumentProcessingStatus,

  UserDTO
} from "@/lib/api";

interface DepartmentHeadAssignmentProps {
  documentId: number;
  departmentId: number;
}

export default function DepartmentHeadAssignment({
  documentId,
  departmentId,
}: DepartmentHeadAssignmentProps) {
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [comments, setComments] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dữ liệu mẫu cho danh sách cán bộ trong phòng
  // Trong thực tế, bạn sẽ lấy dữ liệu này từ API hoặc từ context
  //Lấy danh sách cán bộ phòng từ API userAPI
  const [departmentStaff, setDepartmentStaff] = useState<UserDTO[]>([]);
  useEffect(() => {
    const fetchDepartmentStaff = async () => {
      try {
        const staffData = await usersAPI.getUsersByDepartmentId(departmentId);
        setDepartmentStaff(staffData);
      } catch (error) {
        console.error("Error fetching department staff:", error);
      }
    };

    fetchDepartmentStaff();
  }, [departmentId]);

  const handleStaffSelect = (staffId: number) => {
    setSelectedStaff((prev) => {
      if (prev.includes(staffId)) {
        return prev.filter((id) => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);


    // Reset form
    setIsSubmitting(false);
    console.log("Đã phân công xử lý văn bản thành công! ", selectedStaff[0]);
    // Thông báo thành công (trong thực tế sẽ sử dụng toast hoặc notification)
    alert("Đã phân công xử lý văn bản thành công!");
    const documentAssign: DocumentWorkflowDTO = {
      status: DocumentProcessingStatus.DEPT_ASSIGNED.code,
      statusDisplayName: DocumentProcessingStatus.DEPT_ASSIGNED.displayName,
      comments,
      closureDeadline: deadline,
      assignedToId: selectedStaff[0],
      documentId: documentId,
    };
    // Gửi dữ liệu phân công xử lý văn bản đến API
    await workflowAPI.assignToSpecialist(documentId, documentAssign);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân công xử lý văn bản</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chọn cán bộ xử lý</Label>
            <div className="border rounded-md overflow-hidden">
              <div className="bg-primary/5 px-4 py-2 border-b">
                <span className="text-sm font-medium">
                  Danh sách cán bộ trong phòng
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {departmentStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={selectedStaff.includes(staff.id)}
                        onCheckedChange={() => handleStaffSelect(staff.id)}
                      />
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-xs text-primary">
                            AV
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{staff.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {staff.fullName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border rounded-md bg-accent/50">
            {selectedStaff.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                Chưa có cán bộ nào được chọn
              </div>
            )}

            {selectedStaff.map((staffId) => {
              const staff = departmentStaff.find((s) => s.id === staffId);
              if (!staff) return null;

              return (
                <Badge
                  key={staffId}
                  variant="secondary"
                  className="pl-2 pr-2 py-1.5 bg-primary/10"
                >
                  <span>{staff.name}</span>
                </Badge>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Thời hạn xử lý</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || selectedStaff.length === 0 || !deadline}
          >
            {isSubmitting ? (
              "Đang gửi..."
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
