"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import VariantSchedulingEditor from './components/VariantSchedulingEditor';
import SortableTourImage from './components/SortableTourImage';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';

const STEPS = [
    { id: 1, title: 'Thông tin chung', icon: Info },
    { id: 2, title: 'Hình ảnh', icon: ImageIcon },
    { id: 3, title: 'Biến thể & Giá', icon: Settings2 },
    { id: 4, title: 'Lịch trình & Session', icon: CalendarDays },
    { id: 5, title: 'Xem lại', icon: CheckCircle2 },
];

const tourSchema = z.object({
    title: z.string().min(5, "Tên tour phải có ít nhất 5 ký tự"),
    slug: z.string().min(5, "Slug phải có ít nhất 5 ký tự"),
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
        name: z.string().min(1, "Tên biến thể không được để trống"),
        min_pax_per_booking: z.coerce.number().min(1),
        capacity_per_slot: z.coerce.number().min(1),
        tax_included: z.boolean().default(true),
        cutoff_hours: z.coerce.number().min(0),
        status: z.string(),
        prices: z.array(z.object({
            pax_type_id: z.number(),
            pax_type_name: z.string(),
            price: z.coerce.number().min(0)
        }))
    })).min(1, "Vui lòng thêm ít nhất 1 biến thể"),
    is_visible: z.boolean().default(true),
    status: z.string().default('active'),
    duration_hours: z.coerce.number().nullable().optional(),
    duration_days: z.coerce.number().nullable().optional(),
    published_at: z.string().nullable().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

export default function CreateTourPage() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const [currentStep, setCurrentStep] = useState(1);

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
        excluded: string[]
    }>>({});

    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 1) {
            isValid = await form.trigger(['title', 'slug', 'summary', 'description', 'address', 'country_id', 'division_id', 'tax', 'duration_days', 'duration_hours']);
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

            const finalPayload = {
                ...data,
                images: uploadedImages.map(({ image_url, sort_no, is_cover }) => ({ image_url, sort_no, is_cover }))
            };

            // 2. Create Tour
            const tour = await adminTourApi.create(finalPayload, token);
            const tourId = tour.id;

            // 3. Create Variants & Sessions
            for (let i = 0; i < data.variants.length; i++) {
                const v = data.variants[i];
                const variant = await adminTourApi.addVariant(tourId, v, token);
                const variantId = variant.id;

                // 3.1 Set Pax Prices
                for (const p of v.prices) {
                    await adminTourApi.setVariantPaxTypePrice({
                        tour_variant_id: variantId,
                        pax_type_id: p.pax_type_id,
                        price: p.price
                    }, token);
                }

                // 3.2 Generate & Bulk Create Sessions
                const vSched = scheduling[i];
                if (vSched && vSched.ranges.length > 0) {
                    const allDates: string[] = [];
                    vSched.ranges.forEach(range => {
                        if (range.start && range.end) {
                            let curr = new Date(range.start);
                            const end = new Date(range.end);
                            while (curr <= end) {
                                const dStr = curr.toISOString().split('T')[0];
                                if (!vSched.excluded.includes(dStr)) {
                                    allDates.push(dStr);
                                }
                                curr.setDate(curr.getDate() + 1);
                            }
                        }
                    });

                    if (allDates.length > 0) {
                        const sessionDtos = allDates.map(d => ({
                            tour_variant_id: variantId,
                            session_date: d,
                            status: 'open',
                            capacity: v.capacity_per_slot,
                            capacity_available: v.capacity_per_slot
                        }));
                        await adminTourApi.bulkAddSessions(sessionDtos, token);
                    }
                }
            }

            alert('Tạo tour thành công!');
            window.location.href = '/admin/dashboard';
        } catch (error) {
            console.error('Failed to save tour', error);
            alert('Lỗi khi lưu tour: ' + (error as any).message);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container w-full py-12 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Tạo Tour Mới
                </h1>
                <p className="text-muted-foreground">Thiết lập thông tin và cấu hình cho gói du lịch của bạn.</p>
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

            {/* Form */}
            <Form {...form}>
                <form id="create-tour-form" onSubmit={form.handleSubmit(onSubmit)} className="min-h-[500px]">
                    {currentStep === 1 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                    <CardDescription>Cung cấp các thông tin cốt lõi để khách hàng hiểu về tour.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
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
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Slug (URL)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="tour-ha-long-2n1d" {...field} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

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
                                                <Select onValueChange={(val) => {
                                                    field.onChange(parseInt(val));
                                                }} defaultValue={field.value?.toString()}>
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
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()} disabled={!watchedCountryId || divisions.length === 0}>
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
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
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
                                    <CardDescription>Thiết lập trạng thái hiển thị và thời gian diễn ra tour.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Trạng thái Tour</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                                <SelectValue placeholder="Trạng thái" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
                                                            <SelectItem value="active">Đang hoạt động (Active)</SelectItem>
                                                            <SelectItem value="inactive">Ngừng hoạt động (Inactive)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="is_visible"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hiển thị trên website</FormLabel>
                                                    <Select onValueChange={(v) => field.onChange(v === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="true">Có hiển thị</SelectItem>
                                                            <SelectItem value="false">Ẩn</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="published_at"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ngày công bố</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="duration_days"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Thời lượng (Ngày)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="duration_hours"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Thời lượng (Giờ)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Thuế tour (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                            <CardHeader>
                                                <CardTitle>Bộ sưu tập hình ảnh</CardTitle>
                                                <CardDescription>Tải ảnh lên hệ thống (Cloudinary). Ảnh đầu tiên sẽ được chọn làm ảnh bìa.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <Label
                                                        htmlFor="file-upload"
                                                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:bg-primary/5 hover:border-primary/40 group bg-white/2 border-white/10"
                                                    >
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <div className="p-3 rounded-full bg-primary/10 mb-3 transition-transform group-hover:scale-110">
                                                                <ImageIcon className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <p className="mb-2 text-sm text-foreground">
                                                                <span className="font-semibold text-primary">Click để chọn ảnh</span> hoặc kéo thả vào đây
                                                            </p>
                                                            <p className="text-xs text-muted-foreground uppercase tracking-widest">PNG, JPG hoặc WebP (Tối đa 5MB)</p>
                                                        </div>
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            className="hidden"
                                                            multiple
                                                            onChange={handleFileUpload}
                                                            accept="image/*"
                                                        />
                                                    </Label>
                                                </div>

                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <SortableContext
                                                        items={field.value.map(img => img.image_url)}
                                                        strategy={rectSortingStrategy}
                                                    >
                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                            {field.value.map((img, idx) => (
                                                                <SortableTourImage
                                                                    key={img.image_url}
                                                                    id={img.image_url}
                                                                    image={img}
                                                                    onRemove={() => {
                                                                        if (img.image_url.startsWith('blob:')) {
                                                                            URL.revokeObjectURL(img.image_url);
                                                                        }
                                                                        const newImages = field.value.filter((_, i) => i !== idx).map((restImg, restIdx) => ({
                                                                            ...restImg,
                                                                            sort_no: restIdx,
                                                                            is_cover: restIdx === 0
                                                                        }));
                                                                        field.onChange(newImages);
                                                                    }}
                                                                />
                                                            ))}
                                                            {field.value.length === 0 && (
                                                                <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-muted-foreground bg-white/2">
                                                                    <ImageIcon className="h-10 w-10 mb-3 opacity-20" />
                                                                    <p className="text-sm font-medium">Chưa có hình ảnh nào được chọn</p>
                                                                    <p className="text-xs opacity-50 mt-1 text-center max-w-[200px]">Bạn nên tải lên ít nhất 3-5 ảnh chất lượng cao.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                                <FormMessage />
                                            </CardContent>
                                        </Card>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">Cấu hình Biến thể Tour</h3>
                                    <p className="text-sm text-muted-foreground">Tạo các gói dịch vụ khác nhau (Standard, VIP, Trọn gói...)</p>
                                </div>
                                <Button type="button" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={() => {
                                    appendVariant({
                                        name: `Biến thể ${variantFields.length + 1}`,
                                        min_pax_per_booking: 1,
                                        capacity_per_slot: 20,
                                        tax_included: true,
                                        cutoff_hours: 24,
                                        status: 'active',
                                        prices: [
                                            { pax_type_id: 1, pax_type_name: 'Người lớn', price: 1000000 },
                                            { pax_type_id: 2, pax_type_name: 'Trẻ em', price: 700000 },
                                        ]
                                    });
                                }}>
                                    Thêm biến thể
                                </Button>
                            </div>

                            {variantFields.map((v, vIdx) => (
                                <Card key={v.id} className="bg-card/30 border-white/10 backdrop-blur-xl group overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${vIdx}.name`}
                                                render={({ field }) => (
                                                    <Input {...field} className="text-lg font-bold bg-transparent border-none p-0 focus-visible:ring-0 w-fit h-auto" />
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => removeVariant(vIdx)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${vIdx}.min_pax_per_booking`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground">Min Pax</Label>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="h-8 bg-background/50" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`variants.${vIdx}.capacity_per_slot`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground">Capacity / Slot</Label>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="h-8 bg-background/50" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`variants.${vIdx}.cutoff_hours`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground">Cutoff (Giờ)</Label>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="h-8 bg-background/50" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`variants.${vIdx}.status`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground">Trạng thái</Label>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-8 bg-background/50">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="active">Hoạt động</SelectItem>
                                                                <SelectItem value="inactive">Tạm ngưng</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator className="bg-white/5" />

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Bảng giá gốc (Base Pricing)</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {v.prices.map((p, pIdx) => (
                                                    <div key={pIdx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                                                        <span className="text-sm flex-1">{p.pax_type_name}</span>
                                                        <div className="relative w-32">
                                                            <FormField
                                                                control={form.control}
                                                                name={`variants.${vIdx}.prices.${pIdx}.price`}
                                                                render={({ field }) => (
                                                                    <FormControl>
                                                                        <Input type="number" {...field} className="h-8 pl-6 pr-2 bg-background/50 border-white/10" />
                                                                    </FormControl>
                                                                )}
                                                            />
                                                            <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">₫</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {variantFields.length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/2">
                                    <Settings2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-muted-foreground">Hãy thêm ít nhất một biến thể (gói dịch vụ) để bắt đầu</p>
                                </div>
                            )}
                            {form.formState.errors.variants && (
                                <p className="text-red-500 text-sm text-center">{form.formState.errors.variants.message}</p>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Lịch trình & Phiên chạy (Sessions)</CardTitle>
                                    <CardDescription>Thiết lập các ngày khởi hành cụ thể cho từng biến thể. Bạn có thể chọn nhiều khoảng ngày và loại trừ những ngày không hoạt động.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {variantFields.length === 0 && (
                                        <div className="py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                            Vui lòng quay lại bước 3 để thêm ít nhất một biến thể.
                                        </div>
                                    )}
                                    {variantFields.map((v, vIdx) => {
                                        const vSched = scheduling[vIdx] || { ranges: [], excluded: [] };

                                        return (
                                            <VariantSchedulingEditor
                                                key={v.id}
                                                variant={v}
                                                vIdx={vIdx}
                                                vSched={vSched}
                                                onAddRange={() => {
                                                    const newRanges = [...vSched.ranges, { start: '', end: '' }];
                                                    setScheduling({ ...scheduling, [vIdx]: { ...vSched, ranges: newRanges } });
                                                }}
                                                onUpdateRange={(rIdx, field, val) => {
                                                    const newRanges = [...vSched.ranges];
                                                    newRanges[rIdx][field] = val;
                                                    setScheduling({ ...scheduling, [vIdx]: { ...vSched, ranges: newRanges } });
                                                }}
                                                onRemoveRange={(rIdx) => {
                                                    const newRanges = vSched.ranges.filter((_, i) => i !== rIdx);
                                                    setScheduling({ ...scheduling, [vIdx]: { ...vSched, ranges: newRanges } });
                                                }}
                                                onAddExcluded={(date) => {
                                                    if (date && !vSched.excluded.includes(date)) {
                                                        setScheduling({ ...scheduling, [vIdx]: { ...vSched, excluded: [...vSched.excluded, date] } });
                                                    }
                                                }}
                                                onRemoveExcluded={(date) => {
                                                    setScheduling({ ...scheduling, [vIdx]: { ...vSched, excluded: vSched.excluded.filter(d => d !== date) } });
                                                }}
                                            />
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="relative group overflow-hidden rounded-3xl border border-white/10 p-8 bg-gradient-to-br from-primary/10 via-background to-background">
                                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                                    <CheckCircle2 className="h-32 w-32 text-primary" />
                                </div>

                                <h3 className="text-2xl font-bold mb-2">Kiểm tra thông tin cuối cùng</h3>
                                <p className="text-muted-foreground max-w-lg mb-8">
                                    Vui lòng xem lại tất cả các thông số bên dưới trước khi xác nhận lưu tour vào hệ thống.
                                </p>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Trạng thái & Hiển thị</span>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                form.getValues('status') === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                            )}>
                                                {form.getValues('status')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {form.getValues('is_visible') ? '(Hiển thị)' : '(Ẩn)'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Thời lượng</span>
                                        <p className="font-semibold text-sm">
                                            {form.getValues('duration_days') ? `${form.getValues('duration_days')} Ngày` : ''}
                                            {form.getValues('duration_hours') ? ` ${form.getValues('duration_hours')} Giờ` : ''}
                                            {!form.getValues('duration_days') && !form.getValues('duration_hours') && 'Chưa đặt'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Thuế & Tiền tệ</span>
                                        <p className="font-semibold text-sm">
                                            {form.getValues('tax')}% VAT
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Biến thể</span>
                                        <p className="font-semibold text-sm">{variantFields.length} gói dịch vụ</p>
                                    </div>
                                </div>

                                <Separator className="my-8 bg-white/5" />

                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {form.getValues('images').slice(0, 3).map((img, i) => (
                                            <div key={i} className="h-12 w-12 rounded-full border-2 border-background overflow-hidden bg-muted">
                                                <img src={img.image_url} alt="" className="object-cover w-full h-full" />
                                            </div>
                                        ))}
                                        {form.getValues('images').length > 3 && (
                                            <div className="h-12 w-12 rounded-full border-2 border-background bg-white/10 flex items-center justify-center text-xs font-bold">
                                                +{form.getValues('images').length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {form.getValues('images').length} hình ảnh đã được thiết lập
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-card/20 border-white/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Trạng thái phát hành</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs w-fit">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Sẵn sàng công bố
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/20 border-white/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Lịch trình & Sessions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {variantFields.map((v, vIdx) => {
                                            const vSched = scheduling[vIdx] || { ranges: [], excluded: [] };
                                            return (
                                                <div key={vIdx} className="space-y-1">
                                                    <div className="text-xs font-medium text-primary">{v.name}</div>
                                                    <div className="text-[10px] text-muted-foreground flex flex-col gap-0.5">
                                                        {vSched.ranges.map((r, rIdx) => (
                                                            <div key={rIdx}>• {r.start} đến {r.end}</div>
                                                        ))}
                                                        {vSched.excluded.length > 0 && (
                                                            <div className="text-red-400/70">Loại trừ {vSched.excluded.length} ngày</div>
                                                        )}
                                                        {vSched.ranges.length === 0 && (
                                                            <div className="italic">Chưa có lịch trình</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </form>
            </Form>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="gap-2 hover:bg-white/5"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div className="flex gap-4">
                    {currentStep < STEPS.length ? (
                        <Button type="button" onClick={nextStep} className="gap-2 px-8">
                            Tiếp theo
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            form="create-tour-form"
                            disabled={isSubmitting}
                            className="gap-2 px-8 bg-emerald-600 hover:bg-emerald-500 min-w-[160px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Hoàn tất & Lưu
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div >
    );
}
