import { Container, Grid, Text, VStack } from '@chakra-ui/react';
import { SearchInput, TourItem, TravelList, HeaderList } from '@/components/ui/user';
import Header from './components/header';
// import RecentSearch from './components/recentSearch';
import BannerHeader from './components/bannerHeader';
import { Diagonal } from '@/components/layout/user';
import tour from '@/apis/tour';
import division from '@/apis/division';

export default async function TopPage() {
  const popularTours = await tour.popular(8);
  // const popularArticles = await article.popular(4);
  const trendingDestinations = await division.trending(6);

  return (
    <>
      <Container maxW="xl" mx="auto">
        <Header />
        <SearchInput />
        {/* <RecentSearch /> */}
        <BannerHeader />
        <div>
          <HeaderList
            title="Explore Popular Cities"
            description="Discover the best destinations for your next trip"
          />
          <Grid templateColumns={{ sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} paddingBottom="1rem">
            {Array.isArray(popularTours) && popularTours.length > 0 ? (
              popularTours.map((tourItem) => (
                <TourItem
                  key={tourItem.id}
                  image={tourItem.image}
                  title={tourItem.title}
                  location={tourItem.location}
                  rating={tourItem.rating}
                  reviews={tourItem.reviews}
                  ratingText={tourItem.ratingText}
                  capacity={tourItem.capacity}
                  originalPrice={tourItem.originalPrice}
                  currentPrice={tourItem.currentPrice}
                  tags={tourItem.tags}
                  slug={tourItem.slug}
                />
              ))
            ) : (
              <Text gridColumn="1 / -1" textAlign="center" py={8} color="gray.500">
                No popular tours available at the moment
              </Text>
            )}
          </Grid>
        </div>
        {/* <div>
          <HeaderList
            title="Popular Articles"
            description="Travellers searching for Vietnam also booked these"
          />
          {Array.isArray(popularArticles) && popularArticles.length > 0 ? (
            <Grid templateColumns="1fr 1fr" gap={5}>
              <GridItem colSpan={1}>
                {popularArticles[0] && (
                  <ArticleItem.large
                    image={popularArticles[0].image}
                    title={popularArticles[0].title}
                    description={popularArticles[0].description}
                    tags={popularArticles[0].tags}
                  />
                )}
                <Box mt={4} p={5} bg="purple.50" borderRadius="15px">
                  <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.900">
                    Popular Tags
                  </Text>
                  <HStack gap={2} flexWrap="wrap">
                    {popularArticles.flatMap(a => a.tags).slice(0, 16).map((tag, i) => (
                      <Text key={i} fontSize="sm" fontWeight="medium" color="blue.600">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </Text>
                    ))}
                    {popularArticles.flatMap(a => a.tags).length === 0 && (
                      <Text fontSize="sm" color="gray.500">No tags available</Text>
                    )}
                  </HStack>
                </Box>
              </GridItem>
              <VStack gap={5}>
                {popularArticles.slice(1, 4).map((articleItem) => (
                  <ArticleItem
                    key={articleItem.id}
                    image={articleItem.image}
                    title={articleItem.title}
                    description={articleItem.description}
                    tags={articleItem.tags}
                    timestamp={articleItem.timestamp}
                  />
                ))}
              </VStack>
            </Grid>
          ) : (
            <Text textAlign="center" py={8} color="gray.500">
              No popular articles available at the moment
            </Text>
          )}
        </div> */}
      </Container >
      <VStack borderBottomRadius="calc(100vw / 16)" backgroundColor="white" paddingBottom="calc(100vw / 16)" position="relative" zIndex={2}>
        <Container maxW="xl" mx="auto">
          <HeaderList
            title="Trending destinations"
            description="Travellers searching for Vietnam also booked these"
          />
          {Array.isArray(trendingDestinations) && trendingDestinations.length > 0 ? (
            <TravelList destinations={trendingDestinations} />
          ) : (
            <Text textAlign="center" py={8} color="gray.500">
              No trending destinations available at the moment
            </Text>
          )}
        </Container>
      </VStack>
      <Diagonal />
    </>
  );
}
