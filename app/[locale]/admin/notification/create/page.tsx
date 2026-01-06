"use client";

import { useMutation } from '@tanstack/react-query';
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
    Send,
    Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { TargetGroup, NotificationType, INotification } from '@/types/notification';

interface NotificationFormValues {
    title: string;
    description: string;
    type: NotificationType;
    target_group: TargetGroup;
    user_ids_str: string;
    is_error: boolean;
}

export default function AdminNotificationCreatePage() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const router = useRouter();

    const { register, handleSubmit, control, formState: { errors } } = useForm<NotificationFormValues>({
        defaultValues: {
            type: NotificationType.update,
            target_group: TargetGroup.all,
            is_error: false,
        }
    });

    const targetGroup = useWatch({ control, name: 'target_group' });

    const createMutation = useMutation({
        mutationFn: (data: Partial<INotification>) => adminNotificationApi.create(token!, data),
        onSuccess: (res) => {
            if (res.ok) {
                toast.success('Notification created successfully');
                router.push('/admin/notification');
            } else {
                toast.error(res.error || 'Error creating notification');
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

        if (values.target_group === TargetGroup.specific && values.user_ids_str) {
            payload.user_ids = values.user_ids_str.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (payload.user_ids.length === 0) {
                toast.error('Please enter valid user IDs');
                return;
            }
        }

        createMutation.mutate(payload);
    };

    return (
        <div className="flex flex-col gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="rounded-full border border-white/10">
                    <Link href="/admin/notification"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-foreground">Create New Notification</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">
                        Send new notifications to target groups in the system.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
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
                                    <Send className="size-5 text-primary" />
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
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                        <p className="text-[10px] text-muted-foreground italic">Enter list of user IDs you want to send this notification to.</p>
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
                        <Card className="border-white/5 bg-primary/5 border-primary/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 font-bold"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Processing...' : 'Send Notification'}
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

                        <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Note</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                                <p>• Notifications will be displayed immediately after delivery.</p>
                                <p>• If selecting <span className="text-primary font-bold">All Users</span>, everyone in the system will receive this notification.</p>
                                <p>• Use error notifications for critical updates or system maintenance.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
