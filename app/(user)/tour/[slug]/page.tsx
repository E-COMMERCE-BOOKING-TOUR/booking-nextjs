import { Container, Grid, GridItem, VStack, Heading, Box } from "@chakra-ui/react";
import { SearchInput, TourReviews } from "@/components/ui/user";
import TourHeader from "@/components/ui/user/tourHeader";
import TourGalleryWithThumbnails from "@/components/ui/user/tourGalleryWithThumbnails";
import TourSidebar from "@/components/ui/user/tourSidebar";
import TourMapSection from "@/components/ui/user/tourMapSection";
import TourDescription from "@/components/ui/user/tourDescription";
import RelatedToursSwiper from "@/components/ui/user/relatedToursSwiper";
import tourApi, { ITourSession } from "@/apis/tour";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";
import { createTranslation } from "@/libs/i18n";
import { auth } from "@/libs/auth/auth";
import { ITour, ITourVariant, ITourCategory, TourVariantStatus } from "@/types/response/tour.type";

import { ITourPopular } from "@/types/response/tour";

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
    currencySymbol?: string;
    variants: {
        id: number;
        name: string;
        status: TourVariantStatus;
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

const normalizeDetail = (response: ITour): ITour | null => {
    if (!response || typeof response !== "object") return null;
    const payload = "data" in response ? (response as { data: ITour }).data : (response as ITour);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    return typeof (payload as ITour).title === "string" ? (payload as ITour) : null;
};

type RelatedTour = ITourPopular;
type ReviewCategory = ITourCategory & { score?: number; count?: number; average_rating?: number };

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

const getTourData = async (slug: string, guestId?: string, token?: string): Promise<TourData> => {
    try {
        const tourDetailResponse = await tourApi.detail(slug, guestId, token);
        const tourDetail = normalizeDetail(tourDetailResponse);
        if (!tourDetail) notFound();

        return {
            id: tourDetail.id,
            title: tourDetail.title,
            location: tourDetail.address || tourDetail.division?.name || "",
            price: tourDetail.price,
            oldPrice: tourDetail.old_price ?? undefined,
            currencySymbol: tourDetail.currencySymbol,
            rating: tourDetail.score_rating ?? 0,
            reviewCount: tourDetail.reviews?.length ?? 0,
            score: tourDetail.score_rating ?? 0,
            scoreLabel: tourDetail.score_rating && tourDetail.score_rating >= 4 ? "Excellent" : "Good",
            staffScore: tourDetail.staff_score ?? 0,
            images: tourDetail.images ?? [],
            durationDays: tourDetail.duration_days ?? 1,
            slug: tourDetail.slug || slug,
            testimonial: tourDetail.testimonial ?? {
                name: "",
                country: "",
                text: "",
            },
            mapUrl: tourDetail.map_url ?? "",
            mapPreview: tourDetail.map_preview,
            description: tourDetail.description ?? "",
            activity: tourDetail.highlights ?? { title: "", items: [] },
            included: tourDetail.included ?? [],
            notIncluded: tourDetail.not_included ?? [],
            details: {
                language: tourDetail.languages ?? [],
                duration: tourDetail.duration_days ? `${tourDetail.duration_days} days` : "",
                capacity: tourDetail.max_pax ? tourDetail.max_pax.toString() : "",
            },
            meetingPoint: tourDetail.meeting_point ?? "",
            variants:
                tourDetail.variants?.map((v: ITourVariant) => ({
                    id: v.id,
                    name: v.name,
                    status: v.status,
                    tour_variant_pax_type_prices: v.prices.map((p) => ({
                        id: p.id,
                        pax_type_id: p.pax_type_id,
                        price: p.price,
                        pax_type: {
                            id: p.pax_type_id,
                            name: p.pax_type_name,
                        },
                    })),
                    tour_sessions: (v.tour_sessions || []).map(s => ({
                        id: s.id,
                        date: s.session_date.toString(),
                        start_time: s.start_time?.toString(),
                        end_time: s.end_time?.toString(),
                        status: s.status as 'open' | 'full' | 'closed',
                        capacity_available: s.capacity || 0,
                        price: 0, // price not directly on session in ITour
                    })),
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
    const cookieStore = await cookies();
    const session = await auth();
    const token = session?.user?.accessToken;
    const guestId = undefined; // Cookies for guestId not yet implemented for server-side

    const lng = cookieStore.get(cookieName)?.value || fallbackLng;
    const { t } = await createTranslation(lng);

    const [tour, relatedTours, reviewCategories] = await Promise.all([
        getTourData(slug, guestId, token),
        safeGet(() => tourApi.related(slug), [] as RelatedTour[]),
        safeGet(() => tourApi.reviewCategories(slug), [] as ReviewCategory[]),
    ]);

    if (!tour) {
        notFound();
    }
    console.log(tour.price, tour)
    return (
        <>
            <VStack borderBottomRadius="calc(100vw / 16)" backgroundColor="white" paddingBottom="calc(100vw / 24)" position="relative" zIndex={2}>
                <Container maxW="xl" mx="auto" px={4}>
                    <SearchInput defaultDestination={tour.location} lng={lng} />

                    <Box mt={4}>
                        <TourHeader
                            breadcrumbItems={[
                                { label: t("home"), href: "/" },
                                { label: t("tours"), href: "/tour/list" },
                                { label: tour.location, href: "#" },
                            ]}
                            title={tour.title}
                            location={tour.location}
                            rating={tour.rating}
                            price={tour.price}
                            oldPrice={tour.oldPrice}
                            currencySymbol={tour.currencySymbol}
                            slug={slug}
                            variants={tour.variants}
                            durationDays={tour.details.duration ? parseInt(tour.details.duration) : 1}
                            lng={lng}
                        />

                        <Grid templateColumns={{ base: "1fr", md: "repeat(8, 1fr)" }} gap={5} mt={8}>
                            <GridItem colSpan={6}>
                                <TourGalleryWithThumbnails images={tour.images} lng={lng} />
                            </GridItem>

                            <GridItem as={VStack} colSpan={2} gap={4}>
                                <TourSidebar
                                    score={tour.score}
                                    scoreLabel={tour.scoreLabel}
                                    reviewCount={tour.reviewCount}
                                    staffScore={tour.staffScore}
                                    testimonial={tour.testimonial}
                                    lng={lng}
                                />
                                <TourMapSection mapUrl={tour.mapUrl} previewImage={tour.mapPreview} lng={lng} />
                            </GridItem>
                        </Grid>
                    </Box>
                </Container>
            </VStack >

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
                            lng={lng}
                        />
                    </GridItem>

                    <GridItem colSpan={1}>
                        <VStack align="stretch" gap={8} pos="sticky" top="100px">
                            {/* You can add a floating booking card or other info here */}
                        </VStack>
                    </GridItem>
                </Grid>

                <VStack align="stretch" gap={10}>
                    <Box>
                        <Heading as="h2" size="2xl" fontWeight="black" mb={8} letterSpacing="tight">
                            {t("related_tours")}
                        </Heading>
                        <RelatedToursSwiper tours={relatedTours.map(t => ({ ...t, id: t.id.toString() }))} lng={lng} />
                    </Box>

                    <Box id="reviews" pt={10} borderTop="1px solid" borderColor="gray.100">
                        <TourReviews
                            tourId={tour.id}
                            averageRating={tour.rating}
                            totalReviews={tour.reviewCount}
                            categories={reviewCategories.map((c: ReviewCategory) => ({
                                name: c.name,
                                score: c.average_rating || 0
                            }))}
                            lng={lng}
                        />
                    </Box>
                </VStack>
            </Container>
        </>
    );
}
