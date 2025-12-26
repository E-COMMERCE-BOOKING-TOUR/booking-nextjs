"use client";

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminDivisionApi, CreateDivisionDTO, UpdateDivisionDTO } from '@/apis/admin/division';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    MapPin,
    ImageUp,
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

interface DivisionFormData {
    name: string;
    name_local: string;
    level: number;
    code: string;
    country_id: number;
    parent_id: number | null;
}

export default function AdminDivisionPage() {
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
            toast.success('Tạo division thành công');
            setIsCreateOpen(false);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể tạo division');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDivisionDTO }) =>
            adminDivisionApi.update(id, data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            toast.success('Cập nhật division thành công');
            setEditDivision(null);
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể cập nhật division');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminDivisionApi.remove(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            toast.success('Xóa division thành công');
            setDeleteId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể xóa division');
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
            toast.success('Upload hình ảnh thành công');
        } catch {
            toast.error('Không thể upload hình ảnh');
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

    const filteredDivisions = divisions.filter(d =>
        !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.name_local.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Quản Lý Division</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Quản lý các tỉnh/thành phố theo quốc gia.</p>
                </div>
                <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 size-4" />
                    Thêm Division
                </Button>
            </div>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <CardHeader className="border-b border-white/5 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên, tên local hoặc mã..."
                                className="pl-10 bg-white/5 border-white/10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={selectedCountryId?.toString() || 'all'}
                            onValueChange={(val) => setSelectedCountryId(val === 'all' ? null : parseInt(val))}
                        >
                            <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
                                <SelectValue placeholder="Chọn quốc gia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả quốc gia</SelectItem>
                                {countries.map((country: ICountry) => (
                                    <SelectItem key={country.id} value={country.id.toString()}>
                                        {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tên</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tên Local</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Level</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mã</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Quốc Gia</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Parent</th>
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
                                ) : filteredDivisions.map((division) => (
                                    <tr key={division.id} className="group hover:bg-white/[0.05] transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-primary">#{division.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="size-4 text-muted-foreground" />
                                                <span className="text-sm font-bold text-foreground">{division.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{division.name_local}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="outline">{division.level}</Badge>
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
                                                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openEdit(division)} className="cursor-pointer">
                                                        <Edit className="mr-2 size-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(division.id)}
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
                                {!isLoading && filteredDivisions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                                            Không có division nào được tìm thấy.
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
                        <DialogTitle>Thêm Division Mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin để tạo division mới.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitCreate)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Tên</Label>
                                <Input id="name" className="col-span-3" {...register('name', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name_local" className="text-right">Tên Local</Label>
                                <Input id="name_local" className="col-span-3" {...register('name_local', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="level" className="text-right">Level</Label>
                                <Input id="level" type="number" className="col-span-3" {...register('level', { valueAsNumber: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right">Mã</Label>
                                <Input id="code" className="col-span-3" {...register('code')} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Quốc gia</Label>
                                <Select
                                    value={formCountryId?.toString() || ''}
                                    onValueChange={(val) => setValue('country_id', parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn quốc gia" />
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
                                <Label className="text-right">Parent</Label>
                                <Select
                                    value={watch('parent_id')?.toString() || 'none'}
                                    onValueChange={(val) => setValue('parent_id', val === 'none' ? null : parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Không có" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không có</SelectItem>
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
                                Hủy
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editDivision} onOpenChange={() => setEditDivision(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Division</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin division.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitEdit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Tên</Label>
                                <Input id="edit-name" className="col-span-3" {...register('name', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name_local" className="text-right">Tên Local</Label>
                                <Input id="edit-name_local" className="col-span-3" {...register('name_local', { required: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-level" className="text-right">Level</Label>
                                <Input id="edit-level" type="number" className="col-span-3" {...register('level', { valueAsNumber: true })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-code" className="text-right">Mã</Label>
                                <Input id="edit-code" className="col-span-3" {...register('code')} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Quốc gia</Label>
                                <Select
                                    value={formCountryId?.toString() || ''}
                                    onValueChange={(val) => setValue('country_id', parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn quốc gia" />
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
                                <Label className="text-right">Parent</Label>
                                <Select
                                    value={watch('parent_id')?.toString() || 'none'}
                                    onValueChange={(val) => setValue('parent_id', val === 'none' ? null : parseInt(val))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Không có" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không có</SelectItem>
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
                                <Label className="text-right pt-2">Hình ảnh</Label>
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
                                        {uploadingImage ? 'Đang upload...' : 'Upload hình ảnh'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDivision(null)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Division sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
