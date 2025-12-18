"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex, Steps, SimpleGrid, Checkbox, VStack, HStack, Image, DataList } from "@chakra-ui/react";
import { InputUser } from "@/components/ui/user/form/input";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { UpdateContactDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { IBookingDetail } from "@/types/booking";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { numberFormat } from "@/libs/function";

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
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<CheckoutInfoFormData>({
        resolver: zodResolver(checkoutInfoSchema),
        defaultValues: {
            contact_name: initialBooking.contact_name || "",
            contact_email: initialBooking.contact_email || "",
            contact_phone: initialBooking.contact_phone || "",
            passengers: initialBooking.items.map(() => ({
                full_name: "",
                phone_number: "",
            })),
            agree_terms: false,
        },
    });

    console.log("errors", errors);

    // Update contact info mutation
    const updateContactMutation = useMutation({
        mutationFn: (data: UpdateContactDTO) => bookingApi.updateContact(data, session?.user?.accessToken),
        onSuccess: () => {
            toaster.create({
                title: "Contact information saved",
                type: "success",
            });
            router.push("/checkout/payment");
        },
        onError: (error: any) => {
            toaster.create({
                title: "Failed to save contact information",
                description: error.message,
                type: "error",
            });
        },
    });

    const onSubmit = (data: CheckoutInfoFormData) => {
        updateContactMutation.mutate({
            contact_name: data.contact_name,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
        });
    };

    return (
        <Container maxW="2xl">
            <Steps.Root defaultStep={0} colorPalette="blue" marginBottom="2rem" paddingX="3rem" width="100%">
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
                            <Text mt={2} color="fg.muted">We'll send booking confirmation and updates to this contact</Text>
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
                                            label={`Traveler ${index + 1}`}
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
                            <Checkbox.Root gap="4" alignItems="flex-start" invalid={!!errors.agree_terms?.message}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control {...register("agree_terms")} />
                                <Stack gap="1">
                                    <Checkbox.Label>I agree to the terms and conditions</Checkbox.Label>
                                    <Box textStyle="sm" color="fg.muted">
                                        By clicking this, you agree to our Terms and Privacy Policy.
                                    </Box>
                                </Stack>
                            </Checkbox.Root>
                        </Box>
                        <Flex justify="flex-end" p={5} paddingTop={0}>
                            <Button
                                size="lg"
                                colorPalette="blue"
                                type="submit"
                                width="100%"
                                loading={updateContactMutation.isPending}
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


const BookingSummaryCard = ({ booking }: { booking: IBookingDetail }) => {
    return <Box boxShadow="sm" rounded="2xl" overflow="hidden">
        <Box p={8} borderBottom="1px solid" borderColor="gray.200">
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