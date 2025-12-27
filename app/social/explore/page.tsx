"use client";
import { Box, VStack, List, Spinner, Center, Heading, Text, HStack } from "@chakra-ui/react";
import ItemBlog from "@/app/social/component/ItemBlog";
import { useQuery } from "@tanstack/react-query";
import type { IArticlePopular } from "@/types/response/article";
import article from "@/apis/article";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ExploreContent = () => {
    const searchParams = useSearchParams();
    const tag = searchParams.get('tag');

    const { data: articles, isLoading } = useQuery<IArticlePopular[]>({
        queryKey: ['explore-articles', tag],
        queryFn: async (): Promise<IArticlePopular[]> => {
            if (tag) {
                return await article.getByTag(tag);
            }
            return await article.getList();
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    // Client-side filtering is no longer needed since we filter on server
    const displayArticles = articles || [];

    return (
        <VStack align="stretch" gap={3}>
            {tag ? (
                <Box bg="white" color="black" p={4} borderRadius="lg" boxShadow="lg">
                    <Heading size="lg">#{tag}</Heading>
                    <Text color="gray.500">Explore posts with this tag</Text>
                </Box>
            ) : (
                <Box bg="white" color="black" p={4} borderRadius="lg" boxShadow="lg">
                    <Heading size="lg">Explore</Heading>
                    <Text color="gray.500">Discover interesting stories</Text>
                </Box>
            )}

            {isLoading ? (
                <Center py={10}>
                    <Spinner size="xl" color="white" />
                </Center>
            ) : (
                <List.Root w="full" variant="marker" gap={3} display="flex" flexDirection="column" alignItems={'center'}>
                    {
                        displayArticles.length > 0 ? (
                            displayArticles.map((item: IArticlePopular, index: number) => (
                                <List.Item key={index.toString()}
                                    w="full"
                                    display={'flex'}
                                    alignItems={'center'}
                                    justifyContent={'center'}
                                >
                                    <ItemBlog
                                        {...item}
                                    />
                                </List.Item>
                            ))
                        ) : (
                            <Box p={8} textAlign="center">
                                <Text color="whiteAlpha.500">No articles found.</Text>
                            </Box>
                        )
                    }
                </List.Root>
            )}
        </VStack>
    );
}

const ExplorePage = () => {
    return (
        <Suspense fallback={<Center py={10}><Spinner color="white" /></Center>}>
            <ExploreContent />
        </Suspense>
    );
}

export default ExplorePage;
