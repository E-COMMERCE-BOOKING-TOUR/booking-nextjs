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

export interface ScheduleValue {
    ranges: { start: string; end: string }[];
    excluded: string[];
    timeSlots?: string[];
    durationHours?: number | null;
}

interface VariantSchedulingEditorProps {
    value: ScheduleValue;
    onChange: (value: ScheduleValue) => void;
    durationDays?: number | null;
}

export default function VariantSchedulingEditor({
    value,
    onChange,
    durationDays = 0
}: VariantSchedulingEditorProps) {
    const [newTimeSlot, setNewTimeSlot] = useState<string>('08:00');
    const [date, setDate] = React.useState<DateRange | undefined>();

    // Helper to update parts of the value
    const updateValue = (updates: Partial<ScheduleValue>) => {
        onChange({ ...value, ...updates });
    };

    const startTimeSlots = useMemo(() => value.timeSlots || [], [value.timeSlots]);
    const excludedDates = useMemo(() => value.excluded || [], [value.excluded]);
    const ranges = useMemo(() => value.ranges || [], [value.ranges]);

    const handleAddTimeSlot = () => {
        if (!newTimeSlot) return;
        if (!startTimeSlots.includes(newTimeSlot)) {
            const newSlots = [...startTimeSlots, newTimeSlot].sort();
            updateValue({ timeSlots: newSlots });
        }
    };

    const handleRemoveTimeSlot = (slot: string) => {
        const newSlots = startTimeSlots.filter(s => s !== slot);
        updateValue({ timeSlots: newSlots });
    };

    const handleExcludeDate = (date: string) => {
        if (!excludedDates.includes(date)) {
            updateValue({ excluded: [...excludedDates, date] });
        }
    };

    const handleRemoveExcluded = (date: string) => {
        updateValue({ excluded: excludedDates.filter(d => d !== date) });
    };

    const totalOpenDays = useMemo(() => {
        const dates = new Set<string>();
        ranges.forEach(range => {
            if (range.start && range.end) {
                const curr = new Date(range.start);
                const end = new Date(range.end);
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
    }, [ranges, excludedDates, startTimeSlots]);

    return (
        <div className="space-y-6 p-6 rounded-2xl border border-white/5 bg-white/2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Time Slots & Duration Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Departure Times</Label>
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
                                    <span className="text-xs text-muted-foreground italic py-1">No time slots (Default all day)</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Custom Duration (Hours)</Label>
                            <div className="flex flex-col gap-1">
                                <Input
                                    type="number"
                                    placeholder="Default tour duration"
                                    value={value.durationHours ?? ''}
                                    onChange={(e) => updateValue({ durationHours: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="bg-background/50 border-white/10"
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    Overrides general duration. Total: (General Days) + (This Hours).
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-primary">Operating Dates Range</Label>
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
                                                <span>Pick a date range</span>
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
                                            const newRange = {
                                                start: date.from.toISOString().split('T')[0],
                                                end: date.to.toISOString().split('T')[0]
                                            };
                                            updateValue({ ranges: [...ranges, newRange] });
                                            setDate(undefined);
                                        }
                                    }}
                                    disabled={!date?.from || !date?.to}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {ranges.map((range, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 p-3 rounded-xl bg-white/2 border border-white/5">
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                        <Input
                                            type="date"
                                            value={range.start}
                                            onChange={(e) => {
                                                const newRanges = [...ranges];
                                                newRanges[rIdx] = { ...range, start: e.target.value };
                                                updateValue({ ranges: newRanges });
                                            }}
                                            className="h-9 bg-background/50 border-white/10 text-xs"
                                        />
                                        <Input
                                            type="date"
                                            value={range.end}
                                            onChange={(e) => {
                                                const newRanges = [...ranges];
                                                newRanges[rIdx] = { ...range, end: e.target.value };
                                                updateValue({ ranges: newRanges });
                                            }}
                                            className="h-9 bg-background/50 border-white/10 text-xs"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateValue({ ranges: ranges.filter((_, i) => i !== rIdx) })}
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {ranges.length === 0 && (
                                <div className="py-8 text-center border font-medium border-dashed border-white/10 rounded-xl text-xs text-muted-foreground">
                                    No date ranges set.
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-white/5" />

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-primary">Estimated Sessions Stats</Label>
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Total Sessions</div>
                                <div className="text-xl font-bold text-emerald-400">{totalOpenDays}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Excluded Days</div>
                                <div className="text-xl font-bold text-red-400">{excludedDates.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-semibold">Visual Calendar</Label>
                        <div className="px-2 py-0.5 rounded text-[8px] bg-primary/10 text-primary border border-primary/20">CLICK TO TOGGLE</div>
                    </div>
                    <SchedulingCalendar
                        ranges={ranges}
                        excluded={excludedDates}
                        durationDays={Number(durationDays) || 0}
                        onToggleDate={(date) => {
                            if (excludedDates.includes(date)) {
                                handleRemoveExcluded(date);
                            } else {
                                handleExcludeDate(date);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
