"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import {
    Settings2,
    CalendarDays,
    Save,
    Trash2,
    Plus,
    Info,
    Image as ImageIcon,
    CheckCircle2,
    ListChecks,
    Eye,
    EyeOff,
    Calendar,
    X
} from 'lucide-react';

import { ApiError } from '@/libs/fetchC';
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
import { CreateTourDTO } from '@/types/admin/tour.dto';
import { adminTourApi } from '@/apis/admin/tour';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray, Resolver, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';

const STEPS = [
    { id: 1, title: 'tour_wizard_general_info', icon: Info },
    { id: 2, title: 'tour_wizard_details_amenities', icon: ListChecks },
    { id: 3, title: 'tour_wizard_images', icon: ImageIcon },
    { id: 4, title: 'tour_wizard_variants_prices', icon: Settings2 },
    { id: 5, title: 'tour_wizard_schedule_sessions', icon: CalendarDays },
    { id: 6, title: 'tour_wizard_confirmation', icon: CheckCircle2 },
];


const baseTourSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(1),
    summary: z.string().min(1),
    address: z.string().min(1),
    map_url: z.string().optional(),
    tax: z.coerce.number().min(0),
    min_pax: z.coerce.number().min(1),
    max_pax: z.coerce.number().nullable().optional(),
    country_id: z.coerce.number().min(1),
    division_id: z.coerce.number().min(1),
    currency_id: z.coerce.number().default(1),
    supplier_id: z.coerce.number().default(1),
    tour_category_ids: z.array(z.number()).default([]),
    images: z.array(z.object({
        image_url: z.string(),
        sort_no: z.number(),
        is_cover: z.boolean(),
        file: z.any().optional()
    })).min(1),
    variants: z.array(z.object({
        id: z.number().optional(),
        name: z.string().min(2),
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
        })),
        tour_policy_id: z.coerce.number().min(1)
    })).min(1),
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
    map_preview_file: z.any().optional(),
});

type TourFormValues = z.infer<typeof baseTourSchema>;


import { IAdminTourDetail, IAdminTourVariant } from "@/types/admin/tour.dto";

interface TourWizardProps {
    tourId?: number | string;
    initialData?: IAdminTourDetail;
}

const VariantPricing = ({ control, index }: { control: Control<TourFormValues>, index: number }) => {
    const prices = useWatch({
        control,
        name: `variants.${index}.prices`
    }) || [];

    return (
        <div className="flex gap-4">
            {prices.map((price: { pax_type_name: string }, pIdx: number) => (
                <FormField
                    key={pIdx}
                    control={control}
                    name={`variants.${index}.prices.${pIdx}.price`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel className="text-xs">{price.pax_type_name}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                        className="pl-8 bg-background/50"
                                    />
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            ))}
        </div>
    );
};

export default function TourWizard({ tourId, initialData }: TourWizardProps) {
    const t = useTranslations('admin');
    const router = useRouter();

    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const [currentStep, setCurrentStep] = useState(1);
    const isEdit = !!tourId;

    // Auto-save to localStorage
    const DRAFT_KEY = isEdit ? `tour-wizard-edit-${tourId}` : 'tour-wizard-draft';
    const [showDraftRecovery, setShowDraftRecovery] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Function to save draft to localStorage
    const saveDraft = useCallback((data: TourFormValues) => {
        try {
            // Don't save file objects, they can't be serialized
            const dataToSave = {
                ...data,
                images: data.images?.map(img => ({ ...img, file: undefined })),
                map_preview_file: undefined,
                _savedAt: Date.now(),
                _step: currentStep,
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
        } catch (e) {
            console.warn('Failed to save draft:', e);
        }
    }, [DRAFT_KEY, currentStep]);

    // Function to clear draft
    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(DRAFT_KEY);
            setHasDraft(false);
        } catch (e) {
            console.warn('Failed to clear draft:', e);
        }
    }, [DRAFT_KEY]);

    // loadDraft is defined after form is declared

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
    const tourSchema = useMemo(() => z.object({
        title: z.string().min(2, t('tour_wizard_error_title_min')),
        description: z.string().min(1, t('tour_wizard_error_description_min')),
        summary: z.string().min(1, t('tour_wizard_error_summary_min')),
        address: z.string().min(1, t('tour_wizard_error_address_required')),
        map_url: z.string().optional(),
        tax: z.coerce.number().min(0, t('tour_wizard_error_tax_negative')),
        min_pax: z.coerce.number().min(1, t('tour_wizard_error_min_pax')),
        max_pax: z.coerce.number().nullable().optional(),
        country_id: z.coerce.number().min(1, t('tour_wizard_error_country_required')),
        division_id: z.coerce.number().min(1, t('tour_wizard_error_division_required')),
        currency_id: z.coerce.number().default(1),
        supplier_id: z.coerce.number().default(1),
        tour_category_ids: z.array(z.number()).default([]),
        images: z.array(z.object({
            image_url: z.string(),
            sort_no: z.number(),
            is_cover: z.boolean(),
            file: z.any().optional()
        })).min(1, t('tour_wizard_error_image_min')),
        variants: z.array(z.object({
            id: z.number().optional(),
            name: z.string().min(2, t('tour_wizard_error_variant_name_required')),
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
            })),
            tour_policy_id: z.coerce.number().min(1, t('tour_wizard_error_policy_required'))
        })).min(1, t('tour_wizard_error_variant_min')),
        is_visible: z.boolean().default(true),
        status: z.enum(['draft', 'active', 'inactive']).default('active'),
        duration_hours: z.coerce.number().min(0).nullable().optional(),
        duration_days: z.coerce.number().min(0).nullable().optional(),
        published_at: z.string().nullable().optional(),
        meeting_point: z.string().optional(),
        included: z.array(z.string()).default([]),
        not_included: z.array(z.string()).default([]),
        highlights: z.object({
            title: z.string().default(t('tour_wizard_highlights_label')),
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
        map_preview_file: z.any().optional(),
    }).refine(data => {
        if (data.max_pax && data.min_pax > data.max_pax) return false;
        return true;
    }, {
        message: t('tour_wizard_error_max_pax'),
        path: ['max_pax']
    }), [t]);

    const form = useForm<TourFormValues>({
        resolver: zodResolver(tourSchema) as Resolver<TourFormValues>,

        defaultValues: {
            title: '',
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
            map_preview_file: null,
        }
    });

    // Function to load draft (defined after form to avoid reference error)
    const loadDraft = useCallback(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Remove internal fields before resetting form
                delete parsed._savedAt;
                const savedStep = parsed._step || 1;
                delete parsed._step;
                form.reset(parsed);
                setCurrentStep(savedStep);
                setShowDraftRecovery(false);
                setHasDraft(false);
                toast.success(t('tour_wizard_draft_restored'));
            }
        } catch (e) {
            console.warn('Failed to load draft:', e);
        }
    }, [DRAFT_KEY, form, t]);

    const selectedSupplierId = useWatch({ control: form.control, name: 'supplier_id' });

    const { data: policies = [] } = useQuery({
        queryKey: ['policies', selectedSupplierId],
        queryFn: () => adminTourApi.getPoliciesBySupplier(selectedSupplierId, token),
        enabled: !!token && !!selectedSupplierId,
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
                    allDates.push(curr.toLocaleDateString('en-CA'));
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
                    const safeGetTime = (t: string | Date | number | unknown): string => {
                        if (typeof t === 'string') return t;
                        if (t instanceof Date) return t.toLocaleTimeString('en-GB', { hour12: false });
                        if (typeof t === 'number') return new Date(t).toLocaleTimeString('en-GB', { hour12: false });
                        return String(t);
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
    const watchedImages = useWatch({ control: form.control, name: 'images' }) || [];
    const watchedCountryId = useWatch({ control: form.control, name: 'country_id' });
    const watchedDurationDays = useWatch({ control: form.control, name: 'duration_days' });

    const watchedStatus = useWatch({ control: form.control, name: 'status' }) || 'active';
    const watchedTitle = useWatch({ control: form.control, name: 'title' }) || '';
    const watchedAddress = useWatch({ control: form.control, name: 'address' }) || '';
    const watchedVariants = useWatch({ control: form.control, name: 'variants' }) || [];
    const watchedHighlights = useWatch({ control: form.control, name: 'highlights' });
    const watchedInclusions = useWatch({ control: form.control, name: 'included' }) || [];
    const watchedExclusions = useWatch({ control: form.control, name: 'not_included' }) || [];
    const watchedLanguages = useWatch({ control: form.control, name: 'languages' }) || [];
    const watchedMapPreview = useWatch({ control: form.control, name: 'map_preview' });

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
                    id: v.id,
                    name: v.name,
                    min_pax_per_booking: v.min_pax_per_booking,
                    capacity_per_slot: v.capacity_per_slot,
                    tax_included: v.tax_included,
                    cutoff_hours: v.cutoff_hours,
                    status: v.status,
                    prices: v.tour_variant_pax_type_prices?.map((p) => ({
                        id: p.id,
                        pax_type_id: p.pax_type?.id || 0,
                        pax_type_name: p.pax_type?.name || '',
                        price: p.price
                    })) || [],
                    tour_policy_id: v.tour_policy?.id || 0,
                    sessions: v.tour_sessions?.map(s => ({
                        session_date: s.session_date,
                        start_time: s.start_time,
                        end_time: s.end_time || null,
                        status: 'open',
                        capacity: 0,
                        capacity_available: 0
                    })) || []
                })) || [],
                meeting_point: initialData.meeting_point || '',
                included: initialData.included || [],
                not_included: initialData.not_included || [],
                highlights: {
                    title: initialData.highlights?.title || 'Highlights',
                    items: initialData.highlights?.items || []
                },
                languages: initialData.languages || ['Vietnamese', 'English'],
                staff_score: initialData.staff_score || 9.0,
                testimonial: initialData.testimonial || { name: '', country: '', text: '' },
                map_preview: initialData.map_preview || '',
                min_pax: initialData.min_pax || 1,
                max_pax: initialData.max_pax || null,
            };


            form.reset(mappedData);
        }
    }, [initialData, form]);

    // Check for saved draft on mount (only for create mode or if no initialData changes being made)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                const savedAt = parsed._savedAt;

                // For create mode, always show recovery prompt if draft exists
                // For edit mode, only show if draft is newer than 1 minute ago (avoid stale drafts)
                if (!isEdit || (savedAt && Date.now() - savedAt < 24 * 60 * 60 * 1000)) {
                    setHasDraft(true);
                    setShowDraftRecovery(true);
                } else {
                    // Clear stale drafts
                    localStorage.removeItem(DRAFT_KEY);
                }
            }
        } catch (e) {
            console.warn('Failed to check for draft:', e);
        }
    }, [DRAFT_KEY, isEdit]);

    // Auto-save form changes with debounce (save after 3 seconds of no changes)
    const watchAllFields = useWatch({ control: form.control });

    useEffect(() => {
        // Don't auto-save if there's a recovery prompt showing
        if (showDraftRecovery) return;

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer to save after 3 seconds
        autoSaveTimerRef.current = setTimeout(() => {
            const values = form.getValues();
            // Only save if there's meaningful data
            if (values.title || values.description || values.images?.length > 0) {
                saveDraft(values);
            }
        }, 3000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [watchAllFields, form, saveDraft, showDraftRecovery]);


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

    const onSubmit = React.useCallback(async (data: TourFormValues) => {
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

            // Upload map preview if pending
            let finalMapPreview = data.map_preview;
            if (data.map_preview_file) {
                const fd = new FormData();
                fd.append('file', data.map_preview_file);
                const res = await adminTourApi.uploadImage(fd, token);
                if (res) {
                    finalMapPreview = res.secure_url;
                }
            }

            // 2. Prepare Nested Variants, Prices, and Sessions
            const nestedVariants = data.variants.map((v, i) => {
                const vSched = scheduling[i];
                const sessions: NonNullable<NonNullable<CreateTourDTO['variants']>[number]['sessions']> = [];
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
                    id: v.id,
                    name: v.name,
                    min_pax_per_booking: v.min_pax_per_booking,
                    capacity_per_slot: v.capacity_per_slot,
                    tax_included: v.tax_included,
                    cutoff_hours: v.cutoff_hours,
                    status: v.status,
                    prices: v.prices.map(p => ({
                        id: p.id,
                        pax_type_id: p.pax_type_id,
                        price: p.price
                    })),
                    tour_policy_id: v.tour_policy_id,
                    sessions: sessions
                };
            });

            const finalPayload: CreateTourDTO = {
                ...data,
                // Convert published_at to ISO 8601 format if it's a date-only string
                published_at: data.published_at ? new Date(data.published_at).toISOString() : undefined,
                images: uploadedImages.map(({ file, ...rest }) => rest),
                map_preview: finalMapPreview,
                variants: nestedVariants,
            };

            // Remove internal UI fields from payload
            delete (finalPayload as any).map_preview_file;
            delete (finalPayload as any).slug;

            // Clean up empty optional objects - testimonial fields are all required in backend
            const testimonial = finalPayload.testimonial;
            if (!testimonial || !testimonial.name?.trim() || !testimonial.country?.trim() || !testimonial.text?.trim()) {
                delete finalPayload.testimonial;
            }
            const highlights = finalPayload.highlights;
            if (highlights && (!highlights.items || highlights.items.length === 0)) {
                delete finalPayload.highlights;
            }

            // 3. Save Tour
            if (isEdit && tourId) {
                await adminTourApi.update(tourId, finalPayload, token);
                toast.success('Tour updated successfully!');
            } else {
                await adminTourApi.create(finalPayload, token);
                toast.success('Tour created successfully!');
            }

            // Clear draft after successful save
            clearDraft();

            setTimeout(() => {
                router.push('/admin/tour');
            }, 1500);
        } catch (error) {
            console.error('Failed to save tour', error);
            if (error instanceof ApiError && error.errors) {
                // Field name mapping for better UX
                const fieldLabels: Record<string, string> = {
                    title: t('tour_wizard_title_label'),
                    description: t('tour_wizard_description_label'),
                    summary: t('tour_wizard_summary_label'),
                    address: t('tour_wizard_address_label'),
                    map_url: t('tour_wizard_map_url_label'),
                    tax: t('tour_wizard_tax_label'),
                    min_pax: t('tour_wizard_min_pax_label'),
                    max_pax: t('tour_wizard_max_pax_label'),
                    country_id: t('tour_wizard_country_label'),
                    division_id: t('tour_wizard_division_label'),
                    currency_id: t('tour_wizard_currency_label'),
                    images: t('tour_wizard_images'),
                    variants: t('tour_wizard_variants_label'),
                    'variants.name': t('tour_wizard_variant_name_label'),
                    'variants.tour_policy_id': t('tour_wizard_refund_policy_label'),
                    'variants.prices': t('tour_wizard_pricing_label'),
                    meeting_point: t('tour_wizard_meeting_point_label'),
                    included: t('tour_wizard_included_label'),
                    not_included: t('tour_wizard_not_included_label'),
                    highlights: t('tour_wizard_highlights_label'),
                    languages: t('tour_wizard_languages_label'),
                    testimonial: t('tour_wizard_testimonial_name_label'),
                };

                const getFieldLabel = (field: string): string => {
                    // Check for exact match first
                    if (fieldLabels[field]) return fieldLabels[field];
                    // Check for pattern match (e.g., variants.0.name -> variants.name)
                    const normalized = field.replace(/\.\d+\./g, '.');
                    if (fieldLabels[normalized]) return fieldLabels[normalized];
                    return field;
                };

                const errorMessages = error.errors.map(err => {
                    const label = getFieldLabel(err.field);
                    const issue = err.issues?.[0] || t('tour_wizard_error_invalid');
                    return `${label}: ${issue}`;
                });

                toast.error(
                    <div className="space-y-1">
                        <strong>{t('tour_wizard_error_invalid_data')}:</strong>
                        <ul className="list-disc list-inside text-sm">
                            {errorMessages.slice(0, 5).map((msg, i) => (
                                <li key={i}>{msg}</li>
                            ))}
                            {errorMessages.length > 5 && <li>{t('tour_wizard_error_more_errors', { count: errorMessages.length - 5 })}</li>}
                        </ul>
                    </div>,
                    { duration: 8000 }
                );

                // Recursive function to map nested errors to react-hook-form
                const setNestedErrors = (errs: any[], path = "") => {
                    errs.forEach(err => {
                        const currentPath = path ? `${path}.${err.field}` : err.field;
                        if (err.issues && err.issues.length > 0) {
                            form.setError(currentPath as any, {
                                type: 'manual',
                                message: err.issues[0]
                            });
                        }
                        if (err.errors && err.errors.length > 0) {
                            setNestedErrors(err.errors, currentPath);
                        }
                    });
                };

                setNestedErrors(error.errors);
            } else {
                const err = error as Error;
                toast.error(t('tour_wizard_error_save_tour') + ': ' + err.message);
            }
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    }, [currentStep, token, tourId, isEdit, router, scheduling]);

    const handleFinalSubmit = () => {
        form.handleSubmit(onSubmit)();
    };

    return (
        <div className="container w-full py-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {isEdit ? t('tour_wizard_edit_tour') : t('tour_wizard_create_new_tour')}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? t('tour_wizard_editing_desc', { id: tourId, title: initialData?.title ?? '' }) : t('tour_wizard_setup_desc')}
                </p>
            </div>

            {/* Draft Recovery Banner */}
            {showDraftRecovery && hasDraft && (
                <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-full">
                            <Save className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{t('tour_wizard_draft_found')}</p>
                            <p className="text-xs text-muted-foreground">{t('tour_wizard_draft_description')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                clearDraft();
                                setShowDraftRecovery(false);
                            }}
                        >
                            {t('tour_wizard_discard_draft')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={loadDraft}
                            className="bg-amber-500 hover:bg-amber-600"
                        >
                            {t('tour_wizard_restore_draft')}
                        </Button>
                    </div>
                </div>
            )}

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
                                    {t(step.title as any)}
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
                                    <CardTitle>{t('tour_wizard_basic_info')}</CardTitle>
                                    <CardDescription>{t('tour_wizard_basic_info_desc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('tour_wizard_title_label')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('tour_wizard_title_placeholder')} {...field} className="bg-background/50 border-white/10" />
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
                                                <FormLabel>{t('tour_wizard_summary_label')}</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder={t('tour_wizard_summary_placeholder')} {...field} className="bg-background/50 border-white/10 min-h-[80px]" />
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
                                                <FormLabel>{t('tour_wizard_description_label')}</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder={t('tour_wizard_description_placeholder')} {...field} className="bg-background/50 border-white/10 min-h-[150px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>{t('tour_wizard_location_classification')}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('tour_wizard_address_label')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('tour_wizard_address_placeholder')} {...field} className="bg-background/50 border-white/10" />
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
                                                <FormLabel>{t('tour_wizard_country_label')}</FormLabel>
                                                <Select key={`country-${field.value}`} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder={t('tour_wizard_country_placeholder')} />
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
                                                <FormLabel>{t('tour_wizard_division_label')}</FormLabel>
                                                <Select key={`division-${watchedCountryId}-${field.value}`} onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()} disabled={!watchedCountryId || (divisions.length === 0 && field.value !== 0)}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder={t('tour_wizard_division_placeholder')} />
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
                                                <FormLabel>{t('tour_wizard_currency_label')}</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder={t('tour_wizard_currency_placeholder')} />
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
                                    <CardTitle>{t('tour_wizard_config_duration')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5">
                                        <FormField
                                            control={form.control}
                                            name="min_pax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('tour_wizard_min_pax_label')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="max_pax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('tour_wizard_max_pax_label')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('tour_wizard_status_label')}</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                                <SelectValue placeholder={t('tour_wizard_status_placeholder')} />
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
                                                    <FormLabel>{t('tour_wizard_duration_days_label')}</FormLabel>
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
                                                    <FormLabel>{t('tour_wizard_duration_hours_label')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {t('tour_wizard_duration_hours_desc')}
                                                        {(watchedDurationDays !== null || field.value) && (
                                                            <span className="block text-emerald-400 mt-1">
                                                                → {t('tour_wizard_total_time')}:
                                                                {Number(watchedDurationDays || 0) > 0 ? ` ${watchedDurationDays} ${t('tour_wizard_days')}` : ''}
                                                                {Number(watchedDurationDays || 0) > 0 && Number(field.value || 0) > 0 ? ` ${t('tour_wizard_and')}` : ''}
                                                                {Number(field.value || 0) > 0 ? ` ${field.value} ${t('tour_wizard_hours')}` : ''}
                                                                {Number(watchedDurationDays || 0) === 0 && Number(field.value || 0) === 0 ? ` 0 ${t('tour_wizard_hours')}` : ''}
                                                            </span>
                                                        )}
                                                    </FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="tax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('tour_wizard_tax_label')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            {t('tour_wizard_visibility_settings')}
                                        </h4>
                                        <FormField
                                            control={form.control}
                                            name="is_visible"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4 bg-background/50">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base text-white">{t('tour_wizard_visibility_label')}</FormLabel>
                                                        <FormDescription>
                                                            {t('tour_wizard_visibility_desc')}
                                                        </FormDescription>
                                                    </div>

                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="published_at"
                                            render={({ field }) => {
                                                const isVisible = form.watch('is_visible');
                                                const publishedAt = field.value;
                                                const isScheduled = publishedAt && new Date(publishedAt) > new Date();

                                                let statusColor = 'text-emerald-400';
                                                let statusIcon = <Eye className="h-4 w-4" />;
                                                let statusText = t('tour_wizard_visibility_status_visible');

                                                if (!isVisible) {
                                                    statusColor = 'text-red-400';
                                                    statusIcon = <EyeOff className="h-4 w-4" />;
                                                    statusText = t('tour_wizard_visibility_status_hidden');
                                                } else if (isScheduled) {
                                                    statusColor = 'text-amber-400';
                                                    statusIcon = <Calendar className="h-4 w-4" />;
                                                    statusText = t('tour_wizard_visibility_status_scheduled', { date: new Date(publishedAt).toLocaleDateString('vi-VN') });
                                                }

                                                return (
                                                    <div className="space-y-3">
                                                        <FormItem>
                                                            <FormLabel>{t('tour_wizard_published_at_label')}</FormLabel>
                                                            <FormControl>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        type="date"
                                                                        {...field}
                                                                        value={field.value || ''}
                                                                        className="bg-background/50 border-white/10"
                                                                    />
                                                                    {field.value && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => field.onChange(null)}
                                                                            className="shrink-0"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormDescription className="text-xs">
                                                                {t('tour_wizard_published_at_hint')}
                                                            </FormDescription>
                                                        </FormItem>
                                                        <div className={`flex items-center gap-2 p-3 rounded-lg bg-background/30 border border-white/5 ${statusColor}`}>
                                                            {statusIcon}
                                                            <span className="text-sm font-medium">{statusText}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                        <CardTitle>{t('tour_wizard_map_settings')}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="map_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('tour_wizard_map_url_label')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('tour_wizard_map_url_placeholder')} {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="map_preview_file"
                                        render={({ field: { value, onChange, ...fieldProps } }) => {
                                            const mapPreviewInputRef = React.useRef<HTMLInputElement>(null);
                                            return (
                                                <FormItem>
                                                    <FormLabel>{t('tour_wizard_map_preview_label')}</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative size-40 rounded-lg border-2 border-dashed border-white/10 bg-white/5 overflow-hidden group">
                                                                    {watchedMapPreview ? (
                                                                        <>
                                                                            <img src={watchedMapPreview} alt="Map Preview" className="size-full object-cover" />
                                                                            <Button
                                                                                type="button"
                                                                                variant="destructive"
                                                                                size="icon"
                                                                                className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                onClick={() => {
                                                                                    onChange(null);
                                                                                    form.setValue('map_preview', '');
                                                                                }}
                                                                            >
                                                                                <X className="size-3" />
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <div className="size-full flex items-center justify-center">
                                                                            <ImageIcon className="size-8 text-muted-foreground/30" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <input
                                                                        ref={mapPreviewInputRef}
                                                                        type="file"
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                onChange(file);
                                                                                form.setValue('map_preview', URL.createObjectURL(file));
                                                                            }
                                                                        }}
                                                                        accept="image/*"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => mapPreviewInputRef.current?.click()}
                                                                    >
                                                                        <Plus className="size-4 mr-2" /> {t('tour_wizard_upload_map_preview')}
                                                                    </Button>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        {t('tour_wizard_image_gallery_desc')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
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
                                        <CardTitle>{t('tour_wizard_highlights')}</CardTitle>
                                    </div>
                                    <CardDescription>{t('tour_wizard_highlights_desc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="highlights.title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('tour_wizard_section_title')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('tour_wizard_section_title_placeholder')} {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <Label>{t('tour_wizard_highlight_items')}</Label>

                                        {watchedHighlights?.items?.map((_, index) => (
                                            <div key={index} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`highlights.items.${index}`}
                                                    render={({ field }) => (
                                                        <Input {...field} className="bg-background/50 border-white/10" placeholder={t('tour_wizard_highlight_detail_placeholder')} />
                                                    )}
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => {
                                                    const current = form.getValues('highlights.items') || [];
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
                                            <Plus className="size-4 mr-2" /> {t('tour_wizard_add_highlight')}
                                        </Button>

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section: Inclusions & Exclusions */}
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle className="text-emerald-400">{t('tour_wizard_included')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {watchedInclusions?.map((_, index) => (
                                            <div key={index} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`included.${index}`}
                                                    render={({ field }) => (
                                                        <Input {...field} className="bg-background/50 border-white/10" placeholder={t('tour_wizard_included_placeholder')} />
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
                                            <Plus className="size-4 mr-2" /> {t('tour_wizard_add_included_item')}
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle className="text-rose-400">{t('tour_wizard_not_included')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {watchedExclusions?.map((_, index) => (
                                            <div key={index} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`not_included.${index}`}
                                                    render={({ field }) => (
                                                        <Input {...field} className="bg-background/50 border-white/10" placeholder={t('tour_wizard_not_included_placeholder')} />
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
                                            <Plus className="size-4 mr-2" /> {t('tour_wizard_add_excluded_item')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>


                            {/* Section: Other Info */}
                            <Card className="bg-card/30 border-white/5 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle>{t('tour_wizard_additional_info')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="meeting_point"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('tour_wizard_meeting_point')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('tour_wizard_meeting_point_placeholder')} {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <Label>{t('tour_wizard_languages_supported')}</Label>
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
                                                    {t(`tour_wizard_language_${lang.toLowerCase()}` as any)}
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
                                                    <FormLabel>{t('tour_wizard_testimonial_name')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t('tour_wizard_testimonial_name_placeholder')} {...field} className="bg-background/50 border-white/10" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="testimonial.text"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('tour_wizard_testimonial_content')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t('tour_wizard_testimonial_content_placeholder')} {...field} className="bg-background/50 border-white/10" />
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
                                    <h3 className="text-lg font-semibold">{t('tour_wizard_image_gallery')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('tour_wizard_image_gallery_desc')}</p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                        onChange={handleFileUpload}
                                    />
                                    <Button type="button" variant="outline" className="border-dashed border-primary text-primary hover:bg-primary/5">
                                        <Plus className="size-4 mr-2" /> {t('tour_wizard_upload_images')}
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
                                        {watchedImages.map((img, index) => (
                                            <SortableTourImage
                                                key={img.image_url}
                                                id={img.image_url}
                                                image={img}
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
                                    <p className="text-muted-foreground font-medium">{t('tour_wizard_no_images_yet')}</p>
                                    <p className="text-xs text-muted-foreground/60">{t('tour_wizard_no_images_desc')}</p>
                                </div>
                            )}

                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{t('tour_wizard_tour_variants')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('tour_wizard_tour_variants_desc')}</p>
                                </div>

                                <Button type="button" onClick={() => appendVariant({
                                    name: 'Standard',
                                    min_pax_per_booking: 1,
                                    capacity_per_slot: 20,
                                    tax_included: true,
                                    cutoff_hours: 24,
                                    status: 'active',
                                    prices: [
                                        { pax_type_id: 1, pax_type_name: 'Adult', price: 0 },
                                        { pax_type_id: 2, pax_type_name: 'Child', price: 0 }
                                    ],
                                    tour_policy_id: 0
                                })} className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2">
                                    <Plus className="size-4 mr-2" /> {t('tour_wizard_add_variant')}
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
                                                            <FormLabel>{t('tour_wizard_variant_name_label')}</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder={t('tour_wizard_variant_name_placeholder')} className="bg-background/50" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.capacity_per_slot`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('tour_wizard_capacity_label')}</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-background/50" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">{t('tour_wizard_pricing')}</Label>
                                                <VariantPricing control={form.control} index={index} />
                                            </div>


                                            <Separator className="bg-white/5 my-4" />

                                            <div className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`variants.${index}.tour_policy_id`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center justify-between">
                                                                <FormLabel className="text-base font-semibold text-primary">{t('tour_wizard_refund_policy')}</FormLabel>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 text-xs text-primary hover:text-primary/80"
                                                                    onClick={() => router.push('/admin/tour/policies')}
                                                                >
                                                                    {t('tour_wizard_manage_policies')}
                                                                </Button>
                                                            </div>
                                                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-background/40 h-10 border-white/10">
                                                                        <SelectValue placeholder={t('tour_wizard_select_policy_placeholder')} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                                    {policies.map((p) => (
                                                                        <SelectItem key={p.id} value={p.id!.toString()} className="hover:bg-white/10 focus:bg-white/10">
                                                                            {p.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                    {policies.length === 0 && (
                                                                        <div className="p-2 text-xs text-muted-foreground italic">
                                                                            {t('tour_wizard_no_policies_found')}
                                                                        </div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription className="text-[10px] text-muted-foreground">
                                                                {t('tour_wizard_refund_policy_desc')}
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {variantFields.length === 0 && (
                                    <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                        {t('tour_wizard_no_variants_yet')}
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{t('tour_wizard_schedule_sessions')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('tour_wizard_schedule_sessions_desc')}</p>
                                </div>
                            </div>


                            {variantFields.length === 0 ? (
                                <div className="p-8 text-center text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                    {t('tour_wizard_variants_step_required')}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {variantFields.map((variant, index) => (
                                        <div key={variant.id} className="border border-white/10 rounded-xl p-6 bg-card/10">
                                            <div className="mb-4">
                                                <h4 className="font-bold text-primary text-lg">{form.getValues(`variants.${index}.name`)}</h4>
                                                <p className="text-xs text-muted-foreground">{t('tour_wizard_configure_schedule')}</p>
                                            </div>
                                            <VariantSchedulingEditor
                                                value={scheduling[index] || { ranges: [], excluded: [], timeSlots: ['08:00'] }}
                                                onChange={(newSchedule) => {
                                                    setScheduling(prev => ({
                                                        ...prev,
                                                        [index]: newSchedule
                                                    }));
                                                }}
                                                durationDays={Number(watchedDurationDays) || 0}
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
                            <h2 className="text-2xl font-bold">{t('tour_wizard_ready_launch')}</h2>
                            <p className="text-muted-foreground text-center max-w-lg">
                                {t('tour_wizard_ready_launch_desc')}
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('tour_wizard_summary_title')}</span>
                                    <p className="font-medium truncate">{watchedTitle}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('tour_wizard_summary_location')}</span>
                                    <p className="font-medium truncate">{watchedAddress}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('tour_wizard_summary_variants')}</span>
                                    <p className="font-medium">{t('tour_wizard_variants_configured', { count: watchedVariants?.length || 0 })}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('tour_wizard_summary_status')}</span>
                                    <Badge variant="outline" className="capitalize">{watchedStatus}</Badge>
                                </div>
                            </div>
                        </div>
                    )}

                </form>
            </Form>

            <div className="w-full flex items-center justify-between pt-6 bg-background/80 backdrop-blur-xl md:static md:bg-transparent md:p-0">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {t('tour_wizard_back')}
                </Button>
                <div className="flex items-center gap-3">
                    {currentStep < STEPS.length ? (
                        <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                            {t('tour_wizard_next_step')}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleFinalSubmit}
                            disabled={isSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[150px] shadow-lg shadow-emerald-500/20"
                        >
                            {isSubmitting ? (
                                <>{t('tour_wizard_saving')}</>
                            ) : (
                                <>
                                    <Save className="size-4 mr-2" />
                                    {isEdit ? t('tour_wizard_update_tour') : t('tour_wizard_create_tour')}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

        </div >
    );
}
