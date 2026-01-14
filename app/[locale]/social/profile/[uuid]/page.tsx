"use client";

import { useSession } from "next-auth/react";
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    Avatar,
    Button,
    Spinner,
    Center,
    Image,
    Icon,
    List
} from "@chakra-ui/react";
import { FiUserPlus, FiUserMinus, FiEdit, FiCamera } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from "@/apis/user";
import type { IArticlePopular } from "@/types/response/article";
import { toaster } from "@/components/chakra/toaster";
import ItemBlog from "../../component/ItemBlog";
import { useTranslations, useLocale } from "next-intl";

const ProfileContent = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const profileUuid = params.uuid as string;
    const t = useTranslations('common');
    const locale = useLocale();
    const queryClient = useQueryClient();

    // Determine if viewing own profile
    const isOwnProfile = (session?.user as { uuid?: string })?.uuid === profileUuid;

    // Fetch profile user data
    const { data: profileUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ['profile-user', profileUuid],
        queryFn: async () => await userApi.getByUuid(profileUuid),
        enabled: !!profileUuid,
    });

    // Fetch user's articles by UUID
    const { data: userArticles, isLoading: isLoadingArticles } = useQuery({
        queryKey: ['user-articles', profileUuid],
        queryFn: async () => profileUuid ? await userApi.getArticlesByUuid(profileUuid) : [],
        enabled: !!profileUuid,
    });

    // Fetch followers/following counts
    const { data: followers } = useQuery({
        queryKey: ['followers', profileUser?.id],
        queryFn: async () => profileUser?.id ? await userApi.getFollowersById(profileUser.id) : [],
        enabled: !!profileUser?.id,
    });

    const { data: followings } = useQuery({
        queryKey: ['followings', profileUser?.id],
        queryFn: async () => profileUser?.id ? await userApi.getFollowingById(profileUser.id) : [],
        enabled: !!profileUser?.id,
    });

    // Check if current user is following this profile
    const { data: myFollowing } = useQuery({
        queryKey: ['my-following', session?.user?.accessToken],
        queryFn: async () => session?.user?.accessToken ? await userApi.getFollowing(session.user.accessToken) : [],
        enabled: !!session?.user?.accessToken && !isOwnProfile,
    });

    const isFollowing = myFollowing?.some((f: { id: number } | number) => (f && typeof f === 'object' ? f.id : f) === profileUser?.id);

    // Follow/unfollow mutations
    const followMutation = useMutation({
        mutationFn: () => userApi.follow(session?.user?.accessToken || '', profileUser?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-following'] });
            queryClient.invalidateQueries({ queryKey: ['followers', profileUser?.id] });
        },
        onError: () => toaster.create({ title: "Failed to follow", type: "error" })
    });

    const unfollowMutation = useMutation({
        mutationFn: () => userApi.unfollow(session?.user?.accessToken || '', profileUser?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-following'] });
            queryClient.invalidateQueries({ queryKey: ['followers', profileUser?.id] });
        },
        onError: () => toaster.create({ title: "Failed to unfollow", type: "error" })
    });

    if (isLoadingUser) {
        return (
            <Center py={20}>
                <VStack gap={4}>
                    <Spinner size="xl" color="main" />
                    <Text fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="widest" fontSize="xs">
                        Loading Profile...
                    </Text>
                </VStack>
            </Center>
        );
    }

    if (!profileUser) {
        return (
            <Center py={20}>
                <VStack gap={4}>
                    <Heading size="lg" color="gray.500">User not found</Heading>
                    <Button onClick={() => router.back()} variant="outline">Go Back</Button>
                </VStack>
            </Center>
        );
    }

    const articles = Array.isArray(userArticles) ? userArticles : [];

    return (
        <VStack align="stretch" gap={6}>
            {/* Hero Section with Profile Info */}
            <Box
                position="relative"
                h="280px"
                borderRadius="2xl"
                overflow="hidden"
                shadow="2xl"
            >
                <Image
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"
                    alt="Profile Cover"
                    position="absolute"
                    inset={0}
                    w="full"
                    h="full"
                    objectFit="cover"
                />
                <Box position="absolute" inset={0} bg="blackAlpha.600" />

                {/* Profile Info Overlay */}
                <VStack
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={{ base: 4, md: 6 }}
                    align="start"
                    gap={4}
                >
                    <HStack gap={4} align="end" w="full" justify="space-between" flexWrap="wrap">
                        <HStack gap={4}>
                            <Avatar.Root
                                size="2xl"
                                border="4px solid white"
                                shadow="xl"
                                position="relative"
                                cursor={isOwnProfile ? "pointer" : "default"}
                                onClick={() => isOwnProfile && router.push('/mypage')}
                                overflow="hidden"
                                _hover={isOwnProfile ? {
                                    "& .avatar-overlay": { opacity: 1 },
                                    "& img": { filter: "brightness(0.7)" }
                                } : {}}
                            >
                                <Avatar.Fallback name={profileUser?.full_name || "User"} color="black" />
                                {profileUser?.avatar_url && <Avatar.Image src={profileUser.avatar_url} border="none" />}

                                {isOwnProfile && (
                                    <Box
                                        className="avatar-overlay"
                                        position="absolute"
                                        inset={0}
                                        bg="blackAlpha.600"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        opacity={0}
                                        transition="all 0.3s"
                                        zIndex={2}
                                    >
                                        <Icon color="white" fontSize="2xl">
                                            <FiCamera />
                                        </Icon>
                                    </Box>
                                )}
                            </Avatar.Root>
                            <VStack align="start" gap={0}>
                                <Heading size={{ base: "lg", md: "xl" }} color="white" fontWeight="900">
                                    {profileUser?.full_name || "Unknown User"}
                                </Heading>
                                <Text color="whiteAlpha.800" fontSize="md" fontWeight="500">
                                    @{profileUser?.username || "user"}
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Action Button */}
                        {!isOwnProfile && session?.user ? (
                            <Button
                                colorPalette={isFollowing ? "gray" : "purple"}
                                variant={isFollowing ? "outline" : "solid"}
                                onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                                loading={followMutation.isPending || unfollowMutation.isPending}
                                size="md"
                                borderRadius="full"
                            >
                                <Icon>
                                    {isFollowing ? <FiUserMinus /> : <FiUserPlus />}
                                </Icon>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>
                        ) : isOwnProfile ? (
                            <Button
                                size="md"
                                variant="subtle"
                                borderRadius="full"
                                onClick={() => router.push('/social')}
                            >
                                <FiEdit />
                                Create Post
                            </Button>
                        ) : null}
                    </HStack>

                    {/* Stats */}
                    <HStack gap={6} fontSize="sm">
                        <HStack gap={1}>
                            <Text fontWeight="bold" color="white">{articles?.length || 0}</Text>
                            <Text color="whiteAlpha.800">Posts</Text>
                        </HStack>
                        <HStack gap={1}>
                            <Text fontWeight="bold" color="white">{Array.isArray(followers) ? followers.length : 0}</Text>
                            <Text color="whiteAlpha.800">Followers</Text>
                        </HStack>
                        <HStack gap={1}>
                            <Text fontWeight="bold" color="white">{Array.isArray(followings) ? followings.length : 0}</Text>
                            <Text color="whiteAlpha.800">Following</Text>
                        </HStack>
                    </HStack>
                </VStack>
            </Box>

            {/* Posts Section */}
            {isLoadingArticles ? (
                <Center py={10}>
                    <Spinner color="main" />
                </Center>
            ) : articles.length === 0 ? (
                <Box p={20} textAlign="center" bg="white" borderRadius="2xl" shadow="sm" w="full" border="1px solid" borderColor="gray.50">
                    <VStack gap={4}>
                        <Text color="gray.400" fontWeight="800" fontSize="lg">
                            No posts yet
                        </Text>
                        {isOwnProfile && (
                            <Button variant="ghost" color="main" onClick={() => router.push('/social')}>
                                Create your first post
                            </Button>
                        )}
                    </VStack>
                </Box>
            ) : (
                <List.Root w="full" variant="marker" gap={6} display="flex" flexDirection="column" alignItems="center">
                    {articles.map((item: IArticlePopular, index: number) => (
                        <List.Item key={(item._id || item.id)?.toString() || `article-${index}`} w="full" display="flex" alignItems="center" justifyContent="center">
                            <ItemBlog
                                {...item}
                                users_like={item.users_like}
                                users_bookmark={item.users_bookmark}
                                comments={item.comments}
                                followingIds={[]}
                                onFollowChange={() => { }}
                            />
                        </List.Item>
                    ))}
                </List.Root>
            )}
        </VStack>
    );
};

export default function ProfilePage() {
    return (
        <Suspense fallback={<Center py={10}><Spinner color="main" /></Center>}>
            <ProfileContent />
        </Suspense>
    );
}
