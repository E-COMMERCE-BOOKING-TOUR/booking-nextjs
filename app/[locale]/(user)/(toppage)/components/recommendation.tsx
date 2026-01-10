"use client";
import { HeaderList } from "@/components/ui/user";
import { Box, Image, SimpleGrid, Text, VStack, Skeleton, Badge, Icon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import tourApi from "@/apis/tour";
import { IUserTourPopular } from "@/apis/tour";
import { getGuestId } from "@/utils/guest";
import { useSession } from "next-auth/react";
import { FaFire } from "react-icons/fa";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Recommendation() {
  const [tours, setTours] = useState<IUserTourPopular[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const t = useTranslations('common');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const guestId = getGuestId();
        const data = await tourApi.recommended(guestId || undefined, (session as { accessToken?: string } | null)?.accessToken);
        setTours(data);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [session]);

  if (!loading && tours.length === 0) return null;

  return (
    <Box my={12}>
      <HeaderList
        title={t('recommendation_title')}
        description={t('recommendation_description')}
      />
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={4}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="320px" borderRadius="30px" />
          ))
        ) : (
          tours.slice(0, 4).map((tour) => (
            <RecommendationCard
              key={tour.id}
              tour={tour}
            />
          ))
        )}
      </SimpleGrid>
    </Box>
  );
}

const RecommendationCard = ({ tour }: { tour: IUserTourPopular }) => {
  const t = useTranslations('common');
  return (
    <Link href={`/tour/${tour.slug}`}>
      <Box
        role="group"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        _hover={{
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        }}
        boxShadow="0 10px 30px rgba(0,0,0,0.05)"
        h="100%"
        display="flex"
        flexDirection="column"
        position="relative"
      >
        {/* Badge "Hot" or "Match" */}
        <Badge
          position="absolute"
          top="15px"
          left="15px"
          zIndex={1}
          bg="rgba(255, 255, 255, 0.9)"
          backdropFilter="xl"
          color="orange.500"
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          fontSize="xs"
          fontWeight="bold"
          boxShadow="sm"
        >
          <Icon as={FaFire} mr={1} /> {t('high_recommendation')}
        </Badge>

        <Box position="relative" h="180px" overflow="hidden">
          <Image
            src={tour.image || "/assets/images/travel.jpg"}
            alt={tour.title}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="transform 0.6s ease"
            _groupHover={{ transform: "scale(1.1)" }}
          />
          {/* Subtle gradient overlay */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="40%"
            bgGradient="linear(to-t, blackAlpha.400, transparent)"
          />
        </Box>

        <VStack p={5} alignItems="flex-start" flex={1} gap={2} justifyContent="space-between">
          <VStack alignItems="flex-start" gap={1} w="100%">
            <Text
              fontSize="md"
              fontWeight="800"
              lineClamp={2}
              lineHeight="tight"
              color="gray.800"
            >
              {tour.title}
            </Text>
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              {tour.location}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Link>
  );
};
