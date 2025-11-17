"use server"

import { signOut } from "@/libs/auth/auth"

export const logout = async () => {
    await signOut({ redirectTo: "/" })
}

