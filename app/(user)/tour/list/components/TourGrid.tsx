"use client";

import { Box, Button, Heading, Skeleton, Text, VStack } from "@chakra-ui/react";
import { ITourPopular } from "@/types/response/tour";
import TourCard from "@/components/ui/user/tourCard";

type TourGridProps = {
  tours: ITourPopular[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onLoadMore?: () => void;
  canLoadMore: boolean;
  isFetching: boolean;
  isPending: boolean;
  skeletonCount?: number;
};

export function TourGrid({
  tours,
  isLoading,
  error,
  onRetry,
  onLoadMore,
  canLoadMore,
  isFetching,
  isPending,
  skeletonCount = 6,
}: TourGridProps) {
  return (
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
          <Text color="red.600">{error?.message ?? "Unable to load data right now."}</Text>
          {onRetry && (
            <Button mt={3} size="sm" colorScheme="red" onClick={onRetry}>
              Try again
            </Button>
          )}
        </Box>
      )}

      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton key={index} height="180px" borderRadius="2xl" />
          ))
        : tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}

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
          onClick={onLoadMore}
          disabled={isFetching || isPending}
        >
          Load more tours
        </Button>
      )}
    </VStack>
  );
}


