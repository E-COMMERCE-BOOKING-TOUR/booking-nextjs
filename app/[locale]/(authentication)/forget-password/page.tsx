"use client";

import authApi from "@/apis/auth";
import { toaster } from "@/components/chakra/toaster";
import { ForgotPasswordSchema } from "@/schemas";
import {
    Box,
    Button,
    Center,
    Field,
    Heading,
    Input,
    Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import * as z from "zod";

export default function ForgetPasswordPage() {
    const [isLoading, startTransition] = useTransition();
    const {
        formState: { errors },
        handleSubmit,
        register,
    } = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
        startTransition(async () => {
            try {
                const response = await authApi.forgotPassword(values.email);
                toaster.create({
                    description: response.message ? t(response.message, { defaultValue: response.message as string }) : t('request_sent_success', { defaultValue: "Request sent successfully!" }),
                    type: "success",
                });
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : t('recovery_failed', { defaultValue: "An error occurred during password recovery" });
                toaster.create({
                    description: t(message, { defaultValue: message }),
                    type: "error",
                });
            }
        });
    };

    const t = useTranslations('common');

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
                        {t('forgot_password_title', { defaultValue: "Forgot Password?" })}
                    </Heading>
                    <Heading color="gray.500" fontSize="md" fontWeight="medium">
                        {t('forgot_password_desc', { defaultValue: "Enter your email to receive recovery instructions" })}
                    </Heading>
                </Stack>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={6}>
                        <Field.Root invalid={!!errors.email}>
                            <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('email_address_label', { defaultValue: "Email Address" })}</Field.Label>
                            <Input
                                variant="subtle"
                                bg="gray.50"
                                _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                                px={4}
                                py={6}
                                rounded="xl"
                                placeholder={t('email_placeholder', { defaultValue: "email@example.com" })}
                                {...register("email")}
                            />
                            <Field.ErrorText>{errors.email?.message && t(errors.email.message as string)}</Field.ErrorText>
                        </Field.Root>

                        <Button
                            type="submit"
                            w="100%"
                            py={7}
                            rounded="xl"
                            bg="gray.900"
                            color="white"
                            _hover={{ bg: "black", shadow: "lg" }}
                            transition="all 0.2s"
                            fontWeight="bold"
                            fontSize="md"
                            loading={isLoading}
                        >
                            {t('send_request_button', { defaultValue: "SEND REQUEST" })}
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
