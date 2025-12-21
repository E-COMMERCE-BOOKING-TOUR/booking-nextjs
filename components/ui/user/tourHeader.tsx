'use client'
import { Box, Flex, Heading, Text, Button, Badge, HStack, VStack, Dialog, Portal, Input } from "@chakra-ui/react";
import TourCalendar from "./TourCalendar";
import StarRating from "./starRating";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateBookingDTO } from "@/apis/booking";
import { toaster } from "@/components/chakra/toaster";
import { useSession } from "next-auth/react";
import { createBooking } from "@/actions/booking";
import { useTransition } from "react";
import logout from "@/actions/logout";
import { tourApi } from "@/apis/tour";

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
    durationDays: number;
}

export default function TourHeader({ title, location, rating, price, oldPrice, slug, variants, durationDays }: TourHeaderProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [startDate, setStartDate] = useState<string>('');
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [paxQuantities, setPaxQuantities] = useState<Record<number, number>>({});
    const [isPending, startTransition] = useTransition();

    const [availableSessions, setAvailableSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    // Dialog states
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Open calendar dialog (close booking dialog first)
    const openCalendar = () => {
        setIsBookingOpen(false);
        setIsCalendarOpen(true); // Open immediately
    };

    // Close calendar and reopen booking dialog
    const closeCalendar = () => {
        setIsCalendarOpen(false);
        setIsBookingOpen(true); // Open immediately
    };

    // Handle date selection from calendar
    const handleDateSelect = async (start: Date, end: Date) => {
        const dateStr = start.toLocaleDateString('en-CA');
        setStartDate(dateStr);
        closeCalendar();

        // Fetch sessions for this date specifically to get time slots
        if (selectedVariantId) {
            try {
                // We use the same getSessions API but specific for one day
                const res = await tourApi.getSessions(slug, selectedVariantId, dateStr, dateStr);
                if (res && res.length > 0) {
                    // Sort by time
                    const sorted = res.sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''));
                    setAvailableSessions(sorted);
                    // If only one session, select it automatically
                    if (sorted.length === 1) {
                        setSelectedSessionId(sorted[0].id);
                    } else {
                        setSelectedSessionId(null);
                    }
                } else {
                    setAvailableSessions([]);
                    setSelectedSessionId(null);
                }
            } catch (error) {
                console.error("Failed to fetch sessions", error);
                setAvailableSessions([]);
            }
        }
    };

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

    const handleBooking = () => {
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

        if (availableSessions.length > 0 && !selectedSessionId) {
            toaster.create({
                title: "Please select a time slot.",
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

        startTransition(async () => {
            const result = await createBooking({
                startDate,
                pax,
                variantId: selectedVariantId,
                tourSessionId: selectedSessionId || undefined
            });

            if (!result.ok) {
                toaster.create({
                    title: "Booking failed.",
                    description: result.message,
                    type: "error",
                    duration: 3000,
                });

                if (result.code === "UNAUTHENTICATED") {
                    logout("/user-login");
                }
                return;
            }

            toaster.create({
                title: "Booking created.",
                description: "Redirecting to checkout...",
                type: "success",
                duration: 3000,
            });
            router.push('/checkout');
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

                {/* Book Tour Dialog */}
                <Dialog.Root
                    size="md"
                    lazyMount
                    unmountOnExit
                    placement="center"
                    motionPreset="slide-in-bottom"
                    open={isBookingOpen}
                    onOpenChange={(e) => setIsBookingOpen(e.open)}
                >
                    <Dialog.Trigger asChild>
                        <Button
                            bg="main"
                            color="white"
                            rounded="15px"
                            px={12}
                            py={8}
                            width="100%"
                            onClick={() => setIsBookingOpen(true)}
                        >
                            Select Rooms
                        </Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                        <Dialog.Positioner>
                            <Dialog.Content borderRadius="xl" boxShadow="2xl">
                                <Dialog.Header>
                                    <Dialog.Title>Book Tour</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <VStack gap={4} align="stretch">
                                        {/* Date Selection */}
                                        <Text fontSize="sm" mb={2} fontWeight="bold">Select Date</Text>
                                        {selectedVariant ? (
                                            <VStack align="stretch" gap={2}>
                                                <Button
                                                    variant="outline"
                                                    width="full"
                                                    justifyContent="flex-start"
                                                    onClick={openCalendar}
                                                >
                                                    {startDate
                                                        ? new Date(startDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                        : 'Click to select date...'
                                                    }
                                                </Button>

                                                {availableSessions && availableSessions.length > 0 && (
                                                    <Box mt={2}>
                                                        <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.600">Start Time:</Text>
                                                        <Flex gap={2} wrap="wrap">
                                                            {availableSessions.map((s, i) => (
                                                                <Button
                                                                    key={`${s.id}-${i}`}
                                                                    size="sm"
                                                                    variant={selectedSessionId === s.id ? "solid" : "outline"}
                                                                    colorScheme="teal"
                                                                    onClick={() => setSelectedSessionId(s.id)}
                                                                >
                                                                    {(s.start_time && s.start_time !== '00:00:00') ? `${s.start_time.substring(0, 5)}${s.end_time ? ` - ${s.end_time.substring(0, 5)}` : ''}` : 'All Day'}
                                                                </Button>
                                                            ))}
                                                        </Flex>
                                                    </Box>
                                                )}
                                            </VStack>
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">Please select a variant first</Text>
                                        )}

                                        {/* Variant Selection */}
                                        {variants && variants.length > 1 && (
                                            <Box>
                                                <Text fontSize="sm" mb={1} fontWeight="bold">Variant</Text>
                                                <Flex gap={2} wrap="wrap">
                                                    {variants.map((v, i) => (
                                                        <Button
                                                            key={`${v.id}-${i}`}
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

                                        {/* Passengers */}
                                        {selectedVariant && (
                                            <Box>
                                                <Text fontSize="sm" mb={1} fontWeight="bold">Passengers</Text>
                                                <VStack gap={2} align="stretch">
                                                    {selectedVariant.prices.filter(p => p.price > 0).map((p, i) => (
                                                        <HStack key={`${p.id}-${i}`} justify="space-between">
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
                                        disabled={isPending}
                                    >
                                        {isPending ? "Booking..." : "Confirm Booking"}
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger />
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>

                {/* Calendar Dialog */}
                <Dialog.Root
                    size="xl"
                    lazyMount
                    unmountOnExit
                    placement="center"
                    motionPreset="slide-in-bottom"
                    open={isCalendarOpen}
                    onOpenChange={(e) => {
                        if (!e.open) {
                            closeCalendar();
                        }
                    }}
                >
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                        <Dialog.Positioner>
                            <Dialog.Content borderRadius="xl" boxShadow="2xl">
                                <Dialog.Header>
                                    <Dialog.Title>Select Travel Date</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    {selectedVariant && (
                                        <TourCalendar
                                            tourSlug={slug}
                                            variantId={selectedVariant.id}
                                            durationDays={durationDays}
                                            onSelectDate={handleDateSelect}
                                            initialSelectedDate={startDate}
                                        />
                                    )}
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button variant="outline" onClick={closeCalendar}>
                                        Back
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger />
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </VStack>
        </Flex >
    );
}

