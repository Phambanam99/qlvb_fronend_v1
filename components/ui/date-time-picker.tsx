"use client";

import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface DateTimePickerProps {
  date?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  showSeconds?: boolean;
}

const formatTimeValue = (date: Date | undefined, showSeconds: boolean) => {
  if (!date) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
};

export function DateTimePicker({
  date,
  onChange,
  placeholder = "Chọn ngày & giờ",
  disabled = false,
  showSeconds = false,
}: DateTimePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(date);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setInternalDate(date);
  }, [date]);

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) {
      setInternalDate(undefined);
      onChange(undefined);
      return;
    }
    let result: Date;
    if (internalDate) {
      result = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        internalDate.getHours(),
        internalDate.getMinutes(),
        internalDate.getSeconds(),
        0
      );
    } else {
      result = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }
    setInternalDate(result);
    onChange(result);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!internalDate) {
      const now = new Date();
      const [hh, mm, ss] = value.split(":").map((v) => parseInt(v || "0", 10));
      const newDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hh || 0,
        mm || 0,
        ss || 0,
        0
      );
      setInternalDate(newDate);
      onChange(newDate);
      return;
    }
    const [hh, mm, ss] = value.split(":").map((v) => parseInt(v || "0", 10));
    const updated = new Date(
      internalDate.getFullYear(),
      internalDate.getMonth(),
      internalDate.getDate(),
      hh || 0,
      mm || 0,
      ss || 0,
      0
    );
    setInternalDate(updated);
    onChange(updated);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalDate(undefined);
    onChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !internalDate && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate
            ? format(
                internalDate,
                "dd/MM/yyyy HH:mm" + (showSeconds ? ":ss" : ""),
                { locale: vi }
              )
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col md:flex-row gap-2 p-2">
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col gap-2 p-2 w-full md:w-44">
            <label className="text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> Thời gian
            </label>
            <input
              type="time"
              step={showSeconds ? 1 : undefined}
              value={formatTimeValue(internalDate, showSeconds)}
              onChange={handleTimeChange}
              className="border rounded px-2 py-1 text-sm"
            />
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                size="sm"
                onClick={clear}
              >
                Xóa
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={!internalDate}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
