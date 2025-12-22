"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Box, Button, Container, Heading, Stack, Text, Flex, Steps, SimpleGrid, Checkbox } from "@chakra-ui/react";
import { InputUser } from "@/components/ui/user/form/input";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { UpdateContactDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { IBookingDetail } from "@/types/booking";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { BookingSummaryCard } from "@/components/ui/user/BookingSummaryCard";
import { useBookingExpiry } from "@/hooks/useBookingExpiry";
import { BookingExpiryManager } from "@/components/ui/user/BookingExpiryManager";

// Zod schema for form validation
const passengerSchema = z.object({
    full_name: z.string().min(1, "Traveler name is required"),
    phone_number: z.string().optional(),
});

const checkoutInfoSchema = z.object({
    contact_name: z.string().min(1, "Full name is required"),
    contact_email: z.string().email("Invalid email address"),
    contact_phone: z.string().min(1, "Phone number is required"),
    passengers: z.array(passengerSchema),
    agree_terms: z.boolean().refine((val) => val, { message: "You must agree to the terms and conditions" }),
});

type CheckoutInfoFormData = z.infer<typeof checkoutInfoSchema>;

interface Props {
    initialBooking: IBookingDetail;
}

const steps: { label: string; description: string }[] = [
    {
        label: "Input information",
        description: "Please provide your contact and traveler information",
    },
    {
        label: "Payment method",
        description: "Select your payment method",
    },
    {
        label: "Confirmation",
        description: "Review your booking information",
    },
    {
        label: "Complete",
        description: "Your booking is complete",
    },
];

export default function CheckoutInfoClient({ initialBooking }: Props) {
    const router = useRouter();
    const { data: session } = useSession();


    // Helper to determine passenger structure based on booking items
    const passengerStructure = useMemo(() => {
        return initialBooking.items.flatMap(item =>
            Array(item.quantity).fill({
                pax_type_name: item.pax_type_name
            })
        );
    }, [initialBooking.items]);

    const {
        register,
        handleSubmit,
        getValues,
        control,
        formState: { errors },
    } = useForm<CheckoutInfoFormData>({
        resolver: standardSchemaResolver(checkoutInfoSchema),
        defaultValues: {
            contact_name: initialBooking.contact_name || "",
            contact_email: initialBooking.contact_email || "",
            contact_phone: initialBooking.contact_phone || "",
            passengers: initialBooking.passengers?.length > 0
                ? initialBooking.passengers.map(p => ({
                    full_name: p.full_name,
                    phone_number: p.phone_number || "",
                }))
                : passengerStructure.map(() => ({
                    full_name: "",
                    phone_number: "",
                })),
            agree_terms: false,
        },
    });



    const { isExpired, handleExpire } = useBookingExpiry(initialBooking.hold_expires_at);

    // Update contact info mutation
    const updateContactMutation = useMutation({
        mutationFn: (data: UpdateContactDTO) => bookingApi.updateContact(data, session?.user?.accessToken),
        onSuccess: () => {
            toaster.create({
                title: "Contact information saved",
                type: "success",
            });
            // Keep expiry in localStorage as user proceeds to payment
            router.push("/checkout/payment");
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Failed to save contact information",
                description: error.message,
                type: "error",
            });
        },
    });

    // Cancel booking mutation
    const cancelBookingMutation = useMutation({
        mutationFn: () => bookingApi.cancelCurrent(session?.user?.accessToken),
        onSuccess: (result) => {
            if (result.ok) {
                toaster.create({
                    title: "Booking cancelled",
                    description: "Your booking has been cancelled and inventory hold released.",
                    type: "success",
                });
                handleExpire(); // Ensure cleanup
                router.push("/");
            } else {
                toaster.create({
                    title: "Failed to cancel booking",
                    description: result.error,
                    type: "error",
                });
            }
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Failed to cancel booking",
                description: error.message,
                type: "error",
            });
        },
    });

    const onSubmit = (data: CheckoutInfoFormData) => {
        // Block API calls if booking has expired
        if (isExpired) {
            toaster.create({
                title: "Booking expired",
                description: "Your booking hold has expired. Please start a new booking.",
                type: "error",
            });
            return;
        }
        updateContactMutation.mutate({
            contact_name: data.contact_name,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            passengers: data.passengers,
        });
    };

    console.log("isExpired", isExpired);

    return (
        <Container maxW="2xl" position="relative">
            <BookingExpiryManager isExpired={isExpired} onExpire={handleExpire} expiresAt={initialBooking.hold_expires_at} />
            <Steps.Root defaultStep={0} colorPalette="blue" my="2rem" paddingX="3rem" width="100%">
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
                <Stack gridColumn={{ base: "1 / -1", md: "1 / 9" }} boxShadow="sm" rounded="2xl" marginBottom="2rem">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Box p={5} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Contact information</Heading>
                            <Text mt={2} color="fg.muted">We&apos;ll send booking confirmation and updates to this contact</Text>
                            <Stack mt={4} gap={4}>
                                <InputUser
                                    label="Full name"
                                    placeholder="Enter your full name"
                                    isRequired
                                    error={errors.contact_name?.message}
                                    {...register("contact_name")}
                                />
                                <InputUser
                                    label="Email"
                                    placeholder="Enter your email"
                                    isRequired
                                    error={errors.contact_email?.message}
                                    {...register("contact_email")}
                                />
                                <InputUser
                                    label="Phone"
                                    placeholder="+84 90 123 4567"
                                    isRequired
                                    error={errors.contact_phone?.message}
                                    helperText="We'll only contact you with essential updates or changes to your booking"
                                    {...register("contact_phone")}
                                />
                            </Stack>
                        </Box>
                        <Box p={5} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Traveler details</Heading>
                            <Text mt={2} color="fg.muted">Enter the names of all travelers as they appear on their ID</Text>
                            <Stack mt={4} gap={4}>
                                {getValues("passengers").map((passenger, index) => (
                                    <Stack key={index} gap={1}>
                                        <InputUser
                                            label={`Traveler ${index + 1} - ${passengerStructure[index]?.pax_type_name}`}
                                            placeholder="Full legal name"
                                            isRequired
                                            error={errors.passengers?.[index]?.full_name?.message}
                                            {...register(`passengers.${index}.full_name`)}
                                        />
                                        <InputUser
                                            placeholder="Phone number (optional)"
                                            {...register(`passengers.${index}.phone_number`)}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                        <Box p={5} borderRadius="15px" paddingTop={0}>
                            <Controller
                                control={control}
                                name="agree_terms"
                                render={({ field }) => (
                                    <Checkbox.Root
                                        gap="4"
                                        alignItems="flex-start"
                                        invalid={!!errors.agree_terms?.message}
                                        checked={field.value}
                                        onCheckedChange={({ checked }) => field.onChange(checked)}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Stack gap="1">
                                            <Checkbox.Label>I agree to the terms and conditions</Checkbox.Label>
                                            <Box textStyle="sm" color="fg.muted">
                                                By clicking this, you agree to our Terms and Privacy Policy.
                                            </Box>
                                        </Stack>
                                    </Checkbox.Root>
                                )}
                            />
                        </Box>
                        <Flex justify="space-between" p={5} paddingTop={0} gap={4}>
                            <Button
                                size="lg"
                                variant="outline"
                                colorPalette="red"
                                onClick={() => cancelBookingMutation.mutate()}
                                loading={cancelBookingMutation.isPending}
                                disabled={updateContactMutation.isPending}
                            >
                                Cancel Booking
                            </Button>
                            <Button
                                size="lg"
                                type="submit"
                                flex={1}
                                loading={updateContactMutation.isPending}
                                disabled={cancelBookingMutation.isPending}
                            >
                                Continue to Payment
                            </Button>
                        </Flex>
                    </form>
                </Stack>
                <Stack gridColumn={{ base: "1 / -1", md: "9 / -1" }}>
                    <BookingSummaryCard booking={initialBooking} />
                </Stack>
            </SimpleGrid>

        </Container >
    );
}

