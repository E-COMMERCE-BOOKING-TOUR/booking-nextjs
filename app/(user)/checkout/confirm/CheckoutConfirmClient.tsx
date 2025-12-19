"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Flex, DataList, SimpleGrid, Steps, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { IBookingDetail } from "@/types/booking";
import { BookingSummaryCard } from "@/components/ui/user/BookingSummaryCard";
import { useBookingExpiry } from "@/hooks/useBookingExpiry";
import { BookingExpiryManager } from "@/components/ui/user/BookingExpiryManager";

interface Props {
    initialBooking: IBookingDetail;
}

const steps = [
    { label: "Input information", description: "Please provide your contact and traveler information" },
    { label: "Payment method", description: "Select your payment method" },
    { label: "Confirmation", description: "Review your booking information" },
    { label: "Complete", description: "Your booking is complete" },
];

export default function CheckoutConfirmClient({ initialBooking }: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const { isExpired, handleExpire } = useBookingExpiry(initialBooking.hold_expires_at);

    const confirmMutation = useMutation({
        mutationFn: () => bookingApi.confirmCurrent(session?.user?.accessToken),
        onSuccess: () => {
            toaster.create({
                title: "Booking confirmed successfully!",
                type: "success",
            });
            router.push("/checkout/complete");
        },
        onError: (error: any) => {
            toaster.create({
                title: "Failed to confirm booking",
                description: error.message,
                type: "error",
            });
        },
    });

    const handleConfirm = () => {
        if (isExpired) {
            toaster.create({
                title: "Booking expired",
                description: "Your booking hold has expired. Please start a new booking.",
                type: "error",
            });
            return;
        }
        confirmMutation.mutate();
    };

    return (
        <Container maxW="2xl" position="relative" py={10}>
            <BookingExpiryManager isExpired={isExpired} onExpire={handleExpire} expiresAt={initialBooking.hold_expires_at} />
            <Steps.Root defaultStep={2} count={steps.length} colorPalette="blue" my="2rem" paddingX="3rem" width="100%">
                <Steps.List>
                    {steps.map((step, index) => (
                        <Steps.Item key={index} index={index}>
                            <Steps.Indicator />
                            <Steps.Title>{step.label}</Steps.Title>
                            <Steps.Separator />
                        </Steps.Item>
                    ))}
                </Steps.List>
            </Steps.Root>

            <SimpleGrid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
                <Stack gridColumn={{ base: "1 / -1", md: "1 / 9" }} boxShadow="sm" rounded="2xl" marginBottom="2rem" bg="white">
                    <Stack gap={6}>
                        <Box p={5} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4}>Contact Information</Heading>
                            <DataList.Root>
                                <DataList.Item>
                                    <DataList.ItemLabel>Name</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialBooking.contact_name}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Email</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialBooking.contact_email}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Phone</DataList.ItemLabel>
                                    <DataList.ItemValue>{initialBooking.contact_phone}</DataList.ItemValue>
                                </DataList.Item>
                            </DataList.Root>
                        </Box>

                        <Box p={5} pt={0} borderRadius="15px" borderTopWidth="1px" borderColor="gray.100">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4} mt={4}>Passenger Information</Heading>
                            <Stack gap={4}>
                                {initialBooking.passengers?.map((p, idx) => (
                                    <Box key={idx} p={3} bg="gray.50" borderRadius="md">
                                        <Text fontWeight="bold">{p.full_name} ({p.pax_type_name})</Text>
                                        {p.phone_number && <Text fontSize="sm" color="fg.muted">Phone: {p.phone_number}</Text>}
                                    </Box>
                                ))}
                            </Stack>
                        </Box>

                        <Box p={5} pt={0} borderRadius="15px" borderTopWidth="1px" borderColor="gray.100">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4} mt={4}>Payment Information</Heading>
                            <DataList.Root>
                                <DataList.Item>
                                    <DataList.ItemLabel>Payment Method</DataList.ItemLabel>
                                    <DataList.ItemValue>
                                        {initialBooking.booking_payment?.payment_method_name || initialBooking.payment_method || "Not selected"}
                                    </DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Payment Status</DataList.ItemLabel>
                                    <DataList.ItemValue textTransform="capitalize">
                                        {initialBooking.payment_status}
                                    </DataList.ItemValue>
                                </DataList.Item>
                            </DataList.Root>
                        </Box>

                        <Flex justify="space-between" gap={3} p={5} pt={0}>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push("/checkout/payment")}
                            >
                                Back to Payment
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleConfirm}
                                loading={confirmMutation.isPending}
                            >
                                Confirm Booking
                            </Button>
                        </Flex>
                    </Stack>
                </Stack>

                <Stack gridColumn={{ base: "1 / -1", md: "9 / -1" }}>
                    <BookingSummaryCard booking={initialBooking} />
                </Stack>
            </SimpleGrid>
        </Container>
    );
}
