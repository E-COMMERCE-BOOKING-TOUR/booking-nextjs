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

const StatusBadge = ({ status }: { status: number }) => {
  return status === 1 ? (
    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
  ) : (
    <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Inactive</Badge>
  );
};

export default function AdminUserListPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);

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
      toast.success('User created successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ICreateUserPayload> }) =>
      adminUserApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminUserApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
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
        { label: 'All Roles', value: 'all' },
        ...roles.map((role: IAdminRole) => ({ label: role.name, value: role.id.toString() }))
    ];

    const supplierOptions = [
        { label: 'All Suppliers', value: 'all' },
        ...suppliers.map((supplier: IAdminSupplier) => ({ label: supplier.name, value: supplier.id.toString() }))
    ];

    const statusOptions = [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' }
    ];

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminPageHeader 
                title="User Management" 
                description="Manage accounts, permissions, and user information."
            >
                <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
                    <Plus className="mr-2 size-4" />
                    Add User
                </Button>
            </AdminPageHeader>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder="Search by name, email, username..."
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
                        placeholder="Role" 
                        options={roleOptions} 
                    />
                    <AdminSelect 
                        value={supplierFilter} 
                        onValueChange={setSupplierFilter} 
                        placeholder="Supplier" 
                        options={supplierOptions} 
                    />
                    <AdminSelect 
                        value={statusFilter} 
                        onValueChange={setStatusFilter} 
                        placeholder="Status" 
                        options={statusOptions} 
                    />
                </AdminFilterBar>
                <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50px]">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Supplier</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Created At</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
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
                          <span className="text-xs text-muted-foreground">{user.email || user.username}</span>
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
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="cursor-pointer">
                              <Pencil className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(user.id)}
                              className="text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} / {totalItems} results
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
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information.' : 'Fill in the information to create a new user.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  disabled={!!editingUser}
                  {...register('username', { required: !editingUser })}
                  placeholder="username"
                />
                {errors.username && <span className="text-xs text-rose-500">Required</span>}
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password', { required: true, minLength: 8 })}
                  />
                  {errors.password && <span className="text-xs text-rose-500">Minimum 8 characters</span>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register('full_name', { required: true })}
                  placeholder="Nguyen Van A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="example@mail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="0901234567"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  onValueChange={(val) => setValue('status', Number(val))}
                  defaultValue={editingUser ? String(editingUser.status) : "1"}
                  key={editingUser ? `edit-${editingUser.id}` : 'create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  onValueChange={(val) => setValue('role_id', Number(val))}
                  defaultValue={editingUser?.role?.id ? String(editingUser.role.id) : undefined}
                  key={editingUser ? `role-${editingUser.id}` : 'role-create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: IAdminRole) => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Supplier (if any)</Label>
                <Select
                  onValueChange={(val) => setValue('supplier_id', Number(val))}
                  defaultValue={editingUser?.supplier?.id ? String(editingUser.supplier.id) : undefined}
                  key={editingUser ? `supplier-${editingUser.id}` : 'supplier-create'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Supplier" />
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
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be deleted from the system.
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