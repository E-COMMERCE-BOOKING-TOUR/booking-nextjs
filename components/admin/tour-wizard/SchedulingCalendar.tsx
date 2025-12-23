'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Ban, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';

interface SchedulingCalendarProps {
    ranges: { start: string, end: string }[];
    excluded: string[];
    onToggleDate: (date: string) => void;
    durationDays?: number;
}

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function SchedulingCalendar({ ranges, excluded, onToggleDate, durationDays = 0 }: SchedulingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const isDateInRange = React.useCallback((dateStr: string) => {
        return ranges.some(range => {
            if (!range.start || !range.end) return false;
            return dateStr >= range.start && dateStr <= range.end;
        });
    }, [ranges]);

    const calendarDays = useMemo(() => {
        const days = [];
        // Fill empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Fill current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const y = year;
            const m = String(month + 1).padStart(2, '0');
            const d = String(i).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            days.push({
                date: new Date(year, month, i),
                dateStr,
                day: i,
                isInRange: isDateInRange(dateStr),
                isExcluded: excluded.includes(dateStr),
                isUnbookable: false // Placeholder
            });
        }

        // Second pass for multi-day tours to detect unbookable sessions
        if (durationDays > 1) {
            days.forEach((d, idx) => {
                if (d && d.isInRange && !d.isExcluded) {
                    // Check next (durationDays - 1) days
                    for (let j = 1; j < durationDays; j++) {
                        const checkDate = new Date(d.date);
                        checkDate.setDate(checkDate.getDate() + j);
                        const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

                        const isNextDayAvailable = isDateInRange(checkDateStr) && !excluded.includes(checkDateStr);
                        if (!isNextDayAvailable) {
                            d.isUnbookable = true;
                            break;
                        }
                    }
                }
            });
        }

        return days;
    }, [year, month, ranges, excluded, durationDays, isDateInRange, daysInMonth, firstDayOfMonth]);

    return (
        <div className="w-full bg-card/20 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg">{MONTHS[month]}</h3>
                    <p className="text-xs text-muted-foreground">{year}</p>
                </div>
                <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="h-12" />;

                    const isActive = d.isInRange && !d.isExcluded;
                    const isExcluded = d.isInRange && d.isExcluded;
                    const isOutOfRange = !d.isInRange;

                    return (
                        <button
                            type="button"
                            key={d.dateStr}
                            onClick={() => d.isInRange && onToggleDate(d.dateStr)}
                            className={cn(
                                "h-12 relative flex flex-col items-center justify-center rounded-sm transition-all duration-200 border",
                                isActive ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400" :
                                    isExcluded ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400" :
                                        "bg-white/2 border-transparent text-muted-foreground/40 cursor-default"
                            )}
                            disabled={isOutOfRange}
                        >
                            <span className="text-sm font-medium z-10">{d.day}</span>
                            {isActive && (
                                <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {d.isUnbookable && (
                                        <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />
                                    )}
                                </div>
                            )}
                            {isExcluded && (
                                <Ban className="h-3 w-3 absolute bottom-1 text-red-500/40" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-muted-foreground border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Đang mở (Available)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Đã loại trừ (Excluded)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span>Thiếu ngày liên tiếp (Unbookable)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-white/10" />
                    <span>Không có lịch (Inactive)</span>
                </div>
            </div>
        </div>
    );
}
