"use client";
import { Box, VStack, HStack, Button, Icon, Textarea, Image, Input, List, Spinner, Center, Avatar, Text as ChakraText } from "@chakra-ui/react";
import { useState } from "react";
import { FiEdit, FiX, FiImage, FiSmile, FiCalendar, FiMapPin } from "react-icons/fi";
import ItemBlog from "./ItemBlog";
import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { IArticlePopular } from "@/types/response/article";
import article from "@/apis/article";
import { toaster } from "@/components/chakra/toaster";
import { useSession } from "next-auth/react";
import bookingApi from "@/apis/booking";
import { Menu, Portal, createListCollection } from "@chakra-ui/react";
import { useTranslation } from "@/libs/i18n/client";
import { userApi } from "@/apis/user";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const postSchema = z.object({
    content: z.string().min(3, "Content must be at least 3 characters long"),
    tour_id: z.array(z.string()).min(1, "Please select a tour you've traveled to share your story"),
});

type PostFormValues = z.infer<typeof postSchema>;

const CreatePost = ({ lng, session, bookedTours, onSuccess, onPostCreated }: { lng: string, session: any, bookedTours: any[] | undefined, onSuccess: () => void, onPostCreated?: (post: IArticlePopular) => void }) => {
    const { t } = useTranslation(lng);
    const [images, setImages] = useState<string[]>([]);
    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            content: "",
            tour_id: [],
        }
    });

    const content = watch("content");

    const tourList = createListCollection({
        items: Array.from(new Map(
            bookedTours?.map((t: any) => [t.tour_id, {
                label: t.tour_title,
                value: t.tour_id?.toString() || ""
            }])
        ).values()) || [],
    });

    const createMutation = useMutation({
        mutationFn: (vars: { data: Parameters<typeof article.create>[0], token?: string }) => article.create(vars.data, vars.token),
        onSuccess: (response: any) => {
            toaster.create({
                title: "Post created successfully",
                type: "success",
            });
            reset();
            setImages([]);
            onSuccess();
            // Handle both direct response and wrapped response.data
            const postData = response?.data || response;
            if (postData && onPostCreated) {
                // Add optimistic user data for immediate display
                const enrichedPost = {
                    ...postData,
                    user: postData.user || {
                        name: session?.user?.name,
                        avatar: null,
                    },
                    user_id: postData.user_id || (session?.user as any)?.id,
                    created_at: postData.created_at || new Date().toISOString(),
                    count_likes: postData.count_likes || 0,
                    count_comments: postData.count_comments || 0,
                    count_views: postData.count_views || 0,
                };
                onPostCreated(enrichedPost);
            }
        },
        onError: (error: Error | any) => {
            console.error("Post create error:", error);
            const msg = error?.response?.data?.message || error?.message || "Failed to create post";
            toaster.create({
                title: typeof msg === 'string' ? msg : JSON.stringify(msg),
                type: "error",
            });
        }
    });

    const handlePost = (values: PostFormValues) => {
        if (!session?.user?.uuid) {
            toaster.create({
                title: "Please login to post (Session invalid)",
                type: "error",
            });
            return;
        }

        const title = values.content.split('\n')[0].substring(0, 50) || "New Post";
        const hashtags = values.content.match(/#\p{L}[\p{L}\d_]*/gu) || [];
        const tags = hashtags.map(tag => tag.slice(1));
        createMutation.mutate({
            data: {
                title,
                content: values.content,
                images: images.map(url => ({ image_url: url })),
                tags,
                tour_id: parseInt(values.tour_id[0])
            },
            token: session.user.accessToken
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
        <Box
            bg="white/60"
            backdropFilter="blur(20px)"
            color="black"
            p={6}
            borderRadius="xl"
            shadow="xl"
            border="1px solid"
            borderColor="whiteAlpha.400"
            transition="all 0.3s"
            _hover={{ shadow: "2xl", transform: "translateY(-2px)" }}
        >
            <HStack align="flex-start" gap={4}>
                <Avatar.Root size="lg" border="2px solid" borderColor="main" p="2px" boxShadow="0 0 15px rgba(0, 59, 149, 0.2)">
                    <Avatar.Image src={"https://picsum.photos/100/100"} />
                </Avatar.Root>
                <VStack align="stretch" gap={4} flex={1}>
                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                placeholder={t('whats_happening', { defaultValue: "What's happening?" })}
                                variant="flushed"
                                fontSize="xl"
                                fontWeight="medium"
                                resize="none"
                                p={0}
                                borderBottom="none"
                                _focus={{ outline: "none", borderBottom: "none" }}
                            />
                        )}
                    />
                    {errors.content && (
                        <ChakraText color="red.500" fontSize="xs">
                            {errors.content.message}
                        </ChakraText>
                    )}

                    {images.length > 0 && (
                        <Box position="relative" borderRadius="2xl" overflow="hidden" boxShadow="lg">
                            <HStack position="absolute" top={3} left={3} gap={2} zIndex={2}>
                                <Button size="sm" bg="white/80" backdropFilter="blur(8px)" color="black" _hover={{ bg: "white" }}>
                                    <Icon as={FiEdit} /> {t('edit', { defaultValue: 'Edit' })}
                                </Button>
                            </HStack>
                            <Button
                                size="sm"
                                variant="ghost"
                                position="absolute"
                                top={3}
                                right={3}
                                zIndex={2}
                                bg="black/40"
                                color="white"
                                borderRadius="full"
                                onClick={() => removeImage(0)}
                                _hover={{ bg: "black/60" }}
                            >
                                <Icon as={FiX} />
                            </Button>
                            <Image src={images[0]} alt="preview" w="full" h="auto" maxH="400px" objectFit="cover" />
                        </Box>
                    )}

                    <HStack justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="blackAlpha.100">
                        <HStack gap={1}>
                            <Button as="label" variant="ghost" color="main" _hover={{ bg: "blue.50" }} px={3} borderRadius="full" cursor="pointer">
                                <Icon as={FiImage} boxSize={5} />
                                <Box as="span" fontSize="sm" ml={2} fontWeight="600" display={{ base: "none", sm: "block" }}>{t('photo', { defaultValue: 'Photo' })}</Box>
                                <Input type="file" accept="image/*" multiple display="none" onChange={(e) => onSelectFiles(e.target.files)} />
                            </Button>
                            <Controller
                                name="tour_id"
                                control={control}
                                render={({ field }) => {
                                    const selectedTour = tourList.items.find((item: any) => item.value === field.value[0]);
                                    return (
                                        <Menu.Root
                                            onSelect={(details) => field.onChange([details.value])}
                                            positioning={{ placement: "bottom-start" }}
                                        >
                                            <Menu.Trigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    bg="transparent"
                                                    border="none"
                                                    _hover={{ bg: "blue.50" }}
                                                    px={3}
                                                    borderRadius="full"
                                                    height="32px"
                                                >
                                                    <HStack gap={2}>
                                                        <Icon as={FiMapPin} color="main" boxSize={4} />
                                                        <ChakraText
                                                            fontSize="sm"
                                                            color={selectedTour ? "black" : "gray.500"}
                                                            maxW={{ base: "100px", md: "180px" }}
                                                            truncate
                                                        >
                                                            {selectedTour ? selectedTour.label : t('select_a_tour', { defaultValue: "Select a tour" })}
                                                        </ChakraText>
                                                    </HStack>
                                                </Button>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content bg="white" borderRadius="xl" shadow="2xl" borderColor="gray.100" minW="220px" zIndex="popover">
                                                        {tourList.items.map((tour: any) => (
                                                            <Menu.Item key={tour.value} value={tour.value} _hover={{ bg: "blue.50" }}>
                                                                {tour.label}
                                                            </Menu.Item>
                                                        ))}
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    );
                                }}
                            />
                        </HStack>

                        <Button
                            bg="main"
                            color="white"
                            px={8}
                            h={10}
                            borderRadius="full"
                            fontWeight="bold"
                            _hover={{ bg: "blue.700", transform: "scale(1.05)", shadow: "lg" }}
                            transition="all 0.2s"
                            onClick={handleSubmit(handlePost)}
                            loading={createMutation.isPending || isSubmitting}
                            disabled={!content?.trim()}
                        >
                            {t('post_button', { defaultValue: 'Post' })}
                        </Button>
                    </HStack>
                    {errors.tour_id && (
                        <ChakraText color="red.500" fontSize="xs" textAlign="right">
                            {errors.tour_id.message}
                        </ChakraText>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
};

const ForYou = ({ lng, mode = 'foryou' }: { lng: string, mode?: 'foryou' | 'following' }) => {
    const { t } = useTranslation(lng);
    const { data: session } = useSession();
    const [newPosts, setNewPosts] = useState<IArticlePopular[]>([]);

    const { data: followingIds, refetch: refetchFollowing } = useQuery({
        queryKey: ['following-ids', session?.user?.uuid],
        queryFn: async () => {
            if (!session?.user?.accessToken) return [];
            return await userApi.getFollowing(session.user.accessToken);
        },
        enabled: !!session?.user?.accessToken
    });

    const { data: bookedTours } = useQuery({
        queryKey: ['booking-tours', session?.user?.uuid],
        queryFn: async () => {
            if (!session?.user?.accessToken) return [];
            const res = await bookingApi.getHistory(session.user.accessToken);
            if (res.ok && res.data && Array.isArray(res.data.data)) {
                return res.data.data;
            }
            return [];
        },
        enabled: !!session?.user?.accessToken
    });

    const { data: pages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<IArticlePopular[]>({
        queryKey: ['articles-infinite', mode, session?.user?.uuid],
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
        queryFn: async ({ pageParam = 1 }): Promise<IArticlePopular[]> => {
            if (mode === 'following') {
                if (!session?.user?.accessToken) return [];
                return await article.following(session.user.accessToken, 5, pageParam as number);
            }
            const res = await article.popular(5, pageParam as number);
            return res;
        },
    });

    const queryClient = useQueryClient();

    const handleNewPost = (post: IArticlePopular) => {
        setNewPosts(prev => [post, ...prev]);
    };

    const handleFollowChange = () => {
        refetchFollowing();
    };

    return (
        <VStack align="stretch" gap={3} >
            <CreatePost
                lng={lng}
                session={session}
                bookedTours={bookedTours}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
                }}
                onPostCreated={handleNewPost}
            />
            {/* ) */}
            {/* : null
            } */}

            {isLoading ? (
                <Center py={10}>
                    <Spinner size="xl" color="white" />
                </Center>
            ) : (
                <List.Root w="full" variant="marker" gap={3} display="flex" flexDirection="column" alignItems={'center'}>
                    {(() => {
                        const fetchedPosts = pages?.pages?.flat() || [];
                        const filteredFetchedPosts = fetchedPosts.filter(
                            (fp) => !newPosts.some((np) => np.id === fp.id)
                        );
                        return [...newPosts, ...filteredFetchedPosts].map((item: IArticlePopular, index: number) => (
                            <List.Item key={item.id?.toString() || index.toString()}
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
                                    user_id={item.user_id}
                                    comments={item.comments}
                                    lng={lng}
                                    users_like={item.users_like}
                                    users_bookmark={item.users_bookmark}
                                    followingIds={followingIds}
                                    onFollowChange={() => refetchFollowing()}
                                />
                            </List.Item>
                        ));
                    })()}
                    <Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage} variant="outline">
                        {isFetchingNextPage ? 'Loading...' : hasNextPage ? 'Load more' : 'No more'}
                    </Button>
                </List.Root>
            )}
        </VStack>
    );
}

export default ForYou;
