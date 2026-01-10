import { Container, Grid, GridItem, VStack, Heading, Box } from "@chakra-ui/react";
import { SearchInput, TourReviews } from "@/components/ui/user";
import TourHeader, { TourHeaderVariant } from "@/components/ui/user/tourHeader";
import TourGalleryWithThumbnails from "@/components/ui/user/tourGalleryWithThumbnails";
import TourSidebar from "@/components/ui/user/tourSidebar";
import TourMapSection from "@/components/ui/user/tourMapSection";
import TourDescription from "@/components/ui/user/tourDescription";
import RelatedToursSwiper from "@/components/ui/user/relatedToursSwiper";
import tourApi from "@/apis/tour";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/libs/auth/auth";
import { IUserTourDetail, IUserTourRelated, IUserTourReviewCategory, ITourTestimonial, ITourActivity } from "@/types/response/tour.type";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const tourDetail = await tourApi.detail(slug);
        return {
            title: `${tourDetail.title} | Travel`,
            description: tourDetail.location + ' - ' + (tourDetail.description?.substring(0, 160) || ''),
            openGraph: {
                images: tourDetail.images?.[0] ? [tourDetail.images[0]] : [],
            }
        };
    } catch {
        return {
            title: 'Tour Details | Travel',
        };
    }
}

/**
 * Local type for tour data used within this page
 * Reuses TourHeaderVariant for variants to ensure type consistency with TourHeader component
 */
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
    testimonial?: ITourTestimonial;
    mapUrl: string;
    mapPreview?: string;
    description: string;
    activity?: ITourActivity;
    included: string[];
    notIncluded: string[];
    details: {
        language: string[];
        duration: string;
        capacity: string;
    };
    meetingPoint: string;
    currencySymbol?: string;
    variants: TourHeaderVariant[];
};

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

/**
 * Transform API response to component-friendly format
 */
const getTourData = async (slug: string, guestId?: string, token?: string): Promise<TourData> => {
    try {
        const tourDetail: IUserTourDetail = await tourApi.detail(slug, guestId, token);

        if (!tourDetail) {
            notFound();
        }

        return {
            id: tourDetail.id,
            title: tourDetail.title,
            location: tourDetail.location,
            price: tourDetail.price,
            oldPrice: tourDetail.oldPrice,
            currencySymbol: tourDetail.currencySymbol,
            rating: tourDetail.rating,
            reviewCount: tourDetail.reviewCount,
            score: tourDetail.score,
            scoreLabel: tourDetail.scoreLabel,
            staffScore: tourDetail.staffScore,
            images: tourDetail.images,
            durationDays: tourDetail.durationDays,
            slug: tourDetail.slug,
            testimonial: tourDetail.testimonial,
            mapUrl: tourDetail.mapUrl,
            mapPreview: tourDetail.mapPreview,
            description: tourDetail.description,
            activity: tourDetail.activity,
            included: tourDetail.included,
            notIncluded: tourDetail.notIncluded,
            details: {
                language: tourDetail.details.language,
                duration: tourDetail.details.duration,
                capacity: tourDetail.details.capacity,
            },
            meetingPoint: tourDetail.meetingPoint || "",
            variants: tourDetail.variants.map((v) => ({
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
                tour_sessions: [], // Sessions are loaded separately via API
            })),
        };
    } catch (error) {
        console.error("Error fetching tour data:", error);
        if (statusCodeOf(error) === 404) notFound();
        throw error;
    }
};

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale: lng } = await params;
    const session = await auth();
    const token = session?.user?.accessToken;
    const guestId = undefined; // Cookies for guestId not yet implemented for server-side

    const t = await getTranslations('common');

    const [tour, relatedTours, reviewCategories] = await Promise.all([
        getTourData(slug, guestId, token),
        safeGet(() => tourApi.related(slug), [] as IUserTourRelated[]),
        safeGet(() => tourApi.reviewCategories(slug), [] as IUserTourReviewCategory[]),
    ]);

    if (!tour) {
        notFound();
    }

    return (
        <>
            <VStack mt={10} borderBottomRadius="calc(100vw / 16)" backgroundColor="white" paddingBottom="calc(100vw / 24)" position="relative" zIndex={2}>
                <Container maxW="xl" mx="auto" px={4}>
                    <SearchInput defaultDestination={tour.location} />

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
                            durationDays={tour.durationDays}
                            durationText={tour.details.duration}
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
                        <RelatedToursSwiper tours={relatedTours.map(t => ({ ...t, id: t.id.toString() }))} />
                    </Box>

                    <Box id="reviews" pt={10} borderTop="1px solid" borderColor="gray.100">
                        <TourReviews
                            tourId={tour.id}
                            averageRating={tour.rating}
                            totalReviews={tour.reviewCount}
                            categories={reviewCategories.map((c: IUserTourReviewCategory) => ({
                                name: c.label,
                                score: c.score
                            }))}
                        />
                    </Box>
                </VStack>
            </Container>
        </>
    );
}
