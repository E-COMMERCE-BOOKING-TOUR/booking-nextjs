"use server";

import { signIn } from '@/libs/auth/auth';
import { LoginSchema } from '@/schemas';
import { AuthError } from 'next-auth';
import * as z from 'zod';

export const login = async (values: z.input<typeof LoginSchema>, guestId?: string) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { message: 'invalid_info', type: 'error' }
    }
    const { username, password, remember } = validatedFields.data;
    try {
        await signIn("credentials", {
            username,
            password,
            remember: remember ? "true" : "false",
            guest_id: guestId,
            redirect: false,
        });

        return { message: "login_success", type: "success" };
    } catch (error) {
        if (error instanceof AuthError) {
            // Try to extract the actual error message from the cause
            const cause = (error as any).cause;
            if (cause?.err?.message) {
                return { message: cause.err.message, type: "error" };
            }
            switch (error.type) {
                case "CredentialsSignin":
                    return { message: "Tài khoản hoặc mật khẩu không đúng!", type: "error" };
                default:
                    return { message: "login_failed", type: "error" };
            }
        }
        // Handle Error thrown from authorize
        if (error instanceof Error) {
            return { message: error.message, type: "error" };
        }
        throw error;
    }
}
