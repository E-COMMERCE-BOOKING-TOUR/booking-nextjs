"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, Icon, Badge, SimpleGrid, Steps, DownloadTrigger } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { IBookingDetail } from "@/types/booking";
import { BookingSummaryCard } from "@/components/ui/user/BookingSummaryCard";
import bookingApi from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { useSession } from "next-auth/react";

interface Props {
    initialBooking: IBookingDetail;
}

const steps = [
    { label: "Input information", description: "Please provide your contact and traveler information" },
    { label: "Payment method", description: "Select your payment method" },
    { label: "Confirmation", description: "Review your booking information" },
    { label: "Complete", description: "Your booking is complete" },
];

export default function CheckoutCompleteClient({ initialBooking }: Props) {
    const router = useRouter();
    const { data: session } = useSession();

    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
    const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

    const fetchDownloadData = async (type: 'receipt' | 'invoice') => {
        const setLoading = type === 'receipt' ? setIsDownloadingReceipt : setIsDownloadingInvoice;
        setLoading(true);
        try {
            const blob = type === 'receipt'
                ? await bookingApi.downloadReceipt(initialBooking.id, session?.user?.accessToken)
                : await bookingApi.downloadInvoice(initialBooking.id, session?.user?.accessToken);
            return blob;
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "Error",
                description: `Failed to download ${type}. Please try again later.`,
                type: "error",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="2xl" position="relative" py={10}>
            {/* Steps: Success State by defaultStep 3 (last one), optionally colorPalette="green" */}
            <Steps.Root defaultStep={3} count={steps.length} colorPalette="green" my="2rem" paddingX="3rem" width="100%">
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
                        {/* Success Message */}
                        <Box p={8} borderRadius="15px" textAlign="center">
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
                                <DownloadTrigger
                                    data={() => fetchDownloadData('receipt')}
                                    fileName={`receipt-${initialBooking.id}.pdf`}
                                    mimeType="application/pdf"
                                    asChild
                                >
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        loading={isDownloadingReceipt}
                                    >
                                        Download Receipt
                                    </Button>
                                </DownloadTrigger>
                            </Stack>
                        </Box>

                        {/* What's next */}
                        <Box p={8} pt={0} borderRadius="15px">
                            <Heading as="h3" fontSize="xl" mb={4}>What's next?</Heading>
                            <Stack gap={3}>
                                <Button variant="outline" onClick={() => router.push("/")}>
                                    Plan Another Trip
                                </Button>
                                <DownloadTrigger
                                    data={() => fetchDownloadData('invoice')}
                                    fileName={`invoice-${initialBooking.id}.pdf`}
                                    mimeType="application/pdf"
                                    asChild
                                >
                                    <Button
                                        variant="outline"
                                        loading={isDownloadingInvoice}
                                    >
                                        Download Invoice (PDF)
                                    </Button>
                                </DownloadTrigger>
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>

                <Stack gridColumn={{ base: "1 / -1", md: "9 / -1" }}>
                    <BookingSummaryCard booking={initialBooking} />
                </Stack>
            </SimpleGrid>
        </Container>
    );
}
