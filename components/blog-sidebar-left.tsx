"use client";

import { Box, Button, HStack, Icon, Text, VStack, Avatar } from "@chakra-ui/react"
import {
    Home,
    Search,
    Bell,
    Bookmark,
    User,
    MoreHorizontal,
} from "lucide-react"
import { useSession } from "next-auth/react";

import { usePathname } from "next/navigation";

type Item = {
    key: string
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

const defaultItems: Item[] = [
    { key: "home", label: "Home", href: "/social", icon: Home },
    { key: "explore", label: "Explore", href: "/social/explore", icon: Search },
    { key: "notifications", label: "Notifications", href: "/social/notification", icon: Bell },
    { key: "bookmarks", label: "Bookmarks", href: "/social/bookmark", icon: Bookmark },
    { key: "profile", label: "Profile", href: "/social/profile", icon: User },
]

type BlogSidebarLeftProps = {
    active?: string
    items?: Item[]
    className?: string
}

export default function BlogSidebarLeft({
    active,
    items = defaultItems,
    className,
}: Readonly<BlogSidebarLeftProps>) {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <Box
            className={className}
            w="full"
            p={5}
            position={"sticky"}
            top={"30px"}
            h={"fit-content"}
        >
            {session?.user?.name ?
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

                    <HStack w="full" gap={3}>
                        <Avatar.Root size="md">
                            <Avatar.Image src="https://picsum.photos/100/100" />
                            <Avatar.Fallback name="John Doe" />
                        </Avatar.Root>
                        <Text fontSize={"md"}>{session?.user?.name}</Text>
                    </HStack>
                </Button> : null
            }
            <VStack align="stretch" gap={2}>
                {items.map((it) => {
                    const IconComp = it.icon
                    // Logic to determine active:
                    // 1. If explicit 'active' prop is passed, use it.
                    // 2. Otherwise compare pathname.
                    // Special case for 'Home' (/social) to avoid being active on subpages if needed, OR exact match.
                    // For now, let's use exact match for Home, and startsWith for others if preferred,
                    // BUT simplistic approach: pathname === it.href?

                    let isActive = false;
                    if (active) {
                        isActive = active === it.key;
                    } else {
                        if (it.href === '/social') {
                            isActive = pathname === '/social';
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
                                bg={isActive ? "#00cec9" : "transparent"}
                                _hover={{
                                    bg: isActive ? "#00cec9" : "gray.50",
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
