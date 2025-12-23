export enum NotificationType {
    welcome = 'welcome',
    feature = 'feature',
    promotion = 'promotion',
    payment = 'payment',
    booking = 'booking',
    reminder = 'reminder',
    review = 'review',
    recommendation = 'recommendation',
    profile = 'profile',
    alert = 'alert',
    update = 'update',
    reward = 'reward',
    maintenance = 'maintenance',
    policy = 'policy',
}

export enum TargetGroup {
    all = 'all',
    admin = 'admin',
    supplier = 'supplier',
    specific = 'specific',
}

export interface INotification {
    id: number;
    title: string;
    description: string;
    type: NotificationType;
    is_error: boolean;
    is_user: boolean;
    target_group: TargetGroup;
    user_ids: number[];
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface IPaginatedNotifications {
    data: INotification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
