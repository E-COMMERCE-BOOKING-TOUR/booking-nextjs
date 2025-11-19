"use client";

import { Box, VStack, Image } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Thumbs } from "swiper/modules";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

interface TourGalleryWithThumbnailsProps {
    images: string[];
}

export default function TourGalleryWithThumbnails({ images }: TourGalleryWithThumbnailsProps) {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <VStack gap={2} align="stretch">
            <Box borderRadius="xl" overflow="hidden" height="500px">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, Thumbs]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    style={{ height: "100%" }}
                >
                    {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <Image
                                src={img}
                                alt={`Tour image ${idx + 1}`}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            <Box>
                <Swiper
                    modules={[Thumbs]}
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={4}
                    watchSlidesProgress
                    style={{ height: "100px" }}
                >
                    {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <Box
                                borderRadius="lg"
                                overflow="hidden"
                                height="100px"
                                cursor="pointer"
                                border={activeIndex === idx ? "3px solid" : "3px solid transparent"}
                                borderColor={activeIndex === idx ? "blue.500" : "transparent"}
                                transition="all 0.3s"
                                _hover={{ opacity: 0.8 }}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    width="100%"
                                    height="100%"
                                    objectFit="cover"
                                />
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
        </VStack>
    );
}

