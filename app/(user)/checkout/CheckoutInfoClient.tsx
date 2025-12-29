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
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingSummaryCard } from "@/components/ui/user/BookingSummaryCard";
import { useBookingExpiry } from "@/hooks/useBookingExpiry";
import { BookingExpiryManager } from "@/components/ui/user/BookingExpiryManager";
import { useTranslation } from "@/libs/i18n/client";
import { fallbackLng } from "@/libs/i18n/settings";

import { useSearchParams } from "next/navigation";

interface Props {
    initialBooking: IBookingDetail;
    lng?: string;
}

export default function CheckoutInfoClient({ initialBooking, lng: propLng }: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const lng = propLng || searchParams?.get('lng') || fallbackLng;
    const { t } = useTranslation(lng as string);

    const steps: { label: string; description: string }[] = [
        {
            label: t('checkout_step_info', { defaultValue: "Input information" }),
            description: t('checkout_step_info_desc', { defaultValue: "Please provide your contact and traveler information" }),
        },
        {
            label: t('checkout_step_payment', { defaultValue: "Payment method" }),
            description: t('checkout_step_payment_desc', { defaultValue: "Select your payment method" }),
        },
        {
            label: t('checkout_step_confirm', { defaultValue: "Confirmation" }),
            description: t('checkout_step_confirm_desc', { defaultValue: "Review your booking information" }),
        },
        {
            label: t('checkout_step_complete', { defaultValue: "Complete" }),
            description: t('checkout_step_complete_desc', { defaultValue: "Your booking is complete" }),
        },
    ];

    const checkoutInfoSchema = z.object({
        contact_name: z.string().min(1, t('full_name_required', { defaultValue: "Full name is required" })),
        contact_email: z.string().email(t('invalid_email', { defaultValue: "Invalid email address" })),
        contact_phone: z.string().min(1, t('phone_required', { defaultValue: "Phone number is required" })),
        passengers: z.array(z.object({
            full_name: z.string().min(1, t('traveler_name_required', { defaultValue: "Traveler name is required" })),
            phone_number: z.string().optional(),
        })),
        agree_terms: z.boolean().refine((val) => val, { message: t('agree_terms_required', { defaultValue: "You must agree to the terms and conditions" }) }),
    });

    type CheckoutInfoFormData = z.infer<typeof checkoutInfoSchema>;


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
        control: formControl,
        formState: { errors },
    } = useForm<CheckoutInfoFormData>({
        resolver: zodResolver(checkoutInfoSchema),
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

    const passengers = useWatch({ control: formControl, name: "passengers" });

    const { isExpired, handleExpire } = useBookingExpiry(initialBooking.hold_expires_at);

    // Update contact info mutation
    const updateContactMutation = useMutation({
        mutationFn: async (data: UpdateContactDTO) => {
            const res = await bookingApi.updateContact(data, session?.user?.accessToken);
            if (!res.ok) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            toaster.create({
                title: t('contact_saved_toast', { defaultValue: "Contact information saved" }),
                type: "success",
            });
            router.push("/checkout/payment");
        },
        onError: (error: Error) => {
            toaster.create({
                title: t('failed_save_contact', { defaultValue: "Failed to save contact information" }),
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
                    title: t('booking_cancelled', { defaultValue: "Booking cancelled" }),
                    description: t('inventory_released', { defaultValue: "Your booking has been cancelled and inventory hold released." }),
                    type: "success",
                });
                handleExpire(); // Ensure cleanup
                router.push("/");
            } else {
                toaster.create({
                    title: t('failed_cancel_booking', { defaultValue: "Failed to cancel booking" }),
                    description: result.error,
                    type: "error",
                });
            }
        },
        onError: (error: Error) => {
            toaster.create({
                title: t('failed_cancel_booking', { defaultValue: "Failed to cancel booking" }),
                description: error.message,
                type: "error",
            });
        },
    });

    const onSubmit = (data: CheckoutInfoFormData) => {
        // Block API calls if booking has expired
        if (isExpired) {
            toaster.create({
                title: t('booking_expired_title', { defaultValue: "Booking expired" }),
                description: t('booking_expired_desc', { defaultValue: "Your booking hold has expired. Please start a new booking." }),
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
        <Container maxW="xl" position="relative">
            <BookingExpiryManager isExpired={isExpired} onExpire={handleExpire} expiresAt={initialBooking.hold_expires_at} lng={lng as string} />
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
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">{t('contact_info_title', { defaultValue: "Contact information" })}</Heading>
                            <Text mt={2} color="fg.muted">{t('contact_info_desc', { defaultValue: "We'll send booking confirmation and updates to this contact" })}</Text>
                            <Stack mt={4} gap={4}>
                                <InputUser
                                    label={t('full_name_label', { defaultValue: "Full name" })}
                                    placeholder={t('full_name_placeholder', { defaultValue: "Enter your full name" })}
                                    isRequired
                                    error={errors.contact_name?.message}
                                    {...register("contact_name")}
                                />
                                <InputUser
                                    label={t('email_label', { defaultValue: "Email" })}
                                    placeholder={t('email_placeholder', { defaultValue: "Enter your email" })}
                                    isRequired
                                    error={errors.contact_email?.message}
                                    {...register("contact_email")}
                                />
                                <InputUser
                                    label={t('phone_label', { defaultValue: "Phone" })}
                                    placeholder={t('phone_placeholder', { defaultValue: "+84 90 123 4567" })}
                                    isRequired
                                    error={errors.contact_phone?.message}
                                    helperText={t('phone_helper', { defaultValue: "We'll only contact you with essential updates or changes to your booking" })}
                                    {...register("contact_phone")}
                                />
                            </Stack>
                        </Box>
                        <Box p={5} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">{t('traveler_details_title', { defaultValue: "Traveler details" })}</Heading>
                            <Text mt={2} color="fg.muted">{t('traveler_details_desc', { defaultValue: "Enter the names of all travelers as they appear on their ID" })}</Text>
                            <Stack mt={4} gap={4}>
                                {passengers?.map((passenger, index) => (
                                    <Stack key={index} gap={1}>
                                        <InputUser
                                            label={t('traveler_label', {
                                                index: index + 1,
                                                type: passengerStructure[index]?.pax_type_name,
                                                defaultValue: `Traveler ${index + 1} - ${passengerStructure[index]?.pax_type_name}`
                                            })}
                                            placeholder={t('name_placeholder', { defaultValue: "Full legal name" })}
                                            isRequired
                                            error={errors.passengers?.[index]?.full_name?.message}
                                            {...register(`passengers.${index}.full_name`)}
                                        />
                                        <InputUser
                                            placeholder={t('phone_optional_placeholder', { defaultValue: "Phone number (optional)" })}
                                            {...register(`passengers.${index}.phone_number`)}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                        <Box p={5} borderRadius="15px" paddingTop={0}>
                            <Controller
                                control={formControl}
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
                                            <Checkbox.Label>{t('agree_terms_label', { defaultValue: "I agree to the terms and conditions" })}</Checkbox.Label>
                                            <Box textStyle="sm" color="fg.muted">
                                                {t('terms_privacy_notice', { defaultValue: "By clicking this, you agree to our Terms and Privacy Policy." })}
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
                                {t('cancel_booking', { defaultValue: "Cancel Booking" })}
                            </Button>
                            <Button
                                size="lg"
                                type="submit"
                                flex={1}
                                loading={updateContactMutation.isPending}
                                disabled={cancelBookingMutation.isPending}
                            >
                                {t('continue_to_payment', { defaultValue: "Continue to Payment" })}
                            </Button>
                        </Flex>
                    </form>
                </Stack>
                <Stack gridColumn={{ base: "1 / -1", md: "9 / -1" }}>
                    <BookingSummaryCard booking={initialBooking} lng={lng as string} />
                </Stack>
            </SimpleGrid>

        </Container>
    );
}

