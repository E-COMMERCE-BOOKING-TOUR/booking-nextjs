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
    mutationFn: (data: ICreateSupplierPayload) => adminSupplierApi.create(data as unknown as Record<string, unknown>, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Supplier added successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add supplier');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ICreateSupplierPayload> }) =>
      adminSupplierApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Updated successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSupplierApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast.success('Deleted successfully');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete');
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
        title="Supplier Management"
        description="Manage tour providers, contact information, and cooperation status."
      >
        <HasPermission permission="supplier:create">
          <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="mr-2 size-4" />
            Add Supplier
          </Button>
        </HasPermission>
      </AdminPageHeader>

      <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
        <AdminFilterBar
          searchPlaceholder="Search by name, contact or address..."
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
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50px]">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Supplier Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tour/Users</th>
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
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Inactive</Badge>
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <HasPermission permission="supplier:update">
                              <DropdownMenuItem onClick={() => handleOpenEdit(supplier)} className="cursor-pointer">
                                <Pencil className="mr-2 size-4" /> Edit Information
                              </DropdownMenuItem>
                            </HasPermission>
                            <DropdownMenuSeparator />
                            <HasPermission permission="supplier:delete">
                              <DropdownMenuItem
                                onClick={() => setDeleteId(supplier.id)}
                                className="text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="mr-2 size-4" /> Delete
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
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {filteredSuppliers.length} / {totalItems} results
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
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              Information about tour service providers and other services.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier Name</Label>
              <Input {...register('name', { required: true })} placeholder="ABC Travel Company" />
              {errors.name && <span className="text-xs text-rose-500">Required</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} placeholder="contact@abc.com" />
                {errors.email && <span className="text-xs text-rose-500">Invalid Email</span>}
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...register('phone', { required: true })} placeholder="0123456789" />
                {errors.phone && <span className="text-xs text-rose-500">Required</span>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={(val) => setValue('status', val as ICreateSupplierPayload['status'])}
                defaultValue={editingSupplier?.status || 'active'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingSupplier ? 'Save Changes' : 'Create'}
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
              This action cannot be undone. Data related to this supplier may be affected.
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