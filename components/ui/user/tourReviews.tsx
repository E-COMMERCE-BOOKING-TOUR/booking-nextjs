"use client";

import {
    Box,
    Heading,
    Text,
    HStack,
    VStack,
    Button,
    Input,
    Grid,
    Image,
    Flex,
    Progress,
} from "@chakra-ui/react";
import { FaStar, FaSearch, FaFilter, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";

interface Review {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    title: string;
    content: string;
    verified: boolean;
    helpfulCount?: number;
}

interface ReviewCategory {
    label: string;
    score: number;
}

interface TourReviewsProps {
    averageRating: number;
    totalReviews: number;
    categories: ReviewCategory[];
    reviews: Review[];
}

export default function TourReviews({
    averageRating,
    totalReviews,
    categories,
    reviews,
}: TourReviewsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleReviews, setVisibleReviews] = useState(5);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, idx) => (
            <FaStar
                key={idx}
                size={20}
                color={idx < rating ? "#FFA500" : "#E0E0E0"}
            />
        ));
    };

    const handleLoadMore = () => {
        setVisibleReviews((prev) => prev + 5);
    };

    return (
        <VStack align="stretch" gap={6} mb={8}>
            <Heading as="h2" size="xl" fontWeight="bold">
                Reviews
            </Heading>

            {/* Rating Overview */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
                <Box>
                    <HStack gap={4} align="flex-start">
                        <Box>
                            <Text fontSize="5xl" fontWeight="bold" lineHeight={1}>
                                {averageRating.toFixed(1).replace(".", ",")}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                {totalReviews} Reviews
                            </Text>
                        </Box>
                        <VStack align="start" gap={0}>
                            <HStack gap={1}>{renderStars(Math.round(averageRating))}</HStack>
                        </VStack>
                    </HStack>
                </Box>

                <VStack align="stretch" gap={2}>
                    {categories.map((category, idx) => (
                        <HStack key={idx} gap={3}>
                            <Text fontSize="sm" color="gray.700" minW="150px">
                                {category.label}
                            </Text>
                            <Box flex={1}>
                                <Progress.Root
                                    value={Math.min((category.score / 5) * 100, 100)}
                                    size="sm"
                                    colorPalette="yellow"
                                >
                                    <Progress.Track borderRadius="full">
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                            </Box>
                            <Text fontSize="sm" fontWeight="medium" minW="30px">
                                {category.score.toFixed(1)}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </Grid>

            {/* Filters */}
            <Box p={4}>
                <Grid
                    templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                    gap={3}
                    alignItems="center"
                >
                    <HStack gap={2}>
                        <FaFilter size={16} />
                        <Text fontSize="sm" fontWeight="medium">
                            Filtering:
                        </Text>
                    </HStack>

                    <Box as="select" p={2} borderRadius="md" bg="gray.100" fontSize="sm">
                        <option value="recommended">Recommended</option>
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </Box>

                    <Box as="select" p={2} borderRadius="md" bg="gray.100" fontSize="sm">
                        <option value="all">Traveler type</option>
                        <option value="family">Family</option>
                        <option value="couple">Couple</option>
                        <option value="solo">Solo</option>
                        <option value="business">Business</option>
                    </Box>

                    <Box as="select" p={2} borderRadius="md" bg="gray.100" fontSize="sm">
                        <option value="all">Rating</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </Box>
                </Grid>

                <Box mt={3} position="relative">
                    <Input
                        placeholder="Search Here"
                        bg="white"
                        size="md"
                        paddingLeft={10}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                        <FaSearch color="#999" size={16} />
                    </Box>
                </Box>
            </Box>

            {/* Reviews List */}
            <VStack align="stretch" gap={6}>
                {reviews.slice(0, visibleReviews).map((review) => (
                    <Box
                        key={review.id}
                        p={4}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        _last={{ borderBottom: "none" }}
                    >
                        <HStack align="flex-start" gap={4}>
                            <Image
                                src={review.userAvatar}
                                alt={review.userName}
                                w={12}
                                h={12}
                                borderRadius="full"
                                objectFit="cover"
                            />

                            <VStack align="stretch" flex={1} gap={2}>
                                <HStack justify="space-between" align="flex-start">
                                    <Box>
                                        <HStack gap={2}>
                                            <Text fontSize="md" fontWeight="bold">
                                                {review.userName}
                                            </Text>
                                            {review.verified && (
                                                <FaCheckCircle color="#4CAF50" size={14} />
                                            )}
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500">
                                            {review.date}
                                        </Text>
                                    </Box>

                                    <HStack gap={2}>
                                        <Text fontSize="sm" color="gray.600">
                                            Helpful?
                                        </Text>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="blue"
                                            fontSize="sm"
                                        >
                                            Yes
                                        </Button>
                                    </HStack>
                                </HStack>

                                <HStack gap={1}>{renderStars(review.rating)}</HStack>

                                <Text fontSize="md" fontWeight="semibold" color="gray.900">
                                    {review.title}
                                </Text>

                                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                                    {review.content}
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>
                ))}
            </VStack>

            {/* Load More Button */}
            {visibleReviews < reviews.length && (
                <Flex justify="center" mt={4}>
                    <Button
                        variant="ghost"
                        colorScheme="blue"
                        onClick={handleLoadMore}
                        size="lg"
                    >
                        View More Comments
                    </Button>
                </Flex>
            )}
        </VStack>
    );
}

