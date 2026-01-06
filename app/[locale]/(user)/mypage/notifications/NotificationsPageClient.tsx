"use client";

import {
    VStack,
    Box,
    Text,
    Heading,
    HStack,
    Spinner,
    Badge,
    IconButton,
    ButtonGroup,
    Pagination,
    Icon,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import notificationApi from "@/apis/notification";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { INotification } from "@/types/notification";

import { useTranslations, useLocale } from "next-intl";

export default function NotificationsPageClient() {
    const t = useTranslations('common');
    const locale = useLocale();
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: response, isLoading } = useQuery({
        queryKey: ["notifications", token, page],
        queryFn: async () => {
            if (!token) return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
            const res = await notificationApi.getMe(token, page, limit);
            if (!res.ok) throw new Error(res.error);
            return res.data;
        },
        enabled: !!token,
    });

    if (isLoading) return (
        <VStack py={20} gap={4} align="center">
            <Spinner color="blue.500" size="xl" />
            <Text color="gray.500" fontSize="sm">Fetching your notifications...</Text>
        </VStack>
    );

    const notifications = response?.data || [];
    const totalCount = response?.total || 0;
    const totalPages = response?.totalPages || 0;

    const getIcon = (n: INotification) => {
        if (n.is_error) return <FiAlertCircle size={20} color="#E53E3E" />;
        if (n.title.toLowerCase().includes('success') || n.title.toLowerCase().includes('confirmed'))
            return <FiCheckCircle size={20} color="#38A169" />;
        return <FiInfo size={20} color="#3182CE" />;
    };

    return (
        <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
                <VStack align="start" gap={1}>
                    <Heading fontSize="lg" fontWeight="bold" textTransform="uppercase">{t('notifications_title', { defaultValue: 'Notifications' })}</Heading>
                    <Text color="gray.500" fontSize="sm">{t('notifications_desc', { defaultValue: 'Stay updated with your booking status and travel alerts' })}</Text>
                </VStack>
                {totalCount > 0 && (
                    <Badge colorPalette="blue" variant="subtle" px={3} py={1} rounded="full">
                        {totalCount} {t('total_badge_label', { defaultValue: 'Total' })}
                    </Badge>
                )}
            </HStack>

            {isLoading && !notifications.length ? (
                <VStack py={20} gap={4}>
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.500">{t('fetching_notifications', { defaultValue: 'Fetching your notifications...' })}</Text>
                </VStack>
            ) : notifications.length === 0 ? (
                <Box py={20} textAlign="center">
                    <VStack gap={4}>
                        <Box p={6} bg="gray.50" rounded="full">
                            <Icon as={FiBell} boxSize={10} color="gray.300" />
                        </Box>
                        <Text color="gray.500" fontWeight="medium">{t('no_notifications_message', { defaultValue: 'You have no notifications yet.' })}</Text>
                    </VStack>
                </Box>
            ) : (
                <VStack align="stretch" gap={4}>
                    <VStack align="stretch" gap={2}>
                        {notifications.map((n: INotification) => (
                            <Box
                                key={n.id}
                                p={5}
                                rounded="2xl"
                                border="1px"
                                borderColor="gray.100"
                                bg="white"
                                _hover={{ borderColor: "blue.100", shadow: "sm" }}
                                transition="all 0.2s"
                            >
                                <HStack align="start" gap={4}>
                                    <Box p={3} bg={n.is_error ? "red.50" : "blue.50"} rounded="xl" flexShrink={0}>
                                        {getIcon(n)}
                                    </Box>
                                    <VStack align="start" gap={1} flex={1}>
                                        <HStack justify="space-between" w="full">
                                            <Text fontWeight="black" fontSize="sm" color="gray.800">{n.title}</Text>
                                            <Text fontSize="10px" color="gray.400" fontWeight="bold">
                                                {new Date(n.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                                            </Text>
                                        </HStack>
                                        <Text color="gray.600" fontSize="xs" lineHeight="tall">{n.description}</Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <HStack justify="center" pt={4}>
                            <Pagination.Root
                                count={totalCount}
                                pageSize={limit}
                                page={page}
                                onPageChange={(e) => setPage(e.page)}
                            >
                                <ButtonGroup variant="ghost" attached size="sm">
                                    <Pagination.PrevTrigger asChild>
                                        <IconButton rounded="xl" variant="outline" border="1px solid" borderColor="gray.100">
                                            <LuChevronLeft />
                                        </IconButton>
                                    </Pagination.PrevTrigger>

                                    <Pagination.Items
                                        render={(pageInfo) => (
                                            <IconButton
                                                key={pageInfo.value}
                                                variant={page === pageInfo.value ? "outline" : "ghost"}
                                                bg={page === pageInfo.value ? "blue.50" : "transparent"}
                                                color={page === pageInfo.value ? "blue.600" : "gray.600"}
                                                rounded="xl"
                                                fontWeight="bold"
                                            >
                                                {pageInfo.value}
                                            </IconButton>
                                        )}
                                    />

                                    <Pagination.NextTrigger asChild>
                                        <IconButton rounded="xl" variant="outline" border="1px solid" borderColor="gray.100">
                                            <LuChevronRight />
                                        </IconButton>
                                    </Pagination.NextTrigger>
                                </ButtonGroup>
                            </Pagination.Root>
                        </HStack>
                    )}
                </VStack>
            )}
        </VStack>
    );
}
