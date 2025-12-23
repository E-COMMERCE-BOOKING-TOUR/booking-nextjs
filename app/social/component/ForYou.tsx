"use client";
import { Box, VStack, HStack, Button, Icon, Textarea, Image, Input, List, Spinner, Center, Avatar } from "@chakra-ui/react";
import { useState } from "react";
import { FiEdit, FiX, FiImage, FiSmile, FiCalendar, FiMapPin } from "react-icons/fi";
import ItemBlog from "./ItemBlog";
import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { IArticlePopular } from "@/types/response/article";
import article from "@/apis/article";
import { toaster } from "@/components/chakra/toaster";
import { useSession } from "next-auth/react";
import bookingApi from "@/apis/booking";
import { Select, createListCollection } from "@chakra-ui/react";

const ForYou = () => {
    const { data: session } = useSession();
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [selectedTour, setSelectedTour] = useState<string[]>([]);

    const { data: bookedTours } = useQuery({
        queryKey: ['booked-tours', session?.user?.uuid],
        queryFn: async () => {
            if (!session?.user?.accessToken) return [];
            return await bookingApi.getHistory(session.user.accessToken);
        },
        enabled: !!session?.user?.accessToken
    });

    const tourList = createListCollection({
        items: bookedTours?.map(t => ({ label: t.title, value: t.id.toString() })) || [],
    });

    const { data: pages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<IArticlePopular[]>({
        queryKey: ['popular-articles-infinite'],
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
        queryFn: async (): Promise<IArticlePopular[]> => {
            const res = await article.popular(5);
            return res;
        },
    });

    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationFn: (vars: { data: Parameters<typeof article.create>[0]; user_uuid: string }) => article.create(vars.data, vars.user_uuid),
        onSuccess: () => {
            toaster.create({
                title: "Post created successfully",
                type: "success",
            });
            setContent("");
            setImages([]);
            queryClient.invalidateQueries({ queryKey: ['popular-articles'] });
            queryClient.invalidateQueries({ queryKey: ['popular-articles-infinite'] });
        },
        onError: (error: Error | any) => {
            console.error("Post create error:", error);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const msg = error?.response?.data?.message || error?.message || "Failed to create post";
            toaster.create({
                title: typeof msg === 'string' ? msg : JSON.stringify(msg),
                type: "error",
            });
        }
    });

    const handlePost = () => {
        if (!content.trim()) return;
        if (!session?.user?.uuid) {
            toaster.create({
                title: "Please login to post (Session invalid)",
                type: "error",
            });
            return;
        }

        const title = content.split('\n')[0].substring(0, 50) || "New Post";
        const hashtags = content.match(/#\p{L}[\p{L}\d_]*/gu) || [];
        const tags = hashtags.map(tag => tag.slice(1)); // Remove the #
        createMutation.mutate({
            data: {
                title,
                content,
                images: images.map(url => ({ image_url: url })),
                tags,
                tour_id: selectedTour[0] ? parseInt(selectedTour[0]) : undefined
            },
            user_uuid: session.user.uuid
        });
    };

    const onSelectFiles = (files: FileList | null) => {
        const arr = Array.from(files || []);
        const urls = arr.map((f) => URL.createObjectURL(f));
        setImages(urls);
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <VStack align="stretch" gap={3}>
            {session?.user ? (
                <Box bg="white" color="black" p={4} borderRadius="lg" boxShadow="lg">
                    <HStack align="flex-start" gap={3}>
                        <Avatar.Root size="lg">
                            <Avatar.Image src={"https://picsum.photos/100/100"} />
                            <Avatar.Fallback name={session.user.name || "User"} />
                        </Avatar.Root>
                        <VStack align="stretch" gap={3} flex={1}>
                            <Textarea
                                placeholder="What's happening?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                variant="outline"
                                fontSize="lg"
                                resize="none"
                            />

                            {images.length > 0 && (
                                <Box position="relative" borderRadius="lg" overflow="hidden" bg="blackAlpha.700">
                                    <HStack position="absolute" top={2} left={2} gap={2}>
                                        <Button size="sm" variant="outline" colorScheme="gray"><Icon as={FiEdit} />Edit</Button>
                                    </HStack>
                                    <Button size="sm" variant="ghost" position="absolute" top={2} right={2} onClick={() => removeImage(0)}>
                                        <Icon as={FiX} color="blackAlpha.700" />
                                    </Button>
                                    <Image src={images[0]} alt="preview" w="full" h="auto" objectFit="cover" />
                                </Box>
                            )}
                            <HStack justify="space-between" align="center">
                                <HStack gap={3}>
                                    <Button as="label" variant="ghost" colorScheme="whiteAlpha" px={2}>
                                        <Icon as={FiImage} color="blackAlpha.700" />
                                        <Input type="file" accept="image/*" multiple display="none" onChange={(e) => onSelectFiles(e.target.files)} />
                                    </Button>
                                    <Select.Root collection={tourList} value={selectedTour} onValueChange={(e) => setSelectedTour(e.value)} size="sm" width="200px">
                                        <Select.Trigger>
                                            <Select.ValueText placeholder="Select a tour" />
                                        </Select.Trigger>
                                        <Select.Content>
                                            {tourList.items.map((tour) => (
                                                <Select.Item item={tour} key={tour.value}>
                                                    {tour.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Root>
                                </HStack>

                                <Button
                                    colorScheme="blue"
                                    borderRadius="full"
                                    onClick={handlePost}
                                    loading={createMutation.isPending}
                                    disabled={!content.trim()}
                                >
                                    Post
                                </Button>
                            </HStack>
                        </VStack>
                    </HStack>
                </Box>)
                : null
            }

            {isLoading ? (
                <Center py={10}>
                    <Spinner size="xl" color="white" />
                </Center>
            ) : (
                <List.Root w="full" variant="marker" gap={3} display="flex" flexDirection="column" alignItems={'center'}>
                    {
                        pages?.pages?.flat()?.map((item: IArticlePopular, index: number) => (
                            <List.Item key={index.toString()}
                                w="full"
                                display={'flex'}
                                alignItems={'center'}
                                justifyContent={'center'}
                            >
                                <ItemBlog
                                    id={item.id}
                                    title={item.title}
                                    content={item.content}
                                    images={item.images}
                                    tags={item.tags}
                                    created_at={item.created_at}
                                    count_views={item.count_views}
                                    count_likes={item.count_likes}
                                    count_comments={item.count_comments}
                                    user={item.user}
                                />
                            </List.Item>
                        ))
                    }
                    <Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage} variant="outline">
                        {isFetchingNextPage ? 'Loading...' : hasNextPage ? 'Load more' : 'No more'}
                    </Button>
                </List.Root>
            )}
        </VStack>
    );
}

export default ForYou;
