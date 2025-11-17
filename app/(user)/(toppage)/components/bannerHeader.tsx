import Banner from '@/components/ui/user/banner';
import { Box, Carousel, Grid, GridItem, Image } from "@chakra-ui/react"

export default function BannerHeader() {
  return (
    <Banner>
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <CarouselBanner items={["/assets/images/banner-1.png", "/assets/images/banner-2.png"]} />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 1 }}>
          <CarouselBanner items={["/assets/images/banner-small-1.png", "/assets/images/banner-small-2.png"]} />
        </GridItem>
      </Grid>
    </Banner>
  );
}

const CarouselBanner = ({ items }: { items: string[] }) => {
  return (
    <Carousel.Root slideCount={items.length} maxW="100%" mx="auto" allowMouseDrag autoplay={{ delay: 5000 }} loop={true}>
      <Carousel.ItemGroup>
        {items.map((item, index) => (
          <Carousel.Item key={index} index={index}>
            <Image src={item} alt={`Banner ${index + 1}`} width="100%" height="300px" objectFit="cover" borderRadius="25px" />
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <Box position="absolute" bottom="6" width="full">
        <Carousel.Indicators
          transition="width 0.2s ease-in-out"
          transformOrigin="center"
          opacity="0.5"
          boxSize="2"
          _current={{ width: "10", bg: "colorPalette.subtle", opacity: 1 }}
        />
      </Box>
    </Carousel.Root>
  );
}