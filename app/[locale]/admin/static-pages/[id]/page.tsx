"use client";

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStaticPagesApi, CreateStaticPageDTO } from '@/apis/admin/static-pages';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Save,
    ArrowLeft,
    Loader2,
    AlertCircle,
    FileText,
    Globe,
    Settings as SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm, Controller, useWatch } from 'react-hook-form';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type StaticPageFormData = CreateStaticPageDTO;

export default function StaticPageEditPage() {
    const t = useTranslations("admin");
    const params = useParams();
    const id = params?.id as string;
    const isEdit = !!id && id !== 'create';
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const router = useRouter();
    const queryClient = useQueryClient();

    const { register, handleSubmit, setValue, reset, control } = useForm<StaticPageFormData>({
        defaultValues: {
            is_active: true,
            title: '',
            slug: '',
            content: '',
            meta_title: '',
            meta_description: '',
        }
    });

    const isActive = useWatch({ control, name: 'is_active' });
    const title = useWatch({ control, name: 'title' });

    // Auto-generate slug from title for new pages
    useEffect(() => {
        if (!isEdit && title) {
            const slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', slug, { shouldDirty: true });
        }
    }, [title, isEdit, setValue]);

    const { data: page, isLoading, isError } = useQuery({
        queryKey: ['admin-static-page', id, token],
        queryFn: () => adminStaticPagesApi.getOne(Number(id), token),
        enabled: !!token && isEdit && !isNaN(Number(id)),
    });

    useEffect(() => {
        if (page) {
            reset({
                title: page.title,
                slug: page.slug,
                content: page.content || '',
                meta_title: page.meta_title || '',
                meta_description: page.meta_description || '',
                is_active: page.is_active,
            });
        }
    }, [page, reset]);

    const mutation = useMutation({
        mutationFn: (data: StaticPageFormData) => {
            if (isEdit) {
                return adminStaticPagesApi.update(Number(id), data, token);
            }
            return adminStaticPagesApi.create(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-static-pages'] });
            toast.success(isEdit ? t('toast_update_page_success') : t('toast_create_page_success'));
            router.push('/admin/static-pages');
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : t('toast_error_generic'));
        }
    });

    const onSubmit = (data: StaticPageFormData) => {
        mutation.mutate(data);
    };

    if (isLoading && isEdit) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span className="sr-only">{t('loading_status')}</span>
            </div>
        );
    }

    if (isError && isEdit) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
                <AlertCircle className="size-12 mb-4" />
                <p className="text-lg font-semibold">{t('page_not_found_error')}</p>
                <Button variant="link" asChild>
                    <Link href="/admin/static-pages">{t('back_to_list')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                        <Link href="/admin/static-pages">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {isEdit ? t('edit_page_title') : t('create_new_page_button')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEdit ? t('editing_label', { title: page?.title || "" }) : t('add_new_static_page_desc')}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 size-4" />
                    )}
                    {isEdit ? t('save_changes_button') : t('create_button')}
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-white/5 bg-card/20 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <FileText className="size-5 text-blue-500" />
                                    </div>
                                    <CardTitle>{t('page_content_title')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">{t('page_title_label')}</Label>
                                    <Input
                                        id="title"
                                        placeholder={t('page_title_placeholder')}
                                        {...register('title', { required: true })}
                                        className="bg-white/5 border-white/10 text-lg font-semibold"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">{t('content_label')}</Label>
                                    <Textarea
                                        id="content"
                                        placeholder={t('content_placeholder')}
                                        className="min-h-[400px] bg-white/5 border-white/10 font-mono text-sm leading-relaxed"
                                        {...register('content')}
                                    />
                                    <p className="text-[11px] text-muted-foreground italic">
                                        {t('html_support_hint')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        <Card className="border-white/5 bg-card/20 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <SettingsIcon className="size-5 text-amber-500" />
                                    </div>
                                    <CardTitle>{t('configuration_title')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">{t('url_slug_label')}</Label>
                                    <Input
                                        id="slug"
                                        placeholder={t('slug_placeholder')}
                                        {...register('slug', { required: true })}
                                        className="bg-white/5 border-white/10 font-mono text-sm"
                                    />
                                    <p className="text-[10px] text-muted-foreground">{t('slug_hint')}</p>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active" className="text-sm font-semibold">{t('col_status')}</Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            {isActive ? t('public_on_web_desc') : t('hidden_admin_only_desc')}
                                        </p>
                                    </div>
                                    <Controller
                                        name="is_active"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                id="is_active"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/5 bg-card/20 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Globe className="size-5 text-purple-500" />
                                    </div>
                                    <CardTitle>{t('seo_metadata_title')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_title">{t('seo_title_label')}</Label>
                                    <Input
                                        id="meta_title"
                                        placeholder={t('seo_title_placeholder')}
                                        {...register('meta_title')}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="meta_description">{t('seo_description_label')}</Label>
                                    <Textarea
                                        id="meta_description"
                                        placeholder={t('seo_description_placeholder')}
                                        rows={4}
                                        {...register('meta_description')}
                                        className="bg-white/5 border-white/10 resize-none text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
