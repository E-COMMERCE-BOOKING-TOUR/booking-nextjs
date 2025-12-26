"use client";

import {
    Box,
    Badge,
    Textarea,
    HStack,
    VStack,
    Heading,
    Text,
    Button,
    Input,
    Grid,
    Progress,
    Flex,
    Avatar,
    Select,
    NativeSelect,
} from "@chakra-ui/react";
import { FaStar, FaSearch, FaCheckCircle, FaThumbsUp, FaFlag } from "react-icons/fa";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import tourApi from "@/apis/tour";
import { toaster } from "@/components/chakra/toaster";
import ReviewForm from "./ReviewForm";

interface Review {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    title: string;
    content: string;
    verified: boolean;
    helpful_count: number;
    is_reported: boolean;
    is_helpful: boolean;
    user?: {
        full_name: string;
        avatar: string;
    }
    created_at?: string;
}

interface ReviewCategory {
    label?: string;
    name?: string;
    score: number;
}

interface TourReviewsProps {
    averageRating: number;
    totalReviews: number;
    categories: ReviewCategory[];
}

export default function TourReviews({
    tourId,
    averageRating,
    totalReviews,
    categories,
}: TourReviewsProps & { tourId: number }) {
    const { data: session, status } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [visibleReviews, setVisibleReviews] = useState(5);
    const [isWritingReview, setIsWritingReview] = useState(false);

    const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
        queryKey: ['reviews', tourId, token],
        queryFn: () => tourApi.getReviewsByTourId(tourId, token),
        enabled: !!tourId && status !== "loading",
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
    });

    const markHelpfulMutation = useMutation({
        mutationFn: (reviewId: string) => tourApi.markReviewHelpful(Number(reviewId), token),
        onSuccess: () => {
            toaster.create({
                title: "Thành công",
                description: "Đã đánh dấu là hữu ích",
                type: "success",
            });
            queryClient.invalidateQueries({ queryKey: ['reviews', tourId] });
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Lỗi",
                description: error?.message || "Không thể thực hiện",
                type: "error",
            });
        }
    });

    const reportReviewMutation = useMutation({
        mutationFn: (reviewId: string) => tourApi.reportReview(Number(reviewId), token),
        onSuccess: () => {
            toaster.create({
                title: "Báo cáo",
                description: "Đã gửi báo cáo đánh giá",
                type: "success",
            });
            queryClient.invalidateQueries({ queryKey: ['reviews', tourId] });
        },
        onError: (error: Error) => {
            toaster.create({
                title: "Lỗi",
                description: error?.message || "Không thể báo cáo",
                type: "error",
            });
        }
    });

    const handleMarkHelpful = (reviewId: string) => {
        if (!session) {
            toaster.create({
                title: "Yêu cầu đăng nhập",
                description: "Vui lòng đăng nhập để bình chọn",
                type: "warning",
            });
            return;
        }
        markHelpfulMutation.mutate(reviewId);
    };

    const handleReportReview = (review: Review) => {
        if (!session) {
            toaster.create({
                title: "Yêu cầu đăng nhập",
                description: "Vui lòng đăng nhập để báo cáo",
                type: "warning",
            });
            return;
        }
        if (review.is_reported) {
            toaster.create({
                title: "Đã báo cáo",
                description: "Đánh giá này đã được báo cáo trước đó",
                type: "info",
            });
            return;
        }
        reportReviewMutation.mutate(review.id);
    };

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

    const [sortBy, setSortBy] = useState("recommended");
    const [ratingFilter, setRatingFilter] = useState("all");

    const handleLoadMore = () => {
        setVisibleReviews((prev) => prev + 5);
    };

    // Filter and Sort logic
    const filteredReviews = useMemo(() => {
        let result = [...reviews];

        // Apply rating filter
        if (ratingFilter !== "all") {
            const ratingNum = parseInt(ratingFilter);
            result = result.filter(r => r.rating === ratingNum);
        }

        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === "recommended") {
                return (b.helpful_count || 0) - (a.helpful_count || 0);
            }
            if (sortBy === "recent") {
                const dateA = new Date(a.created_at || a.date).getTime();
                const dateB = new Date(b.created_at || b.date).getTime();
                return dateB - dateA;
            }
            if (sortBy === "highest") {
                return b.rating - a.rating;
            }
            if (sortBy === "lowest") {
                return a.rating - b.rating;
            }
            return 0;
        });

        return result;
    }, [reviews, sortBy, ratingFilter]);

    // Reset visible reviews when filter changes
    const onFilterChange = (type: "sort" | "rating", value: string) => {
        if (type === "sort") setSortBy(value);
        else setRatingFilter(value);
        setVisibleReviews(5);
    };

    return (
        <VStack align="stretch" gap={8}>
            <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                    <Heading as="h2" size="xl" fontWeight="black" letterSpacing="tight">
                        Guest reviews
                    </Heading>
                    <Text color="gray.500" fontSize="sm">What people are saying about this tour</Text>
                </VStack>
                {session?.user && (
                    <Button
                        bg="main"
                        color="white"
                        onClick={() => setIsWritingReview(!isWritingReview)}
                        _hover={{ bg: "blue.700" }}
                    >
                        {isWritingReview ? "Cancel Review" : "Write a Review"}
                    </Button>
                )}
            </HStack>

            {isWritingReview && (
                <ReviewForm
                    tourId={tourId}
                    onSuccess={() => setIsWritingReview(false)}
                    onCancel={() => setIsWritingReview(false)}
                />
            )}

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

                <Flex bg="white" p={8} rounded="3xl" border="1px solid" borderColor="gray.100" shadow="sm">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gapX={12} gapY={5} w="full">
                        {categories.map((category, idx) => (
                            <HStack key={idx} gap={4} justify="space-between">
                                <Text fontSize="sm" fontWeight="black" color="gray.700" flex={1}>
                                    {category.label || category.name}
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
                </Flex>
            </Grid>

            {/* Filters */}
            <Box bg="gray.50" p={6} rounded="2xl">
                <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr 120px" }}
                    gap={4}
                    alignItems="center"
                >
                    <NativeSelect.Root>
                        <NativeSelect.Field borderRadius="xl" bg="white" value={sortBy} onChange={(e) => onFilterChange("sort", e.target.value)}>
                            <option value="recommended">Recommended</option>
                            <option value="recent">Most Recent</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </NativeSelect.Field>
                    </NativeSelect.Root>

                    <NativeSelect.Root>
                        <NativeSelect.Field borderRadius="xl" bg="white" value={ratingFilter} onChange={(e) => onFilterChange("rating", e.target.value)}>
                            <option value="all">Rating: All</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </NativeSelect.Field>

                    </NativeSelect.Root>
                </Grid>
            </Box>

            {/* Reviews List */}
            <VStack align="stretch" gap={0}>
                {isReviewsLoading ? (
                    <Text textAlign="center" py={10} color="gray.500">Loading reviews...</Text>
                ) : (
                    <>
                        {filteredReviews.slice(0, visibleReviews).map((review: Review) => (
                            <Box
                                key={review.id}
                                py={8}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                _last={{ borderBottom: "none" }}
                            >
                                <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8} alignItems="center">
                                    <VStack align="start" gap={3}>
                                        <HStack gap={3}>
                                            <Avatar.Root>
                                                <Avatar.Fallback name={review.user?.full_name || review.userName} />
                                                <Avatar.Image src={review.user?.avatar || review.userAvatar} />
                                            </Avatar.Root>
                                            <VStack align="start" gap={0}>
                                                <HStack gap={1.5}>
                                                    <Text fontSize="sm" fontWeight="bold" color="gray.900">
                                                        {review.user?.full_name || review.userName}
                                                    </Text>
                                                    {/* Assuming verified status needs to come from backend, default to false if missing */}
                                                    {review.verified && (
                                                        <FaCheckCircle color="#3182CE" size={12} />
                                                    )}
                                                </HStack>
                                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                                    {new Date(review.created_at || review.date).toLocaleDateString()}
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
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    color={review.is_helpful ? "blue.500" : "gray.400"}
                                                    bg={review.is_helpful ? "blue.50" : "transparent"}
                                                    onClick={() => handleMarkHelpful(review.id)}
                                                    loading={markHelpfulMutation.isPending && markHelpfulMutation.variables === review.id}
                                                >
                                                    <FaThumbsUp /> ({review.helpful_count || 0})
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    color={review.is_reported ? "red.500" : "gray.400"}
                                                    onClick={() => handleReportReview(review)}
                                                    loading={reportReviewMutation.isPending && reportReviewMutation.variables === review.id}
                                                >
                                                    <FaFlag />
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
                        {filteredReviews.length === 0 && (
                            <Text textAlign="center" py={10} color="gray.500">No reviews yet. Be the first to write one!</Text>
                        )}
                    </>
                )}
            </VStack>

            {/* Load More Button */}
            {visibleReviews < filteredReviews.length && (
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

