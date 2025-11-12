import NextAuth from "next-auth"
import { IUserAuth } from "./response/auth.type"

declare module "next-auth" {
    interface Session {
        user: IUserAuth & {
            token?: string
        }
    }

    export interface User extends IUserAuth {
        token?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT extends IUserAuth {
        token?: string
    }
}