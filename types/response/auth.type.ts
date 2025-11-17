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
    uuid: string,
    username: string,
    name: string,
    email: string,
    role: {
        name: string,
        desciption: string,
        // permissions: {
        //     permission_name: string,
        //     description: string
        // }[]
    }
}