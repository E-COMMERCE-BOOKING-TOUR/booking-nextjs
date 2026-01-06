"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCurrencyApi, CreateCurrencyDTO, UpdateCurrencyDTO } from '@/apis/admin/currency';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { HasPermission } from '@/components/auth/HasPermission';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    Coins,
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
import { ICurrency } from '@/types/response/base.type';

interface CurrencyFormData {
    name: string;
    symbol: string;
}

export default function AdminCurrencyPage() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editCurrency, setEditCurrency] = useState<ICurrency | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm<CurrencyFormData>({
        defaultValues: {
            name: '',
            symbol: '',
        }
    });

    // Fetch currencies
    const { data: currencies = [], isLoading } = useQuery({
        queryKey: ['admin-currencies', token],
        queryFn: () => adminCurrencyApi.getAll(token),
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateCurrencyDTO) => adminCurrencyApi.create(data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
            toast.success('Currency created successfully');
            setIsCreateOpen(false);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create currency');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCurrencyDTO }) =>
            adminCurrencyApi.update(id, data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
            toast.success('Currency updated successfully');
            setEditCurrency(null);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update currency');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminCurrencyApi.remove(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-currencies'] });
            toast.success('Currency deleted successfully');
            setDeleteId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete currency');
        }
    });

    const openEdit = (currency: ICurrency) => {
        setEditCurrency(currency);
        setValue('name', currency.name);
        setValue('symbol', currency.symbol);
    };

    const openCreate = () => {
        reset({
            name: '',
            symbol: '',
        });
        setIsCreateOpen(true);
    };

    const onSubmitCreate = (data: CurrencyFormData) => {
        createMutation.mutate({
            name: data.name,
            symbol: data.symbol,
        });
    };

    const onSubmitEdit = (data: CurrencyFormData) => {
        if (!editCurrency) return;
        updateMutation.mutate({
            id: editCurrency.id,
            data: {
                name: data.name,
                symbol: data.symbol,
            }
        });
    };

    const filteredCurrencies = currencies.filter((c: ICurrency) =>
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminPageHeader
                title="Currency Management"
                description="Manage system currencies and their symbols."
            >
                <HasPermission permission="currency:create">
                    <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 size-4" />
                        Add Currency
                    </Button>
                </HasPermission>
            </AdminPageHeader>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder="Search by name or symbol..."
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={() => {}} // Live search
                    onClear={() => setSearchTerm('')}
                    isFiltered={searchTerm !== ''}
                />
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Symbol</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : filteredCurrencies.map((currency: ICurrency) => (
                                    <tr key={currency.id} className="group hover:bg-white/[0.05] transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-primary">#{currency.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                    <Coins className="size-4 text-amber-500" />
                                                </div>
                                                <span className="text-sm font-bold text-foreground">{currency.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-lg font-black text-amber-500">{currency.symbol}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="size-8 p-0">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <HasPermission permission="currency:update">
                                                        <DropdownMenuItem onClick={() => openEdit(currency)} className="cursor-pointer">
                                                            <Edit className="mr-2 size-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </HasPermission>
                                                    <DropdownMenuSeparator />
                                                    <HasPermission permission="currency:delete">
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(currency.id)}
                                                            className="text-rose-500 cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </HasPermission>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && filteredCurrencies.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No currencies found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>


            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add New Currency</DialogTitle>
                        <DialogDescription>
                            Enter details to create a new currency.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitCreate)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    className="col-span-3"
                                    placeholder="e.g. Vietnam Dong"
                                    {...register('name', { required: true })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="symbol" className="text-right">Symbol</Label>
                                <Input
                                    id="symbol"
                                    className="col-span-3"
                                    placeholder="e.g. ₫"
                                    {...register('symbol', { required: true })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editCurrency} onOpenChange={() => setEditCurrency(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Edit Currency</DialogTitle>
                        <DialogDescription>
                            Update currency details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitEdit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input
                                    id="edit-name"
                                    className="col-span-3"
                                    {...register('name', { required: true })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-symbol" className="text-right">Symbol</Label>
                                <Input
                                    id="edit-symbol"
                                    className="col-span-3"
                                    {...register('symbol', { required: true })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditCurrency(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The currency will be permanently deleted from the system.
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
