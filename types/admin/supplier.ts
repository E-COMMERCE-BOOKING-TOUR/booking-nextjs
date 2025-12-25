export interface IAdminSupplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    user_count?: number;
    tour_count?: number;
}

export interface ICreateSupplierPayload {
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
}
