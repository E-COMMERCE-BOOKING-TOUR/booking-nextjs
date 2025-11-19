"use client";

import { Box, Button, HStack, Icon, Text, VStack } from "@chakra-ui/react"
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
    { key: "messages", label: "Messages", href: "#", icon: MessageCircle },
    { key: "grok", label: "Grok", href: "#", icon: Brain },
    { key: "lists", label: "Lists", href: "#", icon: List },
    { key: "bookmarks", label: "Bookmarks", href: "#", icon: Bookmark },
    { key: "communities", label: "Communities", href: "#", icon: Users },
    { key: "premium", label: "Premium", href: "#", icon: Diamond },
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
        <Box className={className} w="240px">
            <VStack align="stretch" gap={1}>
                {items.map((it) => {
                    const IconComp = it.icon
                    const isActive = active === it.key
                    return (
                        <Button
                            key={it.key}
                            variant="ghost"
                            borderRadius="full"
                            justifyContent="flex-start"
                            color="whiteAlpha.900"
                            _hover={{ bg: "whiteAlpha.100" }}
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