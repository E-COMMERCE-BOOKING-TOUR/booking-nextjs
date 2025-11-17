import { Box, Container, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react';
import { SearchInput, TourItem, ArticleItem, TravelList, HeaderList } from '@/components/ui/user';
import { auth } from '@/libs/auth/auth';
import Header from './components/header';
import RecentSearch from './components/recentSearch';
import BannerHeader from './components/bannerHeader';
import { Diagonal } from '@/components/layout/user';

export default async function TopPage() {
  const session = await auth();
  return (
    <>
      <Container maxW="2xl" mx="auto">
        <Header />
        <SearchInput />
        <RecentSearch />
        <BannerHeader />
        <div>
          <HeaderList
            title="Explore Popular Cities"
            description="Discover the best destinations for your next trip"
          />
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <TourItem image="/assets/images/travel.jpg" title="The Song Apartment Vung Tau Sea view - Can" location="Vung Tau, Vietnam" rating={8.4} reviews={44} ratingText="Very good" capacity="2-3 people" originalPrice={6248000} currentPrice={3248000} tags={["tour item"]} />
            <TourItem image="/assets/images/travel.jpg" title="The Song Apartment Vung Tau Sea view - Can" location="Vung Tau, Vietnam" rating={8.4} reviews={44} ratingText="Very good" capacity="2-3 people" originalPrice={6248000} currentPrice={3248000} tags={["tour item"]} />
            <TourItem image="/assets/images/travel.jpg" title="The Song Apartment Vung Tau Sea view - Can" location="Vung Tau, Vietnam" rating={8.4} reviews={44} ratingText="Very good" capacity="2-3 people" originalPrice={6248000} currentPrice={3248000} tags={["tour item"]} />
            <TourItem image="/assets/images/travel.jpg" title="The Song Apartment Vung Tau Sea view - Can" location="Vung Tau, Vietnam" rating={8.4} reviews={44} ratingText="Very good" capacity="2-3 people" originalPrice={6248000} currentPrice={3248000} tags={["tour item"]} />
          </Grid>
        </div>
        <div>
          <HeaderList
            title="Popular Articles"
            description="Travellers searching for Vietnam also booked these"
          />
          <Grid templateColumns="1fr 1fr" gap={5}>
            <GridItem colSpan={1}>
              <ArticleItem.large
                image="/assets/images/travel.jpg"
                title="Introducing the charm of the paradise of the 100 islands in Onomichi City, Hiroshima,..."
                description="Would you like to spend an extraordinary moment at a private resort overlooking the Seto Inland Sea? You can have a comfortable time in a..."
                tags={["#abc", "#abc", "#hanoi"]}
              />
              <Box mt={4} p={5} bg="purple.50" borderRadius="15px">
                <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.900">
                  Tag List
                </Text>
                <HStack gap={2} flexWrap="wrap">
                  {[...Array(16)].map((_, i) => (
                    <Text key={i} fontSize="sm" fontWeight="medium" color="blue.600">
                      #abc
                    </Text>
                  ))}
                </HStack>
              </Box>
            </GridItem>
            <VStack gap={5}>
              <ArticleItem
                image="/assets/images/travel.jpg"
                title="Introducing the charm of the paradise of the 100 islands in Onomichi City, Hiroshima,..."
                description="A new glamping experience to enjoy in the great outdoors. Please spend a special time with a variety..."
                tags={["#abc", "#abc", "#hanoi"]}
                timestamp="2 days ago"
              />
              <ArticleItem
                image="/assets/images/travel.jpg"
                title="Introducing the charm of the paradise of the 100 islands in Onomichi City, Hiroshima,..."
                description="A new glamping experience to enjoy in the great outdoors. Please spend a special time with a variety..."
                tags={["#abc", "#abc", "#hanoi"]}
                timestamp="2 days ago"
              />
              <ArticleItem
                image="/assets/images/travel.jpg"
                title="Introducing the charm of the paradise of the 100 islands in Onomichi City, Hiroshima,..."
                description="A new glamping experience to enjoy in the great outdoors. Please spend a special time with a variety..."
                tags={["#abc", "#abc", "#hanoi"]}
                timestamp="2 days ago"
              />
            </VStack>
          </Grid>
        </div>
      </Container>
      <VStack borderBottomRadius="100px" bg="white" paddingBottom="5rem" position="relative" zIndex={2}>
        <Container maxW="2xl" mx="auto">
          <HeaderList
            title="Trending destinations"
            description="Travellers searching for Vietnam also booked these"
          />
          <TravelList
            destinations={[
              { image: "/assets/images/travel.jpg", title: "HÀ NỘI", toursCount: 14 },
              { image: "/assets/images/travel.jpg", title: "NHA TRANG", toursCount: 14 },
              { image: "/assets/images/travel.jpg", title: "HÀ NỘI", toursCount: 14 },
              { image: "/assets/images/travel.jpg", title: "HÀ NỘI", toursCount: 14 },
              { image: "/assets/images/travel.jpg", title: "HÀ NỘI", toursCount: 14 },
              { image: "/assets/images/travel.jpg", title: "HÀ NỘI", toursCount: 14 },
            ]}
          />
        </Container>
      </VStack>
      <Diagonal />
    </>
  );
}
