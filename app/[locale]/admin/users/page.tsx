"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserApi } from '@/apis/admin/user';
import { adminRoleApi } from '@/apis/admin/role';
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
  KeyRound,
  Copy,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { IAdminUser, ICreateUserPayload } from '@/types/admin/user';
import { IAdminRole } from '@/types/admin/role';
import { IAdminSupplier } from '@/types/admin/supplier';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { useTranslations, useFormatter } from 'next-intl';

const StatusBadge = ({ status }: { status: number }) => {
  const t = useTranslations("admin");
  return status === 1 ? (
    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{t('status_active')}</Badge>
  ) : (
    <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">{t('status_inactive')}</Badge>
  );
};

export default function AdminUserListPage() {
  const t = useTranslations("admin");
  const format = useFormatter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<IAdminUser | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ICreateUserPayload>({
    defaultValues: {
      status: 1,
      login_type: 0 // account
    }
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Queries
  const { data: userResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users', token, page, limit, searchTerm, roleFilter, supplierFilter, statusFilter], // Add filters to queryKey
    queryFn: () => adminUserApi.getAll(token, page, limit, searchTerm, roleFilter, supplierFilter, statusFilter), // Pass filters to API
    enabled: !!token,
  });

  const users = userResponse?.data || [];
  const totalPages = userResponse?.total_pages || 1;
  const totalItems = userResponse?.total_items || 0;

  const { data: roleResponse } = useQuery({
    queryKey: ['admin-roles', token],
    queryFn: () => adminRoleApi.getAll(token, 1, 100), // Get first 100 roles for dropdown
    enabled: !!token,
  });
  const roles = roleResponse?.data || [];

  const { data: supplierResponse } = useQuery({
    queryKey: ['admin-suppliers', token],
    queryFn: () => adminSupplierApi.getAll(token, 1, 100), // Get first 100 suppliers for dropdown
    enabled: !!token,
  });
  const suppliers = supplierResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ICreateUserPayload) => adminUserApi.create(data as unknown as Record<string, unknown>, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('toast_create_user_success'));
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_create_user_error'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ICreateUserPayload> }) =>
      adminUserApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('toast_update_user_success'));
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_update_user_error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminUserApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('toast_delete_user_success'));
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_delete_user_error'));
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: number) => adminUserApi.resetPassword(id, undefined, token),
    onSuccess: (data: { newPassword?: string }) => {
      setNewPassword(data.newPassword || null);
      toast.success(t('toast_reset_password_success'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast_reset_password_error'));
      setResetPasswordUser(null);
    }
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset({
      username: '',
      password: '',
      full_name: '',
      email: '',
      phone: '',
      status: 1,
      login_type: 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: IAdminUser) => {
    setEditingUser(user);
    reset({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role_id: user.role?.id,
      supplier_id: user.supplier?.id,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = (data: ICreateUserPayload) => {
    // Convert string IDs to numbers if necessary (react-hook-form might return strings from Select)
    const payload = {
      ...data,
      role_id: data.role_id ? Number(data.role_id) : undefined,
      supplier_id: data.supplier_id ? Number(data.supplier_id) : undefined,
      status: Number(data.status),
    };

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleSearch = () => {
    // No action needed for immediate search as we use state directly in useQuery
    // But if we want to "trigger" search only on button click, we need a separate state 'debouncedSearch' or similar.
    // However, user requested "Search Button".
    // If we use searchTerm directly in useQuery, it will refetch on every keystroke if we bind it to Input onChange.
    // We need to use 'keyword' for Input and 'searchTerm' for API.
    setSearchTerm(keyword);
    setPage(1);
  };

  // We no longer filter on client side.
  // The 'users' array is already filtered by backend.
  const filteredUsers = users;


  const roleOptions = [
    { label: t('all_roles_option') || 'All Roles', value: 'all' },
    ...roles.map((role: IAdminRole) => ({ label: role.name, value: role.id.toString() }))
  ];

  const supplierOptions = [
    { label: t('all_suppliers_option') || 'All Suppliers', value: 'all' },
    ...suppliers.map((supplier: IAdminSupplier) => ({ label: supplier.name, value: supplier.id.toString() }))
  ];

  const statusOptions = [
    { label: t('all_status_option'), value: 'all' },
    { label: t('status_active'), value: '1' },
    { label: t('status_inactive'), value: '0' }
  ];

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminPageHeader
        title={t('user_management_title')}
        description={t('user_management_desc')}
      >
        <HasPermission permission="user:create">
          <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="mr-2 size-4" />
            {t('add_user_button')}
          </Button>
        </HasPermission>
      </AdminPageHeader>

      <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
        <AdminFilterBar
          searchPlaceholder={t('search_user_placeholder')}
          searchTerm={keyword}
          onSearchChange={setKeyword}
          onSearch={handleSearch}
          onClear={() => {
            setKeyword('');
            setSearchTerm('');
            setRoleFilter('all');
            setSupplierFilter('all');
            setStatusFilter('all');
            setPage(1);
          }}
          isFiltered={keyword !== '' || roleFilter !== 'all' || supplierFilter !== 'all' || statusFilter !== 'all'}
        >
          <AdminSelect
            value={roleFilter}
            onValueChange={setRoleFilter}
            placeholder={t('col_role')}
            options={roleOptions}
          />
          <AdminSelect
            value={supplierFilter}
            onValueChange={setSupplierFilter}
            placeholder={t('col_supplier')}
            options={supplierOptions}
          />
          <AdminSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder={t('col_status')}
            options={statusOptions}
          />
        </AdminFilterBar>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50px]">{t('col_id')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_user')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_role')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_supplier')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_status')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_created_at')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingUsers ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-4 h-16 bg-white/5"></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user: IAdminUser) => (
                    <tr key={user.id} className="group hover:bg-white/[0.05] transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono">#{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                          {user.email && <span className="text-xs text-muted-foreground/60">{user.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role ? (
                          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                            {user.role.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.supplier ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user.supplier.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        {format.dateTime(new Date(user.created_at))}
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
                            <HasPermission permission="user:update">
                              <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="cursor-pointer">
                                <Pencil className="mr-2 size-4" /> {t('action_edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setResetPasswordUser(user)}
                                className="cursor-pointer"
                              >
                                <KeyRound className="mr-2 size-4" /> {t('action_reset_password')}
                              </DropdownMenuItem>
                            </HasPermission>
                            <DropdownMenuSeparator />
                            <HasPermission permission="user:delete">
                              <DropdownMenuItem
                                onClick={() => setDeleteId(user.id)}
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
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                      {t('no_users_found') || 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('showing_results', { count: filteredUsers.length, total: totalItems })}
            </span>
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? t('edit_user_title') : t('add_new_user_title')}</DialogTitle>
            <DialogDescription>
              {editingUser ? t('edit_user_desc') : t('add_new_user_desc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username_label')}</Label>
                <Input
                  id="username"
                  disabled={!!editingUser}
                  {...register('username', { required: !editingUser })}
                  placeholder={editingUser?.username || t('username_placeholder')}
                />
                {errors.username && <span className="text-xs text-rose-500">{t('required_field')}</span>}
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password_label')}</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password', { required: true, minLength: 8 })}
                  />
                  {errors.password && <span className="text-xs text-rose-500">{t('min_password_length', { count: 8 })}</span>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">{t('full_name_label')}</Label>
                <Input
                  id="full_name"
                  {...register('full_name', { required: true })}
                  placeholder="Nguyen Van A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email_label')}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="example@mail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone_label')}</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="0901234567"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('col_status')}</Label>
                <Select
                  onValueChange={(val) => setValue('status', Number(val))}
                  defaultValue={editingUser ? String(editingUser.status) : "1"}
                  key={editingUser ? `edit-${editingUser.id}` : 'create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_status_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t('status_active')}</SelectItem>
                    <SelectItem value="0">{t('status_inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('col_role')}</Label>
                <Select
                  onValueChange={(val) => setValue('role_id', Number(val))}
                  defaultValue={editingUser?.role?.id ? String(editingUser.role.id) : undefined}
                  key={editingUser ? `role-${editingUser.id}` : 'role-create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_role_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: IAdminRole) => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('col_supplier')} ({t('if_any_label') || 'if any'})</Label>
                <Select
                  onValueChange={(val) => setValue('supplier_id', Number(val))}
                  defaultValue={editingUser?.supplier?.id ? String(editingUser.supplier.id) : undefined}
                  key={editingUser ? `supplier-${editingUser.id}` : 'supplier-create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_supplier_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier: IAdminSupplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>{t('cancel_button')}</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingUser ? t('update_button') : t('create_button')}
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
              {t('confirm_delete_user_desc')}
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

      {/* Reset Password Dialog */}
      <Dialog
        open={!!resetPasswordUser}
        onOpenChange={(open) => {
          if (!open) {
            setResetPasswordUser(null);
            setNewPassword(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('reset_password_title')}</DialogTitle>
            <DialogDescription>
              {newPassword
                ? t('reset_password_success_desc', { username: resetPasswordUser?.username || '' })
                : t('reset_password_confirm_desc', { username: resetPasswordUser?.username || '' })}
            </DialogDescription>
          </DialogHeader>

          {newPassword ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">{t('new_password_label')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-lg font-mono font-bold text-primary">{newPassword}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(newPassword);
                      toast.success(t('copied_to_clipboard'));
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('share_password_note')}
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {t('reset_password_warning')}
              </p>
            </div>
          )}

          <DialogFooter>
            {newPassword ? (
              <Button onClick={() => { setResetPasswordUser(null); setNewPassword(null); }}>
                {t('close_button')}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setResetPasswordUser(null)}>
                  {t('cancel_button')}
                </Button>
                <Button
                  onClick={() => resetPasswordUser && resetPasswordMutation.mutate(resetPasswordUser.id)}
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {t('reset_password_button')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
