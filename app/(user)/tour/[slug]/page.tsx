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
    id: number;
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
    durationDays: number;
    slug: string;
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

const normalizeDetail = (response: unknown): any | null => {
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
            id: tourDetail.id,
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
            durationDays: tourDetail.durationDays ?? 1,
            slug: tourDetail.slug || slug,
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
    const [tour, relatedTours, reviewCategories] = await Promise.all([
        getTourData(slug),
        safeGet(() => tourApi.related(slug), [] as RelatedTour[]),
        safeGet(() => tourApi.reviewCategories(slug), [] as ReviewCategory[]),
    ]);

    if (!tour) {
        notFound();
    }

    return (
        <>
            <VStack borderBottomRadius="calc(100vw / 16)" backgroundColor="white" paddingBottom="calc(100vw / 24)" position="relative" zIndex={2}>
                <Container maxW="xl" mx="auto" px={4}>
                    <SearchInput defaultDestination={tour.location} />

                    <Box mt={4}>
                        <TourHeader
                            breadcrumbItems={[
                                { label: "Home", href: "/" },
                                { label: "Tours", href: "/tours" },
                                { label: tour.location, href: "#" },
                            ]}
                            title={tour.title}
                            location={tour.location}
                            rating={tour.rating}
                            price={tour.price}
                            oldPrice={tour.oldPrice}
                            slug={slug}
                            variants={tour.variants}
                            durationDays={tour.details.duration ? parseInt(tour.details.duration) : 1}
                        />

                        <Grid templateColumns={{ base: "1fr", md: "repeat(8, 1fr)" }} gap={5} mt={8}>
                            <GridItem colSpan={6}>
                                <TourGalleryWithThumbnails images={tour.images} />
                            </GridItem>

                            <GridItem as={VStack} colSpan={2} gap={4}>
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
                </Container>
            </VStack>

            <Container maxW="xl" mx="auto" px={4} py={12}>
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={12}>
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <TourDescription
                            description={tour.description}
                            activity={tour.activity ?? { title: "", items: [] }}
                            included={tour.included}
                            notIncluded={tour.notIncluded}
                            details={tour.details}
                            meetingPoint={tour.meetingPoint}
                        />
                    </GridItem>

                    <GridItem colSpan={1}>
                        <VStack align="stretch" gap={8} pos="sticky" top="100px">
                            {/* You can add a floating booking card or other info here */}
                        </VStack>
                    </GridItem>
                </Grid>

                <VStack align="stretch" gap={10} mt={20}>
                    <Box>
                        <Heading as="h2" size="2xl" fontWeight="black" mb={8} letterSpacing="tight">
                            Related tours
                        </Heading>
                        <RelatedToursSwiper tours={relatedTours} />
                    </Box>

                    <Box id="reviews" pt={10} borderTop="1px solid" borderColor="gray.100">
                        <TourReviews
                            tourId={tour.id}
                            averageRating={tour.rating}
                            totalReviews={tour.reviewCount}
                            categories={reviewCategories}
                        />
                    </Box>
                </VStack>
            </Container>
        </>
    );
}
