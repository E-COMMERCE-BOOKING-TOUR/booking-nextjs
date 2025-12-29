"use client";

import {
    Box,
    VStack,
    Heading,
    Text,
    Input,
    Stack,
    Button,
    HStack,
    Icon,
    Drawer,
    Portal,
    CloseButton,
    Accordion,
    Span,
} from "@chakra-ui/react";
import { useState, useCallback, memo } from "react";
import { FaSearch, FaFilter, FaStar, FaCheck, FaSlidersH } from "react-icons/fa";
import { ITourSearchParams } from "@/apis/tour";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "@/libs/i18n/client";
import { fallbackLng } from "@/libs/i18n/settings";
import { useSearchParams } from "next/navigation";

interface FilterSidebarProps {
    onApply: (data: ITourSearchParams) => void;
    lng?: string;
}

// Memoized Rating Item component
const RatingItem = memo(({
    star,
    isSelected,
    isOther,
    onClick,
    t
}: {
    star: number;
    isSelected: boolean;
    isOther: boolean;
    onClick: () => void;
    t: (key: string) => string;
}) => (
    <HStack
        cursor="pointer"
        onClick={onClick}
        opacity={isOther ? 0.5 : 1}
        _hover={{ opacity: 1 }}
        bg={isSelected ? "gray.50" : "transparent"}
        p={2}
        borderRadius="md"
    >
        <Box
            w={4} h={4}
            border="1px solid"
            borderColor={isSelected ? "main" : "gray.300"}
            bg={isSelected ? "main" : "white"}
            borderRadius="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            {isSelected && <Icon as={FaCheck} boxSize="10px" color="white" />}
        </Box>
        <HStack gap={1} color="yellow.400">
            {[...Array(5)].map((_, i) => (
                <Icon key={i} as={FaStar} color={i < star ? "yellow.400" : "gray.200"} />
            ))}
        </HStack>
        <Text fontSize="sm" color="gray.600">{t("and_up")}</Text>
    </HStack>
));
RatingItem.displayName = "RatingItem";

// Memoized Checkbox Item component
const CheckboxItem = memo(({
    label,
    isSelected,
    onClick,
    ml = 0
}: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    ml?: number;
}) => (
    <HStack
        cursor="pointer"
        onClick={onClick}
        gap={3}
        ml={ml}
        py={2}
    >
        <Box
            w={4} h={4}
            border="1px solid"
            borderColor={isSelected ? "main" : "gray.300"}
            bg={isSelected ? "main" : "white"}
            borderRadius="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
        >
            {isSelected && <Icon as={FaCheck} boxSize="10px" color="white" />}
        </Box>
        <Text fontSize="sm" color="gray.600">{label}</Text>
    </HStack>
));
CheckboxItem.displayName = "CheckboxItem";

// Inner Filter Content Component (shared between desktop and mobile drawer)
interface FilterContentProps {
    onApply: (data: ITourSearchParams) => void;
    onClose?: () => void; // Optional - only for mobile drawer
    lng?: string;
}

import { masterApi } from "@/apis/master";
import { useQuery } from "@tanstack/react-query";

const FilterContent = memo(({ onApply, onClose, lng: propLng }: FilterContentProps) => {
    const searchParams = useSearchParams();
    const lng = propLng || searchParams?.get('lng') || fallbackLng;
    const { t } = useTranslation(lng as string);
    const { register, setValue, getValues, reset, handleSubmit, watch } = useFormContext<ITourSearchParams>();

    // Fetch countries and divisions
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: masterApi.getCountries,
    });

    const { data: divisions = [] } = useQuery({
        queryKey: ['divisions'],
        queryFn: masterApi.getDivisions,
    });

    // Filter to get only level 1 divisions
    const level1Divisions = divisions.filter(d =>
        d.level === 1 || d.level === '1'
    );

    // Group divisions by country
    const locationData = countries.map(country => ({
        ...country,
        level1Divisions: level1Divisions.filter(d => d.country?.id === country.id)
    })).filter(country => country.level1Divisions.length > 0 || divisions.some(d => d.country?.id === country.id));

    // Get current values from form state
    const selectedCountryIds = watch("country_ids") || [];
    const selectedDivisionIds = watch("division_ids") || [];
    const selectedRating = watch("minRating");

    // Calculate which accordions should be expanded (countries with selected divisions)
    const expandedAccordions = locationData
        .filter(country =>
            selectedCountryIds.includes(country.id) ||
            country.level1Divisions.some(d => selectedDivisionIds.includes(d.id))
        )
        .map(country => country.id.toString());

    const handleCountryChange = useCallback((id: number, checked: boolean) => {
        const currentIds = getValues("country_ids") || [];
        const newIds = checked
            ? [...currentIds, id]
            : currentIds.filter((cid: number) => cid !== id);
        setValue("country_ids", newIds);
    }, [getValues, setValue]);

    const handleDivisionChange = useCallback((id: number, checked: boolean) => {
        const currentIds = getValues("division_ids") || [];
        const newIds = checked
            ? [...currentIds, id]
            : currentIds.filter((did: number) => did !== id);
        setValue("division_ids", newIds);
    }, [getValues, setValue]);

    const handleRatingChange = useCallback((rating: number) => {
        const currentRating = getValues("minRating");
        setValue("minRating", currentRating === rating ? undefined : rating);
    }, [getValues, setValue]);

    const handleReset = useCallback(() => {
        reset({
            keyword: "",
            minPrice: undefined,
            maxPrice: undefined,
            minRating: undefined,
            country_ids: [],
            division_ids: [],
            sort: "popular",
            offset: 0,
            limit: 12
        } as ITourSearchParams);
    }, [reset]);

    const handleApplyAndClose = useCallback(() => {
        handleSubmit((data) => {
            onApply(data);
            onClose?.(); // Close drawer after apply (for mobile)
        })();
    }, [handleSubmit, onApply, onClose]);

    return (
        <VStack gap={6} align="stretch">
            {/* Keyword Search */}
            <Box>
                <Text fontWeight="bold" mb={3} fontSize="sm" textTransform="uppercase" color="gray.500">{t('search', { defaultValue: 'Search' })}</Text>
                <Box position="relative">
                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.300" zIndex={1}>
                        <FaSearch />
                    </Box>
                    <Input
                        placeholder={t('destination_placeholder', { defaultValue: 'Destination, tour name...' })}
                        {...register("keyword")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleApplyAndClose();
                            }
                        }}
                        borderRadius="full"
                        fontSize="sm"
                        pl={10}
                    />
                </Box>
            </Box>

            <Box h="1px" bg="gray.100" />

            {/* Filter Accordion Sections */}
            <Accordion.Root multiple defaultValue={["price", "rating", "locations"]} variant="plain" size="sm">
                {/* Price Range */}
                <Accordion.Item value="price">
                    <Accordion.ItemTrigger py={2} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('price_range', { defaultValue: 'Price Range' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={2} pb={4}>
                            <HStack gap={2} mb={2}>
                                <Input
                                    type="number"
                                    placeholder={t('min', { defaultValue: 'Min' })}
                                    {...register("minPrice")}
                                    size="sm"
                                />
                                <Text>-</Text>
                                <Input
                                    type="number"
                                    placeholder={t('max', { defaultValue: 'Max' })}
                                    {...register("maxPrice")}
                                    size="sm"
                                />
                            </HStack>
                            <HStack justify="space-between" fontSize="xs" color="gray.600">
                                <Text>VND</Text>
                                <Text>VND</Text>
                            </HStack>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>

                {/* Rating */}
                <Accordion.Item value="rating">
                    <Accordion.ItemTrigger py={2} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('rating', { defaultValue: 'Rating' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={2} pb={4}>
                            <Stack gap={2}>
                                {[5, 4, 3].map((star) => (
                                    <RatingItem
                                        key={star}
                                        star={star}
                                        isSelected={selectedRating === star}
                                        isOther={selectedRating !== undefined && selectedRating !== star}
                                        onClick={() => handleRatingChange(star)}
                                        t={t}
                                    />
                                ))}
                            </Stack>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>

                {/* Locations */}
                <Accordion.Item value="locations">
                    <Accordion.ItemTrigger py={2} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('locations', { defaultValue: 'Locations' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={2} pb={4}>
                            <Box maxH="300px" overflowY="auto" pr={2} className="custom-scrollbar">
                                <Accordion.Root multiple defaultValue={expandedAccordions} variant="plain" size="sm">
                                    {locationData.map((country) => (
                                        <Accordion.Item key={country.id} value={country.id.toString()}>
                                            <Accordion.ItemTrigger py={2} px={0} _hover={{ bg: "transparent" }}>
                                                <HStack flex="1" gap={3} onClick={(e) => e.stopPropagation()}>
                                                    <Box
                                                        w={4} h={4}
                                                        border="1px solid"
                                                        borderColor={selectedCountryIds.includes(country.id) ? "main" : "gray.300"}
                                                        bg={selectedCountryIds.includes(country.id) ? "main" : "white"}
                                                        borderRadius="sm"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        flexShrink={0}
                                                        cursor="pointer"
                                                        onClick={() => handleCountryChange(country.id, !selectedCountryIds.includes(country.id))}
                                                    >
                                                        {selectedCountryIds.includes(country.id) && <Icon as={FaCheck} boxSize="10px" color="white" />}
                                                    </Box>
                                                    <Span fontSize="sm" fontWeight="medium" color="gray.700">{country.name}</Span>
                                                </HStack>
                                                {country.level1Divisions.length > 0 && <Accordion.ItemIndicator />}
                                            </Accordion.ItemTrigger>
                                            {country.level1Divisions.length > 0 && (
                                                <Accordion.ItemContent>
                                                    <Accordion.ItemBody pt={1} pb={2}>
                                                        <Stack gap={2} pl={2}>
                                                            {country.level1Divisions.map((division) => (
                                                                <CheckboxItem
                                                                    key={division.id}
                                                                    label={division.name}
                                                                    ml={4}
                                                                    isSelected={selectedDivisionIds.includes(division.id)}
                                                                    onClick={() => handleDivisionChange(division.id, !selectedDivisionIds.includes(division.id))}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Accordion.ItemBody>
                                                </Accordion.ItemContent>
                                            )}
                                        </Accordion.Item>
                                    ))}
                                </Accordion.Root>
                            </Box>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>
            <VStack>
                <Button
                    colorScheme="main"
                    width="full"
                    onClick={handleApplyAndClose}
                >
                    {t('apply_filters', { defaultValue: 'Search / Apply Filters' })}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    width="full"
                    onClick={handleReset}
                >
                    {t('reset_filters', { defaultValue: 'Reset Filters' })}
                </Button>
            </VStack>
        </VStack>
    );
});
FilterContent.displayName = "FilterContent";

// Desktop Sidebar Component
export const FilterSidebar = memo(({ onApply, lng: propLng }: FilterSidebarProps) => {
    const searchParams = useSearchParams();
    const lng = propLng || searchParams?.get('lng') || fallbackLng;
    const { t } = useTranslation(lng as string);
    return (
        <Box
            bg="white"
            p={6}
            borderRadius="xl"
            shadow="sm"
            border="1px solid"
            borderColor="gray.100"
            position="sticky"
            top="100px"
        >
            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                <Icon as={FaFilter} color="main" />
                {t('filters', { defaultValue: 'Filters' })}
            </Heading>
            <FilterContent onApply={onApply} lng={lng} />
        </Box>
    );
});
FilterSidebar.displayName = "FilterSidebar";

// Mobile Filter Drawer Component
interface MobileFilterDrawerProps {
    onApply: (data: ITourSearchParams) => void;
}

export const MobileFilterDrawer = memo(({ onApply, lng: propLng }: MobileFilterDrawerProps & { lng?: string }) => {
    const searchParams = useSearchParams();
    const lng = propLng || searchParams?.get('lng') || fallbackLng;
    const { t } = useTranslation(lng as string);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Button */}
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                size="sm"
                width="full"
            >
                <HStack gap={2}>
                    <Icon as={FaSlidersH} />
                    <Text>{t('filters', { defaultValue: 'Filters' })}</Text>
                </HStack>
            </Button>

            {/* Drawer */}
            <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="bottom">
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content maxH="85vh" borderTopRadius="2xl">
                            <Drawer.Header borderBottomWidth="1px">
                                <HStack justify="space-between" width="full">
                                    <Drawer.Title display="flex" alignItems="center" gap={2}>
                                        <Icon as={FaFilter} color="main" />
                                        {t('filters', { defaultValue: 'Filters' })}
                                    </Drawer.Title>
                                    <Drawer.CloseTrigger asChild>
                                        <CloseButton size="sm" />
                                    </Drawer.CloseTrigger>
                                </HStack>
                            </Drawer.Header>
                            <Drawer.Body py={6} overflowY="auto">
                                <FilterContent onApply={onApply} onClose={() => setIsOpen(false)} lng={lng} />
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    );
});
MobileFilterDrawer.displayName = "MobileFilterDrawer";
