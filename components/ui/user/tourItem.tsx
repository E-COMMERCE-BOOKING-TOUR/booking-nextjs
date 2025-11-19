import { Badge, Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";

interface TourItemProps {
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

const TourRating = ({ rating, ratingText, reviews }: { rating: number; ratingText: string; reviews: number }) => (
  <HStack gap={2}>
    <Box bg="main" color="white" px={2} py={1} borderRadius="10px 10px 10px 0" fontWeight="bold" fontSize="lg">
      {parseFloat(rating.toString()).toFixed(1)}
    </Box>
    <VStack align="start" gap={0}>
      <Text fontSize="sm" fontWeight="medium" color="gray.900">{ratingText}</Text>
      <Text fontSize="xs" color="gray.500">{reviews} reviews</Text>
    </VStack>
  </HStack>
);

export default function TourItem({
  image,
  title,
  location,
  rating,
  reviews,
  ratingText,
  capacity,
  originalPrice,
  currentPrice,
  tags,
  slug,
}: TourItemProps) {
  return (
    <VStack
      borderRadius="15px"
      overflow="hidden"
      bg="white"
      shadow="sm"
      align="stretch"
      gap={0}
      w="full"
      maxW="400px"
      cursor="pointer"
      transition="all 0.3s"
      _hover={{ shadow: "md" }}
    >
      <Link href={`/tour/${slug}`}>
        <Box position="relative" w="full" h="220px">
          <Image src={image} alt={title} w="full" h="full" objectFit="cover" />
        </Box>
      </Link>
      <HStack gap={2} my={4} px={4} overflow="hidden">
        {tags.length > 0 && (
          tags.slice(0, 2).map((tag, i) => (
            <Badge key={i} bg="gray.300" color="gray.700" px={3} py={1} borderRadius="full" fontSize="xs">
              {tag}
            </Badge>
          ))
        )}
      </HStack>
      <VStack align="stretch" px={4} pb={4} gap={2}>
        <Link href={`/tour/${slug}`}>
          <Text fontSize="lg" fontWeight="bold" lineHeight="1.3" lineClamp={2} color="gray.900" minH="3em">
            {title}
          </Text>
        </Link>
        <HStack gap={1} color="gray.600">
          <FaMapMarkerAlt size={14} />
          <Text fontSize="sm">{location}</Text>
        </HStack>
        <HStack justify="space-between" align="center">
          <TourRating rating={rating} ratingText={ratingText} reviews={reviews} />
          <Text fontSize="sm" color="gray.700" fontWeight="medium">{capacity}</Text>
        </HStack>
        <HStack justify="space-between" align="baseline" mt={1}>
          {originalPrice && (
            <Text fontSize="sm" color="red.400" textDecoration="line-through">
              VND {originalPrice.toLocaleString()}
            </Text>
          )}
          <Text fontSize="xl" fontWeight="bold" color="gray.900">
            VND {currentPrice.toLocaleString()}
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}
