'use client'
import { Box, Flex, Heading, Text, Button, Badge, HStack, VStack, Input, Dialog, Portal } from "@chakra-ui/react";
import StarRating from "./starRating";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookingApi, CreateBookingDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { useSession } from "next-auth/react";

interface TourVariant {
    id: number;
    name: string;
    status: string;
    prices: {
        id: number;
        pax_type_id: number;
        price: number;
        pax_type_name: string;
    }[];
}

interface TourHeaderProps {
    title: string;
    location: string;
    rating: number;
    price: number;
    oldPrice?: number;
    slug: string;
    variants: TourVariant[];
}

export default function TourHeader({ title, location, rating, price, oldPrice, slug, variants }: TourHeaderProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [startDate, setStartDate] = useState<string>('');
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [paxQuantities, setPaxQuantities] = useState<Record<number, number>>({});

    // Set default variant if only one exists
    useEffect(() => {
        if (variants && variants.length === 1) {
            setSelectedVariantId(variants[0].id);
        }
    }, [variants]);

    const selectedVariant = variants?.find(v => v.id === selectedVariantId);

    // Initialize pax quantities when variant is selected
    useEffect(() => {
        if (selectedVariant) {
            const initialQuantities: Record<number, number> = {};
            selectedVariant.prices.forEach(p => {
                initialQuantities[p.pax_type_id] = 0;
            });
            // Default 1 adult if available (assuming adult is usually the first or has specific ID, but here just first)
            const firstValidPrice = selectedVariant.prices.find(p => p.price > 0);
            if (firstValidPrice) {
                initialQuantities[firstValidPrice.pax_type_id] = 1;
            }
            setPaxQuantities(initialQuantities);
        }
    }, [selectedVariant]);

    const createBookingMutation = useMutation({
        mutationFn: (data: CreateBookingDTO) => bookingApi.create(data, session?.user?.accessToken),
        onSuccess: (data: any) => {
            toaster.create({
                title: "Booking created.",
                description: "Redirecting to checkout...",
                type: "success",
                duration: 3000,
            });
            router.push(`/tour/checkout?bookingId=${data.id}`);
        },
        onError: (error: any) => {
            toaster.create({
                title: "Booking failed.",
                description: error.message || "Something went wrong.",
                type: "error",
                duration: 3000,
            });
        }
    });

    const handleBooking = () => {
        // Check if user is logged in
        if (!session?.user?.accessToken) {
            toaster.create({
                title: "Please login first.",
                description: "You need to be logged in to make a booking.",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        if (!startDate) {
            toaster.create({
                title: "Please select a date.",
                type: "warning",
                duration: 3000,
            });
            return;
        }
        if (!selectedVariantId) {
            toaster.create({
                title: "Please select a variant.",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        const pax = Object.entries(paxQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .map(([paxTypeId, quantity]) => ({
                paxTypeId: parseInt(paxTypeId),
                quantity
            }));

        if (pax.length === 0) {
            toaster.create({
                title: "Please select at least one passenger.",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        createBookingMutation.mutate({
            startDate,
            pax,
            variantId: selectedVariantId
        });
    };

    const handlePaxChange = (paxTypeId: number, value: number) => {
        setPaxQuantities(prev => ({
            ...prev,
            [paxTypeId]: value
        }));
    };

    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            mt={6}
            mb={4}
            gap={4}
            direction={{ base: "column", md: "row" }}
        >
            <Box flex={1}>
                <Heading as="h1" size="xl" mb={2}>
                    {title}
                </Heading>
                <Text color="gray.600" mb={2}>
                    {location}
                </Text>
                <HStack gap={2}>
                    <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                        {rating}
                    </Badge>
                    <StarRating rating={rating} />
                </HStack>
            </Box>

            <VStack gap={4} align="flex-end" w={{ base: "100%", md: "auto" }}>
                <HStack gap={8} textAlign="right" justify="flex-end">
                    <VStack align="flex-end">
                        <Heading as="h2" size="2xl" color="main" fontWeight="bold">
                            VND {price.toLocaleString()}
                        </Heading>
                        {oldPrice && (
                            <Text as="del" color="gray.400" fontSize="sm">
                                VND {oldPrice.toLocaleString()}
                            </Text>
                        )}
                    </VStack>
                </HStack>

                <Dialog.Root size="md">
                    <Dialog.Trigger asChild>
                        <Button
                            bg="main"
                            color="white"
                            rounded="15px"
                            px={12}
                            py={8}
                            width="100%"
                        >
                            Select Rooms
                        </Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Header>
                                    <Dialog.Title>Book Tour</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <VStack gap={4} align="stretch">
                                        <Box>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">Date</Text>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </Box>

                                        {variants && variants.length > 1 && (
                                            <Box>
                                                <Text fontSize="sm" mb={1} fontWeight="bold">Variant</Text>
                                                <Flex gap={2} wrap="wrap">
                                                    {variants.map(v => (
                                                        <Button
                                                            key={v.id}
                                                            variant={selectedVariantId === v.id ? "solid" : "outline"}
                                                            colorScheme="blue"
                                                            onClick={() => setSelectedVariantId(v.id)}
                                                            size="sm"
                                                        >
                                                            {v.name}
                                                        </Button>
                                                    ))}
                                                </Flex>
                                            </Box>
                                        )}

                                        {selectedVariant && (
                                            <Box>
                                                <Text fontSize="sm" mb={1} fontWeight="bold">Passengers</Text>
                                                <VStack gap={2} align="stretch">
                                                    {selectedVariant.prices.filter(p => p.price > 0).map(p => (
                                                        <HStack key={p.id} justify="space-between">
                                                            <Text>{p.pax_type_name} ({p.price.toLocaleString()} VND)</Text>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={10}
                                                                w="80px"
                                                                value={paxQuantities[p.pax_type_id] || 0}
                                                                onChange={(e) => handlePaxChange(p.pax_type_id, parseInt(e.target.value) || 0)}
                                                            />
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        )}
                                    </VStack>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button
                                        bg="main"
                                        color="white"
                                        onClick={handleBooking}
                                        disabled={createBookingMutation.isPending}
                                    >
                                        {createBookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger />
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </VStack>
        </Flex>
    );
}

