"use client";
import { Box, VStack, List, Spinner, Center, Heading, Text, Image, Button } from "@chakra-ui/react";
import ItemBlog from "@/app/social/component/ItemBlog";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { IArticlePopular } from "@/types/response/article";
import article from "@/apis/article";
import { useSearchParams } from "next/navigation";
import { Suspense, Fragment } from "react";
import { useSession } from "next-auth/react";
import { userApi } from "@/apis/user";
import { useTranslation } from "@/libs/i18n/client";

const ExploreContent = () => {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { t } = useTranslation(searchParams.get('lng') || 'en');
    const tag = searchParams.get('tag');

    const { data: followingIds, refetch: refetchFollowing } = useQuery({
        queryKey: ['following-ids', session?.user?.uuid],
        queryFn: async (): Promise<string[]> => {
            if (!session?.user?.accessToken) return [];
            const ids = await userApi.getFollowing(session.user.accessToken);
            return (ids as (string | number)[]).map(id => id.toString());
        },
        enabled: !!session?.user?.accessToken
    });

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<IArticlePopular[]>({
        queryKey: ['explore-articles-infinite', tag, session?.user?.uuid],
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
        queryFn: async ({ pageParam = 1 }): Promise<IArticlePopular[]> => {
            if (tag) {
                return await article.getByTag(tag, 10, pageParam as number);
            }
            return await article.popular(10, pageParam as number);
        },
    });

    return (
        <VStack align="stretch" gap={6}>
            {/* Hero Section */}
            <Box
                position="relative"
                h="240px"
                borderRadius="2xl"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="2xl"
            >
                <Image
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
                    alt="Explore Hero"
                    position="absolute"
                    inset={0}
                    w="full"
                    h="full"
                    objectFit="cover"
                />
                <Box position="absolute" inset={0} bg="blackAlpha.500" />
                <VStack
                    position="relative"
                    zIndex={1}
                    bg="whiteAlpha.100"
                    backdropFilter="blur(12px)"
                    p={{ base: 6, md: 10 }}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    textAlign="center"
                    gap={2}
                    maxW="90%"
                >
                    <Heading size={{ base: "xl", md: "2xl" }} color="white" fontWeight="900" letterSpacing="tighter" textTransform="uppercase">
                        {tag ? `#${tag}` : t('explore_title', { defaultValue: 'Explore New Horizons' })}
                    </Heading>
                    <Text color="whiteAlpha.900" fontWeight="600" fontSize={{ base: "sm", md: "lg" }}>
                        {tag ? t('explore_tag_desc', { defaultValue: 'Discover stories tagged with' }) : t('explore_desc', { defaultValue: 'Discover interesting stories and adventures from around the world' })}
                    </Text>
                </VStack>
            </Box>

            {isLoading ? (
                <Center py={20}>
                    <VStack gap={4}>
                        <Spinner size="xl" color="main" />
                        <Text fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="widest" fontSize="xs">
                            Discovering Stories...
                        </Text>
                    </VStack>
                </Center>
            ) : (
                <VStack w="full" gap={6}>
                    <List.Root w="full" variant="marker" gap={6} display="flex" flexDirection="column" alignItems={'center'}>
                        {
                            data?.pages.map((page, i) => (
                                <Fragment key={i}>
                                    {page.map((item: IArticlePopular) => (
                                        <List.Item key={item.id}
                                            w="full"
                                            display={'flex'}
                                            alignItems={'center'}
                                            justifyContent={'center'}
                                        >
                                            <ItemBlog
                                                {...item}
                                                lng={searchParams.get('lng') || 'en'}
                                                followingIds={followingIds}
                                                onFollowChange={() => refetchFollowing()}
                                            />
                                        </List.Item>
                                    ))}
                                </Fragment>
                            ))
                        }
                    </List.Root>

                    {/* Load More Button */}
                    {hasNextPage && (
                        <Button
                            onClick={() => fetchNextPage()}
                            loading={isFetchingNextPage}
                            variant="outline"
                            colorScheme="blue"
                            borderRadius="full"
                            px={8}
                            size="lg"
                            fontWeight="bold"
                            _hover={{ bg: "main", color: "white" }}
                        >
                            {isFetchingNextPage ? t('loading') : t('load_more', { defaultValue: 'Load More Stories' })}
                        </Button>
                    )}

                    {(!data || data.pages[0].length === 0) && (
                        <Box p={20} textAlign="center" bg="white" borderRadius="2xl" shadow="sm" w="full" border="1px solid" borderColor="gray.50">
                            <VStack gap={4}>
                                <Text color="gray.400" fontWeight="800" fontSize="lg">
                                    No stories found yet.
                                </Text>
                                <Button variant="ghost" color="main" onClick={() => window.location.href = '/social/explore'}>
                                    Clear filters
                                </Button>
                            </VStack>
                        </Box>
                    )}
                </VStack>
            )}
        </VStack>
    );
}

export const dynamic = "force-dynamic";

const ExplorePage = () => {
    return (
        <Suspense fallback={<Center py={10}><Spinner color="main" /></Center>}>
            <ExploreContent />
        </Suspense>
    );
}

export default ExplorePage;
