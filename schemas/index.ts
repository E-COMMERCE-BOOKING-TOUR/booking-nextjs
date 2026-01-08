import * as z from "zod";

export const LoginSchema = z.object({
    username: z.string().min(5, "username_min").regex(/^\S+$/, "username_no_spaces"),
    password: z.string().min(8, "password_min"),
    remember: z.boolean().default(true),
})

// Schema for NextAuth credentials validation (no remember field, accepts string guest_id)
export const CredentialsSchema = z.object({
    username: z.string().min(5),
    password: z.string().min(8),
})

export const RegisterSchema = z.object({
    username: z.string().min(5, "username_min").regex(/^\S+$/, "username_no_spaces"),
    password: z.string().min(8, "password_min"),
    confirmPassword: z.string().min(8, "password_min"),
    full_name: z.string().min(2, "full_name_min"),
    email: z.string().email("invalid_email"),
    phone: z.string().optional().refine(val => !val || /^\+?\d{1,15}$/.test(val), {
        message: "phone_invalid_format"
    }),
    acceptedTerms: z.boolean().refine(val => val === true, {
        message: "agree_terms_required"
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "passwords_dont_match",
    path: ["confirmPassword"],
});

export const ResetPasswordSchema = z.object({
    password: z.string().min(8, "password_min"),
    confirmPassword: z.string().min(8, "password_min"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "passwords_dont_match",
    path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const CommentSchema = z.object({
    message: z.string().min(1).max(5000)
})

export const ChangePasswordSchema = z.object({
    current_password: z.string().min(8),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine(
    (values) => {
        return values.password === values.confirmPassword;
    },
    {
        message: "Xác nhận mật khẩu không khớp!",
        path: ["confirmPassword"],
    }
);

export const CreateCategorySchema = z.object({
    name: z.string().min(1).max(5000),
    description: z.string()
});

export const ChangeInfoSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).nullable().optional()
});

export const CreateMovieSchema = z.object({
    movie_name: z.string().min(1).max(5000),
    movie_name_other: z.string().min(1).max(5000),
    release: z.string().min(1),
    status: z.boolean(),
    categories: z.array(z.string()),
    episodes_counter: z.number().min(1),
    description: z.string().min(1),
    banner_image: z.array(z.union([z.instanceof(File), z.string()])).nonempty(),
    movie_image: z.array(z.union([z.instanceof(File), z.string()])).nonempty(),
});
