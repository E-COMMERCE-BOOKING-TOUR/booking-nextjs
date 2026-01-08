"use client";

import { IUserTourSearchParams } from "@/types/response/tour.type";

/**
 * Parse URLSearchParams into IUserTourSearchParams
 */
export function parseSearchParamsToFilters(
    searchParams: URLSearchParams | { get: (key: string) => string | null }
): IUserTourSearchParams {
    const getParam = (key: string) => searchParams.get(key);

    return {
        keyword: getParam("keyword") || "",
        minPrice: getParam("minPrice") ? Number(getParam("minPrice")) : undefined,
        maxPrice: getParam("maxPrice") ? Number(getParam("maxPrice")) : undefined,
        currency_id: getParam("currency_id") ? Number(getParam("currency_id")) : undefined,
        minRating: getParam("minRating") ? Number(getParam("minRating")) : undefined,
        startDate: getParam("startDate") || undefined,
        endDate: getParam("endDate") || undefined,
        travelers: getParam("travelers") ? Number(getParam("travelers")) : undefined,
        adults: getParam("adults") ? Number(getParam("adults")) : undefined,
        seniors: getParam("seniors") ? Number(getParam("seniors")) : undefined,
        youth: getParam("youth") ? Number(getParam("youth")) : undefined,
        children: getParam("children") ? Number(getParam("children")) : undefined,
        infants: getParam("infants") ? Number(getParam("infants")) : undefined,
        rooms: getParam("rooms") ? Number(getParam("rooms")) : undefined,
        country_ids: getParam("country_ids") ? getParam("country_ids")!.split(",").map(Number) : [],
        division_ids: getParam("division_ids") ? getParam("division_ids")!.split(",").map(Number) : [],
        sort: (getParam("sort") as IUserTourSearchParams['sort']) || "popular",
        limit: 12,
        offset: 0,
    };
}

/**
 * Convert IUserTourSearchParams to URLSearchParams query string
 */
export function filtersToQueryString(filters: IUserTourSearchParams): string {
    const query = new URLSearchParams();

    if (filters.keyword) query.set("keyword", filters.keyword);
    if (filters.minPrice) query.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) query.set("maxPrice", filters.maxPrice.toString());
    if (filters.currency_id) query.set("currency_id", filters.currency_id.toString());
    if (filters.minRating) query.set("minRating", filters.minRating.toString());
    if (filters.country_ids && filters.country_ids.length > 0) query.set("country_ids", filters.country_ids.join(","));
    if (filters.division_ids && filters.division_ids.length > 0) query.set("division_ids", filters.division_ids.join(","));
    if (filters.sort && filters.sort !== "popular") query.set("sort", filters.sort);
    if (filters.startDate) query.set("startDate", filters.startDate);
    if (filters.endDate) query.set("endDate", filters.endDate);
    if (filters.travelers) query.set("travelers", filters.travelers.toString());
    if (filters.adults) query.set("adults", filters.adults.toString());
    if (filters.seniors) query.set("seniors", filters.seniors.toString());
    if (filters.youth) query.set("youth", filters.youth.toString());
    if (filters.children) query.set("children", filters.children.toString());
    if (filters.infants) query.set("infants", filters.infants.toString());
    if (filters.rooms) query.set("rooms", filters.rooms.toString());

    return query.toString();
}

/**
 * Default empty filters
 */
export const EMPTY_FILTERS: IUserTourSearchParams = {
    keyword: "",
    minPrice: undefined,
    maxPrice: undefined,
    currency_id: undefined,
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
};
