'use client'
import { Box, Flex, Heading, HStack, Text, Button, Badge, VStack, Dialog, Portal, Input } from "@chakra-ui/react";
import TourCalendar from "./TourCalendar";
import StarRating from "./starRating";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/chakra/toaster";
import { createBooking } from "@/actions/booking";
import logout from "@/actions/logout";
import { tourApi, ITourSession } from "@/apis/tour";
import { useQuery } from "@tanstack/react-query";

interface TourVariant {
    id: number;
    name: string;
    status: string;
    tour_variant_pax_type_prices: {
        id: number;
        pax_type_id: number;
        price: number;
        pax_type: {
            id: number;
            name: string;
        };
    }[];
    tour_sessions: ITourSession[];
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
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(() => variants?.[0]?.id || null);
    const [paxQuantities, setPaxQuantities] = useState<Record<number, number>>({});
    const [isPending, startTransition] = useTransition();

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
    const onSelectDate = (start: Date) => {
        setStartDate(start);
        closeCalendar();
        setSelectedSessionId(null); // Reset selected session when date changes
    };

    // Sync selectedVariantId if variants change and currently selected is not in the list
    const [prevVariants, setPrevVariants] = useState(variants);
    if (variants !== prevVariants) {
        setPrevVariants(variants);
        if (!variants?.find(v => v.id === selectedVariantId)) {
            setSelectedVariantId(variants?.[0]?.id || null);
        }
    }

    const selectedVariant = variants?.find(v => v.id === selectedVariantId);

    // Sync paxQuantities when variant changes
    const [prevSelectedVariantId, setPrevSelectedVariantId] = useState<number | null>(null);
    if (selectedVariantId !== prevSelectedVariantId) {
        setPrevSelectedVariantId(selectedVariantId);
        if (selectedVariant) {
            const initialQuantities: Record<number, number> = {};
            const prices = selectedVariant.tour_variant_pax_type_prices || [];
            prices.forEach(p => {
                initialQuantities[p.pax_type_id] = 0;
            });
            const firstValidPrice = prices.find(p => p.price > 0);
            if (firstValidPrice) {
                initialQuantities[firstValidPrice.pax_type_id] = 1;
            }
            setPaxQuantities(initialQuantities);
            setSelectedSessionId(null);
        }
    }

    // Fetch sessions for the selected variant and date
    const { data: sessions } = useQuery({
        queryKey: ['tourSessions', slug, selectedVariantId, startDate?.toISOString().split('T')[0]],
        queryFn: () => {
            if (!selectedVariantId || !startDate) return [];
            const dateStr = startDate.toISOString().split('T')[0];
            return tourApi.getSessions(slug, selectedVariantId, dateStr, dateStr);
        },
        enabled: !!selectedVariantId && !!startDate
    });

    const availableSessions = useMemo(() => {
        if (!startDate || !selectedVariantId || !sessions) return [];
        return sessions.filter((s: ITourSession) => {
            return s.status === 'open' && s.capacity_available > 0;
        }).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    }, [startDate, selectedVariantId, sessions]);

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
            .filter(([, quantity]) => quantity > 0)
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
                startDate: startDate.toISOString().split('T')[0],
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
                                                    {(selectedVariant.tour_variant_pax_type_prices || []).filter(p => p.price > 0).map((p, i) => (
                                                        <HStack key={`${p.id}-${i}`} justify="space-between">
                                                            <Text>{p.pax_type.name} ({p.price.toLocaleString()} VND)</Text>
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
                                            onSelectDate={onSelectDate}
                                            initialSelectedDate={startDate ? startDate.toISOString().split('T')[0] : undefined}
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

