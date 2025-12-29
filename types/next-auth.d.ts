
import { IUserAuth } from "./response/auth.type"

declare module "next-auth" {
    interface Session {
        user: IUserAuth & {
            accessToken?: string
            refreshToken?: string
            accessTokenExpires?: number
            error?: string
        }
    }

    export interface User extends IUserAuth {
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
        error?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT extends IUserAuth {
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
        error?: string
    }
}