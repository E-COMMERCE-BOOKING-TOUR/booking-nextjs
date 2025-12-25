"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBookingApi } from '@/apis/admin/booking';
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
  Calendar,
  CheckCircle2,
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

import { useForm, useWatch } from 'react-hook-form';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đã xác nhận</Badge>;
    case 'pending_confirm':
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Chờ xác nhận</Badge>;
    case 'pending_payment':
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Chờ thanh toán</Badge>;
    case 'cancelled':
      return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Đã hủy</Badge>;
    case 'expired':
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">Hết hạn</Badge>;
    default:
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">{status}</Badge>;
  }
};

const PaymentBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đã thanh toán</Badge>;
    case 'unpaid':
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Chưa thanh toán</Badge>;
    case 'refunded':
      return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Đã hoàn tiền</Badge>;
    default:
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">{status}</Badge>;
  }
};

interface FilterValues {
  searchTerm: string;
  statusFilter: string;
  paymentFilter: string;
  dateFilter: string;
}

export default function AdminBookingListPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    searchTerm: '',
    statusFilter: 'all',
    paymentFilter: 'all',
    dateFilter: ''
  });

  const { register, handleSubmit, setValue, reset, control } = useForm<FilterValues>({
    defaultValues: appliedFilters
  });

  const currentStatus = useWatch({ control, name: 'statusFilter' });
  const currentPayment = useWatch({ control, name: 'paymentFilter' });

  const { data: bookings = [], isLoading: isQueryLoading } = useQuery({
    queryKey: ['admin-bookings', token],
    queryFn: () => adminBookingApi.getAll(token),
    enabled: !!token,
  });

  const isLoading = sessionStatus === 'loading' || isQueryLoading;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminBookingApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Xóa đơn hàng thành công');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa đơn hàng');
    }
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => adminBookingApi.confirm(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Xác nhận đơn hàng thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xác nhận đơn hàng');
    }
  });

  const onSearch = (data: FilterValues) => {
    setAppliedFilters(data);
  };

  const clearFilters = () => {
    const defaultValues = {
      searchTerm: '',
      statusFilter: 'all',
      paymentFilter: 'all',
      dateFilter: ''
    };
    reset(defaultValues);
    setAppliedFilters(defaultValues);
  };

  const filteredBookings = (bookings || []).filter(b => {
    const { searchTerm, statusFilter, paymentFilter, dateFilter } = appliedFilters;

    const matchesSearch = !searchTerm ||
      b.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || b.payment_status === paymentFilter;

    let matchesDate = true;
    if (dateFilter) {
      const bookingDate = new Date(b.created_at).toISOString().split('T')[0];
      matchesDate = bookingDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Quản Lý Đơn Hàng</h1>
          <p className="text-muted-foreground mt-1 text-lg">Theo dõi và xử lý các yêu cầu đặt tour từ khách hàng.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
        <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc mã đơn..."
                  className="pl-10 bg-white/5 border-white/10"
                  {...register('searchTerm')}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={currentStatus}
                  onValueChange={(val) => setValue('statusFilter', val)}
                >
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending_confirm">Chờ xác nhận</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={currentPayment}
                  onValueChange={(val) => setValue('paymentFilter', val)}
                >
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                    <SelectValue placeholder="Thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thanh toán</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                    <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                  <Input
                    type="date"
                    className="pl-10 bg-white/5 border-white/10 w-[180px] [color-scheme:dark]"
                    {...register('dateFilter')}
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Search className="mr-2 size-4" />
                    Tìm kiếm
                  </Button>

                  {(appliedFilters.statusFilter !== 'all' || appliedFilters.paymentFilter !== 'all' || appliedFilters.dateFilter !== '' || appliedFilters.searchTerm !== '') && (
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
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mã Đơn</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Khách Hàng</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tour</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Trạng Thái</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Thanh Toán</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tổng Tiền</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ngày Đặt</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-4 h-16 bg-white/5"></td>
                      </tr>
                    ))
                  ) : filteredBookings.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-white/[0.05] transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-primary">#{booking.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{booking.contact_name}</span>
                          <span className="text-[10px] text-muted-foreground">{booking.contact_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground truncate max-w-[180px] block">
                          {booking.booking_items?.[0]?.tour_title || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentBadge status={booking.payment_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-foreground">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.total_amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(booking.created_at).toLocaleDateString('vi-VN')}
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
                              <Link href={`/admin/booking/edit/${booking.id}`} className="cursor-pointer">
                                <Eye className="mr-2 size-4" />
                                Chi tiết
                              </Link>
                            </DropdownMenuItem>
                            {booking.status === 'pending_confirm' && (
                              <DropdownMenuItem
                                onClick={() => confirmMutation.mutate(booking.id)}
                                className="text-emerald-500 cursor-pointer"
                              >
                                <CheckCircle2 className="mr-2 size-4" />
                                Xác nhận
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(booking.id)}
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
                  {!isLoading && filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                        Không có đơn hàng nào được tìm thấy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </form>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Đơn hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
    </div >
  );
}
