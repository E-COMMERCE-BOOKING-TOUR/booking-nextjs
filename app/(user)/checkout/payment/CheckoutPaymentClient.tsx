"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, RadioGroup } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { UpdatePaymentDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { numberFormat } from "@/libs/function";
import { IBookingDetail, IPaymentMethod } from "@/types/booking";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function CheckoutPaymentClient({ initialBooking, paymentMethods }: Props) {
    const router = useRouter();
    const { data: session } = useSession();

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
        <Container maxW="2xl" py={10}>
            <Heading as="h1" size="2xl" mb={2}>Checkout - Step 2 of 3</Heading>
            <Text color="fg.muted" mb={8}>Select your payment method</Text>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack gap={6}>
                    <Box bg="white" p={8} borderRadius="15px">
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
                    </Box>

                    {selectedPayment && (
                        <Box bg="blue.50" p={4} borderRadius="md">
                            <Text fontWeight="semibold" color="blue.800">
                                Selected: {selectedPayment.payment_method_name}
                            </Text>
                        </Box>
                    )}

                    <Flex justify="space-between" gap={3}>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push("/checkout")}
                        >
                            Back to Details
                        </Button>
                        <Button
                            size="lg"
                            colorPalette="blue"
                            type="submit"
                            loading={updatePaymentMutation.isPending}
                            disabled={!selectedPaymentId || paymentMethods.length === 0}
                        >
                            Continue to Review ({numberFormat(initialBooking.total_amount)} {initialBooking.currency})
                        </Button>
                    </Flex>
                </Stack>
            </form>
        </Container>
    );
}
