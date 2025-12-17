"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Heading, Stack, Text, Flex } from "@chakra-ui/react";
import { InputUser } from "@/components/ui/user/form/input";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { UpdateContactDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { IBookingDetail } from "@/types/booking";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
});

type CheckoutInfoFormData = z.infer<typeof checkoutInfoSchema>;

interface Props {
    initialBooking: IBookingDetail;
}

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
        <Container maxW="2xl" py={10}>
            <Heading as="h1" size="2xl" mb={2}>Checkout - Step 1 of 3</Heading>
            <Text color="fg.muted" mb={8}>Please provide your contact and traveler information</Text>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack gap={6}>
                    <Box bg="white" p={8} borderRadius="15px">
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

                    <Box bg="white" p={8} borderRadius="15px">
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

                    <Flex justify="flex-end">
                        <Button
                            size="lg"
                            colorPalette="blue"
                            type="submit"
                            loading={updateContactMutation.isPending}
                        >
                            Continue to Payment
                        </Button>
                    </Flex>
                </Stack>
            </form>
        </Container>
    );
}
