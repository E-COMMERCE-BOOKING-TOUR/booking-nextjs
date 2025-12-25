"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStaticPagesApi, StaticPage } from '@/apis/admin/static-pages';
import { useSession } from 'next-auth/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    FileText,
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
            toast.success('Xóa trang tĩnh thành công');
            setDeleteId(null);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể xóa trang tĩnh');
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
                <p className="text-lg font-semibold">Đã xảy ra lỗi khi tải dữ liệu</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Quản Lý Trang Tĩnh</h1>
                    <p className="text-muted-foreground mt-1">Quản lý nội dung các trang Thông tin, Điều khoản, Chính sách...</p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/admin/static-pages/create">
                        <Plus className="mr-2 size-4" />
                        Tạo Trang Mới
                    </Link>
                </Button>
            </div>

            <div className="rounded-xl border border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Tiêu đề / Slug</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày cập nhật</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                    Chưa có trang tĩnh nào được tạo
                                </TableCell>
                            </TableRow>
                        ) : (
                            pages?.map((page) => (
                                <TableRow key={page.id} className="hover:bg-muted/30 transition-colors border-white/5">
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-foreground">{page.title}</span>
                                            <span className="text-xs text-muted-foreground font-mono">/{page.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {page.is_active ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                                                Đang hoạt động
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                                                Nháp
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(page.updated_at).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-white/10">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href={`/admin/static-pages/${page.id}`}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href={`/page/${page.slug}`} target="_blank">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Xem trang chủ
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                    onClick={() => setDeleteId(page.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Xóa trang
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-background/95 backdrop-blur-md border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa trang tĩnh?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Trang này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
