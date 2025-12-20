'use client';

import { Box, Grid, GridItem, Skeleton } from '@chakra-ui/react';
import { useMemo, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useTourFilters } from './hooks/useTourFilters';
import { useUserTours } from './hooks/useUserTours';
import { FilterSidebar } from './components/FilterSidebar';
import { TourGrid } from './components/TourGrid';
import { PageHeader } from './components/PageHeader';
import { clampValue } from './components/utils';

function TourListContent() {
    const urlSearchParams = useSearchParams();
    const initialKeyword = (urlSearchParams.get('keyword') ?? '').trim();

    const filters = useTourFilters(initialKeyword);
    const [limit, setLimit] = useState(12);

    const searchParams = useMemo(
        () => ({
            ...filters.state.deferredFilters,
            limit,
            offset: 0,
            sort: 'popular' as const,
        }),
        [filters.state.deferredFilters, limit],
    );

    const { tours, total, isLoading, isFetching, error, refetch } = useUserTours(searchParams);
    const deferredTours = tours;
    const canLoadMore = !isFetching && tours.length < total;

    // Price range
    const priceRangeFromData: [number, number] = useMemo(() => {
        if (!tours.length) return [0, 0];
        const prices = tours
            .map((tour) => tour.currentPrice)
            .filter((price): price is number => typeof price === 'number' && price >= 0);
        if (!prices.length) return [0, 0];
        return [Math.min(...prices), Math.max(...prices)];
    }, [tours]);

    filters.updatePriceRangeBase(priceRangeFromData);
    const priceRange =
        filters.state.priceRange[1] > filters.state.priceRange[0]
            ? filters.state.priceRange
            : priceRangeFromData;
    const showSlider = priceRange[1] > priceRange[0];

    const [minPriceFilter, maxPriceFilter] = filters.state.priceFilter;
    const sliderValue: [number, number] = useMemo(() => {
        const [rangeMin, rangeMax] = priceRange;
        if (!showSlider) return [rangeMin, rangeMin];
        const minValue =
            typeof minPriceFilter === 'number' ? clampValue(minPriceFilter, rangeMin, rangeMax) : rangeMin;
        const maxValue =
            typeof maxPriceFilter === 'number' ? clampValue(maxPriceFilter, rangeMin, rangeMax) : rangeMax;
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
        tours.forEach((tour) => tour.location && set.add(tour.location.trim()));
        return Array.from(set);
    }, [tours]);

    const tagOptions = useMemo(() => {
        const set = new Set<string>();
        tours.forEach((tour) => tour.tags?.forEach((tag) => set.add(tag)));
        return Array.from(set);
    }, [tours]);

    const totalToursText = isLoading ? 'Loading tours...' : `${total} tours match your filters`;
    const currentDestinationLabel =
        filters.state.selectedDestinations[0] || 'All destinations available';

    return (
        <Box bg="gray.50" minH="100vh" py={10}>
            <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <PageHeader totalLabel={totalToursText} destinationLabel={currentDestinationLabel} />

                <Grid templateColumns={{ base: '1fr', lg: '320px 1fr' }} gap={3} alignItems="flex-start">
                    <GridItem>
                        <FilterSidebar
                            searchQuery={filters.state.searchQuery}
                            onSearchChange={filters.setSearchQuery}
                            onApply={filters.applyFilters}
                            onReset={filters.resetFilters}
                            priceRange={priceRange}
                            minPriceFilter={minPriceFilter}
                            maxPriceFilter={maxPriceFilter}
                            sliderValue={sliderValue}
                            sliderStep={sliderStep}
                            showSlider={showSlider}
                            onPriceInputChange={(index, value) => {
                                filters.setPriceFilter((prev): [number | null, number | null] => {
                                    const next: [number | null, number | null] = [...prev];
                                    const numericValue = value === '' ? null : Math.max(0, Number(value) || 0);
                                    if (numericValue === null) {
                                        next[index] = null;
                                    } else {
                                        const [rangeMin, rangeMax] = priceRange;
                                        next[index] = clampValue(numericValue, rangeMin, rangeMax);
                                    }
                                    if (next[0] !== null && next[1] !== null && next[0] > next[1]) {
                                        if (index === 0) next[1] = next[0];
                                        else next[0] = next[1];
                                    }
                                    return next;
                                });
                            }}
                            onSliderChange={(value: number[]) => {
                                if (!Array.isArray(value) || value.length !== 2 || !showSlider) return;
                                const [minValue, maxValue] = value;
                                filters.setPriceFilter([minValue, maxValue]);
                            }}
                            destinationOptions={destinationOptions}
                            selectedDestinations={filters.state.selectedDestinations}
                            onToggleDestination={(value) =>
                                filters.setSelectedDestinations((prev) =>
                                    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                                )
                            }
                            tagOptions={tagOptions}
                            selectedTags={filters.state.selectedTags}
                            onToggleTag={(value) =>
                                filters.setSelectedTags((prev) =>
                                    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                                )
                            }
                            selectedRating={filters.state.selectedRating}
                            onSelectRating={filters.setSelectedRating}
                        />
                    </GridItem>

                    <GridItem>
                        <TourGrid
                            tours={deferredTours}
                            isLoading={isLoading}
                            error={error}
                            onRetry={refetch}
                            onLoadMore={() => setLimit((prev) => prev + 8)}
                            canLoadMore={canLoadMore}
                            isFetching={isFetching}
                            isPending={filters.state.isPending}
                        />
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
