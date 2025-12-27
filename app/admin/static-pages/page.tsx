"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStaticPagesApi, StaticPage } from '@/apis/admin/static-pages';
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
            toast.success('Static page deleted successfully');
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete static page');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
                <AlertCircle className="size-12 mb-4" />
                <p className="text-lg font-semibold">An error occurred while loading data</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Static Pages Management</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Manage content for Information, Terms, Policies pages...</p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/admin/static-pages/create">
                        <Plus className="mr-2 size-4" />
                        Create New Page
                    </Link>
                </Button>
            </div>

            <div className="rounded-xl border border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[80px]">ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[400px]">Title / Slug</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Last Updated</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pages?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                        No static pages created yet
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
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                                                    Draft
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
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/admin/static-pages/${page.id}`}>
                                                            <Pencil className="mr-2 size-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/page/${page.slug}`} target="_blank">
                                                            <ExternalLink className="mr-2 size-4" />
                                                            View Page
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-rose-500 focus:text-rose-500 cursor-pointer"
                                                        onClick={() => setDeleteId(page.id)}
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Delete Page
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
                        <AlertDialogTitle>Confirm Static Page Deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This page will be permanently deleted from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Delete Immediately
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
