"use client";

import { useEffect, Fragment, useState, useMemo, useCallback, memo, useTransition } from "react";
import { Box, Container, Grid, SimpleGrid, Spinner, Text, VStack, Button, HStack, NativeSelect } from "@chakra-ui/react";
import { IUserTourSearchParams } from "@/types/response/tour.type";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import tourApi from "@/apis/tour";
import TourItem from "@/components/ui/user/tourItem";
import { FilterSidebar, MobileFilterDrawer } from "./filterSidebar";
import { FormProvider, useForm } from "react-hook-form";
import { useInfiniteQuery } from "@tanstack/react-query";
import { parseSearchParamsToFilters, filtersToQueryString, EMPTY_FILTERS } from "@/utils/searchParams";

// Memoized TourItem wrapper to prevent unnecessary re-renders
const MemoizedTourItem = memo(TourItem);

export const TourListClient = () => {
    const searchParams = useSearchParams();
    const t = useTranslations('common');
    const [isPending, startTransition] = useTransition();

    // Initial state from URL - computed ONCE on mount
    const initialFilters = useMemo<IUserTourSearchParams>(
        () => parseSearchParamsToFilters(searchParams),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Empty deps = only compute once on mount
    );

    const methods = useForm<IUserTourSearchParams>({
        defaultValues: initialFilters,
    });

    const { reset, handleSubmit, register } = methods;

    // State to hold the applied filters for the query
    const [appliedFilters, setAppliedFilters] = useState<IUserTourSearchParams>(initialFilters);

    // Memoized apply filters handler
    const onApplyFilters = useCallback((data: IUserTourSearchParams) => {
        const sanitizedValue: IUserTourSearchParams = {
            ...data,
            minPrice: data.minPrice ? Number(data.minPrice) : undefined,
            maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
            minRating: data.minRating ? Number(data.minRating) : undefined,
            currency_id: data.currency_id ? Number(data.currency_id) : undefined,
        };
        setAppliedFilters(sanitizedValue);
    }, []);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['tours', appliedFilters],
        queryFn: async ({ pageParam = 0 }) => {
            const params = { ...appliedFilters, offset: pageParam as number };
            return tourApi.search(params);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const currentOffset = allPages.length * (appliedFilters.limit || 12);
            return currentOffset < lastPage.total ? currentOffset : undefined;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Synchronize URL params to state ONLY when searchParams changes externally
    useEffect(() => {
        const newFilters = parseSearchParamsToFilters(searchParams);
        setAppliedFilters(newFilters);
        reset(newFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Update URL when applied filters change
    useEffect(() => {
        const queryString = filtersToQueryString(appliedFilters);
        const currentQuery = new URLSearchParams(window.location.search).toString();

        if (queryString !== currentQuery) {
            const newUrl = queryString ? `/tour/list?${queryString}` : '/tour/list';
            window.history.replaceState(null, '', newUrl);
        }
    }, [appliedFilters]);

    // Memoized handlers
    const handleLoadMore = useCallback(() => fetchNextPage(), [fetchNextPage]);

    const handleClearFilters = useCallback(() => {
        reset(EMPTY_FILTERS);
        onApplyFilters(EMPTY_FILTERS);
    }, [reset, onApplyFilters]);

    const handleSortChange = useCallback(() => {
        startTransition(() => {
            handleSubmit(onApplyFilters)();
        });
    }, [handleSubmit, onApplyFilters]);

    // Memoize flattened tour list to prevent re-computation on every render
    const allTours = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap(page => page.data);
    }, [data?.pages]);

    const total = data?.pages[0]?.total || 0;

    return (
        <FormProvider {...methods}>
            <Container maxW="2xl" py={8}>
                <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={5}>
                    {/* Sidebar */}
                    <Box display={{ base: "none", lg: "block" }}>
                        <FilterSidebar onApply={onApplyFilters} />
                    </Box>

                    {/* Main Content */}
                    <Box>
                        {/* Header: Count & Sort */}
                        <HStack justify="space-between" mb={6}>
                            <Text fontWeight="bold" color="gray.600">
                                {t('found_tours', { count: total, defaultValue: `Found ${total} tours` })}
                            </Text>
                            <NativeSelect.Root w="auto" size="sm" borderRadius="lg" cursor="pointer">
                                <NativeSelect.Field
                                    {...register("sort", { onChange: handleSortChange })}
                                    opacity={isPending ? 0.6 : 1}
                                >
                                    <option value="popular">{t('popular', { defaultValue: 'Popular' })}</option>
                                    <option value="newest">{t('newest', { defaultValue: 'Newest' })}</option>
                                    <option value="price_asc">{t('price_asc', { defaultValue: 'Price: Low to High' })}</option>
                                    <option value="price_desc">{t('price_desc', { defaultValue: 'Price: High to Low' })}</option>
                                    <option value="rating_desc">{t('rating_desc', { defaultValue: 'Rating: High to Low' })}</option>
                                </NativeSelect.Field>
                            </NativeSelect.Root>
                        </HStack>

                        {/* Mobile Filters */}
                        <Box display={{ base: "block", lg: "none" }} mb={4}>
                            <MobileFilterDrawer onApply={onApplyFilters} />
                        </Box>

                        {/* Data */}
                        {status === 'pending' ? (
                            <VStack py={20}>
                                <Spinner size="xl" color="main" borderWidth="4px" />
                                <Text color="gray.500" mt={4}>{t('finding_adventures', { defaultValue: 'Finding the best adventures for you...' })}</Text>
                            </VStack>
                        ) : status === 'error' ? (
                            <Text color="red.500">Error loading tours: {error instanceof Error ? error.message : String(error)}</Text>
                        ) : (
                            <>
                                {allTours.length > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={3}>
                                        {allTours.map((tour) => (
                                            <MemoizedTourItem
                                                key={tour.id}
                                                image={tour.image}
                                                title={tour.title}
                                                location={tour.location}
                                                rating={tour.rating}
                                                reviews={tour.reviews}
                                                ratingText={tour.ratingText}
                                                capacity={tour.capacity}
                                                currentPrice={tour.currentPrice}
                                                originalPrice={tour.originalPrice}
                                                tags={tour.tags}
                                                slug={tour.slug}
                                                currencySymbol={tour.currencySymbol}
                                                currencyCode={tour.currencyCode}
                                            />
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <VStack py={20} bg="gray.50" borderRadius="xl">
                                        <Text fontSize="lg" fontWeight="bold" color="gray.600">{t("no_tours_found")}</Text>
                                        <Text color="gray.500">{t("try_adjusting_filters")}</Text>
                                        <Button variant="ghost" color="main" onClick={handleClearFilters}>
                                            {t("clear_all_filters")}
                                        </Button>
                                    </VStack>
                                )}

                                {/* Load More Button */}
                                {hasNextPage && (
                                    <Box textAlign="center" mt={10} pb={8}>
                                        <Button
                                            onClick={handleLoadMore}
                                            loading={isFetchingNextPage}
                                            variant="outline"
                                            colorScheme="main"
                                            size="lg"
                                            px={8}
                                        >
                                            {isFetchingNextPage ? t("loading") : t("load_more")}
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Grid>
            </Container>
        </FormProvider>
    );
};
