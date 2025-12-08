"use client";

import { Box, Button, HStack, Icon, Text, VStack, Avatar } from "@chakra-ui/react"
import {
    Home,
    Search,
    Bell,
    MessageCircle,
    Brain,
    List,
    Bookmark,
    Users,
    Diamond,
    User,
    MoreHorizontal,
} from "lucide-react"

type Item = {
    key: string
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

const defaultItems: Item[] = [
    { key: "home", label: "Home", href: "#", icon: Home },
    { key: "explore", label: "Explore", href: "#", icon: Search },
    { key: "notifications", label: "Notifications", href: "#", icon: Bell },
    { key: "bookmarks", label: "Bookmarks", href: "#", icon: Bookmark },
    { key: "profile", label: "Profile", href: "#", icon: User },
    { key: "more", label: "More", href: "#", icon: MoreHorizontal },
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
    return (
        <Box className={className} w="full" paddingY={5}>
            <Button
                w="full"
                paddingX={5}
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
                    <Avatar.Root size="md">
                        <Avatar.Image src="https://picsum.photos/100/100" />
                        <Avatar.Fallback name="John Doe" />
                    </Avatar.Root>
                    <Text>John Doe</Text>
                </HStack>
            </Button>
            <VStack align="stretch" gap={5}>
                {items.map((it) => {
                    const IconComp = it.icon
                    const isActive = active === it.key
                    return (
                        <Button
                            key={it.key}
                            w="full"
                            paddingX={10}
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
                                    <Text>{it.label}</Text>
                                </HStack>
                            </a>
                        </Button>
                    )
                })}
            </VStack>
        </Box>
    )
}
