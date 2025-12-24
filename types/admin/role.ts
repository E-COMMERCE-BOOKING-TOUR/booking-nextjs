import { IAdminPermission } from "./permission";

export interface IAdminRole {
    id: number;
    name: string;
    desciption: string;
    created_at: string;
    updated_at: string;
    permissions: IAdminPermission[];
    users?: unknown[]; // Simplified for count
}

export interface ICreateRolePayload {
    name: string;
    desciption: string;
    permission_ids?: number[];
}
