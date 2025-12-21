"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTourApi } from '@/apis/admin/tour';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Tag,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
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

export default function AdminTourListPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: tourResponse, isLoading } = useQuery({
    queryKey: ['admin-tours', keyword, statusFilter, currentPage, sortBy, sortOrder],
    queryFn: () => adminTourApi.getAll({
      keyword: keyword,
      status: statusFilter,
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder
    }, token),
    enabled: !!token,
  });

  const handleSearch = () => {
    setKeyword(searchTerm);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isInitialLoading = isLoading || sessionStatus === 'loading';
  const tours = tourResponse?.data || [];
  const pagination = {
    total: tourResponse?.total || 0,
    page: tourResponse?.page || 1,
    limit: tourResponse?.limit || 10,
    totalPages: tourResponse?.totalPages || 1
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminTourApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Đã xóa tour thành công');
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error('Lỗi khi xóa tour: ' + err.message);
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) =>
      adminTourApi.updateStatus(id, status, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Cập nhật trạng thái thành công');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">Hoạt động</Badge>;
      case 'inactive': return <Badge variant="secondary" className="bg-slate-500/15 text-slate-600 border-slate-500/20">Tạm ngưng</Badge>;
      case 'draft': return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/20">Bản nháp</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tour</h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý danh sách các tour du lịch hiện có.
          </p>
        </div>
        <Link href="/admin/tour/create">
          <Button className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
            <Plus className="size-4" /> Thêm tour mới
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên hoặc địa chỉ..."
                  className="pl-9 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} className="w-full sm:w-auto">Tìm kiếm</Button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                className="bg-background border border-muted-foreground/20 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-primary h-9 outline-none"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
                <option value="draft">Bản nháp</option>
              </select>
              <select
                className="bg-background border border-muted-foreground/20 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-primary h-9 outline-none min-w-[140px]"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'ASC' | 'DESC');
                  setCurrentPage(1);
                }}
              >
                <option value="created_at-DESC">Mới nhất</option>
                <option value="created_at-ASC">Cũ nhất</option>
                <option value="title-ASC">Tên A-Z</option>
                <option value="title-DESC">Tên Z-A</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-4">Tour / Thông tin</th>
                  <th className="px-6 py-4 hidden md:table-cell">Địa điểm</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-foreground/10">
                {isInitialLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 bg-muted rounded w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-10 ml-auto" /></td>
                    </tr>
                  ))
                ) : tours.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Không tìm thấy tour nào phù hợp.
                    </td>
                  </tr>
                ) : tours.map((tour: any) => (
                  <tr key={tour.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md bg-muted overflow-hidden flex-shrink-0 border">
                          {tour.images?.[0] ? (
                            <img src={tour.images[0].image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="size-5 m-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-[200px] uppercase tracking-tight">
                            {tour.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                              ID: {tour.id}
                            </span>
                            {tour.tour_categories?.[0]?.name && (
                              <span className="truncate">• {tour.tour_categories[0].name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPin className="size-3.5 mt-0.5 flex-shrink-0" />
                        <span className="truncate max-w-[180px] text-xs leading-tight">
                          {tour.address || tour.division?.name_local || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
                        <Clock className="size-3.5" />
                        <span className="text-xs">
                          {tour.duration_days}N{tour.duration_hours}H
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tour.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/tour/edit/${tour.id}`}>
                          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/5">
                            <Edit className="size-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 shadow-lg">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(`/tour/${tour.slug}`, '_blank')}>
                              <Eye className="size-4 mr-2" /> Xem trên Web
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase pb-1">Trạng thái</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => statusMutation.mutate({ id: tour.id, status: 'active' })}
                              disabled={tour.status === 'active'}
                              className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                            >
                              Kích hoạt hoạt động
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => statusMutation.mutate({ id: tour.id, status: 'inactive' })}
                              disabled={tour.status === 'inactive'}
                              className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                            >
                              Tạm ngưng tour
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/5"
                              onClick={() => setDeleteId(tour.id)}
                            >
                              <Trash2 className="size-4 mr-2" /> Xóa tour
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
              <div className="text-xs text-muted-foreground">
                Hiển thị <strong>{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> trong tổng số <strong>{pagination.total}</strong> tour
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-8 border-muted-foreground/20"
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === pagination.totalPages || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                      return (
                        <Button
                          key={p}
                          variant={pagination.page === p ? "default" : "ghost"}
                          size="icon"
                          className="size-8 text-xs"
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    } else if (p === pagination.page - 2 || p === pagination.page + 2) {
                      return <span key={p} className="text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-8 border-muted-foreground/20"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tour?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tour sẽ bị gỡ bỏ khỏi hệ thống và không thể đặt bởi khách hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}