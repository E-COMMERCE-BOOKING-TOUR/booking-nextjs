"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Info,
    Image as ImageIcon,
    Settings2,
    CalendarDays,
    Save
} from 'lucide-react';
import { cn } from '@/libs/utils';
import VariantSchedulingEditor from './VariantSchedulingEditor';
import SortableTourImage from './SortableTourImage';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { adminTourApi } from '@/apis/admin/tour';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';

const STEPS = [
    { id: 1, title: 'Thông tin chung', icon: Info },
    { id: 2, title: 'Hình ảnh', icon: ImageIcon },
    { id: 3, title: 'Biến thể & Giá', icon: Settings2 },
    { id: 4, title: 'Lịch trình & Session', icon: CalendarDays },
    { id: 5, title: 'Xác nhận', icon: CheckCircle2 },
];

const tourSchema = z.object({
    title: z.string().min(5, "Tên tour phải có ít nhất 5 ký tự"),
    slug: z.string().optional(),
    description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
    summary: z.string().min(10, "Tóm tắt phải có ít nhất 10 ký tự"),
    address: z.string().min(5, "Địa chỉ không được để trống"),
    map_url: z.string().optional(),
    tax: z.coerce.number().min(0, "Thuế không được âm"),
    min_pax: z.coerce.number().min(1, "Số khách tối thiểu là 1"),
    max_pax: z.coerce.number().nullable().optional(),
    country_id: z.coerce.number().min(1, "Vui lòng chọn quốc gia"),
    division_id: z.coerce.number().min(1, "Vui lòng chọn tỉnh/thành"),
    currency_id: z.coerce.number().default(1),
    supplier_id: z.coerce.number().default(1),
    tour_category_ids: z.array(z.number()).default([]),
    images: z.array(z.object({
        image_url: z.string(),
        sort_no: z.number(),
        is_cover: z.boolean(),
        file: z.any().optional()
    })).min(1, "Vui lòng chọn ít nhất 1 hình ảnh"),
    variants: z.array(z.object({
        id: z.number().optional(),
        name: z.string().min(1, "Tên biến thể không được để trống"),
        min_pax_per_booking: z.coerce.number().min(1),
        capacity_per_slot: z.coerce.number().min(1),
        tax_included: z.boolean().default(true),
        cutoff_hours: z.coerce.number().min(0),
        status: z.string(),
        prices: z.array(z.object({
            id: z.number().optional(),
            pax_type_id: z.number(),
            pax_type_name: z.string(),
            price: z.coerce.number().min(0)
        }))
    })).min(1, "Vui lòng thêm ít nhất 1 biến thể"),
    is_visible: z.boolean().default(true),
    status: z.string().default('active'),
    duration_hours: z.coerce.number().min(0).nullable().optional(),
    duration_days: z.coerce.number().min(0).nullable().optional(),
    published_at: z.string().nullable().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

interface TourWizardProps {
    tourId?: number | string;
    initialData?: any;
}

export default function TourWizard({ tourId, initialData }: TourWizardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const [currentStep, setCurrentStep] = useState(1);
    const isEdit = !!tourId;

    // React Query for Metadata
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: () => adminTourApi.getCountries(token),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });

    const { data: currencies = [] } = useQuery({
        queryKey: ['currencies'],
        queryFn: () => adminTourApi.getCurrencies(token),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });

    const form = useForm<TourFormValues>({
        resolver: zodResolver(tourSchema) as Resolver<TourFormValues>,
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            summary: '',
            address: '',
            map_url: '',
            tax: 0,
            min_pax: 1,
            max_pax: null,
            country_id: 0,
            division_id: 0,
            currency_id: 1,
            supplier_id: 1,
            tour_category_ids: [],
            images: [],
            variants: [],
            is_visible: true,
            status: 'active',
            duration_hours: null,
            duration_days: null,
            published_at: null,
        }
    });

    useEffect(() => {
        if (initialData) {
            // Transform initialData to match form structure if needed
            const mappedData: any = {
                ...initialData,
                address: initialData.address || '',
                country_id: initialData.country?.id || initialData.country_id || 0,
                division_id: initialData.division?.id || initialData.division_id || 0,
                currency_id: initialData.currency?.id || initialData.currency_id || 1,
                supplier_id: initialData.supplier?.id || initialData.supplier_id || 1,
                duration_hours: initialData.duration_hours || null,
                duration_days: initialData.duration_days || null,
                tax: initialData.tax || 0,
                tour_category_ids: initialData.tour_categories?.map((c: any) => c.id) || [],
                published_at: initialData.published_at ? new Date(initialData.published_at).toISOString().split('T')[0] : null,
                variants: initialData.variants?.map((v: any) => ({
                    ...v,
                    prices: v.tour_variant_pax_type_prices?.map((p: any) => ({
                        id: p.id,
                        pax_type_id: p.pax_type?.id,
                        pax_type_name: p.pax_type?.name,
                        price: p.price
                    })) || []
                })) || []
            };

            // Pre-populate scheduling state from existing sessions
            const initialScheduling: any = {};
            initialData.variants?.forEach((v: any, vIdx: number) => {
                if (v.tour_sessions?.length) {
                    const sortedSessions = [...v.tour_sessions].sort((a, b) =>
                        new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
                    );

                    const minDate = sortedSessions[0].session_date;
                    const maxDate = sortedSessions[sortedSessions.length - 1].session_date;

                    const allDates: string[] = [];
                    let curr = new Date(minDate);
                    const end = new Date(maxDate);
                    while (curr <= end) {
                        allDates.push(curr.toISOString().split('T')[0]);
                        curr.setDate(curr.getDate() + 1);
                    }

                    const sessionDates = sortedSessions.map(s => s.session_date);
                    const excluded = allDates.filter(d => !sessionDates.includes(d));

                    // Extract unique time slots
                    const timeSlots = Array.from(new Set(sortedSessions.map((s: any) => {
                        const t = s.start_time;
                        if (!t) return null;
                        // Handle potential Date objects or strings
                        const tStr = typeof t === 'string' ? t : new Date(t).toLocaleTimeString('en-GB', { hour12: false });
                        return tStr.substring(0, 5);
                    }))).filter(Boolean) as string[];

                    // Try to determine duration from the first session that has both
                    let durationHours = null;
                    const sessionWithDuration = sortedSessions.find((s: any) => s.start_time && s.end_time);
                    if (sessionWithDuration) {
                        const [h1, m1] = (sessionWithDuration.start_time as string).split(':').map(Number);
                        const [h2, m2] = (sessionWithDuration.end_time as string).split(':').map(Number);
                        durationHours = h2 - h1 + (h2 < h1 ? 24 : 0); // Simple hour diff
                    }

                    initialScheduling[vIdx] = {
                        ranges: [{ start: minDate, end: maxDate }],
                        excluded,
                        timeSlots: timeSlots.length > 0 ? timeSlots : undefined,
                        durationHours
                    };
                }
            });
            setScheduling(initialScheduling);
            form.reset(mappedData);
        }
    }, [initialData, form]);

    const watchedCountryId = form.watch('country_id');

    const { data: divisions = [] } = useQuery({
        queryKey: ['divisions', watchedCountryId],
        queryFn: () => adminTourApi.getDivisions(watchedCountryId, token),
        enabled: !!token && !!watchedCountryId,
        staleTime: 5 * 60 * 1000,
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control: form.control,
        name: "variants"
    });

    const [scheduling, setScheduling] = useState<Record<number, {
        ranges: { start: string, end: string }[],
        excluded: string[],
        timeSlots?: string[],
        durationHours?: number | null
    }>>({});

    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 1) {
            isValid = await form.trigger(['title', 'summary', 'description', 'address', 'country_id', 'division_id', 'tax', 'duration_days', 'duration_hours']);
        } else if (currentStep === 2) {
            isValid = await form.trigger(['images']);
        } else if (currentStep === 3) {
            isValid = await form.trigger(['variants']);
        } else {
            isValid = true;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const currentImages = form.getValues('images');
            const oldIndex = currentImages.findIndex((img) => img.image_url === active.id);
            const newIndex = currentImages.findIndex((img) => img.image_url === over.id);

            const newOrderedImages = arrayMove(currentImages, oldIndex, newIndex).map((img, idx) => ({
                ...img,
                sort_no: idx,
                is_cover: idx === 0
            }));

            form.setValue('images', newOrderedImages);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentImages = form.getValues('images');
        const newImages = [...currentImages];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const localUrl = URL.createObjectURL(file);
            newImages.push({
                image_url: localUrl,
                sort_no: newImages.length,
                is_cover: newImages.length === 0,
                file: file
            });
        }
        form.setValue('images', newImages);
        e.target.value = '';
    };

    const onSubmit = async (data: TourFormValues) => {
        if (currentStep < STEPS.length) return;
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            // 1. Upload pending images to Cloudinary
            const uploadedImages = [...data.images];
            for (let i = 0; i < uploadedImages.length; i++) {
                const img = uploadedImages[i];
                if (img.file) {
                    const fd = new FormData();
                    fd.append('file', img.file);
                    const res = await adminTourApi.uploadImage(fd, token);
                    if (res) {
                        uploadedImages[i] = {
                            ...img,
                            image_url: res.secure_url,
                            file: undefined
                        };
                    }
                }
            }

            // 2. Prepare Nested Variants, Prices, and Sessions
            const nestedVariants = data.variants.map((v, i) => {
                const vSched = scheduling[i];
                const sessions: any[] = [];
                if (vSched && vSched.ranges.length > 0) {
                    const timeSlots = vSched.timeSlots || ['08:00'];

                    vSched.ranges.forEach(range => {
                        if (range.start && range.end) {
                            let curr = new Date(range.start);
                            const end = new Date(range.end);

                            while (curr <= end) {
                                const dStr = curr.toLocaleDateString('en-CA');
                                const isExcluded = vSched.excluded.some(ex => new Date(ex).toLocaleDateString('en-CA') === dStr);

                                if (!isExcluded) {
                                    // For each date, create sessions for all time slots
                                    timeSlots.forEach(time => {
                                        let startTime = time;
                                        // Ensure seconds
                                        if (startTime.length === 5) startTime += ':00';

                                        // Calculate end_time based on duration
                                        let endTime = null;
                                        const durationToUse = (vSched.durationHours !== null && vSched.durationHours !== undefined)
                                            ? vSched.durationHours
                                            : data.duration_hours;
                                        if (durationToUse !== null && durationToUse !== undefined) {
                                            const [h, m] = startTime.split(':').map(Number);
                                            // Handle hour calculation simply
                                            let endH = h + Number(durationToUse);
                                            // Optional: handle overflow modulo 24 if needed, but 'time' column might reject >24
                                            // For safety, let's keep it simple. If it's next day, it's just a time.
                                            // Postgres time type range: 00:00:00 to 24:00:00.
                                            // We'll wrap to 24h. This also correctly handles multi-day duration (e.g. 2 days 4 hours -> ends at Start+4)
                                            endH = endH % 24;

                                            // Format HH:mm:ss
                                            endTime = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
                                        }

                                        sessions.push({
                                            session_date: dStr,
                                            start_time: startTime,
                                            end_time: endTime,
                                            status: 'open',
                                            capacity: v.capacity_per_slot,
                                            capacity_available: v.capacity_per_slot
                                        });
                                    });
                                }
                                curr.setDate(curr.getDate() + 1);
                            }
                        }
                    });
                }

                return {
                    ...v,
                    id: v.id,
                    prices: v.prices.map(p => ({
                        id: p.id,
                        pax_type_id: p.pax_type_id,
                        price: p.price
                    })),
                    sessions: sessions
                };
            });

            const finalPayload = {
                ...data,
                slug: data.slug || undefined,
                images: uploadedImages.map(({ image_url, sort_no, is_cover }) => ({ image_url, sort_no, is_cover })),
                variants: nestedVariants
            };

            // 3. Save Tour
            if (isEdit && tourId) {
                await adminTourApi.update(tourId, finalPayload, token);
                toast.success('Cập nhật tour thành công!');
            } else {
                await adminTourApi.create(finalPayload, token);
                toast.success('Tạo tour thành công!');
            }

            setTimeout(() => {
                router.push('/admin/tour');
            }, 1500);
        } catch (error) {
            console.error('Failed to save tour', error);
            toast.error('Lỗi khi lưu tour: ' + (error as any).message);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container w-full py-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {isEdit ? 'Chỉnh sửa Tour' : 'Tạo Tour Mới'}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? `Đang chỉnh sửa tour #${tourId}: ${initialData?.title}` : 'Thiết lập thông tin và cấu hình cho gói du lịch của bạn.'}
                </p>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-5 gap-4">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="relative space-y-2">
                            <div className={cn(
                                "h-1.5 rounded-full transition-all duration-500",
                                isActive ? "bg-primary" :
                                    isCompleted ? "bg-emerald-500" : "bg-muted"
                            )} />
                            <div className="flex items-center gap-2 px-1">
                                <Icon className={cn(
                                    "h-4 w-4 transition-colors",
                                    isActive ? "text-primary" : isCompleted ? "text-emerald-500" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                    "text-xs font-medium truncate",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Separator className="bg-white/5" />

            <Form {...form}>
                <form id="tour-wizard-form" className="min-h-[500px]">
                    {currentStep === 1 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                    <CardDescription>Cung cấp các thông tin cốt lõi để khách hàng hiểu về tour.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên Tour</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: Tour Hạ Long 2 ngày 1 đêm" {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="summary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tóm tắt ngắn</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Mô tả ngắn gọn..." {...field} className="bg-background/50 border-white/10 min-h-[80px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả chi tiết</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Lịch trình chi tiết..." {...field} className="bg-background/50 border-white/10 min-h-[150px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Địa điểm & Phân loại</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Địa chỉ</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Số nhà, tên đường..." {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="country_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quốc gia / Khu vực</FormLabel>
                                                <Select key={`country-${field.value}`} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Chọn quốc gia" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {countries.map((c: any) => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="division_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tỉnh / Thành phố</FormLabel>
                                                <Select key={`division-${watchedCountryId}-${field.value}`} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()} disabled={!watchedCountryId || (divisions.length === 0 && field.value !== 0)}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Chọn tỉnh/thành" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {divisions.map((d: any) => (
                                                            <SelectItem key={d.id} value={d.id.toString()}>{d.name_local}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Đơn vị tiền tệ</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Chọn loại tiền" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {currencies.map((c: any) => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.symbol})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Cấu hình & Thời lượng</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Trạng thái Tour</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Trạng thái" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Bản nháp</SelectItem>
                                                        <SelectItem value="active">Hoạt động</SelectItem>
                                                        <SelectItem value="inactive">Tạm ngưng</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration_days"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Thời lượng (Ngày)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration_hours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số giờ lẻ (nếu có)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormDescription>
                                                    Ví dụ: 2 ngày 5 giờ (nhập 5 vào đây).
                                                    {(form.watch('duration_days') !== null || field.value) && (
                                                        <span className="block text-emerald-400 mt-1">
                                                            → Tổng thời gian:
                                                            {Number(form.watch('duration_days') || 0) > 0 ? ` ${form.watch('duration_days')} ngày` : ''}
                                                            {Number(form.watch('duration_days') || 0) > 0 && Number(field.value || 0) > 0 ? ' và' : ''}
                                                            {Number(field.value || 0) > 0 ? ` ${field.value} giờ` : ''}
                                                            {Number(form.watch('duration_days') || 0) === 0 && Number(field.value || 0) === 0 ? ' 0 giờ' : ''}
                                                        </span>
                                                    )}
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Thuế (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Bộ sưu tập hình ảnh</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-primary/5 bg-white/2 border-white/10">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="w-6 h-6 text-primary mb-3" />
                                            <p className="text-sm font-semibold text-primary text-center">Tải ảnh lên</p>
                                        </div>
                                        <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileUpload} accept="image/*" />
                                    </Label>

                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={form.getValues('images').map(img => img.image_url)} strategy={rectSortingStrategy}>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                {form.watch('images').map((img, idx) => (
                                                    <SortableTourImage
                                                        key={img.image_url}
                                                        id={img.image_url}
                                                        image={img}
                                                        onRemove={() => {
                                                            const newImages = form.getValues('images').filter((_, i) => i !== idx).map((restImg, restIdx) => ({
                                                                ...restImg, sort_no: restIdx, is_cover: restIdx === 0
                                                            }));
                                                            form.setValue('images', newImages);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">Biến thể & Giá</h3>
                                <Button type="button" variant="outline" onClick={() => appendVariant({
                                    name: `Biến thể ${variantFields.length + 1}`,
                                    min_pax_per_booking: 1, capacity_per_slot: 20, tax_included: true, cutoff_hours: 24, status: 'active',
                                    prices: [{ pax_type_id: 1, pax_type_name: 'Người lớn', price: 1000000 }, { pax_type_id: 2, pax_type_name: 'Trẻ em', price: 700000 }]
                                })}>Thêm biến thể</Button>
                            </div>

                            {variantFields.map((v, vIdx) => (
                                <Card key={v.id} className="bg-card/30 border-white/10 backdrop-blur-xl">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <FormField control={form.control} name={`variants.${vIdx}.name`} render={({ field }) => (
                                                <Input {...field} className="text-lg font-bold bg-transparent border-none p-0 focus-visible:ring-0 w-fit" />
                                            )} />
                                            <Button type="button" variant="ghost" className="text-red-400" onClick={() => removeVariant(vIdx)}>Xóa</Button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-white/5 py-3">
                                            <FormField control={form.control} name={`variants.${vIdx}.capacity_per_slot`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground">Sức chứa/Slot</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="h-8 bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`variants.${vIdx}.min_pax_per_booking`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground">Min Pax</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="h-8 bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`variants.${vIdx}.cutoff_hours`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase text-muted-foreground">Khóa trước (giờ)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="h-8 bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`variants.${vIdx}.tax_included`} render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-2 bg-background/50 self-end h-8">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-[10px] uppercase text-muted-foreground">Đã gồm thuế</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                            className="h-4 w-4 border-white/20"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {form.watch(`variants.${vIdx}.prices`).map((p: any, pIdx: number) => (
                                                <div key={pIdx} className="p-3 rounded-xl bg-background/50 border border-white/5">
                                                    <Label className="text-[10px] text-muted-foreground uppercase">{p.pax_type_name}</Label>
                                                    <FormField control={form.control} name={`variants.${vIdx}.prices.${pIdx}.price`} render={({ field }) => (
                                                        <Input type="number" {...field} className="h-9 font-bold bg-transparent border-none p-0 focus-visible:ring-0" />
                                                    )} />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            {form.getValues('variants').map((v, vIdx) => (
                                <VariantSchedulingEditor
                                    key={vIdx}
                                    value={(scheduling[vIdx]?.ranges || []).map(r => ({
                                        from: r.start ? new Date(r.start) : new Date(),
                                        to: r.end ? new Date(r.end) : new Date()
                                    }))}
                                    onChange={(newRanges) => {
                                        const current = scheduling[vIdx] || { ranges: [], excluded: [], timeSlots: [] };
                                        setScheduling({
                                            ...scheduling,
                                            [vIdx]: {
                                                ...current,
                                                ranges: newRanges.map(r => ({
                                                    start: r.from.toISOString().split('T')[0],
                                                    end: r.to.toISOString().split('T')[0]
                                                }))
                                            }
                                        });
                                    }}
                                    excludedDates={scheduling[vIdx]?.excluded || []}
                                    onExclude={(date) => {
                                        const current = scheduling[vIdx] || { ranges: [], excluded: [], timeSlots: [] };
                                        setScheduling({ ...scheduling, [vIdx]: { ...current, excluded: [...current.excluded, date] } });
                                    }}
                                    onRemoveExcluded={(date) => {
                                        const current = scheduling[vIdx];
                                        setScheduling({ ...scheduling, [vIdx]: { ...current, excluded: current.excluded.filter(d => d !== date) } });
                                    }}
                                    startTimeSlots={scheduling[vIdx]?.timeSlots || ['08:00']}
                                    onTimeSlotsChange={(slots) => {
                                        const current = scheduling[vIdx] || { ranges: [], excluded: [], timeSlots: [] };
                                        setScheduling({ ...scheduling, [vIdx]: { ...current, timeSlots: slots } });
                                    }}
                                    variantDuration={scheduling[vIdx]?.durationHours}
                                    onDurationChange={(dur) => {
                                        const current = scheduling[vIdx] || { ranges: [], excluded: [], timeSlots: [] };
                                        setScheduling({ ...scheduling, [vIdx]: { ...current, durationHours: dur } });
                                    }}
                                    durationDays={form.watch('duration_days') || 0}
                                />
                            ))}
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader className="pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        <div>
                                            <CardTitle>Xác nhận thông tin</CardTitle>
                                            <CardDescription>Kiểm tra kỹ các thông tin dưới đây trước khi hoàn tất.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    {/* Section 1: Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Thông tin cơ bản</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase">Tên tour</p>
                                                    <p className="font-semibold">{form.watch('title')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase">Địa chỉ</p>
                                                    <p className="text-sm">{form.watch('address')}</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Thời lượng</p>
                                                        <p className="text-sm">
                                                            {form.watch('duration_days') ? `${form.watch('duration_days')} ngày` : ''}
                                                            {form.watch('duration_days') && form.watch('duration_hours') ? ' ' : ''}
                                                            {form.watch('duration_hours') ? `${form.watch('duration_hours')} giờ` : ''}
                                                            {!form.watch('duration_days') && !form.watch('duration_hours') && 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Thuế</p>
                                                        <p className="text-sm">{form.watch('tax')}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Trạng thái</p>
                                                        <Badge variant="outline" className="capitalize">{form.watch('status')}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Hình ảnh</h4>
                                            <div className="flex items-center gap-4">
                                                {form.watch('images')?.[0] ? (
                                                    <div className="size-20 rounded-lg overflow-hidden border border-white/10">
                                                        <img src={form.watch('images')[0].image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="size-20 rounded-lg bg-muted flex items-center justify-center border border-dashed border-white/10">
                                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{form.watch('images')?.length || 0} hình ảnh đã chọn</p>
                                                    <p className="text-xs text-muted-foreground">Ảnh bìa đã được thiết lập</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    {/* Section 2: Variants & Prices */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Biến thể & Bảng giá</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {form.watch('variants')?.map((v, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3">
                                                    <p className="font-bold text-sm text-primary">{v.name}</p>
                                                    <div className="space-y-2">
                                                        {v.prices?.map((p, pIdx) => (
                                                            <div key={pIdx} className="flex justify-between text-xs">
                                                                <span className="text-muted-foreground">{p.pax_type_name}</span>
                                                                <span className="font-mono">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                                                        <span className="text-muted-foreground">Sức chứa: {v.capacity_per_slot}</span>
                                                        <span className="text-muted-foreground">Cutoff: {v.cutoff_hours}h</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    {/* Section 3: Scheduling */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Lịch trình cài đặt</h4>
                                        <div className="space-y-3">
                                            {form.watch('variants')?.map((v, idx) => {
                                                const sched = scheduling[idx];
                                                return (
                                                    <div key={idx} className="flex flex-col gap-1">
                                                        <p className="text-xs font-semibold">{v.name}:</p>
                                                        {sched?.ranges?.length ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {sched.ranges.map((r, rIdx) => (
                                                                    <Badge key={rIdx} variant="secondary" className="text-[10px] bg-white/5">
                                                                        {r.start} → {r.end}
                                                                    </Badge>
                                                                ))}
                                                                {sched.excluded?.length > 0 && (
                                                                    <span className="text-[10px] text-red-400 self-center">
                                                                        (Trừ {sched.excluded.length} ngày)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-muted-foreground">Chưa cài đặt lịch trình</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="pt-4">
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={() => form.handleSubmit(onSubmit)()}
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-500 w-full shadow-lg shadow-emerald-900/20"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang lưu...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="size-4" />
                                            {isEdit ? 'Cập nhật thay đổi' : 'Hoàn tất & Lưu Tour'}
                                        </div>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground mt-4">
                                    Bằng cách nhấn nút trên, bạn đồng ý rằng tất cả thông tin đã cung cấp là chính xác.
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            </Form>

            <div className="flex justify-between pt-8 border-t border-white/5">
                <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSubmitting}>Quay lại</Button>
                {currentStep < 5 && <Button onClick={nextStep} className="px-8 bg-primary">Tiếp theo</Button>}
            </div>
        </div>
    );
}
