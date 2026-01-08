"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminNotificationApi from '@/apis/adminNotification';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MoreHorizontal,
    Eye,
    Trash2,
    Plus,
    Users,
    ShieldCheck,
    User,
    Info,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { HasPermission } from '@/components/auth/HasPermission';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import Link from 'next/link';
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
import { TargetGroup, NotificationType, INotification } from '@/types/notification';
import { useTranslations, useFormatter } from 'next-intl';
import { useForm } from 'react-hook-form';

const TargetBadge = ({ group }: { group: TargetGroup }) => {
    const t = useTranslations("admin");
    switch (group) {
        case TargetGroup.all:
            return (
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Users className="mr-1 size-3" /> {t('target_all')}
                </Badge>
            );
        case TargetGroup.admin:
            return (
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    <ShieldCheck className="mr-1 size-3" /> {t('target_admin')}
                </Badge>
            );
        case TargetGroup.supplier:
            return (
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    <User className="mr-1 size-3" /> {t('target_supplier')}
                </Badge>
            );
        case TargetGroup.specific:
            return (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <User className="mr-1 size-3" /> {t('target_specific')}
                </Badge>
            );
        default:
            return <Badge variant="outline">{group}</Badge>;
    }
};

const TypeBadge = ({ type }: { type: NotificationType }) => {
    const t = useTranslations("admin");
    const getLabel = (type: string) => {
        switch (type) {
            case 'general': return t('type_general');
            case 'promotion': return t('type_promotion');
            case 'system': return t('type_system');
            default: return type;
        }
    };
    return (
        <Badge variant="outline" className="capitalize">
            <Info className="mr-1 size-3" /> {getLabel(type)}
        </Badge>
    );
};

export default function AdminNotificationListPage() {
    const t = useTranslations("admin");
    const format = useFormatter();
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Filter form for staged inputs
    interface NotificationFilterForm {
        keyword: string;
        typeFilter: string;
        groupFilter: string;
    }

    const filterForm = useForm<NotificationFilterForm>({
        defaultValues: {
            keyword: '',
            typeFilter: 'all',
            groupFilter: 'all'
        }
    });

    // Applied filter values (what is used in API query)
    const [appliedFilters, setAppliedFilters] = useState<NotificationFilterForm>({
        keyword: '',
        typeFilter: 'all',
        groupFilter: 'all'
    });
    const [page, setPage] = useState(1);
    const limit = 10;

    const isFiltered = appliedFilters.keyword !== '' || appliedFilters.typeFilter !== 'all' || appliedFilters.groupFilter !== 'all';

    const handleSearch = filterForm.handleSubmit((data) => {
        setAppliedFilters(data);
        setPage(1);
    });

    const handleClear = () => {
        const defaultValues = { keyword: '', typeFilter: 'all', groupFilter: 'all' };
        filterForm.reset(defaultValues);
        setAppliedFilters(defaultValues);
        setPage(1);
    };

    const { data, isLoading: isQueryLoading } = useQuery({
        queryKey: ['admin-notifications', token, page, appliedFilters.keyword, appliedFilters.typeFilter, appliedFilters.groupFilter],
        queryFn: () => adminNotificationApi.getAll(
            token!,
            page,
            limit,
            appliedFilters.keyword,
            appliedFilters.typeFilter === 'all' ? undefined : appliedFilters.typeFilter,
            appliedFilters.groupFilter === 'all' ? undefined : appliedFilters.groupFilter
        ),
        enabled: !!token,
    });

    const notifications = data?.data?.data || [];
    const totalPages = data?.data?.totalPages || 0;
    const total = data?.data?.total || 0;
    const isLoading = sessionStatus === 'loading' || isQueryLoading;

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminNotificationApi.delete(token!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            toast.success(t('toast_notification_delete_success'));
            setDeleteId(null);
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : t('toast_notification_delete_error'));
        }
    });

    const typeOptions = [
        { label: t('all_types_option'), value: 'all' },
        { label: t('type_general'), value: 'general' },
        { label: t('type_promotion'), value: 'promotion' },
        { label: t('type_system'), value: 'system' }
    ];

    const groupOptions = [
        { label: t('all_audiences_option'), value: 'all' },
        { label: t('target_all'), value: TargetGroup.all },
        { label: t('target_admin'), value: TargetGroup.admin },
        { label: t('target_supplier'), value: TargetGroup.supplier },
        { label: t('target_specific'), value: TargetGroup.specific }
    ];

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminPageHeader
                title={t('notification_management_title')}
                description={t('notification_management_desc')}
            >
                <HasPermission permission="notification:create">
                    <Link href="/admin/notification/create">
                        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                            <Plus className="mr-2 size-4" /> {t('create_notification_button')}
                        </Button>
                    </Link>
                </HasPermission>
            </AdminPageHeader>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder={t('search_notification_placeholder')}
                    searchTerm={filterForm.watch('keyword')}
                    onSearchChange={(val) => filterForm.setValue('keyword', val)}
                    onSearch={handleSearch}
                    onClear={handleClear}
                    isFiltered={isFiltered}
                >
                    <AdminSelect
                        value={filterForm.watch('typeFilter')}
                        onValueChange={(val) => filterForm.setValue('typeFilter', val)}
                        placeholder={t('notification_type_placeholder')}
                        options={typeOptions}
                    />
                    <AdminSelect
                        value={filterForm.watch('groupFilter')}
                        onValueChange={(val) => filterForm.setValue('groupFilter', val)}
                        placeholder={t('audience_placeholder')}
                        options={groupOptions}
                        width="w-[180px]"
                    />
                </AdminFilterBar>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_id')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_notification')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_type')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_audience')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_created_at')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">{t('col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : notifications.map((notification: INotification) => (
                                    <tr key={notification.id} className="group hover:bg-white/[0.05] transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-primary">#{notification.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-[300px]">
                                                <span className="text-sm font-bold text-foreground truncate">{notification.title}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{notification.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <TypeBadge type={notification.type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <TargetBadge group={notification.target_group} />
                                            {notification.target_group === TargetGroup.specific && (
                                                <span className="ml-2 text-[10px] text-muted-foreground">
                                                    ({t('users_count_label', { count: notification.user_ids?.length || 0 })})
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {format.dateTime(new Date(notification.created_at), { dateStyle: 'medium' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="size-8 p-0">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>{t('col_actions')}</DropdownMenuLabel>
                                                    <HasPermission permission="notification:update">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/notification/edit/${notification.id}`} className="cursor-pointer">
                                                                <Eye className="mr-2 size-4" />
                                                                {t('action_edit')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </HasPermission>
                                                    <DropdownMenuSeparator />
                                                    <HasPermission permission="notification:delete">
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(notification.id)}
                                                            className="text-rose-500 cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 size-4" />
                                                            {t('action_delete')}
                                                        </DropdownMenuItem>
                                                    </HasPermission>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && notifications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                            {t('no_notifications_found')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                        {t('showing_notifications_count', { count: notifications.length, total })}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-white/10"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <Button
                                    key={i + 1}
                                    variant={page === i + 1 ? "default" : "outline"}
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${page === i + 1 ? 'bg-primary' : 'border-white/10'}`}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-white/10"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirm_delete_desc')}
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
