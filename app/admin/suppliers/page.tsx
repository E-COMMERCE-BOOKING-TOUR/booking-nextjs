"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupplierApi } from '@/apis/admin/supplier';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Building2,
  Mail,
  Phone,
  UserCog,
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
import { IAdminSupplier, ICreateSupplierPayload } from '@/types/admin/supplier';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from '@/components/ui/custom-pagination';

export default function AdminSupplierPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<IAdminSupplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // ... (useForm)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ICreateSupplierPayload>({
    defaultValues: {
      status: 'active'
    }
  });

  const { data: supplierResponse, isLoading } = useQuery({
    queryKey: ['admin-suppliers', token, page, limit],
    queryFn: () => adminSupplierApi.getAll(token, page, limit),
    enabled: !!token,
  });

  const suppliers = supplierResponse?.data || [];
  const totalPages = supplierResponse?.total_pages || 1;
  const totalItems = supplierResponse?.total_items || 0;

  const createMutation = useMutation({
    mutationFn: (data: ICreateSupplierPayload) => adminSupplierApi.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Thêm nhà cung cấp thành công');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi thêm nhà cung cấp');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ICreateSupplierPayload> }) =>
      adminSupplierApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Cập nhật thành công');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi cập nhật');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSupplierApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Xóa thành công');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi xóa');
    }
  });

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    reset({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (supplier: IAdminSupplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    reset();
  };

  const onSubmit = (data: ICreateSupplierPayload) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSearch = () => {
    setSearchTerm(keyword);
    setPage(1);
  };

  const filteredSuppliers = (suppliers || []).filter((s: IAdminSupplier) =>
    !searchTerm ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Nhà Cung Cấp</h1>
          <p className="text-muted-foreground mt-1 text-lg">Quản lý các đối tác và nhà cung cấp dịch vụ.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Thêm nhà cung cấp
        </Button>
      </div>

      <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhà cung cấp..."
                  className="pl-10 bg-white/5 border-white/10"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                Tìm kiếm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50px]">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tên Nhà Cung Cấp</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Liên Hệ</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Trạng Thái</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tour/Users</th>
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
                ) : filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier: IAdminSupplier) => (
                    <tr key={supplier.id} className="group hover:bg-white/[0.05] transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono">#{supplier.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 className="size-5" />
                          </div>
                          <span className="font-bold text-foreground">{supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <Mail className="size-3.5 text-muted-foreground" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <Phone className="size-3.5 text-muted-foreground" />
                            {supplier.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {supplier.status === 'active' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Hoạt động</Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Ngừng hoạt động</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {/* Placeholder counts if not available from API yet */}
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><Building2 className="size-3" /> {supplier.tour_count ?? 0} tours</span>
                          <span className="flex items-center gap-1"><UserCog className="size-3" /> {supplier.user_count ?? 0} users</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEdit(supplier)} className="cursor-pointer">
                              <Pencil className="mr-2 size-4" /> Sửa thông tin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(supplier.id)}
                              className="text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="mr-2 size-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      Không tìm thấy nhà cung cấp nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Hiển thị {filteredSuppliers.length} / {totalItems} kết quả
            </span>
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</DialogTitle>
            <DialogDescription>
              Thông tin nhà cung cấp dịch vụ tour và các dịch vụ khác.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên nhà cung cấp</Label>
              <Input {...register('name', { required: true })} placeholder="Công ty du lịch ABC" />
              {errors.name && <span className="text-xs text-rose-500">Bắt buộc</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} placeholder="contact@abc.com" />
                {errors.email && <span className="text-xs text-rose-500">Email không hợp lệ</span>}
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input {...register('phone', { required: true })} placeholder="0123456789" />
                {errors.phone && <span className="text-xs text-rose-500">Bắt buộc</span>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                onValueChange={(val) => setValue('status', val as any)}
                defaultValue={editingSupplier?.status || 'active'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Hủy</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingSupplier ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Dữ liệu liên quan đến nhà cung cấp này có thể bị ảnh hưởng.
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