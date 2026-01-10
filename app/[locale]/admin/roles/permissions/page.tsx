"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPermissionApi } from '@/apis/admin/permission';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    Loader2,
    LockKeyhole,
    ArrowLeft,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
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
import { useForm } from 'react-hook-form';
import { IAdminPermission, ICreatePermissionPayload } from '@/types/admin/permission';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AdminPermissionPage() {
    const t = useTranslations("admin");
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<IAdminPermission | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ICreatePermissionPayload>();

    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['admin-permissions', token],
        queryFn: () => adminPermissionApi.getAll(token),
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: (data: ICreatePermissionPayload) => adminPermissionApi.create(data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
            toast.success(t('toast_create_permission_success'));
            handleCloseDialog();
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_create_permission_error'));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<ICreatePermissionPayload> }) =>
            adminPermissionApi.update(id, data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
            toast.success(t('toast_update_permission_success'));
            handleCloseDialog();
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_update_permission_error'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminPermissionApi.remove(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
            toast.success(t('toast_delete_permission_success'));
            setDeleteId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_delete_permission_error'));
        }
    });

    const handleOpenCreate = () => {
        setEditingPermission(null);
        reset({ permission_name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (perm: IAdminPermission) => {
        setEditingPermission(perm);
        reset({
            permission_name: perm.permission_name,
            description: perm.description
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingPermission(null);
        reset();
    };

    const onSubmit = (data: ICreatePermissionPayload) => {
        if (editingPermission) {
            updateMutation.mutate({ id: editingPermission.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredPermissions = (permissions || []).filter((p: IAdminPermission) =>
        !searchTerm ||
        p.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/roles">
                        <Button variant="ghost" className="size-10 rounded-full p-0">
                            <ArrowLeft className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('permission_list_title')}</h1>
                        <p className="text-muted-foreground mt-1 text-lg">{t('permission_list_desc')}</p>
                    </div>
                </div>
                <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 size-4" />
                    {t('add_permission_button')}
                </Button>
            </div>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Input
                            placeholder={t('search_permissions_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10"
                        />
                        <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50px]">{t('col_id')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_permission_name')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_description')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">{t('col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : filteredPermissions.map((p: IAdminPermission) => (
                                    <tr key={p.id} className="group hover:bg-white/[0.05] transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono">#{p.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold font-mono text-primary bg-primary/10 px-2 py-1 rounded text-xs">{p.permission_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground/80">
                                            {p.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="size-8 p-0">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleOpenEdit(p)} className="cursor-pointer">
                                                        <Pencil className="mr-2 size-4" /> {t('action_edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(p.id)}
                                                        className="text-rose-500 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 size-4" /> {t('action_delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPermission ? t('update_permission_title') : t('create_new_permission_title')}</DialogTitle>
                        <DialogDescription>
                            {t('permission_dialog_desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('permission_name_code_label')}</Label>
                            <Input {...register('permission_name', { required: true })} placeholder="e.g. product.view" />
                            {errors.permission_name && <span className="text-xs text-rose-500">{t('required_field')}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>{t('description_label')}</Label>
                            <Input {...register('description', { required: true })} placeholder={t('permission_description_placeholder')} />
                            {errors.description && <span className="text-xs text-rose-500">{t('required_field')}</span>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>{t('cancel_button')}</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {editingPermission ? t('save_changes_button') : t('create_button')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirm_delete_permission_desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-rose-500 hover:bg-rose-600"
                        >
                            {t('delete_immediately_button')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}