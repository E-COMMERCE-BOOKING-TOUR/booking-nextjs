"use client";

import { useSession } from "next-auth/react";
import {
    Box,
    Flex,
    Text,
    Heading,
    IconButton,
    Tabs,
    VStack,
    HStack,
    Icon,
    Avatar,
    Image
} from "@chakra-ui/react";
import { FaArrowLeft, FaCamera } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import { useRouter } from "next/navigation";
import MyPost from "./component/MyPost";
import PostLike from "./component/PostLike";
import { useState } from "react";
import article from "@/apis/article";
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("my post");

    // Fetch counts for tabs (this is a bit redundant if MyPost/PostLike fetch too, but useful for badges)
    // For now, we'll let the components handle their own data and maybe lift state later if needed.
    // However, to show counts in tabs like "Bài viết (125)", we might need to fetch here or expose counts.
    // For simplicity and performance, we'll fetch just lengths here or rely on the components. 
    // Actually, let's fetch lengths here to match the design perfectly.

    const { data: myArticles } = useQuery({
        queryKey: ['my-articles', session?.user?.accessToken],
        queryFn: async () => session?.user?.accessToken ? await article.getMyArticles(session.user.accessToken) : [],
        enabled: !!session?.user?.accessToken,
    });

    const { data: likedArticles } = useQuery({
        queryKey: ['liked-articles', session?.user?.accessToken],
        queryFn: async () => session?.user?.accessToken ? await article.getLikedArticles(session.user.accessToken) : [],
        enabled: !!session?.user?.accessToken,
    });

    return (
        <Box w="full" minH="100vh" bg="#f8f9fa" pb={20}>
            {/* Header / Cover Area */}
            <Box position="relative" w="full" bg="white" borderBottomRadius="3xl" shadow="sm" overflow="hidden" pb={6}>
                {/* Back Button */}
                <Box position="absolute" top={4} left={4} zIndex={10}>
                    <IconButton
                        aria-label="Back"
                        variant="ghost"
                        color="gray.600"
                        bg="whiteAlpha.600"
                        borderRadius="full"
                        size="md"
                        onClick={() => router.back()}
                        _hover={{ bg: "whiteAlpha.800" }}
                    >
                        <FaArrowLeft />
                    </IconButton>
                </Box>

                {/* Cover Image Placeholder */}
                <Box h="200px" w="full" bgGradient="linear(to-r, #00cec9, #81ecec)">
                    {/* Ideally this would be an Image component if user has a cover */}
                    <Image
                        src="https://placehold.co/800x200/png?text=Cover+Image"
                        w="full"
                        h="full"
                        objectFit="cover"
                        opacity={0.8}
                        alt="Cover"
                    />
                </Box>

                {/* Profile Info Section */}
                <Box px={6} mt="-50px">
                    <Flex direction="column" gap={4}>
                        {/* Avatar */}
                        <Box position="relative" w="fit-content">
                            <Avatar.Root size="2xl" w="100px" h="100px" border="4px solid white" shadow="md">
                                <Avatar.Fallback name={session?.user?.name || "User"} bg="purple.500" color="white" fontSize="2xl" />
                                {/* <Avatar.Image src={session?.user?.image} /> */}
                            </Avatar.Root>
                            {/* Edit Icon Badge (just visual) */}
                            {/* <Box position="absolute" bottom={0} right={0} bg="gray.100" p={1.5} borderRadius="full" border="2px solid white" cursor="pointer">
                                <Icon as={FaCamera} color="gray.600" boxSize={3}/>
                             </Box> */}
                        </Box>

                        <VStack align="start" gap={1}>
                            <Heading size="lg" fontWeight="bold" color="gray.800">
                                {session?.user?.name || "John Doe"}
                            </Heading>
                            <Text color="gray.500" fontSize="sm">
                                {session?.user?.email ? `@${session.user.email.split('@')[0]}` : "@johndoe"}
                            </Text>

                            {/* Bio / Roles Placeholder */}
                            <HStack fontSize="sm" color="gray.600" mt={1}>
                                <Text>✈️ Travel Enthusiast</Text>
                                <Text>|</Text>
                                <Text>📷 Photographer</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                Khám phá Việt Nam và thế giới. Booking tours contact DM! 👇
                            </Text>

                            {/* Stats */}
                            <HStack gap={6} mt={3} fontSize="sm">
                                <HStack gap={1}>
                                    <Text fontWeight="bold" color="gray.800">{myArticles?.length || 0}</Text>
                                    <Text color="gray.500">Posts</Text>
                                </HStack>
                                <HStack gap={1}>
                                    <Text fontWeight="bold" color="gray.800">14.2k</Text>
                                    <Text color="gray.500">Followers</Text>
                                </HStack>
                                <HStack gap={1}>
                                    <Text fontWeight="bold" color="gray.800">340</Text>
                                    <Text color="gray.500">Following</Text>
                                </HStack>
                            </HStack>
                        </VStack>
                    </Flex>
                </Box>
            </Box>

            {/* Tabs Section */}
            <Box mt={4} px={0}>
                <Tabs.Root
                    value={activeTab}
                    onValueChange={(details) => setActiveTab(details.value)}
                    variant="plain"
                    w="full"
                >
                    <Box bg="white" py={2} px={4} borderRadius="xl" mx={4} shadow="sm" mb={4}>
                        <Tabs.List borderBottom="none" gap={8}>
                            <Tabs.Trigger
                                value="my post"
                                color="gray.500"
                                fontWeight="semibold"
                                _selected={{ color: "#00cec9", borderBottom: "2px solid #00cec9" }}
                                px={0}
                                pb={2}
                            >
                                Bài viết ({myArticles?.length || 0})
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="post like"
                                color="gray.500"
                                fontWeight="semibold"
                                _selected={{ color: "#00cec9", borderBottom: "2px solid #00cec9" }}
                                px={0}
                                pb={2}
                            >
                                Đã thích ({likedArticles?.length || 0})
                            </Tabs.Trigger>
                        </Tabs.List>
                    </Box>

                    <Box px={4}>
                        <Tabs.Content value="my post" p={0}>
                            <MyPost />
                        </Tabs.Content>
                        <Tabs.Content value="post like" p={0}>
                            <PostLike />
                        </Tabs.Content>
                    </Box>
                </Tabs.Root>
            </Box>
        </Box>
    );
}
