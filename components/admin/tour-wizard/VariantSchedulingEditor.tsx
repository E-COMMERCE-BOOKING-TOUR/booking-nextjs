'use client';

import React, { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import SchedulingCalendar from './SchedulingCalendar';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/libs/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Trash2 } from 'lucide-react';

import { DateRange } from 'react-day-picker';

interface VariantSchedulingEditorProps {
    value: { from: Date; to: Date }[];
    onChange: (ranges: { from: Date; to: Date }[]) => void;
    excludedDates: string[];
    onExclude: (date: string) => void;
    onRemoveExcluded: (date: string) => void;
    startTimeSlots?: string[];
    onTimeSlotsChange: (slots: string[]) => void;
    variantDuration?: number | null;
    onDurationChange?: (duration: number | null) => void;
    durationDays?: number;
}

export default function VariantSchedulingEditor({
    value,
    onChange,
    excludedDates,
    onExclude,
    onRemoveExcluded,
    startTimeSlots = [],
    onTimeSlotsChange,
    variantDuration,
    onDurationChange,
    durationDays = 0
}: VariantSchedulingEditorProps) {
    const [newTimeSlot, setNewTimeSlot] = useState<string>('08:00');
    const [date, setDate] = React.useState<DateRange | undefined>();

    const handleAddTimeSlot = () => {
        if (!newTimeSlot) return;
        if (!startTimeSlots.includes(newTimeSlot)) {
            const newSlots = [...startTimeSlots, newTimeSlot].sort();
            onTimeSlotsChange(newSlots);
        }
    };

    const handleRemoveTimeSlot = (slot: string) => {
        const newSlots = startTimeSlots.filter(s => s !== slot);
        onTimeSlotsChange(newSlots);
    };

    const totalOpenDays = useMemo(() => {
        const dates = new Set<string>();
        value.forEach(range => {
            if (range.from && range.to) {
                const curr = new Date(range.from);
                const end = new Date(range.to);
                while (curr <= end) {
                    const dStr = curr.toISOString().split('T')[0];
                    if (!excludedDates.includes(dStr)) {
                        dates.add(dStr);
                    }
                    curr.setDate(curr.getDate() + 1);
                }
            }
        });
        return dates.size * (startTimeSlots.length || 1);
    }, [value, excludedDates, startTimeSlots]);

    return (
        <div className="space-y-6 p-6 rounded-2xl border border-white/5 bg-white/2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Time Slots & Duration Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Khung giờ khởi hành</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="time"
                                    value={newTimeSlot}
                                    onChange={(e) => setNewTimeSlot(e.target.value)}
                                    className="bg-background/50 border-white/10"
                                />
                                <Button type="button" size="icon" variant="secondary" onClick={handleAddTimeSlot}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {startTimeSlots.map((slot, idx) => (
                                    <Badge key={idx} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-white/5">
                                        {slot}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                            onClick={() => handleRemoveTimeSlot(slot)}
                                        />
                                    </Badge>
                                ))}
                                {startTimeSlots.length === 0 && (
                                    <span className="text-xs text-muted-foreground italic py-1">Chưa có khung giờ (Mặc định cả ngày)</span>
                                )}
                            </div>
                        </div>

                        {onDurationChange && (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Thời lượng riêng (Giờ)</Label>
                                <div className="flex flex-col gap-1">
                                    <Input
                                        type="number"
                                        placeholder="Mặc định theo tour"
                                        value={variantDuration || ''}
                                        onChange={(e) => onDurationChange(e.target.value ? parseFloat(e.target.value) : null)}
                                        className="bg-background/50 border-white/10"
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Thay thế số giờ chung. Tổng: (Số ngày chung) + (Số giờ này).
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-primary">Khoảng ngày hoạt động</Label>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal bg-background/50 border-white/10",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? (
                                                    <>
                                                        {format(date.from, "LLL dd, y")} -{" "}
                                                        {format(date.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(date.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Chọn khoảng ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={setDate}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (date?.from && date.to) {
                                            onChange([...value, { from: date.from, to: date.to }]);
                                            setDate(undefined);
                                        }
                                    }}
                                    disabled={!date?.from || !date?.to}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {value.map((range, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 p-3 rounded-xl bg-white/2 border border-white/5">
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                        <Input
                                            type="date"
                                            value={range.from.toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                const newRanges = [...value];
                                                newRanges[rIdx] = { ...range, from: new Date(e.target.value) };
                                                onChange(newRanges);
                                            }}
                                            className="h-9 bg-background/50 border-white/10 text-xs"
                                        />
                                        <Input
                                            type="date"
                                            value={range.to.toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                const newRanges = [...value];
                                                newRanges[rIdx] = { ...range, to: new Date(e.target.value) };
                                                onChange(newRanges);
                                            }}
                                            className="h-9 bg-background/50 border-white/10 text-xs"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onChange(value.filter((_, i) => i !== rIdx))}
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {value.length === 0 && (
                                <div className="py-8 text-center border font-medium border-dashed border-white/10 rounded-xl text-xs text-muted-foreground">
                                    Chưa có khoảng ngày nào được thiết lập.
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-white/5" />

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-primary">Thống kê Session dự kiến</Label>
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Tổng Session</div>
                                <div className="text-xl font-bold text-emerald-400">{totalOpenDays}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Ngày loại trừ</div>
                                <div className="text-xl font-bold text-red-400">{excludedDates.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-semibold">Lịch trực quan</Label>
                        <div className="px-2 py-0.5 rounded text-[8px] bg-primary/10 text-primary border border-primary/20">CLICK ĐỂ BẬT/TẮT</div>
                    </div>
                    <SchedulingCalendar
                        ranges={value.map(r => ({ start: r.from.toISOString().split('T')[0], end: r.to.toISOString().split('T')[0] }))}
                        excluded={excludedDates}
                        durationDays={durationDays}
                        onToggleDate={(date) => {
                            if (excludedDates.includes(date)) {
                                onRemoveExcluded(date);
                            } else {
                                onExclude(date);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
