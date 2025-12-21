'use client';

import React, { useMemo } from 'react';
import { CalendarDays, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import SchedulingCalendar from './SchedulingCalendar';

interface VariantSchedulingEditorProps {
    variant: any;
    vIdx: number;
    vSched: { ranges: { start: string, end: string }[], excluded: string[] };
    onAddRange: () => void;
    onUpdateRange: (rIdx: number, field: 'start' | 'end', val: string) => void;
    onRemoveRange: (rIdx: number) => void;
    onAddExcluded: (date: string) => void;
    onRemoveExcluded: (date: string) => void;
}

export default function VariantSchedulingEditor({
    variant,
    vIdx,
    vSched,
    onAddRange,
    onUpdateRange,
    onRemoveRange,
    onAddExcluded,
    onRemoveExcluded
}: VariantSchedulingEditorProps) {
    const totalOpenDays = useMemo(() => {
        const dates = new Set<string>();
        vSched.ranges.forEach(range => {
            if (range.start && range.end) {
                let curr = new Date(range.start);
                const end = new Date(range.end);
                while (curr <= end) {
                    const dStr = curr.toISOString().split('T')[0];
                    if (!vSched.excluded.includes(dStr)) {
                        dates.add(dStr);
                    }
                    curr.setDate(curr.getDate() + 1);
                }
            }
        });
        return dates.size;
    }, [vSched]);

    return (
        <div className="space-y-6 p-6 rounded-2xl border border-white/5 bg-white/2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    <h4 className="font-bold text-lg">{variant.name}</h4>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-primary">Khoảng ngày hoạt động</Label>
                            <Button type="button" size="sm" variant="outline" onClick={onAddRange} className="h-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Thêm khoảng
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {vSched.ranges.map((range, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 p-3 rounded-xl bg-white/2 border border-white/5">
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                        <Input
                                            type="date"
                                            value={range.start}
                                            onChange={(e) => onUpdateRange(rIdx, 'start', e.target.value)}
                                            className="h-9 bg-background/50 border-white/10 text-xs"
                                        />
                                        <Input
                                            type="date"
                                            value={range.end}
                                            onChange={(e) => onUpdateRange(rIdx, 'end', e.target.value)}
                                            className="h-9 bg-background/50 border-white/10 text-xs"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveRange(rIdx)}
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 rounded-full"
                                    >
                                        <ImageIcon className="h-4 w-4 rotate-45" />
                                    </Button>
                                </div>
                            ))}
                            {vSched.ranges.length === 0 && (
                                <div className="py-8 text-center border font-medium border-dashed border-white/10 rounded-xl text-xs text-muted-foreground italic">
                                    Chưa có khoảng ngày nào được thiết lập.
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-white/5" />

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-primary">Thống kê Session</Label>
                        <div className="p-4 rounded-xl bg-white/2 border border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Tổng ngày mở</div>
                                <div className="text-xl font-bold text-emerald-400">{totalOpenDays}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Ngày loại trừ</div>
                                <div className="text-xl font-bold text-red-400">{vSched.excluded.length}</div>
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
                        ranges={vSched.ranges}
                        excluded={vSched.excluded}
                        onToggleDate={(date) => {
                            if (vSched.excluded.includes(date)) {
                                onRemoveExcluded(date);
                            } else {
                                onAddExcluded(date);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
