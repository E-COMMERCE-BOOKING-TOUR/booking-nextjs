"use client";

import {
    VStack,
    Box,
    Text,
    Heading,
    HStack,
    Button,
    Badge,
    Grid,
    IconButton,
    ButtonGroup,
    Pagination,
    Spinner,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import bookingApi from "@/apis/booking";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { FiEye, FiShoppingBag } from "react-icons/fi";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { IBookingDetail } from "@/types/booking";
import { Link as I18nLink } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function BookingsPageClient() {
    const t = useTranslations('common');
    const locale = useLocale();
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: response, isLoading } = useQuery({
        queryKey: ["booking-history", token, page],
        queryFn: async () => {
            if (!token) return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
            const res = await bookingApi.getHistory(token, page, limit);
            if (!res.ok) throw new Error(res.error);
            return res.data;
        },
        enabled: !!token,
    });

    const bookings = response?.data || [];
    const totalCount = response?.total || 0;
    const totalPages = response?.totalPages || 0;

    return (
        <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
                <VStack align="start" gap={1}>
                    <Heading fontSize="lg" fontWeight="bold" textTransform="uppercase">{t('my_bookings_title', { defaultValue: 'My Bookings' })}</Heading>
                    <Text color="gray.500" fontSize="sm">{t('my_bookings_desc', { defaultValue: 'Track and manage your travel adventures' })}</Text>
                </VStack>
                <Badge colorPalette="blue" variant="subtle" px={3} py={1} rounded="full">
                    {totalCount} {t('bookings_count_label', { defaultValue: 'Bookings' })}
                </Badge>
            </HStack>

            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={20}>
                    <VStack gap={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text color="gray.500">{t('loading_bookings', { defaultValue: 'Loading your bookings...' })}</Text>
                    </VStack>
                </Box>
            ) : bookings.length === 0 ? (
                <Box py={20} textAlign="center">
                    <VStack gap={4}>
                        <Box p={6} bg="gray.50" rounded="full">
                            <FiShoppingBag size={40} color="#CBD5E0" />
                        </Box>
                        <Text color="gray.500" fontWeight="medium">{t('no_bookings_message', { defaultValue: "You haven't made any bookings yet." })}</Text>
                        <Button variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all px-8">
                            {t('explore_tours_button', { defaultValue: 'Explore Tours' })}
                        </Button>
                    </VStack>
                </Box>
            ) : (
                <VStack align="stretch" gap={2}>
                    <VStack align="stretch" gap={2}>
                        {bookings.map((booking: IBookingDetail) => (
                            <Box
                                key={booking.id}
                                p={3}
                                rounded="2xl"
                                border="1px"
                                borderColor="gray.100"
                                bg="white"
                                _hover={{ shadow: "sm", borderColor: "blue.100" }}
                                transition="all 0.3s"
                            >
                                <Grid templateColumns={{ base: "1fr", md: "100px 1fr auto" }} gap={6} alignItems="center">
                                    {/* Tour Image */}
                                    <Box bg="gray.100" rounded="xl" w="100px" h="100px" overflow="hidden" flexShrink={0} shadow="sm">
                                        {booking.tour_image ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={booking.tour_image}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </>
                                        ) : (
                                            <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                                                <FiShoppingBag size={24} color="#CBD5E0" />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Tour Info */}
                                    <VStack align="start" gap={2}>
                                        <HStack gap={3}>
                                            <Box
                                                px={2}
                                                py={1}
                                                rounded="lg"
                                                fontSize="10px"
                                                fontWeight="black"
                                                letterSpacing="tighter"
                                                bg={booking.status === "confirmed" ? "green.50" : (booking.status === "cancelled" || booking.status === "expired") ? "red.50" : "orange.50"}
                                                color={booking.status === "confirmed" ? "green.600" : (booking.status === "cancelled" || booking.status === "expired") ? "red.600" : "orange.600"}
                                                border="1px"
                                                borderColor={booking.status === "confirmed" ? "green.100" : (booking.status === "cancelled" || booking.status === "expired") ? "red.100" : "orange.100"}
                                            >
                                                {booking.status.replace('_', ' ').toUpperCase()}
                                            </Box>
                                            <Text fontSize="xs" color="gray.400" fontWeight="bold">ID: #{booking.id}</Text>
                                        </HStack>
                                        <Heading size="sm" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{booking.tour_title}</Heading>
                                        <HStack gap={4}>
                                            <HStack color="gray.500" fontSize="xs">
                                                <FiShoppingBag size={12} />
                                                <Text>{booking.start_date ? new Date(booking.start_date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US') : 'N/A'}</Text>
                                            </HStack>
                                            <Text fontWeight="black" color="blue.600" fontSize="sm">
                                                {Number(booking.total_amount).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} {booking.currency}
                                            </Text>
                                        </HStack>
                                    </VStack>

                                    {/* Action */}
                                    <Box>
                                        <Link href={`/mypage/bookings/${booking.id}`}>
                                            <Button variant="ghost">
                                                <FiEye />
                                                {t('details_button', { defaultValue: 'Details' })}
                                            </Button>
                                        </Link>
                                    </Box>
                                </Grid>
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
