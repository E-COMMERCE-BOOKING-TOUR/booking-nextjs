"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    Settings2,
    CalendarDays,
    Save,
    ListChecks,
    MessageSquareQuote,
    Trash2,
    Plus,
    Info,
    Image as ImageIcon,
    CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
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
import { useForm, useFieldArray, Resolver, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';

const STEPS = [
    { id: 1, title: 'General Info', icon: Info },
    { id: 2, title: 'Details & Amenities', icon: ListChecks },
    { id: 3, title: 'Images', icon: ImageIcon },
    { id: 4, title: 'Variants & Prices', icon: Settings2 },
    { id: 5, title: 'Schedule & Sessions', icon: CalendarDays },
    { id: 6, title: 'Confirmation', icon: CheckCircle2 },
];

const tourSchema = z.object({
    title: z.string().min(5, "Tour title must be at least 5 characters"),
    slug: z.string().optional(),
    description: z.string().min(20, "Description must be at least 20 characters"),
    summary: z.string().min(10, "Summary must be at least 10 characters"),
    address: z.string().min(5, "Address cannot be empty"),
    map_url: z.string().optional(),
    tax: z.coerce.number().min(0, "Tax cannot be negative"),
    min_pax: z.coerce.number().min(1, "Minimum pax is 1"),
    max_pax: z.coerce.number().nullable().optional(),
    country_id: z.coerce.number().min(1, "Please select a country"),
    division_id: z.coerce.number().min(1, "Please select a division"),
    currency_id: z.coerce.number().default(1),
    supplier_id: z.coerce.number().default(1),
    tour_category_ids: z.array(z.number()).default([]),
    images: z.array(z.object({
        image_url: z.string(),
        sort_no: z.number(),
        is_cover: z.boolean(),
        file: z.any().optional()
    })).min(1, "Please select at least 1 image"),
    variants: z.array(z.object({
        id: z.number().optional(),
        name: z.string().min(1, "Variant name cannot be empty"),
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
    })).min(1, "Please add at least 1 variant"),
    is_visible: z.boolean().default(true),
    status: z.enum(['draft', 'active', 'inactive']).default('active'),
    duration_hours: z.coerce.number().min(0).nullable().optional(),
    duration_days: z.coerce.number().min(0).nullable().optional(),
    published_at: z.string().nullable().optional(),
    meeting_point: z.string().optional(),
    included: z.array(z.string()).default([]),
    not_included: z.array(z.string()).default([]),
    highlights: z.object({
        title: z.string().default('Highlights'),
        items: z.array(z.string()).default([])
    }).optional(),
    languages: z.array(z.string()).default(['English', 'Vietnamese']),
    staff_score: z.coerce.number().min(0).max(10).default(0),
    testimonial: z.object({
        name: z.string().optional(),
        country: z.string().optional(),
        text: z.string().optional()
    }).optional(),
    map_preview: z.string().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

import { IAdminTourDetail, IAdminTourVariant } from "@/types/admin/tour.dto";

interface TourWizardProps {
    tourId?: number | string;
    initialData?: IAdminTourDetail;
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
            meeting_point: '',
            included: [],
            not_included: [],
            highlights: { title: 'Highlights', items: [] },
            languages: ['Vietnamese', 'English'],
            staff_score: 9.0,
            testimonial: { name: '', country: '', text: '' },
            map_preview: '',
        }
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control: form.control,
        name: "variants"
    });

    // Compute scheduling from initialData using useMemo to avoid setState in effect
    const initialScheduling = useMemo(() => {
        if (!initialData?.variants) return {};

        const computed: Record<number, {
            ranges: { start: string, end: string }[],
            excluded: string[],
            timeSlots?: string[],
            durationHours?: number | null
        }> = {};

        initialData.variants.forEach((v, vIdx: number) => {
            if (v.tour_sessions?.length) {
                const sortedSessions = [...v.tour_sessions].sort((a, b) =>
                    new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
                );

                const minDate = sortedSessions[0].session_date;
                const maxDate = sortedSessions[sortedSessions.length - 1].session_date;

                const allDates: string[] = [];
                const curr = new Date(minDate);
                const end = new Date(maxDate);
                while (curr <= end) {
                    allDates.push(curr.toISOString().split('T')[0]);
                    curr.setDate(curr.getDate() + 1);
                }

                const sessionDates = sortedSessions.map(s => s.session_date);
                const excluded = allDates.filter(d => !sessionDates.includes(d));

                // Extract unique time slots
                const timeSlots = Array.from(new Set(sortedSessions.map((s) => {
                    const t = s.start_time;
                    if (!t) return null;
                    const tStr = typeof t === 'string' ? t : new Date(t).toLocaleTimeString('en-GB', { hour12: false });
                    return tStr.substring(0, 5);
                }))).filter(Boolean) as string[];

                // Determine duration from the first session that has both times
                let durationHours = null;
                const sessionWithDuration = sortedSessions.find((s) => s.start_time && s.end_time);
                if (sessionWithDuration) {
                    const safeGetTime = (t: string | Date | number | unknown) => {
                        if (typeof t === 'string') return t;
                        if (t instanceof Date) return t.toLocaleTimeString('en-GB', { hour12: false });
                        return new Date(t).toLocaleTimeString('en-GB', { hour12: false });
                    };
                    const [h1] = safeGetTime(sessionWithDuration.start_time).split(':').map(Number);
                    const [h2] = safeGetTime(sessionWithDuration.end_time).split(':').map(Number);
                    durationHours = h2 - h1 + (h2 < h1 ? 24 : 0);
                }

                computed[vIdx] = {
                    ranges: [{ start: minDate, end: maxDate }],
                    excluded,
                    timeSlots: timeSlots.length > 0 ? timeSlots : undefined,
                    durationHours
                };
            }
        });

        return computed;
    }, [initialData]);

    const [scheduling, setScheduling] = useState<Record<number, {
        ranges: { start: string, end: string }[],
        excluded: string[],
        timeSlots?: string[],
        durationHours?: number | null
    }>>(initialScheduling);

    // Watch form values for reactive UI
    const watchedImages = useWatch({ control: form.control, name: 'images' });
    const watchedCountryId = useWatch({ control: form.control, name: 'country_id' });
    const watchedDurationDays = useWatch({ control: form.control, name: 'duration_days' });
    const watchedDurationHours = useWatch({ control: form.control, name: 'duration_hours' });
    const watchedTax = useWatch({ control: form.control, name: 'tax' });
    const watchedStatus = useWatch({ control: form.control, name: 'status' });
    const watchedTitle = useWatch({ control: form.control, name: 'title' });
    const watchedAddress = useWatch({ control: form.control, name: 'address' });
    const watchedVariants = useWatch({ control: form.control, name: 'variants' });
    const watchedHighlights = useWatch({ control: form.control, name: 'highlights' });
    const watchedInclusions = useWatch({ control: form.control, name: 'included' });
    const watchedExclusions = useWatch({ control: form.control, name: 'not_included' });
    const watchedLanguages = useWatch({ control: form.control, name: 'languages' });

    useEffect(() => {
        if (initialData) {
            // Transform initialData to match form structure if needed
            const mappedData: Partial<TourFormValues> = {
                ...initialData,
                map_url: initialData.map_url || undefined,
                country_id: initialData.country?.id || initialData.country_id || 0,
                division_id: initialData.division?.id || initialData.division_id || 0,
                currency_id: initialData.currency?.id || initialData.currency_id || 1,
                supplier_id: initialData.supplier?.id || initialData.supplier_id || 1,
                duration_hours: initialData.duration_hours || null,
                duration_days: initialData.duration_days || null,
                tax: initialData.tax || 0,
                tour_category_ids: initialData.tour_categories?.map((c) => c.id) || [],
                published_at: initialData.published_at ? new Date(initialData.published_at).toISOString().split('T')[0] : null,
                variants: initialData.variants?.map((v: IAdminTourVariant) => ({
                    ...v,
                    prices: v.tour_variant_pax_type_prices?.map((p) => ({
                        id: p.id,
                        pax_type_id: p.pax_type?.id || 0,
                        pax_type_name: p.pax_type?.name || '',
                        price: p.price
                    })) || []
                })) || [],
                meeting_point: initialData.meeting_point || '',
                included: initialData.included || [],
                not_included: initialData.not_included || [],
                highlights: initialData.highlights || { title: 'Highlights', items: [] },
                languages: initialData.languages || ['Vietnamese', 'English'],
                staff_score: initialData.staff_score || 9.0,
                testimonial: initialData.testimonial || { name: '', country: '', text: '' },
                map_preview: initialData.map_preview || '',
            };


            form.reset(mappedData);
        }
    }, [initialData, form]);


    const { data: divisions = [] } = useQuery({
        queryKey: ['divisions', watchedCountryId],
        queryFn: () => adminTourApi.getDivisions(watchedCountryId, token),
        enabled: !!token && !!watchedCountryId,
        staleTime: 5 * 60 * 1000,
    });


    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 1) {
            isValid = await form.trigger(['title', 'summary', 'description', 'address', 'country_id', 'division_id', 'tax', 'duration_days', 'duration_hours']);
        } else if (currentStep === 2) {
            isValid = await form.trigger(['meeting_point', 'included', 'not_included', 'highlights', 'languages', 'staff_score', 'testimonial']);
        } else if (currentStep === 3) {
            isValid = await form.trigger(['images']);
        } else if (currentStep === 4) {
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
                const sessions: unknown[] = [];
                if (vSched && vSched.ranges.length > 0) {
                    const timeSlots = vSched.timeSlots || ['08:00'];

                    vSched.ranges.forEach(range => {
                        if (range.start && range.end) {
                            const curr = new Date(range.start);
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
                variants: nestedVariants,
                status: data.status as "draft" | "active" | "inactive"
            };

            // 3. Save Tour
            if (isEdit && tourId) {
                await adminTourApi.update(tourId, finalPayload, token);
                toast.success('Tour updated successfully!');
            } else {
                await adminTourApi.create(finalPayload, token);
                toast.success('Tour created successfully!');
            }

            setTimeout(() => {
                router.push('/admin/tour');
            }, 1500);
        } catch (error) {
            console.error('Failed to save tour', error);
            const err = error as Error;
            toast.error('Error saving tour: ' + err.message);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container w-full py-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {isEdit ? 'Edit Tour' : 'Create New Tour'}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? `Editing tour #${tourId}: ${initialData?.title}` : 'Setup information and configuration for your tour package.'}
                </p>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Provide core information so customers can understand the tour.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tour Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Ha Long Bay 2 Days 1 Night" {...field} className="bg-background/50 border-white/10" />
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
                                                <FormLabel>Short Summary</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Brief description..." {...field} className="bg-background/50 border-white/10 min-h-[80px]" />
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
                                                <FormLabel>Detailed Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Full itinerary details..." {...field} className="bg-background/50 border-white/10 min-h-[150px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Location & Classification</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Street address, city..." {...field} className="bg-background/50 border-white/10" />
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
                                                <FormLabel>Country / Region</FormLabel>
                                                <Select key={`country-${field.value}`} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Select Country" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {countries.map((c) => (
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
                                                <FormLabel>Province / City</FormLabel>
                                                <Select key={`division-${watchedCountryId}-${field.value}`} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()} disabled={!watchedCountryId || (divisions.length === 0 && field.value !== 0)}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Select Province/City" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {divisions.map((d) => (
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
                                                <FormLabel>Currency</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Select Currency" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {currencies.map((c) => (
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
                                    <CardTitle>Configuration & Duration</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tour Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
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
                                                <FormLabel>Duration (Days)</FormLabel>
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
                                                <FormLabel>Extra Hours</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormDescription>
                                                    Example: 2 days 5 hours (enter 5 here).
                                                    {(watchedDurationDays !== null || field.value) && (
                                                        <span className="block text-emerald-400 mt-1">
                                                            → Total Time:
                                                            {Number(watchedDurationDays || 0) > 0 ? ` ${watchedDurationDays} days` : ''}
                                                            {Number(watchedDurationDays || 0) > 0 && Number(field.value || 0) > 0 ? ' and' : ''}
                                                            {Number(field.value || 0) > 0 ? ` ${field.value} hours` : ''}
                                                            {Number(watchedDurationDays || 0) === 0 && Number(field.value || 0) === 0 ? ' 0 hours' : ''}
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
                                                <FormLabel>Tax (%)</FormLabel>
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
                            {/* Section: Highlights */}
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <ListChecks className="h-5 w-5 text-primary" />
                                        <CardTitle>Highlights</CardTitle>
                                    </div>
                                    <CardDescription>Key features that attract customers to this tour.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="highlights.title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Section Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Activity Highlights" {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <Label>Highlight Items</Label>
                                        {watchedHighlights?.items?.map((_, index) => (
                                            <div key={index} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`highlights.items.${index}`}
                                                    render={({ field }) => (
                                                        <Input {...field} className="bg-background/50 border-white/10" placeholder="Highlight detail..." />
                                                    )}
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => {
                                                    const current = form.getValues('highlights.items');
                                                    form.setValue('highlights.items', current.filter((_, i) => i !== index));
                                                }}>
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 text-primary border-primary/20 hover:bg-primary/5"
                                            onClick={() => {
                                                const current = form.getValues('highlights.items') || [];
                                                form.setValue('highlights.items', [...current, '']);
                                            }}
                                        >
                                            <Plus className="size-4 mr-2" /> Add Highlight
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section: Inclusions & Exclusions */}
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle className="text-emerald-400">Included</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {watchedInclusions?.map((_, index) => (
                                            <div key={index} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`included.${index}`}
                                                    render={({ field }) => (
                                                        <Input {...field} className="bg-background/50 border-white/10" placeholder="e.g. Lunch, Bus..." />
                                                    )}
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => {
                                                    const current = form.getValues('included');
                                                    form.setValue('included', current.filter((_, i) => i !== index));
                                                }}>
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full border border-dashed border-white/10 hover:border-emerald-500/50 hover:text-emerald-500"
                                            onClick={() => {
                                                const current = form.getValues('included') || [];
                                                form.setValue('included', [...current, '']);
                                            }}
                                        >
                                            <Plus className="size-4 mr-2" /> Add Included Item
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle className="text-rose-400">Not Included</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {watchedExclusions?.map((_, index) => (
                                            <div key={index} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`not_included.${index}`}
                                                    render={({ field }) => (
                                                        <Input {...field} className="bg-background/50 border-white/10" placeholder="e.g. Tips, Personal expenses..." />
                                                    )}
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => {
                                                    const current = form.getValues('not_included');
                                                    form.setValue('not_included', current.filter((_, i) => i !== index));
                                                }}>
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full border border-dashed border-white/10 hover:border-rose-500/50 hover:text-rose-500"
                                            onClick={() => {
                                                const current = form.getValues('not_included') || [];
                                                form.setValue('not_included', [...current, '']);
                                            }}
                                        >
                                            <Plus className="size-4 mr-2" /> Add Excluded Item
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Section: Other Info */}
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>Additional Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="meeting_point"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Meeting Point</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Gathering location..." {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <Label>Languages Supported</Label>
                                        <div className="flex flex-wrap gap-2 p-4 rounded-lg border border-white/10 bg-background/20">
                                            {['Vietnamese', 'English', 'French', 'Chinese', 'Korean', 'Japanese'].map((lang) => (
                                                <Badge
                                                    key={lang}
                                                    variant={watchedLanguages.includes(lang) ? "default" : "outline"}
                                                    className="cursor-pointer hover:bg-primary/80"
                                                    onClick={() => {
                                                        const current = form.getValues('languages');
                                                        if (current.includes(lang)) {
                                                            form.setValue('languages', current.filter(l => l !== lang));
                                                        } else {
                                                            form.setValue('languages', [...current, lang]);
                                                        }
                                                    }}
                                                >
                                                    {lang}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="testimonial.name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Featured Testimonial Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Client Name" {...field} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="testimonial.text"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testimonial Content</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Review text..." {...field} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Image Gallery</h3>
                                    <p className="text-sm text-muted-foreground">Drag and drop to reorder. The first image will be the cover.</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                        onChange={handleFileUpload}
                                    />
                                    <Button variant="outline" className="border-dashed border-primary text-primary hover:bg-primary/5">
                                        <Plus className="size-4 mr-2" /> Upload Images
                                    </Button>
                                </div>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={watchedImages.map(img => img.image_url)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {watchedImages.map((image, index) => (
                                            <SortableTourImage
                                                key={image.image_url}
                                                id={image.image_url}
                                                image={image}
                                                onRemove={() => {
                                                    const newImages = watchedImages.filter((_, i) => i !== index);
                                                    form.setValue('images', newImages);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {watchedImages.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                    <ImageIcon className="size-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground font-medium">No images yet</p>
                                    <p className="text-xs text-muted-foreground/60">Upload at least one image to continue</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Tour Variants</h3>
                                    <p className="text-sm text-muted-foreground">Define different package options (Standard, Deluxe, etc.)</p>
                                </div>
                                <Button onClick={() => appendVariant({
                                    name: 'Standard',
                                    min_pax_per_booking: 1,
                                    capacity_per_slot: 20,
                                    tax_included: true,
                                    cutoff_hours: 24,
                                    status: 'active',
                                    prices: [
                                        { pax_type_id: 1, pax_type_name: 'Adult', price: 0 },
                                        { pax_type_id: 2, pax_type_name: 'Child', price: 0 }
                                    ]
                                })} className="bg-primary text-primary-foreground">
                                    <Plus className="size-4 mr-2" /> Add Variant
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {variantFields.map((field, index) => (
                                    <Card key={field.id} className="bg-card/30 border-white/5 relative group">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-50 hover:opacity-100 hover:text-destructive text-muted-foreground transition-opacity"
                                            onClick={() => removeVariant(index)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Variant Name</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="e.g. Standard" className="bg-background/50" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.capacity_per_slot`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Capacity</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-background/50" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Pricing</Label>
                                                <div className="flex gap-4">
                                                    {form.watch(`variants.${index}.prices`).map((price, pIdx) => (
                                                        <FormField
                                                            key={pIdx}
                                                            control={form.control}
                                                            name={`variants.${index}.prices.${pIdx}.price`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <FormLabel className="text-xs">{price.pax_type_name}</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="pl-8 bg-background/50" />
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                                                        </div>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {variantFields.length === 0 && (
                                    <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                        No variants added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Schedule & Sessions</h3>
                                    <p className="text-sm text-muted-foreground">Configure availability and departure times for each variant.</p>
                                </div>
                            </div>

                            {variantFields.length === 0 ? (
                                <div className="p-8 text-center text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                    Please add at least one variant in the previous step first.
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {variantFields.map((variant, index) => (
                                        <div key={variant.id} className="border border-white/10 rounded-xl p-6 bg-card/10">
                                            <div className="mb-4">
                                                <h4 className="font-bold text-primary text-lg">{form.getValues(`variants.${index}.name`)}</h4>
                                                <p className="text-xs text-muted-foreground">Configure schedule for this variant</p>
                                            </div>
                                            <VariantSchedulingEditor
                                                value={scheduling[index] || { ranges: [], excluded: [], timeSlots: ['08:00'] }}
                                                onChange={(newSchedule) => {
                                                    setScheduling(prev => ({
                                                        ...prev,
                                                        [index]: newSchedule
                                                    }));
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-4 ring-emerald-500/20 ring-offset-4 ring-offset-background">
                                <CheckCircle2 className="size-12 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Ready to Launch!</h2>
                            <p className="text-muted-foreground text-center max-w-lg">
                                You have completed all the necessary steps. Review your information one last time before saving.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Title</span>
                                    <p className="font-medium truncate">{watchedTitle}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                                    <p className="font-medium truncate">{watchedAddress}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Variants</span>
                                    <p className="font-medium">{watchedVariants?.length || 0} variants configured</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                                    <Badge variant="outline" className="capitalize">{watchedStatus}</Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </Form>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 sticky bottom-0 bg-background/80 backdrop-blur-xl p-4 -mx-4 md:static md:bg-transparent md:p-0">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    {currentStep < STEPS.length ? (
                        <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[150px] shadow-lg shadow-emerald-500/20"
                        >
                            {isSubmitting ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save className="size-4 mr-2" />
                                    {isEdit ? 'Update Tour' : 'Create Tour'}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
