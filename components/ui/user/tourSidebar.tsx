import { Box, Flex, Text, Stack, HStack } from "@chakra-ui/react";
import type { TourTestimonial } from "@/types/tour";

interface TourSidebarProps {
    score: number;
    scoreLabel: string;
    reviewCount: number;
    staffScore: number;
    testimonial?: TourTestimonial;
}

export default function TourSidebar({
    score,
    scoreLabel,
    reviewCount,
    staffScore,
    testimonial,
}: TourSidebarProps) {
    return (
        <Stack gap={2}>
            <Box bg="blue.400" color="white" p={4} borderRadius="lg">
                <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold">
                            {scoreLabel}
                        </Text>
                        <Text fontSize="sm">{reviewCount.toLocaleString()} reviews</Text>
                    </Box>
                    <Box bg="blue.600" px={4} py={2} borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold">
                            {score}
                        </Text>
                    </Box>
                </Flex>
            </Box>

            {testimonial && (
                <Box p={4} bg="gray.50" borderRadius="lg">
                    <Text fontWeight="semibold" mb={2}>
                        Guests who stayed here loved
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        &ldquo;{testimonial.text}&rdquo;
                    </Text>
                    <HStack>
                        <Box
                            bg="green.400"
                            color="white"
                            borderRadius="full"
                            w={8}
                            h={8}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                        >
                            {testimonial.name.charAt(0)}
                        </Box>
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                                {testimonial.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                🇬🇧 {testimonial.country}
                            </Text>
                        </Box>
                    </HStack>
                </Box>
            )}

            <Box p={4} bg="gray.50" borderRadius="lg">
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="semibold">Staff</Text>
                    <Box bg="blue.600" color="white" px={3} py={1} borderRadius="md" fontWeight="bold">
                        {staffScore}
                    </Box>
                </Flex>
            </Box>
        </Stack>
    );
}


