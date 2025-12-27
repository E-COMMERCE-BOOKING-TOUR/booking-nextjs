"use client";

import {
    VStack,
    Heading,
    Button,
    Stack,
    Box,
    Grid,
    Spinner,
    HStack,
    Text,
    Input,
    Icon,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { userApi } from "@/apis/user";
import { toaster } from "@/components/chakra/toaster";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiUser, FiLock, FiAlertCircle } from "react-icons/fi";

interface ProfileFormData {
    username: string;
    full_name: string; // Keep original field name for API, but use 'fullName' in form
    phone: string; // Keep original field name for API, but use 'phoneNumber' in form
    email: string;
    oldPassword: string; // Keep original field name for API, but use 'password' in form
}

import { useTranslation } from "@/libs/i18n/client";
import { useSearchParams } from "next/navigation";

export default function SettingsPageClient({ lng }: { lng: string }) { // Changed component name
    const searchParams = useSearchParams();
    const { t } = useTranslation(lng);
    const { data: session, update: updateSession } = useSession();
    const queryClient = useQueryClient();
    const token = session?.user?.accessToken;

    const { register, handleSubmit, reset, formState: { errors }, resetField } = useForm<ProfileFormData>({ // Added resetField
        defaultValues: {
            username: "",
            full_name: "",
            phone: "",
            email: "",
            oldPassword: "",
        }
    });

    const { data: userProfile, isLoading: isFetching } = useQuery({
        queryKey: ["user-profile", token],
        queryFn: async () => {
            if (!token) return null;
            return await userApi.info(token);
        },
        enabled: !!token,
    });

    useEffect(() => {
        if (userProfile) {
            reset({
                username: userProfile.username || "",
                full_name: userProfile.full_name || "",
                phone: userProfile.phone || "",
                email: userProfile.email || "",
                oldPassword: "",
            });
        }
    }, [userProfile, reset]);

    const mutation = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            if (!token) throw new Error("No token");
            const updateData: Record<string, unknown> = {
                full_name: data.full_name, // Use original field name for API
                phone: data.phone, // Use original field name for API
                oldPassword: data.oldPassword, // Use original field name for API
            };
            return await userApi.updateProfile(token, updateData);
        },
        onSuccess: async () => {
            await updateSession(); // Moved this line up as per instruction
            toaster.create({
                title: t('profile_updated_success', { defaultValue: 'Profile updated successfully' }), // Translated
                type: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["user-profile"] }); // Kept this line
            resetField("oldPassword"); // Changed to resetField for password
        },
        onError: (error: Error) => {
            toaster.create({
                title: t('update_failed', { defaultValue: 'Update failed' }), // Translated
                description: error.message,
                type: "error",
            });
        }
    });

    const onSubmit = (data: ProfileFormData) => {
        mutation.mutate(data);
    };

    if (isFetching) return <Spinner color="blue.500" mx="auto" display="block" my={10} />;

    return (
        <VStack align="stretch" gap={4}>
            <VStack align="start" gap={1}>
                <Heading fontSize="lg" fontWeight="bold" textTransform="uppercase">{t('profile_settings_title', { defaultValue: 'Profile Settings' })}</Heading>
                <Text color="gray.500" fontSize="sm">{t('profile_settings_desc', { defaultValue: 'Manage your personal information and account preferences' })}</Text>
            </VStack>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack align="stretch" gap={8}>
                    {/* Basic Info Card */}
                    <Box p={8} bg="white" rounded="3xl" border="1px" borderColor="gray.100" shadow="sm">
                        <HStack mb={6} color="blue.600">
                            <FiUser size={18} />
                            <Text fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest">{t('basic_info_title', { defaultValue: 'Basic Information' })}</Text>
                        </HStack>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>{t('username_label_protected', { defaultValue: 'Username (Protected)' })}</Text>
                                <Input
                                    value={session?.user?.username || ''} // Changed to value from session
                                    disabled // Changed to disabled
                                    cursor="not-allowed"
                                    bg="gray.50"
                                    borderStyle="dashed" // Changed border style
                                    rounded="2xl"
                                    h="50px" // Changed height
                                    px={5}
                                    color="gray.500"
                                />
                            </VStack>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="blue.800" ml={1}>{t('full_name_label', { defaultValue: 'Full Name' })}</Text>
                                <Input
                                    {...register("full_name", { required: t('full_name_required', { defaultValue: "Full name is required" }) })} // Changed field name and translated error
                                    placeholder={t('full_name_placeholder', { defaultValue: "Full Name" })} // Translated placeholder
                                    bg="white"
                                    border="1px"
                                    borderColor="gray.200"
                                    _focus={{ bg: "white", shadow: "md", ring: "2px", ringColor: "blue.100", borderColor: "blue.300" }} // Updated focus styles
                                    rounded="2xl"
                                    h="50px" // Changed height
                                    px={5}
                                />
                                {errors.full_name && <Text color="red.500" fontSize="xs" ml={1}>{errors.full_name.message}</Text>}
                            </VStack>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="blue.800" ml={1}>{t('phone_label_caps', { defaultValue: 'Phone Number' })}</Text>
                                <Input
                                    {...register("phone", { required: t('phone_required', { defaultValue: "Phone number is required" }) })} // Changed field name and translated error
                                    placeholder={t('phone_placeholder', { defaultValue: "Phone Number" })} // Translated placeholder
                                    bg="white"
                                    border="1px"
                                    borderColor="gray.200"
                                    _focus={{ bg: "white", shadow: "md", ring: "2px", ringColor: "blue.100", borderColor: "blue.300" }} // Updated focus styles
                                    rounded="2xl"
                                    h="50px" // Changed height
                                    px={5}
                                />
                                {errors.phone && <Text color="red.500" fontSize="xs" ml={1}>{errors.phone.message}</Text>}
                            </VStack>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>{t('email_label_protected', { defaultValue: 'Email Address (Protected)' })}</Text>
                                <Input
                                    value={session?.user?.email || ''} // Changed to value from session
                                    disabled // Changed to disabled
                                    cursor="not-allowed"
                                    bg="gray.50"
                                    borderStyle="dashed" // Changed border style
                                    rounded="2xl"
                                    h="50px" // Changed height
                                    px={5}
                                    color="gray.500"
                                />
                            </VStack>
                        </Grid>
                    </Box>

                    {/* Sensitive Changes Verification */}
                    <Box p={8} bg="orange.50" rounded="3xl" border="1px" borderColor="orange.100" shadow="sm">
                        <HStack mb={6} color="orange.700">
                            <FiLock size={18} />
                            <Text fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest">{t('security_verification_title', { defaultValue: 'Security Verification' })}</Text>
                        </HStack>
                        <VStack align="stretch" gap={4}>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="orange.800" ml={1}>{t('current_password_required_save', { defaultValue: 'Current password is required to save changes' })}</Text>
                                <Input
                                    {...register("oldPassword", { required: t('current_password_placeholder_save', { defaultValue: "Current password is required to save changes" }) })} // Changed field name and translated error
                                    type="password"
                                    placeholder={t('current_password_placeholder_save', { defaultValue: "Enter your current password to confirm changes" })} // Translated placeholder
                                    bg="white"
                                    border="1px"
                                    borderColor="orange.200"
                                    _focus={{ bg: "white", shadow: "md", ring: "2px", ringColor: "orange.300", borderColor: "orange.300" }} // Updated focus styles
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                />
                                {errors.oldPassword && <Text color="red.500" fontSize="xs" ml={1}>{errors.oldPassword.message as string}</Text>}
                            </VStack>
                            <HStack align="start" gap={3} p={4} bg="white" rounded="xl" border="1px" borderColor="orange.100">
                                <Icon as={FiAlertCircle} color="orange.500" mt={1} />
                                <Text fontSize="sm" color="gray.600">
                                    {t('password_verification_notice', { defaultValue: "We require your password to ensure it's really you making these changes." })}
                                </Text>
                            </HStack>
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
                        _hover={{ bg: "blue.700", shadow: "xl", transform: "translateY(-2px)" }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.3s"
                    >
                        {t('update_profile_button', { defaultValue: 'Update My Profile' })}
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
}
