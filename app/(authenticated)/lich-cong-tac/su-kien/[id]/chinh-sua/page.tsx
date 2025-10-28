"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { schedulesAPI } from "@/lib/api";
import { useNotifications } from "@/lib/notifications-context";

const normalizeDate = (date: Date | null | undefined): Date | undefined => {
	if (!date) return undefined;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function EditEventPage() {
	const router = useRouter();
	const { addNotification } = useNotifications();
	// Use Next.js app router hook to get dynamic route param. Avoid direct props access (params is now a Promise in newer Next.js versions)
	const routeParams = useParams<{ id: string }>();
	const eventId = routeParams?.id;

	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [title, setTitle] = useState("");
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [location, setLocation] = useState("");
	const [type, setType] = useState("internal");
	const [description, setDescription] = useState("");

	const [scheduleId, setScheduleId] = useState<number | null>(null);

	useEffect(() => {
		if (!eventId) return; // Wait until param is available
		const fetchEvent = async () => {
			try {
				setLoading(true);
				const res = await schedulesAPI.getEventById(eventId);
				const ev: any = res;
				setTitle(ev.title || "");
				setDate(ev.date ? normalizeDate(new Date(ev.date)) : undefined);
				setStartTime(ev.startTime || "");
				setEndTime(ev.endTime || "");
				setLocation(ev.location || "");
				setType(ev.type || "internal");
				setDescription(ev.description || "");
				setScheduleId(ev.scheduleId || null);
			} catch (e) {
				addNotification({ title: "Lỗi", message: "Không thể tải sự kiện", type: "error" });
			} finally {
				setLoading(false);
			}
		};
		fetchEvent();
	}, [eventId, addNotification]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title || !date) {
			addNotification({ title: "Lỗi", message: "Vui lòng nhập đủ tiêu đề và ngày", type: "error" });
			return;
		}
		if (!eventId) {
			addNotification({ title: "Lỗi", message: "Thiếu mã sự kiện", type: "error" });
			return;
		}
		setIsSubmitting(true);
		try {
			// Không có API riêng update event -> cập nhật qua lịch chứa event
			if (!scheduleId) throw new Error("Thiếu scheduleId của sự kiện");
			const scheduleRes = await schedulesAPI.getScheduleById(scheduleId);
			const schedule = scheduleRes.data;
			const updatedEvents = (schedule.events || []).map((ev: any) => {
				if (String(ev.id) !== String(eventId)) return ev;
				return {
					...ev,
					title,
					date: new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0],
					startTime,
					endTime,
					location,
					type,
					description,
				};
			});
			await schedulesAPI.updateSchedule(scheduleId, { ...schedule, events: updatedEvents });
			addNotification({ title: "Thành công", message: "Đã cập nhật sự kiện", type: "success" });
			router.push(`/lich-cong-tac/su-kien/${eventId}`);
		} catch (err) {
			addNotification({ title: "Lỗi", message: "Không thể cập nhật sự kiện", type: "error" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-8">
			<div className="flex items-center space-x-2">
				<Button variant="outline" size="icon" asChild>
					<Link href={scheduleId ? `/lich-cong-tac/su-kien/${eventId}` : "/lich-cong-tac"}>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa sự kiện</h1>
			</div>

			<Card>
				<form onSubmit={handleSubmit}>
					<CardHeader>
						<CardTitle>Thông tin sự kiện</CardTitle>
						<CardDescription>Cập nhật các trường thông tin của sự kiện</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="title">Tiêu đề</Label>
							<Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Ngày</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}> 
											<CalendarIcon className="mr-2 h-4 w-4" />
											{date ? format(date, "dd/MM/yyyy") : "Chọn ngày"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar mode="single" selected={date} onSelect={(d) => setDate(d ? normalizeDate(d) : undefined)} initialFocus locale={vi} className="rounded-md border" />
									</PopoverContent>
								</Popover>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Giờ bắt đầu</Label>
									<Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
								</div>
								<div className="space-y-2">
									<Label>Giờ kết thúc</Label>
									<Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Địa điểm</Label>
							<Input value={location} onChange={(e) => setLocation(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Loại</Label>
							<Input value={type} onChange={(e) => setType(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Mô tả</Label>
							<Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" asChild>
							<Link href={scheduleId ? `/lich-cong-tac/su-kien/${eventId}` : "/lich-cong-tac"}>Hủy</Link>
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Đang lưu..." : (<><Save className="mr-2 h-4 w-4" /> Lưu</>)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}


