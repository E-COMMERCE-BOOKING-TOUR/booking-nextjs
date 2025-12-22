"use client";

import {
    IconButton,
    Popover,
    VStack,
    HStack,
    Text,
    Box,
    Link as ChakraLink,
    Spinner,
    Portal,
    Badge,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import notificationApi from "@/apis/notification";
import { FiBell, FiInfo, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import { INotification } from "@/types/notification";

export const NotificationBell = () => {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const { data: response, isLoading } = useQuery({
        queryKey: ["notifications", token, 1],
        queryFn: async () => {
            if (!token) return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
            const res = await notificationApi.getMe(token, 1, 10);
            if (!res.ok) throw new Error(res.error);
            return res.data;
        },
        enabled: !!token,
    });

    const notifications = response?.data?.slice(0, 5) || [];
    const totalCount = response?.total || 0;

    const getIcon = (n: INotification) => {
        if (n.is_error) return <FiAlertCircle size={14} color="#E53E3E" />;
        if (n.title.toLowerCase().includes('success') || n.title.toLowerCase().includes('confirmed'))
            return <FiCheckCircle size={14} color="#38A169" />;
        return <FiInfo size={14} color="#3182CE" />;
    };

    return (
        <Popover.Root lazyMount unmountOnExit id="user-notification" positioning={{ placement: "bottom-end" }}>
            <Popover.Trigger asChild>
                <Box position="relative" cursor="pointer">
                    <IconButton variant="ghost" rounded="full" size="sm" mr={2}>
                        <FiBell />
                    </IconButton>
                    {totalCount > 0 && (
                        <Badge
                            position="absolute"
                            top="-1"
                            right="1"
                            bg="red.500"
                            color="white"
                            rounded="full"
                            fontSize="10px"
                            minW="18px"
                            h="18px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="2px solid white"
                        >
                            {totalCount > 9 ? "9+" : totalCount}
                        </Badge>
                    )}
                </Box>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content width="350px" rounded="2xl" shadow="2xl" border="1px" borderColor="gray.100">
                        <Popover.Arrow />
                        <Popover.Header p={5} borderBottomWidth="1px" borderColor="gray.50">
                            <HStack justify="space-between">
                                <Text fontWeight="bold" fontSize="md">Notifications</Text>
                                <Badge colorPalette="blue" variant="subtle" size="sm">
                                    Recent
                                </Badge>
                            </HStack>
                        </Popover.Header>
                        <Popover.Body p={2}>
                            {isLoading ? (
                                <VStack py={10}>
                                    <Spinner size="sm" color="blue.500" />
                                    <Text fontSize="xs" color="gray.500">Loading...</Text>
                                </VStack>
                            ) : notifications.length === 0 ? (
                                <VStack py={10} gap={2}>
                                    <FiBell size={24} color="#CBD5E0" />
                                    <Text fontSize="sm" color="gray.500">No new notifications</Text>
                                </VStack>
                            ) : (
                                <VStack align="stretch" gap={0} maxH="400px" overflowY="auto">
                                    {notifications.map((n: INotification) => (
                                        <Box
                                            key={n.id}
                                            px={4}
                                            py={3}
                                            _hover={{ bg: "gray.50" }}
                                            transition="all 0.2s"
                                            borderBottomWidth="1px"
                                            borderColor="gray.50"
                                            cursor="pointer"
                                        >
                                            <HStack align="start" gap={3}>
                                                <Box p={2} bg={n.is_error ? "red.50" : "blue.50"} rounded="lg">
                                                    {getIcon(n)}
                                                </Box>
                                                <VStack align="start" gap={0.5} flex={1}>
                                                    <Text fontWeight="bold" fontSize="xs" color="gray.800" lineClamp={1}>
                                                        {n.title}
                                                    </Text>
                                                    <Text fontSize="11px" color="gray.600" lineClamp={2}>
                                                        {n.description}
                                                    </Text>
                                                    <Text fontSize="9px" color="gray.400" mt={1}>
                                                        {new Date(n.created_at).toLocaleString('vi-VN')}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </Popover.Body>
                        <Popover.Footer p={5} textAlign="center" borderTopWidth="1px" borderColor="gray.50">
                            <ChakraLink
                                asChild
                                fontSize="xs"
                                fontWeight="bold"
                                color="blue.600"
                                _hover={{ color: "blue.700" }}
                            >
                                <Link href="/mypage/notifications">
                                    View all notifications
                                </Link>
                            </ChakraLink>
                        </Popover.Footer>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
};
