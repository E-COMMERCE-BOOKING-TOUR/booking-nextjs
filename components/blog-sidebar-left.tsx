"use client";

import { Box, Button, HStack, Icon, Text, VStack, Avatar } from "@chakra-ui/react"
import {
    Home,
    Search,
    Bell,
    Bookmark,
    User,
} from "lucide-react"
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type Item = {
    key: string
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

type BlogSidebarLeftProps = {
    active?: string
    items?: Item[]
    className?: string
}

export default function BlogSidebarLeft({
    active,
    items,
    className,
}: Readonly<BlogSidebarLeftProps>) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const t = useTranslations('common');

    // Generate items with dynamic profile link
    const menuItems = useMemo(() => {
        const userUuid = (session?.user as { uuid?: string })?.uuid;
        const isLoggedIn = !!session?.user?.email;

        const allItems = [
            { key: "home", label: t('home', { defaultValue: 'Home' }), href: "/social", icon: Home, requiresAuth: false },
            { key: "explore", label: t('explore', { defaultValue: 'Explore' }), href: "/social/explore", icon: Search, requiresAuth: false },
            { key: "notifications", label: t('notifications', { defaultValue: 'Notifications' }), href: "/social/notification", icon: Bell, requiresAuth: true },
            { key: "bookmarks", label: t('bookmarks', { defaultValue: 'Bookmarks' }), href: "/social/bookmark", icon: Bookmark, requiresAuth: true },
            { key: "profile", label: t('profile', { defaultValue: 'Profile' }), href: userUuid ? `/social/profile/${userUuid}` : "/social", icon: User, requiresAuth: true },
        ];

        // Filter items based on authentication status
        return allItems.filter(item => !item.requiresAuth || isLoggedIn);
    }, [session?.user, t]);

    const finalItems = items || menuItems;

    return (
        <Box
            className={className}
            w="full"
            bg="white"
            color="black"
            borderRadius="xl"
            p={5}
            position="sticky"
            top="80px"
            h="fit-content"
        >
            {session?.user?.name ?
                <a href={(session?.user as { uuid?: string })?.uuid ? `/social/profile/${(session?.user as { uuid?: string })?.uuid}` : "/social"}>
                    <Button
                        w="full"
                        paddingEnd={3}
                        marginBottom={6}
                        variant="ghost"
                        borderRadius="xl"
                        justifyContent="flex-start"
                        alignItems="center"
                        color="gray.700"
                        _hover={{ bg: "gray.50" }}
                        fontWeight="semibold"
                        h="auto"
                        py={3}
                        px={4}
                    >

                        <HStack w="full">
                            <Avatar.Root size="md">
                                {(session?.user as any)?.avatar_url && <Avatar.Image src={(session?.user as any).avatar_url} />}
                                <Avatar.Fallback name={session?.user?.name || "User"} />
                            </Avatar.Root>
                            <Text fontSize={"md"} lineClamp={1}>{session?.user?.name}</Text>
                        </HStack>
                    </Button>
                </a> : null
            }
            <VStack align="stretch" gap={2}>
                {finalItems.map((it) => {
                    const IconComp = it.icon

                    let isActive = false;
                    if (active) {
                        isActive = active === it.key;
                    } else {
                        if (it.href === '/social') {
                            isActive = pathname === '/social';
                        } else if (it.key === 'profile') {
                            isActive = pathname?.startsWith('/social/profile') ?? false;
                        } else {
                            isActive = pathname?.startsWith(it.href) ?? false;
                        }
                    }

                    return (
                        <a key={it.key} href={it.href} className="w-full">
                            <Button
                                w="full"
                                variant="ghost"
                                borderRadius="xl"
                                justifyContent="flex-start"
                                alignItems="center"
                                color={isActive ? "white" : "gray.500"}
                                bg={isActive ? "main" : "transparent"}
                                _hover={{
                                    bg: isActive ? "main" : "gray.50",
                                    transform: "translateY(-2px)",
                                    boxShadow: isActive ? "lg" : "none"
                                }}
                                transition="all 0.2s"
                                fontWeight={isActive ? "600" : "500"}
                                fontSize="0.95rem"
                                h="auto"
                                py={3}
                                px={5}
                            >

                                <HStack w="full" gap={4}>
                                    <Icon as={IconComp} boxSize={5} />
                                    <Text>{it.label}</Text>
                                </HStack>

                            </Button>
                        </a>
                    )
                })}
            </VStack>
        </Box>
    )
}
