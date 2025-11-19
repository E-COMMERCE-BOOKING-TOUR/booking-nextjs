"use client";

import { Box } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import TourItem from "./tourItem";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface RelatedTour {
    id: string;
    image: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    ratingText: string;
    capacity: string;
    originalPrice?: number;
    currentPrice: number;
    tags: string[];
    slug: string;
}

interface RelatedToursSwiperProps {
    tours: RelatedTour[];
}

export default function RelatedToursSwiper({ tours }: RelatedToursSwiperProps) {
    return (
        <Box position="relative" width="100%">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                }}
                style={{ paddingBottom: "40px" }}
            >
                {tours.map((tour) => (
                    <SwiperSlide key={tour.id}>
                        <TourItem
                            image={tour.image}
                            title={tour.title}
                            location={tour.location}
                            rating={tour.rating}
                            reviews={tour.reviews}
                            ratingText={tour.ratingText}
                            capacity={tour.capacity}
                            originalPrice={tour.originalPrice}
                            currentPrice={tour.currentPrice}
                            tags={tour.tags}
                            slug={tour.slug}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
}

