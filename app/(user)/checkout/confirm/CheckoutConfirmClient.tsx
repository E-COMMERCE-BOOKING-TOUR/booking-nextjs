"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, DataList, VStack, HStack, Image } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { numberFormat } from "@/libs/function";
import { IBookingDetail } from "@/types/booking";

interface Props {
    initialBooking: IBookingDetail;
}

export default function CheckoutConfirmClient({ initialBooking }: Props) {
    const router = useRouter();
    const { data: session } = useSession();

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
        confirmMutation.mutate();
    };

    return (
        <Container maxW="2xl" py={10}>
            <Heading as="h1" size="2xl" mb={2}>Checkout - Step 3 of 3</Heading>
            <Text color="fg.muted" mb={8}>Review your booking details and confirm</Text>

            <Stack gap={6}>
                {/* Booking Summary */}
                <Box bg="white" p={8} borderRadius="15px">
                    <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4}>Booking Summary</Heading>
                    <HStack align="start" gap={4}>
                        <Image
                            src={initialBooking.tour_image}
                            alt={initialBooking.tour_title}
                            width={120}
                            height={120}
                            objectFit="cover"
                            borderRadius="md"
                        />
                        <VStack align="start" flex={1}>
                            <Text fontSize="lg" fontWeight="bold">{initialBooking.tour_title}</Text>
                            <Text color="fg.muted">{initialBooking.tour_location}</Text>
                            <Text fontSize="xl" fontWeight="bold" color="blue.600">
                                {numberFormat(initialBooking.total_amount)} {initialBooking.currency}
                            </Text>
                        </VStack>
                    </HStack>

                    <DataList.Root mt={6}>
                        <DataList.Item>
                            <DataList.ItemLabel>Date</DataList.ItemLabel>
                            <DataList.ItemValue>
                                {new Date(initialBooking.start_date).toLocaleDateString()}
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
                                {initialBooking.items.map((item, idx) => (
                                    <Text key={idx}>{item.quantity} x {item.pax_type_name}</Text>
                                ))}
                            </DataList.ItemValue>
                        </DataList.Item>
                    </DataList.Root>
                </Box>

                {/* Contact Information */}
                <Box bg="white" p={8} borderRadius="15px">
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

                {/* Total */}
                <Box bg="white" p={8} borderRadius="15px">
                    <Flex justify="space-between" align="center">
                        <Heading as="h3" fontSize="xl">Total Amount</Heading>
                        <VStack align="end">
                            <Text fontSize="2xl" fontWeight="bold">
                                {numberFormat(initialBooking.total_amount)} {initialBooking.currency}
                            </Text>
                            <Text fontSize="sm" color="fg.muted">All taxes and fees included</Text>
                        </VStack>
                    </Flex>
                </Box>

                <Flex justify="space-between" gap={3}>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.push("/checkout/payment")}
                    >
                        Back to Payment
                    </Button>
                    <Button
                        size="lg"
                        colorPalette="green"
                        onClick={handleConfirm}
                        loading={confirmMutation.isPending}
                    >
                        Confirm Booking
                    </Button>
                </Flex>
            </Stack>
        </Container>
    );
}
