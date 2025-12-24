"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, RadioGroup, Steps, SimpleGrid } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { UpdatePaymentDTO } from "@/apis/booking";
import { userApi } from "@/apis/user";
import { toaster } from "@/components/chakra/toaster";
import { numberFormat } from "@/libs/function";
import { IBookingDetail, IPaymentMethod } from "@/types/booking";
import { PaymentCardID } from "@/types/payment";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingSummaryCard } from "@/components/ui/user/BookingSummaryCard";
import { useBookingExpiry } from "@/hooks/useBookingExpiry";
import { BookingExpiryManager } from "@/components/ui/user/BookingExpiryManager";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "@/libs/stripe";
import { StripeCardForm } from "@/components/ui/user/StripeCardForm";
import { useState } from "react";

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
    // const max = Number(method.rule_max) || Infinity;
    const ruleMax = Number(method.rule_max) || 0;

    // Logic aligned with backend
    if (totalAmount < min) return false;
    if (ruleMax > 0 && totalAmount > ruleMax) return false;

    return true;
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

const stripePromise = getStripe();

export default function CheckoutPaymentClient({ initialBooking, paymentMethods }: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const { isExpired, handleExpire } = useBookingExpiry(initialBooking.hold_expires_at);
    const [isCardSaved, setIsCardSaved] = useState<boolean>(!!initialBooking.payment_information);

    // Find first eligible payment method as default
    const defaultPaymentId = paymentMethods.find(m =>
        isPaymentMethodEligible(m, initialBooking.total_amount)
    )?.id || 0;

    const {
        handleSubmit,
        setValue,
        formState: { errors },
        control,
    } = useForm<CheckoutPaymentFormData>({
        resolver: zodResolver(checkoutPaymentSchema),
        defaultValues: {
            booking_payment_id: defaultPaymentId,
        },
    });

    const selectedPaymentId = useWatch({ control, name: "booking_payment_id" });
    // const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentId);

    // Check if Credit Card is selected
    const isCreditCard = selectedPaymentId === PaymentCardID.CREDIT_CARD;

    const updatePaymentMutation = useMutation({
        mutationFn: (data: UpdatePaymentDTO) => bookingApi.updatePayment(data, session?.user?.accessToken),
        onSuccess: () => {
            toaster.create({
                title: "Payment method saved",
                type: "success",
            });
            router.push("/checkout/confirm");
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Failed to save payment method",
                description: error.message,
                type: "error",
            });
        },
    });

    const addCardMutation = useMutation({
        mutationFn: (token: string) => userApi.addCard(token, session?.user?.accessToken as string),
        onSuccess: () => {
            setIsCardSaved(true);
            toaster.create({
                title: "Card saved successfully",
                type: "success"
            });
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Failed to save card info",
                description: error.message,
                type: "error"
            });
        }
    });

    const onCardSaved = (token: string) => {
        addCardMutation.mutate(token);
    };

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

        // If Credit Card selected but not saved
        if (isCreditCard && !isCardSaved) {
            toaster.create({
                title: "Please save your card details first",
                type: "error"
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
            // Reset saved info if switching away/back (optional, but safer to keep unless explicitly cleared)
            // But if they switch methods, the saved ID is only relevant for Credit Card.
        }
    };
    console.log(initialBooking.currency)

    return (
        <Elements stripe={stripePromise}>
            <Container maxW="xl" position="relative" py={10}>
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
                                <Heading as="h2" fontSize="2xl" fontWeight="bold">Choose how you&apos;d like to pay</Heading>
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

                                                        {/* Stripe Form Rendered HERE if this method is selected AND it is CREDIT_CARD */}
                                                        {selectedPaymentId === method.id && method.id === PaymentCardID.CREDIT_CARD && (
                                                            <Box mt={4} pl={6} onClick={(e) => e.stopPropagation()}>
                                                                {!isCardSaved ? (
                                                                    <StripeCardForm onSuccess={onCardSaved} currency={initialBooking.currency} />
                                                                ) : (
                                                                    <Box p={3} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="md">
                                                                        <Flex justify="space-between" align="center">
                                                                            <Box>
                                                                                <Text color="green.700" fontWeight="medium">Card details linked successfully</Text>
                                                                                {initialBooking.payment_information && (
                                                                                    <Text fontSize="xs" color="green.600">
                                                                                        {initialBooking.payment_information.brand} ending in {initialBooking.payment_information.last4}
                                                                                    </Text>
                                                                                )}
                                                                            </Box>
                                                                            <Button size="xs" variant="ghost" colorPalette="green" onClick={() => setIsCardSaved(false)}>
                                                                                Use Another Card
                                                                            </Button>
                                                                        </Flex>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </RadioGroup.Root>
                                )}
                                {errors.booking_payment_id && (
                                    <Text color="red.500" fontSize="sm" mt={2}>{errors.booking_payment_id.message}</Text>
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
                                    disabled={!selectedPaymentId || paymentMethods.length === 0 || (isCreditCard && !isCardSaved)}
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
        </Elements>
    );
}
