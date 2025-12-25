"use client";

import { Box, Heading, Text, VStack, List, Grid, HStack, Icon, Badge } from "@chakra-ui/react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaUsers, FaGlobe } from "react-icons/fa";

interface TourDescriptionProps {
    description: string;
    activity: {
        title: string;
        items: string[];
    };
    included: string[];
    notIncluded: string[];
    details: {
        language: string[];
        duration: string;
        capacity: string;
    };
    meetingPoint: string;
}

export default function TourDescription({
    description,
    activity,
    included,
    notIncluded,
    details,
    meetingPoint,
}: TourDescriptionProps) {
    return (
        <VStack align="stretch" gap={12}>
            {/* Description Section */}
            <Box>
                <VStack align="start" gap={2} mb={4}>
                    <Heading as="h2" size="xl" fontWeight="black" letterSpacing="tight">
                        About this tour
                    </Heading>
                    <Box w={8} h={1} bg="main" rounded="full" />
                </VStack>
                <Box
                    color="gray.600"
                    lineHeight="1.8"
                    fontSize="md"
                    whiteSpace="pre-line"
                    dangerouslySetInnerHTML={{ __html: description }}
                    css={{
                        "& p": { mb: 4 },
                        "& ul": { mb: 4, pl: 5 },
                        "& li": { mb: 2 }
                    }}
                />
            </Box>

            {/* Highlights/Activity Section */}
            <Box bg="blue.50" p={6} rounded="2xl" border="1px solid" borderColor="blue.100">
                <HStack gap={3} mb={5}>
                    <Box p={2} bg="white" rounded="lg" shadow="sm">
                        <Icon as={FaGlobe} color="main" boxSize={4} />
                    </Box>
                    <Heading as="h2" size="lg" fontWeight="black" letterSpacing="tight">
                        What you will do
                    </Heading>
                </HStack>
                <Box>
                    <Heading as="h3" size="sm" mb={5} color="gray.700" fontWeight="black" textTransform="uppercase" letterSpacing="wider">
                        {activity.title}
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        {activity.items.map((item, idx) => (
                            <HStack key={idx} align="flex-start" gap={3}>
                                <Box mt={1.5} flexShrink={0}>
                                    <Box w={2.5} h={2.5} borderRadius="full" bg="main" border="3px solid white" shadow="sm" />
                                </Box>
                                <Text color="gray.700" fontSize="md" fontWeight="bold" lineHeight="tall">{item}</Text>
                            </HStack>
                        ))}
                    </Grid>
                </Box>
            </Box>

            {/* What's Included / Not Included */}
            <Box>
                <Heading as="h2" size="lg" fontWeight="black" mb={8} letterSpacing="tight">
                    What&apos;s included
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={12}>
                    <VStack align="stretch" gap={4}>
                        <HStack gap={2} mb={2}>
                            <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                            <Text fontWeight="black" fontSize="md">Includes</Text>
                        </HStack>
                        <List.Root gap={3} variant="plain">
                            {included.map((item, idx) => (
                                <List.Item key={idx} display="flex" alignItems="flex-start" gap={3}>
                                    <Icon as={FaCheckCircle} color="green.500" mt={1} boxSize={4} opacity={0.6} />
                                    <Text color="gray.600" fontSize="sm">{item}</Text>
                                </List.Item>
                            ))}
                        </List.Root>
                    </VStack>
                    <VStack align="stretch" gap={4}>
                        <HStack gap={2} mb={2}>
                            <Icon as={FaTimesCircle} color="red.500" boxSize={5} />
                            <Text fontWeight="black" fontSize="md">Not Included</Text>
                        </HStack>
                        <List.Root gap={3} variant="plain">
                            {notIncluded.map((item, idx) => (
                                <List.Item key={idx} display="flex" alignItems="flex-start" gap={3}>
                                    <Icon as={FaTimesCircle} color="red.500" mt={1} boxSize={4} opacity={0.6} />
                                    <Text color="gray.600" fontSize="sm">{item}</Text>
                                </List.Item>
                            ))}
                        </List.Root>
                    </VStack>
                </Grid>
            </Box>

            {/* Details Section */}
            <Box borderY="1px solid" borderColor="gray.100" py={10}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={10}>
                    <VStack align="start" gap={3}>
                        <HStack gap={3} color="main">
                            <FaGlobe size={18} />
                            <Heading as="h3" size="sm" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
                                Language
                            </Heading>
                        </HStack>
                        <HStack wrap="wrap" gap={2}>
                            {details.language.map((lang, idx) => (
                                <Badge key={idx} variant="surface" colorPalette="blue" px={2} rounded="md">
                                    {lang}
                                </Badge>
                            ))}
                        </HStack>
                    </VStack>

                    <VStack align="start" gap={3}>
                        <HStack gap={3} color="main">
                            <FaClock size={18} />
                            <Heading as="h3" size="sm" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
                                Duration
                            </Heading>
                        </HStack>
                        <Text color="gray.600" fontWeight="bold">{details.duration}</Text>
                    </VStack>

                    <VStack align="start" gap={3}>
                        <HStack gap={3} color="main">
                            <FaUsers size={18} />
                            <Heading as="h3" size="sm" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
                                Capacity
                            </Heading>
                        </HStack>
                        <Text color="gray.600" fontWeight="bold">Up to {details.capacity} people</Text>
                    </VStack>
                </Grid>
            </Box>

            {/* Meeting Point */}
            <Box bg="white" p={6} rounded="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
                <HStack gap={5} align="center">
                    <Box p={4} bg="blue.50" rounded="xl" color="main">
                        <FaGlobe size={24} />
                    </Box>
                    <VStack align="start" gap={0}>
                        <Heading as="h2" size="md" fontWeight="black" letterSpacing="tight" mb={1}>
                            Meeting Point
                        </Heading>
                        <Text color="gray.500" fontSize="sm" fontWeight="bold" mb={1}>
                            Check-in Address
                        </Text>
                        <Text color="gray.700" fontSize="md" fontWeight="black">
                            {meetingPoint}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        </VStack>
    );
}

