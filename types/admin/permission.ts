export interface IAdminPermission {
    id: number;
    permission_name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface ICreatePermissionPayload {
    permission_name: string;
    description: string;
}
