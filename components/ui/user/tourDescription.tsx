"use client";

import { Box, Heading, Text, VStack, List, Grid, HStack, Icon } from "@chakra-ui/react";
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
        <VStack align="stretch" gap={8}>
            {/* Description Section */}
            <Box>
                <Heading as="h2" size="xl" fontWeight="bold" mb={4}>
                    Description
                </Heading>
                <Box color="gray.700" lineHeight="tall" whiteSpace="pre-line" dangerouslySetInnerHTML={{ __html: description }} />
            </Box>

            {/* Activity Section */}
            <Box>
                <Heading as="h2" size="xl" fontWeight="bold" mb={4}>
                    Activity
                </Heading>
                <Box>
                    <Heading as="h3" size="md" mb={3} color="gray.800">
                        {activity.title}
                    </Heading>
                    <List.Root gap={2}>
                        {activity.items.map((item, idx) => (
                            <List.Item key={idx} display="flex" alignItems="flex-start" gap={2}>
                                <Box mt={1} flexShrink={0}>
                                    <Box w={2} h={2} borderRadius="full" bg="gray.700" />
                                </Box>
                                <Text color="gray.700">{item}</Text>
                            </List.Item>
                        ))}
                    </List.Root>
                </Box>
            </Box>

            {/* What's Included / Not Included */}
            <Box>
                <Heading as="h2" size="xl" fontWeight="bold" mb={4}>
                    What Is Included / Not Included
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <Box>
                        <Heading as="h3" size="sm" mb={3} color="gray.800">
                            Includes
                        </Heading>
                        <List.Root gap={2}>
                            {included.map((item, idx) => (
                                <List.Item key={idx} display="flex" alignItems="flex-start" gap={2}>
                                    <Icon as={FaCheckCircle} color="green.500" mt={0.5} boxSize={5} />
                                    <Text color="gray.700">{item}</Text>
                                </List.Item>
                            ))}
                        </List.Root>
                    </Box>
                    <Box>
                        <Heading as="h3" size="sm" mb={3} color="gray.800">
                            Not Includes
                        </Heading>
                        <List.Root gap={2}>
                            {notIncluded.map((item, idx) => (
                                <List.Item key={idx} display="flex" alignItems="flex-start" gap={2}>
                                    <Icon as={FaTimesCircle} color="red.500" mt={0.5} boxSize={5} />
                                    <Text color="gray.700">{item}</Text>
                                </List.Item>
                            ))}
                        </List.Root>
                    </Box>
                </Grid>
            </Box>

            {/* Details Section */}
            <Box>
                <Heading as="h2" size="xl" fontWeight="bold" mb={4}>
                    Details
                </Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                    <Box>
                        <HStack mb={2}>
                            <FaGlobe size={20} />
                            <Heading as="h3" size="sm" color="gray.800">
                                Language
                            </Heading>
                        </HStack>
                        <List.Root gap={1}>
                            {details.language.map((lang, idx) => (
                                <List.Item key={idx} display="flex" alignItems="center" gap={2}>
                                    <Box w={1.5} h={1.5} borderRadius="full" bg="gray.700" />
                                    <Text color="gray.700">{lang}</Text>
                                </List.Item>
                            ))}
                        </List.Root>
                    </Box>
                    <Box>
                        <HStack mb={2}>
                            <FaClock size={20} />
                            <Heading as="h3" size="sm" color="gray.800">
                                Duration
                            </Heading>
                        </HStack>
                        <List.Root gap={1}>
                            <List.Item display="flex" alignItems="center" gap={2}>
                                <Box w={1.5} h={1.5} borderRadius="full" bg="gray.700" />
                                <Text color="gray.700">{details.duration}</Text>
                            </List.Item>
                        </List.Root>
                    </Box>
                    <Box>
                        <HStack mb={2}>
                            <FaUsers size={20} />
                            <Heading as="h3" size="sm" color="gray.800">
                                Number Of People
                            </Heading>
                        </HStack>
                        <List.Root gap={1}>
                            <List.Item display="flex" alignItems="center" gap={2}>
                                <Box w={1.5} h={1.5} borderRadius="full" bg="gray.700" />
                                <Text color="gray.700">{details.capacity}</Text>
                            </List.Item>
                        </List.Root>
                    </Box>
                </Grid>
            </Box>

            {/* Meeting Point */}
            <Box>
                <Heading as="h2" size="xl" fontWeight="bold" mb={4}>
                    Meeting Point Address
                </Heading>
                <List.Root gap={1}>
                    <List.Item display="flex" alignItems="flex-start" gap={2}>
                        <Box mt={1.5} flexShrink={0}>
                            <Box w={1.5} h={1.5} borderRadius="full" bg="gray.700" />
                        </Box>
                        <Text color="gray.700" lineHeight="tall">
                            {meetingPoint}
                        </Text>
                    </List.Item>
                </List.Root>
            </Box>
        </VStack>
    );
}

