"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRoleApi } from '@/apis/admin/role';
import { adminPermissionApi } from '@/apis/admin/permission';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    ShieldAlert,
    Loader2,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { HasPermission } from '@/components/auth/HasPermission';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { IAdminRole, ICreateRolePayload } from '@/types/admin/role';
import { IAdminPermission } from '@/types/admin/permission';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';

import { CustomPagination } from '@/components/ui/custom-pagination';

// ... (existing imports)

export default function AdminRolePage() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<IAdminRole | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [keyword, setKeyword] = useState('');

    const [page, setPage] = useState(1);
    const limit = 10;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ICreateRolePayload>();

    const { data: roleResponse, isLoading } = useQuery({
        queryKey: ['admin-roles', token, page, limit],
        queryFn: () => adminRoleApi.getAll(token, page, limit),
        enabled: !!token,
    });

    const roles = roleResponse?.data || [];
    const totalPages = roleResponse?.total_pages || 1;
    const totalItems = roleResponse?.total_items || 0;

    const { data: permissions = [] } = useQuery({
        queryKey: ['admin-permissions', token],
        queryFn: () => adminPermissionApi.getAll(token),
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: (data: ICreateRolePayload) => adminRoleApi.create(data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            toast.success('Role created successfully');
            handleCloseDialog();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create role');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<ICreateRolePayload> }) =>
            adminRoleApi.update(id, data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            toast.success('Role updated successfully');
            handleCloseDialog();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminRoleApi.remove(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            toast.success('Role deleted successfully');
            setDeleteId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete role');
        }
    });

    const handleOpenCreate = () => {
        setEditingRole(null);
        setSelectedPermissions([]);
        reset({ name: '', desciption: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (role: IAdminRole) => {
        setEditingRole(role);
        setSelectedPermissions(role.permissions?.map(p => 
            typeof p === 'string' 
                ? (permissions as IAdminPermission[]).find(ap => ap.permission_name === p)?.id 
                : (p as any).id
        ).filter(id => id !== undefined) as number[] || []);
        reset({
            name: role.name,
            desciption: role.desciption
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingRole(null);
        setSelectedPermissions([]);
        reset();
    };

    const handlePermissionToggle = (permissionId: number) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const onSubmit = (data: ICreateRolePayload) => {
        const payload = { ...data, permission_ids: selectedPermissions };
        if (editingRole) {
            updateMutation.mutate({ id: editingRole.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleSearch = () => {
        setSearchTerm(keyword);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminPageHeader
                title="Roles & Permissions"
                description="Define roles and assign access permissions to users."
            >
                <div className="flex items-center gap-3">
                    <HasPermission permission="permission:read">
                        <Link href="/admin/roles/permissions">
                            <Button variant="outline" className="border-white/10 hover:bg-white/5">
                                <ShieldAlert className="mr-2 size-4 text-primary" />
                                Manage Permissions
                            </Button>
                        </Link>
                    </HasPermission>
                    <HasPermission permission="role:create">
                        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
                            <Plus className="mr-2 size-4" />
                            Add Role
                        </Button>
                    </HasPermission>
                </div>
            </AdminPageHeader>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder="Search by role name or description..."
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
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Role Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Permissions</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : roles.length > 0 ? (
                                    roles.map((role: IAdminRole) => (
                                        <tr key={role.id} className="group hover:bg-white/[0.05] transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono">#{role.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="size-4 text-primary" />
                                                    <span className="font-bold text-foreground">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">
                                                {role.desciption}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-[400px]">
                                                    {role.permissions?.slice(0, 5).map((p: any, idx) => (
                                                        <Badge 
                                                            key={typeof p === 'string' ? `${p}-${idx}` : (p.id || idx)} 
                                                            variant="secondary" 
                                                            className="bg-white/10 hover:bg-white/20"
                                                        >
                                                            {typeof p === 'string' ? p : p.permission_name}
                                                        </Badge>
                                                    ))}
                                                    {(role.permissions?.length || 0) > 5 && (
                                                        <Badge variant="outline" className="text-muted-foreground">
                                                            +{role.permissions.length - 5} more
                                                        </Badge>
                                                    )}
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
                                                        <HasPermission permission="role:update">
                                                            <DropdownMenuItem onClick={() => handleOpenEdit(role)} className="cursor-pointer">
                                                                <Pencil className="mr-2 size-4" /> Edit
                                                            </DropdownMenuItem>
                                                        </HasPermission>
                                                        <DropdownMenuSeparator />
                                                        <HasPermission permission="role:delete">
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteId(role.id)}
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
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No roles found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Showing {roles.length} / {totalItems} results
                        </span>
                        <CustomPagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs and Alerts remain same */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Update Role' : 'Create New Role'}</DialogTitle>
                        <DialogDescription>
                            Set name, description and assign permissions for this role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-6 py-4">
                        <div className="w-1/2 space-y-4">
                            <div className="space-y-2">
                                <Label>Role Name (Code)</Label>
                                <Input {...register('name', { required: true })} placeholder="e.g.: admin, staff..." />
                                {errors.name && <span className="text-xs text-rose-500">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input {...register('desciption', { required: true })} placeholder="What does this role do..." />
                                {errors.desciption && <span className="text-xs text-rose-500">Required</span>}
                            </div>
                        </div>

                        <div className="w-1/2 flex flex-col gap-2">
                            <Label className="mb-1">Permissions</Label>
                            <ScrollArea className="h-[250px] w-full rounded-md border border-white/10 bg-white/5 p-4">
                                <div className="space-y-3">
                                    {permissions.map((p: IAdminPermission) => (
                                        <div key={p.id} className="flex items-start gap-2">
                                            <Checkbox
                                                id={`perm-${p.id}`}
                                                checked={selectedPermissions.includes(p.id)}
                                                onCheckedChange={() => handlePermissionToggle(p.id)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label
                                                    htmlFor={`perm-${p.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                                                >
                                                    {p.permission_name}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {p.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {permissions.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center">No permissions created yet.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending}>
                            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {editingRole ? 'Save Changes' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. If this role is being used by users, you need to remove the role from them first.
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