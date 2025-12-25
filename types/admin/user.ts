export interface IAdminUser {
    id: number;
    uuid: string;
    username: string;
    full_name: string;
    email: string;
    phone: string;
    status: number;
    login_type: number;
    created_at: string;
    updated_at: string;
    supplier?: {
        id: number;
        name: string;
    } | null;
    role?: {
        id: number;
        name: string;
    } | null;
    country?: {
        id: number;
        name: string;
    } | null;
}

export interface ICreateUserPayload {
    username: string;
    password?: string;
    full_name: string;
    email?: string;
    phone?: string;
    status: number;
    login_type: number;
    country_id?: number;
    supplier_id?: number;
    role_id?: number;
}
