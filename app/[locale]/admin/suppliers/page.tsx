"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupplierApi } from '@/apis/admin/supplier';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
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
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { HasPermission } from '@/components/auth/HasPermission';
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
import { useTranslations } from 'next-intl';

export default function AdminSupplierPage() {
  const t = useTranslations("admin");
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
    mutationFn: (data: ICreateSupplierPayload) => adminSupplierApi.create(data as unknown as Record<string, unknown>, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success(t('toast_add_supplier_success'));
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_add_supplier_error'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ICreateSupplierPayload> }) =>
      adminSupplierApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success(t('toast_update_supplier_success'));
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_update_supplier_error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSupplierApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success(t('toast_delete_supplier_success'));
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_delete_supplier_error'));
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
      <AdminPageHeader
        title={t('supplier_management_title')}
        description={t('supplier_management_desc')}
      >
        <HasPermission permission="supplier:create">
          <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="mr-2 size-4" />
            {t('add_supplier_button')}
          </Button>
        </HasPermission>
      </AdminPageHeader>

      <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
        <AdminFilterBar
          searchPlaceholder={t('search_supplier_placeholder')}
          searchTerm={keyword}
          onSearchChange={setKeyword}
          onSearch={handleSearch}
          onClear={() => {
            setKeyword('');
            setSearchTerm('');
            setPage(1);
          }}
          isFiltered={searchTerm !== ''}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50px]">{t('col_id')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_supplier_name')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_contact')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_status')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_tour_users')}</th>
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
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{t('status_active')}</Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">{t('status_inactive')}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {/* Placeholder counts if not available from API yet */}
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><Building2 className="size-3" /> {t('tours_count', { count: supplier.tour_count ?? 0 })}</span>
                          <span className="flex items-center gap-1"><UserCog className="size-3" /> {t('users_count', { count: supplier.user_count ?? 0 })}</span>
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
                            <DropdownMenuLabel>{t('col_actions')}</DropdownMenuLabel>
                            <HasPermission permission="supplier:update">
                              <DropdownMenuItem onClick={() => handleOpenEdit(supplier)} className="cursor-pointer">
                                <Pencil className="mr-2 size-4" /> {t('edit_information_action')}
                              </DropdownMenuItem>
                            </HasPermission>
                            <DropdownMenuSeparator />
                            <HasPermission permission="supplier:delete">
                              <DropdownMenuItem
                                onClick={() => setDeleteId(supplier.id)}
                                className="text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="mr-2 size-4" /> {t('action_delete')}
                              </DropdownMenuItem>
                            </HasPermission>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      {t('no_suppliers_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('showing_results', { count: filteredSuppliers.length, total: totalItems })}
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
            <DialogTitle>{editingSupplier ? t('edit_user_title').replace('User', 'Supplier') : t('add_new_user_title').replace('User', 'Supplier')}</DialogTitle>
            <DialogDescription>
              {t('supplier_info_desc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('col_supplier_name')}</Label>
              <Input {...register('name', { required: true })} placeholder="ABC Travel Company" />
              {errors.name && <span className="text-xs text-rose-500">{t('required_field')}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('email_label')}</Label>
                <Input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} placeholder="contact@abc.com" />
                {errors.email && <span className="text-xs text-rose-500">{t('invalid_email_error')}</span>}
              </div>
              <div className="space-y-2">
                <Label>{t('phone_label')}</Label>
                <Input {...register('phone', { required: true })} placeholder="0123456789" />
                {errors.phone && <span className="text-xs text-rose-500">{t('required_field')}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('col_status')}</Label>
              <Select
                onValueChange={(val) => setValue('status', val as ICreateSupplierPayload['status'])}
                defaultValue={editingSupplier?.status || 'active'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_status_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('status_active')}</SelectItem>
                  <SelectItem value="inactive">{t('status_inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>{t('cancel_button')}</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingSupplier ? t('save_changes_button') : t('create_button')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_supplier_desc')}
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