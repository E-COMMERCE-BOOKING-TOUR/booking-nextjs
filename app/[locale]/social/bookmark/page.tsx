"use client";
import { Box, VStack, Spinner, Center, Heading, Text, Image, Button, HStack, Card, Avatar, Icon } from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { IArticlePopular } from "@/types/response/article";
import article from "@/apis/article";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { FiBookmark, FiHeart, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "@/components/chakra/toaster";
import Link from "next/link";

const BookmarkContent = () => {
    const { data: session } = useSession();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery<IArticlePopular[]>({
        queryKey: ['bookmarked-articles-infinite', session?.user?.uuid],
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
        enabled: !!session?.user?.accessToken,
        queryFn: async ({ pageParam = 1 }): Promise<IArticlePopular[]> => {
            return await article.getBookmarked(session?.user?.accessToken, 10, pageParam as number);
        },
    });

    const unbookmarkMutation = useMutation({
        mutationFn: (articleId: string) => article.unbookmark(articleId, session?.user?.accessToken),
        onSuccess: () => {
            refetch();
            toaster.create({ title: "Removed from bookmarks", type: "success" });
        },
        onError: () => toaster.create({ title: "Failed to remove", type: "error" })
    });

    if (!session?.user) {
        return (
            <Center py={20}>
                <VStack gap={4}>
                    <Icon boxSize={16} color="gray.300">
                        <FiBookmark />
                    </Icon>
                    <Heading size="lg" color="gray.500">Sign in to see your bookmarks</Heading>
                    <Text color="gray.400">Save articles to read later</Text>
                </VStack>
            </Center>
        );
    }

    const allArticles = data?.pages?.flat() || [];

    return (
        <VStack align="stretch" gap={6}>
            {/* Hero Section */}
            <Box
                position="relative"
                h="200px"
                borderRadius="2xl"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="xl"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            >
                <VStack
                    position="relative"
                    zIndex={1}
                    textAlign="center"
                    gap={2}
                >
                    <HStack gap={3}>
                        <Icon boxSize={8} color="white">
                            <FiBookmark />
                        </Icon>
                        <Heading size={{ base: "xl", md: "2xl" }} color="white" fontWeight="900">
                            Your Bookmarks
                        </Heading>
                    </HStack>
                    <Text color="whiteAlpha.900" fontWeight="500">
                        {allArticles.length} saved {allArticles.length === 1 ? 'article' : 'articles'}
                    </Text>
                </VStack>
            </Box>

            {isLoading ? (
                <Center py={20}>
                    <VStack gap={4}>
                        <Spinner size="xl" color="main" />
                        <Text fontWeight="600" color="gray.400">Loading...</Text>
                    </VStack>
                </Center>
            ) : allArticles.length === 0 ? (
                <Center py={20}>
                    <VStack gap={4}>
                        <Icon boxSize={16} color="gray.200">
                            <FiBookmark />
                        </Icon>
                        <Text fontWeight="700" color="gray.400" fontSize="lg">
                            No bookmarks yet
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                            Bookmark articles to see them here
                        </Text>
                    </VStack>
                </Center>
            ) : (
                <VStack gap={4} align="stretch">
                    {allArticles.map((item: IArticlePopular) => (
                        <Card.Root key={item.id?.toString()} p={4} bg="white" shadow="sm" borderRadius="xl" _hover={{ shadow: "md" }} transition="all 0.2s">
                            <HStack gap={4} align="start">
                                {/* Thumbnail */}
                                {item.images?.[0]?.image_url && (
                                    <Image
                                        src={item.images[0].image_url}
                                        alt={item.title}
                                        w="120px"
                                        h="80px"
                                        borderRadius="lg"
                                        objectFit="cover"
                                        flexShrink={0}
                                    />
                                )}

                                {/* Content */}
                                <VStack align="start" flex={1} gap={2}>
                                    <Link href={`/social/article/${item.id}`} style={{ width: '100%' }}>
                                        <Text fontWeight="700" fontSize="md" lineClamp={2} _hover={{ color: "main" }}>
                                            {item.title}
                                        </Text>
                                    </Link>

                                    <HStack gap={4} color="gray.500" fontSize="sm">
                                        <HStack gap={1}>
                                            <Avatar.Root size="xs">
                                                {item.user?.avatar && <Avatar.Image src={item.user.avatar} />}
                                                <Avatar.Fallback>{item.user?.name?.[0]}</Avatar.Fallback>
                                            </Avatar.Root>
                                            <Text>{item.user?.name || 'Unknown'}</Text>
                                        </HStack>
                                        <HStack gap={1}>
                                            <FiHeart size={14} />
                                            <Text>{item.count_likes || 0}</Text>
                                        </HStack>
                                        <HStack gap={1}>
                                            <FiMessageCircle size={14} />
                                            <Text>{item.count_comments || 0}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>

                                {/* Remove button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    color="gray.400"
                                    _hover={{ color: "red.500", bg: "red.50" }}
                                    onClick={() => unbookmarkMutation.mutate(item.id?.toString() || '')}
                                    loading={unbookmarkMutation.isPending}
                                >
                                    <FiTrash2 />
                                </Button>
                            </HStack>
                        </Card.Root>
                    ))}

                    {hasNextPage && (
                        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="outline" w="full">
                            {isFetchingNextPage ? 'Loading...' : 'Load more'}
                        </Button>
                    )}
                </VStack>
            )}
        </VStack>
    );
};

export default function BookmarkPage() {
    return (
        <Suspense fallback={
            <Center py={20}>
                <Spinner size="xl" color="main" />
            </Center>
        }>
            <BookmarkContent />
        </Suspense>
    );
}
