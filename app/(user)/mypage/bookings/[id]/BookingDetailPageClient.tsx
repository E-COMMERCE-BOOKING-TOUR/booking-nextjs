"use client";

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import bookingApi from '@/apis/booking';
import { useSession } from 'next-auth/react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    Spinner,
    Grid,
    GridItem,
    Icon,
    Badge,
    Table,
    Separator,
    Dialog,
    Portal,
    CloseButton,
    Button as ChakraButton,
} from "@chakra-ui/react";
import {
    Calendar,
    Users,
    CreditCard,
    Package,
    Clock,
    User,
    Mail,
    Phone,
    ArrowLeft,
    MapPin,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from "@/libs/i18n/client";
import { useSearchParams } from "next/navigation";
import { toaster } from '@/components/chakra/toaster';

export default function BookingDetailPageClient({ lng }: { lng: string }) {
    const searchParams = useSearchParams();
    const { t } = useTranslation(lng);
    const params = useParams();
    const id = Number(params.id);
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['user-booking-detail', id, token],
        queryFn: () => bookingApi.getDetail(id, token),
        enabled: !!token && !!id,
    });

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [refundInfo, setRefundInfo] = useState<{ refundAmount: number; feeAmount: number; feePct: number } | null>(null);
    const [loadingRefund, setLoadingRefund] = useState(false);
    const queryClient = useQueryClient();

    const handleOpenCancelDialog = async () => {
        setLoadingRefund(true);
        const result = await bookingApi.calculateRefund(id, token);
        if (result.ok && result.data) {
            setRefundInfo(result.data);
        }
        setLoadingRefund(false);
        setShowCancelDialog(true);
    };

    const cancelMutation = useMutation({
        mutationFn: () => bookingApi.cancelConfirmed(id, token),
        onSuccess: (result) => {
            if (result.ok) {
                toaster.success({ title: t('booking_cancelled', { defaultValue: 'Booking cancelled successfully' }) });
                queryClient.invalidateQueries({ queryKey: ['user-booking-detail', id] });
                setShowCancelDialog(false);
            } else {
                toaster.error({ title: result.error || 'Failed to cancel' });
            }
        },
        onError: () => {
            toaster.error({ title: 'Failed to cancel booking' });
        },
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="blue.500" />
            </Box>
        );
    }

    if (error || !booking) {
        return (
            <VStack py={20} gap={4}>
                <Heading size="lg">{t('booking_not_found', { defaultValue: 'Booking not found' })}</Heading>
                <Button asChild variant="outline">
                    <Link href="/mypage/bookings">{t('back_to_list', { defaultValue: 'Back to list' })}</Link>
                </Button>
            </VStack>
        );
    }

    const b = booking;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'green';
            case 'pending_confirm': return 'orange';
            case 'pending_payment': return 'blue';
            case 'cancelled':
            case 'expired': return 'red';
            default: return 'gray';
        }
    };

    return (
        <VStack align="stretch" gap={8} animate-in fade-in slide-in-from-bottom-4 duration-700>
            {/* Header */}
            <HStack justify="space-between" align="start">
                <HStack gap={4}>
                    <Link href="/mypage/bookings">
                        <Button variant="ghost" size="icon" className="rounded-full border border-gray-100">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <VStack align="start" gap={1}>
                        <HStack gap={3}>
                            <Heading size="lg">#{b.id}</Heading>
                            <Badge colorPalette={getStatusColor(b.status)} variant="solid" px={3} py={1} rounded="full">
                                {b.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                            {t('booking_created_at', { defaultValue: 'Created at:' })} {new Date().toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US')}
                        </Text>
                    </VStack>
                </HStack>
                <VStack align="end" gap={1}>
                    <Text fontSize="xs" color="gray.400" fontWeight="bold" letterSpacing="widest">{t('total_amount_label', { defaultValue: 'TOTAL AMOUNT' })}</Text>
                    <Text fontSize="2xl" fontWeight="black" color="blue.600">
                        {Number(b.total_amount).toLocaleString(lng === 'vi' ? 'vi-VN' : 'en-US')} {b.currency}
                    </Text>
                    {b.status === 'confirmed' && (
                        <ChakraButton
                            variant="outline"
                            size="sm"
                            colorPalette="red"
                            mt={2}
                            rounded="full"
                            onClick={handleOpenCancelDialog}
                            disabled={loadingRefund}
                            _hover={{ bg: 'red.50' }}
                        >
                            <XCircle className="w-4 h-4" />
                            {loadingRefund ? t('loading', { defaultValue: 'Loading...' }) : t('cancel_booking_btn', { defaultValue: 'Cancel Booking' })}
                        </ChakraButton>
                    )}
                </VStack>
            </HStack>

            {/* Cancellation Dialog */}
            <Dialog.Root open={showCancelDialog} onOpenChange={(e) => setShowCancelDialog(e.open)} role="alertdialog">
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    <HStack gap={2}>
                                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                                        <Text>{t('cancel_booking_title', { defaultValue: 'Cancel Booking' })}</Text>
                                    </HStack>
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack align="stretch" gap={4}>
                                    <Text>{t('cancel_confirm_message', { defaultValue: 'Are you sure you want to cancel this booking?' })}</Text>
                                    {refundInfo && (
                                        <Box p={4} bg="gray.50" rounded="lg">
                                            <VStack align="stretch" gap={2}>
                                                <HStack justify="space-between">
                                                    <Text color="gray.600">{t('cancellation_fee_label', { defaultValue: 'Cancellation Fee' })} ({refundInfo.feePct}%):</Text>
                                                    <Text fontWeight="bold" color="red.600">
                                                        {refundInfo.feeAmount.toLocaleString(lng === 'vi' ? 'vi-VN' : 'en-US')} {b.currency}
                                                    </Text>
                                                </HStack>
                                                <Separator />
                                                <HStack justify="space-between">
                                                    <Text color="gray.600" fontWeight="bold">{t('refund_amount_label', { defaultValue: 'Refund Amount' })}:</Text>
                                                    <Text fontWeight="black" color="green.600" fontSize="lg">
                                                        {refundInfo.refundAmount.toLocaleString(lng === 'vi' ? 'vi-VN' : 'en-US')} {b.currency}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </Box>
                                    )}
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer gap={2}>
                                <Dialog.ActionTrigger asChild>
                                    <ChakraButton variant="outline">{t('cancel_btn', { defaultValue: 'Cancel' })}</ChakraButton>
                                </Dialog.ActionTrigger>
                                <ChakraButton
                                    colorPalette="red"
                                    onClick={() => cancelMutation.mutate()}
                                    disabled={cancelMutation.isPending}
                                >
                                    {cancelMutation.isPending ? t('processing', { defaultValue: 'Processing...' }) : t('confirm_cancel_btn', { defaultValue: 'Confirm Cancellation' })}
                                </ChakraButton>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Separator />

            <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
                {/* Left Side: Details */}
                <GridItem colSpan={{ base: 1, lg: 2 }}>
                    <VStack align="stretch" gap={4}>

                        {/* Tour Info */}
                        <Box p={4} rounded="2xl" border="1px solid" borderColor="gray.100">
                            <HStack align="start" gap={6}>
                                <Box w="120px" h="120px" bg="gray.200" rounded="xl" overflow="hidden" flexShrink={0}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={b.tour_image.startsWith('http') ? b.tour_image : `${process.env.NEXT_PUBLIC_API_BACKEND}/${b.tour_image}`}
                                        alt={b.tour_title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <VStack align="start" gap={2}>
                                    <Badge colorPalette="blue" variant="subtle">{t('tour_detail_badge', { defaultValue: 'Tour Detail' })}</Badge>
                                    <Heading size="md">{b.tour_title}</Heading>
                                    <HStack color="gray.500" fontSize="sm">
                                        <Icon as={MapPin} boxSize={3} />
                                        <Text>{b.tour_location}</Text>
                                    </HStack>
                                    <HStack gap={4} mt={2}>
                                        <HStack color="blue.600" fontWeight="bold" fontSize="sm">
                                            <Icon as={Calendar} boxSize={4} />
                                            <Text>{new Date(b.start_date).toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US')}</Text>
                                        </HStack>
                                        <HStack color="orange.600" fontWeight="bold" fontSize="sm">
                                            <Icon as={Clock} boxSize={4} />
                                            <Text>{b.session_start_time || 'N/A'}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Box>
                        {b.status === 'cancelled' && b.cancel_reason && (
                            <Box p={3} bg="red.50" rounded="md" border="1px dashed" borderColor="red.200" width="100%">
                                <Text fontSize="xs" fontWeight="bold" color="red.500" textTransform="uppercase" mb={1}>
                                    {t('cancellation_reason_label', { defaultValue: 'Cancellation Reason' })}
                                </Text>
                                <Text fontSize="sm" color="red.700">
                                    {b.cancel_reason}
                                </Text>
                            </Box>
                        )}
                        {/* Items Table */}
                        <Box p={4} rounded="2xl" border="1px solid" borderColor="gray.100">
                            <HStack mb={4}>
                                <Icon as={Package} color="blue.500" />
                                <Heading size="sm">{t('items_summary_title', { defaultValue: 'Items Summary' })}</Heading>
                            </HStack>
                            <Table.Root variant="line">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>{t('table_description', { defaultValue: 'Description' })}</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">{t('table_quantity', { defaultValue: 'Quantity' })}</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="right">{t('table_unit_price', { defaultValue: 'Unit Price' })}</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="right">{t('table_amount', { defaultValue: 'Amount' })}</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {b.items.map((item, idx) => (
                                        <Table.Row key={idx}>
                                            <Table.Cell>
                                                <Text fontWeight="semibold">{item.pax_type_name}</Text>
                                            </Table.Cell>
                                            <Table.Cell textAlign="center">{item.quantity}</Table.Cell>
                                            <Table.Cell textAlign="right">
                                                {Number(item.unit_price).toLocaleString(lng === 'vi' ? 'vi-VN' : 'en-US')} {b.currency}
                                            </Table.Cell>
                                            <Table.Cell textAlign="right" fontWeight="bold">
                                                {Number(item.total_amount).toLocaleString(lng === 'vi' ? 'vi-VN' : 'en-US')} {b.currency}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Box>

                        {/* Passengers */}
                        {b.passengers.length > 0 && (
                            <Box>
                                <HStack mb={4}>
                                    <Icon as={Users} color="blue.500" />
                                    <Heading size="sm">{t('passenger_list_title', { defaultValue: 'Passenger List' })}</Heading>
                                </HStack>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    {b.passengers.map((p, idx) => (
                                        <Box key={idx} p={4} border="1px solid" borderColor="gray.100" rounded="xl" bg="white">
                                            <HStack align="start" gap={3}>
                                                <Box p={2} bg="blue.50" rounded="lg">
                                                    <Icon as={User} color="blue.600" />
                                                </Box>
                                                <VStack align="start" gap={0}>
                                                    <Text fontWeight="bold">{p.full_name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{p.pax_type_name}</Text>
                                                    {p.phone_number && (
                                                        <Text fontSize="xs" color="gray.400" mt={1}>{p.phone_number}</Text>
                                                    )}
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </VStack>
                </GridItem>

                {/* Right Side: Sidebar Info */}
                <GridItem>
                    <VStack align="stretch" gap={4}>
                        {/* Contact Card */}
                        <Box p={4} rounded="2xl" border="1px solid" borderColor="gray.100">
                            <Heading size="sm" mb={4}>{t('contact_info_title', { defaultValue: 'Contact Information' })}</Heading>
                            <VStack align="stretch" gap={4}>
                                <HStack gap={3}>
                                    <Icon as={User} color="gray.400" boxSize={4} />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.400">{t('full_name_label', { defaultValue: 'Full Name' })}</Text>
                                        <Text fontWeight="semibold">{b.contact_name}</Text>
                                    </VStack>
                                </HStack>
                                <HStack gap={3}>
                                    <Icon as={Mail} color="gray.400" boxSize={4} />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.400">{t('email_label', { defaultValue: 'Email Address' })}</Text>
                                        <Text fontWeight="semibold">{b.contact_email}</Text>
                                    </VStack>
                                </HStack>
                                <HStack gap={3}>
                                    <Icon as={Phone} color="gray.400" boxSize={4} />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.400">{t('phone_label', { defaultValue: 'Phone Number' })}</Text>
                                        <Text fontWeight="semibold">{b.contact_phone}</Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </Box>

                        {/* Payment Card */}
                        <Box bg="blue.600" color="white" p={6} rounded="2xl" shadow="md">
                            <HStack justify="space-between" mb={6}>
                                <Icon as={CreditCard} boxSize={6} />
                                <Badge colorPalette="whiteAlpha" variant="solid">
                                    {b.payment_status === 'paid' ? t('status_paid', { defaultValue: 'PAID' }) : t('status_unpaid', { defaultValue: 'UNPAID' })}
                                </Badge>
                            </HStack>
                            <VStack align="start" gap={4}>
                                <Box>
                                    <Text fontSize="xs" color="blue.100" fontWeight="bold" letterSpacing="widest">{t('payment_method_label_caps', { defaultValue: 'METHOD' })}</Text>
                                    <Text fontSize="md" fontWeight="bold">
                                        {b.booking_payment?.payment_method_name || b.payment_method || 'N/A'}
                                    </Text>
                                </Box>
                                {b.payment_information && (
                                    <HStack justify="space-between" w="full">
                                        <Box>
                                            <Text fontSize="xs" color="blue.100" fontWeight="bold" letterSpacing="widest">{t('card_label_caps', { defaultValue: 'CARD' })}</Text>
                                            <Text fontWeight="bold">**** {b.payment_information.last4}</Text>
                                        </Box>
                                        <Box textAlign="right">
                                            <Text fontSize="xs" color="blue.100" fontWeight="bold" letterSpacing="widest">{t('brand_label_caps', { defaultValue: 'BRAND' })}</Text>
                                            <Text fontWeight="black">{b.payment_information.brand?.toUpperCase()}</Text>
                                        </Box>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>
                    </VStack>
                </GridItem>
            </Grid>
        </VStack>
    );
}
