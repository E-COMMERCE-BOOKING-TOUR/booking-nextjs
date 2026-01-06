"use client";
import { Box, HStack, VStack, Text, Image, Button, Icon, Avatar, Grid, useDisclosure, Menu, Portal } from "@chakra-ui/react";
import { Link } from "@/i18n/navigation";
import { FiMessageCircle, FiEye, FiThumbsUp, FiMapPin, FiCalendar, FiCloud, FiBookmark, FiFlag } from "react-icons/fi";
import { HiDotsHorizontal } from "react-icons/hi";
import type { IArticlePopular } from "@/types/response/article";
import { dateFormat } from "@/libs/function";
import { PopUpComment, CommentParams } from "./comments";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/apis/user";
import { toaster } from "@/components/chakra/toaster";
import article from "@/apis/article";
import { useState } from "react";

type ItemBlogProps = IArticlePopular & {
    href?: string;
    authorName?: string;
    authorAvatar?: string;
    tagLabel?: string;
    articleId?: string;
    comments?: unknown[];
    followingIds?: string[];
    onFollowChange?: () => void;
}

function TagList({ tags }: { tags: string[] }) {
    if (!tags || tags.length === 0) return null;
    return (
        <HStack gap={2} flexWrap="wrap" mt={2}>
            {tags.map((tag, i) => (
                <Link key={i} href={`/social/explore?tag=${tag}`}>
                    <Text
                        color="main"
                        fontWeight="600"
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                    >
                        #{tag}
                    </Text>
                </Link>
            ))}
        </HStack>
    );
}

function Stat({ icon, value }: { icon: React.ComponentType; value?: number }) {
    return (
        <HStack gap={1} color="whiteAlpha.800" fontSize="xs">
            <Icon as={icon} />
            <Text>{typeof value === "number" ? value : 0}</Text>
        </HStack>
    );
}

const ImagesGrid = ({ data, title }: { data: string[]; title: string }) => {
    const n = data.length;
    if (n === 1) {
        return (
            <Box borderRadius="md" w="full" display="flex" justifyContent="center" alignItems="center" overflow="hidden">
                <Image src={data[0]} alt={title} w="full" h="300px" objectFit="cover" />
            </Box>
        );
    }
    if (n === 2) {
        return (
            <Grid templateColumns="1fr 1fr" gap={1} borderRadius="md" overflow="hidden">
                <Box>
                    <Image src={data[0]} alt={title} w="full" h="300px" objectFit="cover" />
                </Box>
                <Box>
                    <Image src={data[1]} alt={title} w="full" h="300px" objectFit="cover" />
                </Box>
            </Grid>
        );
    }
    if (n === 3) {
        return (
            <Grid templateColumns="2fr 1fr" gap={2} borderRadius="md" overflow="hidden" mb={3}>
                <Box>
                    <Image src={data[0]} alt={title} w="full" h="400px" objectFit="cover" />
                </Box>
                <VStack gap={2}>
                    <Box w="full">
                        <Image src={data[1]} alt={title} w="full" h="198px" objectFit="cover" />
                    </Box>
                    <Box w="full">
                        <Image src={data[2]} alt={title} w="full" h="198px" objectFit="cover" />
                    </Box>
                </VStack>
            </Grid>
        );
    }
    const shown = data.slice(0, 4);
    const extra = data.length - shown.length;
    return (
        <Grid templateColumns="1fr 1fr" gap={1} borderRadius="md" overflow="hidden" mb={3}>
            {shown.map((src, i) => (
                <Box key={i} position="relative">
                    <Image src={src} alt={title} w="full" h="200px" objectFit="cover" />
                    {extra > 0 && i === 3 ? (
                        <Box position="absolute" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
                            <Text fontSize="2xl" fontWeight="bold" color="white">+{extra}</Text>
                        </Box>
                    ) : null}
                </Box>
            ))}
        </Grid>
    );
};

export default function ItemBlog(props: ItemBlogProps) {
    const { images, title, tags, created_at, count_likes, count_comments, comments, user, user_id, tour, followingIds, onFollowChange } = props;
    const t = useTranslations('common');
    const { data: session } = useSession();
    const { open, onOpen, onClose } = useDisclosure();
    const imageUrls = images?.map(img => img.image_url) || [];

    const isFollowing = followingIds?.includes(user_id);
    const isMe = session?.user && ((session.user as { uuid?: string }).uuid === user_id || (session.user as { id: number }).id.toString() === user_id);
    // Note: uuid or id comparison depends on how user_id is stored. In backend-booking-tour it's 'id'.

    const followMutation = useMutation({
        mutationFn: () => userApi.follow(session?.user?.accessToken || '', user_id as unknown as number),
        onSuccess: () => {
            toaster.create({ title: "Followed successfully", type: "success" });
            onFollowChange?.();
        },
        onError: () => {
            toaster.create({ title: "Failed to follow", type: "error" });
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: () => userApi.unfollow(session?.user?.accessToken || '', user_id as unknown as number),
        onSuccess: () => {
            toaster.create({ title: "Unfollowed successfully", type: "success" });
            onFollowChange?.();
        },
        onError: () => {
            toaster.create({ title: "Failed to unfollow", type: "error" });
        }
    });

    // Like state & mutations
    const userUuid = (session?.user as { uuid?: string })?.uuid;
    const [localLiked, setLocalLiked] = useState<boolean | null>(null);
    const isLiked = localLiked !== null ? localLiked : (userUuid && props.users_like?.includes(userUuid) || false);
    const [likeCount, setLikeCount] = useState(count_likes || 0);

    const likeMutation = useMutation({
        mutationFn: () => article.like(props.id?.toString() || '', session?.user?.accessToken),
        onSuccess: () => {
            setLocalLiked(true);
            setLikeCount(prev => prev + 1);
        },
        onError: () => {
            toaster.create({ title: "Failed to like", type: "error" });
        }
    });

    const unlikeMutation = useMutation({
        mutationFn: () => article.unlike(props.id?.toString() || '', session?.user?.accessToken),
        onSuccess: () => {
            setLocalLiked(false);
            setLikeCount(prev => Math.max(0, prev - 1));
        },
        onError: () => {
            toaster.create({ title: "Failed to unlike", type: "error" });
        }
    });

    const handleLike = () => {
        if (!session?.user?.accessToken) {
            toaster.create({ title: "Please login to like", type: "warning" });
            return;
        }
        if (isLiked) {
            unlikeMutation.mutate();
        } else {
            likeMutation.mutate();
        }
    };

    const handleReport = () => {
        if (!session?.user?.accessToken) {
            toaster.create({ title: "Please login to report", type: "warning" });
            return;
        }
        article.report(props.id?.toString() || '', 'Inappropriate content', session.user.accessToken)
            .then(() => toaster.create({ title: "Report submitted", type: "success" }))
            .catch(() => toaster.create({ title: "Failed to report", type: "error" }));
    };

    // Bookmark state & mutations
    const [localBookmarked, setLocalBookmarked] = useState<boolean | null>(null);
    const isBookmarked = localBookmarked !== null ? localBookmarked : (userUuid && props.users_bookmark?.includes(userUuid) || false);

    const bookmarkMutation = useMutation({
        mutationFn: () => article.bookmark(props.id?.toString() || '', session?.user?.accessToken),
        onSuccess: () => setLocalBookmarked(true),
        onError: () => toaster.create({ title: "Failed to bookmark", type: "error" })
    });

    const unbookmarkMutation = useMutation({
        mutationFn: () => article.unbookmark(props.id?.toString() || '', session?.user?.accessToken),
        onSuccess: () => setLocalBookmarked(false),
        onError: () => toaster.create({ title: "Failed to unbookmark", type: "error" })
    });

    const handleBookmark = () => {
        if (!session?.user?.accessToken) {
            toaster.create({ title: "Please login to bookmark", type: "warning" });
            return;
        }
        if (isBookmarked) {
            unbookmarkMutation.mutate();
        } else {
            bookmarkMutation.mutate();
        }
    };

    const content = (
        <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 4, md: 6 }}
            shadow="0 10px 40px -10px rgba(0,0,0,0.05)"
            border="1px solid"
            borderColor="gray.50"
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            _hover={{
                shadow: "0 20px 60px -15px rgba(0,0,0,0.1)",
                borderColor: "main/20"
            }}
            w="full"
        >
            <VStack align="stretch" gap={5}>
                {/* Author Info */}
                <HStack justify="space-between" align="center">
                    <HStack gap={3}>
                        <Avatar.Root
                            size="md"
                            ring="2px"
                            ringOffset="2px"
                            ringColor="blue.50"
                        >
                            <Avatar.Fallback name={user?.name || "U"} />
                            <Avatar.Image src={user?.avatar || "https://picsum.photos/50/50"} />
                        </Avatar.Root>
                        <VStack align="start" gap={0}>
                            <HStack gap={2}>
                                <Text fontWeight="800" fontSize="md" color="gray.900" letterSpacing="tight">
                                    {user?.name || "Traveler"}
                                </Text>
                                {!isMe && session?.user && (
                                    <Button
                                        size="2xs"
                                        variant={isFollowing ? "outline" : "solid"}
                                        colorScheme={isFollowing ? "gray" : "blue"}
                                        borderRadius="full"
                                        fontSize="10px"
                                        h="20px"
                                        px={3}
                                        bg={isFollowing ? "transparent" : "main"}
                                        color={isFollowing ? "gray.500" : "white"}
                                        _hover={{ opacity: 0.8 }}
                                        onClick={isFollowing ? () => unfollowMutation.mutate() : () => followMutation.mutate()}
                                        loading={followMutation.isPending || unfollowMutation.isPending}
                                    >
                                        {isFollowing ? t('following_btn', { defaultValue: 'Following' }) : t('follow_btn', { defaultValue: 'Follow' })}
                                    </Button>
                                )}
                            </HStack>
                            <Text fontSize="xs" color="gray.400" fontWeight="medium">
                                {dateFormat(created_at) || "Recently"}
                            </Text>
                        </VStack>
                    </HStack>
                    <Menu.Root positioning={{ placement: "bottom-end" }}>
                        <Menu.Trigger asChild>
                            <Button variant="ghost" size="sm" borderRadius="full" color="gray.400">
                                <Icon as={HiDotsHorizontal} />
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content bg="white" borderRadius="xl" shadow="lg" minW="150px" zIndex="popover">
                                    <Menu.Item value="report" _hover={{ bg: "red.50", color: "red.500" }} onClick={handleReport}>
                                        <HStack gap={2}>
                                            <Icon as={FiFlag} />
                                            <Text>Report</Text>
                                        </HStack>
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </HStack>

                {/* Title */}
                <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="black"
                    color="gray.900"
                    lineHeight="1.2"
                    letterSpacing="tight"
                >
                    {title}
                </Text>

                {/* Image Gallery */}
                {imageUrls.length > 0 && (
                    <Box
                        borderRadius="2xl"
                        overflow="hidden"
                        position="relative"
                        cursor="pointer"
                        onClick={onOpen}
                        role="group"
                    >
                        <ImagesGrid key={'das'} title={title} data={imageUrls} />
                        <Box
                            position="absolute"
                            inset={0}
                            bg="blackAlpha.200"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            transition="opacity 0.3s"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            pointerEvents="none"
                        >
                            <Icon as={FiEye} color="white" boxSize={10} filter="drop-shadow(0 0 10px rgba(0,0,0,0.3))" />
                        </Box>
                    </Box>
                )}

                {/* Tags */}
                {tags?.length > 0 && (
                    <HStack wrap="wrap" gap={2}>
                        {tags.map((tag, i) => (
                            <Text
                                key={i}
                                fontSize="sm"
                                fontWeight="800"
                                color="main"
                                bg="blue.50"
                                px={3}
                                py={1}
                                borderRadius="lg"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ bg: "main", color: "white", transform: "translateY(-1px)" }}
                            >
                                #{typeof tag === 'object' ? (tag as { _id?: string })._id || i : tag}
                            </Text>
                        ))}
                    </HStack>
                )}

                {/* Quick Info Grid */}
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                    {[
                        {
                            key: 'city',
                            label: t('location_label', { defaultValue: 'TOUR' }),
                            value: tour ? tour.title : 'Destinations',
                            icon: FiMapPin,
                            link: tour ? `/tour/${tour.slug}` : undefined
                        },
                        { key: 'date', label: t('date_label', { defaultValue: 'DATE' }), value: dateFormat(created_at), icon: FiCalendar },
                        { key: 'weather', label: t('weather_label', { defaultValue: 'WEATHER' }), value: 'Sunny', icon: FiCloud },
                    ]?.map((it) => (
                        <VStack
                            key={it.key}
                            bg="gray.50"
                            p={3}
                            borderRadius="2xl"
                            align="center"
                            gap={0}
                            border="1px solid"
                            borderColor="gray.100"
                            as={it.link ? Link : Box}
                            {...(it.link ? { href: it.link } : {})}
                            _hover={it.link ? { bg: "blue.50", borderColor: "main/20" } : {}}
                            cursor={it.link ? "pointer" : "default"}
                        >
                            <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>{it.label}</Text>
                            <Text fontSize="xs" fontWeight="800" color="gray.800" textAlign="center" lineClamp={1}>{it.value}</Text>
                        </VStack>
                    ))}
                </Grid>

                {/* Actions */}
                <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.100">
                    <HStack gap={1}>
                        <Button
                            variant="ghost"
                            size="md"
                            color={isLiked ? "main" : "gray.600"}
                            _hover={{ bg: "blue.50", color: "main" }}
                            borderRadius="xl"
                            gap={2}
                            px={4}
                            onClick={handleLike}
                            loading={likeMutation.isPending || unlikeMutation.isPending}
                        >
                            <Icon as={FiThumbsUp} />
                            <Text fontWeight="800" fontSize="sm">{likeCount} {t('likes', { defaultValue: 'Likes' })}</Text>
                        </Button>
                        <Button
                            variant="ghost"
                            size="md"
                            color="gray.600"
                            _hover={{ bg: "blue.50", color: "main" }}
                            borderRadius="xl"
                            gap={2}
                            px={4}
                            onClick={onOpen}
                        >
                            <Icon as={FiMessageCircle} />
                            <Text fontWeight="800" fontSize="sm">{count_comments ?? 0} {t('comments', { defaultValue: 'Comments' })}</Text>
                        </Button>
                    </HStack>
                    <Button
                        variant="ghost"
                        size="md"
                        color={isBookmarked ? "main" : "gray.600"}
                        _hover={{ bg: "blue.50", color: "main" }}
                        borderRadius="xl"
                        px={4}
                        onClick={handleBookmark}
                        loading={bookmarkMutation.isPending || unbookmarkMutation.isPending}
                    >
                        <Icon as={FiBookmark} boxSize={5} />
                    </Button>
                </HStack>

                <PopUpComment
                    isOpen={open}
                    onClose={onClose}
                    articleId={props.id ? props.id.toString() : undefined}
                    images={imageUrls}
                    comments={comments as CommentParams[] || []}
                    author={user ? { name: user.name, avatar: user.avatar } : undefined}
                    caption={title}
                    createdAt={created_at}
                    likeCount={count_likes}
                />
            </VStack>
        </Box>
    );

    return content;
}

export function ItemBlogLarge(props: ItemBlogProps) {
    const { images, title, content, tags, created_at, count_views, count_likes, count_comments } = props;
    const imageUrls = images?.map(img => img.image_url) || [];

    const cardContent = (
        <Box bg="white" color="black" borderRadius="xl" overflow="hidden" shadow="sm" border="1px solid" borderColor="gray.100">
            {images && images.length > 0 ? (
                images.length === 1 ? (
                    <Box h="240px" w="full">
                        <Image src={imageUrls[0]} alt={title} w="full" h="full" objectFit="cover" />
                    </Box>
                ) : (
                    <Box p={4}>
                        <ImagesGrid title={title} data={imageUrls ?? []} />
                    </Box>
                )
            ) : null}
            <Box p={4}>
                <Text fontSize="xl" fontWeight="bold" mt={2}>{title}</Text>
                <Text fontSize="sm" color="gray.700" mt={1}>{content}</Text>
                <TagList tags={tags} />
                <HStack mt={3} justify="space-between">
                    <HStack gap={1}>
                        <Stat icon={FiEye} value={count_views} />
                        <Stat icon={FiThumbsUp} value={count_likes} />
                        <Stat icon={FiMessageCircle} value={count_comments} />
                    </HStack>
                    {created_at ? <Text fontSize="xs" color="gray.600">{created_at}</Text> : null}
                </HStack>
            </Box>
        </Box>
    );

    return cardContent;
}
