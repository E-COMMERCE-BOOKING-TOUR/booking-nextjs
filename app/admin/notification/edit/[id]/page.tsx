"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminNotificationApi from '@/apis/adminNotification';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    Save,
    Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { TargetGroup, NotificationType, INotification } from '@/types/notification';

interface NotificationFormValues {
    title: string;
    description: string;
    type: NotificationType;
    target_group: TargetGroup;
    user_ids_str: string;
    is_error: boolean;
}

export default function AdminNotificationEditPage() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const queryClient = useQueryClient();

    const { data: detailData, isLoading: isDetailLoading } = useQuery({
        queryKey: ['admin-notification-detail', id, token],
        queryFn: () => adminNotificationApi.getById(token!, id),
        enabled: !!token && !!id,
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<NotificationFormValues>({
        defaultValues: {
            title: '',
            description: '',
            type: NotificationType.update,
            target_group: TargetGroup.all,
            user_ids_str: '',
            is_error: false,
        }
    });

    useEffect(() => {
        if (detailData?.data) {
            reset({
                title: detailData.data.title,
                description: detailData.data.description,
                type: detailData.data.type as NotificationType,
                target_group: detailData.data.target_group as TargetGroup,
                is_error: detailData.data.is_error,
                user_ids_str: detailData.data.user_ids?.join(', ') || ''
            });
        }
    }, [detailData?.data, reset]);

    const targetGroup = useWatch({ control, name: 'target_group' });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<INotification>) => adminNotificationApi.update(token!, id, data),
        onSuccess: (res) => {
            if (res.ok) {
                toast.success('Notification updated successfully');
                queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
                queryClient.invalidateQueries({ queryKey: ['admin-notification-detail', id] });
                router.push('/admin/notification');
            } else {
                toast.error(res.error || 'Error updating notification');
            }
        },
        onError: (error: unknown) => {
            toast.error((error as Error)?.message || 'System error');
        }
    });

    const onSubmit = (values: NotificationFormValues) => {
        const payload: Partial<INotification> = {
            title: values.title,
            description: values.description,
            type: values.type,
            target_group: values.target_group,
            is_error: values.is_error,
            is_user: values.target_group === TargetGroup.specific,
        };

        if (values.target_group === TargetGroup.specific) {
            if (values.user_ids_str) {
                payload.user_ids = values.user_ids_str.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            } else {
                payload.user_ids = [];
            }
        }

        updateMutation.mutate(payload);
    };

    if (isDetailLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="rounded-full border border-white/10">
                    <Link href="/admin/notification"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-foreground">Edit Notification #{id}</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">
                        Update content or target audience of this notification.
                    </p>
                </div>
            </div>

            <form key={detailData?.data?.id} onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Bell className="size-5 text-primary" />
                                    Notification Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter notification title..."
                                        className="bg-white/5 border-white/10"
                                        {...register('title', { required: 'Title is required' })}
                                    />
                                    {errors.title && <span className="text-xs text-rose-500">{errors.title.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter detailed description..."
                                        rows={5}
                                        className="bg-white/5 border-white/10"
                                        {...register('description', { required: 'Description is required' })}
                                    />
                                    {errors.description && <span className="text-xs text-rose-500">{errors.description.message}</span>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                            <CardHeader className="border-b border-white/5">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Save className="size-5 text-primary" />
                                    Delivery Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Controller
                                            name="type"
                                            control={control}
                                            rules={{ required: 'Please select notification type' }}
                                            render={({ field }) => (
                                                <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-white/5 border-white/10">
                                                        <SelectValue placeholder="Select notification type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(NotificationType).map((type) => (
                                                            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.type && <span className="text-xs text-rose-500">{errors.type.message}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target Audience</Label>
                                        <Controller
                                            name="target_group"
                                            control={control}
                                            rules={{ required: 'Please select target audience' }}
                                            render={({ field }) => (
                                                <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-white/5 border-white/10">
                                                        <SelectValue placeholder="Select audience" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={TargetGroup.all}>All Users</SelectItem>
                                                        <SelectItem value={TargetGroup.admin}>Admin Only</SelectItem>
                                                        <SelectItem value={TargetGroup.supplier}>Supplier Only</SelectItem>
                                                        <SelectItem value={TargetGroup.specific}>Specific Users</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.target_group && <span className="text-xs text-rose-500">{errors.target_group.message}</span>}
                                    </div>
                                </div>

                                {targetGroup === TargetGroup.specific && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="user_ids_str">User IDs (comma separated)</Label>
                                        <Input
                                            id="user_ids_str"
                                            placeholder="e.g. 1, 2, 5, 10"
                                            className="bg-white/5 border-white/10"
                                            {...register('user_ids_str')}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name="is_error"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="is_error"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <Label htmlFor="is_error" className="cursor-pointer">This is a critical error/warning notification</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-white/5 bg-primary/10 border-primary/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 font-bold"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-white/10"
                                    asChild
                                >
                                    <Link href="/admin/notification">Cancel</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
