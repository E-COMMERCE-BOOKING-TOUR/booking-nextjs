import { Container, Grid, GridItem, VStack, Heading, Box } from "@chakra-ui/react";
import { SearchInput, TourReviews } from "@/components/ui/user";
import Breadcrumb from "@/components/ui/user/breadcrumb";
import TourHeader from "@/components/ui/user/tourHeader";
import TourGalleryWithThumbnails from "@/components/ui/user/tourGalleryWithThumbnails";
import TourSidebar from "@/components/ui/user/tourSidebar";
import TourMapSection from "@/components/ui/user/tourMapSection";
import TourDescription from "@/components/ui/user/tourDescription";
import RelatedToursSwiper from "@/components/ui/user/relatedToursSwiper";
import tourApi from "@/apis/tour";
import { notFound } from 'next/navigation'

interface TourDetailPageProps {
    params: Promise<{ slug: string }>;
}

interface TourData {
    title: string;
    location: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviewCount: number;
    score: number;
    scoreLabel: string;
    staffScore: number;
    images: string[];
    testimonial?: {
        name: string;
        country: string;
        text: string;
    };
    mapUrl: string;
    mapPreview?: string;
    description: string;
    activity?: {
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
    variants: {
        id: number;
        name: string;
        status: string;
        prices: {
            id: number;
            pax_type_id: number;
            price: number;
            pax_type_name: string;
        }[];
    }[];
}

interface RelatedTour {
    id: string;
    image: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    ratingText: string;
    capacity: string;
    originalPrice: number;
    currentPrice: number;
    tags: string[];
    slug: string;
}

interface Review {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    title: string;
    content: string;
    verified: boolean;
}

interface ReviewCategory {
    label: string;
    score: number;
}

function normalizeTourDetailResponse(response: unknown): any | null {
    if (!response) {
        return null;
    }

    const detailPayload =
        typeof response === "object" &&
            response !== null &&
            "data" in response &&
            !Array.isArray((response as { data?: unknown }).data)
            ? (response as { data?: any }).data
            : response;

    if (
        !detailPayload ||
        typeof detailPayload !== "object" ||
        Array.isArray(detailPayload)
    ) {
        return null;
    }

    const detail = detailPayload as any;
    const hasMinimalFields =
        typeof detail.title === "string" && detail.title.trim().length > 0;

    return hasMinimalFields ? detail : null;
}

function extractStatusCode(error: unknown): number | undefined {
    if (typeof error === "object" && error !== null) {
        const structuredError = error as {
            response?: { status?: number };
            status?: number;
        };
        return structuredError.response?.status ?? structuredError.status;
    }
    return undefined;
}

async function getTourData(slug: string): Promise<TourData> {
    try {
        const tourDetailResponse = await tourApi.detail(slug);
        const tourDetail = normalizeTourDetailResponse(tourDetailResponse);

        if (!tourDetail) {
            notFound();
        }

        return {
            title: tourDetail.title,
            location: tourDetail.location,
            price: tourDetail.price ?? 0,
            oldPrice: tourDetail.oldPrice,
            rating: tourDetail.rating ?? 0,
            reviewCount: tourDetail.reviewCount ?? 0,
            score: tourDetail.score ?? 0,
            scoreLabel: tourDetail.scoreLabel ?? "",
            staffScore: tourDetail.staffScore ?? 0,
            images: tourDetail.images ?? [],
            testimonial: tourDetail.testimonial ?? {
                name: "",
                country: "",
                text: "",
            },
            mapUrl: tourDetail.mapUrl ?? "",
            mapPreview: tourDetail.mapPreview,
            description: tourDetail.description ?? "",
            activity: tourDetail.activity ?? { title: "", items: [] },
            included: tourDetail.included ?? [],
            notIncluded: tourDetail.notIncluded ?? [],
            details: tourDetail.details ?? {
                language: [],
                duration: "",
                capacity: "",
            },
            meetingPoint: tourDetail.meetingPoint ?? "",
            variants: tourDetail.variants?.map((v: any) => ({
                id: v.id,
                name: v.name,
                status: v.status,
                prices: v.prices.map((p: any) => ({
                    id: p.id,
                    pax_type_id: p.pax_type_id,
                    price: p.price,
                    pax_type_name: p.pax_type_name
                }))
            })) || [],
        };
    } catch (error: unknown) {
        console.error("Error fetching tour data:", error);
        const statusCode = extractStatusCode(error);
        if (statusCode === 404) {
            notFound();
        }
        throw error;
    }
}

async function getReviews(slug: string): Promise<Review[]> {
    try {
        const reviews = await tourApi.reviews(slug);
        return reviews;
    } catch (error: unknown) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

async function getReviewCategories(slug: string): Promise<ReviewCategory[]> {
    try {
        const categories = await tourApi.reviewCategories(slug);
        return categories;
    } catch (error: unknown) {
        console.error("Error fetching review categories:", error);
        return [];
    }
}

async function getRelatedTours(slug: string): Promise<RelatedTour[]> {
    try {
        const relatedTours = await tourApi.related(slug);
        return relatedTours;
    } catch (error: unknown) {
        console.error("Error fetching related tours:", error);
        return [];
    }
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
    const { slug } = await params;
    const [tour, relatedTours, reviews, reviewCategories] = await Promise.all([
        getTourData(slug),
        getRelatedTours(slug),
        getReviews(slug),
        getReviewCategories(slug),
    ]);

    if (!tour) {
        notFound();
    }

    return (
        <Container maxW="7xl" mx="auto" px={4} py={6}>
            <SearchInput defaultDestination={tour.location} />

            <Box bg="white" rounded="25px" p={4}>
                <Breadcrumb
                    items={[
                        { label: "Projects", href: "/projects" },
                        { label: "Projects", href: "/projects" },
                        { label: "Task 1", href: "#" },
                    ]}
                />

                <TourHeader
                    title={tour.title}
                    location={tour.location}
                    rating={tour.rating}
                    price={tour.price}
                    oldPrice={tour.oldPrice}
                    slug={slug}
                    variants={tour.variants}
                />

                <Grid templateColumns={{ base: "repeat(4, 1fr)", lg: "repeat(4, 1fr)" }} gap={2} mt={6}>
                    <GridItem colSpan={3}>
                        <TourGalleryWithThumbnails images={tour.images} />
                    </GridItem>

                    <GridItem as={VStack} colSpan={1} gap={2} height="100%">
                        <TourSidebar
                            score={tour.score}
                            scoreLabel={tour.scoreLabel}
                            reviewCount={tour.reviewCount}
                            staffScore={tour.staffScore}
                            testimonial={tour.testimonial}
                        />
                        <TourMapSection mapUrl={tour.mapUrl} previewImage={tour.mapPreview} />
                    </GridItem>
                </Grid>
            </Box>

            {/* Description */}
            <Box bg="white" rounded="25px" p={4} mt={6}>
                <TourDescription
                    description={tour.description}
                    activity={tour.activity ?? { title: "", items: [] }}
                    included={tour.included}
                    notIncluded={tour.notIncluded}
                    details={tour.details}
                    meetingPoint={tour.meetingPoint}
                />

                {/* Related Tours */}
                <VStack align="stretch" gap={6} mt={12} mb={8}>
                    <Heading as="h2" size="xl" fontWeight="bold">
                        Related tours in London
                    </Heading>
                    <RelatedToursSwiper tours={relatedTours} />
                </VStack>
            </Box>

            {/* Comments */}
            <Box bg="white" rounded="25px" p={4} mt={6}>
                <TourReviews
                    averageRating={tour.rating}
                    totalReviews={tour.reviewCount}
                    categories={reviewCategories}
                    reviews={reviews}
                />
            </Box>
        </Container>
    );
}
