"use client";

import { Box, Flex, Text, Heading, IconButton, Button, Tabs, VStack, HStack, Icon, Avatar } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { BsCalendar3 } from "react-icons/bs";

export default function ProfilePage() {
    return (
        <Box w="full" minH="100vh" color="white">
            {/* Header */}
            <Flex
                py={2}
                align="center"
                gap={6}
            >
                <IconButton aria-label="Back" variant="ghost" color="gray" size="lg">
                    <FaArrowLeft />
                </IconButton>
            </Flex>

            {/* Profile Header */}
            <Box px={4} pb={4} w="full" >
                <Flex w="full" justify="center" align="center">
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

                <VStack w="full" align="center" gap={1} mt={3} justifyContent="center">
                    <HStack gap={1}>
                        <Heading color={"gray"} size="xl">Huỳnh Phi Long</Heading>
                        <Icon as={MdVerified} color="blue.400" boxSize={5} />
                    </HStack>
                    <Text color="gray.500">@ph_long_03</Text>

                    <HStack color="gray.500" fontSize="sm" mt={2}>
                        <Icon as={BsCalendar3} />
                        <Text>Joined December 2024</Text>
                    </HStack>

                    <HStack gap={4} mt={2} fontSize="sm">
                        <HStack gap={1}>
                            <Text color="gray" fontWeight="bold">2</Text>
                            <Text color="gray.500">Following</Text>
                        </HStack>
                        <HStack gap={1}>
                            <Text color="gray" fontWeight="bold">0</Text>
                            <Text color="gray.500">Followers</Text>
                        </HStack>
                    </HStack>
                </VStack>
            </Box>

            {/* Tabs */}
            <Tabs.Root defaultValue="posts" w="full">
                <Tabs.List borderBottom="1px solid" borderColor="whiteAlpha.200">
                    {["Posts", "Replies", "Highlights", "Articles", "Media", "Likes"].map((tab) => (
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

                <Tabs.Content value="posts">
                    <Box>
                        <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                            <Heading size="md" mb={4}>Who to follow</Heading>
                            {/* Example Follow Item */}
                            <Flex justify="space-between" align="center">
                                <HStack gap={3}>
                                    <Avatar.Root size="md">
                                        <Avatar.Fallback name="PlayStation" bg="blue.600" color="white" />
                                    </Avatar.Root>
                                    <VStack align="start" gap={0}>
                                        <HStack>
                                            <Text fontWeight="bold">PlayStation</Text>
                                            <Icon as={MdVerified} color="gold" />
                                        </HStack>
                                        <Text color="gray.500" fontSize="sm">@PlayStation</Text>
                                    </VStack>
                                </HStack>
                                <Button size="sm" bg="white" color="black" borderRadius="full" px={5} fontWeight="bold">
                                    Follow
                                </Button>
                            </Flex>
                            <Flex justify="space-between" align="center" mt={4}>
                                <HStack gap={3}>
                                    <Avatar.Root size="md">
                                        <Avatar.Fallback name="SEGA" bg="blue.800" color="white" />
                                    </Avatar.Root>
                                    <VStack align="start" gap={0}>
                                        <HStack>
                                            <Text fontWeight="bold">SEGA</Text>
                                            {/* <Icon as={MdVerified} color="gold" /> */}
                                        </HStack>
                                        <Text color="gray.500" fontSize="sm">@SEGA</Text>
                                    </VStack>
                                </HStack>
                                <Button size="sm" bg="white" color="black" borderRadius="full" px={5} fontWeight="bold">
                                    Follow
                                </Button>
                            </Flex>
                        </Box>
                    </Box>
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}
