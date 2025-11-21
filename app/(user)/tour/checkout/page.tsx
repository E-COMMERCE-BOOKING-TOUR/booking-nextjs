"use client";

import { useState, useEffect, ReactNode } from "react";
import { Box, Button, Container, Grid, Steps, GridItem, Alert, Text, Heading, Stack, Flex, Checkbox, DataList, VStack, Image, HStack, RadioGroup, Icon, Badge, Spinner } from "@chakra-ui/react";
import { InputUser } from "@/components/ui/user/form/input";
import { InfoTip } from "@/components/chakra/toggleTip";
import { FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import bookingApi from "@/apis/booking";
import { IBookingDetail } from "@/types/booking";
import { toaster } from "@/components/chakra/toaster";
import { numberFormat } from "@/libs/function";
import { useSession } from "next-auth/react";

const steps = [
    { title: "Traveler details", description: "Provide traveler and participant information" },
    { title: "Payment", description: "Securely complete your purchase" },
    { title: "Confirmation", description: "Review your tickets and next steps" },
];

const paymentMethods: { value: string; title: string; description: string; }[] = [
    {
        value: "card",
        title: "Credit or debit card",
        description: "Visa, Mastercard, Amex, JCB",
    },
    {
        value: "wallet",
        title: "E-wallet or QR payment",
        description: "MoMo, ZaloPay, VNPay",
    },
    {
        value: "bank",
        title: "Bank transfer",
        description: "Processing may take up to 24h",
    },
];

const whatsNext: { title: string; description: string; }[] = [
    {
        title: "E-voucher sent to your inbox",
        description: "We emailed your tickets and receipt to hello@traveler.com.",
    },
    {
        title: "Add the tour to your calendar",
        description: "Reminder set for Friday, October 31, 2025 at 11:40 AM.",
    },
    {
        title: "We're here if you need us",
        description: "Call us any time at +84 96 000 888 for urgent changes.",
    },
];

interface PassengerInfo {
    full_name: string;
    phone_number: string;
}

export default function Checkout() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");
    const [step, setStep] = useState(0);
    const { data: session } = useSession();

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ["booking", bookingId, session?.user?.accessToken],
        queryFn: () => bookingApi.getDetail(Number(bookingId), session?.user?.accessToken),
        enabled: !!bookingId && !!session?.user?.accessToken,
    });

    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<string>("");

    useEffect(() => {
        if (booking) {
            setContactName(booking.contact_name || "");
            setContactEmail(booking.contact_email || "");
            setContactPhone(booking.contact_phone || "");

            // Initialize passengers based on booking items
            const initialPassengers: PassengerInfo[] = [];
            booking.items.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    initialPassengers.push({
                        full_name: "",
                        phone_number: "",
                    });
                }
            });
            setPassengers(initialPassengers);
        }
    }, [booking]);

    // Countdown timer for hold expiration
    useEffect(() => {
        if (!booking?.hold_expires_at) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const expiresAt = new Date(booking.hold_expires_at!).getTime();
            const diff = expiresAt - now;

            if (diff <= 0) {
                setTimeRemaining("Expired");
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [booking?.hold_expires_at]);

    const confirmMutation = useMutation({
        mutationFn: (data: any) => bookingApi.confirm(data, session?.user?.accessToken),
        onSuccess: () => {
            setStep(2);
            toaster.create({
                title: "Booking confirmed",
                type: "success",
            });
        },
        onError: (error) => {
            toaster.create({
                title: "Confirmation failed",
                description: error.message,
                type: "error",
            });
        },
    });

    const handleNext = () => {
        if (step === 0) {
            // Validate step 0
            if (!contactName || !contactEmail || !contactPhone) {
                toaster.create({ title: "Please fill in all contact information", type: "error" });
                return;
            }
            // Validate passengers
            const emptyPassengers = passengers.filter(p => !p.full_name.trim());
            if (emptyPassengers.length > 0) {
                toaster.create({ title: "Please fill in all traveler names", type: "error" });
                return;
            }
            setStep(1);
        } else if (step === 1) {
            // Confirm booking
            if (!bookingId) return;
            confirmMutation.mutate({
                booking_id: Number(bookingId),
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                payment_method: paymentMethod,
            });
        }
    };

    const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
        setPassengers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    if (isLoading) return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>;
    if (error || !booking) return <Container maxW="2xl" py={10}><Alert.Root status="error"><Alert.Title>Error loading booking details</Alert.Title></Alert.Root></Container>;

    const bookingData = booking;

    return <Container maxW="2xl">
        <Steps.Root count={steps.length} step={step}>
            <Steps.List mx="5rem" my={8}>
                {steps.map((s, index) => (
                    <Steps.Item key={index} index={index} title={s.title}>
                        <Steps.Indicator />
                        <Box>
                            <Steps.Title>{s.title}</Steps.Title>
                            <Steps.Description>{s.description}</Steps.Description>
                        </Box>
                        <Steps.Separator />
                    </Steps.Item>
                ))}
            </Steps.List>
            <Alert.Root status="info" title="Timed reservation">
                <Alert.Indicator />
                <Alert.Title>We'll hold your spot for <Text as="span" fontWeight="bold">{timeRemaining || "calculating..."}</Text></Alert.Title>
            </Alert.Root>

            {/* Step 0: Traveler Details */}
            <Steps.Content index={0} mb={8}>
                <Grid templateColumns="repeat(6, 1fr)" gap={4}>
                    <GridItem as={Flex} flexDirection="column" colSpan={{ base: 6, xl: 4 }} gap={4}>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Contact information</Heading>
                            <Text mt={2} color="fg.muted">We'll send booking confirmation and updates to this contact</Text>
                            <Stack mt={4} gap={4}>
                                <InputUser label="Full name" placeholder="Enter your full name" isRequired value={contactName} onChange={(e) => setContactName(e.target.value)} />
                                <InputUser label="Email" placeholder="Enter your email" isRequired value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                                <InputUser label="Phone" placeholder="+84 90 123 4567" isRequired helperText="We'll only contact you with essential updates or changes to your booking" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                            </Stack>
                        </Box>

                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Traveler details</Heading>
                            <Text mt={2} color="fg.muted">Enter the names of all travelers as they appear on their ID</Text>
                            <Stack mt={4} gap={4}>
                                {passengers.map((passenger, index) => (
                                    <Stack key={index} gap={1}>
                                        <InputUser
                                            label={`Traveler ${index + 1}`}
                                            placeholder="Full legal name"
                                            isRequired
                                            value={passenger.full_name}
                                            onChange={(e) => updatePassenger(index, 'full_name', e.target.value)}
                                        />
                                        <InputUser
                                            placeholder="Phone number (optional)"
                                            value={passenger.phone_number}
                                            onChange={(e) => updatePassenger(index, 'phone_number', e.target.value)}
                                        />
                                    </Stack>
                                ))}
                            </Stack>

                            <Checkbox.Root gap="4" alignItems="flex-start" mt={6}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Stack gap="1">
                                    <Checkbox.Label>I agree to the terms and conditions</Checkbox.Label>
                                    <Box textStyle="sm" color="fg.muted">
                                        By clicking this, you agree to our Terms and Privacy Policy.
                                    </Box>
                                </Stack>
                            </Checkbox.Root>
                        </Box>
                    </GridItem>
                    <GridItem colSpan={{ base: 6, xl: 2 }}>
                        <SummaryAside booking={bookingData}>
                            <Button w="100%" borderRadius="15px" paddingY={6} onClick={handleNext}>Continue to payment</Button>
                        </SummaryAside>
                    </GridItem>
                </Grid>
            </Steps.Content>

            {/* Step 1: Payment */}
            <Steps.Content index={1} mb={8}>
                <Grid templateColumns="repeat(6, 1fr)" gap={4}>
                    <GridItem as={Stack} colSpan={{ base: 6, xl: 4 }} gap={4}>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Choose how you'd like to pay</Heading>
                            <Text mt={2} color="fg.muted">All transactions are encrypted and processed in {bookingData.currency}.</Text>

                            <RadioGroup.Root value={paymentMethod} onValueChange={(e) => setPaymentMethod(e.value as string)}>
                                <Stack gap={3} mt={6}>
                                    {paymentMethods.map((method) => (
                                        <RadioGroup.Item key={method.value} value={method.value}>
                                            <RadioGroup.ItemHiddenInput />
                                            <RadioGroup.ItemIndicator />
                                            <RadioGroup.ItemText>{method.title}</RadioGroup.ItemText>
                                        </RadioGroup.Item>
                                    ))}
                                </Stack>
                            </RadioGroup.Root>
                        </Box>

                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Payment details</Heading>
                            {/* Simplified payment form for demo */}
                            <Stack mt={6} gap={4}>
                                <InputUser label="Cardholder name" placeholder="Enter name exactly as it appears on card" isRequired />
                                <InputUser label="Card number" placeholder="1234 5678 9012 3456" isRequired />
                                <Grid templateColumns={{ base: "repeat(1,1fr)", md: "repeat(2, 1fr)" }} gap={4}>
                                    <InputUser label="Expiration date" placeholder="MM / YY" isRequired />
                                    <InputUser label="CVV" placeholder="3-digit code" isRequired helperText="We never store this code." />
                                </Grid>
                            </Stack>
                        </Box>
                    </GridItem>
                    <GridItem colSpan={{ base: 6, xl: 2 }}>
                        <SummaryAside booking={bookingData}>
                            <Stack direction={{ base: "column", md: "row" }} gap={3}>
                                <Button variant="outline" onClick={() => setStep(0)}>Back to details</Button>
                                <Button flex={1} colorPalette="blue" onClick={handleNext} loading={confirmMutation.isPending}>
                                    Pay {numberFormat(bookingData.total_amount)} {bookingData.currency}
                                </Button>
                            </Stack>
                        </SummaryAside>
                    </GridItem>
                </Grid>
            </Steps.Content>

            {/* Step 2: Confirmation */}
            <Steps.Content index={2} mb={8}>
                <Grid templateColumns="repeat(6, 1fr)" gap={4}>
                    <GridItem as={Stack} colSpan={{ base: 6, xl: 4 }} gap={4}>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Stack gap={4}>
                                <Badge colorPalette="green" variant="solid" px={3} py={1} borderRadius="full" width="fit-content">
                                    Paid and confirmed
                                </Badge>
                                <Flex align="center" gap={4}>
                                    <Icon as={FaCheckCircle} boxSize={10} color="green.500" />
                                    <Box>
                                        <Heading as="h2" fontSize="2xl" fontWeight="bold">You're all set!</Heading>
                                        <Text color="fg.muted">Confirmation #{bookingData.id}</Text>
                                    </Box>
                                </Flex>
                                <Text color="fg.muted">
                                    We've sent the receipt and voucher to <Text as="span" fontWeight="semibold" color="fg.emphasized">{contactEmail}</Text>. Present the QR code on arrival with a valid ID.
                                </Text>
                                <Stack direction={{ base: "column", md: "row" }} gap={3}>
                                    <Button flex={1} colorPalette="blue">View booking</Button>
                                    <Button flex={1} variant="outline">Download receipt</Button>
                                </Stack>
                            </Stack>
                        </Box>

                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Booking overview</Heading>
                            <DataList.Root mt={6}>
                                <DataList.Item>
                                    <DataList.ItemLabel>Tour</DataList.ItemLabel>
                                    <DataList.ItemValue>{bookingData.tour_title}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Date & time</DataList.ItemLabel>
                                    <DataList.ItemValue>{new Date(bookingData.start_date).toLocaleString()}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Guests</DataList.ItemLabel>
                                    <DataList.ItemValue>
                                        {bookingData.items.map(item => `${item.quantity} x Pax`).join(', ')}
                                    </DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Payment method</DataList.ItemLabel>
                                    <DataList.ItemValue>{paymentMethod === 'card' ? 'Credit Card' : paymentMethod}</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Lead traveler</DataList.ItemLabel>
                                    <DataList.ItemValue>{contactName} - {contactPhone}</DataList.ItemValue>
                                </DataList.Item>
                            </DataList.Root>
                        </Box>
                    </GridItem>
                    <GridItem colSpan={{ base: 6, xl: 2 }}>
                        <SummaryAside booking={bookingData}>
                            <Stack direction={{ base: "column", md: "row" }} gap={3}>
                                <Button flex={1} variant="outline">Download invoice (PDF)</Button>
                                <Button flex={1} colorPalette="green">Plan another trip</Button>
                            </Stack>
                        </SummaryAside>
                    </GridItem>
                </Grid>
            </Steps.Content>
        </Steps.Root>
    </Container>;
}

const SummaryAside = ({ children, booking }: { children?: ReactNode, booking: IBookingDetail }) => {
    return <Box position="sticky" top={4}>
        <Stack gap={4}>
            <BookingSummaryCard booking={booking} />
            {children}
        </Stack>
    </Box>;
};

const BookingSummaryCard = ({ booking }: { booking: IBookingDetail }) => {
    return <Box bg="white" borderRadius="15px">
        <Box p={8} border="1px solid" borderColor="gray.200">
            <Heading as="h2" fontSize="2xl" fontWeight="bold">Order summary</Heading>
            <VStack align="start" mt={4}>
                <HStack>
                    <Image src={booking.tour_image} alt="Tour" width={20} height={20} objectFit="cover" borderRadius="md" />
                    <Box flex={1}>
                        <Text fontSize="lg" fontWeight="bold">{booking.tour_title}</Text>
                        <Text>{numberFormat(booking.total_amount, false)} {booking.currency}</Text>
                    </Box>
                </HStack>
            </VStack>
            <DataList.Root orientation="horizontal" mt={4}>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Location
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        <Text>{booking.tour_location}</Text>
                    </DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Date
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        {new Date(booking.start_date).toLocaleDateString()}
                    </DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Duration days
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        {booking.duration_days}
                    </DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Guests
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        {booking.items.map((item, idx) => (
                            <Text key={idx}>{item.quantity} x {item.pax_type_name}</Text>
                        ))}
                    </DataList.ItemValue>
                </DataList.Item>
            </DataList.Root>
        </Box>
        <HStack justify="space-between" p={8} align="flex-start">
            <Heading as="h3" fontSize="xl" fontWeight="bold">Total</Heading>
            <VStack align="end">
                <Text fontSize="xl" fontWeight="bold">{numberFormat(booking.total_amount, false)} {booking.currency}</Text>
                <Text fontSize="sm" color="fg.muted">All taxes and fees included</Text>
            </VStack>
        </HStack>
    </Box>;
};
