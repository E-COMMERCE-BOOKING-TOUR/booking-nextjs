export interface IResponseAuth {
    token: {
        access_token: string;
        refresh_token: string;
    };
    message?: string;
    error?: boolean;
}

export interface IResponseAuthLogout {
    error: boolean,
    message: string,
}

export interface IUserAuth {
    id: number,
    uuid: string,
    username: string,
    full_name: string,
    name?: string,
    email: string,
    phone?: string,
    role: {
        id: number;
        name: string,
        desciption: string,
        permissions: {
            permission_name: string,
            description: string
        }[]
    }
}