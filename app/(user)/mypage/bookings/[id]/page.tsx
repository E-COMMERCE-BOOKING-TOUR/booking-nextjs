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
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UserBookingDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['user-booking-detail', id, token],
        queryFn: () => bookingApi.getDetail(id, token),
        enabled: !!token && !!id,
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
                <Heading size="lg">Booking not found</Heading>
                <Button asChild variant="outline">
                    <Link href="/mypage/bookings">Back to list</Link>
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
                            <Heading size="lg">Booking #{b.id}</Heading>
                            <Badge colorPalette={getStatusColor(b.status)} variant="solid" px={3} py={1} rounded="full">
                                {b.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                            Created at: {new Date().toLocaleDateString()}
                        </Text>
                    </VStack>
                </HStack>
                <VStack align="end" gap={1}>
                    <Text fontSize="xs" color="gray.400" fontWeight="bold" letterSpacing="widest">TOTAL AMOUNT</Text>
                    <Text fontSize="2xl" fontWeight="black" color="blue.600">
                        {b.total_amount.toLocaleString()} {b.currency}
                    </Text>
                </VStack>
            </HStack>

            <Separator />

            <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={8}>
                {/* Left Side: Details */}
                <GridItem colSpan={{ base: 1, lg: 2 }}>
                    <VStack align="stretch" gap={8}>

                        {/* Tour Info */}
                        <Box p={4} rounded="2xl" border="1px solid" borderColor="gray.100">
                            <HStack align="start" gap={6}>
                                <Box w="120px" h="120px" bg="gray.200" rounded="xl" overflow="hidden" flexShrink={0}>
                                    <img
                                        src={b.tour_image.startsWith('http') ? b.tour_image : `${process.env.NEXT_PUBLIC_API_BACKEND}/${b.tour_image}`}
                                        alt={b.tour_title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <VStack align="start" gap={2}>
                                    <Badge colorPalette="blue" variant="subtle">Tour Detail</Badge>
                                    <Heading size="md">{b.tour_title}</Heading>
                                    <HStack color="gray.500" fontSize="sm">
                                        <Icon as={MapPin} boxSize={3} />
                                        <Text>{b.tour_location}</Text>
                                    </HStack>
                                    <HStack gap={4} mt={2}>
                                        <HStack color="blue.600" fontWeight="bold" fontSize="sm">
                                            <Icon as={Calendar} boxSize={4} />
                                            <Text>{new Date(b.start_date).toLocaleDateString()}</Text>
                                        </HStack>
                                        <HStack color="orange.600" fontWeight="bold" fontSize="sm">
                                            <Icon as={Clock} boxSize={4} />
                                            <Text>{b.session_start_time || 'N/A'}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Box>

                        {/* Items Table */}
                        <Box p={4} rounded="2xl" border="1px solid" borderColor="gray.100">
                            <HStack mb={4}>
                                <Icon as={Package} color="blue.500" />
                                <Heading size="sm">Items Summary</Heading>
                            </HStack>
                            <Table.Root variant="line">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeader>Description</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="center">Quantity</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="right">Unit Price</Table.ColumnHeader>
                                        <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
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
                                                {item.unit_price.toLocaleString()} {b.currency}
                                            </Table.Cell>
                                            <Table.Cell textAlign="right" fontWeight="bold">
                                                {item.total_amount.toLocaleString()} {b.currency}
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
                                    <Heading size="sm">Passenger List</Heading>
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
                    <VStack align="stretch" gap={6}>
                        {/* Contact Card */}
                        <Box p={4} rounded="2xl" border="1px solid" borderColor="gray.100">
                            <Heading size="sm" mb={4}>Contact Information</Heading>
                            <VStack align="stretch" gap={4}>
                                <HStack gap={3}>
                                    <Icon as={User} color="gray.400" boxSize={4} />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.400">Full Name</Text>
                                        <Text fontWeight="semibold">{b.contact_name}</Text>
                                    </VStack>
                                </HStack>
                                <HStack gap={3}>
                                    <Icon as={Mail} color="gray.400" boxSize={4} />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.400">Email Address</Text>
                                        <Text fontWeight="semibold">{b.contact_email}</Text>
                                    </VStack>
                                </HStack>
                                <HStack gap={3}>
                                    <Icon as={Phone} color="gray.400" boxSize={4} />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.400">Phone Number</Text>
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
                                    {b.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                                </Badge>
                            </HStack>
                            <VStack align="start" gap={4}>
                                <Box>
                                    <Text fontSize="xs" color="blue.100" fontWeight="bold" letterSpacing="widest">METHOD</Text>
                                    <Text fontSize="md" fontWeight="bold">
                                        {b.booking_payment?.payment_method_name || b.payment_method || 'N/A'}
                                    </Text>
                                </Box>
                                {b.payment_information && (
                                    <HStack justify="space-between" w="full">
                                        <Box>
                                            <Text fontSize="xs" color="blue.100" fontWeight="bold" letterSpacing="widest">CARD</Text>
                                            <Text fontWeight="bold">**** {b.payment_information.last4}</Text>
                                        </Box>
                                        <Box textAlign="right">
                                            <Text fontSize="xs" color="blue.100" fontWeight="bold" letterSpacing="widest">BRAND</Text>
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
