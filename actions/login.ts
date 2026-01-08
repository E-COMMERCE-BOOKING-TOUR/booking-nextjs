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

        // Return success before redirect so toast can show
        return { message: "login_success", type: "success", shouldRedirect: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { message: "invalid_credentials", type: "error" };
                default:
                    return { message: "login_failed", type: "error" };
            }
        }
        throw error;
    }
}