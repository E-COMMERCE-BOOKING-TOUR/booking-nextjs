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
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { userApi } from "@/apis/user";
import { toaster } from "@/components/chakra/toaster";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiUser, FiLock } from "react-icons/fi";

interface ProfileFormData {
    username: string;
    full_name: string;
    phone: string;
    email: string;
    oldPassword: string;
}

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const queryClient = useQueryClient();
    const token = session?.user?.accessToken;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
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
                full_name: data.full_name,
                phone: data.phone,
                oldPassword: data.oldPassword,
            };
            return await userApi.updateProfile(token, updateData);
        },
        onSuccess: async () => {
            toaster.create({
                title: "Profile updated successfully",
                type: "success",
            });
            await updateSession();
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            reset({ oldPassword: "" }, { keepValues: true });
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Update failed",
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
                <Heading fontSize="lg" fontWeight="bold" textTransform="uppercase">Profile Settings</Heading>
                <Text color="gray.500" fontSize="sm">Manage your personal information and account preferences</Text>
            </VStack>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack align="stretch" gap={8}>
                    {/* Basic Information Section */}
                    <Box>
                        <HStack mb={6} color="blue.600">
                            <FiUser size={18} />
                            <Text fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Basic Information</Text>
                        </HStack>
                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>Username (Protected)</Text>
                                <Input
                                    {...register("username")}
                                    placeholder="Username"
                                    readOnly
                                    bg="gray.100"
                                    border="none"
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                    cursor="not-allowed"
                                    color="gray.500"
                                />
                            </VStack>

                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>Full Name</Text>
                                <Input
                                    {...register("full_name", { required: "Full name is required" })}
                                    placeholder="Full Name"
                                    bg="gray.50"
                                    border="none"
                                    _focus={{ bg: "white", shadow: "sm", ring: "2px", ringColor: "blue.100" }}
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                />
                                {errors.full_name && <Text color="red.500" fontSize="xs" ml={1}>{errors.full_name.message}</Text>}
                            </VStack>

                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>Phone Number</Text>
                                <Input
                                    {...register("phone")}
                                    placeholder="Phone Number"
                                    bg="gray.50"
                                    border="none"
                                    _focus={{ bg: "white", shadow: "sm", ring: "2px", ringColor: "blue.100" }}
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                />
                                {errors.phone && <Text color="red.500" fontSize="xs" ml={1}>{errors.phone.message}</Text>}
                            </VStack>

                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>Email Address (Protected)</Text>
                                <Input
                                    {...register("email")}
                                    placeholder="Email"
                                    readOnly
                                    bg="gray.100"
                                    border="none"
                                    rounded="2xl"
                                    h="55px"
                                    px={5}
                                    cursor="not-allowed"
                                    color="gray.500"
                                />
                            </VStack>
                        </Grid>
                    </Box>

                    <Box h="1px" bg="gray.100" />

                    {/* Security Section */}
                    <Box p={8} bg="orange.50" rounded="3xl" border="1px" borderColor="orange.100" shadow="sm">
                        <HStack mb={5} color="orange.700">
                            <FiLock size={18} />
                            <Text fontWeight="black" fontSize="xs" textTransform="uppercase" letterSpacing="widest">Security Verification</Text>
                        </HStack>
                        <VStack align="stretch" gap={3}>
                            <Text fontSize="xs" fontWeight="bold" color="orange.800" ml={1}>Current Password</Text>
                            <Input
                                {...register("oldPassword", { required: "Current password is required to save changes" })}
                                type="password"
                                placeholder="Enter your current password to confirm changes"
                                bg="white"
                                border="1px"
                                borderColor="orange.200"
                                _focus={{ ring: "2px", ringColor: "orange.300", borderColor: "orange.300" }}
                                rounded="2xl"
                                h="55px"
                                px={5}
                            />
                            {errors.oldPassword && <Text color="red.500" fontSize="xs" ml={1}>{errors.oldPassword.message}</Text>}
                            <Text fontSize="10px" color="orange.600" ml={1} fontWeight="medium">
                                We require your password to ensure it's really you making these changes.
                            </Text>
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
                        Update My Profile
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
}
