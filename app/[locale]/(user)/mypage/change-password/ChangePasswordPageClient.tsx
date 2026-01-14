"use client";

import {
    VStack,
    Heading,
    Button,
    Box,
    HStack,
    Text,
    Input,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { userApi } from "@/apis/user";
import { toaster } from "@/components/chakra/toaster";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { FiShield } from "react-icons/fi";

interface ChangePasswordFormData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

import { useTranslations, useLocale } from "next-intl";

export default function ChangePasswordPageClient() {
    const t = useTranslations('common');
    const locale = useLocale();
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<ChangePasswordFormData>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: ChangePasswordFormData) => {
            if (!token) throw new Error("No token");
            return await userApi.changePassword(token, {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
        },
        onSuccess: () => {
            toaster.create({
                title: t('password_changed_success', { defaultValue: 'Password changed successfully' }),
                type: "success",
            });
            reset();
        },
        onError: (error: Error) => {
            toaster.create({
                title: t('change_password_failed', { defaultValue: 'Change password failed' }),
                description: error.message,
                type: "error",
            });
        }
    });

    const onSubmit = (data: ChangePasswordFormData) => {
        mutation.mutate(data);
    };

    return (
        <VStack align="stretch" gap={4}>
            <VStack align="start" gap={1}>
                <Heading fontSize="lg" fontWeight="bold" textTransform="uppercase">{t('security_title', { defaultValue: 'Security' })}</Heading>
                <Text color="gray.500" fontSize="sm">{t('security_desc', { defaultValue: 'Protect your account by regularly updating your password' })}</Text>
            </VStack>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack align="stretch" gap={8}>
                    {/* Password Fields Card */}
                    <Box p={8} bg="blue.50" rounded="3xl" border="1px" borderColor="blue.100" shadow="sm">
                        <HStack mb={6} color="blue.700">
                            <FiShield size={18} />
                            <Text fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest">{t('update_password_title', { defaultValue: 'Update Password' })}</Text>
                        </HStack>
                        <VStack align="stretch" gap={6}>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="blue.800" ml={1}>{t('current_password_label', { defaultValue: 'Current Password' })}</Text>
                                <Input
                                    {...register("oldPassword", { required: t('current_password_required', { defaultValue: "Current password is required" }) })}
                                    type="password"
                                    placeholder={t('current_password_placeholder', { defaultValue: "Enter your current password" })}
                                    bg="white"
                                    border="1px"
                                    borderColor="blue.200"
                                    _focus={{ bg: "white", shadow: "md", ring: "2px", ringColor: "blue.300", borderColor: "blue.300" }}
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                />
                                {errors.oldPassword && <Text color="red.500" fontSize="xs" ml={1}>{errors.oldPassword.message as string}</Text>}
                            </VStack>

                            <Box h="1px" bg="blue.100" />

                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="blue.800" ml={1}>{t('new_password_label', { defaultValue: 'New Password' })}</Text>
                                <Input
                                    {...register("newPassword", {
                                        required: t('new_password_required', { defaultValue: "New password is required" }),
                                        minLength: { value: 8, message: t('password_min_length', { defaultValue: "Password must be at least 8 characters" }) }
                                    })}
                                    type="password"
                                    placeholder={t('new_password_placeholder', { defaultValue: "Enter your new password" })}
                                    bg="white"
                                    border="1px"
                                    borderColor="blue.200"
                                    _focus={{ bg: "white", shadow: "md", ring: "2px", ringColor: "blue.300", borderColor: "blue.300" }}
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                />
                                {errors.newPassword && <Text color="red.500" fontSize="xs" ml={1}>{errors.newPassword.message as string}</Text>}
                            </VStack>

                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="blue.800" ml={1}>{t('confirm_new_password_label', { defaultValue: 'Confirm New Password' })}</Text>
                                <Input
                                    {...register("confirmPassword", {
                                        required: t('confirm_password_required', { defaultValue: "Please confirm your new password" }),
                                        validate: (value) => value === getValues("newPassword") || t('passwords_no_match', { defaultValue: "Passwords do not match" })
                                    })}
                                    type="password"
                                    placeholder={t('confirm_password_placeholder', { defaultValue: "Confirm your new password" })}
                                    bg="white"
                                    border="1px"
                                    borderColor="blue.200"
                                    _focus={{ bg: "white", shadow: "md", ring: "2px", ringColor: "blue.300", borderColor: "blue.300" }}
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                />
                                {errors.confirmPassword && <Text color="red.500" fontSize="xs" ml={1}>{errors.confirmPassword.message as string}</Text>}
                            </VStack>
                        </VStack>
                    </Box>

                    <Button
                        type="submit"
                        bg="blue.600"
                        color="white"
                        size="lg"
                        h="65px"
                        rounded="2xl"
                        fontWeight="black"
                        loading={mutation.isPending}
                        _hover={{ bg: "blue.700", shadow: "xl" }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.3s"
                    >
                        {t('change_password_button', { defaultValue: 'Change Password' })}
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
}
