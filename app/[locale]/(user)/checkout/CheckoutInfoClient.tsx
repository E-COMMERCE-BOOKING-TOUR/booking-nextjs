"use client";

import { useRouter } from "@/i18n/navigation";
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
import { useTranslations, useLocale } from "next-intl";

interface Props {
    initialBooking: IBookingDetail;
}

export default function CheckoutInfoClient({ initialBooking }: Props) {
    const router = useRouter();
    const { data: session } = useSession();
    const locale = useLocale();
    const t = useTranslations('common');

    const steps: { label: string; description: string }[] = [
        {
            label: t('checkout_step_info'),
            description: t('checkout_step_info_desc'),
        },
        {
            label: t('checkout_step_payment'),
            description: t('checkout_step_payment_desc'),
        },
        {
            label: t('checkout_step_confirm'),
            description: t('checkout_step_confirm_desc'),
        },
        {
            label: t('checkout_step_complete'),
            description: t('checkout_step_complete_desc'),
        },
    ];

    const checkoutInfoSchema = z.object({
        contact_name: z.string().min(1, t('full_name_required')),
        contact_email: z.string().email(t('invalid_email')),
        contact_phone: z.string().min(1, t('phone_required')).regex(/^\+?\d{1,15}$/, t('phone_invalid_format')),
        passengers: z.array(z.object({
            full_name: z.string().min(1, t('traveler_name_required')),
            phone_number: z.string().optional().refine(val => !val || /^\+?\d{1,15}$/.test(val), {
                message: t('phone_invalid_format')
            }),
        })),
        agree_terms: z.boolean().refine((val) => val, { message: t('agree_terms_required') }),
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
                title: t('contact_saved_toast'),
                type: "success",
            });
            router.push("/checkout/payment");
        },
        onError: (error: Error) => {
            toaster.create({
                title: t('failed_save_contact'),
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
                    title: t('booking_cancelled'),
                    description: t('inventory_released'),
                    type: "success",
                });
                handleExpire(); // Ensure cleanup
                // Use hard navigation to ensure complete page refresh and navbar refetch
                window.location.href = "/";
            } else {
                toaster.create({
                    title: t('failed_cancel_booking'),
                    description: result.error,
                    type: "error",
                });
            }
        },
        onError: (error: Error) => {
            toaster.create({
                title: t('failed_cancel_booking'),
                description: error.message,
                type: "error",
            });
        },
    });

    const onSubmit = (data: CheckoutInfoFormData) => {
        // Block API calls if booking has expired
        if (isExpired) {
            toaster.create({
                title: t('booking_expired_title'),
                description: t('booking_expired_desc'),
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


    return (
        <Container maxW="xl" position="relative">
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
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">{t('contact_info_title')}</Heading>
                            <Text mt={2} color="fg.muted">{t('contact_info_desc')}</Text>
                            <Stack mt={4} gap={4}>
                                <InputUser
                                    label={t('full_name_label')}
                                    placeholder={t('full_name_placeholder')}
                                    isRequired
                                    error={errors.contact_name?.message}
                                    {...register("contact_name")}
                                />
                                <InputUser
                                    label={t('email_label')}
                                    placeholder={t('email_placeholder')}
                                    isRequired
                                    error={errors.contact_email?.message}
                                    {...register("contact_email")}
                                />
                                <InputUser
                                    label={t('phone_label')}
                                    placeholder={t('phone_placeholder')}
                                    isRequired
                                    error={errors.contact_phone?.message}
                                    helperText={t('phone_helper')}
                                    {...register("contact_phone")}
                                />
                            </Stack>
                        </Box>
                        <Box p={5} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">{t('traveler_details_title')}</Heading>
                            <Text mt={2} color="fg.muted">{t('traveler_details_desc')}</Text>
                            <Stack mt={4} gap={4}>
                                {passengers?.map((passenger, index) => (
                                    <Stack key={index} gap={1}>
                                        <InputUser
                                            label={t('traveler_label', {
                                                index: index + 1,
                                                type: passengerStructure[index]?.pax_type_name
                                            })}
                                            placeholder={t('name_placeholder')}
                                            isRequired
                                            error={errors.passengers?.[index]?.full_name?.message}
                                            {...register(`passengers.${index}.full_name`)}
                                        />
                                        <InputUser
                                            placeholder={t('phone_optional_placeholder')}
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
                                            <Checkbox.Label>{t('agree_terms_label')}</Checkbox.Label>
                                            <Box textStyle="sm" color="fg.muted">
                                                {t('terms_privacy_notice')}
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
                                {t('cancel_booking')}
                            </Button>
                            <Button
                                size="lg"
                                type="submit"
                                flex={1}
                                loading={updateContactMutation.isPending}
                                disabled={cancelBookingMutation.isPending}
                            >
                                {t('continue_to_payment')}
                            </Button>
                        </Flex>
                    </form>
                </Stack>
                <Stack gridColumn={{ base: "1 / -1", md: "9 / -1" }}>
                    <BookingSummaryCard booking={initialBooking} />
                </Stack>
            </SimpleGrid>

        </Container>
    );
}

