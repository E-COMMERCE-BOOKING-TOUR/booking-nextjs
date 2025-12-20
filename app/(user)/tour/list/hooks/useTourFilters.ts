"use client";

import { useDeferredValue, useMemo, useState, useTransition, useCallback } from "react";

export type SearchFilterPayload = {
  keyword?: string;
  destinations?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

type PriceFilter = [number | null, number | null];
type PriceRange = [number, number];

export const useTourFilters = (initialKeyword: string) => {
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>([null, null]);
  const [priceRangeBase, setPriceRangeBase] = useState<PriceRange>([0, 0]);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilterPayload>(
    initialKeyword ? { keyword: initialKeyword } : {}
  );
  const deferredFilters = useDeferredValue(appliedFilters);
  const [isPending, startTransition] = useTransition();

  const buildPayload = useCallback(
    (): SearchFilterPayload => ({
      keyword: searchQuery.trim() || undefined,
      destinations: selectedDestinations.length ? selectedDestinations : undefined,
      tags: selectedTags.length ? selectedTags : undefined,
      minPrice: typeof priceFilter[0] === "number" ? priceFilter[0] : undefined,
      maxPrice: typeof priceFilter[1] === "number" ? priceFilter[1] : undefined,
      minRating: selectedRating ?? undefined,
    }),
    [searchQuery, selectedDestinations, selectedTags, priceFilter, selectedRating]
  );

  const applyFilters = useCallback(() => {
    startTransition(() => {
      setAppliedFilters(buildPayload());
    });
  }, [buildPayload]);

  const resetFilters = useCallback(() => {
    startTransition(() => {
      setSearchQuery("");
      setSelectedDestinations([]);
      setSelectedTags([]);
      setSelectedRating(null);
      setPriceFilter([null, null]);
      setAppliedFilters({});
    });
  }, []);

  const updatePriceRangeBase = useCallback((range: PriceRange) => {
    const [minData, maxData] = range;
    if (maxData > 0) {
      setPriceRangeBase((prev) => {
        if (prev[0] === 0 && prev[1] === 0) return [minData, maxData];
        return [Math.min(prev[0], minData), Math.max(prev[1], maxData)];
      });
    }
  }, []);

  const priceRange = useMemo<PriceRange>(() => {
    const [baseMin, baseMax] = priceRangeBase;
    if (baseMax > baseMin) return priceRangeBase;
    return [0, 0];
  }, [priceRangeBase]);

  return {
    state: {
      searchQuery,
      selectedDestinations,
      selectedTags,
      selectedRating,
      priceFilter,
      priceRange,
      deferredFilters,
      isPending,
    },
    setSearchQuery,
    setSelectedDestinations,
    setSelectedTags,
    setSelectedRating,
    setPriceFilter,
    applyFilters,
    resetFilters,
    updatePriceRangeBase,
  };
};


