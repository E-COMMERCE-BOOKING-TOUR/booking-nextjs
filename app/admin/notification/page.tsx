"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminNotificationApi from '@/apis/adminNotification';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    MoreHorizontal,
    Eye,
    Trash2,
    Plus,
    Bell,
    Users,
    ShieldCheck,
    User,
    Info,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { useForm, Controller } from 'react-hook-form';
import { TargetGroup, NotificationType } from '@/types/notification';

const TargetBadge = ({ group }: { group: TargetGroup }) => {
    switch (group) {
        case TargetGroup.all:
            return (
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Users className="mr-1 size-3" /> Tất cả
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

interface FilterValues {
    search: string;
    type: string;
    targetGroup: string;
}

export default function AdminNotificationListPage() {
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const limit = 10;

    const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
        search: '',
        type: 'all_types',
        targetGroup: 'all_groups',
    });

    const { control, handleSubmit, reset } = useForm<FilterValues>({
        defaultValues: appliedFilters
    });

    const onSearch = (values: FilterValues) => {
        setAppliedFilters(values);
        setPage(1);
    };

    const clearFilters = () => {
        const defaultValues = {
            search: '',
            type: 'all_types',
            targetGroup: 'all_groups',
        };
        reset(defaultValues);
        setAppliedFilters(defaultValues);
        setPage(1);
    };

    const isFiltered = appliedFilters.search !== '' || appliedFilters.type !== 'all_types' || appliedFilters.targetGroup !== 'all_groups';

    const { data, isLoading: isQueryLoading } = useQuery({
        queryKey: ['admin-notifications', token, page, appliedFilters.search, appliedFilters.type, appliedFilters.targetGroup],
        queryFn: () => adminNotificationApi.getAll(
            token!,
            page,
            limit,
            appliedFilters.search,
            appliedFilters.type === 'all_types' ? undefined : appliedFilters.type,
            appliedFilters.targetGroup === 'all_groups' ? undefined : appliedFilters.targetGroup
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
            toast.success('Xóa thông báo thành công');
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể xóa thông báo');
        }
    });

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Quản Lý Thông Báo</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Gửi và quản lý thông báo hệ thống đến người dùng.</p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/admin/notification/create">
                        <Plus className="mr-2 size-4" />
                        Tạo thông báo
                    </Link>
                </Button>
            </div>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <CardHeader className="border-b border-white/5 pb-6">
                    <form onSubmit={handleSubmit(onSearch)} className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Controller
                                name="search"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Tìm kiếm tiêu đề hoặc nội dung..."
                                        className="pl-10 bg-white/5 border-white/10"
                                    />
                                )}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                                            <SelectValue placeholder="Loại thông báo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_types">Tất cả loại</SelectItem>
                                            {Object.values(NotificationType).map((type) => (
                                                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            <Controller
                                name="targetGroup"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                                            <SelectValue placeholder="Đối tượng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_groups">Tất cả đối tượng</SelectItem>
                                            <SelectItem value={TargetGroup.all}>Tất cả người dùng</SelectItem>
                                            <SelectItem value={TargetGroup.admin}>Admin</SelectItem>
                                            <SelectItem value={TargetGroup.supplier}>Supplier</SelectItem>
                                            <SelectItem value={TargetGroup.specific}>Specific</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            <div className="flex items-center gap-2">
                                <Button type="submit" className="bg-primary hover:bg-primary/90">
                                    <Search className="mr-2 size-4" />
                                    Tìm kiếm
                                </Button>

                                {isFiltered && (
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                    >
                                        Xóa lọc
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Thông Báo</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Loại</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Đối Tượng</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ngày Tạo</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : notifications.map((notification) => (
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
                                                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/notification/edit/${notification.id}`} className="cursor-pointer">
                                                            <Eye className="mr-2 size-4" />
                                                            Chỉnh sửa
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(notification.id)}
                                                        className="text-rose-500 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && notifications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                            Không có thông báo nào được tìm thấy.
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
                        Hiển thị <span className="font-bold text-foreground">{notifications.length}</span> trên <span className="font-bold text-foreground">{total}</span> thông báo
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
                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Thông báo sẽ bị xóa khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-rose-500 hover:bg-rose-600"
                        >
                            Xóa ngay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
