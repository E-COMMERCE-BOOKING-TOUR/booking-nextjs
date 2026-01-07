"use client";

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminDivisionApi, CreateDivisionDTO, UpdateDivisionDTO } from '@/apis/admin/division';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    MapPin,
    ImageUp
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
import { IDivision, ICountry } from '@/types/response/base.type';
import { useTranslations } from 'next-intl';

interface DivisionFormData {
    name: string;
    name_local: string;
    level: number;
    code: string;
    country_id: number;
    parent_id: number | null;
}

export default function AdminDivisionPage() {
    const t = useTranslations("admin");
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editDivision, setEditDivision] = useState<IDivision | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const { register, handleSubmit, reset, setValue, watch } = useForm<DivisionFormData>({
        defaultValues: {
            name: '',
            name_local: '',
            level: 1,
            code: '',
            country_id: 0,
            parent_id: null,
        }
    });

    const formCountryId = watch('country_id');

    // Fetch countries
    const { data: countries = [] } = useQuery({
        queryKey: ['admin-countries', token],
        queryFn: () => adminDivisionApi.getCountries(token),
        enabled: !!token,
    });

    // Fetch divisions (all or by country)
    const { data: divisions = [], isLoading } = useQuery({
        queryKey: ['admin-divisions', token, selectedCountryId],
        queryFn: () => selectedCountryId
            ? adminDivisionApi.getByCountry(selectedCountryId, token)
            : adminDivisionApi.getAll(token),
        enabled: !!token,
    });

    // Fetch divisions for parent select (when creating/editing)
    const { data: parentDivisions = [] } = useQuery({
        queryKey: ['admin-divisions-parent', token, formCountryId],
        queryFn: () => formCountryId
            ? adminDivisionApi.getByCountry(formCountryId, token)
            : Promise.resolve([]),
        enabled: !!token && !!formCountryId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateDivisionDTO) => adminDivisionApi.create(data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            toast.success(t('toast_create_division_success'));
            setIsCreateOpen(false);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_create_division_error'));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDivisionDTO }) =>
            adminDivisionApi.update(id, data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            toast.success(t('toast_update_division_success'));
            setEditDivision(null);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_update_division_error'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminDivisionApi.remove(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            toast.success(t('toast_delete_division_success'));
            setDeleteId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast_delete_division_error'));
        }
    });

    const openEdit = (division: IDivision) => {
        setEditDivision(division);
        setValue('name', division.name);
        setValue('name_local', division.name_local);
        setValue('level', typeof division.level === 'string' ? parseInt(division.level) : division.level);
        setValue('code', division.code || '');
        setValue('country_id', division.country?.id || 0);
        setValue('parent_id', division.parent_id || null);
        setImagePreview(division.image_url || null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editDivision) return;

        setUploadingImage(true);
        try {
            const result = await adminDivisionApi.uploadImage(editDivision.id, file, token);
            setImagePreview(result.image_url);
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            toast.success(t('toast_image_upload_success'));
        } catch {
            toast.error(t('toast_image_upload_error'));
        } finally {
            setUploadingImage(false);
        }
    };

    const openCreate = () => {
        reset({
            name: '',
            name_local: '',
            level: 1,
            code: '',
            country_id: selectedCountryId || 0,
            parent_id: null,
        });
        setIsCreateOpen(true);
    };

    const onSubmitCreate = (data: DivisionFormData) => {
        createMutation.mutate({
            name: data.name,
            name_local: data.name_local,
            level: data.level,
            code: data.code || undefined,
            country_id: data.country_id,
            parent_id: data.parent_id,
        });
    };

    const onSubmitEdit = (data: DivisionFormData) => {
        if (!editDivision) return;
        updateMutation.mutate({
            id: editDivision.id,
            data: {
                name: data.name,
                name_local: data.name_local,
                level: data.level,
                code: data.code || undefined,
                country_id: data.country_id,
                parent_id: data.parent_id,
            }
        });
    };

    const filteredDivisions = divisions.filter((d: IDivision) =>
        !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.name_local.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminPageHeader
                title={t('division_management_title')}
                description={t('division_management_desc')}
            >
                <HasPermission permission="division:create">
                    <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 size-4" />
                        {t('add_division_button')}
                    </Button>
                </HasPermission>
            </AdminPageHeader>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder={t('search_division_placeholder')}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={() => { }} // Search is live due to filter() but we can keep it for UI
                    onClear={() => {
                        setSearchTerm('');
                        setSelectedCountryId(null);
                    }}
                    isFiltered={searchTerm !== '' || selectedCountryId !== null}
                >
                    <AdminSelect
                        value={selectedCountryId?.toString() || 'all'}
                        onValueChange={(val: string) => setSelectedCountryId(val === 'all' ? null : parseInt(val))}
                        placeholder={t('select_country_placeholder')}
                        options={[
                            { label: t('all_countries_option'), value: 'all' },
                            ...countries.map((country: ICountry) => ({
                                label: country.name,
                                value: country.id.toString()
                            }))
                        ]}
                        width="w-[200px]"
                    />
                </AdminFilterBar>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_id')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_name')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_local_name')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_level')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_code')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_country')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('col_parent')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">{t('col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={8} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : filteredDivisions.map((division: IDivision) => (
                                    <tr key={division.id} className="group hover:bg-white/[0.05] transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-primary">#{division.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/20 transition-colors">
                                                    <MapPin className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-sm font-bold text-foreground">{division.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{division.name_local}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="outline" className="bg-white/5 border-white/10">{division.level}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-muted-foreground font-mono">{division.code || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{division.country?.name || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-muted-foreground">{division.parent?.name || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="size-8 p-0">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>{t('col_actions')}</DropdownMenuLabel>
                                                    <HasPermission permission="division:update">
                                                        <DropdownMenuItem onClick={() => openEdit(division)} className="cursor-pointer">
                                                            <Edit className="mr-2 size-4" />
                                                            {t('action_edit')}
                                                        </DropdownMenuItem>
                                                    </HasPermission>
                                                    <DropdownMenuSeparator />
                                                    <HasPermission permission="division:delete">
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(division.id)}
                                                            className="text-rose-500 cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 size-4" />
                                                            {t('action_delete')}
                                                        </DropdownMenuItem>
                                                    </HasPermission>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && filteredDivisions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                                            {t('no_divisions_found')}
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('add_new_division_title')}</DialogTitle>
                        <DialogDescription>
                            {t('add_new_division_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitCreate)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">{t('col_name')}</Label>
                                <Input id="name" className="col-span-3" {...register('name', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name_local" className="text-right">{t('col_local_name')}</Label>
                                <Input id="name_local" className="col-span-3" {...register('name_local', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="level" className="text-right">{t('col_level')}</Label>
                                <Input id="level" type="number" className="col-span-3" {...register('level', { valueAsNumber: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right">{t('col_code')}</Label>
                                <Input id="code" className="col-span-3" {...register('code')} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('col_country')}</Label>
                                <Select
                                    value={formCountryId?.toString() || ''}
                                    onValueChange={(val) => setValue('country_id', parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t('select_country_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country: ICountry) => (
                                            <SelectItem key={country.id} value={country.id.toString()}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('col_parent')}</Label>
                                <Select
                                    value={watch('parent_id')?.toString() || 'none'}
                                    onValueChange={(val) => setValue('parent_id', val === 'none' ? null : parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t('none_option')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('none_option')}</SelectItem>
                                        {parentDivisions.map((d: IDivision) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                {t('cancel_button')}
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? t('creating_status') : t('create_button')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editDivision} onOpenChange={() => setEditDivision(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('edit_division_title')}</DialogTitle>
                        <DialogDescription>
                            {t('update_division_details_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitEdit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">{t('col_name')}</Label>
                                <Input id="edit-name" className="col-span-3" {...register('name', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name_local" className="text-right">{t('col_local_name')}</Label>
                                <Input id="edit-name_local" className="col-span-3" {...register('name_local', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-level" className="text-right">{t('col_level')}</Label>
                                <Input id="edit-level" type="number" className="col-span-3" {...register('level', { valueAsNumber: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-code" className="text-right">{t('col_code')}</Label>
                                <Input id="edit-code" className="col-span-3" {...register('code')} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('col_country')}</Label>
                                <Select
                                    value={formCountryId?.toString() || ''}
                                    onValueChange={(val) => setValue('country_id', parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t('select_country_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country: ICountry) => (
                                            <SelectItem key={country.id} value={country.id.toString()}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('col_parent')}</Label>
                                <Select
                                    value={watch('parent_id')?.toString() || 'none'}
                                    onValueChange={(val) => setValue('parent_id', val === 'none' ? null : parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t('none_option')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('none_option')}</SelectItem>
                                        {parentDivisions.filter((d: IDivision) => d.id !== editDivision?.id).map((d: IDivision) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Image Upload Section */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">{t('image_label')}</Label>
                                <div className="col-span-3 space-y-3">
                                    {imagePreview && (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                                            <Image
                                                src={imagePreview}
                                                alt="Division preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage}
                                        className="w-full"
                                    >
                                        <ImageUp className="mr-2 size-4" />
                                        {uploadingImage ? t('uploading_status') : t('upload_image_button')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDivision(null)}>
                                {t('cancel_button')}
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? t('saving_status') : t('save_changes_button')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirm_delete_desc')}
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
