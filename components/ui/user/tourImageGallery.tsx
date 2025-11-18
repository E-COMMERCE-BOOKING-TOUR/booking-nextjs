"use client";

import { Box, Grid, Image, VStack } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface TourImageGalleryProps {
    images: string[];
}

export default function TourImageGallery({ images }: TourImageGalleryProps) {
    return (
        <Grid templateColumns="2fr 1fr" gap={2} height="500px">
            <Box borderRadius="xl" overflow="hidden" height="100%">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    loop
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

            <VStack gap={2} height="100%">
                {[1, 2].map((idx) => (
                    <Box key={idx} borderRadius="xl" overflow="hidden" height="50%">
                        <Image
                            src={images[idx] || images[0]}
                            alt={`Tour image ${idx + 1}`}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                        />
                    </Box>
                ))}
            </VStack>
        </Grid>
    );
}


