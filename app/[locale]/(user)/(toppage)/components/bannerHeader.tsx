"use client";

import { Box, Grid, GridItem, Image } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface BannerHeaderProps {
  banners_square?: string[] | null;
  banners_rectangle?: string[] | null;
}

export default function BannerHeader({ banners_square, banners_rectangle }: BannerHeaderProps) {
  // Default placeholders
  const rectItems = banners_rectangle && banners_rectangle.length > 0
    ? banners_rectangle
    : ["/assets/images/banner-1.png", "/assets/images/banner-2.png"];

  const squareItems = banners_square && banners_square.length > 0
    ? banners_square
    : ["/assets/images/banner-small-1.png", "/assets/images/banner-small-2.png"];

  return (
    <Box py={8} width="100%" overflow="hidden">
      <Grid
        templateColumns={{ base: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr)" }}
        gap={6}
        width="100%"
      >
        <GridItem minWidth={0}>
          <SwiperBanner items={rectItems} height={{ base: "180px", sm: "250px", md: "350px" }} />
        </GridItem>
        <GridItem display={{ base: "none", md: "block" }} minWidth={0}>
          <SwiperBanner items={squareItems} height="350px" />
        </GridItem>
      </Grid>
    </Box>
  );
}

const SwiperBanner = ({ items, height }: { items: string[], height: string | Record<string, string> }) => {
  return (
    <Box
      width="100%"
      height={height}
      borderRadius={{ base: "20px", md: "30px" }}
      overflow="hidden"
      position="relative"
      className="swiper-container-custom"
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        pagination={{
          clickable: true,
          bulletClass: 'custom-bullet',
          bulletActiveClass: 'custom-bullet-active',
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        style={{ width: '100%', height: '100%' }}
        onInit={(swiper) => {
          setTimeout(() => swiper.update(), 100);
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={index} style={{ width: '100%', height: '100%' }}>
            <Box width="100%" height="100%" position="relative">
              <Image
                src={item}
                alt={`Banner ${index + 1}`}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}