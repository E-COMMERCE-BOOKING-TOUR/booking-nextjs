import { Box, Container, Grid, Text, VStack } from '@chakra-ui/react';
import { SearchInput, TourItem, TravelList, HeaderList } from '@/components/ui/user';
import Header from './components/header';
// import RecentSearch from './components/recentSearch';
import BannerHeader from './components/bannerHeader';
import { Diagonal } from '@/components/layout/user';
import tour from '@/apis/tour';
import division from '@/apis/division';
import { settingsApi } from '@/apis/settings';

import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import { useTranslation } from '@/libs/i18n';

export default async function TopPage() {
  const cookieStore = await cookies();
  const lng = cookieStore.get(cookieName)?.value || fallbackLng;
  const { t } = await useTranslation(lng);

  const [popularTours, trendingDestinations, settings] = await Promise.all([
    tour.popular(8),
    division.trending(6),
    settingsApi.get()
  ]);

  return (
    <>
      <Container maxW="xl" mx="auto">
        <Header />
        <SearchInput lng={lng} />
        {/* <RecentSearch /> */}
        <BannerHeader
          banners_square={settings?.banners_square}
          banners_rectangle={settings?.banners_rectangle}
        />
        <div>
          <HeaderList
            title={t('popular_cities_title', { defaultValue: 'Explore Popular Cities' })}
            description={t('popular_cities_description', { defaultValue: 'Discover the best destinations for your next trip' })}
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
                  currencySymbol={tourItem.currencySymbol}
                  currencyCode={tourItem.currencyCode}
                  lng={lng}
                />
              ))
            ) : (
              <Text gridColumn="1 / -1" textAlign="center" py={8} color="gray.500">
                {t('no_popular_tours', { defaultValue: 'No popular tours available at the moment' })}
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
      <VStack backgroundColor="white" position="relative" zIndex={2} overflow="visible" pb={20}>
        <Container maxW="xl" mx="auto">
          <HeaderList
            title={t('trending_destinations_title', { defaultValue: 'Trending destinations' })}
            description={t('trending_destinations_description', { defaultValue: 'Travellers searching for Vietnam also booked these' })}
          />
          {Array.isArray(trendingDestinations) && trendingDestinations.length > 0 ? (
            <TravelList destinations={trendingDestinations} lng={lng} />
          ) : (
            <Text textAlign="center" py={8} color="gray.500">
              {t('no_trending_destinations', { defaultValue: 'No trending destinations available at the moment' })}
            </Text>
          )}
        </Container>
      </VStack>
      <Box position="absolute" borderBottomRightRadius={20} borderBottomLeftRadius={20} zIndex={11} left={0} right={0} bg="linear-gradient(180deg, rgb(255 255 255) 0%, rgba(0, 0, 0, 0) 100%)" h="100px" />
      <Diagonal divisions={trendingDestinations} />
    </>
  );
}
