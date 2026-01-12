"use client";

import authApi from "@/apis/auth";
import { toaster } from "@/components/chakra/toaster";
import {
    Box,
    Heading,
    Stack,
    Text,
    Spinner,
    Center,
    Icon,
} from "@chakra-ui/react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
    const t = useTranslations('common');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<VerifyStatus>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage(t('verify_token_missing', { defaultValue: "Verification token is missing!" }));
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await authApi.verifyEmail(token);

                if (response.token) {
                    // Store tokens for auto-login
                    localStorage.setItem("access_token", response.token.access_token);
                    localStorage.setItem("refresh_token", response.token.refresh_token);

                    setStatus("success");
                    toaster.create({
                        description: t('verify_email_success', { defaultValue: "Email verified successfully!" }),
                        type: "success",
                    });

                    // Redirect to home after 2 seconds
                    setTimeout(() => {
                        router.push("/");
                    }, 2000);
                } else {
                    setStatus("success");
                    toaster.create({
                        description: response.message || t('verify_email_success', { defaultValue: "Email verified successfully!" }),
                        type: "success",
                    });
                    setTimeout(() => {
                        router.push("/user-login");
                    }, 2000);
                }
            } catch (error: unknown) {
                setStatus("error");
                const message = error instanceof Error ? error.message : t('verify_email_failed', { defaultValue: "Failed to verify email" });
                setErrorMessage(message);
                toaster.create({
                    description: message,
                    type: "error",
                });
            }
        };

        verifyEmail();
    }, [token, router, t]);

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
                textAlign="center"
            >
                {status === "loading" && (
                    <>
                        <Center>
                            <Spinner size="xl" color="blue.500" />
                        </Center>
                        <Heading color="gray.700" fontSize="xl" fontWeight="bold">
                            {t('verifying_email', { defaultValue: "Verifying your email..." })}
                        </Heading>
                        <Text color="gray.500">
                            {t('please_wait', { defaultValue: "Please wait a moment" })}
                        </Text>
                    </>
                )}

                {status === "success" && (
                    <>
                        <Center>
                            <Icon fontSize="6xl" color="green.500">
                                <FiCheckCircle />
                            </Icon>
                        </Center>
                        <Heading color="gray.900" fontSize="2xl" fontWeight="bold">
                            {t('email_verified_title', { defaultValue: "Email Verified!" })}
                        </Heading>
                        <Text color="gray.600">
                            {t('email_verified_desc', { defaultValue: "Your email has been verified successfully. You will be redirected shortly..." })}
                        </Text>
                    </>
                )}

                {status === "error" && (
                    <>
                        <Center>
                            <Icon fontSize="6xl" color="red.500">
                                <FiXCircle />
                            </Icon>
                        </Center>
                        <Heading color="gray.900" fontSize="2xl" fontWeight="bold">
                            {t('verification_failed_title', { defaultValue: "Verification Failed" })}
                        </Heading>
                        <Text color="gray.600">
                            {errorMessage}
                        </Text>
                        <Center mt={4}>
                            <Link href="/user-login">
                                <Box
                                    as="span"
                                    color="blue.600"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    _hover={{ textDecoration: "underline" }}
                                >
                                    {t('back_to_login', { defaultValue: "Back to login" })}
                                </Box>
                            </Link>
                        </Center>
                    </>
                )}
            </Stack>

            {/* Decorative background elements */}
            <Box
                position="absolute"
                top="0"
                left="10%"
                w="250px"
                h="250px"
                bg="green.50"
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
                bg="blue.50"
                rounded="full"
                filter="blur(70px)"
                opacity={0.5}
                zIndex={0}
            />
        </Box>
    );
}
