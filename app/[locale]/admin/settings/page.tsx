"use client";

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsApi, SiteSettings, UpdateSiteSettingsDTO } from '@/apis/admin/settings';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Save,
    Upload,
    Globe,
    Image as ImageIcon,
    Building2,
    Share2,
    Loader2,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type SettingsFormData = UpdateSiteSettingsDTO;

interface PendingBanner {
    file: File;
    preview: string;
}

export default function AdminSettingsPage() {
    const t = useTranslations("admin");
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();

    // Pending files for direct fields (logo, favicon)
    const [pendingLogo, setPendingLogo] = useState<PendingBanner | null>(null);
    const [pendingFavicon, setPendingFavicon] = useState<PendingBanner | null>(null);

    // Pending files for banner arrays
    const [pendingSquareBanners, setPendingSquareBanners] = useState<PendingBanner[]>([]);
    const [pendingRectBanners, setPendingRectBanners] = useState<PendingBanner[]>([]);

    // Track removed existing banners
    const [removedSquareBanners, setRemovedSquareBanners] = useState<string[]>([]);
    const [removedRectBanners, setRemovedRectBanners] = useState<string[]>([]);

    const logoRef = useRef<HTMLInputElement>(null);
    const faviconRef = useRef<HTMLInputElement>(null);
    const squareBannerRef = useRef<HTMLInputElement>(null);
    const rectBannerRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue } = useForm<SettingsFormData>();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['admin-settings', token],
        queryFn: () => adminSettingsApi.get(token),
        enabled: !!token,
    });

    // Initialize form when settings load
    useEffect(() => {
        if (settings) {
            Object.keys(settings).forEach(key => {
                const value = settings[key as keyof SiteSettings];
                if (value !== null && value !== undefined) {
                    setValue(key as keyof SettingsFormData, value as Parameters<typeof setValue>[1]);
                }
            });
        }
    }, [settings, setValue]);

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            [pendingLogo, pendingFavicon, ...pendingSquareBanners, ...pendingRectBanners].forEach(b => {
                if (b) URL.revokeObjectURL(b.preview);
            });
        };
    }, [pendingLogo, pendingFavicon, pendingSquareBanners, pendingRectBanners]);

    const updateMutation = useMutation({
        mutationFn: (data: UpdateSiteSettingsDTO) => adminSettingsApi.update(data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success(t('toast_settings_update_success'));
            setPendingLogo(null);
            setPendingFavicon(null);
            setPendingSquareBanners([]);
            setPendingRectBanners([]);
            setRemovedSquareBanners([]);
            setRemovedRectBanners([]);
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_settings_update_error'));
        }
    });

    const onDirectFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') => {
        const file = e.target.files?.[0];
        if (file) {
            const b = { file, preview: URL.createObjectURL(file) };
            if (field === 'logo_url') {
                if (pendingLogo) URL.revokeObjectURL(pendingLogo.preview);
                setPendingLogo(b);
            } else {
                if (pendingFavicon) URL.revokeObjectURL(pendingFavicon.preview);
                setPendingFavicon(b);
            }
        }
    };

    const onBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'square' | 'rect') => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newBanners = files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            if (type === 'square') {
                setPendingSquareBanners(prev => [...prev, ...newBanners]);
            } else {
                setPendingRectBanners(prev => [...prev, ...newBanners]);
            }
        }
        // Reset input value so same file can be selected again if needed
        e.target.value = '';
    };

    const removePendingBanner = (index: number, type: 'square' | 'rect') => {
        if (type === 'square') {
            setPendingSquareBanners(prev => {
                const item = prev[index];
                if (item) URL.revokeObjectURL(item.preview);
                return prev.filter((_, i) => i !== index);
            });
        } else {
            setPendingRectBanners(prev => {
                const item = prev[index];
                if (item) URL.revokeObjectURL(item.preview);
                return prev.filter((_, i) => i !== index);
            });
        }
    };

    const removeExistingBanner = (url: string, type: 'square' | 'rect') => {
        if (type === 'square') {
            setRemovedSquareBanners(prev => [...prev, url]);
        } else {
            setRemovedRectBanners(prev => [...prev, url]);
        }
    };

    const onSubmit = async (data: SettingsFormData) => {
        const finalData = { ...data };
        const uploadToastId = toast.loading(t('toast_preparing_data'));

        try {
            // 1. Handle Logo & Favicon
            if (pendingLogo) {
                const res = await adminSettingsApi.uploadMedia(pendingLogo.file, token);
                finalData.logo_url = res.url;
            }
            if (pendingFavicon) {
                const res = await adminSettingsApi.uploadMedia(pendingFavicon.file, token);
                finalData.favicon_url = res.url;
            }

            // 2. Handle Square Banners
            const currentSquare = (settings?.banners_square || []).filter(url => !removedSquareBanners.includes(url));
            const uploadedSquare = [];
            for (const b of pendingSquareBanners) {
                const res = await adminSettingsApi.uploadMedia(b.file, token);
                uploadedSquare.push(res.url);
            }
            finalData.banners_square = [...currentSquare, ...uploadedSquare];

            // 3. Handle Rect Banners
            const currentRect = (settings?.banners_rectangle || []).filter(url => !removedRectBanners.includes(url));
            const uploadedRect = [];
            for (const b of pendingRectBanners) {
                const res = await adminSettingsApi.uploadMedia(b.file, token);
                uploadedRect.push(res.url);
            }
            finalData.banners_rectangle = [...currentRect, ...uploadedRect];

            toast.dismiss(uploadToastId);
            updateMutation.mutate(finalData);
        } catch {
            toast.error(t('toast_upload_failed'));
            toast.dismiss(uploadToastId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeSquareBanners = (settings?.banners_square || []).filter(url => !removedSquareBanners.includes(url));
    const activeRectBanners = (settings?.banners_rectangle || []).filter(url => !removedRectBanners.includes(url));

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('website_settings_title')}</h1>
                    <p className="text-muted-foreground mt-1 text-lg">{t('website_settings_desc')}</p>
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    className="bg-primary hover:bg-primary/90"
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 size-4" />
                    )}
                    {t('save_settings_button')}
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                {/* SEO Settings */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Globe className="size-5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle>{t('seo_settings_title')}</CardTitle>
                                <CardDescription>{t('seo_settings_desc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="site_title">{t('website_title_label')}</Label>
                            <Input
                                id="site_title"
                                placeholder="TripConnect - Du Lịch & Khám Phá"
                                {...register('site_title')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meta_description">{t('meta_description_label')}</Label>
                            <Textarea
                                id="meta_description"
                                placeholder="Short description about the website..."
                                rows={3}
                                {...register('meta_description')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meta_keywords">{t('meta_keywords_label')}</Label>
                            <Input
                                id="meta_keywords"
                                placeholder="du lịch, tour, khám phá, việt nam"
                                {...register('meta_keywords')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding Assets */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <ImageIcon className="size-5 text-purple-500" />
                            </div>
                            <div>
                                <CardTitle>{t('branding_assets_title')}</CardTitle>
                                <CardDescription>{t('branding_assets_desc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Logo */}
                            <div className="space-y-3">
                                <Label>{t('logo_label')}</Label>
                                <div className="flex items-center gap-4">
                                    <div className="size-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden relative">
                                        {pendingLogo ? (
                                            <Image src={pendingLogo.preview} alt="Logo" width={96} height={96} className="object-contain" />
                                        ) : settings?.logo_url ? (
                                            <Image src={settings.logo_url} alt="Logo" width={96} height={96} className="object-contain" />
                                        ) : (
                                            <ImageIcon className="size-8 text-muted-foreground" />
                                        )}
                                        {pendingLogo && (
                                            <div className="absolute top-0 right-0 p-1 bg-amber-500 text-[8px] font-bold text-white uppercase tracking-tighter">{t('new_badge')}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => onDirectFileChange(e, 'logo_url')} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                                            <Upload className="mr-2 size-4" />
                                            {t('select_logo_button')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Favicon */}
                            <div className="space-y-3">
                                <Label>{t('favicon_label')}</Label>
                                <div className="flex items-center gap-4">
                                    <div className="size-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden relative">
                                        {pendingFavicon ? (
                                            <Image src={pendingFavicon.preview} alt="Favicon" width={32} height={32} className="object-contain" />
                                        ) : settings?.favicon_url ? (
                                            <Image src={settings.favicon_url} alt="Favicon" width={32} height={32} className="object-contain" />
                                        ) : (
                                            <ImageIcon className="size-8 text-muted-foreground" />
                                        )}
                                        {pendingFavicon && (
                                            <div className="absolute top-0 right-0 p-1 bg-amber-500 text-[8px] font-bold text-white uppercase tracking-tighter">{t('new_badge')}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input ref={faviconRef} type="file" accept="image/*,.ico" className="hidden" onChange={(e) => onDirectFileChange(e, 'favicon_url')} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => faviconRef.current?.click()}>
                                            <Upload className="mr-2 size-4" />
                                            {t('select_favicon_button')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Square Banners */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <ImageIcon className="size-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle>{t('square_banners_title')}</CardTitle>
                                <CardDescription>{t('square_banners_desc')}</CardDescription>
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => squareBannerRef.current?.click()}>
                            <Plus className="mr-2 size-4" />
                            {t('add_image_button')}
                        </Button>
                        <input ref={squareBannerRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => onBannerFileChange(e, 'square')} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {activeSquareBanners.map(url => (
                                <div key={url} className="group relative aspect-square rounded-lg border border-white/10 overflow-hidden bg-white/5">
                                    <Image src={url} alt="Banner" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingBanner(url, 'square')}
                                        className="absolute top-2 right-2 size-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                            {pendingSquareBanners.map((b, i) => (
                                <div key={b.preview} className="group relative aspect-square rounded-lg border border-amber-500/50 overflow-hidden bg-white/5">
                                    <Image src={b.preview} alt="New Banner" fill className="object-cover" />
                                    <div className="absolute top-0 right-0 p-1 bg-amber-500 text-[8px] font-bold text-white uppercase tracking-tighter">{t('new_badge')}</div>
                                    <button
                                        type="button"
                                        onClick={() => removePendingBanner(i, 'square')}
                                        className="absolute top-2 right-2 size-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                            {(activeSquareBanners.length === 0 && pendingSquareBanners.length === 0) && (
                                <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-muted-foreground italic text-sm">
                                    {t('no_banners_msg')}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Rectangular Banners */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <ImageIcon className="size-5 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle>{t('rect_banners_title')}</CardTitle>
                                <CardDescription>{t('rect_banners_desc')}</CardDescription>
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => rectBannerRef.current?.click()}>
                            <Plus className="mr-2 size-4" />
                            {t('add_image_button')}
                        </Button>
                        <input ref={rectBannerRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => onBannerFileChange(e, 'rect')} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activeRectBanners.map(url => (
                                <div key={url} className="group relative aspect-video rounded-lg border border-white/10 overflow-hidden bg-white/5">
                                    <Image src={url} alt="Banner" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingBanner(url, 'rect')}
                                        className="absolute top-2 right-2 size-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                            {pendingRectBanners.map((b, i) => (
                                <div key={b.preview} className="group relative aspect-video rounded-lg border border-amber-500/50 overflow-hidden bg-white/5">
                                    <Image src={b.preview} alt="New Banner" fill className="object-cover" />
                                    <div className="absolute top-0 right-0 p-1 bg-amber-500 text-[8px] font-bold text-white uppercase tracking-tighter">{t('new_badge')}</div>
                                    <button
                                        type="button"
                                        onClick={() => removePendingBanner(i, 'rect')}
                                        className="absolute top-2 right-2 size-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                            {(activeRectBanners.length === 0 && pendingRectBanners.length === 0) && (
                                <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-muted-foreground italic text-sm">
                                    {t('no_banners_msg')}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Information */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Building2 className="size-5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle>{t('footer_info_title')}</CardTitle>
                                <CardDescription>{t('footer_info_desc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="company_name">{t('company_name_label')}</Label>
                                <Input
                                    id="company_name"
                                    placeholder="TripConnect Company"
                                    {...register('company_name')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('email_label')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contact@tripconnect.com"
                                    {...register('email')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">{t('phone_label')}</Label>
                                <Input
                                    id="phone"
                                    placeholder="+84 123 456 789"
                                    {...register('phone')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="copyright_text">Copyright</Label>
                                <Input
                                    id="copyright_text"
                                    placeholder="© 2024 TripConnect. All rights reserved."
                                    {...register('copyright_text')}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">{t('address_label')}</Label>
                            <Input
                                id="address"
                                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                                {...register('address')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="footer_description">{t('footer_description_label')}</Label>
                            <Textarea
                                id="footer_description"
                                placeholder="Short introduction about the company..."
                                rows={3}
                                {...register('footer_description')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Share2 className="size-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle>{t('social_media_links_title')}</CardTitle>
                                <CardDescription>{t('social_media_links_desc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="facebook_url">Facebook</Label>
                                <Input
                                    id="facebook_url"
                                    placeholder="https://facebook.com/tripconnect"
                                    {...register('facebook_url')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="instagram_url">Instagram</Label>
                                <Input
                                    id="instagram_url"
                                    placeholder="https://instagram.com/tripconnect"
                                    {...register('instagram_url')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="twitter_url">Twitter / X</Label>
                                <Input
                                    id="twitter_url"
                                    placeholder="https://twitter.com/tripconnect"
                                    {...register('twitter_url')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="youtube_url">YouTube</Label>
                                <Input
                                    id="youtube_url"
                                    placeholder="https://youtube.com/@tripconnect"
                                    {...register('youtube_url')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
