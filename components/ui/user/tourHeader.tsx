'use client'
import { Box, Flex, Heading, HStack, Text, Button, Badge, VStack, Dialog, Portal, Input, Spinner } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import StarRating from "./starRating";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { toaster } from "@/components/chakra/toaster";
import { createBooking } from "@/actions/booking";
import { tourApi } from "@/apis/tour";
import { IUserTourSession, TourVariantStatus } from "@/types/response/tour.type";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "./breadcrumb";
import { formatPriceValue } from '@/utils/currency';
import { useTranslations, useLocale } from "next-intl";

// Helper to format date in local timezone (avoids UTC shift issues)
const formatDateLocal = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Variant type for TourHeader component
 * Uses centralized types for session and status
 */
export interface TourHeaderVariant {
    id: number;
    name: string;
    status: TourVariantStatus;
    tour_variant_pax_type_prices: {
        id: number;
        pax_type_id: number;
        price: number;
        pax_type: {
            id: number;
            name: string;
        };
    }[];
    tour_sessions: IUserTourSession[];
}

interface TourHeaderProps {
    title: string;
    location: string;
    rating: number;
    price: number;
    oldPrice?: number;
    slug: string;
    variants: TourHeaderVariant[];
    durationDays: number;
    durationText?: string;  // Optional duration text like "5 hours" or "2 days 3 hours"
    breadcrumbItems: { label: string; href: string }[];
    currencySymbol?: string;
    currencyCode?: string;
}

const TourCalendar = dynamic(() => import("./TourCalendar"), {
    loading: () => <Box p={10} textAlign="center"><Spinner size="xl" /></Box>,
});

export default function TourHeader({ title, location, rating, price, oldPrice, slug, variants, durationDays, durationText, breadcrumbItems, currencySymbol = 'VND', currencyCode }: TourHeaderProps) {
    const locale = useLocale();
    const t = useTranslations('common');
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
            // 4 for adult
            const firstValidPrice = prices.find(p => p.price > 0 && (p.pax_type.id === 4 || p.pax_type.name === "Adult"));
            if (firstValidPrice) {
                initialQuantities[firstValidPrice.pax_type_id] = 1;
            }
            console.log(firstValidPrice, prices)
            setPaxQuantities(initialQuantities);
            setSelectedSessionId(null);
        }
    }

    // Fetch sessions for the selected variant and date
    const { data: sessions } = useQuery({
        queryKey: ['tourSessions', slug, selectedVariantId, startDate ? formatDateLocal(startDate) : null],
        queryFn: () => {
            if (!selectedVariantId || !startDate) return [];
            const dateStr = formatDateLocal(startDate);
            return tourApi.getSessions(slug, selectedVariantId, dateStr, dateStr);
        },
        enabled: !!selectedVariantId && !!startDate
    });

    const availableSessions = useMemo(() => {
        if (!startDate || !selectedVariantId || !sessions) return [];
        return (sessions as IUserTourSession[]).filter((s: IUserTourSession) => {
            return s.status === 'open' && (s.capacity_available || 0) > 0;
        }).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    }, [startDate, selectedVariantId, sessions]);

    const handleBooking = () => {
        if (!startDate) {
            toaster.create({
                title: t("select_date"),
                type: "warning",
                duration: 3000,
            });
            return;
        }
        if (!selectedVariantId) {
            toaster.create({
                title: t("select_variant_first"),
                type: "warning",
                duration: 3000,
            });
            return;
        }

        if (availableSessions.length > 0 && !selectedSessionId) {
            toaster.create({
                title: "Please select a time slot.", // Need to add this to common.json too if possible, but for now I'll just keep it or use a generic one
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
                title: t("select_travelers"),
                type: "warning",
                duration: 3000,
            });
            return;
        }

        startTransition(async () => {
            const result = await createBooking({
                startDate: formatDateLocal(startDate),
                pax,
                variantId: selectedVariantId,
                tourSessionId: selectedSessionId || undefined
            });

            if (!result.ok) {
                toaster.create({
                    title: t("failed_confirm_booking"),
                    description: result.message,
                    type: "error",
                    duration: 3000,
                });

                if (result.code === "UNAUTHENTICATED") {
                    // Redirect to login with callback to current tour page
                    const currentPath = `/tour/${slug}`;
                    router.push(`/user-login?callbackUrl=${encodeURIComponent(currentPath)}`);
                }
                return;
            }

            toaster.create({
                title: t("confirm_booking_dialog"),
                description: t("finding_adventures"),
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
            alignItems="flex-end"
            mt={8}
            mb={6}
            gap={6}
            direction={{ base: "column", md: "row" }}
        >
            <Box flex={1}>
                <Breadcrumb
                    items={breadcrumbItems}
                />
                <VStack align="start" gap={1} width="100%">
                    <Heading as="h1" size={{ base: "xl", md: "2xl", lg: "3xl" }} fontWeight="black" letterSpacing="tight" lineHeight="1.2">
                        {title}
                    </Heading>
                    <HStack gap={1} color="gray.500" fontSize="sm" fontWeight="medium">
                        <Text>{location}</Text>
                        <Text>•</Text>
                        <Text>{durationText || `${durationDays} ${t("days", { count: durationDays })}`}</Text>
                    </HStack>
                </VStack>

                <HStack gap={3} mt={4}>
                    <HStack gap={1.5}>
                        <StarRating rating={rating} />
                        <Text fontSize="md" fontWeight="bold" color="gray.700">{rating.toFixed(1)}</Text>
                    </HStack>
                    <Badge colorPalette="blue" variant="solid" rounded="full" px={3} py={0.5} fontSize="10px" fontWeight="black" textTransform="uppercase">
                        {t("recommended")}
                    </Badge>
                </HStack>
            </Box>

            <VStack gap={4} align={{ base: "stretch", md: "flex-end" }} minW={{ md: "250px" }}>
                <VStack align="flex-end" gap={0}>
                    <Text color="gray.500" fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest" mb={-1}>
                        {t("from")}
                    </Text>
                    <Heading as="h2" size={{ base: "3xl", md: "4xl" }} color="main" fontWeight="black" letterSpacing="tight">
                        {currencySymbol} {formatPriceValue(price, currencyCode)}
                    </Heading>
                    <HStack gap={2} mt={1}>
                        {oldPrice && (
                            <Text as="del" color="gray.400" fontSize="sm" fontWeight="medium">
                                {currencySymbol} {formatPriceValue(oldPrice, currencyCode)}
                            </Text>
                        )}
                        <Text color="gray.500" fontSize="xs" fontWeight="bold">
                            {t("per_person")}
                        </Text>
                    </HStack>
                </VStack>

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
                            rounded="2xl"
                            px={{ base: 6, md: 12 }}
                            py={{ base: 6, md: 8 }}
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="black"
                            width="100%"
                            _hover={{
                                bg: "blue.800",
                                transform: "translateY(-2px)",
                                boxShadow: "0 10px 20px rgba(0, 59, 149, 0.2)"
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            boxShadow="0 4px 14px 0 rgba(0, 59, 149, 0.39)"
                            onClick={() => setIsBookingOpen(true)}
                        >
                            {t("reserve_spot")}
                        </Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                        <Dialog.Positioner>
                            <Dialog.Content borderRadius="xl" boxShadow="2xl">
                                <Dialog.Header>
                                    <Dialog.Title>{t("book_tour")}</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <VStack gap={4} align="stretch">
                                        {/* Date Selection */}
                                        <Text fontSize="sm" mb={2} fontWeight="bold">{t("select_date")}</Text>
                                        {selectedVariant ? (
                                            <VStack align="stretch" gap={2}>
                                                <Button
                                                    variant="outline"
                                                    width="full"
                                                    justifyContent="flex-start"
                                                    onClick={openCalendar}
                                                >
                                                    {startDate
                                                        ? new Date(startDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                        : t("click_select_date")
                                                    }
                                                </Button>

                                                {availableSessions && availableSessions.length > 0 && (
                                                    <Box mt={2}>
                                                        <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.600">{t("start_time_label")}:</Text>
                                                        <Flex gap={2} wrap="wrap">
                                                            {availableSessions.map((s, i) => (
                                                                <Button
                                                                    key={`${s.id}-${i}`}
                                                                    size="sm"
                                                                    variant={selectedSessionId === s.id ? "solid" : "outline"}
                                                                    colorScheme="teal"
                                                                    onClick={() => setSelectedSessionId(s.id)}
                                                                >
                                                                    {(s.start_time && s.start_time !== '00:00:00') ? `${s.start_time.substring(0, 5)}${s.end_time ? ` - ${s.end_time.substring(0, 5)}` : ''}` : t("all_day")}
                                                                </Button>
                                                            ))}
                                                        </Flex>
                                                    </Box>
                                                )}
                                            </VStack>
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">{t("select_variant_first")}</Text>
                                        )}

                                        {/* Variant Selection */}
                                        {variants && variants.length > 1 && (
                                            <Box>
                                                <Text fontSize="sm" mb={1} fontWeight="bold">{t("variant")}</Text>
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
                                                <Text fontSize="sm" mb={1} fontWeight="bold">{t("passengers")}</Text>
                                                <VStack gap={2} align="stretch">
                                                    {(selectedVariant.tour_variant_pax_type_prices || []).filter(p => p.price > 0).map((p, i) => (
                                                        <HStack key={`${p.id}-${i}`} justify="space-between">
                                                            <Text>{p.pax_type.name} ({p.price.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} {currencySymbol})</Text>
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
                                        <Button variant="outline">{t("cancel")}</Button>
                                    </Dialog.ActionTrigger>
                                    <Button
                                        bg="main"
                                        color="white"
                                        onClick={handleBooking}
                                        disabled={isPending}
                                    >
                                        {isPending ? t("booking") : t("confirm_booking_dialog")}
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
                                    <Dialog.Title>{t("select_travel_date_title")}</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    {selectedVariant && (
                                        <TourCalendar
                                            tourSlug={slug}
                                            variantId={selectedVariant.id}
                                            durationDays={durationDays}
                                            onSelectDate={onSelectDate}
                                            initialSelectedDate={startDate ? formatDateLocal(startDate) : undefined}
                                        />
                                    )}
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button variant="outline" onClick={closeCalendar}>
                                        {t("back")}
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
