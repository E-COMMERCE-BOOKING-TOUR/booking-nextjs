"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import tourApi from "@/apis/tour";
import { ITourPopular, ITourSearchResponse } from "@/types/response/tour";
import { SearchFilterPayload } from "./useTourFilters";

type SearchParams = SearchFilterPayload & {
  limit: number;
  offset: number;
  sort: "popular";
};

export const useUserTours = (searchParams: SearchParams) => {
  const query = useQuery<ITourSearchResponse, Error>({
    queryKey: ["user-tours-search", searchParams],
    queryFn: () => tourApi.search(searchParams),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: 1,
  });

  const tours: ITourPopular[] = Array.isArray(query.data?.data) ? query.data!.data : [];
  const total = query.data?.total ?? 0;

  return {
    ...query,
    tours,
    total,
  };
};


