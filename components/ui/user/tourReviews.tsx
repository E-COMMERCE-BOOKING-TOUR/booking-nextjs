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
    Badge,
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
        return (
            <HStack gap={0.5}>
                {Array.from({ length: 5 }, (_, idx) => (
                    <FaStar
                        key={idx}
                        size={14}
                        color={idx < rating ? "#FFB700" : "#E2E8F0"}
                    />
                ))}
            </HStack>
        );
    };

    const handleLoadMore = () => {
        setVisibleReviews((prev) => prev + 5);
    };

    return (
        <VStack align="stretch" gap={8}>
            <VStack align="start" gap={1}>
                <Heading as="h2" size="xl" fontWeight="black" letterSpacing="tight">
                    Guest reviews
                </Heading>
                <Text color="gray.500" fontSize="sm">What people are saying about this tour</Text>
            </VStack>

            {/* Rating Overview */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8} alignItems="stretch">
                <Box bg="blue.50" p={8} rounded="3xl" display="flex" flexDirection="column" justifyContent="center" alignItems="center" border="1px solid" borderColor="blue.100">
                    <Text fontSize="7xl" fontWeight="black" lineHeight={1} color="main">
                        {averageRating.toFixed(1).replace(".", ",")}
                    </Text>
                    <VStack gap={2} mt={4}>
                        <HStack gap={1} justify="center">
                            {Array.from({ length: 5 }, (_, idx) => (
                                <FaStar
                                    key={idx}
                                    size={20}
                                    color={idx < Math.round(averageRating) ? "#FFB700" : "#CBD5E0"}
                                />
                            ))}
                        </HStack>
                        <Text fontSize="sm" fontWeight="black" color="gray.600" textTransform="uppercase" letterSpacing="widest">
                            {totalReviews} verified reviews
                        </Text>
                    </VStack>
                </Box>

                <Box bg="white" p={8} rounded="3xl" border="1px solid" borderColor="gray.100" shadow="sm">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gapX={12} gapY={5}>
                        {categories.map((category, idx) => (
                            <HStack key={idx} gap={4} justify="space-between">
                                <Text fontSize="sm" fontWeight="black" color="gray.700" flex={1}>
                                    {category.label}
                                </Text>
                                <HStack gap={3} flex={2}>
                                    <Progress.Root
                                        value={Math.min((category.score / 5) * 100, 100)}
                                        size="sm"
                                        colorPalette="blue"
                                        flex={1}
                                    >
                                        <Progress.Track borderRadius="full" bg="gray.100" h="6px">
                                            <Progress.Range bg="main" />
                                        </Progress.Track>
                                    </Progress.Root>
                                    <Text fontSize="xs" fontWeight="black" minW="25px" textAlign="right" color="main">
                                        {category.score.toFixed(1)}
                                    </Text>
                                </HStack>
                            </HStack>
                        ))}
                    </Grid>
                </Box>
            </Grid>

            {/* Filters & Search */}
            <Box bg="gray.50" p={6} rounded="2xl">
                <Grid
                    templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 120px" }}
                    gap={4}
                    alignItems="center"
                >
                    <Box position="relative">
                        <Input
                            placeholder="Search in reviews..."
                            bg="white"
                            size="md"
                            rounded="xl"
                            paddingLeft={10}
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: "main", boxShadow: "0 0 0 1px #003B95" }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                            <FaSearch color="#A0AEC0" size={14} />
                        </Box>
                    </Box>

                    <Box as="select" p={2.5} borderRadius="xl" bg="white" border="1px solid" borderColor="gray.200" fontSize="sm" fontWeight="bold" cursor="pointer" appearance="none">
                        <option value="recommended">Recommended</option>
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </Box>

                    <Box as="select" p={2.5} borderRadius="xl" bg="white" border="1px solid" borderColor="gray.200" fontSize="sm" fontWeight="bold" cursor="pointer" appearance="none">
                        <option value="all">Rating: All</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </Box>

                    <Button bg="main" color="white" rounded="xl" px={4} fontWeight="black" textTransform="uppercase" fontSize="xs" letterSpacing="widest">
                        Apply
                    </Button>
                </Grid>
            </Box>

            {/* Reviews List */}
            <VStack align="stretch" gap={0}>
                {reviews.slice(0, visibleReviews).map((review) => (
                    <Box
                        key={review.id}
                        py={8}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        _last={{ borderBottom: "none" }}
                    >
                        <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8}>
                            <VStack align="start" gap={3}>
                                <HStack gap={3}>
                                    <Image
                                        src={review.userAvatar}
                                        alt={review.userName}
                                        w={12}
                                        h={12}
                                        borderRadius="full"
                                        objectFit="cover"
                                        border="2px solid"
                                        borderColor="blue.50"
                                    />
                                    <VStack align="start" gap={0}>
                                        <HStack gap={1.5}>
                                            <Text fontSize="md" fontWeight="black" color="gray.900">
                                                {review.userName}
                                            </Text>
                                            {review.verified && (
                                                <FaCheckCircle color="#3182CE" size={12} />
                                            )}
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                            {review.date}
                                        </Text>
                                    </VStack>
                                </HStack>
                                {review.verified && (
                                    <Badge variant="subtle" colorPalette="blue" rounded="full" px={2} fontSize="10px" textTransform="none">
                                        Verified Booking
                                    </Badge>
                                )}
                            </VStack>

                            <VStack align="stretch" gap={3}>
                                <HStack justify="space-between">
                                    {renderStars(review.rating)}
                                    <HStack gap={2}>
                                        <Text fontSize="xs" color="gray.400" fontWeight="bold">Helpful?</Text>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            rounded="full"
                                            fontSize="10px"
                                            px={3}
                                            borderColor="gray.200"
                                            _hover={{ bg: "blue.50", borderColor: "blue.200", color: "main" }}
                                        >
                                            Yes ({review.helpfulCount || 0})
                                        </Button>
                                    </HStack>
                                </HStack>

                                <Text fontSize="lg" fontWeight="black" color="gray.900" letterSpacing="tight">
                                    {review.title}
                                </Text>

                                <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                                    {review.content}
                                </Text>
                            </VStack>
                        </Grid>
                    </Box>
                ))}
            </VStack>

            {/* Load More Button */}
            {visibleReviews < reviews.length && (
                <Flex justify="center" mt={4}>
                    <Button
                        variant="outline"
                        borderColor="blue.200"
                        color="main"
                        rounded="full"
                        px={10}
                        h={12}
                        fontWeight="black"
                        _hover={{ bg: "main", color: "white", borderColor: "main" }}
                        onClick={handleLoadMore}
                    >
                        Show more reviews
                    </Button>
                </Flex>
            )}
        </VStack>
    );
}

