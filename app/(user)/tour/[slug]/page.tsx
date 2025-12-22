import { Container, Grid, GridItem, VStack, Heading, Box } from "@chakra-ui/react";
import { SearchInput, TourReviews } from "@/components/ui/user";
import Breadcrumb from "@/components/ui/user/breadcrumb";
import TourHeader from "@/components/ui/user/tourHeader";
import TourGalleryWithThumbnails from "@/components/ui/user/tourGalleryWithThumbnails";
import TourSidebar from "@/components/ui/user/tourSidebar";
import TourMapSection from "@/components/ui/user/tourMapSection";
import TourDescription from "@/components/ui/user/tourDescription";
import RelatedToursSwiper from "@/components/ui/user/relatedToursSwiper";
import tourApi, { ITourSession } from "@/apis/tour";
import { notFound } from "next/navigation";

type TourData = {
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
        tour_variant_pax_type_prices: {
            id: number;
            pax_type_id: number;
            price: number;
            pax_type: {
                id: number;
                name: string;
            };
        }[];
        tour_sessions: ITourSession[]; // Add this
    }[];
};

const normalizeDetail = (response: unknown): TourData | null => {
    if (!response || typeof response !== "object" || Array.isArray(response)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = "data" in response ? (response as any).data : response;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof (payload as any).title === "string" ? payload : null;
};

type RelatedTour = any;
type Review = any;
type ReviewCategory = any;

const statusCodeOf = (error: unknown): number | undefined => {
    if (typeof error === "object" && error !== null) {
        const e = error as { response?: { status?: number }; status?: number };
        return e.response?.status ?? e.status;
    }
};

const safeGet = async <T,>(fn: () => Promise<T>, fallback: T) => {
    try {
        return await fn();
    } catch (error) {
        console.error("Fetch failed:", error);
        return fallback;
    }
};

const getTourData = async (slug: string): Promise<TourData> => {
    try {
        const tourDetailResponse = await tourApi.detail(slug);
        const tourDetail = normalizeDetail(tourDetailResponse);
        if (!tourDetail) notFound();

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
            variants:
                tourDetail.variants?.map((v: { id: number; name: string; status: string; tour_variant_pax_type_prices?: any[]; prices?: any[]; tour_sessions?: any[] }) => ({
                    id: v.id,
                    name: v.name,
                    status: v.status,
                    tour_variant_pax_type_prices: (v.tour_variant_pax_type_prices || v.prices || []).map((p: { id: number; pax_type_id: number; price: number; pax_type_name?: string; pax_type?: { id: number; name: string } }) => ({
                        id: p.id,
                        pax_type_id: p.pax_type_id,
                        price: p.price,
                        pax_type: {
                            id: p.pax_type_id,
                            name: p.pax_type_name || p.pax_type?.name || '',
                        },
                    })),
                    tour_sessions: v.tour_sessions || [],
                })) || [],
        };
    } catch (error) {
        console.error("Error fetching tour data:", error);
        if (statusCodeOf(error) === 404) notFound();
        throw error;
    }
};

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [tour, relatedTours, reviews, reviewCategories] = await Promise.all([
        getTourData(slug),
        safeGet(() => tourApi.related(slug), [] as RelatedTour[]),
        safeGet(() => tourApi.reviews(slug), [] as Review[]),
        safeGet(() => tourApi.reviewCategories(slug), [] as ReviewCategory[]),
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
                    durationDays={tour.details.duration ? parseInt(tour.details.duration) : 1} // Fallback parsing or use tour.durationDays if mapped
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

            <Box bg="white" rounded="25px" p={4} mt={6}>
                <TourDescription
                    description={tour.description}
                    activity={tour.activity ?? { title: "", items: [] }}
                    included={tour.included}
                    notIncluded={tour.notIncluded}
                    details={tour.details}
                    meetingPoint={tour.meetingPoint}
                />

                <VStack align="stretch" gap={6} mt={12} mb={8}>
                    <Heading as="h2" size="xl" fontWeight="bold">
                        Related tours in London
                    </Heading>
                    <RelatedToursSwiper tours={relatedTours} />
                </VStack>
            </Box>

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
