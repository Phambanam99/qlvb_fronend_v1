"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Save, Trash, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { usersAPI } from "@/lib/api/users";
import { schedulesAPI, departmentsAPI } from "@/lib/api";
import { useNotifications } from "@/lib/notifications-context";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

// Chuẩn hóa ngày về local date không có timezone
const normalizeDate = (date: Date | null | undefined): Date | undefined => {
  if (!date) return undefined;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function EditSchedulePage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  // 🔧 Lấy id từ useParams (client component)
  const params = useParams<{ id: string }>();
  const scheduleId = params?.id ? Number.parseInt(params.id) : 0;

  const [scheduleType, setScheduleType] = useState<"week" | "month">("week");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Tải dữ liệu lịch để điền vào form
  useEffect(() => {
    if (!scheduleId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const scheduleRes = await schedulesAPI.getScheduleById(scheduleId);
        const data = scheduleRes.data;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setDepartment((data as any).departmentId?.toString() || "");
        setScheduleType((data as any).period === "month" ? "month" : "week");

        // Suy ra start/end date
        const eventDates = Array.isArray(data.events)
          ? data.events
              .map((e: any) => new Date(e.date))
              .sort((a: Date, b: Date) => a.getTime() - b.getTime())
          : [];
        const inferredStart = eventDates[0];
        const inferredEnd = eventDates[eventDates.length - 1];
        const sd = (data as any).startDate ? new Date((data as any).startDate) : inferredStart;
        const ed = (data as any).endDate ? new Date((data as any).endDate) : inferredEnd;
        setStartDate(sd ? normalizeDate(sd) : undefined);
        setEndDate(ed ? normalizeDate(ed) : undefined);

        // Map events thành scheduleItems
        const items = (data.events || []).map((ev: any) => ({
          id: ev.id,
          title: ev.title || "",
          date: ev.date ? normalizeDate(new Date(ev.date)) : null,
          startTime: ev.startTime || "",
          endTime: ev.endTime || "",
          location: ev.location || "",
          participants: Array.isArray(ev.participants)
            ? ev.participants.map((p: number | string) => p.toString())
            : [],
          description: ev.description || "",
          type: ev.type || "internal",
        }));
        setScheduleItems(items);
      } catch {
        addNotification({ title: "Lỗi", message: "Không thể tải lịch công tác", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scheduleId, addNotification]);

  // Tải phòng ban
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const departmentsData_ = await departmentsAPI.getAllDepartments();
        const departmentsData = departmentsData_.data;
        if (departmentsData && Array.isArray(departmentsData.content)) {
          setDepartments(departmentsData.content);
        } else if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        } else {
          setDepartments([]);
        }
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  // Tải người dùng theo phòng ban
  useEffect(() => {
    const fetchStaff = async () => {
      if (!department) return;
      try {
        setIsLoadingStaff(true);
        const usersRes = await usersAPI.getUsersByDepartmentId(Number(department));
        const users = usersRes.data;
        setStaffMembers(users || []);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [department]);

  const addScheduleItem = () => {
    const newItem = {
      id: Date.now(),
      title: "",
      date: null,
      startTime: "",
      endTime: "",
      location: "",
      participants: [],
      description: "",
      type: "internal",
    };
    setScheduleItems([...scheduleItems, newItem]);
  };

  const updateScheduleItem = (id: number, field: string, value: any) => {
    if (field === "date" && value) value = normalizeDate(value);
    setScheduleItems(scheduleItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeScheduleItem = (id: number) => {
    setScheduleItems(scheduleItems.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      addNotification({ title: "Lỗi", message: "Vui lòng nhập tiêu đề lịch công tác", type: "error" });
      return;
    }
    if (!startDate || !endDate) {
      addNotification({ title: "Lỗi", message: "Vui lòng chọn khoảng thời gian", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        departmentId: department ? Number(department) : undefined,
        period: scheduleType,
        startDate: startDate ? normalizeDate(startDate) : undefined,
        endDate: endDate ? normalizeDate(endDate) : undefined,
        events: scheduleItems.map((item) => ({
          id: typeof item.id === "number" ? item.id : undefined,
          title: item.title,
          date: item.date
            ? new Date(item.date.getTime() - item.date.getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0]
            : null,
          startTime: item.startTime,
          endTime: item.endTime,
          location: item.location,
          participants: Array.isArray(item.participants)
            ? item.participants.map((p: string) => Number(p))
            : [],
          description: item.description,
          type: item.type,
        })),
      };

      await schedulesAPI.updateSchedule(scheduleId, payload);
      addNotification({ title: "Thành công", message: "Đã cập nhật lịch công tác", type: "success" });
      router.push(`/lich-cong-tac/${scheduleId}`);
    } catch {
      addNotification({ title: "Lỗi", message: "Không thể cập nhật lịch công tác", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <Link href={`/lich-cong-tac/${scheduleId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Chỉnh sửa lịch công tác</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Cập nhật thông tin chung của lịch công tác</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Tiêu đề</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Mô tả</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px] resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-base">Phòng ban</Label>
                  <Select
                    value={department}
                    onValueChange={(value) => {
                      setDepartment(value);
                      // Reset participants khi đổi phòng ban
                      scheduleItems.forEach((item) => updateScheduleItem(item.id, "participants", []));
                    }}
                    required
                  >
                    <SelectTrigger id="department" className="h-11">
                      <SelectValue placeholder={isLoadingDepartments ? "Đang tải..." : "Chọn phòng ban"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDepartments ? (
                        <div className="p-2 text-center">Đang tải...</div>
                      ) : departments.length === 0 ? (
                        <SelectItem value="none" disabled>Không có phòng ban</SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleType" className="text-base">Loại lịch</Label>
                  <Select value={scheduleType} onValueChange={(v: "week" | "month") => setScheduleType(v)} required>
                    <SelectTrigger id="scheduleType" className="h-11">
                      <SelectValue placeholder="Chọn loại lịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Lịch tuần</SelectItem>
                      <SelectItem value="month">Lịch tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base">Ngày bắt đầu</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal h-11", !startDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => setStartDate(d ? normalizeDate(d) : undefined)}
                        initialFocus
                        locale={vi}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base">Ngày kết thúc</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal h-11", !endDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(d) => setEndDate(d ? normalizeDate(d) : undefined)}
                        initialFocus
                        locale={vi}
                        disabled={(d) => (startDate ? d < startDate : false)}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chi tiết lịch công tác</CardTitle>
                  <CardDescription>Cập nhật các sự kiện trong lịch công tác</CardDescription>
                </div>
                <Button type="button" onClick={addScheduleItem} className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Thêm sự kiện
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {scheduleItems.length === 0 ? (
                  <div className="text-center py-12 bg-accent/30 rounded-lg">
                    <p className="text-muted-foreground">Chưa có sự kiện nào. Nhấn "Thêm sự kiện" để bắt đầu.</p>
                  </div>
                ) : (
                  scheduleItems.map((item, index) => (
                    <Card key={item.id} className="shadow-sm border-dashed">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Sự kiện #{index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeScheduleItem(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor={`item-title-${item.id}`}>Tiêu đề</Label>
                          <Input
                            id={`item-title-${item.id}`}
                            value={item.title}
                            onChange={(e) => updateScheduleItem(item.id, "title", e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`item-date-${item.id}`}>Ngày</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id={`item-date-${item.id}`}
                                  variant="outline"
                                  className={cn("w-full justify-start text-left font-normal", !item.date && "text-muted-foreground")}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {item.date ? format(item.date, "dd/MM/yyyy") : "Chọn ngày"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={item.date || undefined}
                                  onSelect={(d) => updateScheduleItem(item.id, "date", d)}
                                  initialFocus
                                  locale={vi}
                                  disabled={(d) => (startDate && endDate ? d < startDate || d > endDate : false)}
                                  className="rounded-md border"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-type-${item.id}`}>Loại sự kiện</Label>
                            <Select value={item.type} onValueChange={(v) => updateScheduleItem(item.id, "type", v)}>
                              <SelectTrigger id={`item-type-${item.id}`}>
                                <SelectValue placeholder="Chọn loại sự kiện" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="internal">Nội bộ</SelectItem>
                                <SelectItem value="external">Bên ngoài</SelectItem>
                                <SelectItem value="online">Trực tuyến</SelectItem>
                                <SelectItem value="field">Hiện trường</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-start-time-${item.id}`}>Thời gian bắt đầu</Label>
                            <Input
                              id={`item-start-time-${item.id}`}
                              type="time"
                              value={item.startTime}
                              onChange={(e) => updateScheduleItem(item.id, "startTime", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-end-time-${item.id}`}>Thời gian kết thúc</Label>
                            <Input
                              id={`item-end-time-${item.id}`}
                              type="time"
                              value={item.endTime}
                              onChange={(e) => updateScheduleItem(item.id, "endTime", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-location-${item.id}`}>Địa điểm</Label>
                            <Input
                              id={`item-location-${item.id}`}
                              value={item.location}
                              onChange={(e) => updateScheduleItem(item.id, "location", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-participants-${item.id}`}>Thành phần tham dự</Label>
                            <div className="relative">
                              {/* Dummy Select để giữ style, nhưng ẩn đi */}
                              <Select value="multiple" disabled>
                                <SelectTrigger id={`item-participants-${item.id}`} className="hidden">
                                  <SelectValue placeholder="Chọn nhiều người tham dự" />
                                </SelectTrigger>
                              </Select>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between" disabled={isLoadingStaff}>
                                    {isLoadingStaff
                                      ? "Đang tải..."
                                      : item.participants.length === 0
                                      ? "Chọn người tham dự"
                                      : `${item.participants.length} người được chọn`}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Tìm kiếm người tham dự..." />
                                    <CommandList>
                                      <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
                                      <CommandGroup>
                                        <CommandItem
                                          onSelect={() => {
                                            if (staffMembers.length === item.participants.length) {
                                              updateScheduleItem(item.id, "participants", []);
                                            } else {
                                              updateScheduleItem(
                                                item.id,
                                                "participants",
                                                staffMembers.map((s) => s.id.toString())
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Checkbox
                                              checked={staffMembers.length > 0 && staffMembers.length === item.participants.length}
                                              onCheckedChange={() => {}}
                                            />
                                            <span>Tất cả</span>
                                          </div>
                                        </CommandItem>

                                        {staffMembers.map((staff) => (
                                          <CommandItem
                                            key={staff.id}
                                            onSelect={() => {
                                              const staffId = staff.id.toString();
                                              const current = [...item.participants];
                                              const exists = current.includes(staffId);
                                              updateScheduleItem(
                                                item.id,
                                                "participants",
                                                exists ? current.filter((id) => id !== staffId) : [...current, staffId]
                                              );
                                            }}
                                          >
                                            <div className="flex items-center gap-2">
                                              <Checkbox
                                                checked={item.participants.includes(staff.id.toString())}
                                                onCheckedChange={() => {}}
                                              />
                                              <span>{staff.name || staff.fullName}</span>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`item-description-${item.id}`}>Mô tả</Label>
                            <Textarea
                              id={`item-description-${item.id}`}
                              rows={2}
                              value={item.description}
                              onChange={(e) => updateScheduleItem(item.id, "description", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button type="button" variant="outline" className="rounded-full" asChild>
                <Link href={`/lich-cong-tac/${scheduleId}`}>Hủy</Link>
              </Button>
              <Button type="submit" className="rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
