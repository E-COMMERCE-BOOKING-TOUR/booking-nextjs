"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, RadioGroup, Steps, SimpleGrid } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { UpdatePaymentDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { numberFormat } from "@/libs/function";
import { IBookingDetail, IPaymentMethod } from "@/types/booking";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingSummaryCard } from "@/components/ui/user/BookingSummaryCard";
import { useBookingExpiry } from "@/hooks/useBookingExpiry";
import { BookingExpiryManager } from "@/components/ui/user/BookingExpiryManager";

// Zod schema for form validation
const checkoutPaymentSchema = z.object({
    booking_payment_id: z.number().min(1, "Please select a payment method"),
});

type CheckoutPaymentFormData = z.infer<typeof checkoutPaymentSchema>;

interface Props {
    initialBooking: IBookingDetail;
    paymentMethods: IPaymentMethod[];
}

// Helper function to check if payment method is eligible based on booking total
function isPaymentMethodEligible(method: IPaymentMethod, totalAmount: number): boolean {
    const min = Number(method.rule_min) || 0;
    const max = Number(method.rule_max) || Infinity;
    return totalAmount >= min && totalAmount <= max;
}

// Helper function to get eligibility message
function getEligibilityMessage(method: IPaymentMethod, totalAmount: number, currency: string): string | null {
    const min = Number(method.rule_min) || 0;
    const max = Number(method.rule_max) || 0;

    if (totalAmount < min) {
        return `Minimum order: ${numberFormat(min)} ${currency}`;
    }
    if (max > 0 && totalAmount > max) {
        return `Maximum order: ${numberFormat(max)} ${currency}`;
    }
    return null;
}

const steps = [
    { label: "Input information", description: "Please provide your contact and traveler information" },
    { label: "Payment method", description: "Select your payment method" },
    { label: "Confirmation", description: "Review your booking information" },
    { label: "Complete", description: "Your booking is complete" },
];

export default function CheckoutPaymentClient({ initialBooking, paymentMethods }: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const { isExpired, handleExpire } = useBookingExpiry(initialBooking.hold_expires_at);

    // Find first eligible payment method as default
    const defaultPaymentId = paymentMethods.find(m =>
        isPaymentMethodEligible(m, initialBooking.total_amount)
    )?.id || 0;

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CheckoutPaymentFormData>({
        resolver: zodResolver(checkoutPaymentSchema),
        defaultValues: {
            booking_payment_id: defaultPaymentId,
        },
    });

    const selectedPaymentId = watch("booking_payment_id");
    const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentId);

    const updatePaymentMutation = useMutation({
        mutationFn: (data: UpdatePaymentDTO) => bookingApi.updatePayment(data, session?.user?.accessToken),
        onSuccess: () => {
            toaster.create({
                title: "Payment method saved",
                type: "success",
            });
            router.push("/checkout/confirm");
        },
        onError: (error: any) => {
            toaster.create({
                title: "Failed to save payment method",
                description: error.message,
                type: "error",
            });
        },
    });

    const onSubmit = (data: CheckoutPaymentFormData) => {
        if (isExpired) {
            toaster.create({
                title: "Booking expired",
                description: "Your booking hold has expired. Please start a new booking.",
                type: "error",
            });
            return;
        }

        const selectedMethod = paymentMethods.find(m => m.id === data.booking_payment_id);
        if (!selectedMethod) {
            toaster.create({
                title: "Please select a payment method",
                type: "error",
            });
            return;
        }

        updatePaymentMutation.mutate({
            payment_method: selectedMethod.payment_method_name,
            booking_payment_id: data.booking_payment_id,
        });
    };

    const handleSelectPayment = (paymentId: number) => {
        const method = paymentMethods.find(m => m.id === paymentId);
        if (method && isPaymentMethodEligible(method, initialBooking.total_amount)) {
            setValue("booking_payment_id", paymentId);
        }
    };

    return (
        <Container maxW="2xl" position="relative" py={10}>
            <BookingExpiryManager isExpired={isExpired} onExpire={handleExpire} expiresAt={initialBooking.hold_expires_at} />
            {/* Steps */}
            <Steps.Root defaultStep={1} count={steps.length} colorPalette="blue" my="2rem" paddingX="3rem" width="100%">
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
                {/* Left Column: Payment Form */}
                <Stack gridColumn={{ base: "1 / -1", md: "1 / 9" }} boxShadow="sm" rounded="2xl" marginBottom="2rem" bg="white">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Box p={5} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Choose how you'd like to pay</Heading>
                            <Text mt={2} color="fg.muted">
                                Order total: <Text as="span" fontWeight="bold">{numberFormat(initialBooking.total_amount)} {initialBooking.currency}</Text>
                            </Text>

                            {paymentMethods.length === 0 ? (
                                <Box mt={6} p={4} bg="yellow.50" borderRadius="md">
                                    <Text color="yellow.800">No payment methods available at this time.</Text>
                                </Box>
                            ) : (
                                <RadioGroup.Root
                                    value={selectedPaymentId?.toString()}
                                    onValueChange={(e) => handleSelectPayment(Number(e.value))}
                                >
                                    <Stack gap={3} mt={6}>
                                        {paymentMethods.map((method) => {
                                            const isEligible = isPaymentMethodEligible(method, initialBooking.total_amount);
                                            const eligibilityMessage = getEligibilityMessage(method, initialBooking.total_amount, initialBooking.currency);

                                            return (
                                                <Box
                                                    key={method.id}
                                                    p={4}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    borderColor={selectedPaymentId === method.id ? "blue.500" : "gray.200"}
                                                    bg={!isEligible ? "gray.50" : "white"}
                                                    opacity={!isEligible ? 0.6 : 1}
                                                    cursor={isEligible ? "pointer" : "not-allowed"}
                                                    onClick={() => isEligible && handleSelectPayment(method.id)}
                                                    _hover={isEligible ? { borderColor: "blue.300" } : undefined}
                                                >
                                                    <RadioGroup.Item value={method.id.toString()} disabled={!isEligible}>
                                                        <RadioGroup.ItemHiddenInput />
                                                        <Flex align="center" gap={3}>
                                                            <RadioGroup.ItemIndicator />
                                                            <Box flex={1}>
                                                                <Text fontWeight="semibold" color={!isEligible ? "gray.500" : "inherit"}>
                                                                    {method.payment_method_name}
                                                                </Text>
                                                                {eligibilityMessage && (
                                                                    <Text fontSize="sm" color="red.500">
                                                                        {eligibilityMessage}
                                                                    </Text>
                                                                )}
                                                                {isEligible && Number(method.rule_min) > 0 && (
                                                                    <Text fontSize="sm" color="fg.muted">
                                                                        Min: {numberFormat(method.rule_min)} {method.currency}
                                                                        {Number(method.rule_max) > 0 && ` - Max: ${numberFormat(method.rule_max)} ${method.currency}`}
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                        </Flex>
                                                    </RadioGroup.Item>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </RadioGroup.Root>
                            )}
                            {errors.booking_payment_id && (
                                <Text color="red.500" fontSize="sm" mt={2}>{errors.booking_payment_id.message}</Text>
                            )}

                            {selectedPayment && (
                                <Box bg="blue.50" p={4} borderRadius="md" mt={4}>
                                    <Text fontWeight="semibold" color="blue.800">
                                        Selected: {selectedPayment.payment_method_name}
                                    </Text>
                                </Box>
                            )}
                        </Box>

                        <Flex justify="space-between" gap={3} p={5} pt={0}>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push("/checkout")}
                            >
                                Back to Details
                            </Button>
                            <Button
                                size="lg"
                                type="submit"
                                loading={updatePaymentMutation.isPending}
                                disabled={!selectedPaymentId || paymentMethods.length === 0}
                            >
                                Continue to Review ({numberFormat(initialBooking.total_amount)} {initialBooking.currency})
                            </Button>
                        </Flex>
                    </form>
                </Stack>

                {/* Right Column: Booking Summary */}
                <Stack gridColumn={{ base: "1 / -1", md: "9 / -1" }}>
                    <BookingSummaryCard booking={initialBooking} />
                </Stack>
            </SimpleGrid>
        </Container>
    );
}
