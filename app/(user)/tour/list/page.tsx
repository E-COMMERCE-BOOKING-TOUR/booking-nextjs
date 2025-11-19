'use client';

import {
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    Icon,
    Image,
    Input,
    Skeleton,
    Slider,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { memo, Suspense, useEffect, useMemo, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiCheck, FiChevronDown, FiMapPin, FiUsers } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import tourApi from '@/apis/tour';
import { ITourPopular, ITourSearchResponse } from '@/types/response/tour';

const ratingOptions = [
    { label: 'Excellent (9+)', value: 9 },
    { label: 'Very good (8+)', value: 8 },
    { label: 'Good (7+)', value: 7 },
];

const currency = 'VND';
const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type SearchFilterPayload = {
    keyword?: string;
    destinations?: string[];
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
};

const formatPrice = (value: number, currencyCode: string) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
    }).format(value);

type FilterSectionProps = {
    title: string;
    children: React.ReactNode;
};

const FilterSection = memo(function FilterSection({ title, children }: FilterSectionProps) {
    return (
        <VStack
            align="stretch"
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="blackAlpha.100"
            boxShadow="0 10px 30px rgba(15,35,95,0.08)"
            width="100%"
            p={5}
            gap={5}
        >
            <Heading fontSize="lg" color="gray.800">
                {title}
            </Heading>
            {children}
        </VStack>
    );
});
FilterSection.displayName = 'FilterSection';

type FilterToggleListProps = {
    options: string[];
    selected: string[];
    toggleOption: (value: string) => void;
};

const FilterToggleList = memo(function FilterToggleList({
    options,
    selected,
    toggleOption,
}: FilterToggleListProps) {
    return (
        <Stack gap={2}>
            {options.map((option) => {
                const active = selected.includes(option);
                return (
                    <Button
                        key={option}
                        justifyContent="space-between"
                        borderRadius="lg"
                        variant={active ? 'solid' : 'ghost'}
                        colorScheme="teal"
                        bg={active ? 'teal.500' : 'transparent'}
                        color={active ? 'white' : 'gray.700'}
                        px={4}
                        py={5}
                        h="auto"
                        fontWeight="semibold"
                        _hover={{ bg: active ? 'teal.600' : 'blackAlpha.50' }}
                        onClick={() => toggleOption(option)}
                    >
                        <Text>{option}</Text>
                        {active && <Icon as={FiCheck} />}
                    </Button>
                );
            })}
        </Stack>
    );
});
FilterToggleList.displayName = 'FilterToggleList';

const TourCard = memo(function TourCard({ tour }: { tour: ITourPopular }) {
    const primaryTag = tour.tags?.[0];
    const ratingValue = tour.rating ?? 0;
    const router = useRouter();

    return (
        <Flex
            bg="white"
            p={4}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="sm"
            align="stretch"
            gap={4}
            width="100%"
        >
            <Box w="160px" h="140px" overflow="hidden" borderRadius="xl" flexShrink={0}>
                <Image
                    src={tour.image}
                    alt={tour.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                />
            </Box>

            <Stack gap={3} flex={1}>
                <HStack justify="space-between" align="flex-start" gap={3}>
                    {primaryTag && (
                        <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="xs">
                            {primaryTag}
                        </Badge>
                    )}
                    <HStack gap={1} color="yellow.400" fontWeight="semibold">
                        <Icon as={FaStar} />
                        <Text color="gray.800">
                            {ratingValue.toFixed(1)}{' '}
                            <Text as="span" color="gray.500" fontWeight="medium">
                                ({tour.reviews} reviews · {tour.ratingText})
                            </Text>
                        </Text>
                    </HStack>
                </HStack>

                <Heading fontSize="lg" color="gray.900">
                    {tour.title}
                </Heading>

                <HStack gap={4} color="gray.600" fontSize="sm" flexWrap="wrap">
                    <HStack gap={1}>
                        <Icon as={FiMapPin} />
                        <Text>{tour.location}</Text>
                    </HStack>
                    <HStack gap={1}>
                        <Icon as={FiUsers} />
                        <Text>{tour.capacity}</Text>
                    </HStack>
                </HStack>

                {tour.tags?.length > 1 && (
                    <HStack gap={2} flexWrap="wrap">
                        {tour.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} colorScheme="gray" borderRadius="full" px={3} py={1}>
                                {tag}
                            </Badge>
                        ))}
                    </HStack>
                )}
            </Stack>

            <VStack justify="space-between" align="flex-end" minW="160px" gap={2}>
                <Text fontSize="xs" color="gray.500">
                    per person
                </Text>
                <VStack gap={0} align="flex-end">
                    {tour.originalPrice && tour.originalPrice > tour.currentPrice && (
                        <Text fontSize="sm" color="gray.500" textDecor="line-through">
                            {formatPrice(tour.originalPrice, currency)}
                        </Text>
                    )}
                    <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                        {formatPrice(tour.currentPrice, currency)}
                    </Text>
                </VStack>
                <Button
                    variant="outline"
                    colorScheme="teal"
                    borderRadius="full"
                    size="sm"
                    onClick={() => router.push(`/tour/${tour.slug}`)}
                >
                    View Details
                </Button>
            </VStack>
        </Flex>
    );
});
TourCard.displayName = 'TourCard';

function TourListContent() {
    const urlSearchParams = useSearchParams();
    const initialKeyword = (urlSearchParams.get('keyword') ?? '').trim();

    const [limit, setLimit] = useState(12);

    const [searchQuery, setSearchQuery] = useState(initialKeyword);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [priceFilter, setPriceFilter] = useState<[number | null, number | null]>([null, null]);
    const [appliedFilters, setAppliedFilters] = useState<SearchFilterPayload>(
        initialKeyword ? { keyword: initialKeyword } : {},
    );

    const [minPriceFilter, maxPriceFilter] = priceFilter;

    useEffect(() => {
        setSearchQuery(initialKeyword);
        setSelectedDestinations([]);
        setSelectedTags([]);
        setSelectedRating(null);
        setPriceFilter([null, null]);
        setLimit(12);
        setAppliedFilters(initialKeyword ? { keyword: initialKeyword } : {});
    }, [initialKeyword]);

    const searchParams = useMemo(
        () => ({
            ...appliedFilters,
            limit,
            offset: 0,
            sort: 'popular' as const,
        }),
        [appliedFilters, limit],
    );

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch: refetchTours,
    } = useQuery<ITourSearchResponse, Error>({
        queryKey: ['user-tours-search', searchParams],
        queryFn: () => tourApi.search(searchParams),
        placeholderData: (previousData) => previousData,
    });

    const tours: ITourPopular[] = useMemo(
        () => (Array.isArray(data?.data) ? data.data : []),
        [data],
    );
    const total = data?.total ?? 0;

    const priceRange: [number, number] = useMemo(() => {
        if (!tours.length) {
            return [0, 0];
        }

        const prices = tours
            .map((tour: ITourPopular) => tour.currentPrice)
            .filter((price): price is number => typeof price === 'number' && price > 0);

        if (!prices.length) {
            return [0, 0];
        }

        return [Math.min(...prices), Math.max(...prices)];
    }, [tours]);

    const showSlider = priceRange[1] > priceRange[0];

    const sliderValue: [number, number] = useMemo(() => {
        const [rangeMin, rangeMax] = priceRange;
        if (!showSlider) {
            return [rangeMin, rangeMin];
        }

        const minValue =
            typeof minPriceFilter === 'number'
                ? clampValue(minPriceFilter, rangeMin, rangeMax)
                : rangeMin;
        const maxValue =
            typeof maxPriceFilter === 'number'
                ? clampValue(maxPriceFilter, rangeMin, rangeMax)
                : rangeMax;

        return minValue <= maxValue ? [minValue, maxValue] : [maxValue, maxValue];
    }, [minPriceFilter, maxPriceFilter, priceRange, showSlider]);

    const sliderStep = useMemo(() => {
        const range = priceRange[1] - priceRange[0];
        if (range <= 0) return 1;
        const roughStep = Math.round(range / 100);
        return Math.max(1, roughStep);
    }, [priceRange]);

    const destinationOptions = useMemo(() => {
        const set = new Set<string>();
        tours.forEach((tour: ITourPopular) => {
            if (tour.location) {
                set.add(tour.location.trim());
            }
        });
        return Array.from(set);
    }, [tours]);

    const tagOptions = useMemo(() => {
        const set = new Set<string>();
        tours.forEach((tour: ITourPopular) => {
            tour.tags?.forEach((tag: string) => set.add(tag));
        });
        return Array.from(set);
    }, [tours]);

    const toggleSelection = (
        list: string[],
        setter: (next: string[]) => void,
        value: string,
    ) => {
        setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    };

    const handlePriceInputChange = (index: 0 | 1, value: string) => {
        const numericValue =
            value === '' ? null : Math.max(0, Number(value) || 0);

        setPriceFilter((prev) => {
            const next: [number | null, number | null] = [...prev];
            if (numericValue === null) {
                next[index] = null;
            } else {
                const [rangeMin, rangeMax] = priceRange;
                next[index] = clampValue(numericValue, rangeMin, rangeMax);
            }

            if (next[0] !== null && next[1] !== null && next[0] > next[1]) {
                if (index === 0) {
                    next[1] = next[0];
                } else {
                    next[0] = next[1];
                }
            }

            return next;
        });
    };

    const handleSliderChange = (value: number[]) => {
        if (!Array.isArray(value) || value.length !== 2 || !showSlider) {
            return;
        }
        const [minValue, maxValue] = value;
        setPriceFilter([minValue, maxValue]);
    };

    const buildFilterPayload = (): SearchFilterPayload => ({
        keyword: searchQuery.trim() || undefined,
        destinations: selectedDestinations.length ? selectedDestinations : undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        minPrice:
            typeof minPriceFilter === 'number' && minPriceFilter > 0 ? minPriceFilter : undefined,
        maxPrice:
            typeof maxPriceFilter === 'number' && maxPriceFilter > 0 ? maxPriceFilter : undefined,
        minRating: selectedRating ?? undefined,
    });

    const handleApplyFilters = () => {
        setAppliedFilters(buildFilterPayload());
        setLimit(12);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedDestinations([]);
        setSelectedTags([]);
        setSelectedRating(null);
        setPriceFilter([null, null]);
        setLimit(12);
        setAppliedFilters({});
    };

    const totalToursText = isLoading
        ? 'Loading tours...'
        : `${total} tours match your filters`;
    const currentDestinationLabel =
        selectedDestinations[0] || 'All destinations available';
    const canFilterByPrice = showSlider;
    const canLoadMore = !isFetching && tours.length < total;
    const hasCustomPriceFilter = minPriceFilter !== null || maxPriceFilter !== null;
    const priceSummaryText = hasCustomPriceFilter
        ? `${formatPrice(minPriceFilter ?? priceRange[0] ?? 0, currency)} - ${formatPrice(
            maxPriceFilter ?? priceRange[1] ?? 0,
            currency,
        )}`
        : canFilterByPrice
            ? `${formatPrice(priceRange[0], currency)} - ${formatPrice(priceRange[1], currency)}`
            : 'No price data available';

    return (
        <Box
            bgGradient="linear(180deg, rgba(240,248,255,0.9), rgba(255,241,246,0.9))"
            minH="100vh"
            py={10}
        >
            <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <Flex mb={10} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4}>
                    <Box>
                        <Heading fontSize={{ base: '2xl', md: '3xl' }} color="gray.900">
                            Discover Featured Tours
                        </Heading>
                        <HStack gap={2} color="gray.500" fontSize="sm" mt={2}>
                            <Text>{totalToursText}</Text>
                            <Text>•</Text>
                            <HStack gap={1}>
                                <Icon as={FiMapPin} />
                                <Text>{currentDestinationLabel}</Text>
                            </HStack>
                        </HStack>
                    </Box>
                    <HStack gap={3} align="center">
                        <Text color="gray.500">Sort by:</Text>
                        <Button bg="white" borderRadius="full" variant="outline" borderColor="gray.200" px={5}>
                            <HStack gap={2}>
                                <Text>Popularity</Text>
                                <Icon as={FiChevronDown} />
                            </HStack>
                        </Button>
                    </HStack>
                </Flex>

                <Grid
                    templateColumns={{ base: '1fr', lg: '320px 1fr' }}
                    gap={3}
                    alignItems="flex-start"
                >
                    <GridItem>
                        <VStack gap={2} w="full">
                            <FilterSection title="Quick Search">
                                <Stack gap={3}>
                                    <Input
                                        placeholder="Tour name or destination"
                                        borderRadius="lg"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                    />
                                    <Button
                                        variant="ghost"
                                        colorScheme="teal"
                                        borderRadius="full"
                                        onClick={handleResetFilters}
                                    >
                                        Reset filters
                                    </Button>
                                    <Button
                                        colorScheme="teal"
                                        borderRadius="full"
                                        onClick={handleApplyFilters}
                                    >
                                        Filter
                                    </Button>
                                </Stack>
                            </FilterSection>

                            <FilterSection title="Price Range">
                                <Stack gap={4}>
                                    <Text fontWeight="semibold" color="gray.700">
                                        {priceSummaryText}
                                    </Text>
                                    {showSlider ? (
                                        <Slider.Root
                                            min={priceRange[0]}
                                            max={priceRange[1]}
                                            step={sliderStep}
                                            value={sliderValue}
                                            onValueChange={(details) => handleSliderChange(details.value)}
                                            width="100%"
                                        >
                                            <Slider.Control>
                                                <Slider.Track
                                                    bg="gray.100"
                                                    h="6px"
                                                    borderRadius="full"
                                                    flex="1"
                                                >
                                                    <Slider.Range bg="teal.400" borderRadius="full" />
                                                </Slider.Track>
                                                <Slider.Thumb
                                                    index={0}
                                                    boxSize="16px"
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor="teal.400"
                                                    borderRadius="full"
                                                    boxShadow="md"
                                                    aria-label="Minimum price"
                                                >
                                                    <Slider.HiddenInput />
                                                </Slider.Thumb>
                                                <Slider.Thumb
                                                    index={1}
                                                    boxSize="16px"
                                                    bg="white"
                                                    border="2px solid"
                                                    borderColor="teal.400"
                                                    borderRadius="full"
                                                    boxShadow="md"
                                                    aria-label="Maximum price"
                                                >
                                                    <Slider.HiddenInput />
                                                </Slider.Thumb>
                                            </Slider.Control>
                                        </Slider.Root>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500">
                                            Price slider is unavailable for the current results.
                                        </Text>
                                    )}
                                    <HStack gap={3}>
                                        <Input
                                            type="number"
                                            borderRadius="lg"
                                            value={minPriceFilter ?? ''}
                                            placeholder={canFilterByPrice ? `${priceRange[0]}` : '0'}
                                            onChange={(event) =>
                                                handlePriceInputChange(0, event.target.value)
                                            }
                                            disabled={!canFilterByPrice}
                                        />
                                        <Text color="gray.500">to</Text>
                                        <Input
                                            type="number"
                                            borderRadius="lg"
                                            value={maxPriceFilter ?? ''}
                                            placeholder={canFilterByPrice ? `${priceRange[1]}` : '0'}
                                            onChange={(event) =>
                                                handlePriceInputChange(1, event.target.value)
                                            }
                                            disabled={!canFilterByPrice}
                                        />
                                    </HStack>
                                </Stack>
                            </FilterSection>

                            <FilterSection title="Rating">
                                <Stack gap={2}>
                                    {ratingOptions.map((option) => {
                                        const active = selectedRating === option.value;
                                        return (
                                            <Button
                                                key={option.value}
                                                variant={active ? 'solid' : 'outline'}
                                                colorScheme="teal"
                                                borderRadius="lg"
                                                justifyContent="flex-start"
                                                onClick={() =>
                                                    setSelectedRating(
                                                        active ? null : option.value,
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </Button>
                                        );
                                    })}
                                </Stack>
                            </FilterSection>

                            {destinationOptions.length > 0 && (
                                <FilterSection title="Destinations">
                                    <FilterToggleList
                                        options={destinationOptions}
                                        selected={selectedDestinations}
                                        toggleOption={(value) =>
                                            toggleSelection(
                                                selectedDestinations,
                                                setSelectedDestinations,
                                                value,
                                            )
                                        }
                                    />
                                </FilterSection>
                            )}

                            {tagOptions.length > 0 && (
                                <FilterSection title="Highlights">
                                    <FilterToggleList
                                        options={tagOptions}
                                        selected={selectedTags}
                                        toggleOption={(value) =>
                                            toggleSelection(selectedTags, setSelectedTags, value)
                                        }
                                    />
                                </FilterSection>
                            )}
                        </VStack>
                    </GridItem>

                    <GridItem>
                        <VStack w="full" gap={4}>
                            {error && (
                                <Box
                                    w="full"
                                    p={4}
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="red.100"
                                    bg="red.50"
                                >
                                    <Text color="red.600">
                                        {error instanceof Error
                                            ? error.message
                                            : 'Unable to load data right now.'}
                                    </Text>
                                    <Button
                                        mt={3}
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => refetchTours()}
                                    >
                                        Try again
                                    </Button>
                                </Box>
                            )}

                            {isLoading
                                ? Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} height="180px" borderRadius="2xl" />
                                ))
                                : tours.map((tour: ITourPopular) => (
                                    <TourCard key={tour.id} tour={tour} />
                                ))}

                            {!isLoading && !tours.length && !error && (
                                <Box
                                    w="full"
                                    p={6}
                                    borderRadius="2xl"
                                    border="1px dashed"
                                    borderColor="gray.200"
                                    textAlign="center"
                                    bg="white"
                                >
                                    <Heading fontSize="lg" color="gray.800">
                                        No tours matched your filters
                                    </Heading>
                                    <Text color="gray.500" mt={2}>
                                        Adjust your filters and try again.
                                    </Text>
                                </Box>
                            )}

                            <Box w="full" h="1px" bg="gray.100" />

                            {canLoadMore && (
                                <Button
                                    borderRadius="full"
                                    colorScheme="teal"
                                    variant="outline"
                                    alignSelf="center"
                                    onClick={() => setLimit((prev) => prev + 8)}
                                    disabled={isFetching}
                                >
                                    Load more tours
                                </Button>
                            )}
                        </VStack>
                    </GridItem>
                </Grid>
            </Box>
        </Box>
    );
}

export default function TourListPage() {
    return (
        <Suspense fallback={<Box minH="100vh" py={10}><Skeleton height="500px" /></Box>}>
            <TourListContent />
        </Suspense>
    );
}
