"use client";

import authApi from "@/apis/auth";
import { toaster } from "@/components/chakra/toaster";
import { ResetPasswordSchema } from "@/schemas";
import {
    Box,
    Button,
    Heading,
    Input,
    Stack,
    Field,
    Center,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import * as z from "zod";

export default function ResetPasswordPage() {
    const t = useTranslations('common');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, startTransition] = useTransition();

    const token = searchParams.get("token");

    const {
        formState: { errors },
        handleSubmit,
        register,
    } = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    });

    useEffect(() => {
        if (!token) {
            toaster.create({
                description: t('reset_token_missing', { defaultValue: "Reset token is missing!" }),
                type: "error",
            });
            router.push("/user-login");
        }
    }, [token, router, t]);

    const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
        if (!token) return;

        startTransition(async () => {
            try {
                const response = await authApi.resetPassword(token, values.password);
                toaster.create({
                    description: response.message ? t(response.message, { defaultValue: response.message as string }) : t('reset_password_success', { defaultValue: "Password reset successfully!" }),
                    type: "success",
                });
                router.push("/user-login");
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : t('reset_failed', { defaultValue: "An error occurred during password reset" });
                toaster.create({
                    description: t(message, { defaultValue: message }),
                    type: "error",
                });
            }
        });
    };

    if (!token) return null;

    return (
        <Box
            minH="70vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            py={10}
        >
            <Stack
                bg="white"
                rounded="3xl"
                p={{ base: 6, sm: 8, md: 10 }}
                gap={6}
                maxW="md"
                w="100%"
                shadow="2xl"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                zIndex={1}
            >
                <Stack gap={2} textAlign="center" mb={4}>
                    <Heading
                        color="gray.900"
                        fontSize="3xl"
                        fontWeight="black"
                        letterSpacing="tight"
                    >
                        {t('reset_password_title', { defaultValue: "Reset Password" })}
                    </Heading>
                    <Heading color="gray.500" fontSize="md" fontWeight="medium">
                        {t('reset_password_desc', { defaultValue: "Enter your new password below" })}
                    </Heading>
                </Stack>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={6}>
                        <Field.Root invalid={!!errors.password}>
                            <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">
                                {t('new_password_label', { defaultValue: "New Password" })}
                            </Field.Label>
                            <Input
                                type="password"
                                variant="subtle"
                                bg="gray.50"
                                _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                                px={4}
                                py={6}
                                rounded="xl"
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            <Field.ErrorText>{errors.password?.message && t(errors.password.message as string)}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.confirmPassword}>
                            <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">
                                {t('confirm_new_password_label', { defaultValue: "Confirm Password" })}
                            </Field.Label>
                            <Input
                                type="password"
                                variant="subtle"
                                bg="gray.50"
                                _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                                px={4}
                                py={6}
                                rounded="xl"
                                placeholder="••••••••"
                                {...register("confirmPassword")}
                            />
                            <Field.ErrorText>{errors.confirmPassword?.message && t(errors.confirmPassword.message as string)}</Field.ErrorText>
                        </Field.Root>

                        <Button
                            type="submit"
                            w="100%"
                            py={7}
                            rounded="xl"
                            bg="gray.900"
                            color="white"
                            _hover={{ bg: "black", shadow: "lg", transform: "translateY(-2px)" }}
                            transition="all 0.2s"
                            fontWeight="bold"
                            fontSize="md"
                            loading={isLoading}
                        >
                            {t('reset_password_button', { defaultValue: "Reset Password" })}
                        </Button>
                    </Stack>
                </form>

                <Center mt={2}>
                    <Link href="/user-login">
                        <Box as="span" color="gray.600" fontSize="sm" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                            {t('back_to_login', { defaultValue: "Back to login" })}
                        </Box>
                    </Link>
                </Center>
            </Stack>

            {/* Decorative background elements */}
            <Box
                position="absolute"
                top="0"
                left="10%"
                w="250px"
                h="250px"
                bg="blue.50"
                rounded="full"
                filter="blur(70px)"
                opacity={0.5}
                zIndex={0}
            />
            <Box
                position="absolute"
                bottom="0"
                right="10%"
                w="250px"
                h="250px"
                bg="purple.50"
                rounded="full"
                filter="blur(70px)"
                opacity={0.5}
                zIndex={0}
            />
        </Box>
    );
}
