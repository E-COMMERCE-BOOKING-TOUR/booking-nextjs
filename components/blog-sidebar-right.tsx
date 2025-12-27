"use client";

import { Box, Heading, VStack, Text, HStack, Spinner, Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import article from "@/apis/article";
import Link from "next/link";

export default function BlogSidebarRight() {

  const { data: trendingTags, isLoading } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: async () => await article.getTrendingTags(4),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return (
    <Box
      w={{ base: "full", lg: "300px" }}
      display={{ base: "none", lg: "block" }}
      position="sticky"
      top="30px"
      h="fit-content"
      paddingTop="1.25rem"
    >
      <Box
        bg="white"
        color="black"
        borderRadius="2xl"
        p={5}
        shadow="sm"
        mb={6}
        border="1px solid"
        borderColor="gray.100"
      >
        <Heading size="md" mb={4}>Trending Tags</Heading>

        {isLoading ? (
          <Flex justify="center" py={4}>
            <Spinner color="blue.500" />
          </Flex>
        ) : (
          <VStack align="stretch" gap={0}>
            {trendingTags?.map((tag, index, arr) => (
              <Link href={`/social/explore?tag=${tag._id}`} key={tag._id}>
                <HStack
                  justify="space-between"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  py={3}
                  borderBottom={index !== arr.length - 1 ? "1px solid" : "none"}
                  borderColor="gray.100"
                  transition="all 0.2s"
                >
                  <Text fontWeight="semibold" fontSize="md">#{tag._id}</Text>
                  <Text color="gray.500" fontSize="sm">{tag.count} posts</Text>
                </HStack>
              </Link>
            ))}
            {(!trendingTags || trendingTags.length === 0) && (
              <Text color="gray.500" fontSize="sm">No trending tags yet.</Text>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  );
}