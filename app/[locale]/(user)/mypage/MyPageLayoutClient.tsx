"use client";

import {
    Container,
    Grid,
    GridItem,
    VStack,
    HStack,
    Box,
    Text,
    Icon,
    Heading,
    Dialog,
    Portal,
    CloseButton,
    Button,
    Spinner,
    Image as ChakraImage,
} from "@chakra-ui/react";
import {
    FiShoppingBag,
    FiBell,
    FiSettings,
    FiLogOut,
    FiCamera,
} from "react-icons/fi";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/apis/user";
import { adminSettingsApi } from "@/apis/admin/settings";
import { toaster } from "@/components/chakra/toaster";

export default function MyPageLayoutClient({ children }: { children: React.ReactNode }) {
    const { data: session, update: updateSession } = useSession();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const t = useTranslations('common');
    const locale = useLocale();

    const user = session?.user as { accessToken?: string; name?: string; username?: string; email?: string; avatar_url?: string } | undefined;
    const token = user?.accessToken;

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !token) return;

        try {
            setIsUploadingAvatar(true);
            const uploadRes = await adminSettingsApi.uploadMedia(file, token);
            if (uploadRes.url) {
                await userApi.updateProfile(token as string, { avatar_url: uploadRes.url, oldPassword: "" });
                // We need to trigger a session update to refresh the avatar in the UI
                await updateSession({ avatar_url: uploadRes.url });

                // Invalidate profile user query to refresh it across the app
                queryClient.invalidateQueries({ queryKey: ['profile-user'] });

                toaster.create({
                    title: t('profile_updated_success', { defaultValue: 'Profile updated' }),
                    type: "success",
                });
            }
        } catch (error) {
            console.error("Avatar upload failed", error);
            toaster.create({
                title: t('update_failed', { defaultValue: 'Update failed' }),
                description: (error as Error).message,
                type: "error",
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleLogout = () => {
        setIsLogoutDialogOpen(true);
    };

    const confirmLogout = async () => {
        if (token) {
            try {
                await userApi.signOut(token);
            } catch (err) {
                console.error("Sign out API failed", err);
            }
        }
        signOut({ callbackUrl: "/" });
    };

    const menuItems = [
        { icon: FiShoppingBag, label: t('my_bookings_title', { defaultValue: 'My Bookings' }), path: "/mypage/bookings" },
        { icon: FiBell, label: t('notifications_title', { defaultValue: 'Notifications' }), path: "/mypage/notifications" },
        { icon: FiSettings, label: t('profile_settings_title', { defaultValue: 'Profile Settings' }), path: "/mypage/settings" },
        { icon: FiLogOut, label: t('change_password_button', { defaultValue: 'Change Password' }), path: "/mypage/change-password" }, // Changed icon for change password
    ];

    return (
        <Box minH="100vh">
            <Container maxW="7xl" mx="auto" px={4} py={12}>
                <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap={4} alignItems="start">
                    {/* Sidebar */}
                    <GridItem position={{ md: "sticky" }} top="50px">
                        <VStack align="stretch" gap={4}>
                            {/* Profile Summary Card */}
                            <Box
                                bg="white"
                                rounded="2xl"
                                p={8}
                                border="1px"
                                borderColor="gray.100"
                                shadow="sm"
                                textAlign="center"
                            >
                                <Box
                                    w="100px"
                                    h="100px"
                                    mx="auto"
                                    mb={4}
                                    bg="blue.500"
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="white"
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    shadow="xl"
                                    position="relative"
                                    overflow="hidden"
                                    cursor="pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    _hover={{
                                        "& > .camera-overlay": { opacity: 1 },
                                        transform: "scale(1.02)"
                                    }}
                                    transition="all 0.3s"
                                >
                                    {isUploadingAvatar ? (
                                        <Spinner size="lg" color="white" />
                                    ) : (
                                        <>
                                            {user?.avatar_url ? (
                                                <ChakraImage
                                                    src={user.avatar_url}
                                                    alt="Avatar"
                                                    objectFit="cover"
                                                    w="100%"
                                                    h="100%"
                                                />
                                            ) : (
                                                user?.name?.charAt(0) || user?.username?.charAt(0) || "U"
                                            )}
                                            <Box
                                                className="camera-overlay"
                                                position="absolute"
                                                inset={0}
                                                bg="blackAlpha.600"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                opacity={0}
                                                transition="opacity 0.3s"
                                            >
                                                <Icon as={FiCamera} color="white" fontSize="24px" />
                                            </Box>
                                        </>
                                    )}
                                </Box>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                <Heading size="md" mb={1} color="gray.800" fontWeight="black">{user?.name || user?.username || t('default_username', { defaultValue: 'Traveler' })}</Heading>
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">{user?.email || ""}</Text>
                            </Box>

                            {/* Navigation Card */}
                            <Box bg="white" rounded="2xl" p={6} border="1px" borderColor="gray.100" shadow="sm">
                                <VStack align="stretch" gap={2}>
                                    <Text px={3} mb={2} fontSize="11px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                        {t('personal_menu', { defaultValue: 'Personal Menu' })}
                                    </Text>
                                    {menuItems.map((item) => (
                                        <Link key={item.path} href={item.path}>
                                            <SidebarItem
                                                icon={item.icon}
                                                label={item.label}
                                                isActive={pathname === item.path}
                                            />
                                        </Link>
                                    ))}
                                    <Box borderBottom="1px" borderColor="gray.50" my={4} mx={3} />
                                    <SidebarItem
                                        icon={FiLogOut}
                                        label={t('sign_out', { defaultValue: 'Logout' })}
                                        onClick={handleLogout}
                                        color="red.500"
                                    />
                                </VStack>
                            </Box>
                        </VStack>
                    </GridItem>

                    {/* Main Content */}
                    <GridItem>
                        <Box
                            bg="white"
                            rounded="2xl"
                            p={{ base: 3, md: 6 }}
                            border="1px"
                            borderColor="gray.100"
                            shadow="sm"
                            minH="700px"
                            transition="all 0.3s"
                        >
                            {children}
                        </Box>
                    </GridItem>
                </Grid>
            </Container>

            {/* Logout Confirmation Dialog */}
            <Dialog.Root
                role="alertdialog"
                open={isLogoutDialogOpen}
                onOpenChange={(e) => setIsLogoutDialogOpen(e.open)}
                lazyMount
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content rounded="2xl" p={6} bg="white" color="gray.800">
                            <Dialog.Header>
                                <Dialog.Title fontSize="xl" fontWeight="black">{t('confirm_logout_title', { defaultValue: 'Confirm Logout' })}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text color="gray.500" fontSize="sm">
                                    {t('logout_confirmation_desc', { defaultValue: 'Are you sure you want to log out of your account? You will need to sign in again to access your itinerary.' })}
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer gap={3} mt={8}>
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl px-6 border-gray-100 text-gray-600 hover:bg-gray-50"
                                    >
                                        {t('cancel', { defaultValue: 'Cancel' })}
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    className="rounded-xl px-8 bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-100 font-bold"
                                    onClick={confirmLogout}
                                >
                                    {t('sign_out', { defaultValue: 'Logout' })}
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" position="absolute" top={2} right={2} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
}

interface SidebarItemProps {
    icon: React.ComponentType;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    color?: string;
}

function SidebarItem({ icon, label, isActive, onClick, color }: SidebarItemProps) {
    return (
        <HStack
            p={4}
            rounded="2xl"
            cursor="pointer"
            bg={isActive ? "blue.600" : "transparent"}
            color={isActive ? "white" : (color || "gray.600")}
            fontWeight={isActive ? "bold" : "medium"}
            _hover={{ bg: isActive ? "blue.700" : "gray.50", transform: isActive ? "none" : "translateX(4px)" }}
            onClick={onClick}
            transition="all 0.2s"
            shadow={isActive ? "md" : "none"}
        >
            <Icon as={icon} fontSize="18px" />
            <Text fontSize="sm">{label}</Text>
        </HStack>
    );
}
