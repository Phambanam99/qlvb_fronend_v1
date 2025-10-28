"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";

type CalendarMode = "week" | "month";

interface FullCalendarViewProps {
	mode: CalendarMode;
	date: Date; // external reference date (start of week or month)
	schedules: any[];
	onEventClick?: (eventId: string | number) => void;
	onDateChange?: (activeStart: Date, activeEnd: Date) => void; // fired when user navigates
}

export default function FullCalendarView({ mode, date, schedules, onEventClick, onDateChange }: FullCalendarViewProps) {
	const router = useRouter();

	// Tooltip state for beautiful hover content
	const [hoverTip, setHoverTip] = useState<{
		visible: boolean;
		rect: DOMRect | null;
		content: null | {
			title: string;
			dateStr: string;
			timeStr: string;
			location?: string;
			participants?: string[];
			description?: string;
		};
	}>({ visible: false, rect: null, content: null });

	useEffect(() => {
		const handleScrollOrResize = () => {
			if (hoverTip.visible) setHoverTip((prev) => ({ ...prev, visible: false }));
		};
		window.addEventListener("scroll", handleScrollOrResize, true);
		window.addEventListener("resize", handleScrollOrResize);
		return () => {
			window.removeEventListener("scroll", handleScrollOrResize, true);
			window.removeEventListener("resize", handleScrollOrResize);
		};
	}, [hoverTip.visible]);
	const initialView = mode === "week" ? "timeGridWeek" : "dayGridMonth";
	const calendarRef = useRef<FullCalendar | null>(null);
	const isProgrammaticNavigationRef = useRef(false);
	const lastUserActionTimeRef = useRef<number>(0);

	// Imperatively navigate when external date changes (avoid relying on initialDate which only applies once)
	useEffect(() => {
		if (calendarRef.current) {
			const api = (calendarRef.current as any).getApi?.();
			if (api) {
				const currentDate = api.getDate();
				// Only navigate if the date actually changed (compare year, month, date)
				if (
					currentDate.getFullYear() !== date.getFullYear() ||
					currentDate.getMonth() !== date.getMonth() ||
					currentDate.getDate() !== date.getDate()
				) {
					isProgrammaticNavigationRef.current = true;
					api.gotoDate(date);
					// Reset flag after a short delay to allow datesSet to process
					setTimeout(() => {
						isProgrammaticNavigationRef.current = false;
					}, 100);
				}
			}
		}
	}, [date]);

	// Keep internal FullCalendar view in sync with parent-controlled mode
	useEffect(() => {
		if (calendarRef.current) {
			const api = (calendarRef.current as any).getApi?.();
			if (api) {
				isProgrammaticNavigationRef.current = true;
				api.changeView(mode === "week" ? "timeGridWeek" : "dayGridMonth");
				setTimeout(() => {
					isProgrammaticNavigationRef.current = false;
				}, 100);
			}
		}
	}, [mode]);

	// Vibrant color palette for distinct schedules
	const colorPalette = useMemo(
		() => [
			"#2563eb", // blue-600
			"#16a34a", // green-600
			"#d97706", // amber-600
			"#dc2626", // red-600
			"#7c3aed", // violet-600
			"#0891b2", // cyan-600
			"#9333ea", // purple-600
			"#059669", // emerald-600
			"#f59e0b", // amber-500
			"#ea580c", // orange-600
		],
		[]
	);

	const events = useMemo(() => {
		const list: any[] = [];
		if (!Array.isArray(schedules)) return list;
		schedules.forEach((schedule: any) => {
			if (!Array.isArray(schedule.events)) return;
			const colorIndex = Math.abs(parseInt(String(schedule?.id ?? 0), 10)) % colorPalette.length;
			const backgroundColor = colorPalette[colorIndex];
			schedule.events.forEach((ev: any) => {
				if (!ev?.date) return;
				const start = `${ev.date}T${(ev.startTime || "08:00").substring(0,5)}`;
				const end = `${ev.date}T${(ev.endTime || "17:00").substring(0,5)}`;
				list.push({
					id: ev.id?.toString() || Math.random().toString(),
					title: ev.title || "(Không tiêu đề)",
					start,
					end,
					backgroundColor,
					borderColor: backgroundColor,
					textColor: "#ffffff",
					extendedProps: {
						scheduleId: schedule.id,
						location: ev.location,
						type: ev.type,
						description: ev.description,
						participants: ev.participantNames || [],
					},
				});
			});
		});
		return list;
	}, [schedules, colorPalette]);

	return (
		<>
		<FullCalendar
			ref={calendarRef as any}
			plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
			firstDay={1} // Start week on Monday to align with ISO week calculations
			locales={[viLocale]}
			locale="vi"
			initialView={initialView}
			headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
			views={{
				timeGridWeek: {
					titleFormat: { year: 'numeric', month: 'long' }
				},
				dayGridMonth: {
					titleFormat: { year: 'numeric', month: 'long' }
				}
			}}
			customButtons={{
				prev: {
					click: () => {
						lastUserActionTimeRef.current = Date.now();
						const api = calendarRef.current?.getApi();
						if (api) api.prev();
					}
				},
				next: {
					click: () => {
						lastUserActionTimeRef.current = Date.now();
						const api = calendarRef.current?.getApi();
						if (api) api.next();
					}
				},
				today: {
					text: 'hôm nay',
					click: () => {
						lastUserActionTimeRef.current = Date.now();
						const api = calendarRef.current?.getApi();
						if (api) api.today();
					}
				}
			}}
			events={events}
			height="auto"
			editable={false}
			selectable={false}
			dayHeaderFormat={{ weekday: "short" }}
			slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
			eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
			eventClassNames={() => ["!rounded-md", "!border-0"]}
			eventContent={(arg: any) => {
				const viewType = arg?.view?.type;
				const ev = arg.event;
				const ext = ev.extendedProps || {};
				const startStr = ev.start
					? ev.start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
					: "";
				const endStr = ev.end
					? ev.end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
					: "";

				// Day view: show full details
				if (viewType === "timeGridDay") {
					const participants: string[] = Array.isArray(ext.participants) ? ext.participants : [];
					return (
						<div className="space-y-1">
							<div className="text-[11px] font-semibold opacity-90">
								{startStr}
								{endStr ? ` - ${endStr}` : ""}
							</div>
							<div className="text-sm font-medium">{ev.title || "(Không tiêu đề)"}</div>
							{ext.location ? (
								<div className="text-xs opacity-90">Địa điểm: {ext.location}</div>
							) : null}
							{participants.length ? (
								<div className="text-xs">Thành phần: {participants.join(", ")}</div>
							) : null}
							{ext.description ? (
								<div className="text-xs whitespace-pre-wrap">{ext.description}</div>
							) : null}
						</div>
					);
				}

				// Week view: show time + title
				if (viewType === "timeGridWeek") {
					return (
						<div className="leading-tight">
							<div className="text-[11px] font-semibold opacity-90">
								{startStr}
								{endStr ? ` - ${endStr}` : ""}
							</div>
							<div className="text-[12px] font-medium truncate">{ev.title || "(Không tiêu đề)"}</div>
						</div>
					);
				}

				// Month view: compact title (and time if fits)
				if (viewType === "dayGridMonth") {
					return (
						<div className="text-[12px] font-medium truncate">
							{ev.title || "(Không tiêu đề)"}
						</div>
					);
				}

				return undefined;
			}}
			// Remove native title attribute to avoid double tooltips with our custom hover
			eventDidMount={() => {}}
			eventMouseEnter={(arg: any) => {
				// Ở view ngày, đã hiện đầy đủ nội dung nên không cần tooltip hover
				if (arg?.view?.type === "timeGridDay") {
					setHoverTip((prev) => ({ ...prev, visible: false }));
					return;
				}
				const rect: DOMRect = arg.el.getBoundingClientRect();
				const ev = arg.event;
				const { extendedProps } = ev;
				const participants: string[] = Array.isArray(extendedProps?.participants)
					? extendedProps.participants
					: [];
				const date = ev.start ? new Date(ev.start) : null;
				const dateStr = date
					? date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
					: "";
				const timeStr = ev.start && ev.end
					? `${ev.start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })} - ${ev.end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })}`
					: "";
				setHoverTip({
					visible: true,
					rect,
					content: {
						title: ev.title || "(Không tiêu đề)",
						dateStr,
						timeStr,
						location: extendedProps?.location,
						participants,
						description: extendedProps?.description,
					},
				});
			}}
			eventMouseLeave={() => setHoverTip((prev) => ({ ...prev, visible: false }))}
			eventClick={(info: any) => {
				if (onEventClick) {
					onEventClick(info.event.id);
				} else if (info?.event?.id) {
					router.push(`/lich-cong-tac/su-kien/${info.event.id}`);
				}
			}}
		// Trigger when the visible date range changes (prev/next, today, view switch)
		datesSet={(arg) => {
			const now = Date.now();
			const timeSinceUserAction = now - lastUserActionTimeRef.current;
			const isUserAction = timeSinceUserAction < 500; // 500ms window after user click
			
			// Only trigger parent callback if this is REAL USER navigation
			if (onDateChange && !isProgrammaticNavigationRef.current && isUserAction) {
				// arg.start is inclusive, arg.end is exclusive; pass both
				onDateChange(arg.start, arg.end);
			}
		}}
	/>

		{hoverTip.visible && hoverTip.rect && hoverTip.content && (
			<div
				style={{
					position: "fixed",
					top: Math.min(hoverTip.rect.bottom + 8, window.innerHeight - 12),
					left: Math.min(hoverTip.rect.left, window.innerWidth - 360),
					zIndex: 9999,
				}}
				className="max-w-[340px] rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
			>
				<div className="text-sm font-semibold">{hoverTip.content.title}</div>
				<div className="mt-1 text-xs text-muted-foreground">{hoverTip.content.dateStr}</div>
				{hoverTip.content.timeStr && (
					<div className="text-xs">{hoverTip.content.timeStr}</div>
				)}
				{hoverTip.content.location && (
					<div className="mt-1 text-xs">Địa điểm: {hoverTip.content.location}</div>
				)}
				{hoverTip.content.participants && hoverTip.content.participants.length > 0 && (
					<div className="mt-1 text-xs">
						Thành phần: {hoverTip.content.participants.join(", ")}
					</div>
				)}
				{hoverTip.content.description && (
					<div className="mt-2 text-xs whitespace-pre-wrap">{hoverTip.content.description}</div>
				)}
			</div>
		)}
	</>
	);
}


