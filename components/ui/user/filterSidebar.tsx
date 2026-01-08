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
    NativeSelect,
} from "@chakra-ui/react";
import { useState, useCallback, memo, useMemo } from "react";
import { FaSearch, FaFilter, FaStar, FaCheck, FaSlidersH } from "react-icons/fa";
import { IUserTourSearchParams } from "@/types/response/tour.type";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

interface FilterSidebarProps {
    onApply: (data: IUserTourSearchParams) => void;
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
    onApply: (data: IUserTourSearchParams) => void;
    onClose?: () => void; // Optional - only for mobile drawer
}

import { masterApi } from "@/apis/master";
import { currencyApi } from "@/apis/tour";
import { useQuery } from "@tanstack/react-query";
import { ICurrency } from "@/types/response/base.type";
import { EMPTY_FILTERS } from "@/utils/searchParams";

const FilterContent = memo(({ onApply, onClose }: FilterContentProps) => {
    const t = useTranslations('common');
    const { register, setValue, getValues, reset, handleSubmit, watch } = useFormContext<IUserTourSearchParams>();

    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: masterApi.getCountries,
        staleTime: 1000 * 60 * 60, // 1 hour - countries rarely change
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    const { data: divisions = [] } = useQuery({
        queryKey: ['divisions'],
        queryFn: masterApi.getDivisions,
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    const { data: currencies = [] } = useQuery<ICurrency[]>({
        queryKey: ['currencies'],
        queryFn: currencyApi.getAll,
        staleTime: 1000 * 60 * 60, // 1 hour - currencies rarely change
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    // Memoize level 1 divisions filter
    const level1Divisions = useMemo(() =>
        divisions.filter(d => d.level === 1 || d.level === '1'),
        [divisions]
    );

    // Memoize location data grouping
    const locationData = useMemo(() =>
        countries.map(country => ({
            ...country,
            level1Divisions: level1Divisions.filter(d => d.country?.id === country.id)
        })).filter(country =>
            country.level1Divisions.length > 0 ||
            divisions.some(d => d.country?.id === country.id)
        ),
        [countries, level1Divisions, divisions]
    );

    // Get current values from form state
    const selectedCountryIds = watch("country_ids") || [];
    const selectedDivisionIds = watch("division_ids") || [];
    const selectedRating = watch("minRating");
    const selectedCurrencyId = watch("currency_id");

    // Get selected currency symbol
    const selectedCurrencySymbol = useMemo(() => {
        if (!selectedCurrencyId) return null;
        const currency = currencies.find(c => c.id === selectedCurrencyId);
        return currency?.symbol || null;
    }, [selectedCurrencyId, currencies]);

    // Memoize expanded accordions calculation
    const expandedAccordions = useMemo(() =>
        locationData
            .filter(country =>
                selectedCountryIds.includes(country.id) ||
                country.level1Divisions.some(d => selectedDivisionIds.includes(d.id))
            )
            .map(country => country.id.toString()),
        [locationData, selectedCountryIds, selectedDivisionIds]
    );

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
        reset(EMPTY_FILTERS);
        onApply(EMPTY_FILTERS);
    }, [reset, onApply]);

    const handleApplyAndClose = useCallback(() => {
        handleSubmit((data) => {
            onApply(data);
            onClose?.(); // Close drawer after apply (for mobile)
        })();
    }, [handleSubmit, onApply, onClose]);

    return (
        <VStack gap={4} align="stretch">
            {/* Keyword Search */}
            <Box>
                <Text fontWeight="bold" mb={2} fontSize="sm" textTransform="uppercase" color="gray.500">{t('search', { defaultValue: 'Search' })}</Text>
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
            <Accordion.Root multiple defaultValue={["currency", "price", "locations"]} variant="plain" size="sm">
                {/* Currency */}
                <Accordion.Item value="currency">
                    <Accordion.ItemTrigger py={1.5} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('currency', { defaultValue: 'Currency' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={1} pb={3}>
                            <NativeSelect.Root size="sm">
                                <NativeSelect.Field
                                    {...register("currency_id", { valueAsNumber: true })}
                                    placeholder={t('select_currency', { defaultValue: 'Select Currency' })}
                                >
                                    {currencies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                                    ))}
                                </NativeSelect.Field>
                            </NativeSelect.Root>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
                {/* Price Range */}
                <Accordion.Item value="price">
                    <Accordion.ItemTrigger py={1.5} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('price_range', { defaultValue: 'Price Range' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={1} pb={3}>
                            <HStack gap={2} mb={2}>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder={t('min', { defaultValue: 'Min' })}
                                    {...register("minPrice")}
                                    size="sm"
                                />
                                <Text>-</Text>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder={t('max', { defaultValue: 'Max' })}
                                    {...register("maxPrice")}
                                    size="sm"
                                />
                            </HStack>
                            <HStack justify="space-between" fontSize="xs" color="gray.600">
                                <Text>{selectedCurrencySymbol || ''}</Text>
                                <Text>{selectedCurrencySymbol || ''}</Text>
                            </HStack>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>

                {/* Rating */}
                <Accordion.Item value="rating">
                    <Accordion.ItemTrigger py={1.5} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('rating', { defaultValue: 'Rating' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={1} pb={3}>
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
                    <Accordion.ItemTrigger py={1.5} px={0}>
                        <Span flex="1" fontWeight="bold" fontSize="sm" textTransform="uppercase" color="gray.500">{t('locations', { defaultValue: 'Locations' })}</Span>
                        <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody pt={1} pb={3}>
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
export const FilterSidebar = memo(({ onApply }: FilterSidebarProps) => {
    const t = useTranslations('common');
    return (
        <Box
            bg="white"
            p={5}
            borderRadius="xl"
            shadow="sm"
            border="1px solid"
            borderColor="gray.100"
            position="sticky"
            top="100px"
        >
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
                <Icon as={FaFilter} color="main" />
                {t('filters', { defaultValue: 'Filters' })}
            </Heading>
            <FilterContent onApply={onApply} />
        </Box>
    );
});
FilterSidebar.displayName = "FilterSidebar";

// Mobile Filter Drawer Component
interface MobileFilterDrawerProps {
    onApply: (data: IUserTourSearchParams) => void;
}

export const MobileFilterDrawer = memo(({ onApply }: MobileFilterDrawerProps) => {
    const t = useTranslations('common');
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
                                <FilterContent onApply={onApply} onClose={() => setIsOpen(false)} />
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    );
});
MobileFilterDrawer.displayName = "MobileFilterDrawer";
