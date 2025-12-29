"use client";

import { useEffect, Fragment, useState, useMemo, useCallback, memo } from "react";
import { Box, Container, Grid, SimpleGrid, Spinner, Text, VStack, Button, HStack, NativeSelect } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { IUserTourSearchParams } from "@/types/response/tour.type";
import { useTranslation } from "@/libs/i18n/client";
import { fallbackLng } from "@/libs/i18n/settings";
import tourApi from "@/apis/tour";
import TourItem from "@/components/ui/user/tourItem";
import { FilterSidebar, MobileFilterDrawer } from "./filterSidebar";
import { FormProvider, useForm } from "react-hook-form";
import { useInfiniteQuery } from "@tanstack/react-query";

// Memoized TourItem wrapper to prevent unnecessary re-renders
const MemoizedTourItem = memo(TourItem);

export const TourListClient = ({ lng: propLng }: { lng?: string }) => {
    const searchParams = useSearchParams();
    const lng = propLng || searchParams?.get('lng') || fallbackLng;
    const { t } = useTranslation(lng as string);

    // Initial state from URL - computed ONCE on mount
    const initialFilters = useMemo<IUserTourSearchParams>(() => ({
        keyword: searchParams.get("keyword") || "",
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        travelers: searchParams.get("travelers") ? Number(searchParams.get("travelers")) : undefined,
        adults: searchParams.get("adults") ? Number(searchParams.get("adults")) : undefined,
        seniors: searchParams.get("seniors") ? Number(searchParams.get("seniors")) : undefined,
        youth: searchParams.get("youth") ? Number(searchParams.get("youth")) : undefined,
        children: searchParams.get("children") ? Number(searchParams.get("children")) : undefined,
        infants: searchParams.get("infants") ? Number(searchParams.get("infants")) : undefined,
        rooms: searchParams.get("rooms") ? Number(searchParams.get("rooms")) : undefined,
        country_ids: searchParams.get("country_ids") ? searchParams.get("country_ids")?.split(",").map(Number) : [],
        division_ids: searchParams.get("division_ids") ? searchParams.get("division_ids")?.split(",").map(Number) : [],
        sort: (searchParams.get("sort") as IUserTourSearchParams['sort']) || "popular",
        limit: 12,
        offset: 0,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []); // Empty deps = only compute once on mount

    const emptyFilters = useMemo<IUserTourSearchParams>(() => ({
        keyword: "",
        minPrice: undefined,
        maxPrice: undefined,
        minRating: undefined,
        startDate: undefined,
        endDate: undefined,
        travelers: undefined,
        adults: undefined,
        seniors: undefined,
        youth: undefined,
        children: undefined,
        infants: undefined,
        rooms: undefined,
        country_ids: [],
        division_ids: [],
        sort: "popular",
        limit: 12,
        offset: 0,
    }), []);

    const methods = useForm<IUserTourSearchParams>({
        defaultValues: initialFilters,
    });

    const { reset, handleSubmit, register } = methods;

    // State to hold the applied filters for the query
    const [appliedFilters, setAppliedFilters] = useState<IUserTourSearchParams>(initialFilters);

    // Memoized apply filters handler
    const onApplyFilters = useCallback((data: IUserTourSearchParams) => {
        const sanitizedValue = {
            ...data,
            minPrice: data.minPrice ? Number(data.minPrice) : undefined,
            maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
            minRating: data.minRating ? Number(data.minRating) : undefined,
        };
        setAppliedFilters(sanitizedValue as IUserTourSearchParams);
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
            const res = await tourApi.search(params);
            return res;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const currentOffset = allPages.length * (appliedFilters.limit || 12);
            return currentOffset < lastPage.total ? currentOffset : undefined;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Synchronize URL params to state (e.g. when searching from another page or header)
    useEffect(() => {
        const keyword = searchParams.get("keyword") || "";
        const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
        const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
        const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;
        const travelers = searchParams.get("travelers") ? Number(searchParams.get("travelers")) : undefined;
        const adults = searchParams.get("adults") ? Number(searchParams.get("adults")) : undefined;
        const seniors = searchParams.get("seniors") ? Number(searchParams.get("seniors")) : undefined;
        const youth = searchParams.get("youth") ? Number(searchParams.get("youth")) : undefined;
        const children = searchParams.get("children") ? Number(searchParams.get("children")) : undefined;
        const infants = searchParams.get("infants") ? Number(searchParams.get("infants")) : undefined;
        const rooms = searchParams.get("rooms") ? Number(searchParams.get("rooms")) : undefined;
        const countryIds = searchParams.get("country_ids") ? searchParams.get("country_ids")?.split(",").map(Number) : [];
        const divisionIds = searchParams.get("division_ids") ? searchParams.get("division_ids")?.split(",").map(Number) : [];
        const sort = (searchParams.get("sort") as IUserTourSearchParams['sort']) || "popular";

        setAppliedFilters({
            keyword,
            minPrice,
            maxPrice,
            minRating,
            startDate,
            endDate,
            travelers,
            adults,
            seniors,
            youth,
            children,
            infants,
            rooms,
            country_ids: countryIds,
            division_ids: divisionIds,
            sort,
            limit: 12,
            offset: 0,
        });

        reset({
            keyword,
            minPrice,
            maxPrice,
            minRating,
            startDate,
            endDate,
            travelers,
            adults,
            seniors,
            youth,
            children,
            infants,
            rooms,
            country_ids: countryIds,
            division_ids: divisionIds,
            sort,
        });
    }, [searchParams, reset]);

    // Update URL when applied filters change (using window.history to avoid React re-renders)
    useEffect(() => {
        const query = new URLSearchParams();

        if (appliedFilters.keyword) query.set("keyword", appliedFilters.keyword);
        if (appliedFilters.minPrice) query.set("minPrice", appliedFilters.minPrice.toString());
        if (appliedFilters.maxPrice) query.set("maxPrice", appliedFilters.maxPrice.toString());
        if (appliedFilters.minRating) query.set("minRating", appliedFilters.minRating.toString());
        if (appliedFilters.country_ids && appliedFilters.country_ids.length > 0) query.set("country_ids", appliedFilters.country_ids.join(","));
        if (appliedFilters.division_ids && appliedFilters.division_ids.length > 0) query.set("division_ids", appliedFilters.division_ids.join(","));
        if (appliedFilters.sort && appliedFilters.sort !== "popular") query.set("sort", appliedFilters.sort);
        if (appliedFilters.startDate) query.set("startDate", appliedFilters.startDate);
        if (appliedFilters.endDate) query.set("endDate", appliedFilters.endDate);
        if (appliedFilters.travelers) query.set("travelers", appliedFilters.travelers.toString());
        if (appliedFilters.adults) query.set("adults", appliedFilters.adults.toString());
        if (appliedFilters.seniors) query.set("seniors", appliedFilters.seniors.toString());
        if (appliedFilters.youth) query.set("youth", appliedFilters.youth.toString());
        if (appliedFilters.children) query.set("children", appliedFilters.children.toString());
        if (appliedFilters.infants) query.set("infants", appliedFilters.infants.toString());
        if (appliedFilters.rooms) query.set("rooms", appliedFilters.rooms.toString());

        const queryString = query.toString();
        const newUrl = queryString ? `/tour/list?${queryString}` : '/tour/list';
        window.history.replaceState(null, '', newUrl);
    }, [appliedFilters]);

    // Memoized handlers
    const handleLoadMore = useCallback(() => fetchNextPage(), [fetchNextPage]);

    const handleClearFilters = useCallback(() => {
        reset(emptyFilters);
        onApplyFilters(emptyFilters);
    }, [reset, emptyFilters, onApplyFilters]);

    const handleSortChange = useCallback(() => {
        handleSubmit(onApplyFilters)();
    }, [handleSubmit, onApplyFilters]);

    const total = data?.pages[0]?.total || 0;

    return (
        <FormProvider {...methods}>
            <Container maxW="2xl" py={8}>
                <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={4}>
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
                                >
                                    <option value="popular">{t('popular', { defaultValue: 'Popular' })}</option>
                                    <option value="newest">{t('newest', { defaultValue: 'Newest' })}</option>
                                    <option value="price_asc">{t('price_asc', { defaultValue: 'Price: Low to High' })}</option>
                                    <option value="price_desc">{t('price_desc', { defaultValue: 'Price: High to Low' })}</option>
                                    <option value="rating_desc">{t('rating_desc', { defaultValue: 'Rating: High to Low' })}</option>
                                </NativeSelect.Field>
                            </NativeSelect.Root>
                        </HStack>

                        {/* Mobile Filters - uses Drawer instead of inline component */}
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
                                {total > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={3}>
                                        {data.pages.map((page, i) => (
                                            <Fragment key={i}>
                                                {page.data.map((tour) => (
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
                                                        lng={lng}
                                                    />
                                                ))}
                                            </Fragment>
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
