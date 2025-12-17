"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, DataList, VStack, Icon, Badge } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { numberFormat } from "@/libs/function";
import { IBookingDetail } from "@/types/booking";

interface Props {
    initialBooking: IBookingDetail;
}

export default function CheckoutCompleteClient({ initialBooking }: Props) {
    const router = useRouter();

    return (
        <Container maxW="2xl" py={10}>
            <Stack gap={6}>
                {/* Success Message */}
                <Box bg="white" p={8} borderRadius="15px" textAlign="center">
                    <Badge colorPalette="green" variant="solid" px={4} py={2} borderRadius="full" mb={4}>
                        Paid and confirmed
                    </Badge>

                    <Flex justify="center" align="center" gap={4} mb={4}>
                        <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
                    </Flex>

                    <Heading as="h1" size="2xl" mb={2}>You're all set!</Heading>
                    <Text color="fg.muted" fontSize="lg" mb={4}>
                        Confirmation #{initialBooking.id}
                    </Text>

                    <Text color="fg.muted" mb={6}>
                        We've sent the receipt and voucher to <Text as="span" fontWeight="semibold" color="fg.emphasized">{initialBooking.contact_email}</Text>.
                        Present the QR code on arrival with a valid ID.
                    </Text>

                    <Stack direction={{ base: "column", md: "row" }} gap={3} justify="center">
                        <Button colorPalette="blue" size="lg" onClick={() => router.push("/user-order")}>
                            View My Bookings
                        </Button>
                        <Button variant="outline" size="lg">
                            Download Receipt
                        </Button>
                    </Stack>
                </Box>

                {/* Booking Overview */}
                <Box bg="white" p={8} borderRadius="15px">
                    <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={6}>Booking Overview</Heading>
                    <DataList.Root>
                        <DataList.Item>
                            <DataList.ItemLabel>Tour</DataList.ItemLabel>
                            <DataList.ItemValue>{initialBooking.tour_title}</DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Location</DataList.ItemLabel>
                            <DataList.ItemValue>{initialBooking.tour_location}</DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Date & time</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {new Date(initialBooking.start_date).toLocaleString()}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Duration</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {initialBooking.duration_days} days, {initialBooking.duration_hours} hours
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Guests</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {initialBooking.items.map(item => `${item.quantity} x ${item.pax_type_name}`).join(', ')}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Lead traveler</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {initialBooking.contact_name} - {initialBooking.contact_phone}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>Total Amount</DataList.ItemLabel>
                            <DataList.ItemValue>
                                <Text fontSize="xl" fontWeight="bold" color="green.600">
                                    {numberFormat(initialBooking.total_amount)} {initialBooking.currency}
                                </Text>
                            </DataList.ItemValue>
                        </DataList.Item>
                    </DataList.Root>
                </Box>

                {/* Action Buttons */}
                <Box bg="white" p={8} borderRadius="15px">
                    <Heading as="h3" fontSize="xl" mb={4}>What's next?</Heading>
                    <Stack gap={3}>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Plan Another Trip
                        </Button>
                        <Button variant="outline">
                            Download Invoice (PDF)
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Container>
    );
}
