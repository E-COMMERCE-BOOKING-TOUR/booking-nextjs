"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStaticPagesApi } from '@/apis/admin/static-pages';
import { useSession } from 'next-auth/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    MoreHorizontal,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StaticPagesListPage() {
    const t = useTranslations("admin");
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data: pages, isLoading, isError } = useQuery({
        queryKey: ['admin-static-pages', token],
        queryFn: () => adminStaticPagesApi.getAll(token),
        enabled: !!token,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminStaticPagesApi.remove(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-static-pages'] });
            toast.success(t('toast_delete_static_page_success'));
            setDeleteId(null);
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : t('toast_delete_static_page_error'));
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span className="sr-only">{t('loading_status')}</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
                <AlertCircle className="size-12 mb-4" />
                <p className="text-lg font-semibold">{t('loading_data_error')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('static_pages_management_title')}</h1>
                    <p className="text-muted-foreground mt-1 text-lg">{t('static_pages_management_desc')}</p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/admin/static-pages/create">
                        <Plus className="mr-2 size-4" />
                        {t('create_new_page_button')}
                    </Link>
                </Button>
            </div>

            <div className="rounded-xl border border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[80px]">{t('col_id')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[400px]">{t('col_title_slug')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_status')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_last_updated')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">{t('col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pages?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                        {t('no_static_pages_msg')}
                                    </td>
                                </tr>
                            ) : (
                                pages?.map((page) => (
                                    <tr key={page.id} className="group hover:bg-white/[0.05] transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-primary">#{page.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-foreground">{page.title}</span>
                                                <span className="text-xs text-muted-foreground font-mono">/{page.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {page.is_active ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                                                    {t('status_active')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                                                    {t('status_draft')}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">
                                                {new Date(page.updated_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="size-8 p-0 hover:bg-white/10">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-white/10">
                                                    <DropdownMenuLabel>{t('col_actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/admin/static-pages/${page.id}`}>
                                                            <Pencil className="mr-2 size-4" />
                                                            {t('action_edit')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/page/${page.slug}`} target="_blank">
                                                            <ExternalLink className="mr-2 size-4" />
                                                            {t('action_view_page')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-rose-500 focus:text-rose-500 cursor-pointer"
                                                        onClick={() => setDeleteId(page.id)}
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        {t('action_delete_page')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-background/95 backdrop-blur-md border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirm_delete_static_page_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirm_delete_static_page_desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {t('delete_immediately_button')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
