import NextAuth from "next-auth"
import { IUserAuth } from "./response/auth.type"

declare module "next-auth" {
    interface Session {
        user: IUserAuth & {
            accessToken?: string
        }
    }

    export interface User extends IUserAuth {
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT extends IUserAuth {
        accessToken?: string
    }
}