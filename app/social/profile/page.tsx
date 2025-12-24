"use client";

import { useSession } from "next-auth/react";
import { Box, Flex, Text, Heading, IconButton, Button, Tabs, VStack, HStack, Icon, Avatar } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { useRouter } from "next/navigation";
import MyPost from "./component/MyPost";
import PostLike from "./component/PostLike";

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <Box w="full" minH="100vh" color="white">
            {/* Header */}
            <Flex
                py={2}
                align="center"
                gap={6}
            >
                <IconButton
                    aria-label="Back"
                    variant="ghost"
                    color="gray"
                    size="lg"
                    onClick={() => router.back()}
                >
                    <FaArrowLeft />
                </IconButton>
            </Flex>

            {/* Profile Header */}
            <Box px={4} pb={4} w="full" >
                <Flex w="full" justify="center" align="center" direction="column" gap={4}>
                    <Avatar.Root w={150} h={150}>
                        <Avatar.Fallback display="flex" justifyContent="center" alignItems="center" w={150} h={150} name="Huỳnh Phi Long" bg="purple.600" color="white" />
                    </Avatar.Root>
                    {/* <Button
                        variant="outline"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="full"
                        size="sm"
                        mt={3}
                        fontWeight="bold"
                        _hover={{ bg: "whiteAlpha.200" }}
                    >
                        Edit profile
                    </Button> */}
                </Flex>

                    <VStack w="full" align="center" gap={1} justifyContent="center">
                        <HStack gap={1}>
                            <Heading color={"gray.700"} size="xl">
                                {session?.user?.name || session?.user?.email?.split('@')[0] || "User"}
                            </Heading>
                            {/* Optional: Add condition for verified users */}
                            {/* <Icon as={MdVerified} color="blue.400" boxSize={5} /> */}
                        </HStack>
                        <Text color="gray.500">{session?.user?.email || "@user"}</Text>

                        {/* Stats - Following/Followers currently static/placeholder */}
                        <HStack gap={6} mt={4} fontSize="sm">
                            <HStack gap={1}>
                                <Text color="gray.800" fontWeight="bold">2</Text>
                                <Text color="gray.500">Following</Text>
                            </HStack>
                            <HStack gap={1}>
                                <Text color="gray.800" fontWeight="bold">0</Text>
                                <Text color="gray.500">Followers</Text>
                            </HStack>
                        </HStack>
                    </VStack>
            </Box>

            {/* Tabs */}
            <Tabs.Root defaultValue="my post" w="full">
                <Tabs.List borderBottom="1px solid" borderColor="whiteAlpha.200">
                    {["My Post", "Post Like"].map((tab) => (
                        <Tabs.Trigger
                            key={tab}
                            value={tab.toLowerCase()}
                            flex={1}
                            minW="fit-content"
                            px={4}
                            py={3}
                            color="gray.500"
                            fontWeight="medium"
                            _selected={{ fontWeight: "bold" }}
                        >
                            {tab}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                <Tabs.Content value="my post">
                    <MyPost />
                </Tabs.Content>
                <Tabs.Content value="post like">
                    <PostLike />
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}
