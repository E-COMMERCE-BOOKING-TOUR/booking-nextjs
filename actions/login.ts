"use server";

import { signIn } from '@/libs/auth/auth';
import { LoginSchema } from '@/schemas';
import { AuthError } from 'next-auth';
import * as z from 'zod';

export const login = async (values: z.infer<typeof LoginSchema>, guestId?: string) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { message: 'Thông tin không hợp lệ', type: 'error' }
    }
    const { username, password } = validatedFields.data;
    try {
        await signIn("credentials", {
            username,
            password,
            guest_id: guestId,
            redirect: false,
        });

        // Return success before redirect so toast can show
        return { message: "Đăng nhập thành công!", type: "success", shouldRedirect: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { message: "Tài khoản hoặc mật khẩu không đúng!", type: "error" };
                default:
                    return { message: "Đã xảy ra lỗi. Vui lòng thử lại!", type: "error" };
            }
        }
        throw error;
    }
}