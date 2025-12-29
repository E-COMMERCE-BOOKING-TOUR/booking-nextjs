"use client";

import { Box, Heading, VStack, Text, HStack, Spinner, Flex, Image as ChakraImage, Button } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import article from "@/apis/article";
import Link from "next/link";
import division from "@/apis/division";

export default function BlogSidebarRight() {

  const { data: trendingTags, isLoading } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: async () => await article.getTrendingTags(4),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const { data: trendingDestinations, isLoading: isDestLoading } = useQuery({
    queryKey: ["trending-destinations"],
    queryFn: async () => await division.trending(3),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <Box
      w={{ base: "full", lg: "300px" }}
      display={{ base: "none", lg: "block" }}
      position="sticky"
      top="80px"
      h="fit-content"
    >
      {/* Trending Tags */}
      <Box
        bg="white"
        color="black"
        borderRadius="xl"
        p={6}
        shadow="xl"
        mb={6}
        border="1px solid"
        borderColor="gray.50"
      >
        <Heading size="md" mb={6} fontWeight="800" letterSpacing="tight">Trending Tags</Heading>

        {isLoading ? (
          <Flex justify="center" py={4}>
            <Spinner color="main" />
          </Flex>
        ) : (
          <VStack align="stretch" gap={0}>
            {trendingTags?.map((tag) => (
              <Link href={`/social/explore?tag=${tag._id}`} key={tag._id}>
                <HStack
                  justify="space-between"
                  cursor="pointer"
                  _hover={{ bg: "blue.50", transform: "translateX(4px)" }}
                  py={3}
                  px={3}
                  mx={-3}
                  borderRadius="xl"
                  transition="all 0.2s"
                >
                  <Text fontWeight="700" fontSize="md" color="main">#{tag._id}</Text>
                  <Text color="gray.400" fontSize="xs" fontWeight="bold">{tag.count} posts</Text>
                </HStack>
              </Link>
            ))}
            {(!trendingTags || trendingTags.length === 0) && (
              <Text color="gray.500" fontSize="sm">No trending tags yet.</Text>
            )}
          </VStack>
        )}
      </Box>

      {/* Popular Destinations */}
      <Box
        bg="white"
        borderRadius="xl"
        p={6}
        shadow="xl"
        position="relative"
        overflow="hidden"
        color="black"
      >
        <Heading size="md" mb={6} fontWeight="800">Popular Destinations</Heading>
        {isDestLoading ? (
          <Flex justify="center" py={4}>
            <Spinner color="main" />
          </Flex>
        ) : (
          <VStack align="stretch" gap={4}>
            {trendingDestinations?.map((dest) => (
              <Link href={`/tour/list?division_id=${dest.id}`} key={dest.id}>
                <HStack gap={3} role="group" cursor="pointer">
                  <Box borderRadius="xl" overflow="hidden" w="60px" h="60px" flexShrink={0}>
                    <ChakraImage src={dest.image} alt={dest.title} w="full" h="full" objectFit="cover" transition="transform 0.3s" _groupHover={{ transform: "scale(1.1)" }} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="800" fontSize="sm" _groupHover={{ color: "main" }}>{dest.title}</Text>
                    <Text fontSize="2xs" fontWeight="bold" color="gray.400">{dest.toursCount} tours available</Text>
                  </VStack>
                </HStack>
              </Link>
            ))}
            {(!trendingDestinations || trendingDestinations.length === 0) && (
              <Text color="gray.500" fontSize="sm">No popular destinations yet.</Text>
            )}
          </VStack>
        )}
        <Link href="/tour/list">
          <Button
            variant="outline"
            colorScheme="gray"
            w="full"
            mt={6}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            _hover={{ bg: "main", color: "white" }}
          >
            View More
          </Button>
        </Link>
      </Box>
    </Box>
  );
}