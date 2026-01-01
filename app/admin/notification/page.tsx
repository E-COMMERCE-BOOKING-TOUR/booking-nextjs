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

const TargetBadge = ({ group }: { group: TargetGroup }) => {
    switch (group) {
        case TargetGroup.all:
            return (
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Users className="mr-1 size-3" /> All
                </Badge>
            );
        case TargetGroup.admin:
            return (
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    <ShieldCheck className="mr-1 size-3" /> Admin
                </Badge>
            );
        case TargetGroup.supplier:
            return (
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    <User className="mr-1 size-3" /> Supplier
                </Badge>
            );
        case TargetGroup.specific:
            return (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <User className="mr-1 size-3" /> Specific
                </Badge>
            );
        default:
            return <Badge variant="outline">{group}</Badge>;
    }
};

const TypeBadge = ({ type }: { type: NotificationType }) => {
    return (
        <Badge variant="outline" className="capitalize">
            <Info className="mr-1 size-3" /> {type}
        </Badge>
    );
};

export default function AdminNotificationListPage() {
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [groupFilter, setGroupFilter] = useState('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const isFiltered = searchTerm !== '' || typeFilter !== 'all' || groupFilter !== 'all';

    const handleSearch = () => {
        setSearchTerm(keyword);
        setPage(1);
    };

    const handleClear = () => {
        setKeyword('');
        setSearchTerm('');
        setTypeFilter('all');
        setGroupFilter('all');
        setPage(1);
    };

    const { data, isLoading: isQueryLoading } = useQuery({
        queryKey: ['admin-notifications', token, page, searchTerm, typeFilter, groupFilter],
        queryFn: () => adminNotificationApi.getAll(
            token!,
            page,
            limit,
            searchTerm,
            typeFilter === 'all' ? undefined : typeFilter,
            groupFilter === 'all' ? undefined : groupFilter
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
            toast.success('Notification deleted successfully');
            setDeleteId(null);
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : 'Failed to delete notification');
        }
    });

    const typeOptions = [
        { label: 'All Types', value: 'all' },
        { label: 'General', value: 'general' },
        { label: 'Promotion', value: 'promotion' },
        { label: 'System', value: 'system' }
    ];

    const groupOptions = [
        { label: 'All Audiences', value: 'all' },
        { label: 'All Users', value: TargetGroup.all },
        { label: 'Admin', value: TargetGroup.admin },
        { label: 'Supplier', value: TargetGroup.supplier },
        { label: 'Specific', value: TargetGroup.specific }
    ];

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminPageHeader
                title="Notification Management"
                description="Send and manage system notifications to users."
            >
                <Link href="/admin/notification/create">
                    <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 size-4" /> Create Notification
                    </Button>
                </Link>
            </AdminPageHeader>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder="Search title or content..."
                    searchTerm={keyword}
                    onSearchChange={setKeyword}
                    onSearch={handleSearch}
                    onClear={handleClear}
                    isFiltered={isFiltered}
                >
                    <AdminSelect
                        value={typeFilter}
                        onValueChange={setTypeFilter}
                        placeholder="Notification Type"
                        options={typeOptions}
                    />
                    <AdminSelect
                        value={groupFilter}
                        onValueChange={setGroupFilter}
                        placeholder="Audience"
                        options={groupOptions}
                        width="w-[180px]"
                    />
                </AdminFilterBar>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Notification</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Audience</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Created At</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
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
                                                    ({notification.user_ids?.length || 0} users)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {new Date(notification.created_at).toLocaleDateString('vi-VN')}
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
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/notification/edit/${notification.id}`} className="cursor-pointer">
                                                            <Eye className="mr-2 size-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(notification.id)}
                                                        className="text-rose-500 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && notifications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No notifications found.
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
                        Showing <span className="font-bold text-foreground">{notifications.length}</span> of <span className="font-bold text-foreground">{total}</span> notifications
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
                        <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The notification will be deleted from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-rose-500 hover:bg-rose-600"
                        >
                            Delete Immediately
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
