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
    return (
        <Box className={className} w="full" h="100vh" paddingY={5} backgroundColor="whiteAlpha.400" ml={-5} borderRightWidth="1px" borderColor="blackAlpha.200">
            {session?.user?.name ?
                <Button
                    w="full"
                    paddingEnd={3}
                    marginBottom={15}
                    variant="ghost"
                    borderRadius="sm"
                    justifyContent="flex-start"
                    alignItems="center"
                    color="blackAlpha.900"
                    _hover={{ bg: "blackAlpha.100" }}
                    fontWeight="semibold"
                >

                    <HStack w="full" gap={3}>
                        <Avatar.Root size="lg">
                            <Avatar.Image src="https://picsum.photos/100/100" />
                            <Avatar.Fallback name="John Doe" />
                        </Avatar.Root>
                        <Text fontSize={"md"}>{session?.user?.name}</Text>
                    </HStack>
                </Button> : null
            }
            <VStack align="stretch" gap={5}>
                {items.map((it) => {
                    const IconComp = it.icon
                    const isActive = active === it.key
                    return (
                        <Button
                            key={it.key}
                            w="full"
                            paddingEnd={10}
                            variant="ghost"
                            borderRadius="full"
                            justifyContent="flex-start"
                            alignItems="center"
                            color="blackAlpha.900"
                            _hover={{ bg: "blackAlpha.100" }}
                            fontWeight={isActive ? "semibold" : "medium"}
                        >
                            <a href={it.href} className=" w-full flex items-center gap-3">
                                <HStack w="full">
                                    <Icon as={IconComp} boxSize={5} />
                                    <Text fontSize={"lg"}>{it.label}</Text>
                                </HStack>
                            </a>
                        </Button>
                    )
                })}
            </VStack>
        </Box>
    )
}
